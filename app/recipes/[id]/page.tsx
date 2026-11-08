import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { RecipeImage } from "@/components/RecipeImage";
import { describeIngredient, getRecipe, listRecipes, nutritionLabel } from "@/lib/recipe";

export const dynamicParams = false;

export function generateStaticParams() {
  return listRecipes().map(recipe => ({ id: recipe.id }));
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getRecipe(id);
  if (!recipe) notFound();
  return <>
    <Nav browsing />
    <main className="mx-auto max-w-6xl px-4 py-10 pb-20 sm:px-6">
      <Link href="/recipes" className="text-sm font-semibold text-forest">← All recipes</Link>
      <article className="mt-6">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <RecipeImage src={recipe.image} title={recipe.title} loading="eager" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-card" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-forest">{recipe.cuisine}</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl">{recipe.title}</h1>
            <p className="mt-4 text-lg text-ink/75">{recipe.description}</p>
            <ul aria-label="Tags" className="mt-4 flex flex-wrap gap-2">
              {recipe.tags.map(tag => <li key={tag} className="rounded-full bg-leaf px-3 py-1 text-sm text-forest-deep">{tag}</li>)}
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-3xl bg-paper p-5 shadow-card">
              {[["Prep", recipe.prepMinutes + " min"], ["Cook", recipe.cookMinutes + " min"], ["Total", recipe.totalMinutes + " min"], ["Servings", recipe.servings]].map(([label, value]) => <div key={label}><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}
            </dl>
            {recipe.nutrition.status === "estimated" && <section className="mt-5 text-sm" aria-label="Estimated nutrition">
              <p>{nutritionLabel(recipe)} per serving</p>
              <p className="mt-1 text-xs text-muted">{recipe.nutrition.source}</p>
            </section>}
            <Link href={`/cook?recipeId=${encodeURIComponent(recipe.id)}`} className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 font-semibold text-white">Cook by Voice</Link>
          </div>
        </div>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <section className="rounded-3xl bg-paper p-6 shadow-card" aria-labelledby="ingredients">
            <h2 id="ingredients" className="font-display text-2xl">Ingredients</h2>
            <p className="mt-2 text-sm text-muted">For {recipe.servings} servings</p>
            <ul className="mt-4 list-disc space-y-3 pl-5">
              {recipe.ingredients.map(ingredient => <li key={ingredient.name}>{describeIngredient(ingredient, recipe.servings, recipe.servings, "screen")}</li>)}
            </ul>
          </section>
          <section aria-labelledby="instructions" className="min-w-0">
            <h2 id="instructions" className="font-display text-3xl">Cooking instructions</h2>
            <ol className="mt-5 space-y-5">
              {recipe.steps.map((step, index) => <li key={step.id} className="rounded-3xl bg-paper p-6 shadow-card">
                <h3 className="text-lg font-semibold">{index + 1}. {step.title}</h3>
                {step.durationSeconds !== undefined && <p className="mt-1 text-sm text-muted">Suggested timer: {durationLabel(step.durationSeconds)}</p>}
                <p className="mt-3 leading-relaxed">{step.instruction}</p>
                {step.tip && <p className="mt-4 rounded-2xl bg-butter-tint p-3 text-sm"><strong>Tip: </strong>{step.tip}</p>}
                {step.safety && <p className="mt-3 rounded-2xl bg-coral-tint p-3 text-sm"><strong>Safety: </strong>{step.safety}</p>}
              </li>)}
            </ol>
          </section>
        </div>
      </article>
    </main>
  </>;
}

function durationLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return [minutes ? minutes + " min" : "", remainder ? remainder + " sec" : ""].filter(Boolean).join(" ");
}
