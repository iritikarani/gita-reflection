// Accounts and saved data.
//
// This is the "local" provider: accounts and reflections live only in this
// browser (localStorage), passwords are hashed with PBKDF2 and never leave the
// device. Every view talks to the functions exported here, so a hosted backend
// (Supabase, Firebase, your own API) can replace this file without touching the UI.
import { CONFIG } from "./config.js";

const PREFIX = "gr.";
const memory = new Map();

const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return memory.has(key) ? memory.get(key) : fallback;
    }
  },
  set(key, value) {
    memory.set(key, value);
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* private mode: memory only */ }
  },
  remove(key) {
    memory.delete(key);
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  }
};

const session = {
  get(key, fallback = null) {
    try { const raw = sessionStorage.getItem(PREFIX + key); return raw == null ? fallback : JSON.parse(raw); }
    catch { return fallback; }
  },
  set(key, value) {
    try { sessionStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
  remove(key) {
    try { sessionStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  }
};

export { session };

// ---- change notifications ----
const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }

// ---- password hashing ----
function toHex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""); }

async function hashPassword(password, saltHex) {
  if (!window.crypto?.subtle) throw new Error("Accounts need a secure (https) connection.");
  const salt = saltHex
    ? new Uint8Array(saltHex.match(/.{2}/g).map(h => parseInt(h, 16)))
    : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" }, key, 256);
  return { salt: toHex(salt), hash: toHex(bits) };
}

function normEmail(email) { return String(email || "").trim().toLowerCase(); }

function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

// ---- accounts ----
function users() { return storage.get("users", {}); }
function saveUsers(u) { storage.set("users", u); }

export function currentUser() {
  const email = storage.get("session");
  if (!email) return null;
  const u = users()[email];
  if (!u) return null;
  return { email, name: u.name, plan: u.plan || "free", createdAt: u.createdAt };
}

export function isPremium() { return currentUser()?.plan === "premium"; }

export async function signUp({ name, email, password }) {
  email = normEmail(email);
  name = String(name || "").trim();
  if (!name) throw new Error("Please tell us what to call you.");
  if (!validEmail(email)) throw new Error("Please enter a valid email address.");
  if (String(password || "").length < 8) throw new Error("Please choose a password of at least 8 characters.");
  const all = users();
  if (all[email]) throw new Error("An account with this email already exists on this device. Try logging in instead.");
  const { salt, hash } = await hashPassword(password);
  all[email] = { name, salt, hash, plan: "free", createdAt: Date.now() };
  saveUsers(all);
  storage.set("session", email);
  adoptGuestData(email);
  emit();
  return currentUser();
}

export async function logIn({ email, password }) {
  email = normEmail(email);
  if (!validEmail(email)) throw new Error("Please enter a valid email address.");
  if (!password) throw new Error("Please enter your password.");
  const u = users()[email];
  if (!u) throw new Error("We couldn't find that email and password on this device.");
  const { hash } = await hashPassword(password, u.salt);
  if (hash !== u.hash) throw new Error("We couldn't find that email and password on this device.");
  storage.set("session", email);
  adoptGuestData(email);
  emit();
  return currentUser();
}

export function logOut() {
  storage.remove("session");
  emit();
}

export function accountExists(email) { return Boolean(users()[normEmail(email)]); }

// Local accounts have no email server, so a reset happens on the device that holds the account.
export async function resetPassword({ email, password }) {
  email = normEmail(email);
  const all = users();
  if (!all[email]) throw new Error("We couldn't find an account with that email on this device.");
  if (String(password || "").length < 8) throw new Error("Please choose a password of at least 8 characters.");
  const { salt, hash } = await hashPassword(password);
  all[email] = { ...all[email], salt, hash };
  saveUsers(all);
  storage.set("session", email);
  emit();
}

export function updateProfile({ name }) {
  const me = currentUser();
  if (!me) return;
  const all = users();
  all[me.email].name = String(name || "").trim() || all[me.email].name;
  saveUsers(all);
  emit();
}

export function setPlan(plan) {
  const me = currentUser();
  if (!me) return;
  const all = users();
  all[me.email].plan = plan;
  saveUsers(all);
  emit();
}

export function deleteAccount() {
  const me = currentUser();
  if (!me) return;
  const all = users();
  delete all[me.email];
  saveUsers(all);
  storage.remove(`data.${me.email}`);
  storage.remove("session");
  emit();
}

// ---- user data ----
const EMPTY = () => ({ reflections: [], savedVerses: [], journey: { completed: [], entries: {}, finishedAt: null }, monthNotes: {} });

function dataKey() {
  const me = currentUser();
  return me ? `data.${me.email}` : "data.guest";
}

export function getData() {
  return { ...EMPTY(), ...storage.get(dataKey(), {}) };
}

function setData(data) {
  storage.set(dataKey(), data);
  emit();
}

function adoptGuestData(email) {
  const guest = storage.get("data.guest");
  if (!guest) return;
  const mine = { ...EMPTY(), ...storage.get(`data.${email}`, {}) };
  mine.reflections = [...(guest.reflections || []), ...mine.reflections];
  mine.savedVerses = [...new Set([...(guest.savedVerses || []), ...mine.savedVerses])];
  storage.set(`data.${email}`, mine);
  storage.remove("data.guest");
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export function savedLimitReached() {
  return !isPremium() && getData().reflections.length >= CONFIG.freeSavedLimit;
}

// Returns { ok: true, reflection } or { ok: false, reason: "auth" | "limit" }
export function saveReflection(entry) {
  if (!currentUser()) return { ok: false, reason: "auth" };
  const data = getData();
  if (entry.id) {
    const i = data.reflections.findIndex(r => r.id === entry.id);
    if (i >= 0) {
      data.reflections[i] = { ...data.reflections[i], ...entry, updatedAt: Date.now() };
      setData(data);
      return { ok: true, reflection: data.reflections[i] };
    }
  }
  if (savedLimitReached()) return { ok: false, reason: "limit" };
  const reflection = { id: uid(), createdAt: Date.now(), ...entry };
  data.reflections.unshift(reflection);
  setData(data);
  return { ok: true, reflection };
}

export function deleteReflection(id) {
  const data = getData();
  data.reflections = data.reflections.filter(r => r.id !== id);
  setData(data);
}

export function isVerseSaved(id) { return getData().savedVerses.includes(id); }

export function toggleSavedVerse(id) {
  if (!currentUser()) return { ok: false, reason: "auth" };
  const data = getData();
  const has = data.savedVerses.includes(id);
  data.savedVerses = has ? data.savedVerses.filter(x => x !== id) : [id, ...data.savedVerses];
  setData(data);
  return { ok: true, saved: !has };
}

export function journeyState() { return getData().journey; }

export function saveJourneyEntry(day, entry) {
  if (!currentUser()) return { ok: false, reason: "auth" };
  const data = getData();
  data.journey.entries[day] = { ...(data.journey.entries[day] || {}), ...entry, updatedAt: Date.now() };
  if (entry.done && !data.journey.completed.includes(day)) data.journey.completed.push(day);
  if (data.journey.completed.length >= 7 && !data.journey.finishedAt) data.journey.finishedAt = Date.now();
  setData(data);
  return { ok: true };
}

export function resetJourney() {
  const data = getData();
  data.journey = EMPTY().journey;
  setData(data);
}

export function saveMonthNote(monthKey, text) {
  if (!currentUser()) return;
  const data = getData();
  data.monthNotes[monthKey] = text;
  setData(data);
}

export function exportData() {
  return JSON.stringify({ user: currentUser(), data: getData(), exportedAt: new Date().toISOString() }, null, 2);
}

// ---- device preferences (not tied to an account) ----
export function prefs() {
  return { theme: "ivory", sound: false, ...storage.get("prefs", {}) };
}
export function setPref(key, value) {
  storage.set("prefs", { ...prefs(), [key]: value });
  emit();
}

// ---- pending action: remembered while someone signs up mid-flow ----
export function setPending(action) { session.set("pending", action); }
export function takePending() { const p = session.get("pending"); session.remove("pending"); return p; }
