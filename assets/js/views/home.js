import { esc, icon, autoGrow, divider, mark } from "../ui.js";
import { EMOTIONS, QUICK_CHOICES, UNKNOWN_STATES, isCrisis } from "../data/emotions.js";
import { VERSE_BY_ID, CATEGORIES } from "../data/verses.js";
import { SEVEN_DAYS } from "../data/journey.js";
import { buildReflection, dailyVerse } from "../matcher.js";
import { crisisBlock } from "../components.js";
import { session, currentUser } from "../store.js";
import { t, pick, isHindi } from "../i18n.js";

const PLACEHOLDERS = {
  en: [
    "I keep worrying about my exams…",
    "मुझे समझ नहीं आ रहा कि क्या करूँ…",
    "Bahut thak gaya hoon, kuch accha nahi lag raha…",
    "I don't know if I should continue…",
    "I feel like I'm not good enough…"
  ],
  hi: [
    "मुझे समझ नहीं आ रहा कि क्या करूँ…",
    "परीक्षा को लेकर बहुत चिंता हो रही है…",
    "Bahut thak gaya hoon, kuch accha nahi lag raha…",
    "मन बहुत भारी है…",
    "I feel like I'm not good enough…"
  ]
};

export function startReflection({ text = "", emotion = null }, navigate) {
  const r = buildReflection({ text, emotion });
  session.set("current", { ...r, input: { text, emotion }, history: [r.verseId], draft: "" });
  navigate("/reflection");
}

export function render(root, { navigate }) {
  const today = dailyVerse();
  const me = currentUser();
  const draft = session.get("homeDraft", "");
  const PH = PLACEHOLDERS[isHindi() ? "hi" : "en"];

  root.innerHTML = `
  <section class="hero">
    <div class="wrap narrow hero-inner">
      <p class="eyebrow rise" style="--d:0">${t("A quiet place to pause")}</p>
      <h1 class="hero-title rise" style="--d:1">${t("What's troubling you?")}</h1>
      <p class="lead rise" style="--d:2">${t("Tell me what you're carrying today. Find a moment of wisdom from the Bhagavad Gita.")}</p>

      <form class="ask rise" style="--d:3" id="ask" autocomplete="off" novalidate>
        <label class="sr-only" for="ask-input">${t("Describe what you're feeling")}</label>
        <textarea id="ask-input" rows="2" maxlength="600" placeholder="${esc(PH[0])}" aria-describedby="ask-hint">${esc(draft)}</textarea>
        <button class="btn btn-primary ask-btn" type="submit">
          <span>${t("Find a moment of wisdom")}</span>${icon("arrow")}
        </button>
      </form>
      <p id="ask-hint" class="hint rise" style="--d:3">${t("English, हिन्दी or Hinglish — write it however it comes. Nothing you type is sent anywhere unless you choose to save it.")}</p>

      <div id="feelings" class="feelings rise" style="--d:4">
        <p class="feelings-label">${t("Or choose what feels closest")}</p>
        <div class="chips" role="group" aria-label="${t("Choose a feeling")}">
          ${QUICK_CHOICES.map(k => `<button type="button" class="chip" data-emotion="${k}">${esc(pick(EMOTIONS[k], "label"))}</button>`).join("")}
        </div>
        <button type="button" class="unknown-btn" data-unknown aria-expanded="false" aria-controls="unknown-panel">
          <span class="unknown-orb" aria-hidden="true"></span>
          <span>${t("I don't know what I feel")}</span>
        </button>
        <div id="unknown-panel" class="unknown-panel" hidden>
          <p class="unknown-title">${t("That's okay. You don't have to name it.")}</p>
          <p class="muted">${t("If you like, choose whatever is nearest. There's no wrong answer.")}</p>
          <div class="chips" role="group" aria-label="${t("Choose a state")}">
            ${UNKNOWN_STATES.map(k => `<button type="button" class="chip chip-soft" data-emotion="${k}">${esc(pick(EMOTIONS[k], "label"))}</button>`).join("")}
            <button type="button" class="chip chip-soft" data-something-else>${t("Something else")}</button>
          </div>
        </div>
      </div>
      <div id="crisis-slot"></div>
    </div>
  </section>

  <section class="section">
    <div class="wrap narrow center">
      ${divider()}
      <p class="statement">${t("A calm place to pause, reflect, and find perspective through the wisdom of the Bhagavad Gita.")}</p>
      <p class="muted">${t("Not a quote website. Not therapy. A quiet moment between you and a teaching that has steadied people for over two thousand years.")}</p>
    </div>
  </section>

  <section class="section" aria-labelledby="daily-h">
    <div class="wrap">
      <div class="split">
        <div>
          <p class="eyebrow">${t("Daily Gita")}</p>
          <h2 id="daily-h">${t("Today's moment")}</h2>
          <p class="muted">${t("One shlok, one question and one small practice — the same for everyone today. Come back tomorrow for another.")}</p>
          <a class="btn btn-ghost" href="#/daily">${t("Open today's Gita")} ${icon("arrow")}</a>
        </div>
        <a class="daily-preview" href="#/daily" aria-label="${t("Today's shlok")}: ${esc(pick(today, "meaning"))}">
          <span class="verse-ref">${t("Bhagavad Gita")} ${today.ch}.${today.v}</span>
          <span class="daily-sa" lang="sa">${esc(today.sa.split("\n")[0])}</span>
          <span class="daily-meaning">“${esc(pick(today, "meaning"))}”</span>
          <span class="daily-practice"><strong>${t("Today's practice")}</strong> ${esc(pick(today, "practice"))}</span>
        </a>
      </div>
    </div>
  </section>

  <section class="section tint" aria-labelledby="how-h">
    <div class="wrap">
      <p class="eyebrow center">${t("How it works")}</p>
      <h2 id="how-h" class="center">${t("Three quiet steps")}</h2>
      <ol class="steps">
        <li><span class="step-n">1</span><h3>${t("Tell us how you're feeling")}</h3><p>${t("In your own words, in any language — or simply choose a feeling.")}</p></li>
        <li><span class="step-n">2</span><h3>${t("Receive a relevant teaching")}</h3><p>${t("A shlok from the Gita, with its translation, meaning and why it may speak to you.")}</p></li>
        <li><span class="step-n">3</span><h3>${t("Take a moment to reflect")}</h3><p>${t("One gentle question. Write, breathe, or simply sit with it — and save it if you'd like.")}</p></li>
      </ol>
    </div>
  </section>

  <section class="section" aria-labelledby="seven-h">
    <div class="wrap">
      <div class="split reverse">
        <div>
          <p class="eyebrow">${t("A guided journey")}</p>
          <h2 id="seven-h">${t("7 days with the Gita")}</h2>
          <p class="muted">${t("A short, gentle path — one theme a day, with a shlok, a reflection, a journaling prompt and a small real-life practice.")}</p>
          <a class="btn btn-ghost" href="#/seven-days">${t("Begin the journey")} ${icon("arrow")}</a>
        </div>
        <ol class="seven-preview" aria-label="${t("The seven days")}">
          ${SEVEN_DAYS.map(d => `<li><span class="seven-dot" aria-hidden="true"></span><span class="seven-day">${t("Day {n}", { n: d.day })}</span><span class="seven-theme">${esc(pick(d, "theme"))}</span></li>`).join("")}
        </ol>
      </div>
    </div>
  </section>

  <section class="section tint" aria-labelledby="lib-h">
    <div class="wrap center">
      <p class="eyebrow">${t("Shlok library")}</p>
      <h2 id="lib-h">${t("Wisdom, gathered by what you're going through")}</h2>
      <div class="chips chips-center">
        ${CATEGORIES.map(c => `<a class="chip" href="#/library?c=${c.id}">${esc(pick(c, "label"))}</a>`).join("")}
      </div>
      <a class="btn btn-ghost" href="#/library">${t("Explore the library")} ${icon("arrow")}</a>
    </div>
  </section>

  <section class="section" aria-labelledby="share-h">
    <div class="wrap">
      <div class="split">
        <div>
          <p class="eyebrow">${t("Share gently")}</p>
          <h2 id="share-h">${t("Pass a moment of calm to someone")}</h2>
          <p class="muted">${t("Every teaching can become a simple, beautiful card — for WhatsApp, Instagram, or just to keep.")}</p>
        </div>
        <figure class="card-mock" aria-label="${t("Example share card")}">
          ${mark("card-mock-mark")}
          <figcaption class="card-mock-label">${t("A thought from the Bhagavad Gita")}</figcaption>
          <p class="card-mock-text">“${esc(pick(VERSE_BY_ID["2.47"], "meaning"))}”</p>
          <p class="card-mock-ref">${t("Bhagavad Gita")} 2.47</p>
          <p class="card-mock-q">${esc(pick(VERSE_BY_ID["2.47"], "question"))}</p>
          <p class="card-mock-brand">${t("Gita Reflection")}</p>
        </figure>
      </div>
    </div>
  </section>

  <section class="section tint" aria-labelledby="deeper-h">
    <div class="wrap narrow center">
      <p class="eyebrow">${t("When you're ready")}</p>
      <h2 id="deeper-h">${t("Go deeper")}</h2>
      <p class="muted">${t("The essentials here are free, always. Premium is for those who want longer guided journeys, a private journal without limits, and a monthly look back at their reflections.")}</p>
      <div class="row-center">
        <a class="btn btn-ghost" href="#/premium">${t("Explore Premium")}</a>
        ${me ? "" : `<a class="btn btn-link" href="#/signup">${t("Create a free account")}</a>`}
      </div>
    </div>
  </section>`;

  // ---- behaviour ----
  const form = root.querySelector("#ask");
  const input = root.querySelector("#ask-input");
  const crisisSlot = root.querySelector("#crisis-slot");
  autoGrow(input);

  let p = 0;
  const rotate = setInterval(() => {
    if (document.activeElement === input || input.value) return;
    p = (p + 1) % PH.length;
    input.placeholder = PH[p];
  }, 4200);

  input.addEventListener("input", () => session.set("homeDraft", input.value));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.focus();
      input.classList.add("nudge");
      setTimeout(() => input.classList.remove("nudge"), 900);
      return;
    }
    if (isCrisis(text)) {
      crisisSlot.innerHTML = crisisBlock();
      crisisSlot.querySelector("h2").setAttribute("tabindex", "-1");
      crisisSlot.querySelector("h2").focus();
      return;
    }
    session.remove("homeDraft");
    startReflection({ text }, navigate);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) form.requestSubmit();
  });

  root.querySelectorAll("[data-emotion]").forEach(btn =>
    btn.addEventListener("click", () => startReflection({ emotion: btn.dataset.emotion }, navigate)));

  const unknownBtn = root.querySelector("[data-unknown]");
  const panel = root.querySelector("#unknown-panel");
  unknownBtn.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    unknownBtn.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector(".unknown-title").setAttribute("tabindex", "-1"), panel.querySelector(".unknown-title").focus();
  });

  root.querySelector("[data-something-else]").addEventListener("click", () => {
    input.placeholder = t("Describe it in any words — even a single word is enough…");
    input.focus();
    input.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  return () => clearInterval(rotate);
}
