import Link from "next/link";
import { Nav } from "@/components/Nav";
import { RecipeImage } from "@/components/RecipeImage";
import { listRecipes, nutritionLabel } from "@/lib/recipe";

export const metadata = { title: "All recipes · Sous" };

export default function RecipesPage() {
  const recipes = listRecipes();
  return <>
    <Nav browsing />
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 pb-20 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-forest">← Home</Link>
      <h1 className="mt-5 font-display text-5xl">All recipes</h1>
      <p className="mt-4 text-ink/75">Find your next meal. Explore {recipes.length} recipes and cook at your own pace.</p>
      {recipes.length === 0 ? <div className="mt-8 rounded-3xl bg-paper p-8 shadow-card" role="status">
        <h2 className="font-display text-2xl">No recipes yet</h2>
        <p className="mt-2 text-muted">There are no recipes to browse right now. Please check back later.</p>
      </div> : <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="All recipes">
        {recipes.map(recipe => <li key={recipe.id} className="min-w-0">
          <Link href={`/recipes/${recipe.id}`} className="block h-full overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-float">
            <RecipeImage src={recipe.image} title={recipe.title} className="aspect-[4/3] w-full object-cover" />
            <div className="p-5">
              <p className="text-xs font-semibold text-forest">{recipe.cuisine}</p>
              <h2 className="mt-2 font-display text-xl">{recipe.title}</h2>
              <p className="mt-3 text-sm text-muted">{recipe.totalMinutes} min · {recipe.servings} servings</p>
              {recipe.nutrition.status === "estimated" && <p className="mt-2 text-xs text-muted">{nutritionLabel(recipe)} per serving</p>}
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                {recipe.tags.map(tag => <li key={tag} className="rounded-full bg-cream px-2 py-1 text-xs text-ink/70">{tag}</li>)}
              </ul>
            </div>
          </Link>
        </li>)}
      </ul>}
    </main>
  </>;
}
