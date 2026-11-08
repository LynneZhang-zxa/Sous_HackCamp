import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SavedRecipes } from "@/components/SavedRecipes";
export default function MyRecipesPage() { return <><Nav browsing/><main data-sous-page="/collection/my-recipes" className="mx-auto max-w-5xl px-4 py-10"><Link href="/" className="text-forest">Home</Link><h1 className="mt-5 font-display text-4xl">My Recipes</h1><SavedRecipes/></main></>; }
