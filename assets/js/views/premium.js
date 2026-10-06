import { esc, icon, openModal, toast } from "../ui.js";
import { CONFIG, PRODUCTS } from "../config.js";
import * as store from "../store.js";
import { t, pick } from "../i18n.js";
import { checkoutAvailable, isTestMode, rememberTestMode, startSubscription, paymentMessage } from "../payments.js";

const PRODUCTS_HI = {
  "journal-7": { title: "7 दिन की गीता चिंतन डायरी", format: "प्रिंट करने योग्य PDF", desc: "मार्गदर्शित प्रश्नों का एक कोमल सप्ताह, रोज़ एक श्लोक, हाथ से लिखने की जगह के साथ।" },
  "journal-30": { title: "30 दिन की गीता चिंतन डायरी", format: "प्रिंट करने योग्य PDF", desc: "श्लोकों, चिंतन प्रश्नों और छोटे अभ्यासों का एक महीना, विषयों के अनुसार।" },
  "bundle": { title: "गीता चिंतन बंडल", format: "दोनों डायरियाँ + कार्ड", desc: "7 दिन और 30 दिन की डायरियाँ, प्रिंट करने योग्य दैनिक चिंतन कार्डों के साथ।" },
  "inner-peace-30": { title: "भीतरी शांति की 30 दिन की यात्रा", format: "मार्गदर्शित कार्यक्रम + PDF", desc: "मन, विश्राम और छोड़ने पर गीता की शिक्षाओं के साथ एक गहरी, महीने भर की यात्रा।" },
  "daily-cards": { title: "दैनिक चिंतन कार्ड", format: "प्रिंट करने योग्य PDF", desc: "हर कार्ड पर एक श्लोक और एक प्रश्न — मेज़, आईने या एक शांत सुबह के लिए।" },
  "journaling-pack": { title: "गीता से प्रेरित जर्नलिंग पैक", format: "प्रिंट करने योग्य PDF टेम्पलेट", desc: "मासिक समीक्षा पन्ने, कृतज्ञता पन्ने और निर्णय वर्कशीट, गीता से प्रेरित।" }
};
for (const p of PRODUCTS) p.hiText = PRODUCTS_HI[p.id];

const FREE = [
  "Daily Gita, every day",
  "Reflections matched to what you feel",
  "Reflect with the Gita conversations",
  "The curated shlok library",
  "Up to {n} saved reflections",
  "Shareable cards",
  "7 days with the Gita",
  "This month's reflection summary"
];

const PREMIUM = [
  "Unlimited reflection history",
  "14 and 30-day guided journeys",
  "Personal shlok collections",
  "Monthly summary archive",
  "Premium journal templates",
  "Advanced reflection prompts",
  "Sandalwood and Sage themes",
  "A private digital journal"
];

function buy(link, title) {
  if (link) { window.open(link, "_blank", "noopener"); return; }
  const mail = CONFIG.contactEmail
    ? `<p>${t("If you'd like to know when it's ready, write to {email}.", { email: `<a href="mailto:${esc(CONFIG.contactEmail)}?subject=${encodeURIComponent(title)}">${esc(CONFIG.contactEmail)}</a>` })}</p>` : "";
  openModal({
    title: t("Coming soon"),
    body: `<p>${t("{title} isn't available to purchase just yet. We're preparing it with care.", { title: esc(title) })}</p>${mail}<p class="muted">${t("Everything free on Gita Reflection stays free.")}</p>`
  });
}

async function checkout(root, button, period) {
  const buttons = root.querySelectorAll("[data-buy]");
  const label = button.textContent;
  buttons.forEach(b => { b.disabled = true; });
  button.textContent = t("Opening secure checkout…");
  try {
    const result = await startSubscription(period);
    if (result === "premium") {
      premiumView(root);
      openModal({
        title: t("Welcome to Premium"),
        body: `<p>${t("Thank you for supporting Gita Reflection. Everything in Premium is open to you now.")}</p>
          <div class="row-end"><a class="btn btn-primary" href="#/programs">${t("Explore guided programs")}</a></div>`
      });
      return;
    }
    if (result === "processing") {
      openModal({
        title: t("Payment received"),
        body: `<p>${t("Your payment went through. Premium will appear on your account within a few minutes — Razorpay will also email you a receipt.")}</p>`
      });
    }
  } catch (e) {
    console.error(e);
    toast(paymentMessage(e));
  }
  buttons.forEach(b => { b.disabled = false; });
  button.textContent = label;
}

function premiumView(root) {
  const me = store.currentUser();
  const premium = me?.plan === "premium";
  const testing = checkoutAvailable() && isTestMode();
  root.innerHTML = `
  <section class="premium">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${t("Premium")}</p>
      <h1>${t("Go deeper")}</h1>
      <p class="lead">${t("Gita Reflection will always be genuinely useful for free. Premium is for those who want to walk further — and it helps keep this quiet space alive.")}</p>
    </header>

    <section class="wrap plans">
      <div class="plan">
        <h2>${t("Free")}</h2>
        <p class="price">₹0 <span>always</span></p>
        <ul class="ticks">${FREE.map(f => `<li>${icon("check")}<span>${esc(t(f, { n: CONFIG.freeSavedLimit }))}</span></li>`).join("")}</ul>
        ${me ? `<p class="fine">${premium ? "" : t("You're on the free plan.")}</p>` : `<a class="btn btn-ghost btn-block" href="#/signup?next=/premium">${t("Create a free account")}</a>`}
      </div>
      <div class="plan plan-premium">
        <h2>${t("Premium")}</h2>
        <p class="price">₹${CONFIG.pricing.monthly} <span>${t("/ month")}</span></p>
        <p class="fine">${t("or ₹{yearly} / year — about ₹{perMonth} a month", { yearly: CONFIG.pricing.yearly.toLocaleString("en-IN"), perMonth: Math.round(CONFIG.pricing.yearly / 12) })}</p>
        <p class="muted">${t("Everything in Free, and:")}</p>
        <ul class="ticks">${PREMIUM.map(f => `<li>${icon("check")}<span>${esc(t(f))}</span></li>`).join("")}</ul>
        ${testing && !premium ? `<p class="notice-test" role="note">${t("Test mode: use Razorpay's test details. No real money is charged.")}</p>` : ""}
        ${premium ? `<p class="fine">${t("You're a Premium member. Thank you.")} <a href="#/profile">${t("Manage subscription")}</a></p>` : `
        <div class="stack">
          <button class="btn btn-primary btn-block" type="button" data-buy="monthly">${t("Go deeper — monthly")}</button>
          <button class="btn btn-ghost btn-block" type="button" data-buy="yearly">${t("Yearly")}</button>
        </div>`}
        <p class="fine">${t("Cancel anytime. Your reflections are always yours.")}</p>
      </div>
    </section>

    <section class="wrap narrow">
      <h2 class="section-label center">${t("See what's included")}</h2>
      <div class="feature-links">
        <a href="#/programs"><strong>${t("Guided programs")}</strong><span>${t("14 and 30-day journeys")}</span></a>
        <a href="#/journal"><strong>${t("Private journal")}</strong><span>${t("A private digital journal")}</span></a>
        <a href="#/collections"><strong>${t("Your collections")}</strong><span>${t("Personal shlok collections")}</span></a>
        <a href="#/templates"><strong>${t("Journal templates")}</strong><span>${t("Premium journal templates")}</span></a>
      </div>
    </section>
    <section class="wrap narrow center">
      <p class="statement small">${t("Premium never gates peace. It simply offers more room to go deeper.")}</p>
      <a class="btn btn-link" href="#/shop">${t("Journals & one-time resources")} ${icon("arrow")}</a>
    </section>
  </section>`;

  root.querySelectorAll("[data-buy]").forEach(b => b.addEventListener("click", () => {
    if (!me) { location.hash = "#/signup?next=/premium"; return; }
    const yearly = b.dataset.buy === "yearly";
    if (checkoutAvailable()) { checkout(root, b, yearly ? "yearly" : "monthly"); return; }
    buy(yearly ? CONFIG.payments.premiumYearly : CONFIG.payments.premiumMonthly, `${t("Premium")} (${yearly ? t("yearly") : t("monthly")})`);
  }));
}

function shopView(root) {
  root.innerHTML = `
  <section class="shop">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${t("Journals &amp; resources")}</p>
      <h1>${t("For your quiet hours")}</h1>
      <p class="lead">${t("Thoughtfully made digital journals and guides, to print or keep on your device. Buy once, keep forever.")}</p>
    </header>
    <section class="wrap product-grid">
      ${PRODUCTS.map(p => `
        <article class="product">
          <div class="product-cover" aria-hidden="true"><span>${esc(pick(p, "title"))}</span></div>
          <h2>${esc(pick(p, "title"))}</h2>
          <p class="muted">${esc(pick(p, "desc"))}</p>
          <p class="fine">${esc(pick(p, "format"))}</p>
          <div class="product-foot">
            <span class="price">₹${p.price}</span>
            <button class="btn btn-ghost btn-sm" type="button" data-product="${p.id}">${CONFIG.payments.products[p.id] ? t("Buy") : t("Coming soon")}</button>
          </div>
        </article>`).join("")}
    </section>
    <section class="wrap narrow center">
      <p class="muted">${t("Want a taste first? {link} is free, right here.", { link: `<a href="#/seven-days">${t("7 days with the Gita")}</a>` })}</p>
    </section>
  </section>`;

  root.querySelectorAll("[data-product]").forEach(b => b.addEventListener("click", () => {
    const p = PRODUCTS.find(x => x.id === b.dataset.product);
    buy(CONFIG.payments.products[p.id], pick(p, "title"));
  }));
}

export function render(root, { mode, query = {} }) {
  rememberTestMode(query);
  return mode === "shop" ? shopView(root) : premiumView(root);
}
