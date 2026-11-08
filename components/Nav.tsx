import Link from "next/link";

export function Nav({ onSoon, browsing = false }: { onSoon?: () => void; browsing?: boolean }) {
  const links = [
    { label: "Recipes", href: "/recipes", active: true },
    { label: "Cook", href: "/cook" },
    { label: "Tools", href: "/#tools" },

  ];
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
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-label={l.label === "Recipes" ? "All recipes" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${l.active ? "bg-coral-tint text-coral" : "text-ink/80 hover:bg-leaf/60"}`}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {l.label === "Recipes" ? <path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" /> : l.label === "Cook" ? <><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6" /></> : <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />}
              </svg>{l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <IconButton label="Search" onClick={onSoon}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </IconButton>
          <IconButton label="Notifications" onClick={onSoon}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </IconButton>
          <button onClick={onSoon} aria-label="Account" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#795439] text-sm font-semibold text-white">
            E
          </button>
        </div>
      </div>
    </header>
  );
}

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink/80 shadow-card transition hover:text-forest">
      {children}
    </button>
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
