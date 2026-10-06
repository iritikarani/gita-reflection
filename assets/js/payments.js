// Premium checkout with Razorpay Subscriptions. The secure parts (creating the
// subscription, checking the payment signature, changing the plan) happen in
// the Supabase functions in supabase/functions — this file only opens checkout.
import { CONFIG } from "./config.js";
import * as store from "./store.js";
import { t } from "./i18n.js";

const TEST_FLAG = "gr.paytest";

// #/premium?paytest=1 turns test checkout on for this browser; ?paytest=0 turns it off.
export function rememberTestMode(query = {}) {
  try {
    if (query.paytest === "1") localStorage.setItem(TEST_FLAG, "1");
    if (query.paytest === "0") localStorage.removeItem(TEST_FLAG);
  } catch {}
}

export function checkoutAvailable() {
  const mode = CONFIG.payments?.razorpay || "";
  if (!mode || !store.supabaseConfigured() || store.backendMode() !== "supabase") return false;
  if (mode === "live") return true;
  try { return localStorage.getItem(TEST_FLAG) === "1"; } catch { return false; }
}

export function isTestMode() { return CONFIG.payments?.razorpay === "test"; }

let checkoutScript;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  checkoutScript ||= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = () => { checkoutScript = null; reject(Object.assign(new Error("checkout_unavailable"), { code: "network" })); };
    document.head.appendChild(s);
  });
  return checkoutScript;
}

export function paymentMessage(err) {
  const code = err?.code || err?.message || "";
  if (code === "payments_not_open") return t("Payments aren't open yet. Please check back soon.");
  if (code === "already_premium") return t("You're already a Premium member.");
  if (code === "not_signed_in") return t("Please log in again.");
  if (code === "network") return t("We couldn't reach the payment service. Please check your connection and try again.");
  return t("We couldn't open the checkout just now. Please try again in a moment.");
}

// Returns "premium" when the plan is active, "processing" when Razorpay took the
// payment but confirmation is still on its way, or null if checkout was closed.
export async function startSubscription(period) {
  const me = store.currentUser();
  const [{ keyId, subscriptionId }] = await Promise.all([
    store.callFunction("razorpay", { action: "subscribe", period }),
    loadCheckout()
  ]);
  const response = await new Promise(resolve => {
    const checkout = new window.Razorpay({
      key: keyId,
      subscription_id: subscriptionId,
      name: CONFIG.siteName,
      description: period === "yearly" ? t("Premium — yearly") : t("Premium — monthly"),
      prefill: { name: me?.name || "", email: me?.email || "" },
      notes: { period },
      theme: { color: "#4F6149" },
      handler: resolve,
      modal: { ondismiss: () => resolve(null), confirm_close: true }
    });
    checkout.open();
  });
  if (!response) return null;
  try {
    await store.callFunction("razorpay", {
      action: "verify",
      payment_id: response.razorpay_payment_id,
      subscription_id: response.razorpay_subscription_id,
      signature: response.razorpay_signature
    });
  } catch (e) {
    console.error(e);
  }
  // The webhook may confirm a moment later; check a few times.
  for (let i = 0; i < 5; i++) {
    await store.refreshAccount().catch(() => {});
    if (store.isPremium()) return "premium";
    await new Promise(r => setTimeout(r, 2000));
  }
  return "processing";
}

export async function cancelSubscription() {
  const out = await store.callFunction("razorpay", { action: "cancel" });
  await store.refreshAccount().catch(() => {});
  return out;
}
