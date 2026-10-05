// हिन्दी mode: every page in Hindi at phone and desktop sizes, the main flows
// with Hindi / Hinglish input, and a check that no interface text is left
// untranslated (the i18n layer records any missing keys).
//
// Usage: npm run serve (in another terminal), then  npm run test:hindi
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const require = createRequire(import.meta.url);
    return require(require.resolve("playwright", { paths: ["/opt/node22/lib/node_modules", process.env.NODE_PATH || ""] }));
  }
}

const { chromium } = await loadPlaywright();
const BASE = process.env.BASE_URL || "http://localhost:8080/";
const SHOTS = process.env.SHOTS || "";
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const DEVANAGARI = /[ऀ-ॿ]/;
const failures = [];
const missing = new Set();
const fail = m => { failures.push(m); console.log("  ✗ " + m); };
const ok = m => console.log("  ✓ " + m);

const browser = await chromium.launch();

async function localAccountsOnly(context) {
  await context.route(/\/assets\/js\/config\.js(\?.*)?$/, async r => {
    const res = await r.fetch();
    const src = (await res.text()).replace(/(supabase:\s*\{\s*url:\s*)"[^"]*"/, '$1""').replace(/anonKey:\s*"[^"]*"/, 'anonKey: ""');
    await r.fulfill({ response: res, body: src, headers: { ...res.headers(), "content-type": "text/javascript" } });
  });
}

async function newContext(viewport, { locale = "hi-IN" } = {}) {
  const ctx = await browser.newContext({ viewport, locale, isMobile: viewport.width < 800, hasTouch: viewport.width < 800 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com|chiragmirani/, r => r.abort());
  await localAccountsOnly(ctx);
  return ctx;
}

function watch(page, label) {
  page.on("pageerror", e => fail(`${label}: ${e.message}`));
  page.on("console", m => {
    if (m.type() === "error" && !/Failed to load resource|net::|ERR_/.test(m.text())) fail(`${label}: ${m.text()}`);
  });
}

async function collectMissing(page) {
  const list = await page.evaluate(() => (window.__grMissingHindi ? window.__grMissingHindi() : []));
  list.forEach(k => missing.add(k));
}

async function step(name, fn) {
  try { await fn(); ok(name); } catch (e) { fail(`${name}: ${e.message.split("\n")[0]}`); }
}

const ROUTES = ["#/", "#/reflection?e=heavy", "#/daily", "#/reflect", "#/library", "#/library?c=fear", "#/shlok/2-47",
  "#/journey", "#/summary", "#/seven-days", "#/seven-days/3", "#/signup", "#/login", "#/forgot", "#/premium", "#/shop",
  "#/about", "#/how-it-works", "#/privacy", "#/terms", "#/contact", "#/refunds", "#/programs", "#/programs/30-inner-peace",
  "#/programs/14-steadiness/1", "#/templates", "#/templates/gratitude", "#/journal", "#/collections", "#/nope"];

// ---------- 1. Every page in Hindi ----------
for (const vp of [{ name: "phone", width: 360, height: 780 }, { name: "desktop", width: 1366, height: 900 }]) {
  console.log(`\nहिन्दी · ${vp.name} (${vp.width}×${vp.height})`);
  const ctx = await newContext(vp);
  const page = await ctx.newPage();
  watch(page, vp.name);
  await page.goto(BASE + "#/");
  await page.waitForSelector("main h1");
  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  if (htmlLang !== "hi") fail(`${vp.name}: a Hindi browser should default to Hindi (html lang = ${htmlLang})`);
  for (const route of ROUTES) {
    await page.goto(BASE + route);
    await page.waitForSelector("main h1", { timeout: 8000 }).catch(() => fail(`${vp.name} ${route}: no h1`));
    await page.waitForTimeout(150);
    const info = await page.evaluate(() => ({
      h1: document.querySelector("main h1")?.textContent || "",
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      nav: [...document.querySelectorAll(".bottom-nav span, .top-nav a")].map(e => e.textContent).join(" ")
    }));
    if (!/[ऀ-ॿ]/.test(info.h1) && !/^#\/shlok/.test(route)) fail(`${vp.name} ${route}: heading not in Hindi ("${info.h1}")`);
    if (info.sw > info.cw) fail(`${vp.name} ${route}: horizontal overflow ${info.sw} > ${info.cw}`);
    if (!DEVANAGARI.test(info.nav)) fail(`${vp.name} ${route}: navigation not in Hindi`);
    if (SHOTS && ["#/", "#/reflection?e=heavy", "#/daily", "#/reflect", "#/library", "#/seven-days/3", "#/premium", "#/about"].includes(route)) {
      await page.screenshot({ path: `${SHOTS}/hi-${vp.name}-${route.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}.png`, fullPage: true });
    }
  }
  await collectMissing(page);
  ok("pages rendered in Hindi");
  await ctx.close();
}

// ---------- 2. Flows in Hindi ----------
console.log("\nहिन्दी flows");
const ctx = await newContext({ width: 390, height: 844 });
const page = await ctx.newPage();
watch(page, "flow");
const text = async sel => page.locator(sel).first().innerText({ timeout: 5000 });
async function until(fn, msg) {
  for (let i = 0; i < 30; i++) { if (await fn()) return; await page.waitForTimeout(150); }
  throw new Error(msg);
}

await step("Hindi (Devanagari) input → Hindi reflection, भावार्थ first", async () => {
  await page.goto(BASE + "#/");
  await page.fill("#ask-input", "मन बहुत भारी है, कुछ समझ नहीं आ रहा");
  await page.click(".ask-btn");
  await page.waitForSelector(".you-said blockquote");
  const why = await text(".why-text");
  const q = await text(".moment .question");
  if (!DEVANAGARI.test(why) || !DEVANAGARI.test(q)) throw new Error(`why/question not Hindi: ${why.slice(0, 40)} | ${q.slice(0, 40)}`);
  const firstLayer = await page.locator(".layers .layer").first().getAttribute("lang");
  if (firstLayer !== "hi") throw new Error(`first layer is ${firstLayer}`);
});

await step("Hinglish input works in Hindi mode", async () => {
  await page.goto(BASE + "#/");
  await page.fill("#ask-input", "bahut thak gaya hoon yaar");
  await page.click(".ask-btn");
  await page.waitForSelector(".you-said blockquote");
  const matched = await text(".you-said .fine");
  if (!/थकान/.test(matched)) throw new Error(`matched to "${matched}"`);
});

await step("journal box accepts Hindi, English and Hinglish together", async () => {
  const mixed = "आज मन शांत है. Feeling lighter, thoda better lag raha hai.";
  await page.fill("#reflection-text", mixed);
  const v = await page.inputValue("#reflection-text");
  if (v !== mixed) throw new Error("text changed");
});

await step("switching to English re-renders the same reflection in English", async () => {
  const qHi = await text(".moment .question");
  await page.click("#lang-toggle");
  await page.waitForFunction(() => document.documentElement.lang === "en");
  await page.waitForSelector(".moment .question");
  const qEn = await text(".moment .question");
  if (DEVANAGARI.test(qEn) || qEn === qHi) throw new Error(`question still "${qEn}"`);
  const draft = await page.inputValue("#reflection-text");
  if (!/आज मन शांत है/.test(draft)) throw new Error("draft lost when switching language");
  await page.click("#lang-toggle");
  await page.waitForFunction(() => document.documentElement.lang === "hi");
});

await step("I don't know what I feel → Hindi states", async () => {
  await page.goto(BASE + "#/");
  await page.click("[data-unknown]");
  const title = await text(".unknown-title");
  if (!/कोई बात नहीं/.test(title)) throw new Error(title);
  await page.click('#unknown-panel [data-emotion="numb"]');
  await page.waitForSelector(".you-said blockquote");
  if (!/सुन्न/.test(await text(".you-said blockquote"))) throw new Error("said not Hindi");
});

await step("crisis language in Hindi shows support", async () => {
  await page.goto(BASE + "#/");
  await page.fill("#ask-input", "मुझे जीने का मन नहीं है");
  await page.click(".ask-btn");
  await page.waitForSelector(".crisis");
  if (!/अकेले नहीं/.test(await text(".crisis h2"))) throw new Error("crisis not in Hindi");
});

await step("sign up, save a Hindi reflection, see it in मेरी यात्रा", async () => {
  await page.goto(BASE + "#/");
  await page.click('[data-emotion="lonely"]');
  await page.fill("#reflection-text", "आज दोस्तों की बहुत याद आ रही है।");
  await page.click('[data-act="save"]');
  await page.waitForSelector(".join-modal");
  if (!DEVANAGARI.test(await text(".join-modal .modal-title"))) throw new Error("join prompt not Hindi");
  await page.click('.join-modal a[href^="#/signup"]');
  await page.fill("#name", "मीरा");
  await page.fill("#email", "meera.hi@example.com");
  await page.fill("#password", "short");
  await page.click('#auth-form button[type="submit"]');
  await until(async () => /कम से कम 8/.test(await text(".form-error")), "error not in Hindi");
  await page.fill("#password", "shant-man-123");
  await page.click('#auth-form button[type="submit"]');
  await page.waitForURL(/#\/reflection/);
  await page.goto(BASE + "#/journey");
  await page.waitForSelector(".entry");
  if (!/दोस्तों की बहुत याद/.test(await text(".entry .entry-text"))) throw new Error("entry text missing");
  if (!/मीरा/.test(await text("main h1"))) throw new Error("greeting missing name");
});

await step("7-day journey day in Hindi, with Hindi journal entry", async () => {
  await page.goto(BASE + "#/seven-days/2");
  await page.waitForSelector("#day-text");
  if (!/डर/.test(await text("main h1"))) throw new Error("day theme not Hindi");
  await page.fill("#day-text", "मुझे डर लगता है कि लोग क्या कहेंगे। But I'll try anyway.");
  await page.click('[data-act="complete"]');
  await until(async () => /सहेजा गया/.test(await text(".status")), "status not Hindi");
});

await step("conversation in Hindi with a Hinglish message", async () => {
  await page.goto(BASE + "#/reflect");
  await page.fill("#composer-input", "samajh nahi aa raha kya karun, job chhod du ya nahi");
  await page.keyboard.press("Enter");
  await page.waitForSelector(".msg.guide .teach");
  const ack = await text(".msg.guide .ack");
  if (!DEVANAGARI.test(ack)) throw new Error(`ack "${ack}"`);
  await page.click('[data-dir="another"]');
  await page.waitForFunction(() => document.querySelectorAll(".msg.guide .teach").length === 2);
  const userMsgs = await page.locator(".msg.user").allInnerTexts();
  if (!DEVANAGARI.test(userMsgs[1] || "")) throw new Error(`direction chip text "${userMsgs[1]}"`);
});

await step("library search in Hindi", async () => {
  await page.goto(BASE + "#/library");
  await page.fill("#search-input", "डर");
  await page.waitForTimeout(400);
  const n = await page.locator(".verse-card").count();
  if (n < 2) throw new Error(`only ${n} results for डर`);
  if (!DEVANAGARI.test(await text("#results-meta"))) throw new Error("meta not Hindi");
});

await step("share card renders with Devanagari", async () => {
  await page.goto(BASE + "#/shlok/2-47");
  await page.click('[data-act="share"]');
  await page.waitForSelector(".share-preview img", { timeout: 8000 });
  const alt = await page.getAttribute(".share-preview img", "alt");
  if (!DEVANAGARI.test(alt)) throw new Error("card alt not Hindi");
  await page.keyboard.press("Escape");
});

await step("monthly summary and profile language setting", async () => {
  await page.goto(BASE + "#/summary");
  await page.waitForSelector(".stat-n");
  if (!/इस महीने ने आपको क्या सिखाया/.test(await text(".summary"))) throw new Error("summary not Hindi");
  await page.goto(BASE + "#/profile");
  await page.click('[data-lang-opt="en"]');
  await page.waitForFunction(() => document.documentElement.lang === "en");
  if (DEVANAGARI.test(await text(".settings .section-label >> nth=1"))) throw new Error("profile did not switch to English");
  await page.click('[data-lang-opt="hi"]');
  await page.waitForFunction(() => document.documentElement.lang === "hi");
});

await step("language choice is remembered after reload", async () => {
  await page.reload();
  await page.waitForSelector("main h1");
  if (await page.evaluate(() => document.documentElement.lang) !== "hi") throw new Error("not remembered");
});

await collectMissing(page);
await ctx.close();

// ---------- 3. Hindi guide pages ----------
console.log("\nहिन्दी guide pages");
await step("Hindi guides render, link to English, and open the app in Hindi", async () => {
  const c = await newContext({ width: 360, height: 780 }, { locale: "en-GB" });
  const p = await c.newPage();
  for (const path of ["gita/hi/", "gita/hi/bhagavad-gita-for-anxiety/", "gita/hi/verse/2-47/"]) {
    await p.goto(BASE + path);
    const h1 = await p.locator("main h1").innerText();
    if (!DEVANAGARI.test(h1)) throw new Error(`${path}: h1 "${h1}"`);
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, en: document.querySelector('link[hreflang="en"]')?.href }));
    if (m.sw > m.cw) throw new Error(`${path}: overflow`);
    if (!m.en || /\/hi\//.test(m.en)) throw new Error(`${path}: missing English alternate`);
    if (!(await p.locator(".lang-link").isVisible())) throw new Error(`${path}: language link hidden on phone`);
  }
  await p.goto(BASE + "gita/hi/bhagavad-gita-for-fear/");
  await p.click(".static-cta .btn");
  await p.waitForSelector(".you-said blockquote");
  if (await p.evaluate(() => document.documentElement.lang) !== "hi") throw new Error("app did not open in Hindi");
  if (/lang=/.test(p.url())) throw new Error("lang parameter left in the address");
  await c.close();
});

// ---------- 3. English browsers still start in English ----------
console.log("\nEnglish default");
await step("an English browser starts in English with a हिं switch", async () => {
  const c = await newContext({ width: 390, height: 844 }, { locale: "en-GB" });
  const p = await c.newPage();
  await p.goto(BASE + "#/");
  await p.waitForSelector("main h1");
  const h1 = await p.locator("main h1").innerText();
  const btn = await p.locator("#lang-toggle").innerText();
  if (h1 !== "What's troubling you?" || btn !== "हिं") throw new Error(`${h1} / ${btn}`);
  await c.close();
});

await browser.close();
if (missing.size) fail(`untranslated interface text: ${[...missing].map(s => `"${s}"`).join(", ")}`);
else ok("no untranslated interface text");
console.log(failures.length ? `\n${failures.length} problem(s) found.` : "\nAll हिन्दी checks passed.");
process.exit(failures.length ? 1 : 0);
