"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cleanVoiceTranscript } from "@/lib/voice-transcript";
import { readyPlaybackMarks, type PlaybackMark } from "@/lib/playback-marks";
import { normalizeAccess, type AccessPreferences } from "@/lib/access-preferences";
import { RECOVERY_KEY, type CookingRecovery } from "@/lib/cooking-recovery";
import type { Recipe } from "@/lib/recipe";
import type { SessionState } from "@/lib/session";

export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "sleeping" | "ended" | "error" | "disconnected" | "screen";
export type MicrophoneInfo = {level:number;framesSent:number;device:string;contextState:string;trackMuted:boolean;lastFrameAt:number};
export type Line = { id: number; role: "cook" | "sous"; text: string; at: number };

type StartResponse = {
  sessionId: string;
  secret: string;
  wsUrl: string;
  subprotocol: string;
  startCall: Record<string, unknown>;
  state: SessionState;
  recipe: Recipe;
  warnings: string[];
  error?: string;
  guidance?: {spoken:string};
};

type Frame = Record<string, unknown> & { type?: string };

const POLL_MS = 1000;
const PING_MS = 15000;

/** Pull text and speaker out of a transcript-like frame, whatever its exact shape. */
function parseUtterance(f: Frame): { role: "cook" | "sous"; text: string; final: boolean } | null {
  const text = [f.text, f.transcript, f.content, f.message, f.line].find((v) => typeof v === "string" && v.trim()) as string | undefined;
  if (!text) return null;
  const who = String(f.role ?? f.speaker ?? f.from ?? f.source ?? f.participant ?? "").toLowerCase();
  const role: "cook" | "sous" = /user|caller|human|you|customer/.test(who) ? "cook" : /agent|assistant|ai|bot|model/.test(who) ? "sous" : f.type === "transcript" ? "cook" : "sous";
  const finalRaw = f.final ?? f.is_final ?? f.isFinal ?? f.completed;
  const cleaned=cleanVoiceTranscript(text);
  if(!cleaned)return null;
  return { role, text: cleaned, final: finalRaw === undefined ? true : Boolean(finalRaw) };
}

export function useVoiceCall() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [microphone,setMicrophone]=useState<MicrophoneInfo>({level:0,framesSent:0,device:"",contextState:"inactive",trackMuted:false,lastFrameAt:0});
  const [inputDevices,setInputDevices]=useState<MediaDeviceInfo[]>([]);
  const [micMuted,setMicMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [state, setState] = useState<SessionState | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [announcement,setAnnouncement] = useState("");
  const [callId, setCallId] = useState<string | null>(null);

  const r = useRef({
    ws: null as WebSocket | null,
    captureCtx: null as AudioContext | null,
    captureNodes: [] as AudioNode[],
    callReady: false,
    capturing: false,
    sentFrames: 0,
    lastMeterAt: 0,
    playCtx: null as AudioContext | null,
    stream: null as MediaStream | null,
    muted: false,
    base: "listening" as "listening" | "sleeping",
    playing: new Set<AudioBufferSourceNode>(),
    heldMarks: [] as PlaybackMark<AudioBufferSourceNode,Frame>[],
    playhead: 0,
    sessionId: "",
    secret: "",
    silence: new ArrayBuffer(640),
    pingTimer: 0 as ReturnType<typeof setInterval> | 0,
    pollTimer: 0 as ReturnType<typeof setInterval> | 0,
    fired: new Set<string>(),
    lastSleepAt: 0,
    lineId: 0,
    partialId: null as number | null,
    closed: false,
    starting: false,
    generation: 0,
    preferences: normalizeAccess(null),
    connectTimer: 0 as ReturnType<typeof setTimeout> | 0,
  });

  const connectMicrophone=useCallback(async(deviceId?:string)=>{
    const ref=r.current;if(ref.capturing)throw new Error("The microphone is still connecting. Try again in a moment.");ref.capturing=true;
    const generation=ref.generation;
    let stream:MediaStream|null=null;let ctx:AudioContext|null=null;
    try{
      stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true,...(deviceId ? {deviceId:{exact:deviceId}}:{})}});
      if(ref.closed || generation!==ref.generation){stream.getTracks().forEach(t=>t.stop());return;}
      try{ctx=new AudioContext({sampleRate:16000});}catch{ctx=new AudioContext();}
      await ctx.audioWorklet.addModule("/pcm-worklet.js");
      const source=ctx.createMediaStreamSource(stream),node=new AudioWorkletNode(ctx,"pcm-worklet"),sink=ctx.createGain();
      sink.gain.value=0;source.connect(node);node.connect(sink);sink.connect(ctx.destination);
      await ctx.resume();
      if(ref.closed || generation!==ref.generation){stream.getTracks().forEach(t=>t.stop());await ctx.close();return;}
      const oldStream=ref.stream,oldContext=ref.captureCtx;
      ref.stream=stream;ref.captureCtx=ctx;ref.captureNodes=[source,node,sink];
      oldStream?.getTracks().forEach(t=>t.stop());void oldContext?.close().catch(()=>{});
      const track=stream.getAudioTracks()[0];
      if(!track)throw new Error("No microphone audio track is available.");
      setMicrophone({level:0,framesSent:ref.sentFrames,device:track.label || "Default microphone",contextState:ctx.state,trackMuted:track.muted,lastFrameAt:0});
      node.port.onmessage=(ev:MessageEvent<ArrayBuffer>)=>{
        if(ref.stream!==stream || ref.closed)return;
        const pcm=new Int16Array(ev.data);let sum=0;for(const n of pcm)sum+=(n/32768)**2;
        const ws=ref.ws;
        // The provider requires start_call, then call_started, before microphone audio.
        if(ref.callReady && ws?.readyState===WebSocket.OPEN){ws.send(ref.muted ? ref.silence : ev.data);ref.sentFrames++;}
        const now=Date.now();if(now-ref.lastMeterAt>=200){ref.lastMeterAt=now;setMicrophone({level:Math.min(1,Math.sqrt(sum/Math.max(pcm.length,1))*8),framesSent:ref.sentFrames,device:track.label || "Default microphone",contextState:ctx!.state,trackMuted:track.muted,lastFrameAt:now});}
      };
      node.onprocessorerror=()=>setError("Microphone audio processing stopped. Choose Reconnect microphone.");
      track.onended=()=>{if(ref.stream===stream && !ref.closed)setError("The selected microphone stopped. Choose another input or reconnect the microphone.");};
      try{setInputDevices((await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="audioinput"));}catch{setInputDevices([]);}
    }catch(error){
      if(stream!==ref.stream){stream?.getTracks().forEach(t=>t.stop());void ctx?.close().catch(()=>{});}
      const e=error as Error;
      const message=e.name==="NotAllowedError" ? "Microphone permission is blocked. Allow microphone access for localhost in Chrome and macOS Privacy & Security, then reconnect." : e.name==="NotFoundError" ? "No microphone was found. Connect an input device and try again." : e.name==="NotReadableError" ? "The microphone could not be opened. Check whether another application or the system is blocking it." : e.message;
      throw new Error(message);
    }finally{ref.capturing=false;}
  },[]);
  const reconnectMicrophone=useCallback(async(deviceId?:string)=>{
    try{await connectMicrophone(deviceId);await r.current.playCtx?.resume();setError(null);}catch(e){setError((e as Error).message);}
  },[connectMicrophone]);

  const addLine = useCallback((role: "cook" | "sous", text: string, final: boolean) => {
    setLines((prev) => {
      const ref = r.current;
      // Revise a partial of the same role in place; otherwise append.
      if (ref.partialId !== null) {
        const idx = prev.findIndex((l) => l.id === ref.partialId);
        if (idx >= 0 && prev[idx].role === role) {
          const next = [...prev];
          next[idx] = { ...next[idx], text, at: Date.now() };
          if (final) ref.partialId = null;
          return next;
        }
      }
      const id = ++ref.lineId;
      ref.partialId = final ? null : id;
      return [...prev.slice(-30), { id, role, text, at: Date.now() }];
    });
  }, []);

  const send = useCallback((obj: Record<string, unknown>) => {
    const ws = r.current.ws;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }, []);

  const sendHeldMarks = useCallback(() => {
    const ref = r.current;
    for(const mark of readyPlaybackMarks(ref.heldMarks,ref.playing))send(mark);
  }, [send]);

  const setBase = useCallback((base: "listening" | "sleeping") => {
    const ref = r.current;
    ref.base = base;
    ref.muted = base === "sleeping";
    setMicMuted(ref.muted);
    if (ref.playing.size === 0) setStatus(base);
  }, []);

  const play = useCallback(
    (frame: Frame) => {
      const ref = r.current;
      const ctx = ref.playCtx;
      if (ref.closed || !ctx || typeof frame.data !== "string") return;
      const bytes = Uint8Array.from(atob(frame.data), (c) => c.charCodeAt(0));
      const pcm = new Int16Array(bytes.buffer, 0, bytes.length >> 1);
      if (!pcm.length) return;
      const rate = Number(frame.sample_rate) || 24000;
      const buf = ctx.createBuffer(1, pcm.length, rate);
      buf.getChannelData(0).set(Float32Array.from(pcm, (s) => s / 32768));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      if (ref.playhead <= ctx.currentTime) ref.playhead = ctx.currentTime + 0.18;
      src.start(ref.playhead);
      ref.playhead += buf.duration;
      ref.playing.add(src);
      setStatus("speaking");
      src.onended = () => {
        ref.playing.delete(src);
        if(ref.closed || ref.playCtx!==ctx)return;
        sendHeldMarks();
        if(ref.playing.size===0)setStatus(ref.base);
      };
    },
    [sendHeldMarks]
  );

  const stopPlayback = useCallback(() => {
    const ref = r.current;
    for (const s of ref.playing) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    ref.playing.clear();
    ref.playhead = 0;
    sendHeldMarks();
    if(ref.ws && !ref.closed)setStatus(ref.base);
  }, [sendHeldMarks]);

  const refresh = useCallback(async () => {
    const ref = r.current;
    if (!ref.sessionId) return;
    try {
      const res = await fetch(`/api/session/${ref.sessionId}`, { cache: "no-store" });
      if (!res.ok) {
        if(res.status===404){setError("This cooking session is no longer available. Start a new session; old timers cannot be recovered.");setStatus("error");ref.sessionId="";}
        return;
      }
      const s = (await res.json()) as SessionState;
      setState(s);
      if (s.voiceCommand && s.voiceCommand.at > ref.lastSleepAt) {
        ref.lastSleepAt = s.voiceCommand.at;
        setBase("sleeping");
      }
    } catch {
      /* transient */
    }
  }, [setBase]);

  /** Apply a tool from the screen (manual controls, timer firing). */
  const act = useCallback(
    async (tool: string, args: Record<string, unknown> = {}, opts: { notifyAgent?: boolean; speak?: boolean } = {}) => {
      const ref = r.current;
      if (!ref.sessionId) return null;
      try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Sous-Session": ref.sessionId, "X-Sous-Secret": ref.secret },
        body: JSON.stringify({ tool, arguments: args, call: { id: callId ?? undefined } }),
      });
      const result = (await res.json().catch(() => ({}))) as { spoken?: string; stepNumber?: number; title?: string; error?: string; accessPreferences?: AccessPreferences };
      if(!res.ok)throw new Error(result.error ?? "The requested change was not confirmed. Try again.");
      if(result.accessPreferences)ref.preferences=normalizeAccess(result.accessPreferences);
      setError(null);
      setAnnouncement(result.spoken ?? "");
      await refresh();
      if (opts.notifyAgent && result.spoken) {
        send({
          type: "call_event",
          name: "step.changed",
          payload: { step: result.stepNumber ?? null, title: result.title ?? "", confirmedInstruction:result.spoken },
          hint: "The screen action is already confirmed. Read the confirmed instruction if speaking is requested. Do not advance or repeat the tool action.",
          speak: opts.speak ?? ref.preferences.voiceFirst,
          priority: "normal",
        });
      }
      return result;
      } catch(e){setError((e as Error).message);setAnnouncement("The requested change could not be confirmed. Check the displayed progress or reconnect before retrying.");return null;}
    },
    [callId, refresh, send]
  );

  const cleanup = useCallback(() => {
    const ref = r.current;
    ref.closed = true;
    ref.callReady=false;
    ref.captureNodes=[];
    ref.heldMarks=[];ref.playhead=0;
    if(ref.connectTimer)clearTimeout(ref.connectTimer);ref.connectTimer=0;
    if (ref.pingTimer) clearInterval(ref.pingTimer);
    if (ref.pollTimer) clearInterval(ref.pollTimer);
    ref.pingTimer = 0;
    ref.pollTimer = 0;
    ref.stream?.getTracks().forEach((t) => t.stop());
    ref.stream = null;
    ref.captureCtx?.close().catch(() => {});
    ref.playCtx?.close().catch(() => {});
    ref.captureCtx = null;
    ref.playCtx = null;
    for (const s of ref.playing) {
      try {
        s.stop();
      } catch {
        /* noop */
      }
    }
    ref.playing.clear();
    try{ref.ws?.close();}catch{/* already closed */}
    ref.ws = null;
  }, []);

  const stop = useCallback(() => {
    const ref = r.current;
    ref.generation++;
    ref.starting=false;
    try{sessionStorage.removeItem(RECOVERY_KEY);}catch{/* optional recovery storage */}
    send({ type: "end_call" });
    try {
      ref.ws?.close();
    } catch {
      /* noop */
    }
    cleanup();
    setStatus("ended");
  }, [cleanup, send]);

  const handleFrame = useCallback(
    (f: Frame) => {
      const ref = r.current;
      switch (f.type) {
        case "call_started":
          ref.callReady=true;
          if(ref.connectTimer)clearTimeout(ref.connectTimer);ref.connectTimer=0;
          setCallId(String(f.call_id ?? ""));
          setStatus(ref.base);
          break;
        case "audio":
          play(f);
          break;
        case "mark":
          ref.heldMarks.push({frame:f,pending:new Set(ref.playing)});
          sendHeldMarks();
          break;
        case "clear_audio":
          stopPlayback();
          break;
        case "transcript":
        case "conversation_message": {
          const u = parseUtterance(f);
          if (u) addLine(u.role, u.text, u.final);
          if (u?.role === "sous" && u.final) void refresh();
          break;
        }
        case "event_status":
          if (process.env.NODE_ENV !== "production") console.debug("[alebex] event_status", f);
          break;
        case "pong":
          break;
        case "call_ended":
          cleanup();
          setStatus("ended");
          break;
        case "error": {
          const msg = `${f.code ?? "error"}: ${f.message ?? ""}`;
          console.error("[alebex]", msg);
          setError(msg);
          if(!["already_started","message_too_large","bad_message"].includes(String(f.code))){cleanup();setStatus("error");}
          break;
        }
        default:
          if (process.env.NODE_ENV !== "production") console.debug("[alebex] frame", f);
      }
    },
    [addLine, cleanup, play, refresh, sendHeldMarks, stopPlayback]
  );

  const start = useCallback(
    async (recipeId?: string, options?: {preferences?: AccessPreferences;resume?: CookingRecovery;resumeCurrent?: boolean;screenOnly?: boolean}) => {
      const ref = r.current;
      if(ref.starting)return;
      cleanup();
      ref.starting=true;
      const generation=++ref.generation;
      const screenOnly=options?.screenOnly ?? false;
      setError(null);
      setLines([]);
      setStatus("connecting");
      try {
        const recovery=options?.resume ?? (options?.resumeCurrent && ref.sessionId ? {sessionId:ref.sessionId,secret:ref.secret}:null);
        if(options?.resumeCurrent && !recovery)throw new Error("Recovery credentials are unavailable. Start a new session explicitly; previous progress has not been restored.");
        // 1. Ask the server for a session, a socket token and the start_call frame.
        const res = await fetch(screenOnly ? "/api/session" : "/api/call/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId, ...(options?.preferences ? {preferences:options.preferences}:{}), ...(recovery ? {resumeSessionId:recovery.sessionId,resumeSecret:recovery.secret}: {}) }),
        });
        const cfg = (await res.json()) as StartResponse;
        if(generation!==ref.generation)return;
        if (!res.ok || cfg.error) throw new Error(cfg.error ?? `start failed (${res.status})`);
        ref.preferences=normalizeAccess(options?.preferences ?? cfg.state.access?.preferences);
        ref.sessionId = cfg.sessionId;
        ref.secret = cfg.secret;
        ref.closed = false;
        ref.base = "listening";
        ref.muted = false;
        setMicMuted(false);
        ref.sentFrames=0;ref.lastMeterAt=0;ref.callReady=false;
        ref.fired.clear();
        ref.lastSleepAt = 0;
        setState(cfg.state);
        setRecipe(cfg.recipe);
        setWarnings(cfg.warnings ?? []);
        try{sessionStorage.setItem(RECOVERY_KEY,JSON.stringify({sessionId:cfg.sessionId,secret:cfg.secret,recipeId:cfg.recipe.id,savedAt:Date.now()}));}catch{setWarnings(previous=>[...previous,"Recovery is unavailable in this browser. Keep this page open to retain progress."]);}
        if(screenOnly){setStatus("screen");setAnnouncement(cfg.guidance?.spoken ?? "On-screen guidance ready. No voice call has been started.");return;}

        // Microphone capture is independent of guidance pause, and is gated by call_started.
        const playCtx = new AudioContext({ sampleRate: 24000 });
        ref.playCtx = playCtx;
        playCtx.onstatechange=()=>{if(!ref.closed && ref.playCtx===playCtx && playCtx.state==="suspended")setError("Audio playback is paused by the browser. Choose Resume audio to continue this call.");};
        await playCtx.resume();
        await connectMicrophone();
        if(generation!==ref.generation)return;

        // 3. Open the call.
        const ws = new WebSocket(cfg.wsUrl, [cfg.subprotocol]);
        ws.binaryType = "arraybuffer";
        if(generation!==ref.generation){ws.close();return;}
        ref.ws = ws;
        ref.connectTimer=setTimeout(()=>{if(ref.ws===ws && !ref.closed){cleanup();setStatus("disconnected");setError("The voice connection timed out. Your confirmed progress is kept. Resume or use on-screen guidance.");}},20000);
        ws.onopen = () => {
          ws.send(JSON.stringify(cfg.startCall));
          ref.pingTimer = setInterval(() => send({ type: "ping" }), PING_MS);

        };
        ws.onmessage = (ev) => {
          if(ref.ws!==ws || ref.closed || typeof ev.data !== "string")return;
          try {
            handleFrame(JSON.parse(ev.data) as Frame);
          } catch {
            /* ignore malformed */
          }
        };
        ws.onerror = () => setError("The voice connection hit an error.");
        ws.onclose = (ev) => {
          if (ref.closed) return;
          cleanup();
          setStatus("disconnected");
          setError(`Voice disconnected (${ev.code}). Your confirmed progress is kept. Resume the session or continue with on-screen controls.`);
        };
      } catch (e) {
        if(generation!==ref.generation)return;
        cleanup();
        setError((e as Error).message);
        setStatus("error");
      } finally {if(generation===ref.generation)ref.starting=false;}
    },
    [cleanup, connectMicrophone, handleFrame, refresh, send]
  );

  const toggleSleep = useCallback(() => {
    const ref = r.current;
    if (!["listening","speaking","sleeping"].includes(status))return;
    setBase(ref.base === "sleeping" ? "listening" : "sleeping");
  }, [setBase, status]);

  const resumeAudio=useCallback(async()=>{
    try{await r.current.playCtx?.resume();await r.current.captureCtx?.resume();setError(null);}catch{setError("Audio could not resume. Check this site's sound permissions, then try Resume audio again.");}
  },[]);

  // Session polling survives voice disconnection; timers do not depend on the microphone.
  useEffect(()=>{if(!state?.id)return;const timer=setInterval(()=>void refresh(),POLL_MS);return()=>clearInterval(timer);},[state?.id,refresh]);

  // Fire timers from the browser clock: chime, tell the agent, mark it fired.
  useEffect(() => {
    if (!state) return;
    const ref = r.current;
    const now = Date.now();
    for (const t of state.timers) {
      if (t.status !== "running" || t.endsAt > now || ref.fired.has(t.id)) continue;
      ref.fired.add(t.id);
      chime(ref.playCtx);
      setAnnouncement(`The ${t.label} timer is done. A timer does not confirm safe doneness.`);
      send({
        type: "call_event",
        name: "timer.done",
        payload: { timer: t.label },
        hint: `Tell the cook their ${t.label} timer is done. Do not advance or resume paused guidance. Timer completion does not verify safe doneness.`,
        speak: true,
        priority: "interrupt",
        idempotencyKey: `timer-${t.id}`,
      });
      void act("manage_timer", { action: "fired", timer_id: t.id });
    }
  }, [state, send, act]);

  useEffect(() => () => {r.current.generation++;cleanup();}, [cleanup]);

  return { status, micMuted, microphone, inputDevices, reconnectMicrophone, resumeAudio, error, lines, state, recipe, warnings, callId, announcement, start, stop, toggleSleep, stopPlayback, act, refresh };
}

function chime(ctx: AudioContext | null) {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  [880, 1174.66, 1318.51].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0 + i * 0.18);
    g.gain.linearRampToValueAtTime(0.25, t0 + i * 0.18 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.18 + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start(t0 + i * 0.18);
    o.stop(t0 + i * 0.18 + 0.55);
  });
}
