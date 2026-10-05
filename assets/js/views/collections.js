// Premium: personal shlok collections.
import { esc, icon, openModal, toast } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import * as store from "../store.js";
import { verseCardSmall, emptyState, premiumBadge } from "../components.js";
import { t, tn } from "../i18n.js";

function gate(root) {
  root.innerHTML = `<section class="wrap narrow page-pad">${emptyState({
    title: t("Personal collections"),
    text: t("Gather the verses that speak to you into your own named collections — “For hard mornings”, “Courage”, “Before exams”. This is part of Premium."),
    action: `${premiumBadge()}<div class="row-center"><a class="btn btn-primary" href="#/premium">${t("See Premium")}</a></div>`,
    level: 1
  })}</section>`;
}

function listView(root, navigate) {
  const cols = store.collections();
  root.innerHTML = `
  <section class="collections">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${t("My Journey")}</p>
      <h1>${t("Your collections")}</h1>
      <p class="lead center">${t("Verses you've gathered, in your own groupings. Add a verse from any shlok page.")}</p>
      <form class="inline-form col-new narrow-form">
        <label class="sr-only" for="col-name">${t("New collection name")}</label>
        <input id="col-name" maxlength="60" placeholder="${t("New collection, e.g. “For hard mornings”")}">
        <button class="btn btn-primary" type="submit">${t("Create")}</button>
      </form>
    </header>
    <section class="wrap narrow">
      ${cols.length ? `<ul class="col-cards">${cols.map(c => `
        <li><a class="soft-card col-card" href="#/collections/${esc(c.id)}">
          <strong>${esc(c.name)}</strong>
          <span class="muted">${tn(c.verseIds.length, "{n} verse", "{n} verses")}</span>
          <span class="fine">${c.verseIds.slice(0, 4).map(id => id).join(" · ")}</span>
        </a></li>`).join("")}</ul>`
        : emptyState({ title: t("No collections yet"), text: t("Create one above, then add verses from the library."), action: `<a class="btn btn-ghost" href="#/library">${t("Explore the library")}</a>` })}
    </section>
  </section>`;
  root.querySelector(".col-new").addEventListener("submit", e => {
    e.preventDefault();
    const input = root.querySelector("#col-name");
    if (!input.value.trim()) return input.focus();
    const col = store.createCollection(input.value);
    toast(t("Collection created."));
    navigate(`/collections/${col.id}`);
  });
}

function detailView(root, id, navigate) {
  const col = store.collections().find(c => c.id === id);
  if (!col) return navigate("/collections");
  const verses = col.verseIds.map(v => VERSE_BY_ID[v]).filter(Boolean);
  root.innerHTML = `
  <section class="collection">
    <header class="wrap narrow page-head center">
      <p class="eyebrow"><a href="#/collections">${t("Your collections")}</a></p>
      <h1>${esc(col.name)}</h1>
      <p class="muted">${tn(verses.length, "{n} verse", "{n} verses")}</p>
      <div class="row-center">
        <button class="btn btn-ghost btn-sm" type="button" data-rename>${t("Rename")}</button>
        <button class="btn btn-danger btn-sm" type="button" data-delete>${icon("trash")}<span>${t("Delete collection")}</span></button>
      </div>
    </header>
    <section class="wrap">
      ${verses.length ? `<div class="verse-grid">${verses.map(v => `<div class="col-item">${verseCardSmall(v)}<button class="btn btn-link btn-sm" type="button" data-remove="${esc(v.id)}">${t("Remove")}</button></div>`).join("")}</div>`
        : `<div class="narrow wrap">${emptyState({ title: t("This collection is empty"), text: t("Open any verse and choose “Add to collection”."), action: `<a class="btn btn-ghost" href="#/library">${t("Explore the library")}</a>` })}</div>`}
    </section>
  </section>`;

  root.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
    store.toggleInCollection(col.id, b.dataset.remove);
    toast(t("Removed from collection."));
    detailView(root, id, navigate);
  }));
  root.querySelector("[data-rename]").addEventListener("click", () => openModal({
    title: t("Rename collection"),
    body: `<form class="inline-form"><label class="sr-only" for="rename">${t("Name")}</label><input id="rename" maxlength="60" value="${esc(col.name)}"><button class="btn btn-primary" type="submit">${t("Save")}</button></form>`,
    onOpen: (el, close) => el.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      store.updateCollection(col.id, { name: el.querySelector("#rename").value });
      close();
      detailView(root, id, navigate);
    })
  }));
  root.querySelector("[data-delete]").addEventListener("click", () => openModal({
    title: t("Delete this collection?"),
    body: `<p>${t("The verses stay in the library; only this grouping is removed.")}</p><div class="row-end"><button class="btn btn-ghost" type="button" data-no>${t("Keep it")}</button><button class="btn btn-danger" type="button" data-yes>${t("Delete")}</button></div>`,
    onOpen: (el, close) => {
      el.querySelector("[data-no]").addEventListener("click", close);
      el.querySelector("[data-yes]").addEventListener("click", () => { store.deleteCollection(col.id); close(); toast(t("Collection deleted.")); navigate("/collections"); });
    }
  }));
}

export function render(root, { params, navigate }) {
  if (!store.currentUser()) return navigate("/login?next=/collections");
  if (!store.isPremium()) { gate(root); return; }
  if (params.id) return detailView(root, params.id, navigate);
  return listView(root, navigate);
}

