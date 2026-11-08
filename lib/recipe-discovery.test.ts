import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { listRecipes } from "./recipe";
import { cuisineCategory, matchesCuisine, recipeCuisines, searchRecipes } from "./recipe-search";
import { RECIPE_PHOTOS } from "./recipes/image-sources";
const recipes = listRecipes();

describe("shared cuisine discovery", () => {
 it("derives unique real categories and groups editorial variants", () => {
  const categories = recipeCuisines(recipes);
  expect(categories.slice(0, 6)).toEqual(["Chinese", "Italian", "Japanese", "Korean", "Indian", "Mexican"]);
  expect(new Set(categories).size).toBe(categories.length);
  for (const cuisine of categories) expect(searchRecipes(recipes, {cuisine}).length).toBeGreaterThan(0);
  expect(cuisineCategory("North African-inspired")).toBe("North African");
  expect(cuisineCategory("Italian-American")).toBe("Italian");
 });
 it("matches multiword cuisines without cross-matching unrelated African or Asian dishes", () => {
  const north = searchRecipes(recipes, {cuisine:"North African"});
  expect(north.length).toBeGreaterThan(0);
  expect(north.every(r => r.cuisine === "North African-inspired")).toBe(true);
  expect(searchRecipes(recipes, {cuisine:"East Asian"}).every(r => r.cuisine === "East Asian-inspired")).toBe(true);
 });
 it("preserves exact legacy cuisine queries and unknown-category empty states", () => {
  expect(searchRecipes(recipes, {cuisine:"Italian-American"}).every(r => r.cuisine === "Italian-American")).toBe(true);
  expect(searchRecipes(recipes, {cuisine:"unknown"})).toEqual([]);
  for (const r of recipes) expect(matchesCuisine(r, cuisineCategory(r.cuisine))).toBe(true);
 });
 it("can put verified photographs first without changing alphabetical or time sorts", () => {
  const ordered = searchRecipes(recipes, {sort:"photos"});
  const firstPlaceholder = ordered.findIndex(r => r.imageKind === "placeholder");
  expect(firstPlaceholder).toBe(18);
  expect(ordered.slice(0, firstPlaceholder).every(r => r.imageKind === "photo")).toBe(true);
  const alpha = searchRecipes(recipes, {sort:"alphabetical"});
  expect(alpha.map(r => r.title)).toEqual([...alpha].map(r => r.title).sort((a,b)=>a.localeCompare(b,"en")));
 });
 it("combines ingredient search, cuisine, time and tags through one query", () => {
  const r=recipes.find(r => r.id === "beef-broccoli-stir-fry")!;
  expect(searchRecipes(recipes, {cuisine:"Chinese", q:"broccoli", tag:"beef", maxMinutes:String(r.totalMinutes)})).toContain(r);
  expect(searchRecipes(recipes, {cuisine:"Japanese", q:"broccoli", tag:"beef"})).not.toContain(r);
 });
});

describe("verified dish photograph additions", () => {
 it("keeps one distinct JPEG and source record per newly sourced recipe", () => {
  const photos=Object.entries(RECIPE_PHOTOS);
  expect(photos.length).toBe(13);
  expect(new Set(photos.map(([,p])=>p.original)).size).toBe(photos.length);
  for(const [id,photo] of photos){
   const r=recipes.find(r=>r.id===id)!;
   expect(r.image).toBe(photo.image);
   expect(r.imageKind).toBe("photo");
   const file="public"+photo.image;
   expect(existsSync(file)).toBe(true);
   expect(readFileSync(file).subarray(0,2)).toEqual(Buffer.from([255,216]));
   expect(photo.source).toMatch(/^https:\/\/commons.wikimedia.org\//);
   expect(photo.license).toMatch(/^(CC BY|CC0|Public domain)/);
   expect(photo.licenseUrl).toMatch(/^https?:\/\//);
   expect(photo.author.trim()).not.toBe("");
   expect(photo.changes).toContain("crop");
  }
 });
});
