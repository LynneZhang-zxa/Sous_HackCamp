import { describe, expect, it } from "vitest";
import { listRecipes } from "./recipe";
import { dailyRecommendation, localDay, surpriseRecommendation } from "./recommendations";
const catalog = listRecipes();
describe("catalog recommendations", () => {
  it("is stable for a local day and independent of catalog order", () => {
    expect(localDay(new Date(2026, 10, 8, 23, 59))).toBe("2026-11-08");
    expect(dailyRecommendation(catalog, "2026-11-08")).toBe(dailyRecommendation([...catalog].reverse(), "2026-11-08"));
    const picks = new Set(Array.from({ length: 31 }, (_, day) => dailyRecommendation(catalog, `2026-11-${day + 1}`)?.id));
    expect(picks.size).toBeGreaterThan(1);
    for (const id of picks) expect(catalog.some(r => r.id === id)).toBe(true);
  });
  it("always changes the current pick, including the random boundaries", () => {
    for (const recipe of catalog) for (const value of [0, 0.5, 0.999999, 1, NaN]) {
      const next = surpriseRecommendation(catalog, recipe.id, () => value);
      expect(next?.id).not.toBe(recipe.id);
      expect(catalog).toContain(next);
    }
  });
  it("handles empty and single-entry catalogs", () => {
    expect(dailyRecommendation([], "2026-11-08")).toBeUndefined();
    expect(surpriseRecommendation([])).toBeUndefined();
    expect(surpriseRecommendation([catalog[0]], catalog[0].id)).toBe(catalog[0]);
  });
});
