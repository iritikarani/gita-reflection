import { esc, icon } from "../ui.js";
import { CATEGORIES } from "../data/verses.js";
import { searchVerses } from "../matcher.js";
import { verseCardSmall, emptyState } from "../components.js";

export function render(root, { query, navigate }) {
  const state = { q: query.q || "", c: query.c || "" };

  root.innerHTML = `
  <section class="library">
    <header class="wrap page-head center">
      <p class="eyebrow">Shlok library</p>
      <h1>Find a teaching</h1>
      <p class="lead">Search by feeling, theme, chapter or verse — or browse by what you're going through.</p>
      <form class="search" id="search" role="search">
        <label class="sr-only" for="search-input">Search the library</label>
        ${icon("search")}
        <input id="search-input" type="search" placeholder="Try “fear”, “letting go”, “2.47” or “chapter 6”" value="${esc(state.q)}" autocomplete="off">
      </form>
    </header>
    <div class="wrap">
      <div class="chips chips-center cat-filter" role="group" aria-label="Filter by theme">
        <button type="button" class="chip" data-cat="" aria-pressed="${!state.c}">All</button>
        ${CATEGORIES.map(c => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${state.c === c.id}">${esc(c.label)}</button>`).join("")}
      </div>
      <p class="results-meta muted center" id="results-meta" aria-live="polite"></p>
      <div class="verse-grid" id="results"></div>
    </div>
  </section>`;

  const input = root.querySelector("#search-input");
  const results = root.querySelector("#results");
  const meta = root.querySelector("#results-meta");

  function draw() {
    const { list, exactRef, chapter } = searchVerses(state.q, state.c);
    const cat = CATEGORIES.find(c => c.id === state.c);
    meta.textContent = state.q
      ? `${list.length} ${list.length === 1 ? "teaching" : "teachings"} for “${state.q}”${cat ? ` in ${cat.label}` : ""}`
      : cat ? `${cat.label} — ${cat.blurb}` : `${list.length} curated teachings, each with translation, meaning and a reflection.`;

    if (list.length) {
      results.innerHTML = list.map(v => verseCardSmall(v)).join("");
      return;
    }
    const lookup = exactRef
      ? `<a class="btn btn-primary" href="#/shlok/${exactRef.ch}-${exactRef.v}">Open Bhagavad Gita ${exactRef.ch}.${exactRef.v}</a>`
      : "";
    results.innerHTML = emptyState({
      title: exactRef ? "Not in our curated library yet" : "Nothing found — yet",
      text: exactRef
        ? "We can still show you the original verse and its translation from the full Gita."
        : chapter ? `We don't have curated verses from chapter ${chapter} in this theme yet. Try “All” or another search.` : "Try a feeling, like “tired” or “afraid”, or a theme like “peace”.",
      action: lookup || `<button class="btn btn-ghost" type="button" data-clear>Clear search</button>`
    });
  }

  function sync() {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.c) params.set("c", state.c);
    const hash = `#/library${params.toString() ? "?" + params : ""}`;
    history.replaceState(null, "", hash);
  }

  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = input.value.trim(); sync(); draw(); }, 160);
  });
  root.querySelector("#search").addEventListener("submit", e => { e.preventDefault(); state.q = input.value.trim(); sync(); draw(); });

  root.querySelector(".cat-filter").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    state.c = b.dataset.cat;
    root.querySelectorAll("[data-cat]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    sync(); draw();
  });

  results.addEventListener("click", e => {
    if (e.target.closest("[data-clear]")) { state.q = ""; state.c = ""; input.value = ""; sync(); draw(); input.focus(); }
  });

  draw();
  return () => clearTimeout(t);
}
