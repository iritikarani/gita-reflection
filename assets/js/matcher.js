// Matches what someone shares to a relevant verse.
// Runs entirely in the browser: nothing the user types is sent anywhere.
import { VERSES, VERSE_BY_ID, CATEGORIES } from "./data/verses.js";
import { EMOTIONS, CATEGORY_GROUP, detectEmotions } from "./data/emotions.js";
import { pick } from "./i18n.js";

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function scoreVerse(verse, tags, words) {
  let score = 0;
  tags.forEach((tag, i) => {
    // Earlier tags matter more.
    if (verse.tags.includes(tag)) score += 3 - Math.min(2, i * 0.35);
  });
  const hay = `${verse.tags.join(" ")} ${verse.en} ${verse.helps}`.toLowerCase();
  for (const w of words) if (w.length > 3 && hay.includes(w)) score += 0.6;
  return score;
}

// Rank verses for an emotion and/or free text.
export function rankVerses({ text = "", emotion = null }) {
  const detected = emotion ? [emotion] : detectEmotions(text);
  const primary = detected[0] || "general";
  const tags = [];
  detected.slice(0, 3).forEach(key => (EMOTIONS[key]?.tags || []).forEach(t => { if (!tags.includes(t)) tags.push(t); }));
  if (!tags.length) tags.push(...EMOTIONS.general.tags);

  const words = String(text).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const seed = hash(`${text}|${emotion}|${new Date().toDateString()}`);

  const ranked = VERSES
    .map(v => ({ v, s: scoreVerse(v, tags, words) + ((hash(v.id + seed) % 100) / 1000) }))
    .sort((a, b) => b.s - a.s)
    .map(x => x.v);

  return { emotion: primary, detected, ranked };
}


// Build a complete reflection: verse + why + one question.
export function buildReflection({ text = "", emotion = null, exclude = [] }) {
  const { emotion: key, ranked } = rankVerses({ text, emotion });
  const verse = ranked.find(v => !exclude.includes(v.id)) || ranked[0];
  const e = EMOTIONS[key] || EMOTIONS.general;
  const seed = hash(`${text}${verse.id}`);
  // Prefer the emotion's question; alternate with the verse's own question for variety.
  const qref = (exclude.length % 2 === 1) ? { k: "verse" } : { k: "emotion", i: seed % e.questions.length };
  const question = qref.k === "verse" ? pick(verse, "question") : pick(e, "questions")[qref.i];
  return {
    qref,
    said: text || pick(e, "said"),
    emotion: key,
    verseId: verse.id,
    why: `${pick(e, "bridge")} ${pick(verse, "invite")}`,
    question,
    group: groupForVerse(verse, key),
    createdAt: Date.now()
  };
}

// Text of a reflection in the current language (it may have been created in the other one).
export function localizeReflection(r) {
  const e = EMOTIONS[r.emotion] || EMOTIONS.general;
  const verse = VERSE_BY_ID[r.verseId];
  if (!verse) return r;
  const question = r.qref?.k === "emotion" ? pick(e, "questions")[r.qref.i] : r.qref?.k === "verse" ? pick(verse, "question") : r.question;
  const said = r.input?.text ? r.said : (r.input?.emotion ? pick(EMOTIONS[r.input.emotion], "said") : r.said);
  return { ...r, why: `${pick(e, "bridge")} ${pick(verse, "invite")}`, question, said };
}

export function groupForVerse(verse, emotionKey) {
  if (emotionKey && EMOTIONS[emotionKey] && emotionKey !== "general") return EMOTIONS[emotionKey].group;
  return CATEGORY_GROUP[verse.cats[0]] || "peace";
}

// ---- Daily Gita: one verse per calendar day, the same for everyone ----
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

export function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

export function dailyVerse(date = new Date()) {
  const n = VERSES.length;
  let stride = 7;
  while (gcd(stride, n) !== 1) stride++;
  return VERSES[(dayNumber(date) * stride) % n];
}

// ---- Library search ----
export function searchVerses(query, category) {
  const q = String(query || "").trim().toLowerCase();
  let list = category ? VERSES.filter(v => v.cats.includes(category)) : VERSES.slice();
  if (!q) return { list, exactRef: null };

  // Chapter/verse lookups: "2.47", "2 47", "bg 2.47", "chapter 6", "ch 6 verse 5"
  const ref = q.match(/^(?:bg\s*)?(?:ch(?:apter)?\s*)?(\d{1,2})(?:\s*[.:,\s-]\s*(?:v(?:erse)?\s*)?(\d{1,3}))?$/);
  if (ref) {
    const ch = Number(ref[1]);
    const vv = ref[2] ? Number(ref[2]) : null;
    const matches = list.filter(v => v.ch === ch && (vv === null || v.v === vv));
    return { list: matches, exactRef: vv ? { ch, v: vv } : null, chapter: ch };
  }

  const detected = detectEmotions(q);
  const emoTags = detected.flatMap(k => EMOTIONS[k]?.tags || []);
  const catHit = CATEGORIES.filter(c => c.label.toLowerCase().includes(q) || c.id.includes(q) || (c.hiText && c.hiText.label.includes(q))).map(c => c.id);
  const words = q.split(/\s+/).filter(w => w.length > 1);

  const scored = list.map(v => {
    let s = 0;
    const h = v.hiText || {};
    const hay = `${v.en} ${v.meaning} ${v.helps} ${v.tags.join(" ")} ${v.cats.join(" ")} ${v.tr} ${v.hi} ${h.meaning || ""} ${h.helps || ""}`.toLowerCase();
    for (const w of words) if (hay.includes(w)) s += 2;
    for (const t of emoTags) if (v.tags.includes(t)) s += 1;
    for (const c of catHit) if (v.cats.includes(c)) s += 3;
    if (v.hi.includes(query) || v.sa.includes(query)) s += 3;
    return { v, s };
  }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);

  return { list: scored.map(x => x.v), exactRef: null };
}

export function relatedVerses(verse, count = 3) {
  return VERSES
    .filter(v => v.id !== verse.id)
    .map(v => ({ v, s: v.cats.filter(c => verse.cats.includes(c)).length * 2 + v.tags.filter(t => verse.tags.includes(t)).length }))
    .sort((a, b) => b.s - a.s)
    .slice(0, count)
    .map(x => x.v);
}

export { VERSE_BY_ID };
