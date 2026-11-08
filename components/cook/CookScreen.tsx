"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccess } from "@/components/access/AccessProvider";
import { AccessSettings } from "@/components/access/AccessSettings";
import { accessEnabled, normalizeAccess } from "@/lib/access-preferences";
import { parseRecovery, RECOVERY_KEY, type CookingRecovery } from "@/lib/cooking-recovery";
import { ChefHat } from "@/components/Nav";
import { MicrophoneStatus } from "@/components/cook/MicrophoneStatus";
import { MicButton } from "@/components/cook/MicButton";
import { StepPanel } from "@/components/cook/StepPanel";
import { VoicePanel } from "@/components/cook/VoicePanel";
import { useVoiceCall } from "@/components/voice/useVoiceCall";
import { type Recipe, describeIngredient, nutritionLabel } from "@/lib/recipe";

export function CookScreen({ selectedRecipe }: { selectedRecipe: Recipe }) {
  const voice = useVoiceCall();
  const {preferences,ready,change} = useAccess();
  const [recovery,setRecovery]=useState<CookingRecovery|null>(null);
  const [busy,setBusy]=useState(false);
  const lastPreferences=useRef("");
  const lastServerPreferences=useRef("");
  const pendingPreferences=useRef(0);
  useEffect(()=>{try{setRecovery(parseRecovery(sessionStorage.getItem(RECOVERY_KEY),selectedRecipe.id));}catch{/* recovery is optional */}},[selectedRecipe.id]);
  const active=!!voice.state;
  const live=["listening","speaking","sleeping"].includes(voice.status);
  useEffect(()=>{
   if(!ready || !voice.state)return;
   const local=JSON.stringify(preferences);
   const serverPreferences=normalizeAccess(voice.state.access?.preferences);
   const server=JSON.stringify(serverPreferences);
   if(lastPreferences.current!==local){
    lastPreferences.current=local;
    if(server!==local){pendingPreferences.current++;void voice.act("access_guidance",{action:"preferences",...preferences},{notifyAgent:true}).finally(()=>{pendingPreferences.current--;});}
   }else if(!pendingPreferences.current && lastServerPreferences.current && server!==lastServerPreferences.current && server!==local){
    // Voice-requested preference changes are also reflected in Settings and local persistence.
    lastPreferences.current=server;change(serverPreferences);
   }
   lastServerPreferences.current=server;
  },[preferences,ready,voice.state,voice.act,change]);
  async function begin(screenOnly=false,resume=false){
   let saved=recovery;
   try{saved=parseRecovery(sessionStorage.getItem(RECOVERY_KEY),selectedRecipe.id) ?? saved;}catch{/* optional storage */}
   lastPreferences.current=JSON.stringify(preferences);
   if(!screenOnly && !resume && !accessEnabled(preferences)){await voice.start(selectedRecipe.id);return;}
   await voice.start(selectedRecipe.id,{preferences,...(resume && saved ? {resume:saved}:{}),resumeCurrent:resume,screenOnly});
  }
  async function action(tool:string,args:Record<string,unknown>={},speak=false){
   if(busy)return;setBusy(true);
   try{await voice.act(tool,args,{notifyAgent:true,speak:speak || preferences.voiceFirst});}finally{setBusy(false);}
  }
  function pauseOrResume(){
   if(live)voice.stopPlayback();
   void action("access_guidance",{action:voice.state?.access?.paused ? "resume":"pause"},true);
  }
  // Modified shortcuts work without stealing text entry, browser shortcuts or screen-reader navigation.
  useEffect(()=>{
   if(!preferences.reducedTouch || !active)return;
   const key=(e:KeyboardEvent)=>{if(!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || e.repeat)return;if(document.querySelector("dialog[open]"))return;const target=e.target as HTMLElement;if(target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName))return;
    const command=e.code;if(!["ArrowRight","ArrowLeft","KeyR","KeyP"].includes(command))return;e.preventDefault();
    if(command==="KeyP")pauseOrResume();else if(command==="KeyR")void action("access_guidance",{action:"repeat"},true);else void action(command==="ArrowRight"?"next_step":"previous_step");
   };window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  });
  const recipe = voice.recipe ?? selectedRecipe;
  const inCall = active;

  const onMic = useCallback(() => {
    if (["idle","error","ended","disconnected","screen"].includes(voice.status)) void begin(false,Boolean(voice.state));
    else voice.toggleSleep();
  }, [voice, recipe.id]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur">
        <div className="cook-header-inner mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-forest" aria-label="Back to home">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            <ChefHat className="h-7 w-7" />
            <span className="font-display text-xl">Sous</span>
          </Link>
          <div className="cook-header-meta ml-auto flex items-center gap-3 text-sm text-muted">
            <span className="hidden sm:inline">{recipe.title}</span>
            <AccessSettings />
            <span className="rounded-full bg-paper px-3 py-1 shadow-card">
              {voice.state?.servings ?? recipe.servings} servings · {recipe.totalMinutes} min
            </span>
          </div>
        </div>
      </header>

      <main data-sous-page="/cook" id="main-content" className="cook-main mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {inCall && <div className="cook-session-heading"><p className="discovery-eyebrow">{accessEnabled(voice.state?.access?.preferences ?? preferences) ? "SOUS ACCESS" : "YOUR COOKING SESSION"}</p><h1 className="font-display text-3xl">{recipe.title}</h1></div>}
        {!inCall ? (
          <Intro
            status={voice.status}
            error={voice.error}
            onStart={() => void begin()}
            onScreen={() => void begin(true)}
            recipe={recipe}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <StepPanel
              recipe={recipe}
              state={voice.state!}
              onPrev={() => void action("previous_step")}
              onNext={() => void action("next_step")}
              onJump={(n) => void action("jump_to_step", { step_number: n })}
              busy={busy}
            />
            <VoicePanel
              status={voice.status}
              error={voice.error}
              warnings={voice.warnings}
              lines={voice.lines}
              state={voice.state}
              onMic={onMic}
              onEnd={voice.stop}
              microphonePanel={live ? <MicrophoneStatus info={voice.microphone} devices={voice.inputDevices} muted={voice.micMuted} onReconnect={voice.reconnectMicrophone} /> : undefined}
              onCancelTimer={(label) => void action("manage_timer", { action: "cancel", label })}
            />
          </div>
        )}
        {recovery && !inCall && <section className="access-recovery" aria-label="Saved cooking progress"><h2>Continue your saved session</h2><p>Resume this recipe at its last confirmed action. Timers keep their original end times. Recovery depends on the session still being available.</p><button type="button" disabled={voice.status==="connecting"} onClick={()=>void begin(false,true)}>Resume voice session</button><button type="button" disabled={voice.status==="connecting"} onClick={()=>void begin(true,true)}>Resume on-screen session</button><button type="button" onClick={()=>{try{sessionStorage.removeItem(RECOVERY_KEY);}catch{}setRecovery(null);}}>Dismiss saved session</button></section>}
        {inCall && <>
         <div className="cook-action-announcement" role="status" aria-live={live && preferences.voiceFirst ? "off":"polite"}>{voice.announcement}</div>
         {voice.error && <div className="access-connection-error" role="alert"><p>{voice.error}</p><p>Your last confirmed step stays visible. Timers are separate from the voice connection.</p><button type="button" disabled={voice.status==="connecting"} onClick={()=>void begin(false,true)}>Reconnect voice session</button><button type="button" disabled={voice.status==="connecting"} onClick={()=>void begin(true,true)}>Continue on-screen</button><button type="button" disabled={voice.status==="connecting"} onClick={()=>void begin(true,false)}>Start a new on-screen session</button></div>}
         <GuidanceHelp onAction={(args)=>void action("access_guidance",args,true)} onTimer={(label,seconds)=>void action("manage_timer",{action:"start",label,seconds},true)} state={voice.state!} />
         {preferences.reducedTouch && <p className="mt-5 text-sm text-muted">Keyboard: Alt + Shift + Right / Left for next / previous, R to repeat, P to pause or resume. Standard Tab, Enter and Space also work.</p>}
         <nav className="cook-controls-dock" aria-label="Cooking guidance controls">
          <span className="cook-dock-status" role="status">{voice.state?.access?.paused ? "Guidance paused" : voice.status==="screen" ? "On-screen guidance" : voice.status==="disconnected" ? "Voice disconnected" : voice.status==="connecting" ? "Connecting" : voice.status==="sleeping" ? "Microphone muted" : voice.status==="speaking" ? "Sous speaking" : voice.status==="listening" ? "Listening" : "Voice ended"}</span>
          <button type="button" disabled={busy} onClick={()=>void action("access_guidance",{action:"repeat"},true)}>Repeat instruction</button>
          <button type="button" disabled={busy} onClick={pauseOrResume}>{voice.state?.access?.paused ? "Resume guidance":"Pause guidance"}</button>
          <button type="button" disabled={busy || voice.state?.access?.paused || voice.status==="connecting"} onClick={()=>void action("next_step")}>{voice.state?.access?.preferences.oneAction ? "Next action":"Next step"}</button>
          {live && <button type="button" onClick={()=>void voice.resumeAudio()}>Resume audio</button>}
          {live && <button type="button" onClick={voice.toggleSleep}>{voice.micMuted ? "Unmute microphone":"Mute microphone"}</button>}
          {voice.status==="screen" && <button type="button" onClick={()=>void begin(false,true)}>Start voice from here</button>}
          <button type="button" onClick={voice.stop}>End voice / guidance</button>
         </nav>
        </>}
      </main>
    </div>
  );
}

function Intro({ recipe, status, error, onStart, onScreen }: { recipe: Recipe; status: string; error: string | null; onStart: () => void; onScreen: () => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-forest">{recipe.cuisine} · {recipe.totalMinutes} minutes · {nutritionLabel(recipe)}{recipe.nutrition.status === "estimated" ? " per serving" : ""}</p>
        <h1 className="mt-2 font-display text-5xl leading-[1] sm:text-6xl">{recipe.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/75">{recipe.description}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-paper p-6 shadow-card ring-1 ring-line/60">
            <h2 className="font-display text-2xl">Ingredients</h2>
            <p className="text-xs text-muted">for {recipe.servings} servings</p>
            <ul className="mt-4 space-y-2 text-sm">
              {recipe.ingredients.map((i) => (
                <li key={i.name} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                  <span>{describeIngredient(i, recipe.servings, recipe.servings, "screen")}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-paper p-6 shadow-card ring-1 ring-line/60">
            <h2 className="font-display text-2xl">The {recipe.steps.length} steps</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {recipe.steps.map((s, i) => (
                <li key={s.id} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-semibold text-muted">{i + 1}</span>
                  <span className="font-medium">{s.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="sous-voice-card rounded-3xl bg-paper p-6 text-center shadow-card ring-1 ring-line/60">
          <p className="mb-4 text-sm text-muted">Set your optional SOUS Access preferences using Settings above. Your recipe stays the same.</p>
          <div className="flex justify-center">
            <MicButton status={status === "connecting" ? "connecting" : "idle"} onClick={onStart} />
          </div>
          <p className="mt-4 font-display text-2xl">{status === "connecting" ? "Connecting to Sous" : "Start cooking"}</p>
          <p className="mt-1 text-sm text-muted">
            {status === "connecting" ? "Allow the microphone when asked." : "Sous will greet you, then guide you step by step. Headphones give the cleanest sound."}
          </p>
          <button type="button" className="access-screen-start" disabled={status==="connecting"} onClick={onScreen}>Use on-screen guidance · no voice call</button>
          {error && <p role="alert" className="mt-4 rounded-2xl bg-coral-tint px-4 py-3 text-left text-sm text-coral">{error}</p>}
          <ul className="mt-5 space-y-1.5 text-left text-sm text-ink/75">
            <li>• Say &ldquo;what&apos;s next&rdquo; to move on.</li>
            <li>• Ask anything: amounts, swaps, what to do if something burns.</li>
            <li>• Ask for a timer and it shows up here.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function GuidanceHelp({onAction,onTimer,state}:{onAction:(args:Record<string,unknown>)=>void;onTimer:(label:string,seconds:number)=>void;state:import("@/lib/session").SessionState}) {
 const [timerLabel,setTimerLabel]=useState("Kitchen timer");const [minutes,setMinutes]=useState("1.5");
 const [term,setTerm]=useState("simmer");const [concern,setConcern]=useState("lifting");
 return <details className="guidance-help"><summary>Instruction help & safe adaptations</summary><div className="guidance-help-content">
  <div className="flex flex-wrap gap-3"><button type="button" onClick={()=>onAction({action:"recipe"})}>What am I cooking?</button><button type="button" onClick={()=>onAction({action:"ingredients"})}>Review ingredients</button><button type="button" onClick={()=>onAction({action:"remaining"})}>Remaining steps</button><button type="button" onClick={()=>onAction({action:"timers"})}>Time remaining</button></div>
  <form className="access-timer-form" onSubmit={e=>{e.preventDefault();onTimer(timerLabel,Math.round(Number(minutes)*60));}}><label>Timer label<input value={timerLabel} onChange={e=>setTimerLabel(e.target.value)} maxLength={40} required /></label><label>Timer duration (minutes)<input type="number" min="0.1" max="360" step="0.1" value={minutes} onChange={e=>setMinutes(e.target.value)} required /></label><button type="submit">Start timer</button></form>
  <label>Cooking term<select value={term} onChange={e=>setTerm(e.target.value)}>{["simmer","saute","sear","deglaze","mince","fold"].map(t=><option key={t}>{t}</option>)}</select></label><button type="button" onClick={()=>onAction({action:"explain",term})}>Explain term</button>
  <label>Help with an action<select value={concern} onChange={e=>setConcern(e.target.value)}>{[["lifting","Lifting a heavy pan"],["measuring","Reading measuring marks"],["one_hand","Using one hand"],["hot_water","Draining hot water"],["knife","Using a knife"],["raw_food","Raw food handling"],["doneness","Checking safe doneness"],["smoke","Reported smoke"],["fire","Reported fire"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button type="button" onClick={()=>onAction({action:"help",concern})}>Get safe guidance</button>
  {state.access?.assistance && state.access.assistance.accepted===null && !["smoke","fire"].includes(state.access.assistance.concern) && <div className="flex flex-wrap gap-3"><button type="button" onClick={()=>onAction({action:"accept"})}>Accept suggestion</button><button type="button" onClick={()=>onAction({action:"decline"})}>Decline suggestion</button></div>}
  <p className="text-sm text-muted">Suggestions never change recipe quantities or safety checks. Pausing guidance does not switch off heat or pause a timer. If an action feels unsafe, stop and ask for help.</p>
 </div></details>;
}
