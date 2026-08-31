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
    whyEn: "If you’re feeling tired, you don’t have to carry the weight of everything at once. Focus on the step that is in front of you, and let the rest unfold with time.", whyHi: "अगर आप बहुत थक गए हैं, तो हर चीज़ का बोझ एक साथ उठाना ज़रूरी नहीं है। इस समय जो आपके सामने है, बस उस पर ध्यान दें और बाकी चीज़ों को धीरे-धीरे अपने समय पर होने दें।"
  },
  mind: {
    hindi: "मन को अभ्यास और संयम के द्वारा धीरे-धीरे स्थिर किया जा सकता है।",
    english: "The teaching points toward steadiness of the mind through practice, discipline and self-awareness.",
    whyEn: "When your thoughts feel overwhelming, remember that you don’t have to solve everything at once. With patience and practice, the mind can become steadier.", whyHi: "जब विचार बहुत ज़्यादा परेशान करने लगें, तो याद रखें कि हर बात का हल एक साथ निकालना ज़रूरी नहीं है। धैर्य और अभ्यास के साथ मन को धीरे-धीरे शांत और स्थिर किया जा सकता है।"
  },
  fear: {
    hindi: "ज्ञान, आत्मबोध और अपने कर्तव्य पर टिके रहना भय के बीच भी भीतर स्थिरता ला सकता है।",
    english: "The teaching encourages clarity, self-knowledge and steadiness in the face of fear and uncertainty.",
    whyEn: "When fear makes the future feel uncertain, come back to what you can understand and do today. You only need to take the next step.", whyHi: "जब डर की वजह से भविष्य अनिश्चित और भारी लगने लगे, तो वापस उस पर ध्यान दें जिसे आप आज समझ और कर सकते हैं। आपको बस अगला कदम उठाना है।"
  },
  peace: {
    hindi: "शांति बाहरी परिस्थितियों को पूरी तरह नियंत्रित करने से नहीं, बल्कि भीतर की आसक्ति और अस्थिरता को समझने से भी जुड़ी है।",
    english: "The teaching connects peace with understanding desire, attachment and the movements of the mind.",
    whyEn: "If you’re looking for peace, gently notice what is disturbing your mind instead of fighting every thought. Sometimes, peace begins with accepting what you cannot control.", whyHi: "अगर आप मन की शांति चाहते हैं, तो हर विचार से लड़ने के बजाय धीरे से देखें कि आपका मन किस बात से परेशान है। कई बार शांति वहीं से शुरू होती है जहाँ हम उन चीज़ों को स्वीकार करना सीखते हैं जिन्हें हम नियंत्रित नहीं कर सकते।"
  },
  detachment: {
    hindi: "आसक्ति को छोड़ना उदासीन होना नहीं है; यह कर्म करते हुए परिणाम से स्वयं को बाँधने से बचना है।",
    english: "The teaching distinguishes wholehearted action from becoming bound to the outcome of that action.",
    whyEn: "Letting go doesn’t mean that you stop caring. It means doing what you can with sincerity while releasing the need to control every outcome.", whyHi: "किसी चीज़ को छोड़ देना यह नहीं है कि आपको उसकी परवाह नहीं रही। इसका अर्थ है कि आप पूरी ईमानदारी से अपना प्रयास करें और हर परिणाम को अपने नियंत्रण में रखने की ज़रूरत छोड़ दें।"
  },
  knowledge: {
    hindi: "स्पष्ट ज्ञान और आत्मबोध भ्रम के बीच दिशा देने वाले प्रकाश की तरह हैं।",
    english: "The teaching places value on clear understanding and self-knowledge when confusion clouds judgment.",
    whyEn: "When you feel confused, give yourself permission to pause. Clarity often comes when we separate what we truly know from what fear or overthinking is telling us.", whyHi: "जब आप उलझन में हों, तो खुद को थोड़ा रुकने का समय दें। स्पष्टता अक्सर तब आती है जब हम अपनी वास्तविक समझ को डर और ज़्यादा सोचने से अलग करके देखते हैं।"
  },
  duty: {
    hindi: "अपने कर्तव्य और वर्तमान जिम्मेदारी पर ईमानदारी से टिके रहना गीता की केंद्रीय शिक्षाओं में से एक है।",
    english: "The teaching emphasizes sincerely engaging with one's responsibility and present action.",
    whyEn: "When everything feels like too much, bring your attention back to the one thing you can do right now. You don’t have to finish the whole journey today.", whyHi: "जब सब कुछ बहुत ज़्यादा लगने लगे, तो अपना ध्यान उस एक काम पर वापस लाएँ जो आप अभी कर सकते हैं। पूरी यात्रा आज ही पूरी करना ज़रूरी नहीं है।"
  },
  soul: {
    hindi: "गीता आत्मा को शरीर और परिस्थितियों से परे एक गहरे, स्थायी सत्य के रूप में देखती है।",
    english: "The teaching presents the self or soul as deeper than the changing body and circumstances.",
    whyEn: "If change or loss is hurting you, this teaching offers the Gita’s perspective that our deepest self is more than the things that change around us.", whyHi: "अगर बदलाव या किसी को खोने का दुख आपको भीतर से परेशान कर रहा है, तो गीता यह दृष्टिकोण देती है कि हमारा गहरा अस्तित्व हमारे आसपास बदलने वाली चीज़ों से कहीं अधिक है।"
  },
  devotion: {
    hindi: "समर्पण और भक्ति के माध्यम से मन को एक गहरे आधार और अर्थ की ओर मोड़ा जा सकता है।",
    english: "The teaching presents devotion and surrender as ways of orienting the mind toward a deeper source of meaning.",
    whyEn: "If you feel lost or without direction, reconnecting with what you deeply value can give the heart a sense of meaning and steadiness.", whyHi: "अगर आपको लग रहा है कि आप रास्ता भटक गए हैं, तो उन चीज़ों और मूल्यों से दोबारा जुड़ना जो आपके लिए सच में मायने रखते हैं, मन को अर्थ और स्थिरता दे सकता है।"
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
  // Hindi/Devanagari is supported directly; matching does not require English.

  const lower = text.toLowerCase();
  const themes = new Set();

  for (const [word, tags] of Object.entries(themeMap)) {
    if (lower.includes(word)) tags.forEach(t => themes.add(t));
  }
  for (const [word, tags] of Object.entries(hindiThemes)) {
    if (text.includes(word)) tags.forEach(t => themes.add(t));
  }

  // Natural Hindi/Hinglish phrases people commonly type.
  const phraseThemes = [
    [/थक(ा|ी|े)? गया|थक(ा|ी|े)? गई|thak gaya|thak gayi|bahut tired|very tired/i, ["tired","effort","rest"]],
    [/परेशान हूँ|परेशान हूं|बहुत परेशान|pareshan hoon|pareshan hun|bahut pareshan/i, ["overwhelmed","peace","mind"]],
    [/समझ नहीं आ रहा|समझ नहीं आता|samajh nahi aa raha|samajh nahi aata/i, ["confusion","knowledge","wisdom"]],
    [/क्या करूँ|क्या करूं|kya karu|kya karoon/i, ["confusion","duty","action"]],
    [/भविष्य.*चिंता|future.*tension|future.*worry|future ko lekar tension|bhavishya.*chinta/i, ["future","fear","action"]],
    [/डर लग|बहुत डर|dar lag|bahut dar|scared|afraid/i, ["fear","courage","peace"]],
    [/मन उदास|मन भारी|दिल उदास|mann udaas|man udaas|dil udaas|feeling low|feel low/i, ["sad","grief","peace"]],
    [/बहुत सोच|ज्यादा सोच|ज़्यादा सोच|overthink|overthinking|soch.*nahi ruk/i, ["overthinking","mind","peace"]],
    [/गुस्सा|क्रोध|gussa|gusse|angry|anger/i, ["anger","mind","control"]],
    [/अकेला|अकेली|अकेलापन|akela|akeli|akelapan|lonely|alone/i, ["lonely","self","compassion"]],
    [/निराश|उम्मीद नहीं|nirash|umeed nahi|hopeless|hopelessness/i, ["sad","peace","self"]],
    [/खुद पर शक|मुझ पर भरोसा नहीं|khud par shak|confidence nahi|self doubt|doubt myself/i, ["self","knowledge","courage"]],
    [/उद्देश्य|मकसद|मेरा purpose|purpose nahi|uddeshya|purpose/i, ["purpose","duty","action"]],
    [/शांति चाहिए|मन की शांति|shanti chahiye|mann ki shanti|peace chahiye/i, ["peace","equanimity","mind"]],
    [/छोड़ नहीं पा|छोड़ना मुश्किल|chhod nahi pa|chhodna mushkil|can't let go|cannot let go/i, ["detachment","attachment","peace"]],
    [/जीवन|जिंदगी|zindagi|jeevan|life/i, ["life","soul","knowledge"]]
  ];
  for (const [pattern, tags] of phraseThemes) {
    if (pattern.test(text)) tags.forEach(t => themes.add(t));
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
        <p><strong>English:</strong> ${escapeHtml(g.whyEn || g.why || "")}</p>
        <p><strong>हिंदी:</strong> ${escapeHtml(g.whyHi || "")}</p>
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
