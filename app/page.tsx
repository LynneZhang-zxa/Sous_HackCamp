"use client";

import Link from "next/link";
import { FoodTile, type Tone } from "@/components/FoodTile";
import { Nav } from "@/components/Nav";
import { Toast, useToast } from "@/components/Toast";
import { CREAMY_GARLIC_CHICKEN, POPULAR_RECIPES, getRecipe, nutritionLabel } from "@/lib/recipe";

const FEATURED_ORDER = ["bibimbap", "chicken-curry", "creamy-garlic-chicken", "garlic-butter-shrimp", "tomato-beef-stew"];
const CHIPS = ["All", "Chinese", "Italian", "Japanese", "Korean", "Indian", "Mexican", "Quick & easy", "Healthy"];

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
            <p className="hero-description">Find recipes, get personalized suggestions, cook hands-free with an AI voice, and keep track of your nutrition, all in one place.</p>
            <div className="hero-actions">
              <Link href="/cook" className="hero-primary"><MicIcon className="h-5 w-5" /> Start cooking</Link>
              <Link href="/recipes" className="hero-secondary">Browse recipes <span aria-hidden>→</span></Link>
            </div>
          </div>
        </section>
        {/* Popular recipes */}
        <section id="popular" className="recipe-showcase scroll-mt-24">
          <div className="recipe-section-heading">
            <h2 className="font-display text-3xl">Popular recipes</h2>
            <div className="recipe-filters no-scrollbar flex gap-2 overflow-x-auto">
              {CHIPS.map((c, i) => (
                <button key={c} onClick={i === 0 ? undefined : toast.soon} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${i === 0 ? "bg-forest text-white" : "bg-paper text-ink/80 shadow-card hover:text-forest"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="recipe-grid">
            {[...POPULAR_RECIPES].sort((a, b) => FEATURED_ORDER.indexOf(a.id) - FEATURED_ORDER.indexOf(b.id)).map((r) => {
              const live = r.id === CREAMY_GARLIC_CHICKEN.id;
              const inner = (
                <>
                  <div className="relative">
                    <img src={r.image} alt={r.title} className="block aspect-[1.85/1] w-full object-cover" loading="lazy" />
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

        <form className="landing-voice-search" onSubmit={(e) => { e.preventDefault(); toast.soon(); }}>
          <span className="voice-wave" aria-hidden>{[12,22,32,42,28,18].map((h,i)=><i key={i} style={{height:h}} />)}</span>
          <input aria-label="Search recipes" placeholder="Search for a recipe, e.g. tomato beef stew, chicken curry…" />
          <Link href="/cook" aria-label="Start cooking with voice" className="voice-search-mic"><MicIcon className="h-6 w-6" /></Link>
          <button type="submit" className="sr-only">Search</button>
        </form>
        <div className="hero-notes"><span>Hey Chef, what&apos;s next?</span><span>Good food, brighter days</span></div>
        <div id="tools" className="landing-tools">
        {/* Feature cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="What you can do">
          <FeatureCard tone="bg-leaf" title="What can I cook?" body="Upload a photo of your ingredients or tell me what you have." icon="🥬">
            <button onClick={toast.soon} className="mt-auto w-full rounded-full bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest-deep">
              Upload ingredients
            </button>
          </FeatureCard>
          <FeatureCard tone="bg-coral-tint" title="Upload a recipe" body="From a photo, a video or plain text." icon="📄">
            <button onClick={toast.soon} className="mt-auto w-full rounded-full bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95">
              Upload recipe
            </button>
          </FeatureCard>
          <FeatureCard tone="bg-butter-tint" title="Today's recommendation" body="Personalized picks for you." icon="✨">
            <a href="#popular" className="mt-auto block w-full rounded-full bg-butter px-4 py-3 text-center text-sm font-semibold text-ink transition hover:brightness-95">
              See today&apos;s picks
            </a>
          </FeatureCard>
          <div className="flex flex-col sous-voice-card rounded-3xl bg-sky-tint p-5 shadow-card">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                🎙️
              </span>
              <div>
                <h2 className="font-display text-xl leading-tight">Start cooking with voice</h2>
                <p className="mt-1 text-sm text-ink/70">Hands-free guidance, step by step.</p>
              </div>
            </div>
            <Link href="/cook" className="group mt-5 flex flex-1 flex-col items-center justify-center gap-3" aria-label="Start cooking with voice">
              <span className="relative flex h-28 w-28 items-center justify-center">
                <span className="mic-breathe absolute inset-0 rounded-full bg-coral/20" />
                <span className="relative flex h-24 w-24 items-center justify-center sous-mic rounded-full bg-coral text-white shadow-float transition group-hover:scale-105">
                  <MicIcon className="h-10 w-10" />
                </span>
              </span>
              <span className="text-sm font-semibold text-forest">Tap to wake</span>
              <span className="-mt-2 font-hand text-xl text-ink/70">&ldquo;Hey Chef&rdquo;</span>
            </Link>
          </div>
        </section>

        </div>
        {/* Dashboard row */}
        <section className="mt-14 grid gap-4 lg:grid-cols-3">
          <div id="nutrition" className="scroll-mt-24 rounded-3xl bg-paper p-6 shadow-card ring-1 ring-line/60">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Nutrition dashboard</h2>
              <button onClick={toast.soon} className="shrink-0 whitespace-nowrap text-sm font-medium text-forest">
                Edit goal →
              </button>
            </div>
            <div className="mt-5 flex items-center gap-6">
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

          <div id="my-recipes" className="scroll-mt-24 rounded-3xl bg-paper p-6 shadow-card ring-1 ring-line/60">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">My recipes</h2>
              <button onClick={toast.soon} className="shrink-0 whitespace-nowrap text-sm font-medium text-forest">
                See all →
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              {["Saved", "Uploaded", "Recently cooked"].map((t, i) => (
                <button key={t} onClick={i === 0 ? undefined : toast.soon} className={`rounded-full px-3 py-1.5 text-xs font-medium ${i === 0 ? "bg-forest text-white" : "bg-cream text-ink/70"}`}>
                  {t}
                </button>
              ))}
            </div>
            <ul className="mt-4 divide-y divide-line text-sm">
              {[
                ["garlic-butter-shrimp", "🍤", "sky"],
                ["miso-soup", "🍜", "green"],
                ["homemade-tacos", "🌮", "coral"],
                ["avocado-pasta", "🥑", "green"],
              ].map(([id, emoji, tone]) => {
                // Existing demo list; saved-recipe functionality is deferred.
                const recipe = getRecipe(id)!;
                const name = recipe.title;
                const meta = `${recipe.totalMinutes} min · ${nutritionLabel(recipe)}`;
                return (
                <li key={name} className="flex items-center gap-3 py-2.5">
                  <FoodTile emoji={emoji} tone={tone as Tone} className="h-11 w-11 rounded-xl" size="text-xl" />
                  <span className="flex-1">
                    <span className="block font-medium">{name}</span>
                    <span className="block text-xs text-muted">{meta}</span>
                  </span>
                  <button onClick={toast.soon} aria-label={`Save ${name}`} className="text-muted hover:text-forest">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      <path d="M6 4h12v17l-6-4-6 4z" />
                    </svg>
                  </button>
                </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-paper p-6 shadow-card ring-1 ring-line/60">
              <h2 className="font-display text-2xl">Quick actions</h2>
              <ul className="mt-4 space-y-2">
                {[
                  ["📷", "Scan a recipe", "Take a photo to extract a recipe"],
                  ["➕", "Add to today", "Log a meal to your nutrition"],
                  ["🕒", "View cooking history", "See what you've cooked"],
                  ["⚙️", "Settings", "Dietary preferences, units, etc."],
                ].map(([icon, title, sub]) => (
                  <li key={title}>
                    <button onClick={toast.soon} className="flex w-full items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-left transition hover:bg-leaf/70">
                      <span className="text-xl">{icon}</span>
                      <span>
                        <span className="block text-sm font-semibold">{title}</span>
                        <span className="block text-xs text-muted">{sub}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-butter-tint p-5 shadow-card">
              <p className="text-sm font-semibold">💡 Need inspiration?</p>
              <p className="mt-1 text-sm text-ink/70">Tell me your mood, time or ingredients and I&apos;ll suggest the perfect recipe.</p>
            </div>
          </div>
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

function FeatureCard({ tone, title, body, icon, children }: { tone: string; title: string; body: string; icon: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col rounded-3xl ${tone} p-5 shadow-card`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        <div>
          <h2 className="font-display text-xl leading-tight">{title}</h2>
          <p className="mt-1 text-sm text-ink/70">{body}</p>
        </div>
      </div>
      <div className="my-5 flex-1" />
      {children}
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

export function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </svg>
  );
}
