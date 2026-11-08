"use client";
import Link from "next/link";
import { useRef } from "react";
export function ToolsMenu() {
 const menu=useRef<HTMLDetailsElement>(null);
 return <details ref={menu} className="relative" onKeyDown={e=>{if(e.key==="Escape" && menu.current?.open){e.preventDefault();menu.current.open=false;menu.current.querySelector("summary")?.focus();}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))e.currentTarget.open=false;}}>
  <summary className="cursor-pointer rounded-full px-3 py-2">Tools</summary>
  <div className="absolute left-0 top-full z-50 w-60 rounded-2xl bg-paper p-4 shadow-float">
   <Link href="/tools#ingredients">What Can I Cook?</Link><Link href="/tools#upload">Upload Recipe</Link><Link href="/tools#history">History</Link>
  </div>
 </details>;
}
