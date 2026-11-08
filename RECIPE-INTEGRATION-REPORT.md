# Recipe integration verification — 2026-11-08

Read FOUNDATION-REPORT.md and inspected the actual catalog, discovery, saved recipe UI, navigation, detail/cook routes, voice hook and call-start endpoint before editing. The existing catalog already contains exactly 50 recipes; no duplicate expansion was needed. Original 20 recipes remain unchanged, verified by the catalog gate.

Added direct Cook by Voice links to saved Collection entries, carrying each entry's encoded recipe ID. Existing Home/Tools/Collection navigation and homepage cleanup are preserved. Added favorites tests for every ID and removal from the complete 50-entry collection.

Added `node scripts/recipe-integration-check.cjs`, using Next's existing bundled Babel to execute actual TS/TSX modules without child workers. It renders the listing and all 50 detail pages, checks generated static params, checks all 50 cook selections, renders Collection with all 50 saved IDs, checks detail and voice links, exercises combined search and complete collection serialization/removal, and executes the actual call-start handler for every selected ID with mocked storage and Alebex functions. It checks default cook selection and invalid detail/cook/call-start IDs, including prototype-like values. Collection hook state is supplied by a test stub; this is not browser persistence or click testing. No external requests occur.

Verification:

- `npm run test:catalog`: PASS, 50 complete unique recipes, original 20 unchanged.
- `node scripts/foundation-check.cjs`: PASS, all 50 shared search/filter/sort, favorites and call payload checks.
- `node scripts/recipe-integration-check.cjs`: PASS, all 50 actual page selections and mocked call-start IDs, Collection links, default cook and invalid-ID handling.
- `npx tsc --noEmit`: PASS, including after final changes.
- `git diff --check`: PASS; existing catalog/package line-ending warnings only.
- `npm test`: BLOCKED before test execution. Vite config loading fails in `externalize-deps`, `optimizeSafeRealPathSync`, with `Error: spawn EPERM`. Added Vitest assertions are not claimed as executed.
- `npm run build`: INCOMPLETE. `Compiled successfully in 901ms`, then `Running TypeScript ...` and `spawn EPERM`, exit 1.
- `npm run dev -- --hostname 127.0.0.1`: BLOCKED, `spawn EPERM` in Next's `startServer` child-process fork, exit 1. Browser/HTTP tests cannot run against this server.

Remaining checks: runtime HTTP 404s, browser favorite click/reload/cross-tab behavior, responsive layout and live audio. Offline notFound assertions validate page behavior under a mock, not HTTP responses. No paid calls, remote Alebex edits, secret/env edits, dependency additions/upgrades, authentication, databases, or Git mutations were performed. Existing live voice configuration limitations documented in FOUNDATION-REPORT.md remain outside this recipe integration change.
