// Accounts and saved data — the only module views talk to.
//
// Reads are synchronous from an in-memory copy of the signed-in person's data.
// Writes update that copy immediately, then go to the backend in order:
//   • Supabase (when configured in config.js) — real accounts, synced everywhere
//   • local — accounts stored privately in this browser (the default)
import { CONFIG } from "./config.js";
import { storage, session } from "./storage.js";
import { createLocalBackend } from "./backends/local.js";

export { session };

const EMPTY = () => ({ reflections: [], savedVerses: [], journey: { completed: [], entries: {}, finishedAt: null }, monthNotes: {}, programs: {}, collections: [] });

let backend = createLocalBackend();
let me = null;
let data = EMPTY();
let readyPromise = null;

// ---- change notifications ----
const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(detail = {}) { listeners.forEach(fn => { try { fn(detail); } catch (e) { console.error(e); } }); }

let errorHandler = message => console.error(message);
export function onError(fn) { errorHandler = fn; }

function setSession(result) {
  me = result?.user || null;
  data = me ? { ...EMPTY(), ...(result.data || {}) } : EMPTY();
  data.journey = { ...EMPTY().journey, ...(data.journey || {}) };
}

export function supabaseConfigured() {
  return Boolean(CONFIG.supabase?.url && CONFIG.supabase?.anonKey);
}

// Supabase's client is only needed right away if someone is signed in or is
// arriving from an email link; otherwise it loads when they first log in or sign up.
function needsSupabaseNow() {
  try {
    const ref = new URL(CONFIG.supabase.url).hostname.split(".")[0];
    if (localStorage.getItem(`sb-${ref}-auth-token`)) return true;
  } catch { /* storage unavailable */ }
  return /(access_token|error_code|error_description)=/.test(location.hash);
}

let remotePromise = null;
let remoteFailed = false;
function loadRemote() {
  if (!remotePromise) {
    remotePromise = (async () => {
      const { createSupabaseBackend } = await import("./backends/supabase.js");
      backend = await createSupabaseBackend(CONFIG.supabase, {
        onAuthEvent: ({ event, user, data: d }) => {
          if (event === "SIGNED_OUT" && !me) return;
          setSession({ user, data: d });
          emit({ event });
        }
      });
      return backend;
    })().catch(e => {
      console.error("Could not start Supabase.", e);
      remotePromise = null;
      throw new Error("We couldn't reach our server. Please check your connection and try again.");
    });
  }
  return remotePromise;
}

// The backend to use for account actions (loads Supabase on demand).
async function accounts() {
  if (supabaseConfigured() && !remoteFailed) return loadRemote();
  return backend;
}

// Called once at start-up, before the first page renders.
export function init() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    if (supabaseConfigured()) {
      if (!needsSupabaseNow()) { setSession(null); return; }
      try { await loadRemote(); }
      catch { remoteFailed = true; setSession(null); return; }
    }
    try { setSession(await backend.init()); }
    catch (e) { console.error(e); setSession(null); }
  })();
  return readyPromise;
}

// Fetch the Supabase client in the background so logging in feels instant.
export function warmUp() {
  if (supabaseConfigured()) import("./backends/supabase.js").then(m => m.preload?.()).catch(() => {});
}

export function backendMode() { return supabaseConfigured() && !remoteFailed ? "supabase" : "local"; }

// ---- write queue: keeps writes in order, reports failures gently ----
let queue = Promise.resolve();
function write(fn) {
  const snapshot = JSON.parse(JSON.stringify(data));
  queue = queue.then(() => fn(snapshot)).catch(e => {
    console.error(e);
    const msg = String(e?.message || "");
    errorHandler(/free_limit_reached/.test(msg)
      ? "Your free journal is full, so that reflection couldn't be saved."
      : /premium_required/.test(msg)
        ? "That's part of Premium, so it couldn't be saved."
        : "We couldn't save that just now. Please check your connection and try again.");
  });
  return queue;
}
export function flush() { return queue; }

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 9));
const normEmail = email => String(email || "").trim().toLowerCase();
const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ---- accounts ----
export function currentUser() { return me; }
export function isPremium() { return me?.plan === "premium"; }

export async function signUp({ name, email, password }) {
  email = normEmail(email);
  name = String(name || "").trim();
  if (!name) throw new Error("Please tell us what to call you.");
  if (!validEmail(email)) throw new Error("Please enter a valid email address.");
  if (String(password || "").length < 8) throw new Error("Please choose a password of at least 8 characters.");
  const result = await (await accounts()).signUp({ name, email, password });
  if (result.needsConfirmation) return { needsConfirmation: true };
  setSession(result);
  emit({ event: "SIGNED_IN" });
  return { user: me };
}

export async function logIn({ email, password }) {
  email = normEmail(email);
  if (!validEmail(email)) throw new Error("Please enter a valid email address.");
  if (!password) throw new Error("Please enter your password.");
  setSession(await (await accounts()).logIn({ email, password }));
  emit({ event: "SIGNED_IN" });
  return me;
}

export async function logOut() {
  await flush();
  await (await accounts()).logOut();
  setSession(null);
  emit({ event: "SIGNED_OUT" });
}

// Local accounts only: does this browser hold an account for this email?
export function accountExists(email) { return backendMode() === "local" ? (backend.accountExists?.(normEmail(email)) ?? false) : false; }

// Supabase: email a reset link. Local: not available (use resetPassword on this device).
export async function requestPasswordReset(email) {
  email = normEmail(email);
  if (!validEmail(email)) throw new Error("Please enter a valid email address.");
  await (await accounts()).requestPasswordReset(email);
}

// Local accounts: set a new password on the device that holds the account.
export async function resetPassword({ email, password }) {
  if (String(password || "").length < 8) throw new Error("Please choose a password of at least 8 characters.");
  setSession(await (await accounts()).resetPassword({ email: normEmail(email), password }));
  emit({ event: "SIGNED_IN" });
}

// Supabase: set a new password for the signed-in (or recovering) user.
export async function updatePassword(password) {
  if (String(password || "").length < 8) throw new Error("Please choose a password of at least 8 characters.");
  await (await accounts()).updatePassword(password);
}

export async function updateProfile({ name }) {
  if (!me) return;
  name = String(name || "").trim().slice(0, 80);
  if (!name) return;
  me = await backend.updateName(name);
  emit();
}

export async function setPlan(plan) {
  if (!me) return;
  me = await backend.setPlan(plan);
  emit();
}

// Server-side actions (Supabase Edge Functions), e.g. payments.
export async function callFunction(name, body) {
  if (!backend?.callFunction) throw Object.assign(new Error("unavailable"), { code: "unavailable" });
  return backend.callFunction(name, body);
}

// Reload the account (after a payment, for example) without losing unsaved writes.
export async function refreshAccount() {
  if (!backend?.refresh) return me;
  await flush();
  const result = await backend.refresh();
  if (result?.user) { setSession(result); emit(); }
  return me;
}

export async function deleteAccount() {
  if (!me) return;
  await flush();
  await backend.deleteAccount();
  setSession(null);
  emit({ event: "SIGNED_OUT" });
}

// ---- reading data ----
export function getData() { return data; }
export function isVerseSaved(id) { return data.savedVerses.includes(id); }
export function journeyState() { return data.journey; }
export function savedLimitReached() { return !isPremium() && data.reflections.length >= CONFIG.freeSavedLimit; }

export function exportData() {
  return JSON.stringify({ user: me, data, exportedAt: new Date().toISOString() }, null, 2);
}

// ---- writing data ----
// Returns { ok: true, reflection } or { ok: false, reason: "auth" | "limit" }
export function saveReflection(entry) {
  if (!me) return { ok: false, reason: "auth" };
  if (entry.id) {
    const i = data.reflections.findIndex(r => r.id === entry.id);
    if (i >= 0) {
      data.reflections[i] = { ...data.reflections[i], ...entry, updatedAt: Date.now() };
      const r = data.reflections[i];
      write(snap => backend.putReflection(r, snap));
      emit();
      return { ok: true, reflection: r };
    }
  }
  if (savedLimitReached()) return { ok: false, reason: "limit" };
  const reflection = { ...entry, id: uid(), createdAt: Date.now() };
  data.reflections.unshift(reflection);
  write(snap => backend.putReflection(reflection, snap));
  emit();
  return { ok: true, reflection };
}

export function deleteReflection(id) {
  data.reflections = data.reflections.filter(r => r.id !== id);
  for (const e of Object.values(data.journey.entries)) if (e.reflectionId === id) e.reflectionId = null;
  write(snap => backend.removeReflection(id, snap));
  emit();
}

export function toggleSavedVerse(id) {
  if (!me) return { ok: false, reason: "auth" };
  const saved = !data.savedVerses.includes(id);
  data.savedVerses = saved ? [id, ...data.savedVerses] : data.savedVerses.filter(x => x !== id);
  write(snap => backend.setSavedVerse(id, saved, snap));
  emit();
  return { ok: true, saved };
}

export function saveJourneyEntry(day, entry) {
  if (!me) return { ok: false, reason: "auth" };
  const merged = { ...(data.journey.entries[day] || {}), ...entry, updatedAt: Date.now() };
  data.journey.entries[day] = merged;
  if (merged.done && !data.journey.completed.includes(day)) data.journey.completed.push(day);
  write(snap => backend.putJourneyEntry(day, merged, snap));
  if (data.journey.completed.length >= 7 && !data.journey.finishedAt) {
    data.journey.finishedAt = Date.now();
    const when = data.journey.finishedAt;
    write(snap => backend.setJourneyFinished(when, snap));
  }
  emit();
  return { ok: true };
}

export function resetJourney() {
  data.journey = EMPTY().journey;
  write(snap => backend.clearJourney(snap));
  emit();
}

export function saveMonthNote(monthKey, text) {
  if (!me) return;
  data.monthNotes[monthKey] = text;
  write(snap => backend.putMonthNote(monthKey, text, snap));
}

// ---- Premium: guided programs ----
export function programState(id) {
  return data.programs[id] || { completed: [], entries: {} };
}

export function saveProgramEntry(programId, day, entry) {
  if (!me) return { ok: false, reason: "auth" };
  const state = { completed: [], entries: {}, ...(data.programs[programId] || {}) };
  const merged = { ...(state.entries[day] || {}), ...entry, updatedAt: Date.now() };
  state.entries = { ...state.entries, [day]: merged };
  if (merged.done && !state.completed.includes(day)) state.completed = [...state.completed, day];
  data.programs[programId] = state;
  write(snap => backend.putProgramEntry(programId, day, merged, snap));
  emit();
  return { ok: true };
}

// ---- Premium: personal shlok collections ----
export function collections() { return data.collections; }

export function createCollection(name) {
  if (!me) return null;
  const col = { id: uid(), name: String(name || "").trim().slice(0, 60) || "My collection", verseIds: [], createdAt: Date.now() };
  data.collections = [col, ...data.collections];
  write(snap => backend.putCollection(col, snap));
  emit();
  return col;
}

export function updateCollection(id, changes) {
  const i = data.collections.findIndex(c => c.id === id);
  if (i < 0) return null;
  const col = { ...data.collections[i], ...changes };
  if (changes.name !== undefined) col.name = String(changes.name).trim().slice(0, 60) || data.collections[i].name;
  data.collections = data.collections.map(c => (c.id === id ? col : c));
  write(snap => backend.putCollection(col, snap));
  emit();
  return col;
}

export function toggleInCollection(id, verseId) {
  const col = data.collections.find(c => c.id === id);
  if (!col) return null;
  const has = col.verseIds.includes(verseId);
  updateCollection(id, { verseIds: has ? col.verseIds.filter(v => v !== verseId) : [...col.verseIds, verseId] });
  return !has;
}

export function deleteCollection(id) {
  data.collections = data.collections.filter(c => c.id !== id);
  write(snap => backend.removeCollection(id, snap));
  emit();
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
// Kept in localStorage so it survives opening an email-confirmation link in a new tab.
export function setPending(action) { storage.set("pending", { action, at: Date.now() }); }
export function takePending() {
  const p = storage.get("pending");
  storage.remove("pending");
  return p && Date.now() - p.at < 86400000 ? p.action : null;
}
