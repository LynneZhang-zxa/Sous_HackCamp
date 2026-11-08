import { searchRecipes } from "@/lib/recipe-search";
import { SaveRecipe } from "@/components/SavedRecipes";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { RecipeImage } from "@/components/RecipeImage";
import { listRecipes, nutritionLabel } from "@/lib/recipe";

export const metadata = { title: "All recipes · Sous" };

export default async function RecipesPage({ searchParams }: { searchParams: Promise<Record<string,string | string[] | undefined>> }) {
  const raw = await searchParams ?? {};
  const query = Object.fromEntries(Object.entries(raw).filter((entry): entry is [string,string] => typeof entry[1] === "string"));
  const all = listRecipes();
  const recipes = searchRecipes(all, query);
  return <>
    <Nav browsing />
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 pb-20 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-forest">← Home</Link>
      <h1 className="mt-5 font-display text-5xl">All recipes</h1>
      <p className="mt-4 text-ink/75">Find your next meal. Explore {recipes.length} recipes and cook at your own pace.</p>
      <form action="/recipes" id="recipe-search" className="mt-6 flex flex-wrap items-end gap-4 rounded-3xl bg-paper p-5">
        <label className="flex flex-col gap-2">Search<input name="q" defaultValue={query.q} placeholder="Title, ingredient, cuisine or tag" className="rounded-xl border border-line p-2" /></label>
        <label className="flex flex-col gap-2">Cuisine<select name="cuisine" defaultValue={query.cuisine ?? ""} className="rounded-xl border border-line p-2"><option value="">All cuisines</option>{[...new Set(all.map(r=>r.cuisine))].sort().map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="flex flex-col gap-2">Maximum minutes<input name="maxMinutes" type="number" min="1" defaultValue={query.maxMinutes} className="w-28 rounded-xl border border-line p-2" /></label>
        <label className="flex flex-col gap-2">Tag<select name="tag" defaultValue={query.tag ?? ""} className="rounded-xl border border-line p-2"><option value="">All tags</option>{[...new Set(all.flatMap(r=>r.tags))].sort().map(t=><option key={t}>{t}</option>)}</select></label>
        <label className="flex flex-col gap-2">Sort<select name="sort" defaultValue={query.sort ?? "alphabetical"} className="rounded-xl border border-line p-2"><option value="alphabetical">Alphabetical</option><option value="shortest">Shortest time</option><option value="longest">Longest time</option></select></label>
        <button className="rounded-full bg-forest px-5 py-2 text-white">Search</button><Link href="/recipes" className="py-2 text-forest underline">Reset Filters</Link>
      </form>
      <p className="mt-4" role="status">{recipes.length} recipes found</p>
      {recipes.length === 0 ? <div className="mt-8 rounded-3xl bg-paper p-8 shadow-card" role="status">
        <h2 className="font-display text-2xl">{all.length ? "No matching recipes" : "No recipes yet"}</h2>
        <p className="mt-2 text-muted">Try another search or reset your filters.</p>
      </div> : <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="All recipes">
        {recipes.map(recipe => <li key={recipe.id} className="min-w-0">
          <Link href={`/recipes/${recipe.id}`} className="block overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-float">
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
          <div className="mt-3"><SaveRecipe id={recipe.id}/></div>
        </li>)}
      </ul>}
    </main>
  </>;
}
