"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
export function RouteAccessibility() {
 const pathname=usePathname();const previous=useRef(pathname);
 useEffect(()=>{
  const main=document.querySelector("main");if(main){main.id="main-content";main.tabIndex=-1;}
  if(previous.current===pathname)return;
  previous.current=pathname;
  const initialFocus=document.activeElement;
  let done=false;
  const focus=()=>{
   if(done)return;
   const current=document.querySelector("main");
   if(!current || (current.dataset.sousPage && current.dataset.sousPage!==pathname))return;
   const target=current.querySelector("h1");if(!(target instanceof HTMLElement))return;
   // Wait for the destination and Next's own scroll handling, without taking focus back from the user.
   if(document.activeElement===document.body || document.activeElement===initialFocus || !document.activeElement?.isConnected){current.id="main-content";current.tabIndex=-1;target.tabIndex=-1;target.focus({preventScroll:true});}
   done=true;observer.disconnect();
  };
  const observer=new MutationObserver(()=>{if(!done)window.setTimeout(focus,60);});observer.observe(document.body,{childList:true,subtree:true});
  const timer=window.setTimeout(focus,100);const expiry=window.setTimeout(()=>observer.disconnect(),3000);
  return()=>{done=true;observer.disconnect();clearTimeout(timer);clearTimeout(expiry);};
 },[pathname]);
 return <a className="skip-link" href="#main-content">Skip to main content</a>;
}
