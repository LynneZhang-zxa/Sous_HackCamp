import { notFound } from "next/navigation";
import { CookScreen } from "@/components/cook/CookScreen";
import { CREAMY_GARLIC_CHICKEN, getRecipe } from "@/lib/recipe";

export default async function CookPage({ searchParams }: {
  searchParams: Promise<{ recipeId?: string | string[] }>;
}) {
  const { recipeId } = await searchParams;
  const recipe = recipeId === undefined ? CREAMY_GARLIC_CHICKEN
    : typeof recipeId === "string" ? getRecipe(recipeId) : undefined;
  if (!recipe) notFound();
  return <CookScreen key={recipe.id} selectedRecipe={recipe} />;
}
