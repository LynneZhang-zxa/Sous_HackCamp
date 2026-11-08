"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RecipeImage } from "./RecipeImage";
import { getRecipe } from "@/lib/recipe";
import { parseSaved, SAVED_KEY, toggleSaved } from "@/lib/saved-recipes";
function useSaved() {
 const [ids,setIds] = useState<string[]>([]);
 const [ready,setReady] = useState(false);
 const [error,setError] = useState("");
 useEffect(() => {
  const refresh = () => { try { setIds(parseSaved(localStorage.getItem(SAVED_KEY))); setError(""); } catch { setError("Browser storage is unavailable. Saved recipes cannot persist."); } setReady(true); };
  refresh(); window.addEventListener("storage",refresh); window.addEventListener("sous-saved",refresh);
  return () => { window.removeEventListener("storage",refresh); window.removeEventListener("sous-saved",refresh); };
 },[]);
 const toggle = (id: string) => { try { const next = toggleSaved(parseSaved(localStorage.getItem(SAVED_KEY)),id); localStorage.setItem(SAVED_KEY,JSON.stringify(next)); setIds(next); setError(""); window.dispatchEvent(new Event("sous-saved")); } catch { setError("Could not save your change. Browser storage is unavailable or full."); } };
 return {ids,ready,error,toggle};
}
export function SaveRecipe({id}: {id:string}) {
 const {ids,ready,error,toggle} = useSaved();
 const title = getRecipe(id)?.title ?? "recipe";
 return <div><button type="button" disabled={!ready} aria-pressed={ids.includes(id)} onClick={() => toggle(id)} className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-forest disabled:opacity-50">{ids.includes(id) ? "Unsave" : "Save"} {title}</button>{error && <p role="status" className="mt-2 text-sm">{error}</p>}</div>;
}
export function SavedRecipes() {
 const {ids,ready,error} = useSaved();
 const [category,setCategory] = useState("Saved");
 return <>
  <p className="mt-4 text-muted">Your saved favorites, together in one place.</p>
  <div className="my-6 flex flex-wrap gap-3" aria-label="Recipe categories">{["Saved","Uploaded","Recently Cooked"].map(c => <button key={c} aria-pressed={category===c} onClick={() => setCategory(c)} className={`rounded-full px-4 py-2 ${category===c ? "bg-forest text-white" : "bg-paper"}`}>{c}</button>)}</div>
  {error && <p role="status">{error}</p>}
  {category !== "Saved" ? <p>{category} recipes are coming soon.</p> : !ready ? <p role="status">Loading saved recipes...</p> : !ids.length ? <p>No saved recipes yet. <Link href="/recipes" className="text-forest underline">Find a recipe to save</Link>.</p> :
   <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ids.map(id => {
    const recipe = getRecipe(id)!;
    return <li key={id} className="overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-line/60">
     <Link href={`/recipes/${id}`} className="block transition hover:-translate-y-0.5">
      <RecipeImage src={recipe.image} title={recipe.title} className="aspect-[4/3] w-full object-cover" />
      <div className="p-5"><p className="text-xs font-semibold text-forest">{recipe.cuisine} · {recipe.totalMinutes} min</p><h2 className="mt-2 font-display text-xl">{recipe.title}</h2></div>
     </Link>
     <div className="px-5 pb-5"><Link href={`/cook?recipeId=${encodeURIComponent(id)}`} className="mb-4 block text-forest underline">Cook by Voice</Link><SaveRecipe id={id}/></div>
    </li>;
   })}</ul>}
  <p className="mt-6 text-sm text-muted">Saved on this browser only.</p>
 </>;
}
