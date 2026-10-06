# Gita Reflection

A calm place to pause, reflect, and find perspective through the wisdom of the Bhagavad Gita.

**Journey:** arrive → pause → share how you feel → receive a relevant shlok → reflect → save → return.

## Features
- **English and हिन्दी** — every page, button, message, verse interpretation, journey and share card in both languages. A switch in the header (हिं / EN) and in Profile; Hindi-language browsers start in Hindi. Every text box accepts Hindi, English and Hinglish in either mode. Interface text lives in `assets/js/data/hi.js` (English text is the key; anything missing falls back to English); verse, emotion and journey Hindi lives beside the English content (`verses-hi.js`, `emotions.js`, `journey.js`).
- **Home** — "What's troubling you?" in English, हिन्दी or Hinglish, quick feeling choices, and "I don't know what I feel" (Heavy, Empty, Restless, Confused, Numb, Overwhelmed).
- **Reflection result** — what you said, the shlok (Sanskrit, transliteration, translation, Hindi), "Why this may speak to you", one question, Save / Share / Read another / 2-minute reflection.
- **Daily Gita** — the same shlok for everyone each day, with a question and a small practice. Optional calendar reminder (`.ics`), no streaks.
- **Reflect with the Gita** — guided conversation (clearly not Krishna, not therapy) with direction buttons.
- **Library** — 53 curated verses in 12 categories, searchable by feeling, theme, chapter or verse. Other verses fall back to an optional public dataset.
- **My Journey** — saved reflections, gentle non-diagnostic patterns, filters, saved verses, monthly summary with print-to-PDF.
- **7 Days with the Gita** — tracked guided journey with a downloadable completion card.
- **Share cards** — canvas images for Instagram (native share), WhatsApp, copy text, download.
- **Accounts** — sign up, log in, log out, forgot password; the first reflection never needs an account. With Supabase connected, accounts sync across devices and password resets go by email (see [SUPABASE.md](SUPABASE.md)).
- **Premium & shop** — pricing and products; buttons show "Coming soon" until payment links are configured.
- **Guides (SEO)** — static pages in `gita/` for anxiety, overthinking, failure, fear, letting go, purpose, difficult times and relationships, plus a page per verse and `sitemap.xml`.
- Four themes (Ivory, Dusk free; Sandalwood, Sage premium), optional generated ambient sound (off by default), reduced-motion support.
- Crisis language anywhere shows Tele-MANAS (14416) / 112 support instead of a verse.

## Run locally
```
npm run serve        # http://localhost:8080
npm test             # Playwright smoke test (every route × 6 viewports + core flows)
npm run test:supabase  # Supabase flows against a local mock of the Supabase API
npm run test:hindi     # every page and the main flows in Hindi, plus untranslated-text check
npm run test:payments  # Razorpay checkout, webhooks and cancelling, against fakes
```
No build step for the app. After editing verse or guide content, regenerate the static pages:
```
SITE_URL=https://your-domain.example npm run build:pages
```

## Deploying
The site is static files served from the project root — there is no build step on Vercel or GitHub Pages. The guide pages in `gita/` are generated locally with `npm run build:pages` and committed. (Don't add a `build` script to `package.json`: Vercel would then expect a `public` output folder.)

## Configure before launch — `assets/js/config.js`
- `supabase.url`, `supabase.anonKey` — connect Supabase for real accounts (setup: [SUPABASE.md](SUPABASE.md)). Leave empty to keep accounts in each visitor's browser.
- `contactEmail` — shown on Contact and "Coming soon" dialogs.
- `payments.*` — Razorpay Payment Page / Stripe Payment Link URLs. While empty, purchases show "Coming soon".
- `pricing`, `freeSavedLimit`.
- `SITE_URL` for the static build (sitemap/canonical URLs).

## Architecture
Static, framework-free ES modules (`assets/js`), hash routing, views lazy-loaded per route.
- `data/` — verses, emotions & lexicon, 7-day journey, guide content (single source for the app and static pages).
- `matcher.js` — matches words to verses in the browser; nothing typed is sent anywhere.
- `store.js` — accounts and saved data. Pages read from an in-memory copy; writes go, in order, to one of two backends:
  - `backends/supabase.js` — Supabase Auth + Postgres with row-level security (`supabase/schema.sql`), used when configured. Loads a slim vendored client (`assets/vendor/supabase-slim.mjs`, ~30 KB gzipped) only in that case.
  - `backends/local.js` — accounts stored in the visitor's browser (PBKDF2-hashed passwords); the default when Supabase isn't configured.
