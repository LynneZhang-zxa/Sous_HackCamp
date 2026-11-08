# Foundation regression completion — 2026-11-08

Read FOUNDATION-REPORT.md and inspected the actual catalog, recipe types, listing/detail/cook pages, navigation, homepage, Collection, saved-data helpers, voice hook, call-start handler and existing verification scripts before editing. Used the existing Stage A directive in overnight-task.md; no Stage B features were added.

## Changes in this pass

- Made the existing Vitest configuration compatible with native ESM loading using a config-relative file URL. Configured its supported thread pool and native config loader in test scripts. No packages were installed or upgraded, and no assertions were disabled. The original bundled config loader and fork workers both failed with `spawn EPERM`; native loading and threads execute the real suite successfully.
- Running the suite exposed 31 pre-existing assertion failures: 30 added recipe records failed recipe structure checks, and the cook render assertion compared an unescaped apostrophe with HTML. Fixed the render assertion to compare React-escaped title text.
- Added explicit, instruction-reviewed ingredient links to all 30 added recipes, so current-step quantities are available through existing session tools. Split ten three-step recipes into separate finishing and serving steps, giving every recipe at least four steps. Preserved safety text. Normalized slice/stalk quantities to the established count-unit convention with explanatory notes.
- Strengthened the offline catalog gate to require four steps, supported units and coverage of every ingredient by a step. The original 20 records and order remain byte-for-byte equivalent to the saved JSON snapshot. Catalog count remains exactly 50; no new recipes were needed or added in this pass.
- Preserved homepage, navigation, UI styling, storage architecture and WebSocket/audio implementation.

## Stage status

| Stage | Current result |
| --- | --- |
| 1: Recipe stabilization | All 50 listing/detail/cook selections and invalid-ID behavior pass component and mocked integration checks; HTTP 404s remain unverified. |
| 2: Navigation | Existing Home/Tools/Collection preserved; navigation render tests pass; keyboard/browser checks pending. |
| 3: Homepage and Collection | Existing restructuring preserved; render tests pass; visual checks pending. Tools and Uploaded/Recently Cooked remain honestly coming soon. |
| 4: Recipe expansion | Complete at 50 unique recipes, including 30 prior additions now repaired for ingredient links/structure; original 20 unchanged. Not kitchen-tested. |
| 5: Search and filters | Shared search/filter/sort tests and offline combined-query checks pass. |
| 6: Favorites | Data round trips, duplicates, invalid IDs, removal and Collection links pass. Actual localStorage clicks/reload/cross-tab behavior remains unverified. |
| 7: Universal voice | All 50 selected IDs, 211 steps, ingredients, session navigation, servings, substitutions and recipe payloads pass mocked/offline checks. Live agent guidance remains unverified. |
| 8: Regression | TypeScript and full unit suite pass; production build and local server remain blocked as below. Foundation quality gate remains incomplete. |

## Final verification

| Command | Actual result |
| --- | --- |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm test` | PASS, exit 0: 9 files, 542 tests |
| `npm run test:catalog` | PASS: 50 complete unique recipes, original 20 unchanged, including stronger step/ingredient/unit checks |
| `node scripts/foundation-check.cjs` | PASS: 50 records, assets, search/filter/sort, saved-data logic, mocked payloads |
| `node scripts/recipe-integration-check.cjs` | PASS: actual page rendering/selections, Collection links, default/invalid IDs and mocked call-start for all 50 |
| `node scripts/voice-context-check.cjs` | PASS: 50 recipes, 211 steps; max context 2661/4000; no external calls |
| `npm run build` | INCOMPLETE, exit 1: `Compiled successfully in 1024ms`, then `Running TypeScript ...` and `spawn EPERM`. This is not a passed production build. |
| `npm run dev -- --hostname 127.0.0.1` | BLOCKED, exit 1: `spawn EPERM`, errno -4048, at Next's `startServer` child-process fork. Also reports a pre-existing non-standard NODE_ENV value; environment was not changed. |
| `git diff --check` | PASS; line-ending normalization warnings only |

Initial `npm test` failed before execution at Vite `externalize-deps` / `optimizeSafeRealPathSync` with `spawn EPERM`. Native config loading first exposed `__dirname is not defined in ES module scope`; the config-relative URL fixes that. Native loading with fork workers then produced nine worker startup errors (`spawn EPERM`). Native loading with threads ran 542 tests, initially 31 failed and 511 passed; after the fixes, all 542 pass through the ordinary npm test script. Node emits a harmless module-type detection warning for the existing .ts config; package module semantics were preserved.

No browser could be verified against the failed local server. Offline render assertions are not runtime HTTP or browser evidence. Next's successful compilation does not establish successful type-worker execution or production prerendering.

## Files changed by this pass

- `lib/recipes/catalog.ts`
- `lib/cook-screen.test.ts`
- `lib/recipe.test.ts` (test description updated to 50)
- `scripts/catalog-gate.cjs`
- `vitest.config.ts`
- `package.json` (test commands only)
- `FOUNDATION-REPORT.md` (current-results pointer)
- `FOUNDATION-REGRESSION-REPORT.md`

Temporary review helper and captured test log created by this pass were removed after use. TypeScript/build commands may refresh existing generated artifacts. Other pre-existing workspace changes were preserved; package-lock.json was not edited by this pass.

## Remaining limitations and preparation

Run the production build and browser checks in an environment permitting Next's workers. Verify all 50 HTTP detail routes and invalid 404s, keyboard navigation, mobile overflow, favorites save/remove/reload/cross-tab and storage errors. Keep Stage B on hold until those foundation checks are complete.

The existing agent prompt still includes recipe-specific chicken guidance and visual doneness language. No prompt was authored or edited, and no remote agent configuration was touched. Retrieve the required prompting guide before changing prompt content, then review live recipe separation, food safety, substitutions, step synchronization and audio interruptions under a separately authorized live test. No paid provider calls, secrets/env changes, authentication, new databases, dependency changes or Git mutations were performed.
