import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import * as recipeData from "./recipe";
import { CREAMY_GARLIC_CHICKEN, describeIngredient, listRecipes } from "./recipe";
import Home from "../app/page";
import { Nav } from "../components/Nav";
import RecipesPage from "../app/recipes/page";
import RecipePage, { generateStaticParams } from "../app/recipes/[id]/page";
import CookPage from "../app/cook/page";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); } }));
vi.mock("@/components/cook/CookScreen", () => ({ CookScreen: () => null }));
const recipes = listRecipes();
const htmlText = (text: string) => renderToStaticMarkup(createElement("span", null, text)).replace(/^<span>|<\/span>$/g, "");

describe("recipe browsing and selection", () => {
  it("lists every recipe with the correct detail link and existing image", () => {
    const html = renderToStaticMarkup(createElement(RecipesPage));
    expect((html.match(/href="\/recipes\//g) ?? []).length).toBe(20);
    for (const recipe of recipes) {
      expect(html).toContain('href="/recipes/' + recipe.id + '"');
      expect(html).toContain('src="' + recipe.image + '"');
      expect(html).toContain(htmlText(recipe.title));
    }
    expect(generateStaticParams()).toEqual(recipes.map(({ id }) => ({ id })));
  });
  it("connects homepage cards and navigation while retaining direct cooking actions", () => {
    const home = renderToStaticMarkup(createElement(Home));
    for (const id of ["creamy-garlic-chicken", "tomato-beef-stew", "chicken-curry", "bibimbap", "garlic-butter-shrimp"]) {
      expect(home).toContain('href="/recipes/' + id + '"');
    }
    expect(home).toContain('href="/cook"');
    expect(home).toContain("My recipes");
    const nav = renderToStaticMarkup(createElement(Nav));
    expect(nav).toContain('href="/recipes"');
    expect(nav).toContain('aria-label="All recipes"');
    expect(nav).toContain('href="/cook"');
    expect(nav).toContain('href="/#tools"');
  });
  it("shows a meaningful empty collection state", () => {
    const spy = vi.spyOn(recipeData, "listRecipes").mockReturnValue([]);
    try {
      expect(renderToStaticMarkup(createElement(RecipesPage))).toContain("No recipes yet");
    } finally { spy.mockRestore(); }
  });

  for (const recipe of recipes) {
    it(recipe.id + " renders its complete data and propagates the selected ID", async () => {
      const html = renderToStaticMarkup(await RecipePage({ params: Promise.resolve({ id: recipe.id }) }));
      expect(html).toContain(htmlText(recipe.title));
      expect(html).toContain(htmlText(recipe.description));
      expect(html).toContain('href="/cook?recipeId=' + recipe.id + '"');
      for (const ingredient of recipe.ingredients) expect(html).toContain(htmlText(describeIngredient(ingredient, recipe.servings, recipe.servings, "screen")));
      for (const step of recipe.steps) {
        expect(html).toContain(htmlText(step.instruction));
        if (step.safety) expect(html).toContain(htmlText(step.safety));
        if (step.tip) expect(html).toContain(htmlText(step.tip));
      }
      expect(html.includes('aria-label="Estimated nutrition"')).toBe(recipe.nutrition.status === "estimated");
      const cook = await CookPage({ searchParams: Promise.resolve({ recipeId: recipe.id }) });
      expect(cook.props.selectedRecipe).toBe(recipe);
      expect(cook.key).toBe(recipe.id);
    });
  }
  it("retains the default cooking recipe without a query parameter", async () => {
    const page = await CookPage({ searchParams: Promise.resolve({}) });
    expect(page.props.selectedRecipe).toBe(CREAMY_GARLIC_CHICKEN);
  });
  for (const id of ["missing", "", "toString", "__proto__"]) {
    it("returns notFound for invalid detail and cook ID: " + id, async () => {
      await expect(RecipePage({ params: Promise.resolve({ id }) })).rejects.toThrow("404");
      await expect(CookPage({ searchParams: Promise.resolve({ recipeId: id }) })).rejects.toThrow("404");
    });
  }
  it("rejects ambiguous repeated cooking IDs", async () => {
    await expect(CookPage({ searchParams: Promise.resolve({ recipeId: recipes.slice(0, 2).map(r => r.id) }) })).rejects.toThrow("404");
  });
});
