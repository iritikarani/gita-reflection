import { esc, icon, formatDate, openModal, toast } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { EMOTIONS, GROUPS } from "../data/emotions.js";
import { SEVEN_DAYS } from "../data/journey.js";
import { CONFIG } from "../config.js";
import * as store from "../store.js";
import { emptyState, verseCardSmall } from "../components.js";
import { patternSentence, monthKey, monthLabel } from "../insights.js";
import { t, tn, pick } from "../i18n.js";

function guestView(root) {
  root.innerHTML = `
  <section class="wrap narrow page-head center">
    <p class="eyebrow">${t("My Journey")}</p>
    <h1>${t("Your reflections, gathered gently")}</h1>
    <p class="lead">${t("When you save a reflection, it lives here — with the date, the feeling, the shlok and what you wrote. Over time, you'll see quiet patterns in what you've been reflecting on.")}</p>
    <div class="row-center">
      <a class="btn btn-primary" href="#/signup?next=/journey">${t("Create a free account")}</a>
      <a class="btn btn-ghost" href="#/login?next=/journey">${t("Log in")}</a>
    </div>
    <p class="fine">${t("You never need an account to reflect. Only to keep what you write.")}</p>
  </section>
  <section class="wrap narrow">
    <div class="journey-sample" aria-hidden="true">
      <div class="entry ghost-entry"><span class="entry-date">${t("Today")}</span><span class="entry-emotion">${t("Overthinking")}</span><p class="entry-verse">${t("Bhagavad Gita")} 6.35</p><p class="entry-text">“${t("I noticed I was trying to solve next month tonight…")}”</p></div>
      <div class="entry ghost-entry"><span class="entry-date">${t("Last week")}</span><span class="entry-emotion">${t("Courage")}</span><p class="entry-verse">${t("Bhagavad Gita")} 2.40</p><p class="entry-text">“${t("Even a small step counts…")}”</p></div>
    </div>
  </section>`;
}

function entryHtml(r) {
  const v = VERSE_BY_ID[r.verseId];
  const emotion = r.emotion && EMOTIONS[r.emotion] && r.emotion !== "general" ? pick(EMOTIONS[r.emotion], "label") : null;
  const sourceLabel = t({ daily: "Daily Gita", journey: "7-day journey", conversation: "Reflect", library: "Library" }[r.source] || "");
  return `
    <article class="entry" data-id="${esc(r.id)}">
      <div class="entry-top">
        <time class="entry-date" datetime="${new Date(r.createdAt).toISOString()}">${esc(formatDate(r.createdAt))}</time>
        ${emotion ? `<span class="entry-emotion">${esc(emotion)}</span>` : sourceLabel ? `<span class="entry-emotion">${esc(sourceLabel)}</span>` : ""}
      </div>
      ${r.said && r.source === "reflection" ? `<p class="entry-said">“${esc(r.said)}”</p>` : ""}
      ${v ? `<p class="entry-verse"><a href="#/shlok/${v.ch}-${v.v}">${t("Bhagavad Gita")} ${v.ch}.${v.v}</a> — ${esc(pick(v, "meaning"))}</p>` : ""}
      ${r.question ? `<p class="entry-q">${esc(r.question)}</p>` : ""}
      ${r.text ? `<p class="entry-text">${esc(r.text)}</p>` : `<p class="entry-text muted">${t("No written reflection.")}</p>`}
      <div class="entry-tools">
        <button class="btn btn-link btn-sm" type="button" data-delete="${esc(r.id)}" aria-label="${t("Delete reflection from {date}", { date: esc(formatDate(r.createdAt)) })}">${icon("trash")}<span>${t("Delete")}</span></button>
      </div>
    </article>`;
}

export function render(root, { query }) {
  const me = store.currentUser();
  if (!me) return guestView(root);

  const state = { filter: query.f || "all" };

  function draw() {
    const data = store.getData();
    const all = data.reflections;
    const list = state.filter === "all" ? all : all.filter(r => r.group === state.filter);
    const pattern = patternSentence(all);
    const thisMonth = all.filter(r => monthKey(r.createdAt) === monthKey(Date.now())).length;
    const journeyDone = data.journey.completed.length;
    const nextDay = SEVEN_DAYS.find(d => !data.journey.completed.includes(d.day));
    const saved = data.savedVerses.map(id => VERSE_BY_ID[id]).filter(Boolean);

    root.innerHTML = `
    <section class="journey-page">
      <header class="wrap page-head">
        <p class="eyebrow">${t("My Journey")}</p>
        <h1>${t("Welcome back, {name}", { name: esc(me.name.split(" ")[0]) })}</h1>
        <p class="lead">${all.length ? (thisMonth ? t("You've saved {n} reflections, {m} this month.", { n: all.length, m: thisMonth }) : tn(all.length, "You've saved {n} reflection.", "You've saved {n} reflections.")) : t("This is where your saved reflections will live.")}</p>
      </header>

      <div class="wrap journey-grid">
        <div class="journey-main">
          ${pattern ? `<div class="pattern" role="note"><p class="eyebrow">${t("A gentle pattern")}</p><p class="pattern-text">${esc(pattern)}</p><p class="fine">${t("Based on the themes of the teachings you saved — not a judgement or a diagnosis.")}</p></div>` : ""}

          <div class="chips filter-chips" role="group" aria-label="${t("Filter reflections")}">
            <button type="button" class="chip" data-filter="all" aria-pressed="${state.filter === "all"}">${t("All")}</button>
            ${GROUPS.map(g => `<button type="button" class="chip" data-filter="${g.id}" aria-pressed="${state.filter === g.id}">${esc(pick(g, "label"))}</button>`).join("")}
          </div>

          <div class="entries">
            ${list.length ? list.map(entryHtml).join("") : all.length
              ? emptyState({ title: t("Nothing here yet"), text: t("None of your saved reflections are in this theme yet."), action: `<button class="btn btn-ghost" type="button" data-filter="all">${t("Show all")}</button>` })
              : emptyState({ title: t("Your journey begins with one reflection"), text: t("Share what you're feeling, or start with today's Gita. Save anything that speaks to you."), action: `<div class="row-center"><a class="btn btn-primary" href="#/">${t("Begin a reflection")}</a><a class="btn btn-ghost" href="#/daily">${t("Today's Gita")}</a></div>` })}
          </div>
        </div>

        <aside class="journey-side" aria-label="${t("Your practice")}">
          <div class="side-card">
            <p class="eyebrow">${t("7 days with the Gita")}</p>
            <div class="progress-dots" aria-label="${t("{n} of 7 days reflected", { n: journeyDone })}">${SEVEN_DAYS.map(d => `<span class="${data.journey.completed.includes(d.day) ? "done" : ""}" title="${t("Day {n}", { n: d.day })}: ${esc(pick(d, "theme"))}"></span>`).join("")}</div>
            <p>${journeyDone === 7 ? t("You completed your 7-day reflection journey.") : journeyDone ? t("{n} of 7 days reflected. Day {d} — {theme} — is here whenever you are.", { n: journeyDone, d: nextDay.day, theme: esc(pick(nextDay, "theme")) }) : t("A short, gentle guided journey, one theme a day.")}</p>
            <a class="btn btn-ghost btn-sm" href="#/seven-days${journeyDone && journeyDone < 7 ? `/${nextDay.day}` : ""}">${journeyDone === 7 ? t("View your journey") : journeyDone ? t("Continue with Day {n}", { n: nextDay.day }) : t("Begin")}</a>
          </div>
          <div class="side-card">
            <p class="eyebrow">${t("Your month in reflection")}</p>
            <p>${esc(monthLabel(monthKey(Date.now())))}: ${tn(thisMonth, "{n} reflection so far.", "{n} reflections so far.")}</p>
            <a class="btn btn-ghost btn-sm" href="#/summary">${t("Open monthly summary")}</a>
          </div>
          ${me.plan !== "premium" ? `<div class="side-card subtle">
            <p class="fine">${t("{n} of {limit} free reflections saved.", { n: all.length, limit: CONFIG.freeSavedLimit })} ${t("{link} keeps unlimited history.", { link: `<a href="#/premium">${t("Premium")}</a>` })}</p>
          </div>` : ""}
        </aside>
      </div>

      ${saved.length ? `<section class="wrap saved-verses" aria-labelledby="saved-h">
        <h2 id="saved-h" class="section-label">${t("Saved verses")}</h2>
        <div class="verse-grid">${saved.map(v => verseCardSmall(v)).join("")}</div>
      </section>` : ""}
    </section>`;
  }

  root.addEventListener("click", onClick);
  function onClick(e) {
    const f = e.target.closest("[data-filter]");
    if (f) {
      state.filter = f.dataset.filter;
      history.replaceState(null, "", `#/journey${state.filter !== "all" ? `?f=${state.filter}` : ""}`);
      draw();
      root.querySelector(`[data-filter="${state.filter}"]`)?.focus();
      return;
    }
    const del = e.target.closest("[data-delete]");
    if (del) {
      openModal({
        title: t("Delete this reflection?"),
        body: `<p>${t("This can't be undone.")}</p><div class="row-end"><button class="btn btn-ghost" type="button" data-no>${t("Keep it")}</button><button class="btn btn-danger" type="button" data-yes>${t("Delete")}</button></div>`,
        onOpen: (el, close) => {
          el.querySelector("[data-no]").addEventListener("click", close);
          el.querySelector("[data-yes]").addEventListener("click", () => {
            store.deleteReflection(del.dataset.delete);
            close();
            toast(t("Reflection deleted."));
            draw();
          });
        }
      });
    }
  }

  draw();
  return () => root.removeEventListener("click", onClick);
}
