import { esc, icon, openModal, toast, formatDate } from "../ui.js";
import * as store from "../store.js";
import { premiumBadge } from "../components.js";
import { downloadBlob } from "../share.js";
import { downloadReminder } from "./daily.js";

const THEMES = [
  { id: "ivory", label: "Ivory", desc: "Warm, light, calm", free: true },
  { id: "dusk", label: "Dusk", desc: "Soft and dark, for evenings", free: true },
  { id: "sandal", label: "Sandalwood", desc: "Deeper warm tones", free: false },
  { id: "sage", label: "Sage", desc: "Quiet greens", free: false }
];

export function render(root, { navigate }) {
  const me = store.currentUser();
  if (!me) return navigate("/login?next=/profile");
  const p = store.prefs();
  const premium = me.plan === "premium";
  const count = store.getData().reflections.length;

  root.innerHTML = `
  <section class="wrap narrow page-head">
    <p class="eyebrow">Profile</p>
    <h1>${esc(me.name)}</h1>
    <p class="muted">${esc(me.email)} · Member since ${esc(formatDate(me.createdAt, { month: "long", year: "numeric" }))}</p>
  </section>

  <section class="wrap narrow settings">
    <div class="setting-card">
      <h2 class="section-label">Your name</h2>
      <form id="name-form" class="inline-form">
        <label class="sr-only" for="name">Name</label>
        <input id="name" value="${esc(me.name)}" autocomplete="given-name">
        <button class="btn btn-ghost" type="submit">Update</button>
      </form>
    </div>

    <div class="setting-card">
      <h2 class="section-label">Plan</h2>
      <p>${premium ? "Premium — thank you for supporting Gita Reflection." : `Free · ${count} reflections saved. The essentials stay free, always.`}</p>
      ${premium ? "" : `<a class="btn btn-ghost btn-sm" href="#/premium">Explore Premium</a>`}
    </div>

    <div class="setting-card">
      <h2 class="section-label">Appearance</h2>
      <div class="theme-grid" role="radiogroup" aria-label="Theme">
        ${THEMES.map(t => {
          const locked = !t.free && !premium;
          return `<button type="button" class="theme-opt" role="radio" data-theme-opt="${t.id}" aria-checked="${p.theme === t.id}" ${locked ? 'aria-describedby="theme-lock"' : ""}>
            <span class="swatch swatch-${t.id}" aria-hidden="true"></span>
            <span class="theme-name">${esc(t.label)}</span>
            <span class="fine">${esc(t.desc)}</span>
            ${locked ? premiumBadge() : ""}
          </button>`;
        }).join("")}
      </div>
      ${premium ? "" : `<p class="fine" id="theme-lock">Sandalwood and Sage are Premium themes.</p>`}
    </div>

    <div class="setting-card">
      <h2 class="section-label">Peaceful ambience</h2>
      <label class="switch">
        <input type="checkbox" id="sound-pref" ${p.sound ? "checked" : ""}>
        <span>Play soft ambience during 2-minute reflections</span>
      </label>
      <p class="fine">Off by default. You can also turn ambience on anytime with the sound button at the top.</p>
    </div>

    <div class="setting-card">
      <h2 class="section-label">A gentle reminder</h2>
      <p>Add a daily calendar note that simply says “Take a moment for yourself.”</p>
      <button class="btn btn-ghost btn-sm" type="button" data-remind>${icon("bell")}<span>Add to my calendar</span></button>
    </div>

    <div class="setting-card">
      <h2 class="section-label">Your data</h2>
      <p class="muted">Everything is stored in this browser. Download a copy anytime.</p>
      <div class="row">
        <button class="btn btn-ghost btn-sm" type="button" data-export>${icon("download")}<span>Download my data</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-logout>Log out</button>
        <button class="btn btn-danger btn-sm" type="button" data-delete>${icon("trash")}<span>Delete account</span></button>
      </div>
    </div>
  </section>`;

  root.querySelector("#name-form").addEventListener("submit", e => {
    e.preventDefault();
    store.updateProfile({ name: root.querySelector("#name").value });
    toast("Name updated.");
    render(root, { navigate });
  });

  root.querySelectorAll("[data-theme-opt]").forEach(btn => btn.addEventListener("click", () => {
    const t = THEMES.find(x => x.id === btn.dataset.themeOpt);
    if (!t.free && !premium) {
      // Let people preview, gently.
      document.documentElement.dataset.theme = t.id;
      toast(`Previewing ${t.label}. It's part of Premium.`);
      setTimeout(() => { document.documentElement.dataset.theme = store.prefs().theme; }, 4000);
      return;
    }
    store.setPref("theme", t.id);
    root.querySelectorAll("[data-theme-opt]").forEach(b => b.setAttribute("aria-checked", String(b === btn)));
  }));

  root.querySelector("#sound-pref").addEventListener("change", e => store.setPref("sound", e.target.checked));
  root.querySelector("[data-remind]").addEventListener("click", downloadReminder);
  root.querySelector("[data-export]").addEventListener("click", () =>
    downloadBlob(new Blob([store.exportData()], { type: "application/json" }), "gita-reflection-data.json"));
  root.querySelector("[data-logout]").addEventListener("click", () => { store.logOut(); toast("You've logged out."); navigate("/"); });
  root.querySelector("[data-delete]").addEventListener("click", () => openModal({
    title: "Delete your account?",
    body: `<p>This permanently removes your account and every saved reflection from this device. You may want to download your data first.</p>
      <div class="row-end"><button class="btn btn-ghost" type="button" data-no>Keep my account</button><button class="btn btn-danger" type="button" data-yes>Delete everything</button></div>`,
    onOpen: (el, close) => {
      el.querySelector("[data-no]").addEventListener("click", close);
      el.querySelector("[data-yes]").addEventListener("click", () => { store.deleteAccount(); close(); toast("Your account has been deleted."); navigate("/"); });
    }
  }));
}
