// End-to-end tests for Supabase mode, using the real vendored Supabase client
// against an in-memory mock of the Supabase API (tests/mock-supabase.mjs).
//
// Usage: npm run serve (in another terminal), then  npm run test:supabase
import { createRequire } from "node:module";
import { createMockSupabase, enableSupabaseConfig } from "./mock-supabase.mjs";

async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const require = createRequire(import.meta.url);
    return require(require.resolve("playwright", { paths: ["/opt/node22/lib/node_modules", process.env.NODE_PATH || ""] }));
  }
}

const { chromium } = await loadPlaywright();
const BASE = process.env.BASE_URL || "http://localhost:8080/";
const browser = await chromium.launch();
const mock = createMockSupabase();
const failures = [];
const jsErrors = [];

async function newPage({ viewport = { width: 390, height: 844 } } = {}) {
  const context = await browser.newContext({ viewport });
  await context.route(/fonts\.(googleapis|gstatic)\.com|chiragmirani/, r => r.abort());
  await enableSupabaseConfig(context, mock);
  const page = await context.newPage();
  page.on("pageerror", e => jsErrors.push(e.message));
  page.on("console", m => {
    if (m.type() === "error" && !/Failed to load resource|net::|ERR_/.test(m.text())) jsErrors.push(m.text());
  });
  return { context, page };
}

async function step(name, fn) {
  try { await fn(); console.log("  ✓ " + name); }
  catch (e) { failures.push(`${name}: ${e.message.split("\n")[0]}`); console.log("  ✗ " + name + ": " + e.message.split("\n")[0]); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
async function waitText(page, sel, re) {
  for (let i = 0; i < 40; i++) {
    const t = await page.locator(sel).first().innerText().catch(() => "");
    if (re.test(t)) return t;
    await page.waitForTimeout(150);
  }
  throw new Error(`${sel} never matched ${re}`);
}
async function until(fn, msg) {
  for (let i = 0; i < 40; i++) { if (await fn()) return; await new Promise(r => setTimeout(r, 150)); }
  throw new Error(msg);
}

const EMAIL = "meera@example.com";
const PASSWORD = "steady-mind-7";

console.log("\nsupabase mode");
const { context, page } = await newPage();

await step("pages render with Supabase enabled", async () => {
  for (const route of ["#/", "#/daily", "#/library", "#/journey", "#/privacy", "#/how-it-works", "#/signup", "#/forgot"]) {
    await page.goto(BASE + route);
    await page.waitForSelector("main h1");
  }
  await page.goto(BASE + "#/privacy");
  await waitText(page, "main", /Supabase/);
});

await step("first visit renders without waiting for the Supabase client", async () => {
  const other = await newPage();
  await other.context.route(/supabase-slim\.mjs/, async r => { await new Promise(res => setTimeout(res, 4000)); await r.continue(); });
  const t0 = Date.now();
  await other.page.goto(BASE + "#/");
  await other.page.waitForSelector("main .hero-title", { timeout: 3000 });
  assert(Date.now() - t0 < 3000, "home waited for the Supabase client");
  await other.context.close();
});

await step("guest save → sign up → reflection stored in the database", async () => {
  await page.goto(BASE + "#/");
  await page.click('[data-emotion="lonely"]');
  await page.fill("#reflection-text", "I miss the friends I used to see every day.");
  await page.click('[data-act="save"]');
  await page.click('.join-modal a[href^="#/signup"]');
  await page.fill("#name", "Meera");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.click('#auth-form button[type="submit"]');
  await page.waitForURL(/#\/reflection/);
  await until(() => mock.rowsFor("reflections", EMAIL).length === 1, "reflection row never reached the database");
  const row = mock.rowsFor("reflections", EMAIL)[0];
  assert(row.body.includes("friends") && row.theme_group === "relationships" && row.verse_id, `unexpected row ${JSON.stringify(row)}`);
  assert(mock.profileFor(EMAIL)?.name === "Meera", "profile not created with name");
});

await step("session and data survive a reload", async () => {
  await page.goto(BASE + "#/journey");
  await page.reload();
  await page.waitForSelector(".entry");
  await waitText(page, ".entry .entry-text", /friends/);
  await waitText(page, "main h1", /Meera/);
});

await step("saved verse, journey day, month note and edits sync", async () => {
  await page.goto(BASE + "#/shlok/6-5");
  await page.click("[data-save-verse]");
  await page.goto(BASE + "#/seven-days/1");
  await page.fill("#day-text", "Letting go of the result of my exam.");
  await page.click('[data-act="complete"]');
  await page.goto(BASE + "#/summary");
  await page.fill("#month-note", "Slow down.");
  await until(() => mock.rowsFor("month_notes", EMAIL)[0]?.body === "Slow down.", "month note not stored");
  await until(() => mock.rowsFor("saved_verses", EMAIL).some(r => r.verse_id === "6.5"), "saved verse not stored");
  await until(() => {
    const j = mock.rowsFor("journey_entries", EMAIL)[0];
    return j && j.done && j.day === 1 && j.reflection_id && mock.rowsFor("reflections", EMAIL).some(r => r.id === j.reflection_id);
  }, "journey entry not stored with its reflection");
  // Update an existing reflection (no duplicate row)
  await page.goto(BASE + "#/seven-days/1");
  await page.fill("#day-text", "Letting go, again.");
  await page.click('[data-act="complete"]');
  await until(() => mock.rowsFor("reflections", EMAIL).filter(r => r.source === "journey").length === 1 &&
    mock.rowsFor("reflections", EMAIL).find(r => r.source === "journey").body === "Letting go, again.", "journey reflection not updated in place");
});

await step("another device sees the same reflections", async () => {
  const other = await newPage({ viewport: { width: 1366, height: 900 } });
  await other.page.goto(BASE + "#/login");
  await other.page.fill("#email", EMAIL);
  await other.page.fill("#password", PASSWORD);
  await other.page.click('#auth-form button[type="submit"]');
  await other.page.waitForURL(/#\/journey/);
  await other.page.waitForSelector(".entry");
  const n = await other.page.locator(".entry").count();
  assert(n === 2, `expected 2 entries on the other device, saw ${n}`);
  await other.page.goto(BASE + "#/shlok/6-5");
  await waitText(other.page, "[data-save-verse]", /Saved/);
  await other.context.close();
});

await step("delete a reflection", async () => {
  await page.goto(BASE + "#/journey");
  await page.click(".entry [data-delete] >> nth=0");
  await page.click(".modal [data-yes]");
  await until(() => mock.rowsFor("reflections", EMAIL).length === 1, "reflection not deleted in database");
});

await step("log out, wrong password, log in", async () => {
  await page.goto(BASE + "#/profile");
  await page.click(".settings [data-logout]");
  await page.waitForURL(/#\/$/);
  await page.goto(BASE + "#/login");
  await page.fill("#email", EMAIL);
  await page.fill("#password", "not-my-password");
  await page.click('#auth-form button[type="submit"]');
  await waitText(page, ".form-error", /don't match an account/);
  await page.fill("#password", PASSWORD);
  await page.click('#auth-form button[type="submit"]');
  await page.waitForURL(/#\/journey/);
});

await step("duplicate sign-up shows a friendly message", async () => {
  const other = await newPage();
  await other.page.goto(BASE + "#/signup");
  await other.page.fill("#name", "Meera");
  await other.page.fill("#email", EMAIL);
  await other.page.fill("#password", "another-pass-1");
  await other.page.click('#auth-form button[type="submit"]');
  await waitText(other.page, ".form-error", /already exists/);
  await other.context.close();
});

await step("email delivery failure shows a gentle message", async () => {
  mock.state.emailFails = true;
  const other = await newPage();
  await other.page.goto(BASE + "#/signup");
  await other.page.fill("#name", "Test");
  await other.page.fill("#email", "nomail@example.com");
  await other.page.fill("#password", "quiet-mind-11");
  await other.page.click('#auth-form button[type="submit"]');
  await waitText(other.page, ".form-error", /couldn't send the email just now/);
  const t = await other.page.locator(".form-error").innerText();
  assert(!/Error sending/.test(t), "raw server error shown");
  await other.context.close();
  mock.state.emailFails = false;
});

await step("forgot password sends an email link", async () => {
  const other = await newPage();
  await other.page.goto(BASE + "#/forgot");
  await other.page.fill("#email", EMAIL);
  await other.page.click('#auth-form button[type="submit"]');
  await waitText(other.page, "main h1", /Check your inbox/);
  const sent = mock.log.find(l => l.type === "recover" && l.email === EMAIL);
  assert(sent && sent.redirectTo?.startsWith(BASE), `recover not requested with redirect: ${JSON.stringify(sent)}`);
  await other.context.close();
});

await step("reset link → choose a new password → log in with it", async () => {
  const other = await newPage();
  const s = mock.issueSessionFor(EMAIL);
  await other.page.goto(`${BASE}#access_token=${s.access_token}&expires_at=${s.expires_at}&expires_in=3600&refresh_token=${s.refresh_token}&token_type=bearer&type=recovery`);
  await other.page.waitForURL(/#\/reset$/);
  await other.page.waitForSelector("#password");
  await other.page.fill("#password", "brand-new-calm-9");
  await other.page.click('#auth-form button[type="submit"]');
  await other.page.waitForURL(/#\/journey/);
  assert(mock.userByEmail(EMAIL).password === "brand-new-calm-9", "password not updated");
  await other.context.close();
  const fresh = await newPage();
  await fresh.page.goto(BASE + "#/login");
  await fresh.page.fill("#email", EMAIL);
  await fresh.page.fill("#password", "brand-new-calm-9");
  await fresh.page.click('#auth-form button[type="submit"]');
  await fresh.page.waitForURL(/#\/journey/);
  await fresh.context.close();
});

await step("expired email link shows a gentle message", async () => {
  const other = await newPage();
  await other.page.goto(`${BASE}#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`);
  await waitText(other.page, "#toast", /expired or was already used/);
  await other.page.waitForSelector("main .hero-title");
  await other.context.close();
});

await step("email confirmation flow keeps the pending reflection", async () => {
  mock.state.autoConfirm = false;
  const other = await newPage();
  await other.page.goto(BASE + "#/");
  await other.page.click('[data-emotion="courage"]');
  await other.page.fill("#reflection-text", "I want to speak up at work.");
  await other.page.click('[data-act="save"]');
  await other.page.click('.join-modal a[href^="#/signup"]');
  await other.page.fill("#name", "Ravi");
  await other.page.fill("#email", "ravi@example.com");
  await other.page.fill("#password", "quiet-courage-3");
  await other.page.click('#auth-form button[type="submit"]');
  await waitText(other.page, "main h1", /Check your inbox/);
  // Logging in before confirming is refused kindly
  await other.page.goto(BASE + "#/login");
  await other.page.fill("#email", "ravi@example.com");
  await other.page.fill("#password", "quiet-courage-3");
  await other.page.click('#auth-form button[type="submit"]');
  await waitText(other.page, ".form-error", /confirm your email/);
  // Click the confirmation link (same browser, new tab)
  mock.userByEmail("ravi@example.com").confirmed = true;
  const s = mock.issueSessionFor("ravi@example.com");
  const tab = await other.context.newPage();
  await tab.goto(`${BASE}#access_token=${s.access_token}&expires_at=${s.expires_at}&expires_in=3600&refresh_token=${s.refresh_token}&token_type=bearer&type=signup`);
  await tab.waitForURL(/#\/journey/);
  await waitText(tab, "#toast", /email is confirmed, and your reflection is saved/);
  await until(() => mock.rowsFor("reflections", "ravi@example.com").some(r => /speak up/.test(r.body)), "pending reflection not saved after confirmation");
  await other.context.close();
  mock.state.autoConfirm = true;
});

await step("free limit is respected (client and server)", async () => {
  const u = mock.userByEmail(EMAIL);
  for (let i = mock.rowsFor("reflections", EMAIL).length; i < 50; i++) {
    mock.tables.reflections.push({ id: `seed-${i}`, user_id: u.id, created_at: new Date(Date.now() - i * 1000).toISOString(), verse_id: "2.47", body: `seed ${i}`, theme_group: "peace" });
  }
  await page.goto(BASE + "#/");
  await page.reload();
  await page.click('[data-emotion="tired"]');
  await page.click('[data-act="save"]');
  await waitText(page, ".modal-title", /journal is full/);
  assert(mock.rowsFor("reflections", EMAIL).length === 50, "a 51st reflection was stored");
});

await step("plan cannot be changed from the browser", async () => {
  const res = await page.evaluate(async ({ url, key }) => {
    const raw = Object.entries(localStorage).find(([k]) => k.startsWith("sb-") && k.endsWith("-auth-token"))?.[1];
    const token = JSON.parse(raw).access_token;
    const r = await fetch(`${url}/rest/v1/profiles?id=neq.x`, { method: "PATCH", headers: { apikey: key, Authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ plan: "premium" }) });
    return r.status;
  }, { url: mock.url, key: mock.anonKey });
  assert(res === 403 && mock.profileFor(EMAIL).plan === "free", `plan escalation status ${res}`);
});

await step("delete account removes everything", async () => {
  await page.goto(BASE + "#/profile");
  await page.click(".settings [data-delete]");
  await page.click(".modal [data-yes]");
  await page.waitForURL(/#\/$/);
  assert(!mock.userByEmail(EMAIL), "user still exists");
  assert(mock.tables.reflections.every(r => r.user_id !== undefined) && mock.rowsFor("reflections", EMAIL).length === 0, "rows remain");
  await waitText(page, "#profile-btn", /^$/);
});

await context.close();
await browser.close();
jsErrors.forEach(e => failures.push(`JS error: ${e}`));
if (jsErrors.length) console.log(jsErrors.map(e => "  ✗ JS error: " + e).join("\n"));
console.log(failures.length ? `\n${failures.length} problem(s) found.` : "\nAll Supabase checks passed.");
process.exit(failures.length ? 1 : 0);
