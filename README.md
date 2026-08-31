# Gita — A Shlok for You

A premium, single-interface Bhagavad Gita reflection website.

## What it does

1. The user writes what is troubling them.
2. The browser loads all 701 verses from the public Gita Quotes dataset.
3. A lightweight local matcher creates a shortlist of relevant verses.
4. A server-side AI endpoint chooses ONE verse from that shortlist.
5. The website displays:
   - original Sanskrit
   - English meaning
   - Hindi meaning
   - a short explanation of why the teaching may be relevant
6. High-risk self-harm phrases trigger a safety message instead of AI spiritual guidance.

## Important architecture

GitHub Pages can host the front end, but an OpenAI API key must NOT be placed in `app.js`.
The `/api/gita.js` endpoint is intended for Vercel (or another serverless backend) so the API key stays private.

## Files

- `index.html` — interface
- `styles.css` — premium black/navy design
- `app.js` — UI, Gita dataset loading, candidate matching and safety layer
- `api/gita.js` — secure AI endpoint
- `package.json` — server dependency
- `vercel.json` — serverless function settings

## Deploying from an iPad

### Option A: easiest

Create a GitHub repository and upload these files.

Then import the repository into Vercel.

In Vercel:
1. Create a new project.
2. Select this GitHub repository.
3. Add an Environment Variable:
   - Name: `OPENAI_API_KEY`
   - Value: your OpenAI API key
4. Optional:
   - Name: `OPENAI_MODEL`
   - Value: `gpt-5.6-luna`
5. Deploy.

The frontend and `/api/gita` endpoint will then live together on the Vercel URL.

### If you specifically want GitHub Pages

GitHub Pages can host `index.html`, `styles.css`, and `app.js`, but the API endpoint must be hosted elsewhere.
Change:

const API_URL = "/api/gita";

to the full URL of your deployed serverless endpoint, for example:

const API_URL = "https://YOUR-BACKEND.vercel.app/api/gita";

Do NOT put the OpenAI key in the GitHub Pages files.

## Data attribution

The initial dataset URL is:
https://chiragmirani.github.io/gita-quotes/data.json

That project states that it contains 701 verses, with Sanskrit, transliteration and English translations, and identifies Shri Purohit Swami's 1935 translation as public domain. Review the source project's license/attribution requirements before publishing commercially.

For a production version, consider maintaining your own verified dataset and recording the exact source/translator for every translation.

## Next production upgrades

- Replace simple keyword matching with embeddings/RAG.
- Add a verified Hindi translation source instead of AI-only Hindi translation.
- Add multiple relevant verses, not only one.
- Add chapter/verse context.
- Add feedback: “This helped / Show another.”
- Add language selection.
- Add saved reflections only if privacy/storage is designed carefully.
- Add stronger crisis detection and professional review before public launch.
