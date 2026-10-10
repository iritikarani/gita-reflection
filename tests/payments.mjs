// End-to-end tests for Premium payments: the real Supabase functions in
// supabase/functions run here in Node (with a small Deno shim), against the
// in-memory Supabase mock and a fake Razorpay API and checkout.
//
// Usage: npm run serve (in another terminal), then  npm run test:payments
import { createRequire } from "node:module";
import { createHmac } from "node:crypto";
import { createMockSupabase, enableSupabaseConfig } from "./mock-supabase.mjs";

async function loadPlaywright() {
  try { return await import("playwright"); }
  catch {
    const require = createRequire(import.meta.url);
    return require(require.resolve("playwright", { paths: ["/opt/node22/lib/node_modules", process.env.NODE_PATH || ""] }));
  }
}

const BASE = process.env.BASE_URL || "http://localhost:8080/";
const mock = createMockSupabase();
const RZP = "https://razorpay.test/v1";
const SECRETS = {
  SUPABASE_URL: mock.url,
  SUPABASE_ANON_KEY: mock.anonKey,
  SUPABASE_SERVICE_ROLE_KEY: mock.serviceKey,
  RAZORPAY_API_BASE: RZP,
  RAZORPAY_KEY_ID: "rzp_test_abc123",
  RAZORPAY_KEY_SECRET: "key-secret-xyz",
  RAZORPAY_PLAN_MONTHLY: "plan_monthly49",
  RAZORPAY_PLAN_YEARLY: "plan_yearly499",
  RAZORPAY_WEBHOOK_SECRET: "webhook-secret-123",
  RAZORPAY_TEST_EMAILS: "Asha@Example.com, someone@example.com",
  NOTIFY_EMAIL: "owner@example.com",
  BREVO_API_KEY: "xkeysib-test"
};
const alerts = []; // owner alert emails "sent" through the fake Brevo API
const lastAlert = () => alerts.at(-1) || {};
const sign = (secret, msg) => createHmac("sha256", secret).update(msg).digest("hex");

// ---- fake Razorpay API ----
const rzp = { subs: new Map(), calls: [], n: 0 };
function razorpayApi(method, path, headers, body) {
  const auth = `Basic ${Buffer.from(`${SECRETS.RAZORPAY_KEY_ID}:${SECRETS.RAZORPAY_KEY_SECRET}`).toString("base64")}`;
  if (headers.authorization !== auth) return [401, { error: { description: "Authentication failed" } }];
  rzp.calls.push({ method, path, body });
  const end = Math.floor(Date.now() / 1000) + 30 * 86400;
  if (method === "POST" && path === "/subscriptions") {
    const sub = { id: `sub_${++rzp.n}`, entity: "subscription", plan_id: body.plan_id, status: "created", notes: body.notes, total_count: body.total_count, current_end: null };
    rzp.subs.set(sub.id, sub);
    return [200, sub];
  }
  const m = path.match(/^\/subscriptions\/(sub_\w+?)(\/cancel)?$/);
  const sub = m && rzp.subs.get(m[1]);
  if (!sub) return [400, { error: { description: "The id provided does not exist" } }];
  if (method === "GET" && !m[2]) {
    if (sub.status === "created" && sub.paid) Object.assign(sub, { status: "active", current_end: end });
    return [200, sub];
  }
  if (method === "POST" && m[2]) {
    if (rzp.refuseCancel) return [400, { error: { description: "Subscription cannot be cancelled in created state." } }];
    if (sub.status === "cancelled") return [400, { error: { description: "Subscription is not cancellable in cancelled status." } }];
    if (body.cancel_at_cycle_end) return [200, { ...sub, has_scheduled_changes: true }];
    sub.status = "cancelled";
    return [200, sub];
  }
  return [404, {}];
}

// Functions use fetch: send Supabase and Razorpay calls to the fakes.
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const req = new Request(input, init);
  const headers = Object.fromEntries([...req.headers].map(([k, v]) => [k.toLowerCase(), v]));
  const raw = ["GET", "HEAD"].includes(req.method) ? "" : await req.text();
  if (req.url.startsWith(mock.url)) {
    const res = await mock.handle({ method: req.method, url: req.url, headers, rawBody: raw });
    return new Response(res.status === 204 ? null : res.body, { status: res.status, headers: { "content-type": res.contentType || "application/json" } });
  }
  if (req.url === "https://api.brevo.com/v3/smtp/email") {
    if (headers["api-key"] !== SECRETS.BREVO_API_KEY) return new Response("{}", { status: 401 });
    alerts.push(JSON.parse(raw));
    return new Response(JSON.stringify({ messageId: "m" + alerts.length }), { status: 201 });
  }
  if (req.url.startsWith(RZP)) {
    const [status, body] = razorpayApi(req.method, req.url.slice(RZP.length), headers, raw ? JSON.parse(raw) : {});
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }
  return realFetch(input, init);
};

// ---- load the real functions with a tiny Deno shim ----
let served;
globalThis.Deno = { env: { get: k => SECRETS[k] }, serve: fn => { served = fn; } };
await import("../supabase/functions/razorpay/index.ts");
mock.functions.razorpay = served;
await import("../supabase/functions/razorpay-webhook/index.ts");
mock.functions["razorpay-webhook"] = served;

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const failures = [];
const jsErrors = [];

// Fake checkout.js: "pays" at once and returns a correctly signed response.
const CHECKOUT_STUB = `window.Razorpay = function (opts) {
  this.open = function () {
    window.__rzpOpened = opts;
    if (window.__rzpDismiss) { setTimeout(function () { opts.modal.ondismiss(); }, 50); return; }
    window.__rzpSign(opts.subscription_id).then(function (sig) {
      opts.handler({ razorpay_payment_id: "pay_1", razorpay_subscription_id: opts.subscription_id, razorpay_signature: sig });
    });
  };
};`;

async function newPage() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route(/fonts\.(googleapis|gstatic)\.com|chiragmirani/, r => r.abort());
  await context.route(/checkout\.razorpay\.com/, r => r.fulfill({ contentType: "text/javascript", body: CHECKOUT_STUB }));
  await enableSupabaseConfig(context, mock);
  await context.exposeFunction("__rzpSign", subId => {
    if (rzp.subs.has(subId)) rzp.subs.get(subId).paid = true; // the fake checkout "pays"
    return sign(SECRETS.RAZORPAY_KEY_SECRET, `pay_1|${subId}`);
  });
  const page = await context.newPage();
  page.on("pageerror", e => jsErrors.push(e.message));
  return { context, page };
}
async function step(name, fn) {
  try { await fn(); console.log("  ✓ " + name); }
  catch (e) { failures.push(`${name}: ${e.message.split("\n")[0]}`); console.log("  ✗ " + name + ": " + e.message.split("\n")[0]); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
async function until(fn, msg) {
  for (let i = 0; i < 60; i++) { if (await fn()) return; await new Promise(r => setTimeout(r, 150)); }
  throw new Error(msg);
}
async function signUp(page, name, email) {
  await page.goto(BASE + "#/signup");
  await page.fill("#name", name);
  await page.fill("#email", email);
  await page.fill("#password", "steady-mind-7");
  await page.click("form button[type=submit]");
  await until(async () => (await page.evaluate(() => location.hash)).startsWith("#/") && !(await page.evaluate(() => location.hash)).startsWith("#/signup"), "sign-up did not finish");
}
async function webhook(event, entity, { secret = SECRETS.RAZORPAY_WEBHOOK_SECRET, id } = {}) {
  const raw = JSON.stringify({ entity: "event", event, created_at: Math.floor(Date.now() / 1000), payload: { subscription: { entity } } });
  const res = await mock.functions["razorpay-webhook"](new Request(mock.url + "/functions/v1/razorpay-webhook", {
    method: "POST", body: raw,
    headers: { "Content-Type": "application/json", "X-Razorpay-Signature": sign(secret, raw), ...(id ? { "X-Razorpay-Event-Id": id } : {}) }
  }));
  return { status: res.status, body: await res.text() };
}

console.log("\npayments");
const { page } = await newPage();
const { page: raviPage } = await newPage();

await step("without the test flag, Premium shows Coming soon", async () => {
  await signUp(page, "Asha", "asha@example.com");
  await page.goto(BASE + "#/premium");
  await page.click('[data-buy="monthly"]');
  await page.waitForSelector(".modal-title");
  assert(/Coming soon/.test(await page.textContent(".modal-title")), "expected Coming soon");
  await page.keyboard.press("Escape");
  assert(rzp.calls.length === 0, "no Razorpay call expected");
});

await step("test checkout: ₹49 monthly → verified → Premium", async () => {
  await page.goto(BASE + "#/premium?paytest=1");
  await page.waitForSelector(".notice-test");
  await page.click('[data-buy="monthly"]');
  await page.waitForSelector(".modal-title:has-text('Welcome to Premium')", { timeout: 15000 });
  const opened = await page.evaluate(() => window.__rzpOpened);
  assert(opened.key === SECRETS.RAZORPAY_KEY_ID && /^sub_/.test(opened.subscription_id), "checkout opened with wrong options");
  assert(opened.prefill.email === "asha@example.com", "email not prefilled");
  const p = mock.profileFor("asha@example.com");
  assert(p.plan === "premium" && p.subscription_status === "active" && p.subscription_period === "monthly" && p.renews_at, "profile not upgraded: " + JSON.stringify(p));
  assert(rzp.calls[0].body.plan_id === "plan_monthly49", "wrong plan");
});

await step("Profile shows renewal date, and cancelling keeps Premium until then", async () => {
  await page.goto(BASE + "#/profile");
  await page.waitForSelector("[data-cancel-sub]");
  assert(/Renews on .+\(monthly\)/.test(await page.textContent(".settings")), "renewal line missing");
  await page.click("[data-cancel-sub]");
  await page.click(".modal [data-yes]");
  await until(async () => /continues until/.test(await page.textContent(".settings")), "cancelling state not shown");
  const p = mock.profileFor("asha@example.com");
  assert(p.plan === "premium" && p.subscription_status === "cancelling", "should stay Premium until the period ends");
  assert(rzp.calls.at(-1).body.cancel_at_cycle_end === 1, "should cancel at cycle end");
  const a = lastAlert();
  assert(a.to?.[0]?.email === "owner@example.com" && /cancelled Premium/.test(a.subject), "owner not alerted about the cancellation: " + JSON.stringify(a));
  assert(/asha@example\.com/.test(a.textContent) && /keep Premium until/.test(a.textContent), "alert missing member or end date");
});

await step("webhook: subscription.cancelled at period end → Free", async () => {
  const p = mock.profileFor("asha@example.com");
  const res = await webhook("subscription.cancelled", { id: p.subscription_id, status: "cancelled", notes: { user_id: p.id } }, { id: "evt_c1" });
  assert(res.status === 200 && /updated/.test(res.body), "webhook failed: " + res.body);
  assert(p.plan === "free" && p.subscription_status === "cancelled", "not downgraded");
  assert(/Premium ended \(cancelled\)/.test(lastAlert().subject) && /asha@example\.com/.test(lastAlert().textContent), "no 'Premium ended' alert");
  assert(mock.tables.payment_events.some(e => e.id === "evt_c1"), "event not recorded");
  const again = await webhook("subscription.cancelled", { id: p.subscription_id, status: "cancelled", notes: { user_id: p.id } }, { id: "evt_c1" });
  assert(/duplicate/.test(again.body), "duplicate not detected");
});

await step("webhook: a bad signature is rejected", async () => {
  const p = mock.profileFor("asha@example.com");
  const res = await webhook("subscription.charged", { id: p.subscription_id, notes: { user_id: p.id } }, { secret: "wrong" });
  assert(res.status === 401 && p.plan === "free", "forged webhook accepted");
});

await step("webhook: charged/pending/halted on the current subscription", async () => {
  const p = mock.profileFor("asha@example.com");
  const sub = { id: "sub_web", status: "active", current_end: Math.floor(Date.now() / 1000) + 365 * 86400, notes: { user_id: p.id, period: "yearly" } };
  const before = alerts.length;
  await webhook("subscription.activated", sub, { id: "evt_w0" });
  assert(alerts.length === before + 1 && /new Premium member/.test(lastAlert().subject), "no new-member alert");
  await webhook("subscription.charged", sub, { id: "evt_w1" });
  assert(alerts.length === before + 1, "a normal renewal should not send an alert");
  assert(p.plan === "premium" && p.subscription_id === "sub_web" && p.subscription_period === "yearly", "charged did not upgrade");
  await webhook("subscription.pending", sub, { id: "evt_w2" });
  assert(p.plan === "premium" && p.subscription_status === "pending", "pending should keep Premium");
  assert(/renewal payment failed/.test(lastAlert().subject), "no failed-renewal alert");
  await webhook("subscription.halted", { ...sub, id: "sub_other" }, { id: "evt_w3" });
  assert(p.plan === "premium", "an old subscription's event must not downgrade");
  await webhook("subscription.halted", sub, { id: "evt_w4" });
  assert(p.plan === "free" && p.subscription_status === "halted", "halted did not downgrade");
});

await step("functions refuse strangers, forged payments and unlisted test emails", async () => {
  const call = (body, token) => mock.functions.razorpay(new Request(mock.url + "/functions/v1/razorpay", {
    method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  }));
  assert((await call({ action: "subscribe", period: "monthly" })).status === 401, "no token should be 401");
  assert((await call({ action: "subscribe" }, mock.anonKey)).status === 401, "public key should be 401");
  const asha = mock.issueSessionFor("asha@example.com").access_token;
  const start = await (await call({ action: "subscribe", period: "yearly" }, asha)).json();
  assert(start.subscriptionId && rzp.calls.at(-1).body.plan_id === "plan_yearly499", "yearly subscribe failed");
  const forged = await call({ action: "verify", payment_id: "pay_x", subscription_id: start.subscriptionId, signature: "0".repeat(64) }, asha);
  assert(forged.status === 400 && mock.profileFor("asha@example.com").plan === "free", "forged signature accepted");
  await signUp(raviPage, "Ravi", "ravi@example.com");
  const ravi = mock.issueSessionFor("ravi@example.com").access_token;
  const res = await call({ action: "subscribe", period: "monthly" }, ravi);
  assert(res.status === 403 && (await res.json()).error === "payments_not_open", "unlisted test email allowed");
});

await step("unlisted email sees a gentle message on the Premium page", async () => {
  await raviPage.goto(BASE + "#/premium?paytest=1");
  await raviPage.click('[data-buy="monthly"]');
  await until(async () => /aren't open yet/.test(await raviPage.textContent("body")), "no message shown");
  assert(await raviPage.isEnabled('[data-buy="monthly"]'), "buttons should be usable again");
});

await step("deleting an account cancels its subscription first", async () => {
  const p = mock.profileFor("asha@example.com");
  await webhook("subscription.activated", { id: "sub_del", status: "active", current_end: Math.floor(Date.now() / 1000) + 86400, notes: { user_id: p.id, period: "monthly" } }, { id: "evt_d1" });
  rzp.subs.set("sub_del", { id: "sub_del", status: "active" });
  const { page: p2 } = await newPage();
  await p2.goto(BASE + "#/login");
  await p2.fill("#email", "asha@example.com");
  await p2.fill("#password", "steady-mind-7");
  await p2.click("form button[type=submit]");
  await p2.waitForTimeout(800);
  await p2.goto(BASE + "#/profile");
  await p2.click("[data-delete]");
  assert(/subscription will be cancelled too/.test(await p2.textContent(".modal")), "warning missing");
  await p2.click(".modal [data-yes]");
  await until(() => !mock.userByEmail("asha@example.com"), "account not deleted");
  const cancel = rzp.calls.find(c => c.path === "/subscriptions/sub_del/cancel");
  assert(cancel && cancel.body.cancel_at_cycle_end === 0, "subscription not cancelled immediately");
  assert(/deleted their account/.test(lastAlert().textContent), "no alert for the account-deletion cancel");
});

await step("an already-ended subscription doesn't block cancelling", async () => {
  await signUp(raviPage, "Ravi", "ravi@example.com").catch(() => {});
  const p = mock.profileFor("ravi@example.com");
  rzp.subs.set("sub_gone", { id: "sub_gone", status: "cancelled" });
  Object.assign(p, { plan: "premium", subscription_id: "sub_gone", subscription_status: "active" });
  const token = mock.issueSessionFor("ravi@example.com").access_token;
  const res = await mock.functions.razorpay(new Request(mock.url + "/functions/v1/razorpay", {
    method: "POST", body: JSON.stringify({ action: "cancel", immediately: true }), headers: { Authorization: `Bearer ${token}` }
  }));
  assert(res.status === 200 && p.plan === "free" && p.subscription_status === "cancelled", "cancel of an ended subscription failed");
});

await step("an unpaid checkout never blocks cancelling", async () => {
  const p = mock.profileFor("ravi@example.com");
  rzp.subs.set("sub_unpaid", { id: "sub_unpaid", status: "created" });
  rzp.refuseCancel = true;
  Object.assign(p, { plan: "free", subscription_id: "sub_unpaid", subscription_status: "created" });
  const token = mock.issueSessionFor("ravi@example.com").access_token;
  const res = await mock.functions.razorpay(new Request(mock.url + "/functions/v1/razorpay", {
    method: "POST", body: JSON.stringify({ action: "cancel", immediately: true }), headers: { Authorization: `Bearer ${token}` }
  }));
  rzp.refuseCancel = false;
  assert(res.status === 200 && p.subscription_status === "cancelled", "unpaid subscription blocked cancel");
});

await step("Hindi: payment texts are translated", async () => {
  const { page: p3 } = await newPage();
  await p3.goto(BASE + "#/premium?paytest=1&lang=hi");
  await p3.waitForSelector(".notice-test");
  assert(/टेस्ट मोड/.test(await p3.textContent(".notice-test")), "test notice not in Hindi");
  assert(/₹49/.test(await p3.textContent(".plan-premium .price")) && /₹499/.test(await p3.textContent(".plan-premium")), "prices wrong");
});

if (jsErrors.length) failures.push("JS errors: " + jsErrors.join(" | "));
await browser.close();
if (failures.length) { console.log(`\n${failures.length} problem(s) found.`); failures.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("\nAll payment checks passed.");
