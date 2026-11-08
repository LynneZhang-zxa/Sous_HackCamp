import { getRecipe } from "./recipe";
export const SAVED_KEY = "sous.saved-recipes.v1";
export function parseSaved(value: string | null): string[] {
 try { const ids: unknown = JSON.parse(value ?? "[]"); return Array.isArray(ids) ? [...new Set(ids.filter((id): id is string => typeof id === "string" && !!getRecipe(id)))] : []; } catch { return []; }
}
export function toggleSaved(ids: string[], id: string): string[] {
 if (!getRecipe(id)) return ids;
 return ids.includes(id) ? ids.filter(value => value !== id) : [...new Set([...ids,id])];
}
