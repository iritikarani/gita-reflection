import { esc, icon, autoGrow, divider, formatDate, toast } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { SEVEN_DAYS, PROGRAMS } from "../data/journey.js";
import * as store from "../store.js";
import { verseBlock, askToJoin, premiumBadge } from "../components.js";
import { renderCompletionCard, downloadBlob, openShare } from "../share.js";
import { openBreathe } from "./breathe.js";

const THEME_GROUP = {
  "Letting Go": "letting-go", "Fear": "fear", "Action": "purpose", "Failure": "growth",
  "Detachment": "letting-go", "Self": "self", "Peace": "peace"
};

function overview(root) {
  const me = store.currentUser();
  const j = store.journeyState();
  const done = j.completed;
  const next = SEVEN_DAYS.find(d => !done.includes(d.day));
  const finished = done.length >= 7;

  root.innerHTML = `
  <section class="seven">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">A guided journey</p>
      <h1>7 days with the Gita</h1>
      <p class="lead">One theme a day: a shlok, a simple explanation, a question, a journaling prompt and a small practice for real life. Go at your own pace — a day can take as long as it needs.</p>
      ${me ? "" : `<p class="fine">You can read every day freely. <a href="#/signup?next=/seven-days">Create a free account</a> to keep your place and your writing.</p>`}
    </header>

    ${finished ? completionSection(me, j) : ""}

    <section class="wrap narrow">
      <ol class="day-list">
        ${SEVEN_DAYS.map(d => {
          const isDone = done.includes(d.day);
          const isNext = next && next.day === d.day;
          const v = VERSE_BY_ID[d.verse];
          return `<li>
            <a class="day-row ${isDone ? "done" : ""} ${isNext ? "next" : ""}" href="#/seven-days/${d.day}">
              <span class="day-n" aria-hidden="true">${isDone ? icon("check") : d.day}</span>
              <span class="day-body">
                <span class="day-title">Day ${d.day} — ${esc(d.theme)}</span>
                <span class="day-sub">Bhagavad Gita ${v.ch}.${v.v} · ${esc(v.meaning)}</span>
              </span>
              <span class="day-state">${isDone ? "Reflected" : isNext ? (done.length ? "Continue" : "Begin") : ""}</span>
            </a>
          </li>`;
        }).join("")}
      </ol>
    </section>

    <section class="wrap" aria-labelledby="deeper-h">
      <div class="center">
        <p class="eyebrow">Go deeper</p>
        <h2 id="deeper-h">Longer journeys</h2>
        <p class="muted">For when seven days leaves you wanting more.</p>
      </div>
      <div class="program-grid">
        ${PROGRAMS.map(p => `<a class="program" href="#/premium">
          <span class="program-days">${p.days} days</span>
          <span class="program-title">${esc(p.title)}</span>
          <span class="program-desc">${esc(p.desc)}</span>
          ${premiumBadge()}
        </a>`).join("")}
      </div>
    </section>
  </section>`;

  bindCompletion(root, me, j);
}

function completionSection(me, j) {
  return `
    <section class="wrap narrow completion" aria-labelledby="done-h">
      ${divider()}
      <h2 id="done-h" class="statement">You completed your 7-day reflection journey.</h2>
      <p class="muted center">Thank you for giving yourself this time. Here is a small card to remember it by.</p>
      <div class="completion-card"><div class="skeleton card-skeleton" aria-label="Preparing your card"></div></div>
      <div class="actions center-actions">
        <button class="btn btn-primary" type="button" data-download-card>${icon("download")}<span>Download card</span></button>
        <button class="btn btn-ghost" type="button" data-restart>Walk the journey again</button>
      </div>
    </section>`;
}

async function bindCompletion(root, me, j) {
  const slot = root.querySelector(".completion-card");
  if (!slot) return;
  const date = formatDate(j.finishedAt || Date.now(), { day: "numeric", month: "long", year: "numeric" });
  const canvas = await renderCompletionCard({ name: me?.name || "", date, themes: SEVEN_DAYS.map(d => d.theme) });
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", `Completion card: You completed your 7-day reflection journey, ${date}`);
  slot.replaceChildren(canvas);
  root.querySelector("[data-download-card]").addEventListener("click", () =>
    canvas.toBlob(b => { downloadBlob(b, "gita-reflection-7-days.png"); toast("Your card is saved."); }, "image/png"));
  root.querySelector("[data-restart]").addEventListener("click", () => {
    store.resetJourney();
    toast("Your journey begins again whenever you're ready.");
    location.hash = "#/seven-days/1";
  });
}

function dayView(root, n, navigate) {
  const d = SEVEN_DAYS.find(x => x.day === n);
  if (!d) return navigate("/seven-days");
  const v = VERSE_BY_ID[d.verse];
  const j = store.journeyState();
  const entry = j.entries[n] || {};
  const done = j.completed.includes(n);
  const prev = SEVEN_DAYS.find(x => x.day === n - 1);
  const next = SEVEN_DAYS.find(x => x.day === n + 1);

  root.innerHTML = `
  <article class="seven-day">
    <header class="wrap narrow page-head center">
      <p class="eyebrow"><a href="#/seven-days">7 days with the Gita</a> · Day ${n} of 7</p>
      <h1 data-title="Day ${n}: ${esc(d.theme)}">${esc(d.theme)}</h1>
      <div class="progress-dots center-dots" aria-label="${j.completed.length} of 7 days reflected">${SEVEN_DAYS.map(x => `<span class="${j.completed.includes(x.day) ? "done" : ""} ${x.day === n ? "current" : ""}"></span>`).join("")}</div>
    </header>

    <section class="wrap narrow">${verseBlock(v, { headingLevel: 2 })}</section>

    <section class="wrap narrow">
      ${divider()}
      <h2 class="section-label">Today's teaching <span class="tag-interp">Interpretation</span></h2>
      <p class="why-text">${esc(d.explanation)}</p>
    </section>

    <section class="wrap narrow moment">
      <h2 class="section-label">Reflect</h2>
      <p class="question">${esc(d.question)}</p>
      <h3 class="section-label">Journaling prompt</h3>
      <p>${esc(d.prompt)}</p>
      <label class="sr-only" for="day-text">Your journal entry</label>
      <textarea id="day-text" class="journal" rows="6" placeholder="Write freely. No one else will read this.">${esc(entry.text || "")}</textarea>
    </section>

    <section class="wrap narrow">
      <div class="practice">
        <h2 class="section-label">A small practice for today</h2>
        <p>${esc(d.practice)}</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-act="complete">${icon("check")}<span>${done ? "Update today's reflection" : "Save & mark today reflected"}</span></button>
        <button class="btn btn-ghost" type="button" data-act="breathe">${icon("breath")}<span>2-minute pause</span></button>
        <button class="btn btn-ghost" type="button" data-act="share">${icon("share")}<span>Share</span></button>
      </div>
      <p class="fine status" aria-live="polite">${done ? "You reflected on this day." : ""}</p>
    </section>

    <nav class="wrap narrow day-nav" aria-label="Journey days">
      ${prev ? `<a class="btn btn-link" href="#/seven-days/${prev.day}">${icon("back")}<span>Day ${prev.day}</span></a>` : `<a class="btn btn-link" href="#/seven-days">${icon("back")}<span>All days</span></a>`}
      ${next ? `<a class="btn btn-link" href="#/seven-days/${next.day}"><span>Day ${next.day}</span>${icon("arrow")}</a>` : `<a class="btn btn-link" href="#/seven-days"><span>All days</span>${icon("arrow")}</a>`}
    </nav>
  </article>`;

  const ta = root.querySelector("#day-text");
  autoGrow(ta);
  const draftKey = `seven.${n}`;
  if (!entry.text) ta.value = store.session.get(draftKey, "");
  ta.addEventListener("input", () => store.session.set(draftKey, ta.value));

  root.querySelector(".actions").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    if (btn.dataset.act === "breathe") openBreathe({ verseId: v.id, question: d.question });
    if (btn.dataset.act === "share") openShare({ verseId: v.id, reflection: d.question });
    if (btn.dataset.act === "complete") {
      const res = store.saveJourneyEntry(n, { text: ta.value.trim(), done: true });
      if (!res.ok) return askToJoin({ reason: "journey" });
      store.session.remove(draftKey);
      // Keep the day's writing alongside other reflections in My Journey.
      const prior = store.journeyState().entries[n] || {};
      const saved = store.saveReflection({
        id: prior.reflectionId, source: "journey", said: `7 days with the Gita — Day ${n}: ${d.theme}`,
        emotion: null, group: THEME_GROUP[d.theme], verseId: v.id, question: d.question, text: ta.value.trim()
      });
      if (saved.ok && !prior.reflectionId) store.saveJourneyEntry(n, { reflectionId: saved.reflection.id });
      const state = store.journeyState();
      if (state.completed.length >= 7) {
        toast("You completed your 7-day reflection journey.");
        return navigate("/seven-days");
      }
      root.querySelector(".status").innerHTML = next
        ? `Saved. Day ${next.day} — ${esc(next.theme)} — is <a href="#/seven-days/${next.day}">here whenever you are</a>.`
        : `Saved. <a href="#/seven-days">See all days</a>.`;
      btn.querySelector("span").textContent = "Update today's reflection";
      root.querySelectorAll(".progress-dots span").forEach((s, i) => s.classList.toggle("done", state.completed.includes(i + 1)));
    }
  });
}

export function render(root, { params, navigate }) {
  if (params.day) return dayView(root, Number(params.day), navigate);
  return overview(root);
}
