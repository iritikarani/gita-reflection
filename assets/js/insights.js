// Gentle, non-diagnostic patterns from saved reflections.
import { GROUPS } from "./data/emotions.js";

export function groupCounts(reflections) {
  const counts = {};
  for (const r of reflections) if (r.group) counts[r.group] = (counts[r.group] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// "Your recent reflections have often been around uncertainty and letting go."
// We describe themes of reflection — never the person.
export function patternSentence(reflections) {
  const recent = reflections.slice(0, 12);
  if (recent.length < 3) return null;
  const top = groupCounts(recent).filter(([, n]) => n >= 2).slice(0, 2)
    .map(([id]) => GROUPS.find(g => g.id === id)?.pattern).filter(Boolean);
  if (!top.length) return "Your recent reflections have touched many different themes.";
  return `Your recent reflections have often been around ${top.join(" and ")}.`;
}

const STOP = new Set(("a about above after again all am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours out over own same she should so some such than that the their theirs them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself im ive dont cant its it's i'm i've don't can't feel feeling really also maybe much many like get got one even still today thing things something want know think make way going " +
  "है हैं था थी थे को का की के में से और भी पर यह वह मैं मुझे मेरा मेरी तो ही नहीं कि जो एक कर रहा रही हो गया गई").split(/\s+/));

export function frequentWords(reflections, limit = 12) {
  const counts = {};
  for (const r of reflections) {
    const words = String(r.text || "").toLowerCase().replace(/[^\p{L}\p{M}\s']/gu, " ").split(/\s+/);
    for (const w of words) {
      if (w.length < 3 || STOP.has(w)) continue;
      counts[w] = (counts[w] || 0) + 1;
    }
  }
  return Object.entries(counts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function monthKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
