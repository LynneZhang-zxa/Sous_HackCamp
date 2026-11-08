import type { Recipe } from "./recipe";

/** Extension point for a future ranker. No personal data is currently collected or applied. */
export type RecommendationContext = {
  savedRecipeIds?: readonly string[];
  availableIngredients?: readonly string[];
  preferences?: readonly string[];
  dietaryRestrictions?: readonly string[];
};

export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dailyRecommendation(catalog: readonly Recipe[], day: string): Recipe | undefined {
  const sorted = [...catalog].sort((a, b) => a.id.localeCompare(b.id));
  let hash = 2166136261;
  for (const char of day) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return sorted[hash % sorted.length];
}

/** Exclude the current recipe rather than retrying random picks, guaranteeing a change. */
export function surpriseRecommendation(catalog: readonly Recipe[], currentId?: string, random = Math.random): Recipe | undefined {
  const choices = catalog.filter(recipe => recipe.id !== currentId);
  if (!choices.length) return catalog[0];
  const value = random();
  const index = Number.isFinite(value) ? Math.max(0, Math.min(choices.length - 1, Math.floor(value * choices.length))) : 0;
  return choices[index];
}
