import type { Recipe } from "./recipe";
export type RecipeQuery = { q?: string; cuisine?: string; maxMinutes?: string; tag?: string; sort?: string };
// Group editorial variants without changing the recipe's original cuisine label.
export function cuisineCategory(cuisine: string): string {
 return cuisine.replace(/-inspired$/i, "").replace(/^Italian-American$/i, "Italian");
}
export function recipeCuisines(recipes: readonly Recipe[]): string[] {
 const available = new Set(recipes.map(r => cuisineCategory(r.cuisine)));
 const primary = ["Chinese", "Italian", "Japanese", "Korean", "Indian", "Mexican"];
 return [...primary.filter(c => available.has(c)), ...[...available].filter(c => !primary.includes(c)).sort()];
}
export function matchesCuisine(recipe: Recipe, cuisine?: string): boolean {
 return !cuisine || recipe.cuisine.toLowerCase() === cuisine.toLowerCase() || cuisineCategory(recipe.cuisine).toLowerCase() === cuisine.toLowerCase();
}
export function searchRecipes(recipes: readonly Recipe[], query: RecipeQuery): Recipe[] {
 const terms = (query.q ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
 const max = Number(query.maxMinutes);
 return recipes.filter(r => {
  const text = [r.title, r.cuisine, ...r.tags, ...r.ingredients.map(i => i.name)].join(" ").toLowerCase();
  return terms.every(t => text.includes(t)) && matchesCuisine(r, query.cuisine) && (!query.tag || r.tags.includes(query.tag)) && (!Number.isFinite(max) || max <= 0 || r.totalMinutes <= max);
 }).sort((a,b) => {
  const time = query.sort === "shortest" ? a.totalMinutes-b.totalMinutes : query.sort === "longest" ? b.totalMinutes-a.totalMinutes : 0;
  const photoPriority = query.sort === "photos" ? Number(b.imageKind === "photo") - Number(a.imageKind === "photo") : 0;
  return photoPriority || time || a.title.localeCompare(b.title, "en") || a.id.localeCompare(b.id, "en");
 });
}
