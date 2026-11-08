import Link from "next/link";

export default function RecipeNotFound() {
  return <main className="mx-auto max-w-xl px-5 py-16">
    <h1 className="font-display text-4xl">Recipe not found</h1>
    <p className="mt-4 text-muted">This recipe is not in our collection.</p>
    <Link href="/recipes" className="mt-6 inline-block rounded-full bg-forest px-5 py-3 font-semibold text-white">Browse all recipes</Link>
  </main>;
}
