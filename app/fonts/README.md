# Local fonts

These original Google Fonts files are bundled so development and production builds
work without contacting fonts.googleapis.com or fonts.gstatic.com.

- Caveat: https://github.com/google/fonts/tree/main/ofl/caveat (variable weight 400–700)
- Figtree: https://github.com/google/fonts/tree/main/ofl/figtree (variable weight 300–900)
- Young Serif: https://github.com/google/fonts/tree/main/ofl/youngserif (regular 400)

Each family directory includes its upstream SIL Open Font License (OFL.txt).
`app/layout.tsx` loads these with `next/font/local`; `app/globals.css` maps the
resulting variables to Tailwind's display, body, and hand utilities.
