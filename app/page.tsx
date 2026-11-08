"use client";

import Link from "next/link";
import { useState } from "react";
import { RecipeCard } from "@/components/RecipeCard";
import { CuisineChips } from "@/components/CuisineChips";
import { recipeCuisines, searchRecipes } from "@/lib/recipe-search";
import { Recommendation } from "@/components/Recommendation";
import { RecipeImage } from "@/components/RecipeImage";
import { Nav } from "@/components/Nav";
import { Toast, useToast } from "@/components/Toast";
import { POPULAR_RECIPES, listRecipes } from "@/lib/recipe";

const FEATURED_ORDER = ["bibimbap", "chicken-curry", "creamy-garlic-chicken", "garlic-butter-shrimp", "tomato-beef-stew"];
const ALL_RECIPES = listRecipes();
const CUISINES = recipeCuisines(ALL_RECIPES);

export default function Home() {
  const toast = useToast();
  const [cuisine, setCuisine] = useState("");
  const previews = cuisine ? searchRecipes(ALL_RECIPES, {cuisine}) : [...POPULAR_RECIPES].sort((a,b) => FEATURED_ORDER.indexOf(a.id) - FEATURED_ORDER.indexOf(b.id));
  const discoveryHref = cuisine ? `/recipes?cuisine=${encodeURIComponent(cuisine)}` : "/recipes";
  return (
    <div className="landing-page">
      <div className="landing-backdrop" aria-hidden="true" />
      <Nav onSoon={toast.soon} />
      <main data-sous-page="/" className="landing-main">
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
        <section id="popular" className="recipe-showcase scroll-mt-24">
          <div className="preview-heading"><div><p className="discovery-eyebrow">A LITTLE INSPIRATION</p><h2 className="font-display text-3xl">Popular recipes</h2></div><Link href={discoveryHref} className="preview-show-all">Show All <span aria-hidden>↗</span></Link></div>
          <CuisineChips categories={CUISINES} selected={cuisine} onSelect={setCuisine} />
          {previews.length ? <div className="recipe-preview-row" aria-label="Popular recipe previews">{previews.slice(0, 8).map(recipe => <RecipeCard key={recipe.id} recipe={recipe} compact />)}</div> : <p className="discovery-empty">No recipes for this cuisine yet.</p>}
        </section>


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
