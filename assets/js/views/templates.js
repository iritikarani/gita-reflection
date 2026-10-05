// Premium: printable journal templates (print or save as PDF).
import { esc, icon } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import * as store from "../store.js";
import { premiumBadge, premiumGate } from "../components.js";
import { t, pick, isHindi } from "../i18n.js";

const lines = n => `<div class="tpl-lines">${"<span></span>".repeat(n)}</div>`;

const TEMPLATES = [
  {
    id: "daily", verse: "2.14",
    title: ["Daily reflection page", "दैनिक चिंतन पन्ना"],
    desc: ["One page for one quiet moment: how you feel, a shlok, what it tells you, and three small gratitudes.", "एक शांत पल के लिए एक पन्ना: आप कैसा महसूस कर रहे हैं, एक श्लोक, वह आपसे क्या कहता है, और तीन छोटी कृतज्ञताएँ।"],
    sections: [
      [["Date", "तारीख़"], 1],
      [["How I'm feeling today", "आज मैं कैसा महसूस कर रहा/रही हूँ"], 3],
      [["Today's shlok (chapter.verse)", "आज का श्लोक (अध्याय.श्लोक)"], 2],
      [["What it may be telling me", "यह मुझसे क्या कह सकता है"], 5],
      [["One small practice for today", "आज के लिए एक छोटा अभ्यास"], 2],
      [["Three things I'm grateful for", "तीन बातें जिनके लिए मैं आभारी हूँ"], 3]
    ]
  },
  {
    id: "weekly", verse: "2.70",
    title: ["Weekly review", "साप्ताहिक समीक्षा"],
    desc: ["Look back gently at the week: what returned, what stayed with you, what you're ready to set down.", "हफ़्ते को कोमलता से देखिए: क्या बार-बार लौटा, क्या साथ रहा, और आप क्या नीचे रखने को तैयार हैं।"],
    sections: [
      [["Week of", "सप्ताह"], 1],
      [["Feelings and themes I kept returning to", "भावनाएँ और विषय जिन पर मैं बार-बार लौटा/लौटी"], 4],
      [["A verse that stayed with me", "एक श्लोक जो मेरे साथ रहा"], 3],
      [["What I'm ready to let go of", "मैं क्या छोड़ने को तैयार हूँ"], 3],
      [["What I'm carrying forward", "मैं आगे क्या साथ ले जा रहा/रही हूँ"], 3],
      [["One intention for next week", "अगले हफ़्ते के लिए एक संकल्प"], 2]
    ]
  },
  {
    id: "decision", verse: "18.63",
    title: ["Decision worksheet", "निर्णय कार्यपत्र"],
    desc: ["“Reflect on it fully, then do as you choose.” A page for thinking a choice through, inspired by Gita 18.63, 2.47 and 3.35.", "“इस पर पूरी तरह विचार करो, फिर जैसा चाहो वैसा करो।” गीता 18.63, 2.47 और 3.35 से प्रेरित, किसी निर्णय को सोचने का एक पन्ना।"],
    sections: [
      [["The choice in front of me", "मेरे सामने का निर्णय"], 2],
      [["What I already know", "मैं पहले से क्या जानता/जानती हूँ"], 3],
      [["What I'm afraid of", "मुझे किस बात का डर है"], 3],
      [["What is in my control — and what isn't (2.47)", "क्या मेरे नियंत्रण में है — और क्या नहीं (2.47)"], 4],
      [["Which option feels like my own path? (3.35)", "कौन-सा विकल्प मेरा अपना रास्ता लगता है? (3.35)"], 3],
      [["After sleeping on it, I choose…", "एक रात सोचने के बाद, मैं चुनता/चुनती हूँ…"], 2]
    ]
  },
  {
    id: "gratitude", verse: "9.26",
    title: ["Gratitude page", "कृतज्ञता पन्ना"],
    desc: ["“A leaf, a flower, a fruit or a little water.” Small things, noticed with love — inspired by Gita 9.26.", "“एक पत्ता, एक फूल, एक फल या थोड़ा जल।” प्रेम से देखी गई छोटी चीज़ें — गीता 9.26 से प्रेरित।"],
    sections: [
      [["Date", "तारीख़"], 1],
      [["Small things I noticed today", "आज जिन छोटी चीज़ों पर मेरा ध्यान गया"], 5],
      [["Someone who has quietly been on my side", "कोई जो चुपचाप मेरे साथ रहा"], 2],
      [["A small offering I can make today", "आज मैं कौन-सी छोटी भेंट दे सकता/सकती हूँ"], 3]
    ]
  }
];

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
