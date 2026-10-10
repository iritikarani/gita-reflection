// Gita Reflection — Razorpay webhook. Razorpay calls this when a subscription
// is paid, renewed, fails or ends, and it keeps each member's plan in step.
//
// Razorpay → Settings → Webhooks → URL: https://<project>.supabase.co/functions/v1/razorpay-webhook
// Events: subscription.activated, .charged, .pending, .halted, .cancelled, .completed, .paused, .resumed
// Secret: RAZORPAY_WEBHOOK_SECRET (the same secret you type into Razorpay's webhook form).
// Deploy with "Verify JWT" turned off — Razorpay signs requests itself.
//
// Self-contained (no imports) so it can be pasted into the Supabase dashboard editor.

const env = (name: string) => Deno.env.get(name) || "";

function serviceKey() {
  const direct = env("SUPABASE_SERVICE_ROLE_KEY") || env("SERVICE_ROLE_KEY");
  if (direct) return direct;
  try { return JSON.parse(env("SUPABASE_SECRET_KEYS")).default || ""; } catch { return ""; }
}
function dbHeaders(extra: Record<string, string> = {}) {
  const key = serviceKey();
  const h: Record<string, string> = { apikey: key, "Content-Type": "application/json", ...extra };
  if (key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`;
  return h;
}
async function db(path: string, init: RequestInit = {}) {
  const res = await fetch(`${env("SUPABASE_URL")}/rest/v1/${path}`, { ...init, headers: dbHeaders(init.headers as Record<string, string>) });
  if (!res.ok) throw new Error(`database ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
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
const ok = (note: string) => new Response(JSON.stringify({ ok: true, note }), { status: 200, headers: { "Content-Type": "application/json" } });

// ---- Owner alerts (optional): emails you via Brevo when something changes ----
// Secrets: NOTIFY_EMAIL (where alerts go), BREVO_API_KEY, NOTIFY_FROM (a sender verified in Brevo; defaults to NOTIFY_EMAIL).
async function notifyOwner(subject: string, lines: string[]) {
  const to = env("NOTIFY_EMAIL"), key = env("BREVO_API_KEY");
  if (!to || !key) return;
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { email: env("NOTIFY_FROM") || to, name: "Gita Reflection" },
        to: [{ email: to }],
        subject: `Gita Reflection: ${subject}`,
        textContent: lines.filter(Boolean).join("\n")
      })
    });
    if (!res.ok) console.error("alert email failed", res.status, await res.text());
  } catch (e) { console.error("alert email failed", e); } // never block a payment on an alert
}
const day = (isoDate?: string | null) => (isoDate ? new Date(isoDate).toDateString() : "—");

async function memberEmail(id: string) {
  try {
    const key = serviceKey();
    const h: Record<string, string> = { apikey: key };
    if (key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`;
    const res = await fetch(`${env("SUPABASE_URL")}/auth/v1/admin/users/${id}`, { headers: h });
    return res.ok ? (await res.json()).email || "" : "";
  } catch { return ""; }
}

const UPGRADE = ["subscription.activated", "subscription.charged", "subscription.resumed"];
const ENDED = { "subscription.halted": "halted", "subscription.cancelled": "cancelled", "subscription.completed": "completed", "subscription.paused": "paused" } as Record<string, string>;

export async function handler(req: Request) {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const raw = await req.text();
  const secret = env("RAZORPAY_WEBHOOK_SECRET");
  const given = req.headers.get("X-Razorpay-Signature") || "";
  if (!secret || !sameText(await hmacHex(secret, raw), given)) return new Response("invalid signature", { status: 401 });

  try {
    const event = JSON.parse(raw);
    const eventId = req.headers.get("X-Razorpay-Event-Id") || `${event.event}:${event.created_at}:${event.payload?.subscription?.entity?.id}`;
    if ((await db(`payment_events?id=eq.${encodeURIComponent(eventId)}&select=id`))?.length) return ok("duplicate");

    const sub = event.payload?.subscription?.entity;
    if (!sub?.id) return ok("ignored");
    let userId = sub.notes?.user_id;
    const byId = userId ? (await db(`profiles?id=eq.${userId}&select=*`))?.[0] : null;
    const profile = byId || (await db(`profiles?subscription_id=eq.${encodeURIComponent(sub.id)}&select=*`))?.[0];
    if (!profile) return ok("no matching member");
    userId = profile.id;

    let changes: Record<string, unknown> | null = null;
    if (UPGRADE.includes(event.event)) {
      const keepCancelling = profile.subscription_id === sub.id && profile.subscription_status === "cancelling";
      changes = {
        plan: "premium", subscription_id: sub.id, renews_at: iso(sub.current_end),
        subscription_status: keepCancelling ? "cancelling" : "active",
        ...(sub.notes?.period ? { subscription_period: sub.notes.period } : {})
      };
    } else if (event.event === "subscription.authenticated" && profile.subscription_id === sub.id && profile.subscription_status === "created") {
      changes = { subscription_status: "authenticated" };
    } else if (event.event === "subscription.pending" && profile.subscription_id === sub.id) {
      changes = { subscription_status: "pending" }; // a renewal failed; Razorpay retries — keep Premium meanwhile
    } else if (ENDED[event.event] && profile.subscription_id === sub.id) {
      changes = { plan: "free", subscription_status: ENDED[event.event], renews_at: null };
    }

    if (changes) await db(`profiles?id=eq.${userId}`, { method: "PATCH", body: JSON.stringify(changes), headers: { Prefer: "return=minimal" } });

    // Alert the owner about the moments that matter (renewals are quiet).
    const wasPremium = profile.plan === "premium";
    const alert =
      event.event === "subscription.activated" && !wasPremium ? ["new Premium member", "Someone just became a Premium member."] :
      event.event === "subscription.pending" && changes ? ["a renewal payment failed", "A renewal payment didn't go through. Razorpay will retry; the member keeps Premium meanwhile."] :
      ENDED[event.event] && changes && wasPremium ? [`Premium ended (${ENDED[event.event]})`,
        event.event === "subscription.halted" ? "Renewal payments kept failing, so Razorpay stopped the subscription. The member is back on Free."
        : "A subscription has ended and the member is back on Free."] : null;
    if (alert) {
      await notifyOwner(alert[0], [
        alert[1],
        `Member: ${profile.name || "—"} <${await memberEmail(userId)}>`,
        `Plan: ${sub.notes?.period || profile.subscription_period || "—"} · Subscription: ${sub.id}`,
        event.event === "subscription.activated" ? `Renews on: ${day(iso(sub.current_end))}` : ""
      ]);
    }
    await db("payment_events", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({ id: eventId, event: event.event, subscription_id: sub.id, user_id: userId, payload: event })
    });
    return ok(changes ? "updated" : "no change");
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 }); // Razorpay will retry
  }
}

Deno.serve(handler);
