import { esc, lines, icon, autoGrow, divider } from "../ui.js";
import { VERSE_BY_ID, CATEGORIES } from "../data/verses.js";
import { relatedVerses, groupForVerse } from "../matcher.js";
import { verseBlock, verseCardSmall, saveWithPrompt, saveVerseButton, bindSaveVerse } from "../components.js";
import { session } from "../store.js";
import { openShare } from "../share.js";
import { openBreathe } from "./breathe.js";
import { loadFullGita } from "../fulldata.js";
import { t, pick } from "../i18n.js";

export async function render(root, { params }) {
  const id = String(params.id || "").replace("-", ".");
  const v = VERSE_BY_ID[id];
  if (!v) return renderExternal(root, id);

  const draftKey = `shlok.${id}`;
  const cats = CATEGORIES.filter(c => v.cats.includes(c.id));

  root.innerHTML = `
  <article class="shlok-page">
    <header class="wrap narrow page-head center">
      <p class="eyebrow"><a href="#/library">${t("Shlok library")}</a> · ${t("Chapter {n}", { n: v.ch })}</p>
      <h1 data-title="${t("Bhagavad Gita")} ${v.ch}.${v.v}">${t("Bhagavad Gita")} ${v.ch}.${v.v}</h1>
      <div class="chips chips-center">${cats.map(c => `<a class="chip chip-small" href="#/library?c=${c.id}">${esc(pick(c, "label"))}</a>`).join("")}</div>
    </header>

    <section class="wrap narrow">${verseBlock(v, { headingLevel: 2 })}</section>

    <section class="wrap narrow detail-grid">
      <div class="detail">
        <h2 class="section-label">${t("Context")}</h2>
        <p>${esc(pick(v, "context"))}</p>
      </div>
      <div class="detail">
        <h2 class="section-label">${t("When this may help")}</h2>
        <p>${esc(pick(v, "helps"))}</p>
      </div>
    </section>

    <section class="wrap narrow moment" aria-labelledby="q-h">
      ${divider()}
      <h2 id="q-h" class="section-label">${t("Reflection question")}</h2>
      <p class="question">${esc(pick(v, "question"))}</p>
      <label class="sr-only" for="shlok-text">${t("Your reflection")}</label>
      <textarea id="shlok-text" class="journal" rows="3" placeholder="${t("Write as much or as little as you like…")}">${esc(session.get(draftKey, ""))}</textarea>
      <div class="practice">
        <h3 class="section-label">${t("A small practice")}</h3>
        <p>${esc(pick(v, "practice"))}</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-act="save-reflection">${icon("bookmark")}<span>${t("Save reflection")}</span></button>
        ${saveVerseButton(v.id)}
        <button class="btn btn-ghost" type="button" data-act="share">${icon("share")}<span>${t("Share")}</span></button>
        <button class="btn btn-ghost" type="button" data-act="breathe">${icon("breath")}<span>${t("2-minute pause")}</span></button>
      </div>
    </section>

    <section class="wrap" aria-labelledby="rel-h">
      <h2 id="rel-h" class="section-label center">${t("Related teachings")}</h2>
      <div class="verse-grid">${relatedVerses(v).map(r => verseCardSmall(r)).join("")}</div>
    </section>

    <section class="wrap narrow center cta-quiet">
      <p class="statement small">${t("Is something on your mind?")}</p>
      <a class="btn btn-ghost" href="#/">${t("Share what you're feeling")} ${icon("arrow")}</a>
    </section>
  </article>`;

  const ta = root.querySelector("#shlok-text");
  autoGrow(ta);
  ta.addEventListener("input", () => session.set(draftKey, ta.value));
  bindSaveVerse(root);

  root.querySelector(".actions").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    if (btn.dataset.act === "save-reflection") {
      const saved = saveWithPrompt({
        id: session.get(`${draftKey}.id`) || undefined,
        source: "library", said: t("Reflecting on {ref}", { ref: `${v.ch}.${v.v}` }), emotion: null, group: groupForVerse(v),
        verseId: v.id, question: pick(v, "question"), text: ta.value.trim()
      });
      if (saved) session.set(`${draftKey}.id`, saved.id);
    }
    if (btn.dataset.act === "share") openShare({ verseId: v.id, reflection: pick(v, "question") });
    if (btn.dataset.act === "breathe") openBreathe({ verseId: v.id, question: pick(v, "question") });
  });
}

async function renderExternal(root, id) {
  const valid = /^\d{1,2}\.\d{1,3}$/.test(id);
  root.innerHTML = `
    <section class="wrap narrow page-head center">
      <p class="eyebrow"><a href="#/library">${t("Shlok library")}</a></p>
      <h1 data-title="${t("Bhagavad Gita")} ${esc(id)}">${t("Bhagavad Gita")} ${esc(id)}</h1>
      <div class="loading-line" aria-live="polite"><span class="breath-dot"></span> ${t("Opening the verse…")}</div>
    </section>`;
  const box = root.querySelector(".page-head");
  if (!valid) {
    box.querySelector(".loading-line").outerHTML = `<p class="lead center">${t("That doesn't look like a verse reference. Try something like 2.47.")}</p><a class="btn btn-ghost" href="#/library">${t("Back to the library")}</a>`;
    return;
  }
  try {
    const map = await loadFullGita();
    const v = map.get(id);
    if (!v) throw new Error("missing");
    box.insertAdjacentHTML("afterend", `
      <section class="wrap narrow">
        <div class="verse">
          <div class="verse-arch">
            <p class="sanskrit" lang="sa">${lines(v.sa)}</p>
            ${v.tr ? `<p class="translit">${lines(v.tr)}</p>` : ""}
          </div>
          <div class="layers">
            <section class="layer"><h2 class="layer-label">${t("Translation")}</h2><p class="translation">${esc(v.en)}</p></section>
          </div>
          <p class="fine">${t("Sanskrit and translation from the public Gita Quotes dataset. This verse isn't in our curated library yet, so there's no simple meaning or reflection for it.")}</p>
        </div>
      </section>`);
    box.querySelector(".loading-line").remove();
  } catch {
    box.querySelector(".loading-line").outerHTML = `
      <p class="lead center">${t("This verse isn't in our curated library yet, and we couldn't reach the full Gita right now.")}</p>
      <a class="btn btn-ghost" href="#/library">${t("Browse curated teachings")}</a>`;
  }
}
