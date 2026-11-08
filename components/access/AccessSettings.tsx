"use client";
import { useRef } from "react";
import { useAccess } from "./AccessProvider";
import { ACCESS_OPTIONS, DEFAULT_ACCESS } from "@/lib/access-preferences";
export function AccessSettings() {
 const dialog = useRef<HTMLDialogElement>(null);
 const {preferences,ready,storageError,change} = useAccess();
 return <>
  <button type="button" className="access-settings-trigger" onClick={() => dialog.current?.showModal()}>Settings <span className="sr-only">· SOUS Access</span></button>
  <dialog ref={dialog} className="access-dialog" aria-labelledby="access-title" onKeyDown={e=>{
   if(e.key!=="Tab")return;
   const items=[...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')].filter(item=>item.getClientRects().length>0);
   const first=items[0],last=items[items.length-1];
   if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
   else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
  }} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}>
   <div className="access-dialog-heading"><div><p className="discovery-eyebrow">YOUR KITCHEN, YOUR PACE</p><h2 id="access-title">SOUS Access</h2></div><button type="button" onClick={()=>dialog.current?.close()} aria-label="Close accessibility settings">✕</button></div>
   <p className="access-intro">Choose how Sous guides you. Every option is optional. No medical information is needed. Changes apply without resetting your cooking progress.</p>
   <fieldset disabled={!ready}><legend className="sr-only">Cooking and display preferences</legend>{ACCESS_OPTIONS.map(option=><label key={option.key} className="access-option"><input type="checkbox" checked={preferences[option.key]} onChange={e=>change({...preferences,[option.key]:e.target.checked})}/><span><strong>{option.label}</strong><span>{option.description}</span></span></label>)}</fieldset>
   {storageError && <p role="status" className="access-storage-error">{storageError}</p>}
   <div className="access-dialog-footer"><button type="button" onClick={()=>change({...DEFAULT_ACCESS})}>Reset preferences</button><button type="button" onClick={()=>dialog.current?.close()}>Done</button></div>
  </dialog>
 </>;
}
