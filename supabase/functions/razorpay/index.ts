// Gita Reflection — Premium subscriptions with Razorpay.
//
// The website calls this function (signed in) to:
//   { action: "subscribe", period: "monthly" | "yearly" }  → start checkout
//   { action: "verify", payment_id, subscription_id, signature } → confirm payment
//   { action: "cancel", immediately?: boolean }            → stop renewing
//
// Secrets (Supabase → Edge Functions → Secrets), never in the website:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_PLAN_MONTHLY, RAZORPAY_PLAN_YEARLY
//   RAZORPAY_TEST_EMAILS — with test keys, only these emails (comma-separated) may check out
//
// Self-contained (no imports) so it can be pasted into the Supabase dashboard editor.
// See SUPABASE.md → "Payments with Razorpay".

const env = (name: string) => Deno.env.get(name) || "";
const RZP_API = env("RAZORPAY_API_BASE") || "https://api.razorpay.com/v1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const fail = (status: number, error: string) => reply(status, { error });

// ---- Supabase (service role: bypasses row-level security, server only) ----
function serviceKey() {
  const direct = env("SUPABASE_SERVICE_ROLE_KEY") || env("SERVICE_ROLE_KEY");
  if (direct) return direct;
  try { return JSON.parse(env("SUPABASE_SECRET_KEYS")).default || ""; } catch { return ""; }
}
function dbHeaders(extra: Record<string, string> = {}) {
  const key = serviceKey();
  const h: Record<string, string> = { apikey: key, "Content-Type": "application/json", ...extra };
  if (key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`; // legacy JWT service_role key
  return h;
}
async function db(path: string, init: RequestInit = {}) {
  const res = await fetch(`${env("SUPABASE_URL")}/rest/v1/${path}`, { ...init, headers: dbHeaders(init.headers as Record<string, string>) });
  if (!res.ok) throw new Error(`database ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
const getProfile = async (id: string) => (await db(`profiles?id=eq.${id}&select=*`))?.[0] || null;
const patchProfile = (id: string, changes: Record<string, unknown>) =>
  db(`profiles?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(changes), headers: { Prefer: "return=minimal" } });

async function signedInUser(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token.includes(".")) return null; // a user session token is a JWT; the public key is not
  const res = await fetch(`${env("SUPABASE_URL")}/auth/v1/user`, {
    headers: { apikey: env("SUPABASE_ANON_KEY") || req.headers.get("apikey") || serviceKey(), Authorization: `Bearer ${token}` }
  });
  return res.ok ? await res.json() : null;
}

// ---- Razorpay ----
async function rzp(path: string, init: RequestInit = {}) {
  const res = await fetch(`${RZP_API}${path}`, {
    ...init,
    headers: { Authorization: `Basic ${btoa(`${env("RAZORPAY_KEY_ID")}:${env("RAZORPAY_KEY_SECRET")}`)}`, "Content-Type": "application/json" }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`razorpay ${res.status}: ${body?.error?.description || JSON.stringify(body)}`);
  return body;
}
async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
const iso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);

// Statuses in which Razorpay may still charge the member.
const LIVE = ["created", "authenticated", "active", "pending", "cancelling"];
const PAID = ["active", "pending", "cancelling"];

async function subscribe(user: any, body: any) {
  const period = body.period === "yearly" ? "yearly" : "monthly";
  const plan = env(period === "yearly" ? "RAZORPAY_PLAN_YEARLY" : "RAZORPAY_PLAN_MONTHLY");
  if (!env("RAZORPAY_KEY_ID") || !env("RAZORPAY_KEY_SECRET") || !plan) return fail(503, "payments_not_configured");
  if (env("RAZORPAY_KEY_ID").startsWith("rzp_test_")) {
    const allowed = env("RAZORPAY_TEST_EMAILS").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
    if (!allowed.includes(String(user.email || "").toLowerCase())) return fail(403, "payments_not_open");
  }
  const profile = await getProfile(user.id);
  if (!profile) return fail(404, "profile_missing");
  if (profile.plan === "premium" && PAID.includes(profile.subscription_status)) return fail(409, "already_premium");

  const sub = await rzp("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: plan,
      total_count: period === "yearly" ? 10 : 120, // renews until cancelled (up to 10 years)
      customer_notify: 1,
      notes: { user_id: user.id, period }
    })
  });
  await patchProfile(user.id, { subscription_id: sub.id, subscription_status: "created", subscription_period: period });
  return reply(200, { keyId: env("RAZORPAY_KEY_ID"), subscriptionId: sub.id });
}

async function verify(user: any, body: any) {
  const { payment_id, subscription_id, signature } = body;
  if (!payment_id || !subscription_id || !signature) return fail(400, "missing_fields");
  const profile = await getProfile(user.id);
  if (!profile || profile.subscription_id !== subscription_id) return fail(400, "unknown_subscription");
  const expected = await hmacHex(env("RAZORPAY_KEY_SECRET"), `${payment_id}|${subscription_id}`);
  if (!sameText(expected, String(signature))) return fail(400, "bad_signature");

  const sub = await rzp(`/subscriptions/${subscription_id}`);
  if (!["authenticated", "active"].includes(sub.status)) return fail(409, `not_active:${sub.status}`);
  await patchProfile(user.id, { plan: "premium", subscription_status: "active", renews_at: iso(sub.current_end) });
  return reply(200, { plan: "premium", renewsAt: iso(sub.current_end) });
}

async function cancel(user: any, body: any) {
  const profile = await getProfile(user.id);
  if (!profile?.subscription_id || !LIVE.includes(profile.subscription_status)) return reply(200, { status: "none" });
  const immediately = Boolean(body.immediately) || !PAID.includes(profile.subscription_status);
  if (profile.subscription_status === "cancelling" && !immediately) return reply(200, { status: "cancelling", renewsAt: profile.renews_at });

  let sub;
  try {
    sub = await rzp(`/subscriptions/${profile.subscription_id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancel_at_cycle_end: immediately ? 0 : 1 })
    });
  } catch (e) {
    // Already over on Razorpay's side (cancelled, completed, expired)? Then there is nothing left to stop.
    const current = await rzp(`/subscriptions/${profile.subscription_id}`).catch(() => null);
    // A checkout that was opened but never paid can simply be forgotten.
    const unpaid = profile.subscription_status === "created" && (!current || current.status === "created");
    if (!unpaid && (!current || ["created", "authenticated", "active", "pending", "halted", "paused"].includes(current.status))) throw e;
    sub = { ...current, status: "cancelled" };
  }
  if (immediately || sub.status === "cancelled") {
    await patchProfile(user.id, { plan: "free", subscription_status: "cancelled", renews_at: null });
    return reply(200, { status: "cancelled" });
  }
  // Premium continues until the end of the period already paid for.
  const until = iso(sub.current_end) || profile.renews_at;
  await patchProfile(user.id, { subscription_status: "cancelling", renews_at: until });
  return reply(200, { status: "cancelling", renewsAt: until });
}

export async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return fail(405, "method_not_allowed");
  try {
    const user = await signedInUser(req);
    if (!user?.id) return fail(401, "not_signed_in");
    const body = await req.json().catch(() => ({}));
    if (body.action === "subscribe") return await subscribe(user, body);
    if (body.action === "verify") return await verify(user, body);
    if (body.action === "cancel") return await cancel(user, body);
    return fail(400, "unknown_action");
  } catch (e) {
    console.error(e);
    return fail(502, "payment_service_error");
  }
}

Deno.serve(handler);
