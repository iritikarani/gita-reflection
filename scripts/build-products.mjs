// Builds the downloadable digital products as print-ready A5 PDFs, in English
// and Hindi, from the same content the site uses:
//   7-Day Gita Reflection Journal, 30-Day Gita Reflection Journal,
//   Daily Reflection Cards (52), Gita-Inspired Journaling Pack.
// Output goes to products/dist/ (git-ignored and never deployed), so the paid
// files are not publicly downloadable. Upload them to your store (e.g. Instamojo
// or Gumroad) and put its links in assets/js/config.js → payments.products.
//
// Usage: npm run build:products      (needs Playwright + Chromium)
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VERSES, VERSE_BY_ID } from "../assets/js/data/verses.js";
import { SEVEN_DAYS } from "../assets/js/data/journey.js";
import { PROGRAM_DAYS, PROGRAM_PROMPTS, JOURNAL_PROMPTS } from "../assets/js/data/programs.js";
import { TEMPLATES } from "../assets/js/data/templates.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "products", "dist");
const SITE = "gita-reflection.vercel.app";

async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const require = createRequire(import.meta.url);
    return require(require.resolve("playwright", { paths: ["/opt/node22/lib/node_modules", process.env.NODE_PATH || ""] }));
  }
}

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const br = s => esc(s).replace(/\n/g, "<br>");
const lines = n => `<div class="lines">${"<span></span>".repeat(n)}</div>`;

const T = {
  en: {
    brand: "Gita Reflection", gita: "Bhagavad Gita", day: n => `Day ${n}`, translation: "Translation", hindi: "हिन्दी भावार्थ",
    simple: "In simple words", reflect: "Reflect", prompt: "Journaling prompt", practice: "A small practice for today", done: "I tried today's practice",
    noticed: "What I noticed", date: "Date", howToUse: "How to use this journal",
    use: ["Find a quiet moment — morning or night, five minutes is enough.", "Read the shlok slowly, then its meaning. There's no need to understand everything.", "Write whatever comes. Hindi, English or Hinglish — however it comes.", "Try the small practice, and come back to note what you noticed.", "Go at your own pace. A day can take as long as it needs."],
    note: "The Sanskrit is the original text of the Bhagavad Gita. Translations are adapted for readability, and the simple meanings, questions and practices are interpretations written for Gita Reflection — not scripture. This journal is a reflection tool, not a replacement for professional mental-health care. In India, Tele-MANAS offers free support 24×7 at 14416.",
    closing: "Looking back", closingQ: ["What stayed with you most?", "What would you like to carry forward?", "What did this time teach you about where your peace comes from?"],
    cards: "Daily Reflection Cards", cardsSub: "52 cards · one shlok and one question for each week of the year",
    cut: "Print on thick paper and cut along the lines — or keep the PDF on your phone and open one card each morning.",
    pack: "Gita-Inspired Journaling Pack", packSub: "Printable pages for daily reflection, weekly review, decisions, gratitude and a monthly look back",
    monthly: "Monthly review", monthlyRows: [["Themes I returned to this month", 4], ["Shloks that stayed with me", 3], ["Moments I'm grateful for", 4], ["What this month taught me", 5], ["One intention for next month", 2]],
    j7: "7-Day Gita Reflection Journal", j7Sub: "A gentle week with the Bhagavad Gita — one theme a day",
    j30: "30-Day Gita Reflection Journal", j30Sub: "A month of shloks, questions and small practices for a calmer mind",
    copyright: `© ${new Date().getFullYear()} Gita Reflection · For personal use. Please don't redistribute.`
  },
  hi: {
    brand: "गीता रिफ्लेक्शन", gita: "भगवद्गीता", day: n => `दिन ${n}`, translation: "अंग्रेज़ी अनुवाद · English translation", hindi: "हिन्दी भावार्थ",
    simple: "सरल शब्दों में", reflect: "चिंतन", prompt: "लिखने के लिए प्रश्न", practice: "आज के लिए एक छोटा अभ्यास", done: "मैंने आज का अभ्यास किया",
    noticed: "मैंने क्या महसूस किया", date: "तारीख़", howToUse: "इस डायरी का उपयोग कैसे करें",
    use: ["एक शांत पल चुनिए — सुबह या रात, पाँच मिनट काफ़ी हैं।", "श्लोक को धीरे से पढ़िए, फिर उसका अर्थ। सब कुछ समझना ज़रूरी नहीं।", "जो मन में आए, लिखिए। हिन्दी, English या Hinglish — जैसे भी आए।", "छोटा अभ्यास आज़माइए, और लौटकर लिखिए कि आपने क्या महसूस किया।", "अपनी गति से चलिए। एक दिन को जितना समय चाहिए, उतना लगने दीजिए।"],
    note: "संस्कृत भगवद्गीता का मूल पाठ है। अनुवाद पढ़ने में आसान बनाए गए हैं, और सरल अर्थ, प्रश्न और अभ्यास गीता रिफ्लेक्शन के लिए लिखी गई व्याख्याएँ हैं — शास्त्र नहीं। यह डायरी एक चिंतन साधन है, पेशेवर मानसिक-स्वास्थ्य देखभाल का विकल्प नहीं। भारत में Tele-MANAS 14416 पर 24×7 मुफ़्त सहायता देता है।",
    closing: "पीछे मुड़कर देखें", closingQ: ["आपके साथ सबसे ज़्यादा क्या रहा?", "आप आगे क्या साथ ले जाना चाहेंगे?", "इस समय ने आपको क्या सिखाया कि आपकी शांति कहाँ से आती है?"],
    cards: "दैनिक चिंतन कार्ड", cardsSub: "52 कार्ड · साल के हर हफ़्ते के लिए एक श्लोक और एक प्रश्न",
    cut: "मोटे काग़ज़ पर प्रिंट करके रेखाओं पर काटिए — या PDF को फ़ोन पर रखिए और हर सुबह एक कार्ड खोलिए।",
    pack: "गीता से प्रेरित जर्नलिंग पैक", packSub: "दैनिक चिंतन, साप्ताहिक समीक्षा, निर्णय, कृतज्ञता और मासिक समीक्षा के लिए प्रिंट करने योग्य पन्ने",
    monthly: "मासिक समीक्षा", monthlyRows: [["इस महीने जिन विषयों पर मैं लौटा/लौटी", 4], ["जो श्लोक मेरे साथ रहे", 3], ["जिन पलों के लिए मैं आभारी हूँ", 4], ["इस महीने ने मुझे क्या सिखाया", 5], ["अगले महीने के लिए एक संकल्प", 2]],
    j7: "7 दिन की गीता चिंतन डायरी", j7Sub: "भगवद्गीता के साथ एक कोमल सप्ताह — रोज़ एक विषय",
    j30: "30 दिन की गीता चिंतन डायरी", j30Sub: "शांत मन के लिए श्लोकों, प्रश्नों और छोटे अभ्यासों का एक महीना",
    copyright: `© ${new Date().getFullYear()} गीता रिफ्लेक्शन · व्यक्तिगत उपयोग के लिए। कृपया आगे न बाँटें।`
  }
};

const f = (lang, obj, field) => (lang === "hi" && obj.hiText?.[field]) || obj[field];

const MARK = `<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="#B8975A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 10c4 5 6 10 6 15s-2.5 9-6 12c-3.5-3-6-7-6-12s2-10 6-15z"/><path d="M18 25c-4-2-8-2-11 0 1.5 6 6.5 11 17 12"/><path d="M30 25c4-2 8-2 11 0-1.5 6-6.5 11-17 12"/><path d="M10 41h28"/></svg>`;

function doc(lang, title, pages, { size = "A5" } = {}) {
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@400;500&family=Noto+Serif+Devanagari:wght@400;500&family=Noto+Sans+Devanagari:wght@400;500&display=block" rel="stylesheet">
<style>
  @page { size: ${size}; margin: 14mm 14mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #33281F; font: 10pt/1.55 "DM Sans", "Noto Sans Devanagari", sans-serif; }
  html[lang="hi"] body { line-height: 1.7; }
  .page { break-after: page; }
  .page:last-child { break-after: auto; }
  h1, h2, h3 { font-family: "Cormorant Garamond", "Noto Serif Devanagari", serif; font-weight: 500; margin: 0 0 6pt; line-height: 1.25; }
  h1 { font-size: 26pt; } h2 { font-size: 19pt; } h3 { font-size: 10.5pt; font-family: "DM Sans", "Noto Sans Devanagari", sans-serif; color: #4C5E46; margin: 9pt 0 3pt; }
  p { margin: 0 0 6pt; }
  .eyebrow { font-size: 8pt; letter-spacing: .14em; text-transform: uppercase; color: #4C5E46; margin: 0 0 6pt; }
  html[lang="hi"] .eyebrow { letter-spacing: 0; text-transform: none; font-size: 9pt; }
  .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 170mm; border: 1px solid #D9C9A6; border-radius: 120mm 120mm 6mm 6mm; padding: 20mm 10mm; }
  .cover h1 { font-size: 28pt; margin: 14pt 0 8pt; }
  .cover p { color: #6B5C4E; max-width: 90mm; }
  .brand { font-family: "Cormorant Garamond", "Noto Serif Devanagari", serif; font-size: 13pt; margin-top: 18pt; }
  .site { font-size: 8.5pt; color: #8A6B33; }
  .sa { font-family: "Noto Serif Devanagari", serif; font-size: 11.5pt; line-height: 1.9; text-align: center; margin: 8pt 0 4pt; }
  .tr { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 10pt; color: #6B5C4E; text-align: center; margin: 0 0 8pt; }
  .arch { border: 1px solid #E2D5BB; border-radius: 60mm 60mm 4mm 4mm; padding: 10mm 8mm 4mm; margin: 4pt 0 6pt; background: #FBF8F1; }
  .ref { text-align: center; font-size: 8pt; letter-spacing: .1em; color: #7A5C28; }
  .meaning { font-family: "Cormorant Garamond", "Noto Serif Devanagari", serif; font-size: 12pt; line-height: 1.45; }
  .q { font-family: "Cormorant Garamond", "Noto Serif Devanagari", serif; font-size: 13.5pt; line-height: 1.4; }
  .lines span { display: block; height: 7mm; border-bottom: 0.6pt solid #CDBF9F; }
  .box { border: 0.6pt solid #CDBF9F; border-radius: 3mm; padding: 6pt 9pt; margin-top: 8pt; background: #FBF8F1; }
  .check { display: inline-block; width: 3.4mm; height: 3.4mm; border: 0.8pt solid #7A5C28; border-radius: 1mm; vertical-align: -0.6mm; margin-right: 5pt; }
  .fine { font-size: 8pt; color: #6B5C4E; }
  ol li { margin-bottom: 4pt; }
  .card { border: 0.8pt dashed #CDBF9F; border-radius: 4mm; padding: 8mm 7mm; text-align: center; height: 86mm; display: flex; flex-direction: column; justify-content: center; margin-bottom: 6mm; break-inside: avoid; }
  .card .meaning { font-size: 12.5pt; margin: 6pt 0; }
  .card .q { font-size: 11pt; font-style: italic; color: #6B5C4E; }
</style></head><body>${pages.join("\n")}</body></html>`;
}

function cover(lang, title, sub) {
  const t = T[lang];
  return `<section class="page"><div class="cover">${MARK}<p class="eyebrow">${t.brand}</p><h1>${esc(title)}</h1><p>${esc(sub)}</p><p class="brand">${t.brand}</p><p class="site">${SITE}</p></div></section>`;
}

function intro(lang) {
  const t = T[lang];
  return `<section class="page"><h2>${t.howToUse}</h2><ol>${t.use.map(u => `<li>${esc(u)}</li>`).join("")}</ol><p class="fine" style="margin-top:18pt">${esc(t.note)}</p><p class="fine" style="margin-top:14pt">${esc(t.copyright)}</p></section>`;
}

function versePage(lang, v, { eyebrow, title, explanation, question, prompt, practice }) {
  const t = T[lang];
  const english = `<h3>${t.translation}</h3><p>${esc(v.en)}</p>`;
  const hindi = `<h3>${t.hindi}</h3><p lang="hi">${esc(v.hi)}</p>`;
  return `
  <section class="page">
    <p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2>
    <div class="arch"><p class="sa" lang="sa">${br(v.sa)}</p><p class="tr">${br(v.tr)}</p><p class="ref">${t.gita} ${v.ch}.${v.v}</p></div>
    ${lang === "hi" ? hindi + english : english + hindi}
    <h3>${t.simple}</h3><p class="meaning">${esc(explanation)}</p>
    
  </section>
  <section class="page">
    <p class="eyebrow">${esc(eyebrow)} · ${t.reflect}</p>
    <p class="q">${esc(question)}</p>
    ${lines(3)}
    <h3>${t.prompt}</h3><p>${esc(prompt)}</p>
    ${lines(5)}
    <div class="box"><h3 style="margin-top:0">${t.practice}</h3><p style="margin:0">${esc(practice)}</p><p style="margin:6pt 0 0"><span class="check"></span>${t.done}</p></div>
    <h3>${t.noticed}</h3>${lines(2)}
    
  </section>`;
}

function closing(lang) {
  const t = T[lang];
  return `<section class="page"><h2>${t.closing}</h2>${t.closingQ.map(q => `<p class="q" style="margin-top:12pt">${esc(q)}</p>${lines(4)}`).join("")}</section>`;
}

const PRODUCTS = {
  "7-day-journal": lang => {
    const t = T[lang];
    return doc(lang, t.j7, [cover(lang, t.j7, t.j7Sub), intro(lang),
      ...SEVEN_DAYS.map(d => {
        const v = VERSE_BY_ID[d.verse];
        return versePage(lang, v, { eyebrow: t.day(d.day), title: f(lang, d, "theme"), explanation: f(lang, d, "explanation"), question: f(lang, d, "question"), prompt: f(lang, d, "prompt"), practice: f(lang, d, "practice") });
      }), closing(lang)]);
  },
  "30-day-journal": lang => {
    const t = T[lang];
    return doc(lang, t.j30, [cover(lang, t.j30, t.j30Sub), intro(lang),
      ...PROGRAM_DAYS["30-inner-peace"].map((d, i) => {
        const v = VERSE_BY_ID[d[0]];
        return versePage(lang, v, { eyebrow: t.day(i + 1), title: lang === "hi" ? d[2] : d[1], explanation: f(lang, v, "meaning"), question: f(lang, v, "question"), prompt: PROGRAM_PROMPTS[i % PROGRAM_PROMPTS.length][lang === "hi" ? 1 : 0], practice: f(lang, v, "practice") });
      }), closing(lang)]);
  },
  "daily-cards": lang => {
    const t = T[lang];
    const verses = [...VERSES].sort((a, b) => a.ch - b.ch || a.v - b.v).slice(0, 52);
    const pages = [];
    for (let i = 0; i < verses.length; i += 2) {
      pages.push(`<section class="page">${verses.slice(i, i + 2).map((v, k) => `
        <div class="card"><p class="eyebrow">${t.brand} · ${i + k + 1}/52</p><p class="sa" lang="sa">${esc(v.sa.split("\n")[0])}</p>
        <p class="meaning">“${esc(f(lang, v, "meaning"))}”</p><p class="ref">${t.gita} ${v.ch}.${v.v}</p><p class="q">${esc(f(lang, v, "question"))}</p><p class="site">${SITE}</p></div>`).join("")}</section>`);
    }
    return doc(lang, t.cards, [cover(lang, t.cards, t.cardsSub), `<section class="page"><p>${esc(t.cut)}</p><p class="fine">${esc(t.note)}</p><p class="fine" style="margin-top:14pt">${esc(t.copyright)}</p></section>`, ...pages]);
  },
  "journaling-pack": lang => {
    const t = T[lang];
    const L = pair => pair[lang === "hi" ? 1 : 0];
    const tpl = TEMPLATES.map(tp => {
      const v = VERSE_BY_ID[tp.verse];
      return `<section class="page"><p class="eyebrow">${t.brand}</p><h2>${esc(L(tp.title))}</h2>
        <p class="fine"><span lang="sa">${esc(v.sa.split("\n")[0])}</span> — “${esc(f(lang, v, "meaning"))}” (${t.gita} ${v.ch}.${v.v})</p>
        ${tp.sections.map(([label, n]) => `<h3>${esc(L(label))}</h3>${lines(n)}`).join("")}</section>`;
    });
    const monthly = `<section class="page"><p class="eyebrow">${t.brand}</p><h2>${t.monthly}</h2>${t.monthlyRows.map(([l, n]) => `<h3>${esc(l)}</h3>${lines(n)}`).join("")}</section>`;
    const prompts = `<section class="page"><h2>${lang === "hi" ? "लिखने के लिए प्रश्न" : "Prompts for any day"}</h2><ol>${JOURNAL_PROMPTS.map(p => `<li class="q" style="font-size:12pt">${esc(p[lang === "hi" ? 1 : 0])}</li>`).join("")}</ol></section>`;
    return doc(lang, t.pack, [cover(lang, t.pack, t.packSub), ...tpl, monthly, prompts]);
  }
};

async function build() {
  await mkdir(OUT, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const context = await browser.newContext();
  if (process.env.CURL_FONTS) {
    // For sandboxes where the browser can't reach Google Fonts directly.
    const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
    const cache = new Map();
    await context.route(/fonts\.(googleapis|gstatic)\.com/, async route => {
      const url = route.request().url();
      if (!cache.has(url)) cache.set(url, execFileSync("curl", ["-sS", "-m", "30", "-A", UA, url], { maxBuffer: 1 << 26 }));
      await route.fulfill({ body: cache.get(url), headers: { "content-type": url.includes("css2") ? "text/css" : "font/woff2", "access-control-allow-origin": "*" } });
    });
  }
  const page = await context.newPage();
  for (const [name, make] of Object.entries(PRODUCTS)) {
    for (const lang of ["en", "hi"]) {
      await page.setContent(make(lang), { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // Fit each page onto one A5 sheet: measure it at the printable width
      // (148mm − 28mm margins) and gently scale down anything too tall.
      await page.evaluate(() => {
        const mm = 96 / 25.4, maxH = 174 * mm;
        for (const el of document.querySelectorAll(".page")) {
          el.style.width = "120mm";
          const h = el.scrollHeight;
          if (h > maxH) el.style.zoom = String(Math.floor((maxH / h) * 100) / 100);
        }
      });
      const file = join(OUT, `${name}-${lang}.pdf`);
      const brand = T[lang].brand;
      await page.pdf({
        path: file, format: "A5", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate: `<div style="width:100%;text-align:center;font-size:7px;color:#8C7D6E;font-family:'Noto Sans Devanagari',sans-serif">${brand} · ${SITE} · <span class="pageNumber"></span></div>`
      });
      console.log(`  ✓ ${file.replace(ROOT + "/", "")}`);
    }
  }
  await browser.close();
}

build().catch(e => { console.error(e); process.exit(1); });
