"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ACCESS_KEY, DEFAULT_ACCESS, normalizeAccess, parseAccess, persistAccess, type AccessPreferences } from "@/lib/access-preferences";
const AccessContext = createContext<{preferences: AccessPreferences; ready: boolean; storageError: string; change: (next: AccessPreferences) => void}>({preferences: DEFAULT_ACCESS,ready:false,storageError:"",change:()=>{}});
export function AccessProvider({children}: {children: React.ReactNode}) {
 const [preferences,setPreferences] = useState<AccessPreferences>(DEFAULT_ACCESS);
 const [ready,setReady] = useState(false);
 const [storageError,setStorageError] = useState("");
 useEffect(() => {
  const restore = () => { try {setPreferences(parseAccess(localStorage.getItem(ACCESS_KEY)));} catch {setStorageError("Browser storage is unavailable. Changes apply for this visit only.");} setReady(true); };
  restore();
  const update = (e: StorageEvent) => {if(e.key === ACCESS_KEY || e.key === null)restore();};
  window.addEventListener("storage",update);return () => window.removeEventListener("storage",update);
 },[]);
 useEffect(()=>{
  let observed:Element|null=null;
  const resize=new ResizeObserver(()=>updateSpace());
  const updateSpace=()=>{document.documentElement.style.setProperty("--sous-dock-height",`${observed?.getBoundingClientRect().height ?? 0}px`);};
  const findDock=()=>{const dock=document.querySelector(".voice-composer-dock, .cook-controls-dock");if(dock===observed)return;if(observed)resize.unobserve(observed);observed=dock;if(dock)resize.observe(dock);updateSpace();};
  const changes=new MutationObserver(findDock);changes.observe(document.body,{childList:true,subtree:true});findDock();
  return()=>{resize.disconnect();changes.disconnect();document.documentElement.style.removeProperty("--sous-dock-height");};
 },[]);
 useEffect(() => {document.documentElement.dataset.sousContrast = String(preferences.highContrast);document.documentElement.dataset.sousReducedTouch = String(preferences.reducedTouch);},[preferences.highContrast,preferences.reducedTouch]);
 function change(next: AccessPreferences) {const safe=normalizeAccess(next);setPreferences(safe);try {setStorageError(persistAccess(localStorage,safe) ? "" : "Preferences apply now but could not be saved in this browser.");} catch {setStorageError("Preferences apply now but could not be saved in this browser.");}}
 return <AccessContext.Provider value={{preferences,ready,storageError,change}}>{children}</AccessContext.Provider>;
}
export const useAccess = () => useContext(AccessContext);
