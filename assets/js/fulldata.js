// Optional: the complete Gita from an external public dataset, loaded only when
// someone looks up a verse outside the curated library.
import { CONFIG } from "./config.js";

let promise = null;

function normalize(v) {
  const ch = Number(v.chapter ?? v.chapter_number);
  const vv = Number(v.verse ?? v.verse_number);
  return {
    id: `${ch}.${vv}`, ch, v: vv,
    sa: v.sanskrit || v.text || v.slok || "",
    tr: v.transliteration || "",
    en: v.english || v.translation || v.english_alt || ""
  };
}

export function loadFullGita() {
  if (!CONFIG.fullDatasetUrl) return Promise.reject(new Error("No dataset configured."));
  if (!promise) {
    promise = fetch(CONFIG.fullDatasetUrl)
      .then(r => { if (!r.ok) throw new Error("Could not load the full Gita."); return r.json(); })
      .then(data => {
        const map = new Map();
        for (const raw of (data.verses || data)) {
          const v = normalize(raw);
          if (v.ch && v.v && v.sa) map.set(v.id, v);
        }
        return map;
      })
      .catch(err => { promise = null; throw err; });
  }
  return promise;
}
