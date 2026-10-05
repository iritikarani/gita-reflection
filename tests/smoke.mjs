// End-to-end smoke test: every route at phone, tablet, iPad, laptop and desktop
// sizes (no horizontal overflow, no JS errors), plus the core user journeys.
//
// Usage: npm run serve  (in another terminal), then  npm test
// Env:   BASE_URL (default http://localhost:8080/), SHOTS=dir to save screenshots
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

const VIEWPORTS = [
  { name: "phone", width: 375, height: 812, mobile: true },
  { name: "phone-small", width: 320, height: 640, mobile: true },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "ipad-landscape", width: 1180, height: 820, mobile: true },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1920, height: 1080 }
];

const ROUTES = [
  "#/", "#/reflection?e=tired", "#/daily", "#/reflect", "#/library", "#/library?q=2.47", "#/library?c=fear",
  "#/shlok/2-47", "#/shlok/6-35", "#/journey", "#/summary", "#/seven-days", "#/seven-days/1", "#/seven-days/7",
  "#/signup", "#/login", "#/forgot", "#/premium", "#/shop", "#/about", "#/how-it-works", "#/privacy",
  "#/terms", "#/contact", "#/does-not-exist",
  "gita/", "gita/bhagavad-gita-for-anxiety/", "gita/verse/2-47/"
];

const failures = [];
const fail = (msg) => { failures.push(msg); console.log("  ✗ " + msg); };
const ok = (msg) => console.log("  ✓ " + msg);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

function watch(page, label) {
  const errors = [];
  page.on("pageerror", e => errors.push(`${label}: ${e.message}`));
  page.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    // External resources (fonts, optional dataset) may be blocked in CI sandboxes.
    if (/Failed to load resource|ERR_|net::|fonts\.g|chiragmirani/i.test(t)) return;
    errors.push(`${label}: ${t}`);
  });
  return errors;
}

async function settle(page) {
  await page.waitForSelector("main h1", { timeout: 8000 });
  await page.waitForTimeout(250);
}

// ---------- 1. Every route at every viewport ----------
for (const vp of VIEWPORTS) {
  console.log(`\n${vp.name} (${vp.width}×${vp.height})`);
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com|chiragmirani/, r => r.abort());
  const page = await ctx.newPage();
  const errors = watch(page, vp.name);
  for (const route of ROUTES) {
    await page.goto(BASE + route);
    try { await settle(page); } catch { fail(`${vp.name} ${route}: no h1 rendered`); continue; }
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll("body *")].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > document.documentElement.clientWidth + 1) && getComputedStyle(el).position !== "fixed" && !el.closest(".ambient");
      }).slice(0, 3).map(el => el.tagName.toLowerCase() + "." + [...el.classList].join("."))
    }));
    if (m.sw > m.cw) fail(`${vp.name} ${route}: horizontal overflow ${m.sw} > ${m.cw} (${m.offenders.join(", ")})`);
    if (SHOTS && ["#/", "#/reflection?e=tired", "#/daily", "#/reflect", "#/library", "#/journey", "#/seven-days/1", "#/premium", "gita/bhagavad-gita-for-anxiety/"].includes(route)) {
      const name = route.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home";
      await page.screenshot({ path: `${SHOTS}/${vp.name}-${name}.png`, fullPage: true });
    }
  }
  // Mobile nav visible on small screens, top nav on large.
  await page.goto(BASE + "#/");
  await settle(page);
  const navs = await page.evaluate(() => ({
    bottom: getComputedStyle(document.querySelector(".bottom-nav")).display !== "none",
    top: getComputedStyle(document.querySelector(".top-nav")).display !== "none"
  }));
  if (vp.width <= 860 ? !navs.bottom || navs.top : navs.bottom || !navs.top) fail(`${vp.name}: wrong navigation shown (${JSON.stringify(navs)})`);
  errors.forEach(fail);
  if (!errors.length) ok("no JS errors, routes rendered");
  await ctx.close();
}

// ---------- 2. Core journeys ----------
console.log("\nflows");
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route(/fonts\.(googleapis|gstatic)\.com|chiragmirani/, r => r.abort());
const page = await ctx.newPage();
const errors = watch(page, "flow");

async function step(name, fn) {
  try { await fn(); ok(name); } catch (e) { fail(`${name}: ${e.message.split("\n")[0]}`); }
}
const expectText = async (sel, re) => {
  let t = "";
  for (let i = 0; i < 25; i++) {
    t = await page.locator(sel).first().innerText({ timeout: 5000 });
    if (re.test(t)) return;
    await page.waitForTimeout(200);
  }
  throw new Error(`"${sel}" was "${t.slice(0, 120)}"`);
};

await step("free-text Hinglish reflection", async () => {
  await page.goto(BASE + "#/");
  await page.fill("#ask-input", "bahut thak gaya hoon, kuch samajh nahi aa raha");
  await page.click(".ask-btn");
  await page.waitForSelector(".you-said blockquote");
  await expectText(".you-said blockquote", /thak gaya/);
  await expectText("#why-h", /Why this may speak to you/i);
  await expectText(".question", /\?$/);
  await page.waitForSelector(".sanskrit");
});

await step("Hindi reflection", async () => {
  await page.goto(BASE + "#/");
  await page.fill("#ask-input", "मुझे भविष्य को लेकर बहुत डर लगता है");
  await page.click(".ask-btn");
  await page.waitForSelector(".you-said blockquote");
});

await step("read another changes the verse", async () => {
  const before = await page.locator(".verse-ref").first().innerText();
  await page.click('[data-act="another"]');
  await page.waitForTimeout(400);
  const after = await page.locator(".verse-ref").first().innerText();
  if (before === after) throw new Error("same verse shown");
});

await step("quick choice chip", async () => {
  await page.goto(BASE + "#/");
  await page.click('[data-emotion="overthinking"]');
  await page.waitForSelector(".you-said blockquote");
  await expectText(".you-said blockquote", /overthinking/i);
});

await step("I don't know what I feel → Numb", async () => {
  await page.goto(BASE + "#/");
  await page.click("[data-unknown]");
  await expectText(".unknown-title", /That's okay\. You don't have to name it\./);
  await page.click('#unknown-panel [data-emotion="numb"]');
  await page.waitForSelector(".you-said blockquote");
  await expectText(".you-said blockquote", /numb/i);
});

await step("crisis language shows support, not a verse", async () => {
  await page.goto(BASE + "#/");
  await page.fill("#ask-input", "I don't want to live anymore");
  await page.click(".ask-btn");
  await page.waitForSelector(".crisis");
  await expectText(".crisis", /14416/);
  if (!page.url().endsWith("#/")) throw new Error("navigated away to a reflection");
});

await step("one save opens one prompt, even after visiting other pages", async () => {
  for (const r of ["#/daily", "#/journey", "#/library", "#/"]) { await page.goto(BASE + r); await settle(page); }
  await page.click('[data-emotion="tired"]');
  await page.waitForSelector("#reflection-text");
  await page.click('[data-act="save"]');
  await page.waitForSelector(".join-modal");
  await page.waitForTimeout(300);
  const n = await page.locator(".modal-backdrop").count();
  if (n !== 1) throw new Error(`${n} dialogs opened`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
});

await step("save as guest asks to create an account", async () => {
  await page.goto(BASE + "#/");
  await page.click('[data-emotion="scared"]');
  await page.waitForSelector("#reflection-text");
  await page.fill("#reflection-text", "I am afraid the interview will go badly, but I've prepared.");
  await page.click('[data-act="save"]');
  await page.waitForSelector(".join-modal");
  await page.click('.join-modal a[href^="#/signup"]');
  await page.waitForSelector("#auth-form");
});

await step("signup validation errors are shown", async () => {
  await page.fill("#name", "Asha");
  await page.fill("#email", "not-an-email");
  await page.fill("#password", "short");
  await page.click('#auth-form button[type="submit"]');
  await expectText(".form-error", /valid email/i);
});

await step("signup completes and pending reflection is saved", async () => {
  await page.fill("#email", "asha@example.com");
  await page.fill("#password", "quiet-mind-1");
  await page.click('#auth-form button[type="submit"]');
  await page.waitForURL(/#\/reflection/);
  await page.goto(BASE + "#/journey");
  await page.waitForSelector(".entry");
  await expectText(".entry .entry-text", /interview/);
});

await step("journey filters and pattern", async () => {
  for (const e of ["tired", "overthinking"]) {
    await page.goto(BASE + "#/");
    await page.click(`[data-emotion="${e}"]`);
    await page.waitForSelector("#reflection-text");
    await page.fill("#reflection-text", `A reflection about feeling ${e}, written slowly and honestly.`);
    await page.click('[data-act="save"]');
    await page.waitForSelector(".save-note a");
  }
  await page.goto(BASE + "#/journey");
  await page.waitForSelector(".pattern-text");
  await expectText(".pattern-text", /Your recent reflections have/);
  await page.click('[data-filter="fear"]');
  const n = await page.locator(".entry").count();
  if (n !== 1) throw new Error(`expected 1 fear entry, got ${n}`);
});

await step("monthly summary", async () => {
  await page.goto(BASE + "#/summary");
  await page.waitForSelector(".stat-n");
  await expectText(".stat-n", /^[0-9]+$/);
  await expectText(".summary", /What did this month teach you\?/);
});

await step("daily gita save", async () => {
  await page.goto(BASE + "#/daily");
  await page.fill("#daily-text", "Today I'll do one thing well.");
  await page.click('[data-act="save"]');
  await page.waitForTimeout(300);
  await expectText("#toast", /Saved/);
});

await step("library search by verse and emotion", async () => {
  await page.goto(BASE + "#/library");
  await page.fill("#search-input", "2.47");
  await page.waitForTimeout(400);
  await expectText("#results", /2\.47/);
  await page.fill("#search-input", "afraid");
  await page.waitForTimeout(400);
  const n = await page.locator(".verse-card").count();
  if (n < 2) throw new Error(`only ${n} results for "afraid"`);
});

await step("shlok page save verse + share card renders", async () => {
  await page.goto(BASE + "#/shlok/2-47");
  await page.click("[data-save-verse]");
  await expectText("[data-save-verse]", /Saved/);
  await page.click('[data-act="share"]');
  await page.waitForSelector(".share-preview img", { timeout: 8000 });
  await page.keyboard.press("Escape");
});

await step("7-day journey: complete all days → completion card", async () => {
  for (let d = 1; d <= 7; d++) {
    await page.goto(BASE + `#/seven-days/${d}`);
    await page.fill("#day-text", `Day ${d} notes.`);
    await page.click('[data-act="complete"]');
    await page.waitForTimeout(200);
  }
  await page.waitForURL(/#\/seven-days$/);
  await expectText("#done-h", /You completed your 7-day reflection journey\./);
  await page.waitForSelector(".completion-card canvas", { timeout: 8000 });
});

await step("conversation: message, direction, crisis", async () => {
  await page.goto(BASE + "#/reflect");
  await page.fill("#composer-input", "I don't know whether I should continue.");
  await page.keyboard.press("Enter");
  await page.waitForSelector(".msg.guide .teach");
  await page.click('[data-dir="another"]');
  await page.waitForFunction(() => document.querySelectorAll(".msg.guide .teach").length === 2);
  await page.click('[data-dir="sit"]');
  await page.waitForSelector(".msg.sit");
  await page.fill("#composer-input", "I want to end my life");
  await page.keyboard.press("Enter");
  await page.waitForSelector(".msg .crisis");
});

await step("2-minute reflection opens and closes with Escape", async () => {
  await page.goto(BASE + "#/daily");
  await page.click('[data-act="reflect"]');
  await page.waitForSelector(".breathe.show");
  await page.keyboard.press("Escape");
  await page.waitForSelector(".breathe", { state: "detached" });
});

await step("profile: dusk theme, logout, login, wrong password", async () => {
  await page.goto(BASE + "#/profile");
  await page.click('[data-theme-opt="dusk"]');
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  if (theme !== "dusk") throw new Error(`theme is ${theme}`);
  await page.click(".settings [data-logout]");
  await page.goto(BASE + "#/login");
  await page.fill("#email", "asha@example.com");
  await page.fill("#password", "wrong-password");
  await page.click('#auth-form button[type="submit"]');
  await expectText(".form-error", /couldn't find/);
  await page.fill("#password", "quiet-mind-1");
  await page.click('#auth-form button[type="submit"]');
  await page.waitForURL(/#\/journey/);
});

await step("forgot password resets on this device", async () => {
  await page.evaluate(() => localStorage.removeItem("gr.session"));
  await page.goto(BASE + "#/forgot");
  await page.fill("#email", "asha@example.com");
  await page.click('#auth-form button[type="submit"]');
  await page.waitForSelector(".reset-step:not([hidden])");
  await page.fill("#password", "new-quiet-mind-2");
  await page.click('#auth-form button[type="submit"]');
  await page.waitForURL(/#\/journey/);
});

await step("keyboard: skip link and focus visible", async () => {
  await page.goto(BASE + "#/");
  await page.reload();
  await settle(page);
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.className);
  if (!/skip-link/.test(focused)) throw new Error(`first tab focused "${focused}"`);
});

await step("premium shows coming soon without payment links", async () => {
  await page.goto(BASE + "#/premium");
  await page.click('[data-buy="monthly"]');
  await page.waitForSelector(".modal-title");
  await expectText(".modal-title", /Coming soon/);
});

errors.forEach(fail);
await browser.close();

console.log(failures.length ? `\n${failures.length} problem(s) found.` : "\nAll checks passed.");
process.exit(failures.length ? 1 : 0);
