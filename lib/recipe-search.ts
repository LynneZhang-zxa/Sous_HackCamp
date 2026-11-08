import type { Recipe } from "./recipe";
export type RecipeQuery = { q?: string; cuisine?: string; maxMinutes?: string; tag?: string; sort?: string };
export function searchRecipes(recipes: readonly Recipe[], query: RecipeQuery): Recipe[] {
 const terms = (query.q ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
 const max = Number(query.maxMinutes);
 return recipes.filter(r => {
  const text = [r.title, r.cuisine, ...r.tags, ...r.ingredients.map(i => i.name)].join(" ").toLowerCase();
  return terms.every(t => text.includes(t)) && (!query.cuisine || r.cuisine.toLowerCase() === query.cuisine.toLowerCase() || r.cuisine.toLowerCase().split(/[- ]/).includes(query.cuisine.toLowerCase())) && (!query.tag || r.tags.includes(query.tag)) && (!Number.isFinite(max) || max <= 0 || r.totalMinutes <= max);
 }).sort((a,b) => {
  const time = query.sort === "shortest" ? a.totalMinutes-b.totalMinutes : query.sort === "longest" ? b.totalMinutes-a.totalMinutes : 0;
  return time || a.title.localeCompare(b.title, "en") || a.id.localeCompare(b.id, "en");
 });
}
