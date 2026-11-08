# Recipe discovery review — 2026-11-08

## Resulting structure and navigation

- Primary navigation remains Home | My Recipes | Tools. No Collection navigation item was introduced.
- Homepage cuisine chips filter a single local preview row without navigation or reload. Categories come from the existing 50-recipe catalog, grouping `-inspired` labels and Italian-American under their displayed category without changing any recipe labels.
- All shows the existing five curated recipes. A cuisine shows up to eight deterministic matches in one horizontal row. Desktop fits five cards at wide widths, three on narrower screens; mobile uses touch-scrollable cards without page overflow.
- Show All opens `/recipes` with the selected cuisine query. It never opens My Recipes.
- Discovery has one search/query state, one cuisine selector, time and tag filters, sorting and reset. URL updates use same-document History API navigation; Back/Forward restore the query. Legacy cuisine aliases are normalized in the discovery UI/URL.
- Discovery defaults to “With photos first” to avoid starting with a wall of placeholders. Alphabetical, shortest and longest time remain available. No recipe metadata or nutrition estimates were invented.
- Shared cards expose the corresponding detail route and `Cook by Voice` with that recipe ID. Saving remains available on discovery cards. Detail pages, My Recipes, tools and voice internals are preserved.

## Image coverage and limitations

| Measure | Before | After |
| --- | --- | --- |
| Catalog recipes | 50 | 50 |
| Local dish photographs | 5 | 18 |
| Explicit placeholders | 45 | 32 |
| Newly verified/licensed photos | 0 | 13 |

The five original photographs were preserved. Thirteen matched Commons photographs were added with per-file source, author, license, license URL and transformation records. Attribution is publicly visible on their detail pages. Local image decoding and served-image HTTP checks passed. No new remote image dependency or paid API was introduced.

The 32 remaining placeholders are unresolved: searches returned no suitable dish match or Commons returned HTTP 429. A slower second sourcing pass was attempted after waiting; requests stopped when rate limiting returned. Unrelated or meat-containing substitutes were rejected. Existing review caveats remain for creamy chicken (source URL labeled pizza), bone-in curry vs boneless ingredients, and the precise tomato/potato stew preparation. Therefore 18 photographs does **not** mean 18 exact recipe preparations verified. See [full image audit](recipe-image-audit.md), `public/recipes/image-audit.json` and `public/recipes/SOURCES.md`.

## Verification

- `npx tsc --noEmit`: passed.
- `npm test`: 13 test files, 555 tests passed; zero failed.
- `npm run build`: passed using locked Next.js 16.4.5, including all 50 generated detail routes.
- `npm run test:catalog`: passed. Original 20 recipes' non-image content and ordering remain unchanged; all 50 remain valid.
- `node scripts/foundation-check.cjs`: passed, including mocked voice context payloads; no external voice call was made.
- `node scripts/discovery-ui.mjs`: passed in Chrome at desktop 1440px, tablet 768px and mobile 390px. Checked homepage cuisines and single-row geometry, no homepage reload, Show All URL and initialized selection, URL Back/Forward, search, sorting, reset/empty results, unknown cuisine, independent My Recipes, selected voice recipe ID, all 50 detail URLs and served images, and absence of horizontal page overflow/runtime exceptions.
- Desktop homepage and discovery screenshots, plus mobile discovery screenshots, were inspected. Default ordering was refined after seeing placeholder-only alphabetical results. Screenshot artifacts are in `/private/tmp/sous-discovery-checks/`.
- `git diff --check`: passed.

The installed dependencies initially lagged the existing lock file (Next.js16.4.0 vs16.4.5); `npm ci` synchronized them without altering dependency declarations or lock data. The project development server was restarted on localhost:3000 with16.4.5. Final checks use this version. Remaining tooling notices concern the existing untyped ESM Vitest config and an ignored parent-directory yarn.lock; they do not block checks.

No commit, push, pull, reset, rebase, merge or branch switch was performed. Secrets, environment files and ALEBEX internals were not edited.

## Modified / added files

- `app/globals.css`
- `app/page.tsx`
- `app/recipes/[id]/page.tsx`
- `app/recipes/page.tsx`
- `components/CuisineChips.tsx`
- `components/RecipeCard.tsx`
- `components/RecipeDiscovery.tsx`
- `components/RecipePhotoCredit.tsx`
- `docs/recipe-image-audit.md`
- `lib/recipe-discovery.test.ts`
- `lib/recipe-search.ts`
- `lib/recipes/README.md`
- `lib/recipes/catalog.ts`
- `lib/recipes/image-sources.json`
- `lib/recipes/image-sources.ts`
- `public/recipes/SOURCES.md`
- `public/recipes/beef-broccoli-stir-fry.jpg`
- `public/recipes/chickpea-spinach-curry.jpg`
- `public/recipes/homemade-tacos.jpg`
- `public/recipes/image-audit.json`
- `public/recipes/lemon-herb-chicken.jpg`
- `public/recipes/lentil-vegetable-soup.jpg`
- `public/recipes/miso-soup.jpg`
- `public/recipes/mushroom-risotto.jpg`
- `public/recipes/roasted-tomato-soup.jpg`
- `public/recipes/sesame-tofu-noodles.jpg`
- `public/recipes/shakshuka.jpg`
- `public/recipes/spaghetti-pomodoro.jpg`
- `public/recipes/teriyaki-salmon.jpg`
- `public/recipes/vegetable-fried-rice.jpg`
- `scripts/catalog-gate.cjs`
- `scripts/discovery-ui.mjs`
- `scripts/foundation-check.cjs`
- `docs/recipe-discovery-review.md`
