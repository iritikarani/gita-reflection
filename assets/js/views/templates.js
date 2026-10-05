// Premium: printable journal templates (print or save as PDF).
import { esc, icon } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import * as store from "../store.js";
import { premiumBadge, premiumGate } from "../components.js";
import { t, pick, isHindi } from "../i18n.js";
import { TEMPLATES } from "../data/templates.js";

const lines = n => `<div class="tpl-lines">${"<span></span>".repeat(n)}</div>`;


const L = pair => (isHindi() ? pair[1] : pair[0]);

function listView(root) {
  const premium = store.isPremium();
  root.innerHTML = `
  <section class="templates">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${t("Go deeper")}</p>
      <h1>${t("Journal templates")}</h1>
      <p class="lead center">${t("Printable pages for writing by hand. Print them, or save them as PDF to fill in on a tablet.")}</p>
      ${premium ? "" : `<p class="fine">${premiumBadge()} ${t("You can preview every template. Printing is part of Premium.")}</p>`}
    </header>
    <section class="wrap product-grid">
      ${TEMPLATES.map(tp => `
        <a class="product tpl-card" href="#/templates/${tp.id}">
          <div class="product-cover" aria-hidden="true"><span>${esc(L(tp.title))}</span></div>
          <h2>${esc(L(tp.title))}</h2>
          <p class="muted">${esc(L(tp.desc))}</p>
          <span class="verse-card-more">${t("Open")} ${icon("arrow")}</span>
        </a>`).join("")}
    </section>
  </section>`;
}

function templateView(root, tp) {
  const premium = store.isPremium();
  const v = VERSE_BY_ID[tp.verse];
  root.innerHTML = `
  <section class="template-view">
    <header class="wrap narrow page-head center no-print">
      <p class="eyebrow"><a href="#/templates">${t("Journal templates")}</a></p>
      <h1>${esc(L(tp.title))}</h1>
      <p class="lead center">${esc(L(tp.desc))}</p>
      <div class="row-center">
        <button class="btn btn-primary" type="button" data-print>${icon("print")}<span>${t("Print or save as PDF")}</span></button>
      </div>
      ${premium ? "" : `<p class="fine">${premiumBadge()} ${t("Printing is part of Premium.")}</p>`}
    </header>
    <article class="wrap narrow print-area tpl-page ${premium ? "" : "tpl-preview"}">
      <header class="tpl-head">
        <p class="tpl-brand">${t("Gita Reflection")}</p>
        <h2>${esc(L(tp.title))}</h2>
        <p class="tpl-verse"><span lang="sa">${esc(v.sa.split("\n")[0])}</span><br><em>“${esc(pick(v, "meaning"))}”</em> — ${t("Bhagavad Gita")} ${v.ch}.${v.v}</p>
      </header>
      ${tp.sections.map(([label, n]) => `<section class="tpl-section"><h3>${esc(L(label))}</h3>${lines(n)}</section>`).join("")}
      <p class="tpl-foot">${t("A calm place to pause and reflect")} · gita-reflection.vercel.app</p>
    </article>
  </section>`;
  root.querySelector("[data-print]").addEventListener("click", () => {
    if (!store.isPremium()) return premiumGate({ reason: "templates" });
    window.print();
  });
}

export function render(root, { params, navigate }) {
  if (!params.id) return listView(root);
  const tp = TEMPLATES.find(x => x.id === params.id);
  if (!tp) return navigate("/templates");
  templateView(root, tp);
}
