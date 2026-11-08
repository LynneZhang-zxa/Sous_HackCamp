# Local universal voice recipe audit — 2026-11-08

Read FOUNDATION-REPORT.md and inspected the catalog, recipe lookup/formatting, cook selection, voice hook, call-start route, session transitions and agent configuration before changing code. Catalog remains exactly 50 recipes; no recipe expansion was needed. Original 20 recipes remain unchanged.

## Findings and minimal fixes

- Chicken alone used a separate hard-coded knowledge base instead of its canonical recipe. That text asserted no nuts, eggs, soy or shellfish and no gluten, used clear juices/no pink as doneness advice, and offered fixed chicken substitution timings. Removed that obsolete constant. Every call now carries exactly `JSON.stringify(selectedRecipe)`, including its ingredients, ordered instructions, tips and safety fields. No chicken-specific knowledge is injected into other recipes.
- No selected-ID routing bug reproduced across all 50 recipes. Actual listing/detail/cook selection, hook request body, call-start session ID and returned recipe agree in offline checks. Added recipe ID to caller context and reject a recipe/session mismatch rather than silently constructing inconsistent context.
- Caller context rounded a 90-second timer to two minutes. It now preserves the minute/second remainder. Timer tool logic was unchanged.
- All 201 steps retain their canonical instructions, titles, timer durations, tips and safety in the knowledge payload and tool results. Declared step ingredient names resolve to the selected recipe. First/next/previous/jump/current/finished states were checked for every recipe. Checked scaled ingredient descriptions at one, base and twelve servings; largest tested caller context was 2,661 of 4,000 characters.

## Verification

- PASS: `node scripts/voice-context-check.cjs` — all 50 knowledge payloads, 201 steps, declared ingredient mappings, navigation, safety/tip preservation, servings, substitutions, finished state and mismatched-ID rejection. The first run failed because the assertion expected the word “thirty”; the existing number formatter emits `30`. Corrected that assertion and reran successfully.
- PASS: `node scripts/recipe-integration-check.cjs` — actual local page functions, all 50 hook request IDs, mocked call-start responses, canonical knowledge payloads, invalid selections and malformed bodies. Provider/session storage are mocked; hook execution stops at a mocked failed response before microphone or WebSocket setup.
- PASS: `node scripts/foundation-check.cjs` and `node scripts/catalog-gate.cjs` — 50 recipes, original 20 unchanged, catalog/assets and existing offline regressions.
- PASS: `npx tsc --noEmit --incremental false` and `git diff --check`.
- BLOCKED: `npm test` fails before executing tests: Vite config loading reports `[plugin externalize-deps] Error: spawn EPERM`. Updated Vitest assertions exist but are not claimed passed.
- INCOMPLETE: `npm run build` reports successful production compilation, then `Running TypeScript ... spawn EPERM`. This is not a successful production build.

## Remaining limitations and exact blockers

The required prompting guide at `https://app.alebex.ai/alebex-voice-prompting-best-practices.md` could not be read: web open reported “not accessible via this tool”; PowerShell Invoke-WebRequest failed receiving the connection; curl exited 7, “Failed to connect to app.alebex.ai:443 over proxy 127.0.0.1”. Accordingly, no agent prompt was written or edited. The existing local `AGENT_PROMPT` still says “Chicken is done at one hundred sixty-five degrees with no pink inside.” This remains unsafe visual-doneness wording and chicken-specific content in the agent template. Remote prompt contents were neither inspected nor changed; local recipe knowledge cannot guarantee that a remotely configured agent will follow it.

The checks prove source/payload consistency, not independently validated culinary or allergen safety. Some catalog steps omit optional per-step ingredient metadata; their tool result correctly has an empty per-step list while the full recipe ingredients remain in context/knowledge. Scaling updates ingredient descriptions, but canonical instruction prose still contains base-batch quantities, divisions and serving counts. This existing limitation remains relevant when asking voice to scale a recipe; instruction prose is not automatically rewritten. Static ingredient notes such as “about one pound” also remain base-recipe notes when quantities scale.

No live voice or browser audio verification was performed. No paid provider calls were made. Alebex audio, WebSocket implementation, tools, remote agent configuration, keys, environment files, dependencies and recipe records were left untouched by this audit. No Git mutation commands were used. Existing unrelated workspace changes were preserved.

## Files edited by this audit

`lib/agent-config.ts`, `lib/agent-config.test.ts`, `lib/call-start-recipe.test.ts`, `scripts/foundation-check.cjs`, `scripts/recipe-integration-check.cjs`; added `scripts/voice-context-check.cjs` and this report.
