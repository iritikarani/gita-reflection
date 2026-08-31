const DATA_URL = "https://chiragmirani.github.io/gita-quotes/data.json";

const form = document.getElementById("gita-form");
const input = document.getElementById("trouble-input");
const submitBtn = document.getElementById("submit-btn");
const result = document.getElementById("result");
const resultInner = document.getElementById("result-inner");

let verses = [];
let dataPromise = null;

const themeMap = {
  tired: ["effort","work","duty","action","rest","energy","endurance","fruit"],
  exhausted: ["effort","work","duty","action","rest","endurance"],
  overwhelmed: ["mind","peace","calm","equanimity","action","duty","fear"],
  fear: ["fear","courage","knowledge","refuge","peace","self"],
  scared: ["fear","courage","refuge","knowledge","peace"],
  future: ["fruit","result","action","duty","uncertainty","knowledge"],
  failure: ["result","action","fruit","duty","equanimity","success"],
  failed: ["result","action","fruit","duty","equanimity","success"],
  useless: ["self","soul","duty","action","knowledge"],
  overthinking: ["mind","thought","meditation","peace","calm","control"],
  anxious: ["mind","fear","peace","calm","equanimity"],
  anxiety: ["mind","fear","peace","calm","equanimity"],
  angry: ["anger","desire","mind","control","peace"],
  anger: ["anger","desire","mind","control","peace"],
  lonely: ["self","friend","compassion","devotion","peace"],
  alone: ["self","friend","compassion","devotion","peace"],
  grief: ["sorrow","death","change","soul","knowledge"],
  sad: ["sorrow","grief","knowledge","peace","self"],
  attachment: ["attachment","desire","action","detachment","fruit"],
  attached: ["attachment","desire","detachment","fruit"],
  confused: ["confusion","knowledge","duty","action","wisdom"],
  confusion: ["confusion","knowledge","duty","action","wisdom"],
  purpose: ["duty","action","self","knowledge","devotion"],
  motivation: ["action","duty","effort","knowledge","discipline"],
  discipline: ["discipline","mind","meditation","action","control"],
  peace: ["peace","equanimity","mind","desire","detachment"],
  letting: ["detachment","fruit","desire","action","renunciation"],
  change: ["change","soul","body","death","knowledge"],
  death: ["soul","death","change","knowledge"],
  life: ["soul","duty","action","knowledge","devotion"],
  work: ["work","action","duty","fruit","discipline"],
  relationship: ["attachment","desire","compassion","anger","mind"],
  love: ["devotion","compassion","love","self","peace"]
};

const hindiThemes = {
  थका:["tired","effort","work","duty"], थकान:["tired","effort","work","rest"],
  परेशान:["overwhelmed","mind","peace","fear"], डर:["fear","courage","peace"],
  भय:["fear","courage","knowledge"], भविष्य:["future","fruit","action"],
  असफल:["failure","result","action"], हार:["failure","result","equanimity"],
  गुस्सा:["anger","mind","control"], क्रोध:["anger","desire","mind"],
  अकेला:["lonely","self","compassion"], दुख:["sad","grief","peace"],
  दुःख:["sad","grief","peace"], चिंता:["anxiety","fear","peace"],
  चिंतित:["anxiety","fear","peace"], उलझन:["confusion","knowledge","duty"],
  भ्रम:["confusion","knowledge","wisdom"], उद्देश्य:["purpose","duty","action"],
  शांति:["peace","equanimity","mind"], मोह:["attachment","desire","detachment"],
  आसक्ति:["attachment","detachment","fruit"], जीवन:["life","soul","duty"],
  मृत्यु:["death","soul","change"], प्रेम:["love","devotion","compassion"]
};

const guidance = {
  effort: {
    hindi: "अपने कर्म पर ध्यान देना और उसके परिणाम की चिंता में स्वयं को खो न देना इस शिक्षा का एक मुख्य संदेश है।",
    english: "The teaching emphasizes sincere action without allowing attachment to the result to disturb your inner balance.",
    why: "If you feel tired, this can be a gentle reminder to focus on the step that is in front of you rather than carrying the weight of every future result at once."
  },
  mind: {
    hindi: "मन को अभ्यास और संयम के द्वारा धीरे-धीरे स्थिर किया जा सकता है।",
    english: "The teaching points toward steadiness of the mind through practice, discipline and self-awareness.",
    why: "If your thoughts feel overwhelming, this teaching can remind you that you do not have to solve every thought immediately. Steadiness can be developed one moment at a time."
  },
  fear: {
    hindi: "ज्ञान, आत्मबोध और अपने कर्तव्य पर टिके रहना भय के बीच भी भीतर स्थिरता ला सकता है।",
    english: "The teaching encourages clarity, self-knowledge and steadiness in the face of fear and uncertainty.",
    why: "When fear is making the future feel larger than the present, this can be a reminder to return to what you can understand and do right now."
  },
  peace: {
    hindi: "शांति बाहरी परिस्थितियों को पूरी तरह नियंत्रित करने से नहीं, बल्कि भीतर की आसक्ति और अस्थिरता को समझने से भी जुड़ी है।",
    english: "The teaching connects peace with understanding desire, attachment and the movements of the mind.",
    why: "If you are searching for peace, this teaching can invite you to notice what is pulling your mind in different directions and gently return to balance."
  },
  detachment: {
    hindi: "आसक्ति को छोड़ना उदासीन होना नहीं है; यह कर्म करते हुए परिणाम से स्वयं को बाँधने से बचना है।",
    english: "The teaching distinguishes wholehearted action from becoming bound to the outcome of that action.",
    why: "If you are struggling to let go, this may offer a different way to look at release: you can care deeply and still stop trying to control every outcome."
  },
  knowledge: {
    hindi: "स्पष्ट ज्ञान और आत्मबोध भ्रम के बीच दिशा देने वाले प्रकाश की तरह हैं।",
    english: "The teaching places value on clear understanding and self-knowledge when confusion clouds judgment.",
    why: "When you do not know what to do, this can be a reminder to pause, seek clarity and separate what you know from what fear is telling you."
  },
  duty: {
    hindi: "अपने कर्तव्य और वर्तमान जिम्मेदारी पर ईमानदारी से टिके रहना गीता की केंद्रीय शिक्षाओं में से एक है।",
    english: "The teaching emphasizes sincerely engaging with one's responsibility and present action.",
    why: "When everything feels too much, narrowing your attention to the responsibility immediately in front of you can make the next step feel more manageable."
  },
  soul: {
    hindi: "गीता आत्मा को शरीर और परिस्थितियों से परे एक गहरे, स्थायी सत्य के रूप में देखती है।",
    english: "The teaching presents the self or soul as deeper than the changing body and circumstances.",
    why: "If change or loss is weighing on you, this teaching offers the Gita's perspective that what changes outwardly does not define the whole of the self."
  },
  devotion: {
    hindi: "समर्पण और भक्ति के माध्यम से मन को एक गहरे आधार और अर्थ की ओर मोड़ा जा सकता है।",
    english: "The teaching presents devotion and surrender as ways of orienting the mind toward a deeper source of meaning.",
    why: "If you feel directionless, this can be an invitation to reconnect with what you deeply value rather than measuring yourself only through immediate success."
  }
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
        verses = (data.verses || data).map(normalizeVerse)
          .filter(v => v.sanskrit && v.english);
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
    ["mind","action","knowledge","peace","duty","detachment"].forEach(t => themes.add(t));
  }
  return [...themes];
}

function candidateVerses(text) {
  const themes = getThemes(text);
  const words = text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);

  return verses.map(v => {
    const hay = `${v.english} ${v.transliteration}`.toLowerCase();
    let score = 0;
    for (const word of words) if (hay.includes(word)) score += 2;
    for (const theme of themes) if (hay.includes(theme)) score += 1.5;
    return {...v, score};
  }).sort((a,b) => b.score - a.score).slice(0, 12);
}

function isCrisis(text) {
  const t = text.toLowerCase();
  return [
    "don't want to live","dont want to live","do not want to live",
    "don't feel like living","dont feel like living","no reason to live",
    "want to die","wanna die","kill myself","end my life","suicide",
    "self harm","hurt myself","life is not worth living",
    "जीने का मन नहीं","जीना नहीं","मरना","आत्महत्या","खुद को नुकसान"
  ].some(p => t.includes(p));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function showLoading() {
  result.hidden = false;
  resultInner.innerHTML = `
    <div class="result-card loading">
      <div class="pulse"></div>
      <div>Finding a shlok that speaks to your situation…</div>
    </div>`;
  result.scrollIntoView({behavior:"smooth", block:"start"});
}

function showError(message) {
  result.hidden = false;
  resultInner.innerHTML = `<div class="result-card"><div class="error">${escapeHtml(message)}</div></div>`;
  result.scrollIntoView({behavior:"smooth", block:"start"});
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
  result.scrollIntoView({behavior:"smooth", block:"start"});
}

function pickGuidance(themes) {
  const available = themes.filter(t => guidance[t]);
  return guidance[available[0]] || guidance.mind;
}

function renderResult(v, themes) {
  const g = pickGuidance(themes);
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
          <p>${escapeHtml(g.hindi)}</p>
        </div>
        <div class="meaning">
          <h3>English meaning</h3>
          <p>${escapeHtml(g.english)}</p>
        </div>
      </div>
      <div class="why">
        <h3>Why this may speak to you</h3>
        <p>${escapeHtml(g.why)}</p>
      </div>
      <div class="source">
        Sanskrit and English verse data: Gita Quotes dataset.
        This version performs matching entirely in your browser; no AI API or personal input is sent to a server.
      </div>
    </article>`;
  result.scrollIntoView({behavior:"smooth", block:"start"});
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { input.focus(); return; }

  if (isCrisis(text)) { renderSafety(); return; }

  submitBtn.disabled = true;
  input.disabled = true;
  showLoading();

  try {
    await loadVerses();
    const candidates = candidateVerses(text);
    if (!candidates.length) throw new Error("I couldn't load the Gita verses. Please try again.");
    renderResult(candidates[0], getThemes(text));
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
