const DATA_URL = "https://chiragmirani.github.io/gita-quotes/data.json";
const API_URL = "/api/gita";

const form = document.getElementById("gita-form");
const input = document.getElementById("trouble-input");
const submitBtn = document.getElementById("submit-btn");
const result = document.getElementById("result");
const resultInner = document.getElementById("result-inner");

let verses = [];
let dataPromise = null;

const themeMap = {
  tired: ["effort", "work", "duty", "action", "sleep", "rest", "energy", "endurance", "fruit"],
  exhausted: ["effort", "work", "duty", "action", "sleep", "rest", "endurance"],
  overwhelmed: ["mind", "peace", "calm", "equanimity", "action", "duty", "fear"],
  fear: ["fear", "courage", "knowledge", "refuge", "peace", "self"],
  scared: ["fear", "courage", "refuge", "knowledge", "peace"],
  future: ["fruit", "result", "action", "duty", "uncertainty", "knowledge"],
  failure: ["result", "action", "fruit", "duty", "equanimity", "success"],
  failed: ["result", "action", "fruit", "duty", "equanimity", "success"],
  useless: ["self", "soul", "duty", "action", "knowledge"],
  overthinking: ["mind", "thought", "meditation", "peace", "calm", "control"],
  anxious: ["mind", "fear", "peace", "calm", "equanimity"],
  anxiety: ["mind", "fear", "peace", "calm", "equanimity"],
  angry: ["anger", "desire", "mind", "control", "peace"],
  anger: ["anger", "desire", "mind", "control", "peace"],
  lonely: ["self", "friend", "compassion", "devotion", "peace"],
  alone: ["self", "friend", "compassion", "devotion", "peace"],
  grief: ["sorrow", "death", "change", "soul", "knowledge"],
  sad: ["sorrow", "grief", "knowledge", "peace", "self"],
  attachment: ["attachment", "desire", "action", "detachment", "fruit"],
  attached: ["attachment", "desire", "detachment", "fruit"],
  confused: ["confusion", "knowledge", "duty", "action", "wisdom"],
  confusion: ["confusion", "knowledge", "duty", "action", "wisdom"],
  purpose: ["duty", "action", "self", "knowledge", "devotion"],
  motivation: ["action", "duty", "effort", "knowledge", "discipline"],
  discipline: ["discipline", "mind", "meditation", "action", "control"],
  peace: ["peace", "equanimity", "mind", "desire", "detachment"],
  letting: ["detachment", "fruit", "desire", "action", "renunciation"],
  change: ["change", "soul", "body", "death", "knowledge"],
  death: ["soul", "death", "change", "knowledge"],
  life: ["soul", "duty", "action", "knowledge", "devotion"],
  work: ["work", "action", "duty", "fruit", "discipline"],
  relationship: ["attachment", "desire", "compassion", "anger", "mind"],
  love: ["devotion", "compassion", "love", "self", "peace"]
};

const hindiThemes = {
  थका: ["tired", "effort", "work", "duty"],
  थकान: ["tired", "effort", "work", "rest"],
  परेशान: ["overwhelmed", "mind", "peace", "fear"],
  डर: ["fear", "courage", "peace"],
  भय: ["fear", "courage", "knowledge"],
  भविष्य: ["future", "fruit", "action"],
  असफल: ["failure", "result", "action"],
  हार: ["failure", "result", "equanimity"],
  गुस्सा: ["anger", "mind", "control"],
  क्रोध: ["anger", "desire", "mind"],
  अकेला: ["lonely", "self", "compassion"],
  दुख: ["sad", "grief", "peace"],
  दुःख: ["sad", "grief", "peace"],
  चिंता: ["anxiety", "fear", "peace"],
  चिंतित: ["anxiety", "fear", "peace"],
  उलझन: ["confusion", "knowledge", "duty"],
  भ्रम: ["confusion", "knowledge", "wisdom"],
  उद्देश्य: ["purpose", "duty", "action"],
  शांति: ["peace", "equanimity", "mind"],
  मोह: ["attachment", "desire", "detachment"],
  आसक्ति: ["attachment", "detachment", "fruit"],
  जीवन: ["life", "soul", "duty"],
  मृत्यु: ["death", "soul", "change"],
  प्रेम: ["love", "devotion", "compassion"]
};

function normalizeVerse(v) {
  return {
    id: v.id || `BG${v.chapter}.${v.verse}`,
    chapter: Number(v.chapter),
    verse: Number(v.verse),
    sanskrit: v.sanskrit || v.text || "",
    english: v.english || v.translation || v.english_alt || "",
    transliteration: v.transliteration || ""
  };
}

async function loadVerses() {
  if (verses.length) return verses;
  if (!dataPromise) {
    dataPromise = fetch(DATA_URL)
      .then(r => {
        if (!r.ok) throw new Error("Could not load Gita data.");
        return r.json();
      })
      .then(data => {
        verses = (data.verses || data).map(normalizeVerse).filter(v => v.sanskrit && v.english);
        return verses;
      });
  }
  return dataPromise;
}

function getThemes(text) {
  const lower = text.toLowerCase();
  const themes = new Set();

  for (const [word, tags] of Object.entries(themeMap)) {
    if (lower.includes(word)) tags.forEach(t => themes.add(t));
  }

  for (const [word, tags] of Object.entries(hindiThemes)) {
    if (text.includes(word)) tags.forEach(t => themes.add(t));
  }

  if (!themes.size) {
    ["mind", "action", "knowledge", "peace", "duty", "detachment"].forEach(t => themes.add(t));
  }
  return [...themes];
}

function candidateVerses(text) {
  const themes = getThemes(text);
  const words = text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);

  return verses
    .map(v => {
      const hay = `${v.english} ${v.transliteration}`.toLowerCase();
      let score = 0;
      for (const word of words) if (hay.includes(word)) score += 2;
      for (const theme of themes) if (hay.includes(theme)) score += 1.5;
      return { ...v, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 18);
}

function isCrisis(text) {
  const t = text.toLowerCase();
  const phrases = [
    "don't want to live", "dont want to live", "do not want to live",
    "don't feel like living", "dont feel like living", "no reason to live",
    "want to die", "wanna die", "kill myself", "end my life",
    "suicide", "self harm", "hurt myself", "life is not worth living",
    "जीने का मन नहीं", "जीना नहीं", "मरना", "आत्महत्या", "खुद को नुकसान"
  ];
  return phrases.some(p => t.includes(p));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[ch]));
}

function showLoading() {
  result.hidden = false;
  resultInner.innerHTML = `
    <div class="result-card loading">
      <div class="pulse"></div>
      <div>Finding a shlok that speaks to your situation…</div>
    </div>`;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showError(message) {
  result.hidden = false;
  resultInner.innerHTML = `<div class="result-card"><div class="error">${escapeHtml(message)}</div></div>`;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSafety() {
  result.hidden = false;
  resultInner.innerHTML = `
    <article class="result-card safety">
      <div class="result-label">Please pause for a moment</div>
      <h2>You don't have to carry this alone.</h2>
      <p style="color:#dce3f0;line-height:1.8">
        If you feel you may hurt yourself or you don't feel safe right now,
        please move away from anything you could use to hurt yourself and get
        another person with you. A trusted friend, family member, teacher, or
        professional can stay with you through this moment.
      </p>
      <p style="color:#dce3f0;line-height:1.8">
        In India, <strong>Tele-MANAS</strong> provides 24×7 mental-health support:
      </p>
      <a class="help-number" href="tel:14416">14416</a>
      <div class="source">This safety message is separate from the Gita guidance. The site should never treat a scripture verse as a substitute for immediate crisis support.</div>
    </article>`;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function askAI(userText, candidates) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userText,
      candidates: candidates.map(v => ({
        id: v.id,
        chapter: v.chapter,
        verse: v.verse,
        sanskrit: v.sanskrit,
        english: v.english
      }))
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The guidance service is not available yet.");
  return data;
}

function renderResult(data) {
  const v = data.verse;
  result.hidden = false;
  resultInner.innerHTML = `
    <article class="result-card">
      <div class="result-label">A shlok for you</div>
      <h2>Remember this.</h2>
      <div class="reference">Bhagavad Gita • Chapter ${escapeHtml(v.chapter)}, Verse ${escapeHtml(v.verse)}</div>

      <div class="sanskrit">${escapeHtml(v.sanskrit)}</div>

      <div class="meaning-grid">
        <div class="meaning">
          <h3>हिन्दी अर्थ</h3>
          <p>${escapeHtml(data.hindi)}</p>
        </div>
        <div class="meaning">
          <h3>English meaning</h3>
          <p>${escapeHtml(data.english)}</p>
        </div>
      </div>

      <div class="why">
        <h3>Why this may speak to you</h3>
        <p>${escapeHtml(data.why)}</p>
      </div>

      <div class="source">
        Sanskrit and English verse data: Vedic Scriptures / Gita Quotes dataset.
        English translation shown here is attributed to Shri Purohit Swami (1935).
        The Hindi meaning and “why this may speak to you” text are generated for this interaction.
      </div>
    </article>`;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  if (isCrisis(text)) {
    renderSafety();
    return;
  }

  submitBtn.disabled = true;
  input.disabled = true;
  showLoading();

  try {
    await loadVerses();
    const candidates = candidateVerses(text);

    if (!candidates.length) throw new Error("I couldn't load the Gita verses. Please try again.");

    const data = await askAI(text, candidates);
    renderResult(data);
  } catch (error) {
    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    submitBtn.disabled = false;
    input.disabled = false;
  }
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
    input.dispatchEvent(new Event("input"));
  });
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 100)}px`;
});
