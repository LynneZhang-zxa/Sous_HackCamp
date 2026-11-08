import Link from "next/link";
import { Nav } from "@/components/Nav";
export default function ToolsPage() {
 return <><Nav browsing /><main data-sous-page="/tools" className="mx-auto max-w-4xl px-4 py-10"><h1 className="font-display text-4xl">Tools</h1><div className="mt-8 grid gap-5">{[["ingredients", "What Can I Cook?", "Ingredient suggestions"], ["upload", "Upload Recipe", "Recipe uploads"], ["history", "History", "Cooking history"]].map(([id,title,body]) => <section id={id} key={id} className="rounded-3xl bg-paper p-6 shadow-card"><h2 className="font-display text-2xl">{title}</h2><p className="mt-3">{body} are coming soon.</p></section>)}</div><Link href="/recipes" className="mt-8 inline-block text-forest">Browse all recipes</Link></main></>;
}
