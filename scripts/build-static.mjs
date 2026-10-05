// Generates search-friendly static pages from the same data the app uses:
//   gita/index.html                 — guide index
//   gita/<topic>/index.html         — e.g. "Bhagavad Gita for overthinking"
//   gita/verse/<ch>-<v>/index.html  — one page per curated verse
//   sitemap.xml, robots.txt
//
// Usage: SITE_URL=https://your-domain.example npm run build:pages
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VERSES, VERSE_BY_ID, CATEGORIES } from "../assets/js/data/verses.js";
import { SEO_TOPICS } from "../assets/js/data/seo.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL || "https://gita-reflection.vercel.app").replace(/\/$/, "");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const br = s => esc(s).replace(/\n/g, "<br>");

const MARK = `<svg class="mark" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 10c4 5 6 10 6 15s-2.5 9-6 12c-3.5-3-6-7-6-12s2-10 6-15z"/><path d="M18 25c-4-2-8-2-11 0 1.5 6 6.5 11 17 12"/><path d="M30 25c4-2 8-2 11 0-1.5 6-6.5 11-17 12"/><path d="M10 41h28"/></svg>`;

function page({ title, description, path, base, body, jsonld }) {
  const url = `${SITE_URL}/${path}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${esc(url)}">
  <meta name="theme-color" content="#F6F0E4">
  <link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Noto+Serif+Devanagari:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}assets/css/styles.css">
  ${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body class="static-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="ambient" aria-hidden="true"><span class="ambient-a"></span><span class="ambient-b"></span></div>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${base}">${MARK}<span>Gita Reflection</span></a>
      <nav class="static-nav" aria-label="Main">
        <a href="${base}#/daily">Daily Gita</a>
        <a href="${base}#/library">Library</a>
        <a class="btn btn-primary btn-sm" href="${base}#/">Reflect now</a>
      </nav>
    </div>
  </header>
  <main id="main" class="main">
${body}
  </main>
  <footer class="site-footer">
    <div class="wrap footer-base">
      <p class="fine">Gita Reflection is a reflection and educational tool inspired by the Bhagavad Gita. It is not a replacement for professional mental-health care. In India, call Tele-MANAS at <a href="tel:14416">14416</a> (24×7, free).</p>
      <p class="fine"><a href="${base}gita/">All guides</a> · <a href="${base}#/about">About</a> · <a href="${base}#/privacy">Privacy</a></p>
    </div>
  </footer>
</body>
</html>
`;
}

function verseSection(v, base, level = "h3") {
  return `
      <section class="static-verse">
        <p class="verse-ref"><a href="${base}gita/verse/${v.ch}-${v.v}/">Bhagavad Gita · Chapter ${v.ch}, Verse ${v.v}</a></p>
        <div class="verse-arch">
          <p class="sanskrit" lang="sa">${br(v.sa)}</p>
          <p class="translit" lang="sa-Latn">${br(v.tr)}</p>
        </div>
        <div class="layers">
          <div class="layer"><${level} class="layer-label">Translation</${level}><p class="translation">${esc(v.en)}</p></div>
          <div class="layer" lang="hi"><${level} class="layer-label">हिन्दी भावार्थ</${level}><p class="hindi">${esc(v.hi)}</p></div>
          <div class="layer"><${level} class="layer-label">In simple words <span class="tag-interp">Interpretation</span></${level}><p class="simple">${esc(v.meaning)}</p></div>
        </div>
      </section>`;
}

async function out(rel, html) {
  const file = join(ROOT, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

async function build() {
  await rm(join(ROOT, "gita"), { recursive: true, force: true });
  const urls = [""];

  // Topic pages
  for (const t of SEO_TOPICS) {
    const base = "../../";
    const verses = t.verses.map(id => VERSE_BY_ID[id]).filter(Boolean);
    const body = `
    <article class="wrap narrow prose static-article">
      <header class="page-head">
        <p class="eyebrow"><a href="${base}gita/">Guides</a></p>
        <h1>${esc(t.h1)}</h1>
        ${t.intro.map(p => `<p class="lead">${esc(p)}</p>`).join("\n        ")}
      </header>
      ${t.medical ? `<div class="soft-card"><p><strong>A gentle note:</strong> the Bhagavad Gita is a spiritual and philosophical text, not a medical treatment. If anxiety is affecting your daily life, please consider speaking with a doctor or mental-health professional. In India, Tele-MANAS offers free support 24×7 at <a href="tel:14416">14416</a>.</p></div>` : ""}
      <h2>How the Gita approaches this</h2>
      <p>${esc(t.approach)}</p>
      <h2>Verses to reflect on</h2>
      ${verses.map(v => `${verseSection(v, base)}
      <p><strong>When this may help:</strong> ${esc(v.helps)}</p>
      <p><strong>A question to sit with:</strong> <em>${esc(v.question)}</em></p>`).join("\n")}
      <h2>A simple practice</h2>
      <p>${esc(t.practice)}</p>
      <div class="soft-card center static-cta">
        <p class="statement small">Want a teaching for exactly what you're feeling?</p>
        <p class="muted">Share it in your own words — English, Hindi or Hinglish — and receive a shlok with a gentle reflection. Free, private, no sign-up needed.</p>
        <a class="btn btn-primary" href="${base}#/reflection?e=${esc(t.emotion)}">Begin a reflection</a>
      </div>
      <p class="fine">Translations are adapted for readability. “In simple words” and the reflection questions are interpretations written for Gita Reflection, not scripture.</p>
      <h2>More guides</h2>
      <ul>${SEO_TOPICS.filter(o => o.slug !== t.slug).map(o => `<li><a href="${base}gita/${o.slug}/">${esc(o.h1)}</a></li>`).join("")}</ul>
    </article>`;
    await out(`gita/${t.slug}/index.html`, page({
      title: `${t.title} | Gita Reflection`, description: t.description, path: `gita/${t.slug}/`, base, body,
      jsonld: { "@context": "https://schema.org", "@type": "Article", headline: t.title, description: t.description, publisher: { "@type": "Organization", name: "Gita Reflection" } }
    }));
    urls.push(`gita/${t.slug}/`);
  }

  // Verse pages
  for (const v of VERSES) {
    const base = "../../../";
    const cats = CATEGORIES.filter(c => v.cats.includes(c.id)).map(c => c.label);
    const body = `
    <article class="wrap narrow prose static-article">
      <header class="page-head center">
        <p class="eyebrow"><a href="${base}gita/">Guides</a> · ${esc(cats.join(" · "))}</p>
        <h1>Bhagavad Gita ${v.ch}.${v.v}</h1>
        <p class="lead center">${esc(v.meaning)}</p>
      </header>
      ${verseSection(v, base, "h2")}
      <h2>Context</h2>
      <p>${esc(v.context)}</p>
      <h2>When this may help</h2>
      <p>${esc(v.helps)}</p>
      <h2>Reflection question</h2>
      <p class="question">${esc(v.question)}</p>
      <h2>A small practice</h2>
      <p>${esc(v.practice)}</p>
      <div class="soft-card center static-cta">
        <p class="muted">Reflect on this verse, save your thoughts or share it as a card.</p>
        <a class="btn btn-primary" href="${base}#/shlok/${v.ch}-${v.v}">Open in Gita Reflection</a>
      </div>
    </article>`;
    await out(`gita/verse/${v.ch}-${v.v}/index.html`, page({
      title: `Bhagavad Gita ${v.ch}.${v.v} — Meaning, Sanskrit & Reflection | Gita Reflection`,
      description: `Bhagavad Gita Chapter ${v.ch}, Verse ${v.v}: ${v.meaning} Sanskrit, transliteration, translation, Hindi meaning and a reflection question.`.slice(0, 300),
      path: `gita/verse/${v.ch}-${v.v}/`, base, body
    }));
    urls.push(`gita/verse/${v.ch}-${v.v}/`);
  }

  // Guide index
  {
    const base = "../";
    const sorted = [...VERSES].sort((a, b) => a.ch - b.ch || a.v - b.v);
    const body = `
    <article class="wrap narrow prose static-article">
      <header class="page-head">
        <p class="eyebrow">Guides</p>
        <h1>The Bhagavad Gita for everyday life</h1>
        <p class="lead">Gentle, honest guides to what the Gita teaches about the feelings we all carry — with the original Sanskrit, translations and simple meanings.</p>
      </header>
      <h2>Guides by theme</h2>
      <ul>${SEO_TOPICS.map(t => `<li><a href="${base}gita/${t.slug}/">${esc(t.h1)}</a> — ${esc(t.description)}</li>`).join("")}</ul>
      <h2>Verses</h2>
      <ul class="verse-index">${sorted.map(v => `<li><a href="${base}gita/verse/${v.ch}-${v.v}/">${v.ch}.${v.v}</a> — ${esc(v.meaning)}</li>`).join("")}</ul>
      <div class="soft-card center static-cta">
        <p class="statement small">What's troubling you?</p>
        <a class="btn btn-primary" href="${base}#/">Begin a reflection</a>
      </div>
    </article>`;
    await out("gita/index.html", page({
      title: "Bhagavad Gita Guides — Teachings for Everyday Life | Gita Reflection",
      description: "Guides to the Bhagavad Gita on anxiety, overthinking, failure, fear, letting go, purpose and relationships — with Sanskrit, translations and simple meanings.",
      path: "gita/", base, body
    }));
    urls.push("gita/");
  }

  const today = new Date().toISOString().slice(0, 10);
  await out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}/${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
  await out("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log(`Built ${urls.length} pages for ${SITE_URL}`);
}

build().catch(err => { console.error(err); process.exit(1); });
