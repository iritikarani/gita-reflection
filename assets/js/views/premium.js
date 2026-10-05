import { esc, icon, openModal } from "../ui.js";
import { CONFIG, PRODUCTS } from "../config.js";
import * as store from "../store.js";

const FREE = [
  "Daily Gita, every day",
  "Reflections matched to what you feel",
  "Reflect with the Gita conversations",
  "The curated shlok library",
  `Up to ${CONFIG.freeSavedLimit} saved reflections`,
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
    ? `<p>If you'd like to know when it's ready, write to <a href="mailto:${esc(CONFIG.contactEmail)}?subject=${encodeURIComponent(title)}">${esc(CONFIG.contactEmail)}</a>.</p>` : "";
  openModal({
    title: "Coming soon",
    body: `<p>${esc(title)} isn't available to purchase just yet. We're preparing it with care.</p>${mail}<p class="muted">Everything free on Gita Reflection stays free.</p>`
  });
}

function premiumView(root) {
  const me = store.currentUser();
  const premium = me?.plan === "premium";
  root.innerHTML = `
  <section class="premium">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">Premium</p>
      <h1>Go deeper</h1>
      <p class="lead">Gita Reflection will always be genuinely useful for free. Premium is for those who want to walk further — and it helps keep this quiet space alive.</p>
    </header>

    <section class="wrap plans">
      <div class="plan">
        <h2>Free</h2>
        <p class="price">₹0 <span>always</span></p>
        <ul class="ticks">${FREE.map(f => `<li>${icon("check")}<span>${esc(f)}</span></li>`).join("")}</ul>
        ${me ? `<p class="fine">${premium ? "" : "You're on the free plan."}</p>` : `<a class="btn btn-ghost btn-block" href="#/signup?next=/premium">Create a free account</a>`}
      </div>
      <div class="plan plan-premium">
        <h2>Premium</h2>
        <p class="price">₹${CONFIG.pricing.monthly} <span>/ month</span></p>
        <p class="fine">or ₹${CONFIG.pricing.yearly.toLocaleString("en-IN")} / year — about ₹${Math.round(CONFIG.pricing.yearly / 12)} a month</p>
        <p class="muted">Everything in Free, and:</p>
        <ul class="ticks">${PREMIUM.map(f => `<li>${icon("check")}<span>${esc(f)}</span></li>`).join("")}</ul>
        ${premium ? `<p class="fine">You're a Premium member. Thank you.</p>` : `
        <div class="stack">
          <button class="btn btn-primary btn-block" type="button" data-buy="monthly">Go deeper — monthly</button>
          <button class="btn btn-ghost btn-block" type="button" data-buy="yearly">Yearly</button>
        </div>`}
        <p class="fine">Cancel anytime. Your reflections are always yours.</p>
      </div>
    </section>

    <section class="wrap narrow center">
      <p class="statement small">Premium never gates peace. It simply offers more room to go deeper.</p>
      <a class="btn btn-link" href="#/shop">Journals &amp; one-time resources ${icon("arrow")}</a>
    </section>
  </section>`;

  root.querySelectorAll("[data-buy]").forEach(b => b.addEventListener("click", () => {
    if (!me) { location.hash = "#/signup?next=/premium"; return; }
    const yearly = b.dataset.buy === "yearly";
    buy(yearly ? CONFIG.payments.premiumYearly : CONFIG.payments.premiumMonthly, `Premium (${yearly ? "yearly" : "monthly"})`);
  }));
}

function shopView(root) {
  root.innerHTML = `
  <section class="shop">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">Journals &amp; resources</p>
      <h1>For your quiet hours</h1>
      <p class="lead">Thoughtfully made digital journals and guides, to print or keep on your device. Buy once, keep forever.</p>
    </header>
    <section class="wrap product-grid">
      ${PRODUCTS.map(p => `
        <article class="product">
          <div class="product-cover" aria-hidden="true"><span>${esc(p.title.replace(/^(\d+)-Day /, "$1 days · "))}</span></div>
          <h2>${esc(p.title)}</h2>
          <p class="muted">${esc(p.desc)}</p>
          <p class="fine">${esc(p.format)}</p>
          <div class="product-foot">
            <span class="price">₹${p.price}</span>
            <button class="btn btn-ghost btn-sm" type="button" data-product="${p.id}">${CONFIG.payments.products[p.id] ? "Buy" : "Coming soon"}</button>
          </div>
        </article>`).join("")}
    </section>
    <section class="wrap narrow center">
      <p class="muted">Want a taste first? <a href="#/seven-days">7 days with the Gita</a> is free, right here.</p>
    </section>
  </section>`;

  root.querySelectorAll("[data-product]").forEach(b => b.addEventListener("click", () => {
    const p = PRODUCTS.find(x => x.id === b.dataset.product);
    buy(CONFIG.payments.products[p.id], p.title);
  }));
}

export function render(root, { mode }) {
  return mode === "shop" ? shopView(root) : premiumView(root);
}
