"use client";
import { useEffect, useState } from "react";
import { CuisineChips } from "./CuisineChips";
import { RecipeCard } from "./RecipeCard";
import { cuisineCategory, recipeCuisines, searchRecipes, type RecipeQuery } from "@/lib/recipe-search";
import type { Recipe } from "@/lib/recipe";
const KEYS = ["q", "cuisine", "maxMinutes", "tag", "sort"] as const;
function canonicalQuery(query: RecipeQuery): RecipeQuery {
 return { ...query, cuisine: query.cuisine ? cuisineCategory(query.cuisine) : undefined };
}
function fromLocation(): RecipeQuery {
 const params = new URLSearchParams(window.location.search);
 return canonicalQuery(Object.fromEntries(KEYS.flatMap(k => params.get(k) ? [[k, params.get(k)!]] : [])));
}
export function RecipeDiscovery({ recipes, initialQuery }: { recipes: readonly Recipe[]; initialQuery: RecipeQuery }) {
 const [query, setQuery] = useState<RecipeQuery>(() => canonicalQuery(initialQuery));
 // A Link to the same route can deliver new server props without remounting.
 useEffect(() => {
  const next = canonicalQuery(initialQuery);
  setQuery(next);
  if (initialQuery.cuisine && next.cuisine !== initialQuery.cuisine) {
   const params = new URLSearchParams(window.location.search);
   params.set("cuisine", next.cuisine!);
   window.history.replaceState(null, "", `/recipes?${params}`);
  }
 }, [initialQuery]);
 useEffect(() => {
  const restore = () => setQuery(fromLocation());
  window.addEventListener("popstate", restore);
  return () => window.removeEventListener("popstate", restore);
 }, []);
 function update(changes: RecipeQuery, replace = false) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  for (const key of KEYS) if (next[key]) params.set(key, next[key]!);
  const url = `/recipes${params.size ? `?${params}` : ""}`;
  if (replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
  setQuery(next);
 }
 function reset() { window.history.pushState(null, "", "/recipes"); setQuery({}); }
 const results = searchRecipes(recipes, { ...query, sort: query.sort ?? "photos" });
 const categories = recipeCuisines(recipes);
 const selected = query.cuisine ? cuisineCategory(query.cuisine) : "";
 const tags = [...new Set(recipes.flatMap(r => r.tags))].sort();
 return <>
  <div className="discovery-intro"><p className="discovery-eyebrow">THE SOUS RECIPE KITCHEN</p><h1>All recipes</h1><p>Find something you’ll love to cook. Explore {recipes.length} recipes, one delicious idea at a time.</p></div>
  <form id="recipe-search" className="discovery-search" onSubmit={e => e.preventDefault()} role="search">
   <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg>
   <label className="sr-only" htmlFor="discovery-query">Search recipes</label>
   <input id="discovery-query" name="q" value={query.q ?? ""} onChange={e => update({ q: e.target.value }, true)} placeholder="Search a recipe, ingredient or craving…" />
   {query.q && <button type="button" onClick={() => update({q: ""})} aria-label="Clear search">✕</button>}
  </form>
  <CuisineChips categories={categories} selected={selected} onSelect={cuisine => update({cuisine})} />
  <div className="discovery-toolbar">
   <div className="discovery-filter-fields">
    <label>Time<select aria-label="Maximum cooking time" value={query.maxMinutes ?? ""} onChange={e => update({maxMinutes:e.target.value})}><option value="">Any time</option>{[15,30,45,60].map(n => <option key={n} value={n}>Up to {n} min</option>)}{query.maxMinutes && !["15","30","45","60"].includes(query.maxMinutes) && <option value={query.maxMinutes}>Up to {query.maxMinutes} min</option>}</select></label>
    <label>Tag<select value={query.tag ?? ""} onChange={e => update({tag:e.target.value})}><option value="">All tags</option>{tags.map(t => <option key={t}>{t}</option>)}</select></label>
   </div>
   <label>Sort by<select value={query.sort ?? "photos"} onChange={e => update({sort:e.target.value})}><option value="photos">With photos first</option><option value="alphabetical">Alphabetical</option><option value="shortest">Shortest time</option><option value="longest">Longest time</option></select></label>
   <button type="button" className="discovery-reset" onClick={reset}>Reset Filters</button>
  </div>
  <div className="discovery-results-heading"><p role="status" aria-live="polite">{results.length} recipes found{selected ? ` · ${selected}` : ""}</p><span>Something good starts here.</span></div>
  {!results.length ? <div className="discovery-empty" role="status"><span aria-hidden>⌕</span><h2>{recipes.length ? "No matching recipes" : "No recipes yet"}</h2><p>Try another ingredient or cuisine, or clear your filters.</p><button type="button" onClick={reset}>Reset Filters</button></div> : <ul className="discovery-grid" aria-label="All recipes">{results.map(recipe => <li key={recipe.id}><RecipeCard recipe={recipe} /></li>)}</ul>}
 </>;
}
