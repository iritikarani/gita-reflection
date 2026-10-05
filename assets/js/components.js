// Building blocks shared across views.
import { esc, lines, icon, openModal, toast } from "./ui.js";
import { CONFIG } from "./config.js";
import * as store from "./store.js";
import { t, pick, isHindi } from "./i18n.js";

export function verseRefText(v) {
  return t("Bhagavad Gita · Chapter {ch}, Verse {v}", { ch: v.ch, v: v.v });
}

// The verse, with every layer clearly labelled so scripture is never confused with interpretation.
// In Hindi the Hindi भावार्थ comes first; in English the English translation does.
export function verseBlock(v, { hindi = true, meaning = true, headingLevel = 3, idPrefix = "v" } = {}) {
  const H = `h${headingLevel}`;
  const english = `<section class="layer" lang="en">
          <${H} class="layer-label">${isHindi() ? "अंग्रेज़ी अनुवाद · English translation" : "Translation"}</${H}>
          <p class="translation">${esc(v.en)}</p>
        </section>`;
  const hindiLayer = hindi ? `<section class="layer" lang="hi">
          <${H} class="layer-label">हिन्दी भावार्थ</${H}>
          <p class="hindi">${esc(v.hi)}</p>
        </section>` : "";
  return `
    <div class="verse">
      <p class="verse-ref"><a href="#/shlok/${v.ch}-${v.v}">${esc(verseRefText(v))}</a></p>
      <div class="verse-arch">
        <p class="sanskrit" lang="sa" aria-describedby="${idPrefix}-sa-label">${lines(v.sa)}</p>
        <span class="sr-only" id="${idPrefix}-sa-label">${t("Original Sanskrit")}</span>
        <p class="translit" lang="sa-Latn">${lines(v.tr)}</p>
      </div>
      <div class="layers">
        ${isHindi() ? hindiLayer + english : english + hindiLayer}
        ${meaning ? `<section class="layer layer-meaning">
          <${H} class="layer-label">${t("In simple words")} <span class="tag-interp">${t("Interpretation")}</span></${H}>
          <p class="simple">${esc(pick(v, "meaning"))}</p>
        </section>` : ""}
      </div>
    </div>`;
}

export function verseCardSmall(v, { note } = {}) {
  return `
    <a class="verse-card" href="#/shlok/${v.ch}-${v.v}">
      <span class="verse-card-ref">${v.ch}.${v.v}</span>
      <span class="verse-card-sa" lang="sa">${esc(v.sa.split("\n")[0].replace(/[।॥]/g, ""))}</span>
      <span class="verse-card-meaning">${esc(note || pick(v, "meaning"))}</span>
      <span class="verse-card-more">${t("Read")} ${icon("arrow")}</span>
    </a>`;
}

export function crisisBlock() {
  const c = CONFIG.crisis;
  return `
    <article class="crisis" role="alert" aria-labelledby="crisis-title">
      <p class="eyebrow">${t("Please pause for a moment")}</p>
      <h2 id="crisis-title">${t("You don't have to carry this alone.")}</h2>
      <p>${t("What you've shared sounds really painful, and your safety matters more than any reflection right now.")}</p>
      <p>${t("If you might hurt yourself or you don't feel safe, please reach out to someone now — a person you trust nearby, or a trained listener.")}</p>
      <div class="crisis-actions">
        <a class="btn btn-primary" href="tel:${esc(c.phone)}">${t("Call {name}", { name: esc(c.name) })} · ${esc(c.phone)}</a>
        <a class="btn btn-ghost" href="tel:${esc(c.emergency)}">${t("Emergency")} · ${esc(c.emergency)}</a>
      </div>
      <p class="fine">${t("{name} is India's free, 24×7 mental-health helpline (also {alt}).", { name: esc(c.name), alt: esc(c.altPhone) })} ${t("Outside India, {link} lists free, confidential helplines in your country.", { link: `<a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a>` })}</p>
      <p class="fine">${t("Gita Reflection is a reflection tool and cannot help in an emergency. When you're safe and ready, this space will still be here.")}</p>
    </article>`;
}

// Ask a visitor to create an account at the moment it becomes useful.
export function askToJoin({ reason = "save", pending } = {}) {
  if (pending) store.setPending(pending);
  const copy = {
    save: ["Keep this reflection", "Create a free account to save your reflections and return to them whenever you need them."],
    journey: ["Continue your journey", "Create a free account to keep your place in the 7-day journey and come back to it any day."],
    verse: ["Keep this verse close", "Create a free account to save verses to your journey."],
    history: ["Your reflections, all in one place", "Create a free account to see your saved reflections and gentle patterns over time."]
  }[reason] || ["Create a free account", ""];
  const next = encodeURIComponent(location.hash.slice(1) || "/");
  const privacy = store.backendMode() === "supabase"
    ? t("Free forever for the essentials. Your reflections stay private to your account.")
    : t("Free forever for the essentials. Your reflections stay private on this device.");
  openModal({
    title: t(copy[0]),
    className: "join-modal",
    closeLabel: t("Close"),
    body: `
      <p>${esc(t(copy[1]))}</p>
      <div class="stack">
        <a class="btn btn-primary btn-block" href="#/signup?next=${next}">${t("Create a free account")}</a>
        <a class="btn btn-ghost btn-block" href="#/login?next=${next}">${t("I already have an account")}</a>
      </div>
      <p class="fine center">${privacy}</p>`,
    onOpen: (el, close) => el.querySelectorAll("a").forEach(a => a.addEventListener("click", close))
  });
}

export function limitReached() {
  openModal({
    title: t("Your journal is full for now"),
    closeLabel: t("Close"),
    body: `
      <p>${t("You've saved {n} reflections — that's a lot of quiet moments. Everything you've saved stays safe.", { n: CONFIG.freeSavedLimit })}</p>
      <p>${t("To keep saving new ones, you can let go of an older reflection, or go deeper with Premium for unlimited history.")}</p>
      <div class="stack">
        <a class="btn btn-primary btn-block" href="#/premium">${t("See Premium")}</a>
        <a class="btn btn-ghost btn-block" href="#/journey">${t("Review my reflections")}</a>
      </div>`,
    onOpen: (el, close) => el.querySelectorAll("a").forEach(a => a.addEventListener("click", close))
  });
}

// Save with the right gentle prompt when needed. Returns the saved reflection or null.
export function saveWithPrompt(entry) {
  const res = store.saveReflection(entry);
  if (res.ok) { toast(t("Saved to your journey.")); return res.reflection; }
  if (res.reason === "auth") askToJoin({ reason: "save", pending: { type: "saveReflection", entry } });
  if (res.reason === "limit") limitReached();
  return null;
}

// Run an action remembered before sign-up / login.
export function runPending({ quiet = false } = {}) {
  const p = store.takePending();
  if (!p) return false;
  if (p.type === "saveReflection") {
    const res = store.saveReflection(p.entry);
    if (res.ok && !quiet) toast(t("Your reflection is saved."));
    else if (res.reason === "limit") limitReached();
    return res.ok;
  }
  if (p.type === "saveVerse") {
    if (!store.isVerseSaved(p.id)) store.toggleSavedVerse(p.id);
    if (!quiet) toast(t("Verse saved to your journey."));
    return true;
  }
  return false;
}

export function saveVerseButton(verseId, { label = "Save" } = {}) {
  const saved = store.currentUser() && store.isVerseSaved(verseId);
  return `<button class="btn btn-ghost" type="button" data-save-verse="${esc(verseId)}" data-label="${esc(label)}" aria-pressed="${saved ? "true" : "false"}">${icon("bookmark")}<span>${saved ? t("Saved") : t(label)}</span></button>`;
}

export function bindSaveVerse(root) {
  root.querySelectorAll("[data-save-verse]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.saveVerse;
    const res = store.toggleSavedVerse(id);
    if (!res.ok) return askToJoin({ reason: "verse", pending: { type: "saveVerse", id } });
    btn.setAttribute("aria-pressed", String(res.saved));
    btn.querySelector("span").textContent = res.saved ? t("Saved") : t(btn.dataset.label || "Save");
    toast(res.saved ? t("Verse saved to your journey.") : t("Removed from saved verses."));
  }));
}

export function premiumBadge() {
  return `<span class="badge-premium">${icon("lock")} ${t("Premium")}</span>`;
}

// level: 1 when the empty state is the whole page (it then provides the page's <h1>).
export function emptyState({ title, text, action, level = 3 }) {
  return `
    <div class="empty">
      <div class="empty-orb" aria-hidden="true"></div>
      <h${level} class="empty-title">${esc(title)}</h${level}>
      <p>${esc(text)}</p>
      ${action || ""}
    </div>`;
}
