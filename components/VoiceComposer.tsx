"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export function VoiceComposer() {
 const path=usePathname();const router=useRouter();const [keyboardInset,setKeyboardInset]=useState(0);
 useEffect(()=>{const viewport=window.visualViewport;if(!viewport)return;const resize=()=>setKeyboardInset(Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop));viewport.addEventListener("resize",resize);viewport.addEventListener("scroll",resize);return()=>{viewport.removeEventListener("resize",resize);viewport.removeEventListener("scroll",resize);};},[]);
 if(path==="/cook")return null;
 return <div className="voice-composer-dock" style={{bottom:`calc(${keyboardInset}px + max(12px, env(safe-area-inset-bottom)))`}}>
  <form className="landing-voice-search" aria-label="Quick recipe search and voice cooking" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);router.push(`/recipes?q=${encodeURIComponent(String(data.get("q") ?? "").trim())}`);}}>
   <span className="voice-wave" aria-hidden>{[12,22,32,42,28,18].map((h,i)=><i key={i} style={{height:h}}/>)}</span>
   <label htmlFor="quick-recipe-search" className="sr-only">Quick recipe search</label><input id="quick-recipe-search" name="q" type="search" placeholder="Search a recipe or ingredient…" />
   <button type="submit" className="composer-search-submit">Search</button>
   <Link href="/cook" aria-label="Open voice cooking" className="voice-search-mic"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg></Link>
  </form>
 </div>;
}
