"use client";

import Link from "next/link";
import { Recommendation } from "@/components/Recommendation";
import { RecipeImage } from "@/components/RecipeImage";
import { Nav } from "@/components/Nav";
import { Toast, useToast } from "@/components/Toast";
import { CREAMY_GARLIC_CHICKEN, POPULAR_RECIPES, nutritionLabel } from "@/lib/recipe";

const FEATURED_ORDER = ["bibimbap", "chicken-curry", "creamy-garlic-chicken", "garlic-butter-shrimp", "tomato-beef-stew"];
const CHIPS = ["All", "Chinese", "Italian", "Japanese", "Korean", "Indian", "Mexican"];

export default function Home() {
  const toast = useToast();
  return (
    <div className="landing-page">
      <div className="landing-backdrop" aria-hidden="true" />
      <Nav onSoon={toast.soon} />
      <main className="landing-main">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="hero-eyebrow">Your AI cooking companion</p>
            <h1 className="font-display">Good Food <span>Starts with a Conversation</span></h1>
            <p className="hero-description">Find your next favorite recipe, discover a daily cooking idea, and cook hands-free with an AI voice.</p>
            <div className="hero-actions">
              <Link href="/cook" className="hero-primary"><MicIcon className="h-5 w-5" /> Start cooking</Link>
              <Link href="/recipes" className="hero-secondary">Browse recipes <span aria-hidden>→</span></Link>
            </div>
          </div>
        </section>
        {/* Popular recipes */}
        <section id="popular" className="recipe-showcase scroll-mt-24">
          <div className="recipe-section-heading">
            <div className="flex items-center gap-5"><h2 className="font-display text-3xl">Popular recipes</h2><Link href="/recipes" className="shrink-0 text-sm font-semibold text-forest underline underline-offset-4">Show All</Link></div>
            <div className="recipe-filters no-scrollbar flex gap-2 overflow-x-auto">
              {CHIPS.map((c, i) => (
                <Link href={i === 0 ? "/recipes" : `/recipes?cuisine=${encodeURIComponent(c)}`} key={c} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${i === 0 ? "bg-forest text-white" : "bg-paper text-ink/80 shadow-card hover:text-forest"}`}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
          <div className="recipe-grid">
            {[...POPULAR_RECIPES].sort((a, b) => FEATURED_ORDER.indexOf(a.id) - FEATURED_ORDER.indexOf(b.id)).map((r) => {
              const live = r.id === CREAMY_GARLIC_CHICKEN.id;
              const inner = (
                <>
                  <div className="relative">
                    <RecipeImage src={r.image} title={r.title} className="block aspect-[1.85/1] w-full object-cover" loading="lazy" />
                    {live ? (
                      <span className="absolute left-3 top-3 rounded-full bg-coral px-2.5 py-1 text-xs font-semibold text-white">Cook by voice</span>
                    ) : (
                      <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-muted">View recipe</span>
                    )}
                  </div>
                  <div className="recipe-caption">
                    <h3 className="font-semibold leading-snug">{r.title}</h3>
                    <p className="mt-1.5 text-xs text-muted">
                      {r.totalMinutes} min · {nutritionLabel(r)}
                    </p>
                    <p className="mt-2 inline-block rounded-full bg-cream px-2 py-0.5 text-xs text-ink/70">{r.cuisine}</p>
                  </div>
                </>
              );
              const cls = "group block overflow-hidden rounded-3xl bg-paper text-left shadow-card ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-float";
              return (
                <Link key={r.id} href={`/recipes/${r.id}`} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        <form className="landing-voice-search" action="/recipes">
          <span className="voice-wave" aria-hidden>{[12,22,32,42,28,18].map((h,i)=><i key={i} style={{height:h}} />)}</span>
          <input name="q" aria-label="Search recipes" placeholder="Search for a recipe, e.g. tomato beef stew, chicken curry…" />
          <Link href="/cook" aria-label="Start cooking with voice" className="voice-search-mic"><MicIcon className="h-6 w-6" /></Link>
          <button type="submit" className="sr-only">Search</button>
        </form>
        <div className="hero-notes"><span>Hey Chef, what&apos;s next?</span><span>Good food, brighter days</span></div>
        {/* Dashboard row */}
        <section className="mt-8 grid items-start gap-5 lg:grid-cols-2">
          <div id="nutrition" className="scroll-mt-24 rounded-3xl bg-paper p-6 shadow-card ring-1 ring-line/60">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Nutrition dashboard</h2>
              <button onClick={toast.soon} className="shrink-0 whitespace-nowrap text-sm font-medium text-forest">
                Edit goal →
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">Demo overview: these meals are sample data, not your activity.</p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <Ring value={1250} max={2000} />
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="block text-muted">Consumed</span>
                  <span className="font-semibold">1,250 kcal</span>
                </li>
                <li>
                  <span className="block text-muted">Remaining</span>
                  <span className="font-semibold">750 kcal</span>
                </li>
                <li>
                  <span className="block text-muted">Daily goal</span>
                  <span className="font-semibold">2,000 kcal</span>
                </li>
              </ul>
            </div>
            <h3 className="mt-6 text-sm font-semibold">Today&apos;s meals</h3>
            <ul className="mt-2 divide-y divide-line text-sm">
              {[
                ["Breakfast", "Oatmeal with banana", 320, "🥣"],
                ["Lunch", "Chicken salad", 520, "🥗"],
                ["Dinner (planned)", "Creamy garlic chicken", 610, "🍗"],
              ].map(([meal, dish, kcal, emoji]) => (
                <li key={meal as string} className="flex items-center gap-3 py-2.5">
                  <span className="text-xl">{emoji}</span>
                  <span className="flex-1">
                    <span className="block font-medium">{meal}</span>
                    <span className="block text-xs text-muted">{dish}</span>
                  </span>
                  <span className="text-xs text-muted">{kcal} kcal</span>
                </li>
              ))}
            </ul>
          </div>

          <Recommendation />
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6 text-xs text-muted">
          <span>Sous · hands-free cooking, powered by ALEBEX voice</span>
          <span>Built for the hackathon</span>
        </footer>
      </main>
      <Toast msg={toast.msg} />
    </div>
  );
}

function Ring({ value, max }: { value: number; max: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <svg viewBox="0 0 128 128" className="h-32 w-32 shrink-0" role="img" aria-label={`${value} of ${max} calories`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="#e9e4d8" strokeWidth="12" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="#6b8f5e" strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 64 64)" />
      <text x="64" y="60" textAnchor="middle" className="fill-ink font-display" fontSize="22">
        {value.toLocaleString()}
      </text>
      <text x="64" y="80" textAnchor="middle" className="fill-muted" fontSize="11">
        / {max.toLocaleString()} kcal
      </text>
    </svg>
  );
}

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </svg>
  );
}
