# Gita Reflection

A calm place to pause, reflect, and find perspective through the wisdom of the Bhagavad Gita.

**Journey:** arrive → pause → share how you feel → receive a relevant shlok → reflect → save → return.

## Features
- **Home** — "What's troubling you?" in English, हिन्दी or Hinglish, quick feeling choices, and "I don't know what I feel" (Heavy, Empty, Restless, Confused, Numb, Overwhelmed).
- **Reflection result** — what you said, the shlok (Sanskrit, transliteration, translation, Hindi), "Why this may speak to you", one question, Save / Share / Read another / 2-minute reflection.
- **Daily Gita** — the same shlok for everyone each day, with a question and a small practice. Optional calendar reminder (`.ics`), no streaks.
- **Reflect with the Gita** — guided conversation (clearly not Krishna, not therapy) with direction buttons.
- **Library** — 53 curated verses in 12 categories, searchable by feeling, theme, chapter or verse. Other verses fall back to an optional public dataset.
- **My Journey** — saved reflections, gentle non-diagnostic patterns, filters, saved verses, monthly summary with print-to-PDF.
- **7 Days with the Gita** — tracked guided journey with a downloadable completion card.
- **Share cards** — canvas images for Instagram (native share), WhatsApp, copy text, download.
- **Accounts** — sign up, log in, log out, forgot password; the first reflection never needs an account.
- **Premium & shop** — pricing and products; buttons show "Coming soon" until payment links are configured.
- **Guides (SEO)** — static pages in `gita/` for anxiety, overthinking, failure, fear, letting go, purpose, difficult times and relationships, plus a page per verse and `sitemap.xml`.
- Four themes (Ivory, Dusk free; Sandalwood, Sage premium), optional generated ambient sound (off by default), reduced-motion support.
- Crisis language anywhere shows Tele-MANAS (14416) / 112 support instead of a verse.

## Run locally
```
npm run serve        # http://localhost:8080
npm test             # Playwright smoke test (every route × 6 viewports + core flows)
```
No build step for the app. After editing verse or guide content, regenerate the static pages:
```
SITE_URL=https://your-domain.example npm run build
```

## Configure before launch — `assets/js/config.js`
- `contactEmail` — shown on Contact and "Coming soon" dialogs.
- `payments.*` — Razorpay Payment Page / Stripe Payment Link URLs. While empty, purchases show "Coming soon".
- `pricing`, `freeSavedLimit`.
- `SITE_URL` for the static build (sitemap/canonical URLs).

## Architecture
Static, framework-free ES modules (`assets/js`), hash routing, views lazy-loaded per route.
- `data/` — verses, emotions & lexicon, 7-day journey, guide content (single source for the app and static pages).
- `matcher.js` — matches words to verses in the browser; nothing typed is sent anywhere.
- `store.js` — **local account provider**: accounts and reflections live in the browser (PBKDF2-hashed passwords). Accounts do not sync across devices, and "forgot password" resets on the device that holds the account. Swap this one file for a hosted backend (e.g. Supabase) to get syncing and email resets; the views only use its exported functions.
- `api/gita.js` is the earlier optional OpenAI endpoint; the current site does not call it.
