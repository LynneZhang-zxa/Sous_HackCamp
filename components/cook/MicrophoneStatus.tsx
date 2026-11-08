"use client";
import {useEffect,useState} from "react";
import type {MicrophoneInfo} from "@/components/voice/useVoiceCall";
export function MicrophoneStatus({info,devices,muted,onReconnect}:{info:MicrophoneInfo;devices:MediaDeviceInfo[];muted:boolean;onReconnect:(deviceId?:string)=>Promise<void>}){
 const [device,setDevice]=useState("");const [busy,setBusy]=useState(false);const [now,setNow]=useState(Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 const stalled=!info.lastFrameAt || now-info.lastFrameAt>3000;
 return <section className="microphone-status" aria-label="Microphone input">
  <label htmlFor="mic-level">Microphone signal</label><meter id="mic-level" min="0" max="1" value={muted ? 0:info.level} aria-label="Microphone signal level" />
  <p>{muted ? "Microphone is muted. Use Unmute microphone below." : stalled || info.trackMuted || info.contextState!=="running" ? "No active audio input. Check permissions or reconnect your microphone." : info.level>.02 ? "Sound detected from your microphone." : "Microphone is active. Speak and watch the signal bar."}</p>
  <p className="text-xs text-muted">{info.device || "Microphone not selected"} · {info.framesSent>0 ? "Audio is being sent to the voice connection." : "No audio has been sent yet."}</p>
  <label htmlFor="microphone-device">Audio input</label><select id="microphone-device" value={device} onChange={e=>setDevice(e.target.value)}><option value="">System default</option>{devices.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label || "Microphone"}</option>)}</select>
  <button type="button" disabled={busy} onClick={async()=>{setBusy(true);try{await onReconnect(device || undefined);}finally{setBusy(false);}}}>{busy ? "Connecting microphone…":"Reconnect microphone"}</button>
  <p className="text-xs text-muted">This reconnects only your microphone; it does not start another voice call.</p>
 </section>;
}
