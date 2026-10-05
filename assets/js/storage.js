// Safe wrappers around localStorage / sessionStorage (they can throw in private mode).
const PREFIX = "gr.";
const memory = new Map();

function make(getStore) {
  return {
    get(key, fallback = null) {
      try {
        const raw = getStore().getItem(PREFIX + key);
        return raw == null ? (memory.has(key) ? memory.get(key) : fallback) : JSON.parse(raw);
      } catch {
        return memory.has(key) ? memory.get(key) : fallback;
      }
    },
    set(key, value) {
      memory.set(key, value);
      try { getStore().setItem(PREFIX + key, JSON.stringify(value)); } catch { /* memory only */ }
    },
    remove(key) {
      memory.delete(key);
      try { getStore().removeItem(PREFIX + key); } catch { /* ignore */ }
    }
  };
}

export const storage = make(() => localStorage);
export const session = make(() => sessionStorage);
