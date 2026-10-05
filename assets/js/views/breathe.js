// "Start a 2-minute reflection": a quiet full-screen moment with a breathing guide.
import { esc, icon, prefersReducedMotion } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { startAmbience, stopAmbience, isPlaying } from "../sound.js";
import { prefs } from "../store.js";
import { t, pick } from "../i18n.js";

const PHASES = [
  { label: "Breathe in", secs: 4, cls: "in" },
  { label: "Hold", secs: 2, cls: "hold" },
  { label: "Breathe out", secs: 6, cls: "out" }
];

export function openBreathe({ verseId, question, seconds = 120 } = {}) {
  const v = verseId ? VERSE_BY_ID[verseId] : null;
  const previous = document.activeElement;
  const startedSound = !isPlaying() && prefs().sound;
  if (startedSound) startAmbience();

  const el = document.createElement("div");
  el.className = "breathe";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", t("Two-minute reflection"));
  el.innerHTML = `
    <button class="icon-btn breathe-close" type="button" aria-label="${t("End reflection")}">${icon("close")}</button>
    <div class="breathe-inner">
      <p class="eyebrow">${t("A two-minute pause")}</p>
      <div class="breath-orb ${prefersReducedMotion() ? "still" : ""}" aria-hidden="true"><span></span></div>
      <p class="breath-phase" aria-live="polite">${t("Settle in")}</p>
      ${v ? `<p class="breathe-meaning">“${esc(pick(v, "meaning"))}”</p><p class="fine">${t("Bhagavad Gita")} ${v.ch}.${v.v}</p>` : ""}
      ${question ? `<p class="breathe-question">${esc(question)}</p>` : ""}
      <p class="breathe-time" aria-hidden="true"></p>
    </div>`;
  document.body.appendChild(el);
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => el.classList.add("show"));
  el.querySelector(".breathe-close").focus();

  const orb = el.querySelector(".breath-orb");
  const phaseEl = el.querySelector(".breath-phase");
  const timeEl = el.querySelector(".breathe-time");
  let remaining = seconds;
  let phaseIndex = -1;
  let phaseLeft = 3; // a short settling moment first
  let finished = false;

  function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
  timeEl.textContent = fmt(remaining);

  const tick = setInterval(() => {
    if (finished) return;
    remaining--;
    timeEl.textContent = fmt(Math.max(0, remaining));
    phaseLeft--;
    if (phaseLeft <= 0) {
      phaseIndex = (phaseIndex + 1) % PHASES.length;
      const p = PHASES[phaseIndex];
      phaseLeft = p.secs;
      phaseEl.textContent = t(p.label);
      orb.classList.remove("in", "hold", "out");
      orb.classList.add(p.cls);
    }
    if (remaining <= 0) finish();
  }, 1000);

  function finish() {
    finished = true;
    clearInterval(tick);
    orb.classList.remove("in", "hold", "out");
    phaseEl.textContent = t("Take this with you.");
    timeEl.innerHTML = `<button class="btn btn-soft" type="button" data-close>${t("Return gently")}</button>`;
    timeEl.removeAttribute("aria-hidden");
    timeEl.querySelector("[data-close]").addEventListener("click", close);
    timeEl.querySelector("[data-close]").focus();
  }

  function close() {
    clearInterval(tick);
    document.removeEventListener("keydown", onKey);
    if (startedSound) stopAmbience();
    el.classList.remove("show");
    setTimeout(() => { el.remove(); if (!document.querySelector(".modal-backdrop")) document.body.classList.remove("modal-open"); }, 400);
    previous?.focus?.();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const f = [...el.querySelectorAll("button")];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
  document.addEventListener("keydown", onKey);
  el.querySelector(".breathe-close").addEventListener("click", close);
}
