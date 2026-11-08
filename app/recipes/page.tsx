import { Nav } from "@/components/Nav";
import { RecipeDiscovery } from "@/components/RecipeDiscovery";
import { listRecipes } from "@/lib/recipe";
import type { RecipeQuery } from "@/lib/recipe-search";

export const metadata = { title: "All recipes · Sous" };
export default async function RecipesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
 const raw = await searchParams;
 const query: RecipeQuery = Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
 return <div className="discovery-page"><Nav browsing /><main data-sous-page="/recipes" id="main-content" className="discovery-main"><RecipeDiscovery recipes={listRecipes()} initialQuery={query} /></main></div>;
}
