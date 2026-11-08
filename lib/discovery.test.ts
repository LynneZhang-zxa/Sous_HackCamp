import { describe, expect, it } from "vitest";
import { listRecipes } from "./recipe";
import { searchRecipes } from "./recipe-search";
import { parseSaved, toggleSaved } from "./saved-recipes";
const recipes = listRecipes();
describe("recipe discovery", () => {
 it("uses the actual catalog for every cuisine and supports an empty cuisine result", () => {
  for (const cuisine of new Set(recipes.map(r => r.cuisine))) {
   const matches = searchRecipes(recipes,{cuisine});
   for (const recipe of recipes.filter(r=>r.cuisine===cuisine)) expect(matches).toContain(recipe);
   for (const recipe of matches) expect(recipe.cuisine === cuisine || recipe.cuisine.split(/[- ]/).includes(cuisine)).toBe(true);
  }
  for (const cuisine of ["Chinese","Italian","Japanese","Korean","Indian","Mexican"]) {
   expect(searchRecipes(recipes,{cuisine}).length).toBeGreaterThan(0);
  }
  expect(searchRecipes(recipes,{cuisine:"unknown-cuisine"})).toEqual([]);
 });
 it("matches title, cuisine, ingredients and tags with whitespace and case normalization", () => {
  for (const r of recipes) for (const q of [r.title, r.cuisine, r.ingredients[0].name,r.tags[0]]) expect(searchRecipes(recipes,{q:`  ${q.toUpperCase()}  `})).toContain(r);
 });
 it("combines filters and returns no results for an unknown query", () => {
  const r = recipes[0];
  expect(searchRecipes(recipes,{q:r.title,cuisine:r.cuisine,tag:r.tags[0],maxMinutes:String(r.totalMinutes)})).toEqual([r]);
  expect(searchRecipes(recipes,{q:"zzzz-no-such-recipe"})).toEqual([]);
  expect(searchRecipes(recipes,{maxMinutes:"1"})).toEqual([]);
  expect(searchRecipes(recipes,{})).toHaveLength(recipes.length);
 });
 it("sorts deterministically by time", () => {
  for (const sort of ["shortest","longest"]) {
   const result = searchRecipes(recipes,{sort});
   for (let i=1;i<result.length;i++) expect(sort === "shortest" ? result[i].totalMinutes >= result[i-1].totalMinutes : result[i].totalMinutes <= result[i-1].totalMinutes).toBe(true);
   expect(result).toEqual(searchRecipes(recipes,{sort}));
  }
 });
});
describe("saved recipe persistence data", () => {
 for (const recipe of recipes) it("round trips and removes saved recipe " + recipe.id, () => {
  const saved = toggleSaved([], recipe.id);
  expect(parseSaved(JSON.stringify(saved))).toEqual([recipe.id]);
  expect(parseSaved(JSON.stringify([...saved, recipe.id, "missing"]))).toEqual([recipe.id]);
  expect(toggleSaved(saved, recipe.id)).toEqual([]);
 });
 it("preserves the full collection while removing any selected recipe", () => {
  const ids = recipes.reduce((saved, recipe) => toggleSaved(saved, recipe.id), [] as string[]);
  expect(parseSaved(JSON.stringify(ids))).toEqual(recipes.map(recipe => recipe.id));
  for (const recipe of recipes) expect(toggleSaved(ids, recipe.id)).toEqual(ids.filter(id => id !== recipe.id));
 });
 const id = recipes[0].id;
 it("saves, removes, and round trips JSON without duplicate or invalid IDs", () => {
  expect(toggleSaved([],id)).toEqual([id]);
  expect(toggleSaved([id],id)).toEqual([]);
  expect(parseSaved(JSON.stringify([id,id,"missing",null,7]))).toEqual([id]);
  expect(parseSaved(JSON.stringify(toggleSaved([],id)))).toEqual([id]);
  expect(toggleSaved([],"missing")).toEqual([]);
 });
 it("handles malformed and unavailable storage values", () => {
  for (const value of [null,"{","null","{}","42"]) expect(parseSaved(value)).toEqual([]);
 });
});
