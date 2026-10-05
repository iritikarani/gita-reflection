import { esc, icon, autoGrow, formatDate, divider } from "../ui.js";
import { dailyVerse, groupForVerse } from "../matcher.js";
import { verseBlock, saveWithPrompt, saveVerseButton, bindSaveVerse } from "../components.js";
import { session } from "../store.js";
import { openShare, downloadBlob } from "../share.js";
import { openBreathe } from "./breathe.js";

// A gentle daily calendar reminder, without any streak or guilt language.
export function downloadReminder() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  // Floating local time: 8:00 every morning, wherever the person is.
  const start = `${tomorrow.getFullYear()}${pad(tomorrow.getMonth() + 1)}${pad(tomorrow.getDate())}T080000`;
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const url = location.href.split("#")[0] + "#/daily";
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Gita Reflection//EN",
    "BEGIN:VEVENT",
    `UID:daily-${stamp}@gita-reflection`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    "DURATION:PT5M",
    "RRULE:FREQ=DAILY",
    "SUMMARY:Take a moment for yourself.",
    `DESCRIPTION:A quiet moment with today's Gita. ${url}`,
    `URL:${url}`,
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  downloadBlob(new Blob([ics], { type: "text/calendar" }), "gita-reflection-reminder.ics");
}

export function render(root) {
  const v = dailyVerse();
  const key = `daily.${new Date().toDateString()}`;
  const draft = session.get(key, "");

  root.innerHTML = `
  <article class="daily">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${esc(formatDate(Date.now(), { weekday: "long", day: "numeric", month: "long" }))}</p>
      <h1>Daily Gita</h1>
      <p class="lead">One teaching for today. Read slowly; there's no hurry.</p>
    </header>

    <section class="wrap narrow" aria-labelledby="today-shlok">
      <h2 id="today-shlok" class="section-label">Today's shlok</h2>
      ${verseBlock(v, { meaning: false })}
    </section>

    <section class="wrap narrow" aria-labelledby="today-meaning">
      ${divider()}
      <h2 id="today-meaning" class="section-label">Today's meaning <span class="tag-interp">Interpretation</span></h2>
      <p class="why-text">${esc(v.meaning)}</p>
      <details class="context"><summary>About this verse</summary><p>${esc(v.context)}</p></details>
    </section>

    <section class="wrap narrow moment" aria-labelledby="today-q">
      <h2 id="today-q" class="section-label">Today's reflection</h2>
      <p class="question">${esc(v.question)}</p>
      <label class="sr-only" for="daily-text">Your reflection</label>
      <textarea id="daily-text" class="journal" rows="3" placeholder="A few words are enough…">${esc(draft)}</textarea>
    </section>

    <section class="wrap narrow" aria-labelledby="today-practice">
      <div class="practice">
        <h2 id="today-practice" class="section-label">Today's small practice</h2>
        <p>${esc(v.practice)}</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-act="save">${icon("bookmark")}<span>Save</span></button>
        <button class="btn btn-ghost" type="button" data-act="reflect">${icon("breath")}<span>Reflect for 2 minutes</span></button>
        <button class="btn btn-ghost" type="button" data-act="share">${icon("share")}<span>Share</span></button>
        ${saveVerseButton(v.id).replace("<span>Save</span>", "<span>Save verse</span>")}
      </div>
    </section>

    <section class="wrap narrow center come-back">
      ${divider()}
      <p class="statement small">Come back tomorrow for another moment of reflection.</p>
      <button class="btn btn-link" type="button" data-act="remind">${icon("bell")}<span>Add a gentle daily reminder to my calendar</span></button>
      <p class="fine">It simply says, “Take a moment for yourself.” You can remove it anytime.</p>
    </section>
  </article>`;

  const ta = root.querySelector("#daily-text");
  autoGrow(ta);
  ta.addEventListener("input", () => session.set(key, ta.value));
  bindSaveVerse(root);

  root.querySelector(".daily").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "save") {
      const saved = saveWithPrompt({
        id: session.get(`${key}.id`) || undefined,
        source: "daily", said: "Daily Gita", emotion: null, group: groupForVerse(v),
        verseId: v.id, question: v.question, text: ta.value.trim()
      });
      if (saved) session.set(`${key}.id`, saved.id);
    }
    if (act === "reflect") openBreathe({ verseId: v.id, question: v.question });
    if (act === "share") openShare({ verseId: v.id, reflection: v.question });
    if (act === "remind") downloadReminder();
  });
}
