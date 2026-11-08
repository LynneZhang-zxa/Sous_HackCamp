# SOUS — Foundation-First Development Directive

This directive supplements and takes priority over the existing SOUS Overnight Full-Stack Development Master Plan wherever priorities conflict.

## Development Strategy

We are intentionally developing SOUS in two stages.

**Stage A — Tonight: Perfect the Core Foundation**

Focus exclusively on building a robust, polished, maintainable cooking application.

**Stage B — Tomorrow: Accessibility & Community Impact**

We will later extend SOUS to support users with visual impairments and motor accessibility needs.

Do not implement Accessibility Mode, disability-specific AI guidance, or additional accessibility-specific product features during Stage A.

However, all code written tonight must remain compatible with future accessibility enhancements.

## Tonight's Priorities

Prioritize the following in order:

1. Complete and stabilize All Recipes and Recipe Detail Pages.
2. Implement the agreed homepage/navigation restructuring.
3. Preserve and improve existing Voice Cooking functionality.
4. Ensure the selected recipe correctly propagates to the cooking session.
5. Implement functional search and supported filters.
6. Implement Saved Recipes and the dedicated Collection page.
7. Polish responsive design, error handling, and loading states.
8. Run thorough tests and fix regressions.

Recipe library expansion from 20 to 50 is lower priority than functional correctness and overall stability.

Do not sacrifice testing or code quality to reach an arbitrary recipe count.

## Engineering Expectations

Before implementing each feature:

- Inspect the existing implementation and dependencies.
- Identify the smallest maintainable solution.
- Reuse current models, utilities, and components.
- Consider edge cases and failure scenarios.
- Avoid unnecessary architectural complexity.

After implementing each feature:

- Run relevant tests.
- Check for regressions.
- Review the implementation for duplication and unnecessary complexity.
- Fix discovered defects before proceeding.
- Maintain consistent visual design.

Do not mistake a successful TypeScript compilation for a fully functioning feature.

## Future Accessibility Compatibility

Without implementing the future accessibility product features yet:

- Use semantic HTML and accessible labels.
- Preserve keyboard navigation.
- Maintain clear component boundaries between recipe data, cooking state, and voice presentation.
- Avoid coupling voice instructions to fixed UI text.
- Avoid hardcoding a single recipe into new components.
- Keep interface components reusable and adaptable.

These are foundational engineering requirements, not authorization to build tomorrow's features.

## Quality Gate

The foundation is considered ready only when:

- All existing recipes have working detail pages.
- Navigation works consistently.
- Search and supported filters return correct results.
- Saved Recipes behaves consistently and persists as designed.
- Selected recipes enter the correct cooking flow.
- Existing Voice Cooking functionality has not regressed.
- Invalid inputs and missing data are handled gracefully.
- Existing tests, TypeScript checks, and production build pass.
- Any unverified live Voice AI behavior is explicitly reported.

Do not fabricate test results or describe incomplete functionality as finished.

## Autonomy and Git Safety

Continue implementing feasible tasks within the existing authorized workspace, following the original master plan's security restrictions.

Do not commit, push, pull, reset, rebase, merge, or switch Git branches.

Do not change secrets or environment variables.

Do not make real paid AI calls during automated tests.

Document blockers instead of bypassing security controls.

## Final Deliverable

Provide a structured report containing:

- Completed features
- Partially completed features
- Tests passed and failed
- Remaining defects or limitations
- Changed files
- Unverified live integrations
- Recommended preparation for tomorrow's Accessibility phase

**The objective is not to maximize the number of features. It is to deliver the strongest, most reliable foundation for tomorrow's accessibility-focused SOUS Hackathon project.**
# SOUS — Overnight Full-Stack Development Master Plan

## Mission

You are continuing development of **SOUS**, a long-term, full-stack, AI-powered cooking application.

SOUS is a voice-first cooking companion designed around the principle:

**"Cooking is hands-on, so your cooking assistant should be hands-free."**

Your mission is to inspect the current repository, preserve existing working functionality, and implement the development phases below in sequence.

This is a real, maintainable product, not a disposable hackathon prototype.

**Work autonomously until all feasible tasks are complete. Do not stop after planning. Do not stop after completing only one phase.**

---

# 0. Autonomous Execution Rules

The user will be away from the computer.

Operate independently within the authorized project workspace.

You should:

1. Inspect the repository before making changes.
2. Identify already completed functionality.
3. Avoid duplicating existing implementations.
4. Create a practical internal implementation plan.
5. Execute tasks sequentially.
6. Make reasonable engineering decisions independently.
7. Write maintainable, reusable TypeScript and React code.
8. Run tests after each significant phase.
9. Fix errors introduced by your changes.
10. Continue to the next phase after successful verification.
11. Document blockers and continue independent work where possible.
12. Produce a complete final development report.

Do not request confirmation for ordinary implementation decisions.

Do not stop merely because one test fails. Investigate, fix, and rerun it when feasible.

Do not fabricate test results or claim functionality is working without verification.

## Hard Restrictions

- Do not commit or push code.
- Do not create, switch, reset, rebase, pull, or merge Git branches.
- Do not modify environment variables or secrets.
- Do not expose API keys.
- Do not delete unrelated files.
- Do not introduce authentication or payment functionality.
- Do not add unnecessary dependencies.
- Do not create new databases or backend services without explicit authorization.
- Do not perform destructive operations.
- Do not access external services without authorization.
- Do not make real paid AI API calls during automated testing.
- Do not redesign unrelated UI components.
- Do not modify working functionality without a clear reason.

If an action requires additional permissions, credentials, external network access, or unsafe changes, do not bypass security controls. Record the blocker and continue with independent tasks.

---

# 1. Repository Audit and Phase 2 Stabilization

First inspect the actual project structure and current implementation.

Pay special attention to:

- `lib/recipe.ts`
- `lib/recipes/catalog.ts`
- `app/page.tsx`
- `app/cook/page.tsx`
- `app/api/call/start/route.ts`
- `components/voice/useVoiceCall.ts`
- `components/Nav.tsx`
- `components/FoodTile.tsx`
- Existing recipe components
- Existing tests
- Existing image assets
- Existing storage and Supabase integration

Treat the repository as the source of truth.

Phase 2 may already be partially or fully implemented. Do not rebuild completed functionality unnecessarily.

## 1.1 All Recipes

Verify and complete `/recipes`.

Requirements:

- Use the centralized recipe collection through `listRecipes()`.
- Display all available recipes.
- Display title, cuisine, cooking time, and supported metadata.
- Use existing recipe images.
- Use the existing placeholder for missing images.
- Provide responsive desktop, tablet, and mobile layouts.
- Make recipe cards accessible and clickable.
- Provide appropriate empty and error states.
- Follow the existing SOUS design system.

## 1.2 Recipe Detail

Verify and complete `/recipes/[id]`.

Use `getRecipe(id)`.

Each detail page must display available information:

- Recipe title and image
- Description
- Cuisine and tags
- Preparation time
- Cooking time
- Total time
- Servings
- Complete ingredients with quantities, units, and notes
- Ordered cooking instructions
- Step durations, tips, and safety notes where available
- Estimated nutrition only when explicitly marked as estimated
- Cook by Voice entry point
- Navigation back to All Recipes

Use existing ingredient formatting utilities.

Invalid IDs must return a proper Next.js 404.

## 1.3 Existing Voice Recipe Selection

Verify:

- `/cook?recipeId=<id>` selects the intended recipe.
- The Cooking page displays the selected recipe before starting.
- `useVoiceCall().start(recipeId)` receives the selected ID.
- `/api/call/start` receives the correct recipe ID.
- Invalid IDs never silently start the default recipe.
- `/cook` without a recipe ID retains its existing behavior.

Do not modify Alebex internals during this stabilization phase.

## 1.4 Existing Homepage Regression

Ensure that existing homepage functionality, navigation, recipe data, and working Voice Cooking behavior remain intact until the planned homepage restructuring begins.

---

# 2. Homepage Navigation & Layout Restructuring

Restructure the homepage navigation without replacing the established SOUS visual identity.

## 2.1 Primary Navigation

The final primary navigation should be:

**Home | Tools | Collection**

Behavior:

- Home → `/`
- Tools → Access to What Can I Cook?, Upload Recipe, and History
- Collection → My Recipes → `/collection/my-recipes`

Also preserve:

- Search control
- Settings icon next to Search
- Existing logo and branding
- Existing footer where appropriate

Use accessible navigation controls and appropriate keyboard interactions.

Preserve the existing search behavior until Phase 3 implements working search.

Do not create nonfunctional destinations that appear fully implemented.

## 2.2 Tools

Organize the following features under Tools:

- What Can I Cook?
- Upload Recipe
- History

Reuse existing routes and components where available.

If a feature is not implemented, preserve or provide an honest Coming Soon state.

Do not invent working functionality during this phase.

## 2.3 Collection

Collection must provide access to My Recipes.

My Recipes must navigate to:

`/collection/my-recipes`

Use the existing design language.

---

# 3. Homepage Cleanup

## 3.1 Remove Duplicate Tool Cards

Remove standalone homepage cards for:

- What Can I Cook?
- Upload Recipe

These features remain accessible under Tools.

Do not delete their underlying implementations or navigation targets.

Remove empty grid columns or unnecessary wrappers.

## 3.2 Remove Standalone Voice Cooking Card

Completely remove the existing homepage feature card titled:

**Start Cooking with Voice**

Remove its:

- Large microphone illustration
- Tap to Wake interaction
- Hey Chef text
- Standalone card container

Voice Cooking remains a core product feature.

Preserve the existing homepage recipe input, microphone button, and Start Cooking entry point.

Do not create a second large Voice Cooking feature card.

Do not modify Alebex internals as part of homepage cleanup.

## 3.3 Dedicated My Recipes Page

Create:

`/collection/my-recipes`

Move the existing My Recipes interface out of the homepage.

Preserve the existing categories:

- Saved
- Uploaded
- Recently Cooked

Reuse existing recipe records and components.

Initially preserve existing demo behavior. Phase 4 will later implement real favorites functionality.

Do not create duplicate recipe datasets.

Do not pretend uploads or Recently Cooked persistence are implemented unless the repository already supports them.

Provide navigation back to Home and other main sections.

Support responsive layouts.

## 3.4 Final Homepage Structure

The homepage should contain:

1. Existing header and Hero
2. Existing recipe input and Voice Cooking entry points
3. Popular Recipes
4. Nutrition Dashboard
5. Today's Recommendation
6. Existing footer, where appropriate

Remove these standalone homepage sections:

- What Can I Cook?
- Upload Recipe
- Start Cooking with Voice
- My Recipes
- Quick Actions

Keep Nutrition Dashboard and Today's Recommendation as two prominent, visually balanced sections.

Preserve the existing homepage theme, typography, colors, spacing conventions, and overall visual identity.

Do not leave large empty spaces.

---

# 4. Recipe Library Expansion — 20 to 50

Expand the centralized recipe collection to **exactly 50 complete recipes**.

The repository currently reportedly contains 20 recipes. Verify the actual count first.

Preserve existing recipe IDs and existing data.

If there are 20 existing recipes, add exactly 30.

If the actual count differs, add only the number necessary to reach 50, without deleting existing recipes.

## 4.1 Recipe Diversity

Include a balanced variety of:

- Chinese cuisine
- Korean cuisine
- Japanese cuisine
- Italian cuisine
- Mediterranean cuisine
- Southeast Asian cuisine
- American and European comfort food
- Vegetarian dishes
- Quick meals
- High-protein meals
- Soups and stews
- Breakfast dishes
- Beginner-friendly meals
- More advanced recipes

Avoid excessive duplication of nearly identical dishes.

Use practical, recognizable dishes with plausible cooking instructions.

## 4.2 Complete Recipe Data

Every new recipe must follow the existing TypeScript recipe schema.

Include supported fields for:

- Unique stable ID
- Title
- Description
- Cuisine
- Tags
- Servings
- Preparation time
- Cooking time
- Total time
- Ingredients
- Quantities
- Units
- Ingredient notes
- Ordered cooking instructions
- Step durations where useful
- Cooking tips
- Food safety guidance where relevant

Ensure ingredient quantities and steps are internally consistent.

Instructions must be sufficiently detailed for a beginner to follow.

Include safe cooking practices, especially for raw meat, poultry, seafood, and eggs.

Do not invent nutrition values. Only include estimated nutrition when there is a defensible calculation method and clearly identify it as estimated.

## 4.3 Images

- Preserve existing images.
- Use existing local image assets where appropriate.
- Do not download external images.
- Do not use copyrighted images without authorization.
- Use the existing placeholder for recipes without suitable images.

## 4.4 Integration

All 50 recipes must work with:

- `/recipes`
- `/recipes/[id]`
- Homepage Popular Recipes where applicable
- Phase 3 Search & Filters
- Phase 4 Favorites
- Phase 5 Voice Cooking

Do not create a second recipe dataset.

## 4.5 Tests

Verify:

- Exactly 50 recipes exist.
- All IDs are unique.
- All 50 IDs resolve correctly.
- Existing IDs remain unchanged.
- Every recipe contains valid ingredients and steps.
- Required metadata is present.
- All 50 detail routes work.
- Missing images use the fallback.

---

# 5. Phase 3 — Search & Filters

Implement real, functional recipe discovery using the centralized 50-recipe collection.

## 5.1 Search

Users should be able to search recipes by:

- Recipe title
- Cuisine
- Relevant ingredient names
- Existing tags

Implement case-insensitive matching.

Trim unnecessary whitespace.

Provide useful empty-result feedback.

Do not introduce a separate search database or external search service.

## 5.2 Filters

Implement filters supported by existing recipe metadata.

Prioritize:

- Cuisine
- Total cooking time
- Difficulty, only if represented in the recipe schema
- Relevant dietary or category tags, only when supported by reliable existing metadata

Do not infer dietary or allergen safety claims from incomplete metadata.

Allow multiple compatible filters to work together.

Provide a clear Reset Filters action.

## 5.3 Sorting

Support useful sorting options such as:

- Alphabetical
- Shortest cooking time
- Longest cooking time

Use deterministic ordering.

## 5.4 Search Integration

Connect the existing header Search control to the working recipe search experience.

Integrate the existing homepage recipe input where appropriate, without breaking the separate Voice Cooking entry point.

Do not make the microphone button pretend to perform voice search unless such functionality already exists.

Prefer a single shared search implementation rather than duplicate search logic.

## 5.5 Responsive and Accessible UX

Ensure search and filtering work on desktop and mobile.

Use accessible labels, keyboard navigation, and clear empty states.

Avoid unnecessarily cluttering the homepage.

## 5.6 Tests

Verify:

- Search matches correct recipes.
- Case-insensitive search works.
- Ingredient and cuisine matching works.
- Combined filters work.
- Reset works.
- Sorting works.
- Empty results are handled.
- Recipe detail navigation remains correct.

---

# 6. Phase 4 — Saved Recipes / Favorites

Implement working Saved Recipes functionality.

## 6.1 Core Features

Users should be able to:

- Save a recipe
- Remove a saved recipe
- See whether a recipe is saved
- View saved recipes in `/collection/my-recipes`
- Open a saved recipe's detail page

The save state must remain consistent between recipe cards, detail pages, and My Recipes.

## 6.2 Persistence

Inspect existing persistence mechanisms first.

For an unauthenticated MVP, use browser-local persistence if no suitable existing storage mechanism is available.

Prefer a small, maintainable implementation using localStorage when appropriate.

Do not introduce authentication or a new database.

Handle malformed or unavailable local storage gracefully.

Do not claim cross-device synchronization.

## 6.3 My Recipes Categories

Preserve:

- Saved
- Uploaded
- Recently Cooked

Upgrade Saved to working functionality.

Preserve Uploaded and Recently Cooked behavior if already implemented.

Otherwise keep them clearly labeled as demos or Coming Soon.

Do not fabricate uploaded or recently cooked data as real user activity.

## 6.4 Tests

Verify:

- Saving works.
- Unsaving works.
- Duplicate saves are prevented.
- State persists after reload.
- Saved recipes appear in My Recipes.
- Removing a saved recipe updates the UI.
- Invalid or removed recipe IDs are handled gracefully.
- Existing recipe navigation is preserved.

---

# 7. Phase 5 — Universal Voice Cooking

This is one of the most important SOUS features.

The goal is to ensure that Voice Cooking works correctly with the entire 50-recipe collection rather than being hardcoded to Creamy Garlic Chicken.

## 7.1 Inspect Existing Architecture

Inspect:

- Alebex integration
- `useVoiceCall`
- Cooking session state
- Call-start API
- Recipe selection
- Recipe context construction
- Step navigation
- Existing Voice AI tools
- Any hardcoded recipe instructions

Do not assume the architecture is already universal.

Identify any remaining Creamy Garlic Chicken-specific behavior.

## 7.2 Recipe Context

When a user starts cooking a recipe, the Voice AI should receive or have access to the correct:

- Recipe ID
- Recipe title
- Ingredients
- Quantities
- Ordered steps
- Relevant timing information
- Safety notes
- Current cooking step

Use the existing centralized recipe dataset.

Do not create a second copy of recipe instructions.

## 7.3 Voice Cooking Behaviors

Preserve or implement, using the existing architecture where possible:

- Start selected recipe
- Explain current step
- Move to next step
- Repeat current step
- Answer recipe-specific questions
- Explain ingredient quantities
- Provide relevant cooking guidance
- Handle basic substitutions carefully
- Maintain cooking-step context

Do not claim that a voice command works unless the implementation supports it.

## 7.4 Safety

The AI must not confuse recipes or silently substitute another recipe's instructions.

If recipe context is missing or invalid, fail safely.

Food safety guidance must not be overridden by casual suggestions.

Do not invent unsafe cooking temperatures or cooking times.

## 7.5 Scope of Voice Changes

Unlike earlier UI-only phases, Phase 5 may require limited changes to Voice AI integration.

However:

- Preserve the existing Alebex architecture.
- Preserve working WebSocket and audio handling.
- Do not change API keys or environment variables.
- Do not replace the voice provider.
- Do not rewrite working voice infrastructure unnecessarily.
- Prefer minimal, targeted changes to recipe context and session selection.
- Preserve existing Creamy Garlic Chicken behavior.

If universal voice support requires a major architectural rewrite or unavailable external configuration, document the limitation rather than introducing an unsafe or unverified replacement.

## 7.6 Testing

Use mocks for external Alebex interactions.

Verify:

- All 50 recipe IDs can be selected.
- The correct recipe context is passed to the session.
- Correct ingredients and steps are available.
- Invalid IDs are rejected.
- Default `/cook` behavior remains intact.
- No cross-recipe context leakage occurs.
- Existing Voice Cooking tests continue passing.

Do not make real paid Alebex calls.

Clearly distinguish automated integration verification from real live voice testing.

---

# 8. UI Quality and Design Consistency

Across all phases, preserve the established SOUS visual identity.

Requirements:

- Consistent typography
- Consistent spacing
- Consistent buttons
- Consistent card design
- Responsive layouts
- Accessible navigation
- Clear loading and empty states
- Appropriate error handling
- No broken images
- No duplicated feature cards
- No unnecessary placeholder UI
- No horizontal overflow on mobile

Avoid broad visual redesigns.

Reuse existing components where appropriate.

Do not create unnecessary abstractions.

---

# 9. Testing and Quality Assurance

After each major phase, run the relevant available tests.

At the end, run:

`npx tsc --noEmit`

`npm test`

`npm run build`

If the repository uses different test scripts, inspect `package.json` and use the correct existing commands.

If tests fail:

1. Determine whether the failure is new or pre-existing.
2. Fix failures caused by this work.
3. Rerun the relevant tests.
4. Report unrelated pre-existing failures.
5. Do not modify unrelated code merely to make tests pass.

Do not disable TypeScript checks, suppress errors indiscriminately, remove tests, or weaken assertions to obtain passing results.

## End-to-End Verification

Verify:

1. Homepage renders correctly.
2. Primary navigation works.
3. Tools contains the required features.
4. My Recipes has its own page.
5. Homepage duplicate cards are removed.
6. All Recipes displays exactly 50 recipes.
7. All 50 detail pages work.
8. Invalid recipe IDs return 404.
9. Search and filters work.
10. Favorites persist locally.
11. Saved recipes appear in My Recipes.
12. Every recipe has the correct Voice Cooking entry point.
13. Recipe IDs propagate correctly into call-start requests.
14. Default Voice Cooking remains functional.
15. No known existing functionality is unintentionally broken.

Use browser-based verification if available.

If browser access is unavailable, perform available server-side and component checks and explicitly report that visual verification remains incomplete.

---

# 10. Execution Order

Follow this order:

**Stage 1:** Repository audit and Phase 2 stabilization

**Stage 2:** Homepage navigation restructuring

**Stage 3:** Homepage cleanup and dedicated My Recipes page

**Stage 4:** Expand recipe library to 50

**Stage 5:** Phase 3 Search & Filters

**Stage 6:** Phase 4 Saved Recipes / Favorites

**Stage 7:** Phase 5 Universal Voice Cooking

**Stage 8:** Final regression testing, build verification, and report

Complete each stage before moving to dependent work.

If a stage is blocked, record the issue and continue only with independent work that can be performed safely.

Later-stage requirements intentionally supersede earlier temporary restrictions where explicitly stated. For example:

- Phase 4 upgrades Saved from demo behavior to real favorites.
- Phase 3 upgrades existing placeholder search to working search.
- Phase 5 permits narrowly scoped Voice AI integration changes, while earlier UI stages do not.

Do not use these exceptions to justify unrelated changes.

---

# 11. Final Report

When finished, provide:

## A. Implementation Summary

For every stage, indicate:

- Completed
- Partially completed
- Blocked
- Not started

## B. Recipe Library

Report:

- Final recipe count
- Number of newly added recipes
- Whether all IDs are unique
- Whether all detail pages work

## C. Functionality

Report the status of:

- Homepage
- Navigation
- Tools
- My Recipes
- Search
- Filters
- Favorites
- Universal Voice Cooking

## D. Files Changed

List all created and modified files.

## E. Tests

Report the actual results of:

- TypeScript
- Unit tests
- Integration tests
- Production build
- Browser checks, if available

## F. Limitations

List any:

- Unfinished features
- Environment blockers
- External service requirements
- Unverified Voice AI behaviors
- Manual testing requirements

## G. Next Steps

Recommend the next development priorities after these phases.

---

# Final Instruction

**Begin implementation immediately.**

Do not stop after repository inspection.

Do not stop after writing a plan.

Do not ask for routine approvals.

Continue through the stages autonomously while respecting the security and scope restrictions.

Preserve working functionality.

Implement, test, debug, and verify as much as the environment safely allows.

**Do not commit or push any code.**