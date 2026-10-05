// English / हिन्दी interface.
//
// t("English text", { vars }) returns the Hindi translation when Hindi is on,
// falling back to the English text if a translation is missing. English text is
// the key, so views stay readable. Content (verses, emotions, journeys) carries
// its own Hindi fields; use pick(obj, field) for those.
import { HI } from "./data/hi.js";
import { storage } from "./storage.js";

const LANGS = ["en", "hi"];
let current = null;
const listeners = new Set();
const missing = new Set();

function detect() {
  const saved = storage.get("prefs", {})?.lang;
  if (LANGS.includes(saved)) return saved;
  const prefs = navigator.languages || [navigator.language || "en"];
  return prefs.some(l => /^hi\b/i.test(l)) ? "hi" : "en";
}

export function lang() {
  if (!current) current = detect();
  return current;
}

export function isHindi() { return lang() === "hi"; }

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang()) return;
  current = next;
  storage.set("prefs", { ...storage.get("prefs", {}), lang: next });
  applyDocumentLang();
  listeners.forEach(fn => { try { fn(next); } catch (e) { console.error(e); } });
}

export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function fill(text, vars) {
  return vars ? String(text).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : text;
}

export function t(text, vars) {
  if (lang() === "hi") {
    const hi = HI[text];
    if (hi === undefined) { missing.add(text); return fill(text, vars); }
    return fill(hi, vars);
  }
  return fill(text, vars);
}

// Plural helper: tn(n, "{n} reflection", "{n} reflections")
export function tn(n, one, many) { return t(n === 1 ? one : many, { n }); }

// Localised field from content objects: pick(verse, "meaning") reads verse.hi_meaning / verse.hi.meaning when Hindi is on.
export function pick(obj, field) {
  if (!obj) return "";
  if (lang() === "hi") {
    const v = obj.hiText?.[field];
    if (v) return v;
  }
  return obj[field];
}

export function locale() { return lang() === "hi" ? "hi-IN" : "en-IN"; }

export function applyDocumentLang() {
  document.documentElement.lang = lang();
  // Static shell text (header, footer, bottom nav) carries data-i18n attributes.
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-label]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nLabel)); });
}

// Used by tests to find untranslated interface text.
export function missingTranslations() { return [...missing]; }
if (typeof window !== "undefined") window.__grMissingHindi = missingTranslations;
