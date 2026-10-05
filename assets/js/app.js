// Gita Reflection — app shell and router.
import * as store from "./store.js";
import { esc, toast, closeAllModals } from "./ui.js";
import { startAmbience, stopAmbience } from "./sound.js";
import { runPending } from "./components.js";
import { t, lang, setLang, onLangChange, applyDocumentLang } from "./i18n.js";

const ROUTES = [
  { path: "", view: "home", nav: "home", title: "" },
  { path: "reflection", view: "result", nav: "home", title: "Your reflection" },
  { path: "daily", view: "daily", nav: "daily", title: "Daily Gita" },
  { path: "reflect", view: "conversation", nav: "reflect", title: "Reflect with the Gita" },
  { path: "library", view: "library", nav: "library", title: "Shlok library" },
  { path: "shlok/:id", view: "shlok", nav: "library", title: "Shlok" },
  { path: "journey", view: "journey", nav: "journey", title: "My Journey" },
  { path: "summary", view: "summary", nav: "journey", title: "Your month in reflection" },
  { path: "seven-days", view: "seven", nav: "journey", title: "7 Days with the Gita" },
  { path: "seven-days/:day", view: "seven", nav: "journey", title: "7 Days with the Gita" },
  { path: "signup", view: "auth", nav: "", title: "Create an account", mode: "signup" },
  { path: "login", view: "auth", nav: "", title: "Log in", mode: "login" },
  { path: "forgot", view: "auth", nav: "", title: "Reset your password", mode: "forgot" },
  { path: "reset", view: "auth", nav: "", title: "Choose a new password", mode: "reset" },
  { path: "profile", view: "profile", nav: "", title: "Profile" },
  { path: "premium", view: "premium", nav: "", title: "Premium", mode: "premium" },
  { path: "shop", view: "premium", nav: "", title: "Journals & resources", mode: "shop" },
  { path: "about", view: "pages", nav: "", title: "About", mode: "about" },
  { path: "how-it-works", view: "pages", nav: "", title: "How it works", mode: "how" },
  { path: "privacy", view: "pages", nav: "", title: "Privacy", mode: "privacy" },
  { path: "terms", view: "pages", nav: "", title: "Terms", mode: "terms" },
  { path: "contact", view: "pages", nav: "", title: "Contact", mode: "contact" }
];

const viewCache = {};
const loadView = name => (viewCache[name] ||= import(`./views/${name}.js`));

function parseHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  const [pathPart, queryPart = ""] = raw.split("?");
  const path = pathPart.replace(/\/$/, "");
  const query = Object.fromEntries(new URLSearchParams(queryPart));
  for (const route of ROUTES) {
    const keys = [];
    const re = new RegExp("^" + route.path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$");
    const m = path.match(re);
    if (m) return { route, params: Object.fromEntries(keys.map((k, i) => [k, m[i + 1]])), query };
  }
  return { route: null, params: {}, query };
}

export function navigate(path) {
  if (location.hash === `#${path}`) render();
  else location.hash = path;
}

let cleanup = null;
let firstRender = true;
let renderToken = 0;

async function render() {
  const token = ++renderToken;
  const main = document.getElementById("main");
  const { route, params, query } = parseHash();
  if (typeof cleanup === "function") { try { cleanup(); } catch { /* ignore */ } }
  cleanup = null;

  document.querySelectorAll("[data-nav]").forEach(a => {
    const active = route && a.dataset.nav === route.nav;
    a.classList.toggle("active", Boolean(active));
    if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  closeProfileMenu();
  closeAllModals();

  if (!route) {
    main.innerHTML = `<section class="wrap narrow page-pad center"><h1 tabindex="-1">${t("This page has drifted away")}</h1><p class="lead center">${t("The link may be old or mistyped.")}</p><a class="btn btn-primary" href="#/">${t("Return home")}</a></section>`;
    document.title = `${t("Not found")} — ${t("Gita Reflection")}`;
    focusHeading(main);
    return;
  }

  let mod;
  try {
    mod = await loadView(route.view);
  } catch (e) {
    console.error(e);
    main.innerHTML = `<section class="wrap narrow page-pad center"><h1 tabindex="-1">${t("We couldn't open this page")}</h1><p class="lead center">${t("Please check your connection and try again.")}</p><button class="btn btn-primary" type="button" onclick="location.reload()">${t("Try again")}</button></section>`;
    return;
  }
  if (token !== renderToken) return;

  main.classList.remove("enter");
  const result = await mod.render(main, { params, query, mode: route.mode, navigate });
  if (token !== renderToken) return;
  cleanup = result;
  void main.offsetWidth;
  main.classList.add("enter");

  const heading = main.querySelector("h1");
  const pageTitle = route.title ? t(route.title) : "";
  document.title = pageTitle ? `${heading?.dataset.title || pageTitle} — ${t("Gita Reflection")}` : `${t("Gita Reflection")} — ${t("A calm place to pause and reflect")}`;

  window.scrollTo(0, 0);
  if (!firstRender) focusHeading(main);
  firstRender = false;
}

function focusHeading(main) {
  const h = main.querySelector("h1");
  if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
}

// ---- header: profile menu ----
const profileBtn = document.getElementById("profile-btn");
const profilePop = document.getElementById("profile-pop");

function renderProfileMenu() {
  const me = store.currentUser();
  const initial = document.querySelector(".avatar-initial");
  profileBtn.classList.toggle("signed-in", Boolean(me));
  initial.textContent = me ? (me.name || me.email).trim().charAt(0).toUpperCase() : "";
  profileBtn.setAttribute("aria-label", me ? t("Account menu for {name}", { name: me.name }) : t("Account menu"));
  profilePop.innerHTML = me
    ? `<p class="pop-head"><strong>${esc(me.name)}</strong><span>${esc(me.email)}</span></p>
       <a href="#/journey">${t("My Journey")}</a>
       <a href="#/seven-days">${t("7-Day Journey")}</a>
       <a href="#/summary">${t("Monthly summary")}</a>
       <a href="#/profile">${t("Profile & settings")}</a>
       ${me.plan === "premium" ? "" : `<a href="#/premium">${t("Go deeper with Premium")}</a>`}
       <button type="button" data-logout>${t("Log out")}</button>`
    : `<p class="pop-head"><strong>${t("Welcome")}</strong><span>${t("No account needed to reflect.")}</span></p>
       <a href="#/login">${t("Log in")}</a>
       <a href="#/signup">${t("Create a free account")}</a>
       <a href="#/seven-days">${t("7-Day Journey")}</a>
       <a href="#/premium">${t("Premium")}</a>`;
}

function closeProfileMenu() {
  profilePop.hidden = true;
  profileBtn.setAttribute("aria-expanded", "false");
}

profileBtn.addEventListener("click", e => {
  e.stopPropagation();
  const open = profilePop.hidden;
  profilePop.hidden = !open;
  profileBtn.setAttribute("aria-expanded", String(open));
  if (open) profilePop.querySelector("a, button")?.focus();
});
profilePop.addEventListener("click", e => {
  if (e.target.closest("[data-logout]")) {
    store.logOut().then(() => {
      toast(t("You've logged out. Come back whenever you need a quiet moment."));
      navigate("/");
    });
  }
  if (e.target.closest("a, button")) closeProfileMenu();
});
document.addEventListener("click", e => { if (!e.target.closest(".profile-menu")) closeProfileMenu(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !profilePop.hidden) { closeProfileMenu(); profileBtn.focus(); }
});

// ---- header: ambient sound (off by default) ----
const soundBtn = document.getElementById("sound-toggle");
let soundOn = false;
function setSound(on) {
  soundOn = on;
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.setAttribute("aria-label", on ? t("Peaceful ambience: on") : t("Peaceful ambience: off"));
  soundBtn.classList.toggle("on", on);
  if (on) startAmbience(); else stopAmbience();
}
soundBtn.addEventListener("click", () => {
  setSound(!soundOn);
  store.setPref("sound", soundOn);
  toast(soundOn ? t("Peaceful ambience on.") : t("Ambience off."));
});

// ---- theme ----
function applyTheme() {
  const { theme } = store.prefs();
  const allowed = theme === "ivory" || theme === "dusk" || store.isPremium();
  document.documentElement.dataset.theme = allowed ? theme : "ivory";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#F6F0E4";
}


// Exposed for auth views to resume what the visitor was doing.
export function afterAuth(next) {
  runPending();
  navigate(next ? `/${next.replace(/^\//, "")}` : "/journey");
}

document.getElementById("year").textContent = new Date().getFullYear();
store.onError(message => toast(t(message)));

// ---- language: English / हिन्दी ----
const langBtn = document.getElementById("lang-toggle");
function renderLangToggle() {
  const hi = lang() === "hi";
  langBtn.textContent = hi ? "EN" : "हिं";
  langBtn.setAttribute("aria-label", hi ? "View in English" : "हिन्दी में देखें");
  langBtn.setAttribute("lang", hi ? "en" : "hi");
  langBtn.title = hi ? "English" : "हिन्दी";
}
langBtn.addEventListener("click", () => setLang(lang() === "hi" ? "en" : "hi"));
onLangChange(() => {
  renderLangToggle();
  renderProfileMenu();
  setSound(soundOn);
  render();
});
applyDocumentLang();
renderLangToggle();

// Links from account emails arrive as "#access_token=…&type=recovery" (or an error).
// Read them before the auth client consumes and clears the URL.
function readEmailLink() {
  const h = location.hash.slice(1);
  if (!/(^|&)(access_token|error_description|error_code)=/.test(h)) return null;
  return Object.fromEntries(new URLSearchParams(h));
}

async function start() {
  const link = readEmailLink();
  await store.init();
  renderProfileMenu();
  applyTheme();
  store.subscribe(({ event } = {}) => {
    renderProfileMenu();
    applyTheme();
    if (event === "PASSWORD_RECOVERY" && location.hash !== "#/reset") navigate("/reset");
    // Signed out elsewhere (another tab, expired session): leave account-only pages.
    if (event === "SIGNED_OUT" && /^#\/(profile|summary)/.test(location.hash)) navigate("/");
  });
  window.addEventListener("hashchange", render);

  if (link?.error_description || link?.error_code) {
    history.replaceState(null, "", location.pathname + location.search + "#/");
    toast(t("That link has expired or was already used. Please try again."));
    render();
  } else if (link?.type === "recovery" && store.currentUser()) {
    navigate("/reset");
  } else if (link && store.currentUser()) {
    const saved = runPending({ quiet: true });
    toast(saved ? t("Your email is confirmed, and your reflection is saved.") : t("Your email is confirmed. Welcome to Gita Reflection."));
    navigate("/journey");
  } else {
    render();
  }
}

start();

// Warm the cache for the most-used views once the page is idle.
const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1500));
idle(() => { ["result", "daily", "conversation", "library"].forEach(loadView); store.warmUp(); });
