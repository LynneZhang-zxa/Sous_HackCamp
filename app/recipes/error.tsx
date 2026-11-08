"use client";

import Link from "next/link";

export default function RecipesError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-16" role="alert">
    <h1 className="font-display text-3xl">Recipes could not be loaded</h1>
    <p className="mt-4 text-muted">Please try again, or return home and browse later.</p>
    <button onClick={retry} className="mt-6 rounded-full bg-forest px-5 py-3 font-semibold text-white">Try again</button>
    <Link href="/" className="ml-4 text-forest underline">Home</Link>
  </main>;
}
