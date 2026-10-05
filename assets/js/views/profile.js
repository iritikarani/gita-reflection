import { esc, icon, openModal, toast, formatDate } from "../ui.js";
import * as store from "../store.js";
import { premiumBadge } from "../components.js";
import { downloadBlob } from "../share.js";
import { downloadReminder } from "./daily.js";
import { t, lang, setLang } from "../i18n.js";

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
    <p class="eyebrow">${t("Profile")}</p>
    <h1>${esc(me.name)}</h1>
    <p class="muted">${esc(me.email)} · ${t("Member since {date}", { date: esc(formatDate(me.createdAt, { month: "long", year: "numeric" })) })}</p>
  </section>

  <section class="wrap narrow settings">
    <div class="setting-card">
      <h2 class="section-label">${t("Language")} · भाषा</h2>
      <div class="theme-grid" role="radiogroup" aria-label="${t("Language")}">
        <button type="button" class="theme-opt" role="radio" data-lang-opt="en" lang="en" aria-checked="${lang() === "en"}"><span class="theme-name">English</span><span class="fine">Interface in English</span></button>
        <button type="button" class="theme-opt" role="radio" data-lang-opt="hi" lang="hi" aria-checked="${lang() === "hi"}"><span class="theme-name">हिन्दी</span><span class="fine">पूरी साइट हिन्दी में</span></button>
      </div>
      <p class="fine">${t("You can write in English, Hindi or Hinglish in either language.")}</p>
    </div>

    <div class="setting-card">
      <h2 class="section-label">${t("Your name")}</h2>
      <form id="name-form" class="inline-form">
        <label class="sr-only" for="name">${t("Name")}</label>
        <input id="name" value="${esc(me.name)}" autocomplete="given-name">
        <button class="btn btn-ghost" type="submit">${t("Update")}</button>
      </form>
    </div>

    <div class="setting-card">
      <h2 class="section-label">${t("Plan")}</h2>
      <p>${premium ? t("Premium — thank you for supporting Gita Reflection.") : t("Free · {n} reflections saved. The essentials stay free, always.", { n: count })}</p>
      ${premium ? "" : `<a class="btn btn-ghost btn-sm" href="#/premium">${t("Explore Premium")}</a>`}
    </div>

    <div class="setting-card">
      <h2 class="section-label">${t("Appearance")}</h2>
      <div class="theme-grid" role="radiogroup" aria-label="${t("Theme")}">
        ${THEMES.map(th => {
          const locked = !th.free && !premium;
          return `<button type="button" class="theme-opt" role="radio" data-theme-opt="${th.id}" aria-checked="${p.theme === th.id}" ${locked ? 'aria-describedby="theme-lock"' : ""}>
            <span class="swatch swatch-${th.id}" aria-hidden="true"></span>
            <span class="theme-name">${esc(t(th.label))}</span>
            <span class="fine">${esc(t(th.desc))}</span>
            ${locked ? premiumBadge() : ""}
          </button>`;
        }).join("")}
      </div>
      ${premium ? "" : `<p class="fine" id="theme-lock">${t("Sandalwood and Sage are Premium themes.")}</p>`}
    </div>

    <div class="setting-card">
      <h2 class="section-label">${t("Peaceful ambience")}</h2>
      <label class="switch">
        <input type="checkbox" id="sound-pref" ${p.sound ? "checked" : ""}>
        <span>${t("Play soft ambience during 2-minute reflections")}</span>
      </label>
      <p class="fine">${t("Off by default. You can also turn ambience on anytime with the sound button at the top.")}</p>
    </div>

    <div class="setting-card">
      <h2 class="section-label">${t("A gentle reminder")}</h2>
      <p>${t("Add a daily calendar note that simply says “Take a moment for yourself.”")}</p>
      <button class="btn btn-ghost btn-sm" type="button" data-remind>${icon("bell")}<span>${t("Add to my calendar")}</span></button>
    </div>

    <div class="setting-card">
      <h2 class="section-label">${t("Your data")}</h2>
      <p class="muted">${store.backendMode() === "supabase" ? t("Your reflections are saved securely to your account. Download a copy anytime.") : t("Everything is stored in this browser. Download a copy anytime.")}</p>
      <div class="row">
        <button class="btn btn-ghost btn-sm" type="button" data-export>${icon("download")}<span>${t("Download my data")}</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-logout>${t("Log out")}</button>
        <button class="btn btn-danger btn-sm" type="button" data-delete>${icon("trash")}<span>${t("Delete account")}</span></button>
      </div>
    </div>
  </section>`;

  root.querySelector("#name-form").addEventListener("submit", e => {
    e.preventDefault();
    store.updateProfile({ name: root.querySelector("#name").value })
      .then(() => { toast(t("Name updated.")); render(root, { navigate }); })
      .catch(err => toast(err.message));
  });

  root.querySelectorAll("[data-lang-opt]").forEach(btn => btn.addEventListener("click", () => setLang(btn.dataset.langOpt)));

  root.querySelectorAll("[data-theme-opt]").forEach(btn => btn.addEventListener("click", () => {
    const th = THEMES.find(x => x.id === btn.dataset.themeOpt);
    if (!th.free && !premium) {
      // Let people preview, gently.
      document.documentElement.dataset.theme = th.id;
      toast(t("Previewing {name}. It's part of Premium.", { name: t(th.label) }));
      setTimeout(() => { document.documentElement.dataset.theme = store.prefs().theme; }, 4000);
      return;
    }
    store.setPref("theme", th.id);
    root.querySelectorAll("[data-theme-opt]").forEach(b => b.setAttribute("aria-checked", String(b === btn)));
  }));

  root.querySelector("#sound-pref").addEventListener("change", e => store.setPref("sound", e.target.checked));
  root.querySelector("[data-remind]").addEventListener("click", downloadReminder);
  root.querySelector("[data-export]").addEventListener("click", () =>
    downloadBlob(new Blob([store.exportData()], { type: "application/json" }), "gita-reflection-data.json"));
  root.querySelector("[data-logout]").addEventListener("click", async () => { await store.logOut(); toast(t("You've logged out.")); navigate("/"); });
  root.querySelector("[data-delete]").addEventListener("click", () => openModal({
    title: t("Delete your account?"),
    body: `<p>${store.backendMode() === "supabase" ? t("This permanently removes your account and every saved reflection. You may want to download your data first.") : t("This permanently removes your account and every saved reflection from this device. You may want to download your data first.")}</p>
      <div class="row-end"><button class="btn btn-ghost" type="button" data-no>${t("Keep my account")}</button><button class="btn btn-danger" type="button" data-yes>${t("Delete everything")}</button></div>`,
    onOpen: (el, close) => {
      el.querySelector("[data-no]").addEventListener("click", close);
      el.querySelector("[data-yes]").addEventListener("click", async e => {
        e.currentTarget.disabled = true;
        try { await store.deleteAccount(); close(); toast(t("Your account has been deleted.")); navigate("/"); }
        catch (err) { close(); toast(t(err.message || "We couldn't delete your account just now.")); }
      });
    }
  }));
}
