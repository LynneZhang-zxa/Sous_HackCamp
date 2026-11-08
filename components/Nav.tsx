import Link from "next/link";

export function Nav({ onSoon, browsing = false }: { onSoon?: () => void; browsing?: boolean }) {
  return (
    <header className={`landing-nav relative z-40${browsing ? " browse-nav" : ""}`}>
      <div className="landing-nav-inner">
        <Link href="/" className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 40" className="h-10 w-8 text-coral" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden><path d="M8 35C-1 26 20 22 10 12M17 35C5 23 28 19 18 5M26 35C14 24 34 21 27 12" /></svg>
          <span className="leading-none">
            <span className="block font-display text-4xl text-ink">Sous</span>

          </span>
        </Link>
        <nav className="landing-nav-links" aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/collection/my-recipes">My Recipes</Link>
          <details className="relative">
            <summary className="cursor-pointer rounded-full px-3 py-2">Tools</summary>
            <div className="absolute left-0 top-full z-50 w-60 rounded-2xl bg-paper p-4 shadow-float">
              <Link href="/tools#ingredients">What Can I Cook?</Link>
              <Link href="/tools#upload">Upload Recipe</Link>
              <Link href="/tools#history">History</Link>
            </div>
          </details>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/recipes#recipe-search" aria-label="Search" className="rounded-full bg-paper px-3 py-2 shadow-card">Search</Link>
          <details className="relative"><summary aria-label="Settings" className="cursor-pointer rounded-full bg-paper px-3 py-2 shadow-card">Settings</summary><p className="absolute right-0 z-50 w-52 rounded-2xl bg-paper p-4 shadow-float">Settings are coming soon.</p></details>
        </div>
      </div>
    </header>
  );
}

export function ChefHat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 25h12v3H10z" />
      <path d="M10 25v-6.5A6 6 0 0 1 7 8.3 6.5 6.5 0 0 1 16 5a6.5 6.5 0 0 1 9 3.3A6 6 0 0 1 22 18.5V25" />
      <path d="M14 19v6M18 19v6" />
    </svg>
  );
}
