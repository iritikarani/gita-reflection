// Premium: a private journal — free writing, not tied to a verse.
import { esc, icon, autoGrow, formatDate, openModal, toast } from "../ui.js";
import * as store from "../store.js";
import { emptyState, premiumBadge } from "../components.js";
import { JOURNAL_PROMPTS } from "../data/programs.js";
import { t, isHindi } from "../i18n.js";

export function render(root, { navigate }) {
  if (!store.currentUser()) return navigate("/login?next=/journal");
  if (!store.isPremium()) {
    root.innerHTML = `<section class="wrap narrow page-pad">${emptyState({
      title: t("Your private journal"),
      text: t("A quiet place to write freely, with or without a verse. Only you can read it. This is part of Premium."),
      action: `${premiumBadge()}<div class="row-center"><a class="btn btn-primary" href="#/premium">${t("See Premium")}</a></div>`,
      level: 1
    })}</section>`;
    return;
  }

  const prompts = JOURNAL_PROMPTS.map(p => p[isHindi() ? 1 : 0]);
  const draftKey = "journal.draft";
  let promptIndex = Math.floor(Date.now() / 86400000) % prompts.length;

  function draw() {
    const entries = store.getData().reflections.filter(r => r.source === "journal");
    root.innerHTML = `
    <section class="journal-page">
      <header class="wrap narrow page-head center">
        <p class="eyebrow">${t("Private journal")}</p>
        <h1>${t("Write freely")}</h1>
        <p class="lead center">${t("No verse, no question unless you want one. Hindi, English or Hinglish — however it comes.")}</p>
      </header>
      <section class="wrap narrow moment">
        <div class="prompt-row">
          <p class="question journal-prompt">${esc(prompts[promptIndex])}</p>
          <button class="btn btn-link btn-sm" type="button" data-next-prompt>${icon("refresh")}<span>${t("Another prompt")}</span></button>
        </div>
        <label class="sr-only" for="journal-text">${t("Journal entry")}</label>
        <textarea id="journal-text" class="journal" rows="8" placeholder="${t("Write freely. No one else will read this.")}">${esc(store.session.get(draftKey, ""))}</textarea>
        <div class="actions">
          <button class="btn btn-primary" type="button" data-save>${icon("bookmark")}<span>${t("Save entry")}</span></button>
        </div>
      </section>
      <section class="wrap narrow" aria-labelledby="past-h">
        <h2 id="past-h" class="section-label">${t("Past entries")}</h2>
        <div class="entries">
          ${entries.length ? entries.map(r => `
            <article class="entry">
              <div class="entry-top"><time class="entry-date">${esc(formatDate(r.createdAt, { weekday: "short", day: "numeric", month: "short", year: "numeric" }))}</time></div>
              ${r.question ? `<p class="entry-q">${esc(r.question)}</p>` : ""}
              <p class="entry-text">${esc(r.text)}</p>
              <div class="entry-tools"><button class="btn btn-link btn-sm" type="button" data-delete="${esc(r.id)}">${icon("trash")}<span>${t("Delete")}</span></button></div>
            </article>`).join("") : `<p class="muted">${t("Your entries will appear here.")}</p>`}
        </div>
      </section>
    </section>`;

    const ta = root.querySelector("#journal-text");
    autoGrow(ta);
    ta.addEventListener("input", () => store.session.set(draftKey, ta.value));
    root.querySelector("[data-next-prompt]").addEventListener("click", () => {
      promptIndex = (promptIndex + 1) % prompts.length;
      root.querySelector(".journal-prompt").textContent = prompts[promptIndex];
    });
    root.querySelector("[data-save]").addEventListener("click", () => {
      const text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      const res = store.saveReflection({ source: "journal", said: "", emotion: null, group: null, verseId: null, question: prompts[promptIndex], text });
      if (!res.ok) return toast(t("We couldn't save that just now. Please check your connection and try again."));
      store.session.remove(draftKey);
      toast(t("Saved to your journal."));
      draw();
    });
    root.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => openModal({
      title: t("Delete this entry?"),
      body: `<p>${t("This can't be undone.")}</p><div class="row-end"><button class="btn btn-ghost" type="button" data-no>${t("Keep it")}</button><button class="btn btn-danger" type="button" data-yes>${t("Delete")}</button></div>`,
      onOpen: (el, close) => {
        el.querySelector("[data-no]").addEventListener("click", close);
        el.querySelector("[data-yes]").addEventListener("click", () => { store.deleteReflection(b.dataset.delete); close(); draw(); });
      }
    })));
  }

  draw();
}
