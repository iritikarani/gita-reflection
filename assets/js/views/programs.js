// Premium guided programs: 14 Days of Steadiness, 30-Day Inner Peace, 30 Days of Purpose.
// Day 1 of each is a free preview.
import { esc, icon, autoGrow, divider, toast } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { PROGRAMS } from "../data/journey.js";
import { PROGRAM_DAYS, PROGRAM_PROMPTS } from "../data/programs.js";
import * as store from "../store.js";
import { verseBlock, askToJoin, premiumBadge, premiumGate } from "../components.js";
import { openShare } from "../share.js";
import { openBreathe } from "./breathe.js";
import { t, pick, isHindi } from "../i18n.js";

const theme = d => (isHindi() ? d[2] : d[1]);
const prompt = n => PROGRAM_PROMPTS[(n - 1) % PROGRAM_PROMPTS.length][isHindi() ? 1 : 0];

function overview(root, program, navigate) {
  const days = PROGRAM_DAYS[program.id];
  const state = store.programState(program.id);
  const premium = store.isPremium();
  const next = days.findIndex((d, i) => !state.completed.includes(i + 1)) + 1 || null;

  root.innerHTML = `
  <section class="program-page">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${t("Guided program")} · ${t("{n} days", { n: days.length })}</p>
      <h1>${esc(pick(program, "title"))}</h1>
      <p class="lead center">${esc(pick(program, "desc"))}</p>
      ${premium ? "" : `<p class="fine">${premiumBadge()} ${t("Day 1 is free to try. The full program is part of Premium.")}</p>`}
      <div class="progress-dots center-dots wrap-dots" aria-label="${t("{n} of {total} days reflected", { n: state.completed.length, total: days.length })}">${days.map((d, i) => `<span class="${state.completed.includes(i + 1) ? "done" : ""}"></span>`).join("")}</div>
    </header>
    <section class="wrap narrow">
      <ol class="day-list">
        ${days.map((d, i) => {
          const n = i + 1;
          const v = VERSE_BY_ID[d[0]];
          const done = state.completed.includes(n);
          const locked = !premium && n > 1;
          return `<li><a class="day-row ${done ? "done" : ""} ${next === n ? "next" : ""}" href="#/programs/${program.id}/${n}">
            <span class="day-n" aria-hidden="true">${done ? icon("check") : locked ? icon("lock") : n}</span>
            <span class="day-body">
              <span class="day-title">${t("Day {n}", { n })} — ${esc(theme(d))}</span>
              <span class="day-sub">${t("Bhagavad Gita")} ${v.ch}.${v.v} · ${esc(pick(v, "meaning"))}</span>
            </span>
            <span class="day-state">${done ? t("Reflected") : locked ? t("Premium") : ""}</span>
          </a></li>`;
        }).join("")}
      </ol>
    </section>
    <nav class="wrap narrow day-nav" aria-label="${t("Programs")}">
      <a class="btn btn-link" href="#/programs">${icon("back")}<span>${t("All programs")}</span></a>
    </nav>
  </section>`;
}

function dayView(root, program, n, navigate) {
  const days = PROGRAM_DAYS[program.id];
  const d = days[n - 1];
  if (!d) return navigate(`/programs/${program.id}`);
  const premium = store.isPremium();
  if (n > 1 && !premium) {
    history.replaceState(null, "", `#/programs/${program.id}`);
    overview(root, program, navigate);
    premiumGate({ reason: "program" });
    return;
  }
  const v = VERSE_BY_ID[d[0]];
  const state = store.programState(program.id);
  const entry = state.entries[n] || {};
  const done = state.completed.includes(n);
  const draftKey = `program.${program.id}.${n}`;

  root.innerHTML = `
  <article class="program-day">
    <header class="wrap narrow page-head center">
      <p class="eyebrow"><a href="#/programs/${program.id}">${esc(pick(program, "title"))}</a> · ${t("Day {n} of {total}", { n, total: days.length })}</p>
      <h1 data-title="${t("Day {n}", { n })}: ${esc(theme(d))}">${esc(theme(d))}</h1>
    </header>
    <section class="wrap narrow">${verseBlock(v, { headingLevel: 2 })}</section>
    <section class="wrap narrow">
      ${divider()}
      <h2 class="section-label">${t("Context")}</h2>
      <p>${esc(pick(v, "context"))}</p>
    </section>
    <section class="wrap narrow moment">
      <h2 class="section-label">${t("Reflect")}</h2>
      <p class="question">${esc(pick(v, "question"))}</p>
      <h3 class="section-label">${t("Journaling prompt")}</h3>
      <p>${esc(prompt(n))}</p>
      <label class="sr-only" for="program-text">${t("Your journal entry")}</label>
      <textarea id="program-text" class="journal" rows="6" placeholder="${t("Write freely. No one else will read this.")}">${esc(entry.text || store.session.get(draftKey, ""))}</textarea>
    </section>
    <section class="wrap narrow">
      <div class="practice">
        <h2 class="section-label">${t("A small practice for today")}</h2>
        <p>${esc(pick(v, "practice"))}</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-act="complete">${icon("check")}<span>${done ? t("Update today's reflection") : t("Save & mark today reflected")}</span></button>
        <button class="btn btn-ghost" type="button" data-act="breathe">${icon("breath")}<span>${t("2-minute pause")}</span></button>
        <button class="btn btn-ghost" type="button" data-act="share">${icon("share")}<span>${t("Share")}</span></button>
      </div>
      <p class="fine status" aria-live="polite">${done ? t("You reflected on this day.") : ""}</p>
    </section>
    <nav class="wrap narrow day-nav" aria-label="${t("Journey days")}">
      ${n > 1 ? `<a class="btn btn-link" href="#/programs/${program.id}/${n - 1}">${icon("back")}<span>${t("Day {n}", { n: n - 1 })}</span></a>` : `<a class="btn btn-link" href="#/programs/${program.id}">${icon("back")}<span>${t("All days")}</span></a>`}
      ${n < days.length ? `<a class="btn btn-link" href="#/programs/${program.id}/${n + 1}"><span>${t("Day {n}", { n: n + 1 })}</span>${icon("arrow")}</a>` : `<a class="btn btn-link" href="#/programs/${program.id}"><span>${t("All days")}</span>${icon("arrow")}</a>`}
    </nav>
  </article>`;

  const ta = root.querySelector("#program-text");
  autoGrow(ta);
  ta.addEventListener("input", () => store.session.set(draftKey, ta.value));

  root.querySelector(".actions").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    if (btn.dataset.act === "breathe") openBreathe({ verseId: v.id, question: pick(v, "question") });
    if (btn.dataset.act === "share") openShare({ verseId: v.id, reflection: pick(v, "question") });
    if (btn.dataset.act === "complete") {
      const res = store.saveProgramEntry(program.id, n, { text: ta.value.trim(), done: true });
      if (!res.ok) return askToJoin({ reason: "journey" });
      store.session.remove(draftKey);
      const finished = store.programState(program.id).completed.length >= days.length;
      if (finished) toast(t("You completed {name}.", { name: pick(program, "title") }));
      btn.querySelector("span").textContent = t("Update today's reflection");
      root.querySelector(".status").innerHTML = n < days.length
        ? t("Saved. Day {n} — {theme} — is {link}.", { n: n + 1, theme: esc(theme(days[n])), link: `<a href="#/programs/${program.id}/${n + 1}">${t("here whenever you are")}</a>` })
        : `${t("Saved.")} <a href="#/programs/${program.id}">${t("See all days")}</a>.`;
    }
  });
}

function list(root) {
  const premium = store.isPremium();
  root.innerHTML = `
  <section class="programs">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${t("Go deeper")}</p>
      <h1>${t("Guided programs")}</h1>
      <p class="lead center">${t("Longer journeys through the Gita, one day at a time. Each day has a shlok, a question, a journaling prompt and a small practice.")}</p>
      ${premium ? "" : `<p class="fine">${premiumBadge()} ${t("Day 1 of every program is free to try.")}</p>`}
    </header>
    <section class="wrap">
      <div class="program-grid">
        ${[{ id: "seven", days: 7, href: "#/seven-days", title: t("7 days with the Gita"), desc: t("A short, gentle guided journey, one theme a day."), free: true }]
          .concat(PROGRAMS.map(p => ({ ...p, href: `#/programs/${p.id}`, title: pick(p, "title"), desc: pick(p, "desc") })))
          .map(p => {
            const st = p.id === "seven" ? store.journeyState() : store.programState(p.id);
            return `<a class="program" href="${p.href}">
              <span class="program-days">${t("{n} days", { n: p.days })}</span>
              <span class="program-title">${esc(p.title)}</span>
              <span class="program-desc">${esc(p.desc)}</span>
              ${st.completed.length ? `<span class="fine">${t("{n} of {total} days reflected", { n: st.completed.length, total: p.days })}</span>` : ""}
              ${p.free ? `<span class="fine">${t("Free")}</span>` : premium ? "" : premiumBadge()}
            </a>`;
          }).join("")}
      </div>
    </section>
  </section>`;
}

export function render(root, { params, navigate }) {
  if (!params.id) return list(root);
  const program = PROGRAMS.find(p => p.id === params.id);
  if (!program) return navigate("/programs");
  if (params.day) return dayView(root, program, Number(params.day), navigate);
  return overview(root, program, navigate);
}
