// Generates search-friendly static pages, in English and Hindi, from the same
// data the app uses:
//   gita/                          — guide index            (Hindi: gita/hi/)
//   gita/<topic>/                  — e.g. "Bhagavad Gita for overthinking"
//   gita/verse/<ch>-<v>/           — one page per curated verse
//   sitemap.xml, robots.txt
// Each English page and its Hindi twin link to each other with hreflang.
//
// Usage: SITE_URL=https://your-domain.example npm run build:pages
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VERSES, VERSE_BY_ID, CATEGORIES } from "../assets/js/data/verses.js";
import { SEO_TOPICS, SEO_TOPICS_HI } from "../assets/js/data/seo.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL || "https://gita-reflection.vercel.app").replace(/\/$/, "");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const br = s => esc(s).replace(/\n/g, "<br>");

const MARK = `<svg class="mark" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 10c4 5 6 10 6 15s-2.5 9-6 12c-3.5-3-6-7-6-12s2-10 6-15z"/><path d="M18 25c-4-2-8-2-11 0 1.5 6 6.5 11 17 12"/><path d="M30 25c4-2 8-2 11 0-1.5 6-6.5 11-17 12"/><path d="M10 41h28"/></svg>`;

// Interface text for the static pages.
const L = {
  en: {
    brand: "Gita Reflection", daily: "Daily Gita", library: "Library", reflect: "Reflect now", guides: "Guides", allGuides: "All guides",
    about: "About", privacy: "Privacy", skip: "Skip to content", other: "हिन्दी में पढ़ें", otherLang: "hi",
    footer: `Gita Reflection is a reflection and educational tool inspired by the Bhagavad Gita. It is not a replacement for professional mental-health care. In India, call Tele-MANAS at <a href="tel:14416">14416</a> (24×7, free).`,
    ref: (ch, v) => `Bhagavad Gita · Chapter ${ch}, Verse ${v}`, translation: "Translation", hindi: "हिन्दी भावार्थ",
    simple: "In simple words", interp: "Interpretation", helps: "When this may help:", sit: "A question to sit with:",
    how: "How the Gita approaches this", verses: "Verses to reflect on", practice: "A simple practice",
    ctaTitle: "Want a teaching for exactly what you're feeling?",
    ctaText: "Share it in your own words — English, Hindi or Hinglish — and receive a shlok with a gentle reflection. Free, private, no sign-up needed.",
    ctaBtn: "Begin a reflection", fine: "Translations are adapted for readability. “In simple words” and the reflection questions are interpretations written for Gita Reflection, not scripture.",
    more: "More guides", context: "Context", whenHelps: "When this may help", question: "Reflection question", smallPractice: "A small practice",
    openApp: "Open in Gita Reflection", openText: "Reflect on this verse, save your thoughts or share it as a card.",
    verseTitle: v => `Bhagavad Gita ${v.ch}.${v.v} — Meaning, Sanskrit & Reflection | Gita Reflection`,
    verseDesc: (v, m) => `Bhagavad Gita Chapter ${v.ch}, Verse ${v.v}: ${m} Sanskrit, transliteration, translation, Hindi meaning and a reflection question.`,
    verseH1: v => `Bhagavad Gita ${v.ch}.${v.v}`,
    indexTitle: "Bhagavad Gita Guides — Teachings for Everyday Life | Gita Reflection",
    indexDesc: "Guides to the Bhagavad Gita on anxiety, overthinking, failure, fear, letting go, purpose and relationships — with Sanskrit, translations and simple meanings.",
    indexH1: "The Bhagavad Gita for everyday life",
    indexLead: "Gentle, honest guides to what the Gita teaches about the feelings we all carry — with the original Sanskrit, translations and simple meanings.",
    byTheme: "Guides by theme", verseList: "Verses", troubling: "What's troubling you?"
  },
  hi: {
    brand: "गीता रिफ्लेक्शन", daily: "आज की गीता", library: "संग्रह", reflect: "अभी चिंतन करें", guides: "मार्गदर्शिकाएँ", allGuides: "सभी मार्गदर्शिकाएँ",
    about: "परिचय", privacy: "गोपनीयता", skip: "मुख्य सामग्री पर जाएँ", other: "Read in English", otherLang: "en",
    footer: `गीता रिफ्लेक्शन भगवद्गीता से प्रेरित एक चिंतन और शैक्षिक साधन है। यह पेशेवर मानसिक-स्वास्थ्य देखभाल का विकल्प नहीं है। भारत में Tele-MANAS को <a href="tel:14416">14416</a> पर कॉल करें (24×7, मुफ़्त)।`,
    ref: (ch, v) => `भगवद्गीता · अध्याय ${ch}, श्लोक ${v}`, translation: "अंग्रेज़ी अनुवाद · English translation", hindi: "हिन्दी भावार्थ",
    simple: "सरल शब्दों में", interp: "व्याख्या", helps: "यह कब मदद कर सकता है:", sit: "साथ बैठने के लिए एक प्रश्न:",
    how: "गीता इसे कैसे देखती है", verses: "चिंतन के लिए श्लोक", practice: "एक सरल अभ्यास",
    ctaTitle: "ठीक वैसी शिक्षा चाहिए जैसा आप महसूस कर रहे हैं?",
    ctaText: "अपने शब्दों में बताइए — हिन्दी, English या Hinglish — और एक कोमल चिंतन के साथ एक श्लोक पाइए। मुफ़्त, निजी, बिना साइन-अप के।",
    ctaBtn: "चिंतन शुरू करें", fine: "अनुवाद पढ़ने में आसान बनाए गए हैं। “सरल शब्दों में” और चिंतन प्रश्न गीता रिफ्लेक्शन के लिए लिखी गई व्याख्याएँ हैं, शास्त्र नहीं।",
    more: "और मार्गदर्शिकाएँ", context: "संदर्भ", whenHelps: "यह कब मदद कर सकता है", question: "चिंतन प्रश्न", smallPractice: "एक छोटा अभ्यास",
    openApp: "गीता रिफ्लेक्शन में खोलें", openText: "इस श्लोक पर चिंतन कीजिए, अपने विचार सहेजिए या इसे कार्ड के रूप में साझा कीजिए।",
    verseTitle: v => `भगवद्गीता ${v.ch}.${v.v} — अर्थ, संस्कृत और चिंतन | गीता रिफ्लेक्शन`,
    verseDesc: (v, m) => `भगवद्गीता अध्याय ${v.ch}, श्लोक ${v.v}: ${m} संस्कृत, लिप्यंतरण, अनुवाद, हिन्दी भावार्थ और एक चिंतन प्रश्न।`,
    verseH1: v => `भगवद्गीता ${v.ch}.${v.v}`,
    indexTitle: "भगवद्गीता मार्गदर्शिकाएँ — रोज़मर्रा के जीवन के लिए शिक्षाएँ | गीता रिफ्लेक्शन",
    indexDesc: "चिंता, ज़्यादा सोचना, असफलता, डर, छोड़ना, उद्देश्य और रिश्तों पर भगवद्गीता की मार्गदर्शिकाएँ — संस्कृत, अनुवाद और सरल अर्थ के साथ।",
    indexH1: "रोज़मर्रा के जीवन के लिए भगवद्गीता",
    indexLead: "हम सब जो भावनाएँ लिए चलते हैं, उनके बारे में गीता क्या सिखाती है — इस पर कोमल, ईमानदार मार्गदर्शिकाएँ, मूल संस्कृत, अनुवाद और सरल अर्थ के साथ।",
    byTheme: "विषय के अनुसार मार्गदर्शिकाएँ", verseList: "श्लोक", troubling: "आपको क्या परेशान कर रहा है?"
  }
};

const pathFor = (lang, rel) => (lang === "hi" ? `gita/hi/${rel}` : `gita/${rel}`);
const baseFor = path => "../".repeat(path.split("/").filter(Boolean).length);
const pickHi = (v, field) => v.hiText?.[field] || v[field];

function page({ lang, title, description, path, altPath, body, jsonld }) {
  const t = L[lang];
  const base = baseFor(path);
  const url = `${SITE_URL}/${path}`;
  const altUrl = `${SITE_URL}/${altPath}`;
  const enUrl = lang === "en" ? url : altUrl;
  const hiUrl = lang === "hi" ? url : altUrl;
  const q = `?lang=${lang}`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <link rel="alternate" hreflang="en" href="${esc(enUrl)}">
  <link rel="alternate" hreflang="hi" href="${esc(hiUrl)}">
  <link rel="alternate" hreflang="x-default" href="${esc(enUrl)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:locale" content="${lang === "hi" ? "hi_IN" : "en_IN"}">
  <meta name="theme-color" content="#F6F0E4">
  <link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Noto+Serif+Devanagari:wght@400;500&family=Noto+Sans+Devanagari:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}assets/css/styles.css">
  ${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body class="static-page">
  <a class="skip-link" href="#main">${t.skip}</a>
  <div class="ambient" aria-hidden="true"><span class="ambient-a"></span><span class="ambient-b"></span></div>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${base}#/${q}">${MARK}<span>${t.brand}</span></a>
      <nav class="static-nav" aria-label="Main">
        <a href="${base}#/daily${q}">${t.daily}</a>
        <a href="${base}#/library${q}">${t.library}</a>
        <a class="lang-link" href="${base}${altPath}" hreflang="${t.otherLang}" lang="${t.otherLang}">${t.other}</a>
        <a class="btn btn-primary btn-sm" href="${base}#/${q}">${t.reflect}</a>
      </nav>
    </div>
  </header>
  <main id="main" class="main">
${body(base, q)}
  </main>
  <footer class="site-footer">
    <div class="wrap footer-base">
      <p class="fine">${t.footer}</p>
      <p class="fine"><a href="${base}${pathFor(lang, "")}">${t.allGuides}</a> · <a href="${base}#/about${q}">${t.about}</a> · <a href="${base}#/privacy${q}">${t.privacy}</a></p>
    </div>
  </footer>
</body>
</html>
`;
}

function verseSection(lang, v, base, level = "h3") {
  const t = L[lang];
  const english = `<div class="layer" lang="en"><${level} class="layer-label">${t.translation}</${level}><p class="translation">${esc(v.en)}</p></div>`;
  const hindi = `<div class="layer" lang="hi"><${level} class="layer-label">${t.hindi}</${level}><p class="hindi">${esc(v.hi)}</p></div>`;
  return `
      <section class="static-verse">
        <p class="verse-ref"><a href="${base}${pathFor(lang, `verse/${v.ch}-${v.v}/`)}">${t.ref(v.ch, v.v)}</a></p>
        <div class="verse-arch">
          <p class="sanskrit" lang="sa">${br(v.sa)}</p>
          <p class="translit" lang="sa-Latn">${br(v.tr)}</p>
        </div>
        <div class="layers">
          ${lang === "hi" ? hindi + english : english + hindi}
          <div class="layer"><${level} class="layer-label">${t.simple} <span class="tag-interp">${t.interp}</span></${level}><p class="simple">${esc(lang === "hi" ? pickHi(v, "meaning") : v.meaning)}</p></div>
        </div>
      </section>`;
}

async function out(rel, html) {
  const file = /\.(xml|txt)$/.test(rel) ? join(ROOT, rel) : join(ROOT, rel, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

async function build() {
  await rm(join(ROOT, "gita"), { recursive: true, force: true });
  const urls = [""];

  for (const lang of ["en", "hi"]) {
    const t = L[lang];
    const field = (v, f) => (lang === "hi" ? pickHi(v, f) : v[f]);
    const topics = SEO_TOPICS.map(x => (lang === "hi" ? { ...x, ...SEO_TOPICS_HI[x.slug] } : x));

    // Topic pages
    for (const topic of topics) {
      const path = pathFor(lang, `${topic.slug}/`);
      const altPath = pathFor(t.otherLang, `${topic.slug}/`);
      const verses = topic.verses.map(id => VERSE_BY_ID[id]).filter(Boolean);
      const note = lang === "hi" ? topic.note : (topic.medical ? `<strong>A gentle note:</strong> the Bhagavad Gita is a spiritual and philosophical text, not a medical treatment. If anxiety is affecting your daily life, please consider speaking with a doctor or mental-health professional. In India, Tele-MANAS offers free support 24×7 at <a href="tel:14416">14416</a>.` : "");
      await out(path, page({
        lang, path, altPath, title: `${topic.title} | ${t.brand}`, description: topic.description,
        jsonld: { "@context": "https://schema.org", "@type": "Article", headline: topic.title, description: topic.description, inLanguage: lang, publisher: { "@type": "Organization", name: t.brand } },
        body: base => `
    <article class="wrap narrow prose static-article">
      <header class="page-head">
        <p class="eyebrow"><a href="${base}${pathFor(lang, "")}">${t.guides}</a></p>
        <h1>${esc(topic.h1)}</h1>
        ${topic.intro.map(p => `<p class="lead">${esc(p)}</p>`).join("\n        ")}
      </header>
      ${note ? `<div class="soft-card"><p>${note}</p></div>` : ""}
      <h2>${t.how}</h2>
      <p>${esc(topic.approach)}</p>
      <h2>${t.verses}</h2>
      ${verses.map(v => `${verseSection(lang, v, base)}
      <p><strong>${t.helps}</strong> ${esc(field(v, "helps"))}</p>
      <p><strong>${t.sit}</strong> <em>${esc(field(v, "question"))}</em></p>`).join("\n")}
      <h2>${t.practice}</h2>
      <p>${esc(topic.practice)}</p>
      <div class="soft-card center static-cta">
        <p class="statement small">${t.ctaTitle}</p>
        <p class="muted">${t.ctaText}</p>
        <a class="btn btn-primary" href="${base}#/reflection?e=${esc(topic.emotion)}&amp;lang=${lang}">${t.ctaBtn}</a>
      </div>
      <p class="fine">${t.fine}</p>
      <h2>${t.more}</h2>
      <ul>${topics.filter(o => o.slug !== topic.slug).map(o => `<li><a href="${base}${pathFor(lang, `${o.slug}/`)}">${esc(o.h1)}</a></li>`).join("")}</ul>
    </article>`
      }));
      urls.push(path);
    }

    // Verse pages
    for (const v of VERSES) {
      const path = pathFor(lang, `verse/${v.ch}-${v.v}/`);
      const altPath = pathFor(t.otherLang, `verse/${v.ch}-${v.v}/`);
      const cats = CATEGORIES.filter(c => v.cats.includes(c.id)).map(c => (lang === "hi" ? c.hiText.label : c.label));
      await out(path, page({
        lang, path, altPath, title: t.verseTitle(v), description: t.verseDesc(v, field(v, "meaning")).slice(0, 300),
        body: (base, q) => `
    <article class="wrap narrow prose static-article">
      <header class="page-head center">
        <p class="eyebrow"><a href="${base}${pathFor(lang, "")}">${t.guides}</a> · ${esc(cats.join(" · "))}</p>
        <h1>${t.verseH1(v)}</h1>
        <p class="lead center">${esc(field(v, "meaning"))}</p>
      </header>
      ${verseSection(lang, v, base, "h2")}
      <h2>${t.context}</h2>
      <p>${esc(field(v, "context"))}</p>
      <h2>${t.whenHelps}</h2>
      <p>${esc(field(v, "helps"))}</p>
      <h2>${t.question}</h2>
      <p class="question">${esc(field(v, "question"))}</p>
      <h2>${t.smallPractice}</h2>
      <p>${esc(field(v, "practice"))}</p>
      <div class="soft-card center static-cta">
        <p class="muted">${t.openText}</p>
        <a class="btn btn-primary" href="${base}#/shlok/${v.ch}-${v.v}${q}">${t.openApp}</a>
      </div>
    </article>`
      }));
      urls.push(path);
    }

    // Guide index
    {
      const path = pathFor(lang, "");
      const altPath = pathFor(t.otherLang, "");
      const sorted = [...VERSES].sort((a, b) => a.ch - b.ch || a.v - b.v);
      await out(path, page({
        lang, path, altPath, title: t.indexTitle, description: t.indexDesc,
        body: (base, q) => `
    <article class="wrap narrow prose static-article">
      <header class="page-head">
        <p class="eyebrow">${t.guides}</p>
        <h1>${t.indexH1}</h1>
        <p class="lead">${t.indexLead}</p>
      </header>
      <h2>${t.byTheme}</h2>
      <ul>${topics.map(x => `<li><a href="${base}${pathFor(lang, `${x.slug}/`)}">${esc(x.h1)}</a> — ${esc(x.description)}</li>`).join("")}</ul>
      <h2>${t.verseList}</h2>
      <ul class="verse-index">${sorted.map(v => `<li><a href="${base}${pathFor(lang, `verse/${v.ch}-${v.v}/`)}">${v.ch}.${v.v}</a> — ${esc(field(v, "meaning"))}</li>`).join("")}</ul>
      <div class="soft-card center static-cta">
        <p class="statement small">${t.troubling}</p>
        <a class="btn btn-primary" href="${base}#/${q}">${t.ctaBtn}</a>
      </div>
    </article>`
      }));
      urls.push(path);
    }
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
