# Requirements recheck — 2026-11-08

Read FOUNDATION-REPORT.md, prior repair reports, overnight execution status and gate stdout/stderr under `.overnight-runs/20261108-022104`, and actual recipe, listing/detail, collection, search, saved, call-start and voice source before editing.

## Repair

`components/SavedRecipes.tsx` now clears a stale storage error after a successful refresh. Added `lib/saved-recipes-ui.test.ts`, exercising the actual component effect and click handler with mocked React hooks and browser storage/events: initial loading, save, external changes, read failure/recovery, write failure/retry and listener cleanup. These mocks do not verify browser hydration or real cross-tab delivery.

## Current verification

- `npm test`: exit 0, 10 files, 544 tests passed after repair.
- `npx tsc --noEmit --incremental false`: exit 0 after repair.
- `node scripts/catalog-gate.cjs`: passed using actual `listRecipes()`: exactly 50 unique complete recipes, original 20 records and ordering unchanged; assets, linked ingredients, timing, safety and nutrition metadata checked. No further catalog expansion needed.
- `node scripts/foundation-check.cjs`: passed for all 50 records, search, combined filters, sorting, saved serialization and mocked payloads.
- `node scripts/recipe-integration-check.cjs`: passed all 50 listing/detail/cook selections, combined search, rendered favorites collection, mocked call-start IDs, default selection and invalid-ID handling.
- `node scripts/voice-context-check.cjs`: passed all 50 selected-recipe knowledge payloads and 211 steps, navigation, tips/safety, ingredient references, timers, servings, substitutions, finished state and recipe/session mismatch rejection. Largest tested context 2,661/4,000 characters. No provider calls.

## Remaining blockers

- `npm run build`: exit 1, `Compiled successfully in 1196ms`, then `Running TypeScript ...` and `spawn EPERM`. Production build is NOT verified. Overnight gate-2 stdout contains a historical completed build, but it does not establish success in this run.
- Diagnosis: a minimal `spawnSync(process.execPath, ['--version'])` returns `status: null`, code `EPERM`, syscall `spawnSync C:\Program Files\nodejs\node.exe`. Installed Next.js type-check code uses its TypeScript CLI path; prior documented worker/API alternatives also failed. No type-check bypass, dependency change or repeated build trial was introduced.
- `npm run dev -- --hostname 127.0.0.1 --port 3100`: `Error: spawn EPERM`, errno -4048, from `next/dist/cli/next-dev.js:393:45`. HTTP route behavior remains unverified in this run.
- Direct Playwright Chromium launch: `Executable doesn't exist at C:\Users\L\AppData\Local\ms-playwright\chromium_headless_shell-1248\chrome-headless-shell-win64\chrome-headless-shell.exe`. No download/install attempted. Real browser persistence, cross-tab behavior, mobile layout and keyboard verification remain pending.
- Remote agent prompt/configuration and live audio/interruption/tool synchronization remain unverified. Remote edits and paid calls were prohibited and were not attempted.

Every assigned independent requirement was checked despite the build failure. No Git mutations, secret or environment-file changes, new dependencies, authentication, databases or paid calls.
