# Build fixes — 2026-11-08

Read FOUNDATION-REPORT.md, the installed Next.js page and Turbopack documentation, and actual source before editing.

## Scoped changes

- `postcss.config.mjs`: resolve the installed Tailwind PostCSS entry with a config-relative URL converted to a native absolute path. Node could resolve the package normally, but Turbopack's generated PostCSS worker failed with `Cannot find module '@tailwindcss/postcss'`. Using `require.resolve` inside the bundled config instead produced a Turbopack module identifier and attempted to bundle native addons; the URL approach avoids both failures. The explicit entry targets the currently installed Tailwind 4.3.3 package layout and should be reviewed if that dependency changes.
- `app/page.tsx`: keep `MicIcon` local; arbitrary named component exports are not valid App Router page exports. No imports of this export existed.
- `app/recipes/page.tsx`: require the props object and promised `searchParams`, removing the default argument that made the whole page argument optional. Empty-query behavior is preserved.
- `lib/recipe-pages.test.ts`: pass an explicit empty searchParams promise in the two direct page calls.

## Actual verification

- `npm test`: exit 1 before tests execute. Vite config loading fails in `externalize-deps`, with `Error: spawn EPERM` at `optimizeSafeRealPathSync`. No tests claimed as passed.
- `npx tsc --noEmit`: exit 0.
- `npm run build`: exit 1. Next.js 16.4.5 Turbopack reports `Compiled successfully`, then `Running TypeScript ...` and `spawn EPERM`. The original PostCSS resolution errors are gone. Production build completion remains unverified.
- `npx next build --webpack`: exit 1 during compilation with `Error: spawn EPERM`, errno -4048, syscall `spawn`. This environment does not reach Webpack's page export/type validation; those fixes are source-reviewed and standalone TypeScript-checked, not claimed as a successful Webpack build.
- `npx next typegen`: exit 0, route types generated successfully.
- `git diff --check`: no whitespace errors reported.

Remaining blocker: subprocess execution restrictions prevent the Vitest runner and production build workers from completing. Rerun tests and both build modes in an environment permitting those workers.

No dependency installation or upgrades, Git mutations, secrets edits, remote Alebex configuration changes, or provider calls were performed. Existing unrelated workspace changes were preserved. Recipe expansion is outside this build-only assignment; recipe data was not edited.
