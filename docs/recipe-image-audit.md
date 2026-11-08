# Recipe image audit

All 50 records and local file checks are recorded in `public/recipes/image-audit.json`.
The five original photographs exist, are readable, and have distinct file hashes.
The other 45 records share the intentional local SVG fallback. No catalog image
request depends on an external host or Next.js remote-image allowlist.

The original source list is `public/recipes/SOURCES.md`. The creamy chicken source
URL is labeled pizza, so its source attribution and exact recipe match need review.
The existing curry photo depicts bone-in chicken while the recipe uses boneless thighs;
the stew photo does not clearly establish the specified tomato/potato preparation.
Existing photos should be treated as illustrative until replacements are verified.

Commons candidates were downloaded before further network operations were stopped.
Visual review rejected chicken pasta for creamy garlic chicken, a pasta stew for
tomato beef stew, and a carnitas quesadilla for vegetarian black bean quesadillas.
Several other candidates include different accompaniments or ingredients. None was
activated. They are retained under `scripts/image-candidates/` for review only;
their full attribution metadata must be recovered before use. No rights are claimed.

Remaining work: source and visually verify dish-specific photographs, preserve each
file's author, source page, license URL and required attribution, and expose required
credits publicly before activating them. Do not substitute unrelated food photos.
Commons reuse guidance: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia

Network sourcing was stopped at the user's request. `source-recipe-images.ps1` is
an explicit manual sourcing helper, never run by the app, tests, or build.
