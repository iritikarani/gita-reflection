// Local provider: accounts and reflections live only in this browser.
// Passwords are hashed with PBKDF2 and never leave the device.
// Used automatically when Supabase is not configured.
import { storage } from "../storage.js";

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

const users = () => storage.get("users", {});
const saveUsers = u => storage.set("users", u);

function userFor(email) {
  const u = users()[email];
  return u ? { id: email, email, name: u.name, plan: u.plan || "free", createdAt: u.createdAt } : null;
}

function load(email) { return storage.get(`data.${email}`, {}); }

export function createLocalBackend() {
  let me = null;
  const persist = data => { if (me) storage.set(`data.${me.id}`, data); };

  return {
    mode: "local",

    async init() {
      const email = storage.get("session");
      me = email ? userFor(email) : null;
      return { user: me, data: me ? load(me.id) : null };
    },

    async signUp({ name, email, password }) {
      const all = users();
      if (all[email]) throw new Error("An account with this email already exists on this device. Try logging in instead.");
      const { salt, hash } = await hashPassword(password);
      all[email] = { name, salt, hash, plan: "free", createdAt: Date.now() };
      saveUsers(all);
      storage.set("session", email);
      me = userFor(email);
      return { user: me, data: load(email) };
    },

    async logIn({ email, password }) {
      const u = users()[email];
      if (!u) throw new Error("We couldn't find that email and password on this device.");
      const { hash } = await hashPassword(password, u.salt);
      if (hash !== u.hash) throw new Error("We couldn't find that email and password on this device.");
      storage.set("session", email);
      me = userFor(email);
      return { user: me, data: load(email) };
    },

    async logOut() { storage.remove("session"); me = null; },

    accountExists: email => Boolean(users()[email]),

    // No email server: reset happens on the device that holds the account.
    async resetPassword({ email, password }) {
      const all = users();
      if (!all[email]) throw new Error("We couldn't find an account with that email on this device.");
      const { salt, hash } = await hashPassword(password);
      all[email] = { ...all[email], salt, hash };
      saveUsers(all);
      storage.set("session", email);
      me = userFor(email);
      return { user: me, data: load(email) };
    },

    async updateName(name) {
      const all = users();
      all[me.id].name = name;
      saveUsers(all);
      me = userFor(me.id);
      return me;
    },

    async setPlan(plan) {
      const all = users();
      all[me.id].plan = plan;
      saveUsers(all);
      me = userFor(me.id);
      return me;
    },

    async deleteAccount() {
      const all = users();
      delete all[me.id];
      saveUsers(all);
      storage.remove(`data.${me.id}`);
      storage.remove("session");
      me = null;
    },

    // Writes: the whole data object is kept as one blob.
    putReflection: (r, data) => persist(data),
    removeReflection: (id, data) => persist(data),
    setSavedVerse: (id, saved, data) => persist(data),
    putJourneyEntry: (day, entry, data) => persist(data),
    clearJourney: data => persist(data),
    setJourneyFinished: (ts, data) => persist(data),
    putMonthNote: (key, text, data) => persist(data)
  };
}
