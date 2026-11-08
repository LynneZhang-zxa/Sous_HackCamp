import Link from "next/link";
import { RecipeImage } from "./RecipeImage";
import { SaveRecipe } from "./SavedRecipes";
import { nutritionLabel, type Recipe } from "@/lib/recipe";

export function RecipeCard({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
 return <article className={`recipe-card ${compact ? "recipe-card-compact" : ""}`}>
  <Link href={`/recipes/${recipe.id}`} className="recipe-card-main">
   <div className="recipe-card-photo"><RecipeImage src={recipe.image} title={recipe.title} className="w-full object-cover" /></div>
   <div className="recipe-card-copy">
    <p className="recipe-card-cuisine">{recipe.cuisine}</p>
    <h3>{recipe.title}</h3>
    <p className="recipe-card-meta">{recipe.totalMinutes} min · {recipe.servings} servings</p>
    {recipe.nutrition.status === "estimated" && <p className="recipe-card-meta">{nutritionLabel(recipe)} per serving</p>}
    <span className="recipe-card-view">View Recipe <span aria-hidden>↗</span></span>
   </div>
  </Link>
  <div className="recipe-card-actions">
   <Link href={`/cook?recipeId=${encodeURIComponent(recipe.id)}`} className="recipe-card-voice" aria-label={`Cook ${recipe.title} by voice`}>Cook by Voice <span aria-hidden>↗</span></Link>
   {!compact && <SaveRecipe id={recipe.id} />}
  </div>
 </article>;
}
