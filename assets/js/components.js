// Building blocks shared across views.
import { esc, lines, icon, openModal, toast } from "./ui.js";
import { CONFIG } from "./config.js";
import * as store from "./store.js";

// The verse, with every layer clearly labelled so scripture is never confused with interpretation.
export function verseBlock(v, { hindi = true, meaning = true, headingLevel = 3, idPrefix = "v" } = {}) {
  const H = `h${headingLevel}`;
  return `
    <div class="verse">
      <p class="verse-ref"><a href="#/shlok/${v.ch}-${v.v}">Bhagavad Gita · Chapter ${v.ch}, Verse ${v.v}</a></p>
      <div class="verse-arch">
        <p class="sanskrit" lang="sa" aria-describedby="${idPrefix}-sa-label">${lines(v.sa)}</p>
        <span class="sr-only" id="${idPrefix}-sa-label">Original Sanskrit</span>
        <p class="translit" lang="sa-Latn">${lines(v.tr)}</p>
      </div>
      <div class="layers">
        <section class="layer">
          <${H} class="layer-label">Translation</${H}>
          <p class="translation">${esc(v.en)}</p>
        </section>
        ${hindi ? `<section class="layer" lang="hi">
          <${H} class="layer-label">हिन्दी भावार्थ</${H}>
          <p class="hindi">${esc(v.hi)}</p>
        </section>` : ""}
        ${meaning ? `<section class="layer layer-meaning">
          <${H} class="layer-label">In simple words <span class="tag-interp">Interpretation</span></${H}>
          <p class="simple">${esc(v.meaning)}</p>
        </section>` : ""}
      </div>
    </div>`;
}

export function verseCardSmall(v, { note } = {}) {
  return `
    <a class="verse-card" href="#/shlok/${v.ch}-${v.v}">
      <span class="verse-card-ref">${v.ch}.${v.v}</span>
      <span class="verse-card-sa" lang="sa">${esc(v.sa.split("\n")[0].replace(/[।॥]/g, ""))}</span>
      <span class="verse-card-meaning">${esc(note || v.meaning)}</span>
      <span class="verse-card-more">Read ${icon("arrow")}</span>
    </a>`;
}

export function crisisBlock() {
  const c = CONFIG.crisis;
  return `
    <article class="crisis" role="alert" aria-labelledby="crisis-title">
      <p class="eyebrow">Please pause for a moment</p>
      <h2 id="crisis-title">You don't have to carry this alone.</h2>
      <p>What you've shared sounds really painful, and your safety matters more than any reflection right now.</p>
      <p>If you might hurt yourself or you don't feel safe, please reach out to someone now — a person you trust nearby, or a trained listener.</p>
      <div class="crisis-actions">
        <a class="btn btn-primary" href="tel:${esc(c.phone)}">Call ${esc(c.name)} · ${esc(c.phone)}</a>
        <a class="btn btn-ghost" href="tel:${esc(c.emergency)}">Emergency · ${esc(c.emergency)}</a>
      </div>
      <p class="fine">${esc(c.name)} is India's free, 24×7 mental-health helpline (also ${esc(c.altPhone)}). Outside India, <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a> lists free, confidential helplines in your country.</p>
      <p class="fine">Gita Reflection is a reflection tool and cannot help in an emergency. When you're safe and ready, this space will still be here.</p>
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
  openModal({
    title: copy[0],
    className: "join-modal",
    body: `
      <p>${esc(copy[1])}</p>
      <div class="stack">
        <a class="btn btn-primary btn-block" href="#/signup?next=${next}">Create a free account</a>
        <a class="btn btn-ghost btn-block" href="#/login?next=${next}">I already have an account</a>
      </div>
      <p class="fine center">Free forever for the essentials. Your reflections stay private${store.backendMode() === "supabase" ? " to your account" : " on this device"}.</p>`,
    onOpen: (el, close) => el.querySelectorAll("a").forEach(a => a.addEventListener("click", close))
  });
}

export function limitReached() {
  openModal({
    title: "Your journal is full for now",
    body: `
      <p>You've saved ${CONFIG.freeSavedLimit} reflections — that's a lot of quiet moments. Everything you've saved stays safe.</p>
      <p>To keep saving new ones, you can let go of an older reflection, or go deeper with Premium for unlimited history.</p>
      <div class="stack">
        <a class="btn btn-primary btn-block" href="#/premium">See Premium</a>
        <a class="btn btn-ghost btn-block" href="#/journey">Review my reflections</a>
      </div>`,
    onOpen: (el, close) => el.querySelectorAll("a").forEach(a => a.addEventListener("click", close))
  });
}

// Save with the right gentle prompt when needed. Returns the saved reflection or null.
export function saveWithPrompt(entry) {
  const res = store.saveReflection(entry);
  if (res.ok) { toast("Saved to your journey."); return res.reflection; }
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
    if (res.ok && !quiet) toast("Your reflection is saved.");
    else if (res.reason === "limit") limitReached();
    return res.ok;
  }
  if (p.type === "saveVerse") {
    if (!store.isVerseSaved(p.id)) store.toggleSavedVerse(p.id);
    if (!quiet) toast("Verse saved to your journey.");
    return true;
  }
  return false;
}

export function saveVerseButton(verseId) {
  const saved = store.currentUser() && store.isVerseSaved(verseId);
  return `<button class="btn btn-ghost" type="button" data-save-verse="${esc(verseId)}" aria-pressed="${saved ? "true" : "false"}">${icon("bookmark")}<span>${saved ? "Saved" : "Save"}</span></button>`;
}

export function bindSaveVerse(root) {
  root.querySelectorAll("[data-save-verse]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.saveVerse;
    const res = store.toggleSavedVerse(id);
    if (!res.ok) return askToJoin({ reason: "verse", pending: { type: "saveVerse", id } });
    btn.setAttribute("aria-pressed", String(res.saved));
    btn.querySelector("span").textContent = res.saved ? "Saved" : "Save";
    toast(res.saved ? "Verse saved to your journey." : "Removed from saved verses.");
  }));
}

export function premiumBadge() {
  return `<span class="badge-premium">${icon("lock")} Premium</span>`;
}

export function emptyState({ title, text, action }) {
  return `
    <div class="empty">
      <div class="empty-orb" aria-hidden="true"></div>
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
      ${action || ""}
    </div>`;
}
