import { esc, icon, autoGrow, divider, toast } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { EMOTIONS } from "../data/emotions.js";
import { buildReflection, localizeReflection } from "../matcher.js";
import { t, pick } from "../i18n.js";
import { verseBlock, saveWithPrompt, emptyState } from "../components.js";
import { session, currentUser } from "../store.js";
import { openShare } from "../share.js";
import { openBreathe } from "./breathe.js";

export function render(root, { navigate, query }) {
  // Deep link from a guide page: #/reflection?e=overthinking
  if (query.e && EMOTIONS[query.e]) {
    const r = buildReflection({ emotion: query.e });
    session.set("current", { ...r, input: { emotion: query.e }, history: [r.verseId], draft: "" });
    history.replaceState(null, "", "#/reflection");
  }
  const stored = session.get("current");
  const current = stored && localizeReflection(stored);
  if (!current || !VERSE_BY_ID[current.verseId]) {
    root.innerHTML = `<section class="wrap narrow page-pad">${emptyState({
      title: t("Nothing here yet"),
      text: t("Start by sharing what you're feeling, and a moment from the Gita will meet you here."),
      action: `<a class="btn btn-primary" href="#/">${t("Share what you're feeling")}</a>`,
      level: 1
    })}</section>`;
    return;
  }

  const v = VERSE_BY_ID[current.verseId];
  const emotionLabel = pick(EMOTIONS[current.emotion], "label");
  // Show how free text was understood, for transparency.
  const showEmotion = current.input?.text && current.emotion !== "general";

  root.innerHTML = `
  <article class="result">
    <header class="wrap narrow result-head">
      <p class="eyebrow rise" style="--d:0">${t("Your reflection")}</p>
      <h1 class="sr-only" data-title="${t("Your reflection")}">${t("Your reflection")}</h1>
      <div class="you-said rise" style="--d:1">
        <p class="you-said-label">${t("You said")}</p>
        <blockquote>${esc(current.said)}</blockquote>
        ${showEmotion ? `<p class="fine">${t("Gently matched to:")} ${esc(emotionLabel)}</p>` : ""}
      </div>
    </header>

    <section class="wrap narrow rise" style="--d:2" aria-labelledby="moment-h">
      ${divider()}
      <h2 id="moment-h" class="section-label">${t("A moment from the Gita")}</h2>
      ${verseBlock(v, { headingLevel: 3 })}
    </section>

    <section class="wrap narrow why rise" style="--d:3" aria-labelledby="why-h">
      <h2 id="why-h" class="section-label">${t("Why this may speak to you")}</h2>
      <p class="why-text">${esc(current.why)}</p>
      <details class="context">
        <summary>${t("About this verse")}</summary>
        <p>${esc(pick(v, "context"))}</p>
      </details>
      <p class="fine">${t("This explanation is an interpretation written for Gita Reflection. It is not part of the scripture, and not professional advice.")}</p>
    </section>

    <section class="wrap narrow moment rise" style="--d:4" aria-labelledby="take-h">
      <h2 id="take-h" class="section-label">${t("Take a moment")}</h2>
      <p class="question">${esc(current.question)}</p>
      <label class="sr-only" for="reflection-text">${t("Your reflection")}</label>
      <textarea id="reflection-text" class="journal" rows="4" placeholder="${t("Write as much or as little as you like…")}">${esc(current.draft || "")}</textarea>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-act="save">${icon("bookmark")}<span>${current.savedId ? t("Update reflection") : t("Save reflection")}</span></button>
        <button class="btn btn-ghost" type="button" data-act="share">${icon("share")}<span>${t("Share")}</span></button>
        <button class="btn btn-ghost" type="button" data-act="another">${icon("refresh")}<span>${t("Read another")}</span></button>
        <button class="btn btn-ghost" type="button" data-act="breathe">${icon("breath")}<span>${t("Start a 2-minute reflection")}</span></button>
      </div>
      <p class="save-note fine" aria-live="polite">${current.savedId ? t("Saved to {link}.", { link: `<a href="#/journey">${t("your journey")}</a>` }) : currentUser() ? "" : t("No account needed to reflect. Create one only if you'd like to save.")}</p>
    </section>

    <section class="wrap narrow next-steps">
      <div class="soft-card">
        <p class="eyebrow">${t("Continue gently")}</p>
        <div class="next-grid">
          <a href="#/reflect"><strong>${t("Talk it through")}</strong><span>${t("A guided reflection inspired by the Gita")}</span></a>
          <a href="#/seven-days"><strong>${t("7 days with the Gita")}</strong><span>${t("A short guided journey")}</span></a>
          <a href="#/shlok/${v.ch}-${v.v}"><strong>${t("Read more about {ref}", { ref: `${v.ch}.${v.v}` })}</strong><span>${t("Context, practice and related verses")}</span></a>
        </div>
      </div>
    </section>
  </article>`;

  const ta = root.querySelector("#reflection-text");
  autoGrow(ta);
  ta.addEventListener("input", () => session.set("current", { ...session.get("current"), draft: ta.value }));

  root.querySelector(".actions").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const cur = localizeReflection(session.get("current"));
    const act = btn.dataset.act;

    if (act === "save") {
      const saved = saveWithPrompt({
        id: cur.savedId,
        source: "reflection",
        said: cur.said,
        emotion: cur.emotion,
        group: cur.group,
        verseId: cur.verseId,
        question: cur.question,
        text: ta.value.trim()
      });
      if (saved) {
        session.set("current", { ...cur, savedId: saved.id, draft: ta.value });
        btn.querySelector("span").textContent = t("Update reflection");
        root.querySelector(".save-note").innerHTML = `${t("Saved to {link}.", { link: `<a href="#/journey">${t("your journey")}</a>` })} ${t("Come back to it whenever you need.")}`;
      }
    }
    if (act === "share") openShare({ verseId: cur.verseId, reflection: cur.question });
    if (act === "breathe") openBreathe({ verseId: cur.verseId, question: cur.question });
    if (act === "another") {
      const history = cur.history || [cur.verseId];
      const next = buildReflection({ ...(cur.input || { text: cur.said }), exclude: history });
      const nextHistory = history.length >= 6 ? [next.verseId] : [...history, next.verseId];
      session.set("current", { ...next, said: cur.said, input: cur.input, history: nextHistory, draft: "" });
      toast(t("Here is another teaching."));
      navigate("/reflection");
    }
  });
}
