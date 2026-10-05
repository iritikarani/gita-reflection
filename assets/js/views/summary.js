import { esc, icon, autoGrow, plural, formatDate, divider } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { GROUPS } from "../data/emotions.js";
import * as store from "../store.js";
import { emptyState, premiumBadge } from "../components.js";
import { groupCounts, frequentWords, monthKey, monthLabel } from "../insights.js";

function prevKey(key, n = 1) {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 - n, 1));
}

export function render(root, { query, navigate }) {
  const me = store.currentUser();
  if (!me) {
    root.innerHTML = `<section class="wrap narrow page-pad">${emptyState({
      title: "Your month in reflection",
      text: "At the end of each month, see the themes you returned to, the shloks that stayed with you, and a few of your own words. Create a free account to begin.",
      action: `<a class="btn btn-primary" href="#/signup?next=/summary">Create a free account</a>`
    })}</section>`;
    return;
  }

  const current = monthKey(Date.now());
  const premium = me.plan === "premium";
  const allowed = premium ? null : [current, prevKey(current)];
  let key = query.m && /^\d{4}-\d{2}$/.test(query.m) ? query.m : current;
  const locked = allowed && !allowed.includes(key);

  const data = store.getData();
  const months = [...new Set([current, ...data.reflections.map(r => monthKey(r.createdAt))])].sort().reverse();
  const items = data.reflections.filter(r => monthKey(r.createdAt) === key);
  const themes = groupCounts(items).slice(0, 3).map(([id, n]) => ({ label: GROUPS.find(g => g.id === id)?.label || id, n }));
  const verseCounts = {};
  items.forEach(r => { if (r.verseId) verseCounts[r.verseId] = (verseCounts[r.verseId] || 0) + 1; });
  const favs = Object.entries(verseCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => VERSE_BY_ID[id]).filter(Boolean);
  const words = frequentWords(items, 10);
  const highlights = items.filter(r => r.text && r.text.length > 20).sort((a, b) => b.text.length - a.text.length).slice(0, 3);
  const note = data.monthNotes[key] || "";

  root.innerHTML = `
  <article class="summary print-area">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">Your month in reflection</p>
      <h1 data-title="Your month in reflection">${esc(monthLabel(key))}</h1>
      <div class="month-picker no-print">
        <label for="month-select" class="sr-only">Choose a month</label>
        <select id="month-select">
          ${months.map(m => `<option value="${m}" ${m === key ? "selected" : ""}>${esc(monthLabel(m))}${allowed && !allowed.includes(m) ? " (Premium)" : ""}</option>`).join("")}
        </select>
      </div>
    </header>

    ${locked ? `<section class="wrap narrow center">${emptyState({
      title: "Past months are part of Premium",
      text: "Your reflections from this month are safe in your journey. Premium keeps an archive of every monthly summary.",
      action: `${premiumBadge()}<div class="row-center"><a class="btn btn-ghost" href="#/premium">Learn about Premium</a></div>`
    })}</section>` : !items.length ? `<section class="wrap narrow">${emptyState({
      title: "A quiet month so far",
      text: "When you save reflections this month, your summary will gather here. There's no pressure — come whenever you need.",
      action: `<a class="btn btn-ghost" href="#/daily">Open today's Gita</a>`
    })}</section>` : `
    <section class="wrap narrow">
      <div class="stat-row">
        <div class="stat"><span class="stat-n">${items.length}</span><span class="stat-l">${items.length === 1 ? "reflection" : "reflections"}</span></div>
        <div class="stat"><span class="stat-n">${Object.keys(verseCounts).length}</span><span class="stat-l">${Object.keys(verseCounts).length === 1 ? "shlok" : "shloks"}</span></div>
        <div class="stat"><span class="stat-n">${new Set(items.map(r => new Date(r.createdAt).toDateString())).size}</span><span class="stat-l">days you paused</span></div>
      </div>
    </section>

    ${themes.length ? `<section class="wrap narrow">
      <h2 class="section-label">Themes you returned to</h2>
      <ul class="theme-list">${themes.map(t => `<li><span>${esc(t.label)}</span><span class="theme-bar" style="--w:${Math.round(t.n / items.length * 100)}%"></span><span class="muted">${plural(t.n, "time")}</span></li>`).join("")}</ul>
    </section>` : ""}

    ${favs.length ? `<section class="wrap narrow">
      <h2 class="section-label">Shloks that stayed with you</h2>
      ${favs.map(v => `<div class="fav"><p class="verse-ref">Bhagavad Gita ${v.ch}.${v.v}</p><p class="fav-meaning">“${esc(v.meaning)}”</p></div>`).join("")}
    </section>` : ""}

    ${words.length ? `<section class="wrap narrow">
      <h2 class="section-label">Words that appeared often</h2>
      <p class="word-cloud">${words.map(([w, n]) => `<span style="--s:${Math.min(1.6, 0.95 + n * 0.12)}">${esc(w)}</span>`).join(" ")}</p>
    </section>` : ""}

    ${highlights.length ? `<section class="wrap narrow">
      <h2 class="section-label">From your reflections</h2>
      ${highlights.map(r => `<blockquote class="highlight"><p>${esc(r.text.length > 280 ? r.text.slice(0, 280) + "…" : r.text)}</p><footer>${esc(formatDate(r.createdAt, { day: "numeric", month: "long" }))}</footer></blockquote>`).join("")}
    </section>` : ""}

    <section class="wrap narrow moment">
      ${divider()}
      <h2 class="section-label">What did this month teach you?</h2>
      <label class="sr-only" for="month-note">What did this month teach you?</label>
      <textarea id="month-note" class="journal" rows="4" placeholder="Take your time…">${esc(note)}</textarea>
      <p class="print-only note-print">${esc(note)}</p>
      <div class="actions no-print">
        <button class="btn btn-primary" type="button" data-print>${icon("download")}<span>Download as PDF</span></button>
      </div>
      <p class="fine no-print">Opens your device's print dialog — choose “Save as PDF”.</p>
    </section>`}
  </article>`;

  root.querySelector("#month-select")?.addEventListener("change", e => navigate(`/summary?m=${e.target.value}`));
  const ta = root.querySelector("#month-note");
  if (ta) {
    autoGrow(ta);
    let t;
    ta.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => { store.saveMonthNote(key, ta.value); root.querySelector(".note-print").textContent = ta.value; }, 400);
    });
  }
  root.querySelector("[data-print]")?.addEventListener("click", () => window.print());
}
