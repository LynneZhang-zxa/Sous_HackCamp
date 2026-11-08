# SOUS Access implementation and verification

Date: 2026-11-08. This extends the existing application; the recipe catalog, photos, discovery, saving and ALEBEX provider remain in place.

## Completed

- The recipe-search / voice entry is a viewport-fixed bottom composer on browsing pages. Cooking uses a fixed guidance-control dock instead. Neither scrolls away with page content. A measured bottom clearance, safe-area inset and visual-viewport handling keep the last content reachable and the composer above the keyboard where supported. The development badge was disabled because it overlapped the narrow-screen input.
- Settings now opens an optional **SOUS Access** dialog. All six preferences are independent: voice-first guidance, one action at a time, simplified instructions, large text/high contrast, slower pacing and reduced touch. Only whitelisted booleans are saved locally; corrupt/unavailable storage is handled. No diagnosis is requested. Reset restores normal mode.
- Screen-reader / keyboard foundations: skip link; main landmarks; route headings receive focus once the destination is ready; no focus change for cuisine/query edits; meaningful voice-action link names; Tab/Shift+Tab dialog containment; Escape/close returns focus; Tools supports keyboard opening and Escape; visible focus styling; current-step indication; labeled progress and timers; error and confirmation announcements.
- Adaptive instructions reuse the original recipe. A deterministic splitter separates sentences and clear imperative clauses, while keeping leading conditions, ingredient lists and short shared-object clauses together. Quantities, temperatures and safety requirements are preserved. Some compound instructions intentionally remain together when splitting would detach context; this is a conservative action segmenter, not a linguistic guarantee of one verb per action.
- Each session can track original step plus action index, preferences, paused guidance and the current assistance choice. Screen and voice tools use the same transition functions. Next completes the current action before advancing the source step; previous moves back by an action across boundaries. Repeat, explanation, recipe/ingredient review, remaining-step review and timer queries do not advance. Switching preferences preserves the original step and action location.
- Pause/resume guidance, microphone mute, active timers and hot cookware are explicitly distinguished. Paused guidance blocks next/back/jump. Timers retain their absolute end times. Slower guidance means shorter responses and waiting for a reply, **not a configurable TTS playback rate**.
- Cooking controls include repeat, pause/resume, next, microphone mute/unmute when connected, voice ending, explicit new-session recovery and keyboard timer creation/cancellation. Reduced-touch shortcuts are Alt+Shift+Right/Left, R and P. They do not intercept text editing, modifier combinations used by the browser, or settings dialogs.
- An on-screen guidance start uses the existing session store and tool routes without starting an ALEBEX call. It is a useful keyboard/screen-reader path when microphone or voice service access is unavailable.
- Recovery uses session-scoped credentials in sessionStorage, a 12-hour client/server age bound and recipe/secret validation. A fresh voice connection can use the same confirmed cooking state; this does not resurrect the old audio connection. Missing, invalid, expired or cross-recipe recovery is rejected with an explicit new-session path. Current step/action, servings, substitutions, timers and preferences survive valid recovery.
- Physical-task assistance is limited to bounded, reviewed suggestions: lifting, unreadable measures, using one hand, hot-water handling, knives, raw food, uncertain doneness and reported smoke/fire. Assistance pauses guidance, preserves recipe facts and lets the cook accept or decline. Acceptance records a choice; it does not silently replace a cooking procedure or verify that the action is safe.

## Voice integration and partial / unverified items

The seven existing ALEBEX tools are retained. `access_guidance` is the eighth, staying within the provider limit. It manages pause/resume/repeat, explanations and reviews, optional preference changes and bounded assistance. Context includes current interaction preferences and action position, while the knowledge base remains the exact selected recipe. Tool results preserve original instructions, safety notes and scaled ingredients. Screen confirmations can be sent through existing call events; microphone state is tracked separately from speaking status. Polling and timer state continue after voice disconnection.

`AGENT_PROMPT` and the existing `scripts/create-agent.ts` configuration path contain the new adaptive guidance rules. No remote agent was created, updated or published during this task. An already deployed agent does not automatically inherit a changed local prompt: publish/review that existing agent configuration before claiming the new prompt behavior in a live demo. Runtime custom tools and returned preferences are supplied per call, but actual ALEBEX interpretation, audio turn-taking, pause/continue recognition and spoken pacing remain unverified in a live call.

Limitations:

- No paid AI/voice call was made. Voice error and recovery paths were tested with mocks, not real microphone speech or provider audio.
- No fully voice-controlled recipe selection before a session is implemented. The bottom microphone entry opens cooking; it does not silently start recording or recognize browsing commands.
- Simplification is a bounded glossary plus clear action segmentation. It does not generate arbitrary rewritten recipes. Unknown terms return an honest fallback. General motor accommodations do not invent new cooking techniques.
- Actual TTS speed is not controlled. Slower pacing is guidance behavior, not audio resampling.
- Chrome keyboard interactions and the browser accessibility tree were inspected; VoiceOver/NVDA/JAWS auditory output and evaluation by people with disabilities were **not** performed. No WCAG conformance certification or real-world impact statistics are claimed.
- Mobile results are browser viewport tests, not physical-device keyboard/assistive-hardware tests.
- Recovery requires this browser tab's credential and an available existing session. A lost in-memory server session cannot be recreated from an expired credential. Old transcripts and a disconnected audio stream are not restored.
- Screen/voice updates are serialized within the current server process. The existing optional Supabase mirror was reused without a schema migration; cross-instance transactional concurrency is not claimed.
- Ending voice does not automatically cancel cooking timers or turn off appliances. No camera, sensor or kitchen-control capability was added.

## Verification results

- `npx tsc --noEmit`: passed.
- `npm test`: **15 files / 675 tests passed, zero failed**. Includes all 50 recipes in normal/adaptive behavior checks, source-preserving action segmentation, preferences/storage, repeat and pause/resume, original-step boundaries, quantities/safety, preferences during a session, session/recipe validation, recovery, tool concurrency and mocked ALEBEX requests.
- `npm run build`: passed on locked Next.js 16.4.5, including all 50 recipe detail routes and the new on-screen session endpoint.
- `npm run test:catalog`: passed; original recipe content/order and valid assets remain intact.
- `node scripts/foundation-check.cjs`: passed, including offline voice payload compatibility.
- `node scripts/discovery-ui.mjs`: passed; homepage cuisine filtering, single-row layout, Show All, URL/history, search/sorting/reset, independent My Recipes, 50 detail routes and images, correct cooking recipe context and responsive layout remain functional.
- `node --import tsx scripts/accessibility-ui.mjs`: passed in real Chrome with all cooking/voice API writes intercepted by local mocks. Covers fixed composer position across scroll, Tab-reachable Settings, Enter/Space activation, modal focus and return, persisted/reset preferences, route focus, keyboard cuisine/recipe selection, action progression, repeat, pause/resume, reload recovery, assistance acceptance, manual timer creation, mid-session preference changes, mocked connection errors, expired-session fallback, four viewport widths (1440/768/390/320), 200% root text sizing and accessibility-tree landmarks/names. Recorded **1 mocked voice request, 12 mocked tool requests, 0 external paid calls**.
- Screenshots inspected for desktop accessible cooking and narrow-screen composer; mobile and high-contrast screenshots were also generated. Artifacts: `/private/tmp/sous-access-checks/`.
- `git diff --check`: passed.

Issues found and fixed during self-check: native dialog Tab traversal could pass to the document; destination heading focus raced Next route rendering; large-text mobile headers and footer buttons overflowed; step summaries could shrink to zero width; microphone controls overflowed at enlarged text; a legacy navigation selector hid mobile Settings; the development badge covered the composer; restoring without credentials could otherwise have silently started a new session; first-instruction pause/resume could redeliver the first action. Keyboard tests also now await confirmed asynchronous operations before issuing the next command.

Existing non-blocking tooling notices concern the untyped ESM Vitest configuration and an ignored parent-directory yarn.lock.

## Activating the features

1. Open **Settings → SOUS Access** from the regular navbar or cooking header.
2. Enable any options independently. Large text/high contrast applies immediately; interaction changes do not reset cooking progress.
3. Choose any recipe and use its existing **Cook by Voice** link to preserve the selected recipe ID.
4. On cooking, use the microphone to start the configured ALEBEX call, or choose **Use on-screen guidance · no voice call**.
5. Use the bottom controls or keyboard navigation. Enable Reduced touch for the displayed shortcuts. **Instruction help & safe adaptations** includes recipe/ingredient review, terminology, timer creation and bounded assistance.

## Repeatable hackathon demonstration without paid calls

Use `/recipes/miso-soup`, open Settings, enable One action at a time, Simplified instructions, Large text/high contrast and Reduced touch. Follow Cook by Voice to the correct recipe, then choose the explicitly labeled on-screen option. Advance one action with Alt+Shift+Right; repeat without moving; pause, confirm Next is unavailable, and resume. Create a 1.5-minute timer in the help panel; toggle a preference and show that its end time and cooking position are unchanged. Request help lifting a pan, accept/decline without changing the recipe, then resume explicitly. Reload and select Resume on-screen session to show recovery at the confirmed action. Finish by resetting preferences to demonstrate normal mode.

This demonstrates actual adaptive state and keyboard/screen-reader affordances. A live voice version of the same journey requires the existing ALEBEX setup and a separately authorized live test. No reduction in touch counts or independent-cooking success rate is asserted without user evaluation.

## Safety and implementation references

- The existing selected recipes remain the source for food quantities, temperatures, timers and food-safety requirements.
- Bounded equipment/measurement suggestions are informed by [RNIB's accessible cooking resources](https://www.rnib.org.uk/living-with-sight-loss/independent-living/cooking/) and [home assistive technology guide](https://www.rnib.org.uk/living-with-sight-loss/assistive-aids-and-technology/everyday-tech/using-technology-at-home/).
- Fire-related responses follow the limited safety principles in [U.S. Fire Administration cooking guidance](https://www.usfa.fema.gov/gallery/pictographs/cooking.html) and [CPSC's Recipe for Safer Cooking](https://www.cpsc.gov/safety-education/safety-guides/home-fire/recipe-safer-cooking): do not move burning cookware or use water on a grease fire; leave danger and contact local emergency services when unsafe. The application cannot assess a fire.
- Provider behavior was checked against the repository's ALEBEX integration contract and [ALEBEX voice prompting guide](https://app.alebex.ai/alebex-voice-prompting-best-practices.md). Relevant installed Next.js16.4.5 docs were read before editing client/provider and development-indicator behavior.

## Files created or modified in this accessibility pass

Earlier uncommitted recipe-discovery and image work is retained. The accessibility changes touch:

- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/recipes/page.tsx`
- `app/recipes/[id]/page.tsx`
- `app/collection/my-recipes/page.tsx`
- `app/tools/page.tsx`
- `app/api/call/start/route.ts`
- `app/api/session/route.ts` (new)
- `app/api/tools/route.ts`
- `components/Nav.tsx`
- `components/RecipeCard.tsx`
- `components/VoiceComposer.tsx` (new)
- `components/access/AccessProvider.tsx` (new)
- `components/access/AccessSettings.tsx` (new)
- `components/access/RouteAccessibility.tsx` (new)
- `components/access/ToolsMenu.tsx` (new)
- `components/cook/CookScreen.tsx`
- `components/cook/MicButton.tsx`
- `components/cook/StepPanel.tsx`
- `components/cook/VoicePanel.tsx`
- `components/voice/useVoiceCall.ts`
- `lib/access-preferences.ts` (new)
- `lib/adaptive-instructions.ts` (new)
- `lib/cooking-recovery.ts` (new)
- `lib/session.ts`
- `lib/store.ts`
- `lib/agent-config.ts`
- `lib/access.test.ts` (new)
- `lib/access-api.test.ts` (new)
- `scripts/accessibility-ui.mjs` (new)
- `scripts/discovery-ui.mjs`
- `next.config.ts`
- `docs/sous-access-review.md` (new)

No dependency, environment, secret, authentication, recipe-dataset or image-asset changes were made in this pass. No Git commit, push, pull, reset, rebase, merge or branch switch was performed.
