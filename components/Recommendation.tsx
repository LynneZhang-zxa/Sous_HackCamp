"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RecipeImage } from "./RecipeImage";
import { listRecipes, nutritionLabel, type Recipe } from "@/lib/recipe";
import { dailyRecommendation, localDay, surpriseRecommendation } from "@/lib/recommendations";

export function Recommendation() {
  const [recipe, setRecipe] = useState<Recipe | undefined>();
  useEffect(() => {
    let day = localDay();
    setRecipe(dailyRecommendation(listRecipes(), day));
    const timer = window.setInterval(() => {
      const next = localDay();
      if (next !== day) { day = next; setRecipe(dailyRecommendation(listRecipes(), day)); }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return <article className="recommendation-card overflow-hidden rounded-3xl bg-butter-tint shadow-card">
    {recipe && <RecipeImage src={recipe.image} title={recipe.title} className="recommendation-photo w-full object-cover" />}
    <div className="p-6">
      <h2 className="font-display text-2xl">Today&apos;s recommendation</h2>
      <p className="mt-2 text-xs text-muted">A daily pick from the SOUS catalog.</p>
      {recipe ? <div aria-live="polite" aria-atomic="true">
        <h3 className="mt-4 font-display text-3xl">{recipe.title}</h3>
        <p className="mt-2 text-sm text-forest">{recipe.totalMinutes} min · {recipe.cuisine}</p>
        <p className="mt-2 text-sm text-muted">{nutritionLabel(recipe)}{recipe.nutrition.status === "estimated" ? " per serving" : ""}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/recipes/${recipe.id}`} className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white">View Recipe</Link>
          <button type="button" onClick={() => setRecipe(surpriseRecommendation(listRecipes(), recipe.id))} className="rounded-full border border-forest px-5 py-2.5 text-sm font-semibold text-forest hover:bg-paper">Surprise Me</button>
        </div>
      </div> : <p className="mt-4" role="status">Choosing today&apos;s recipe…</p>}
    </div>
  </article>;
}
