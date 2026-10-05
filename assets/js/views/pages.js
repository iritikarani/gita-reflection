import { esc, divider } from "../ui.js";
import { CONFIG } from "../config.js";
import { VERSES } from "../data/verses.js";

const c = CONFIG.crisis;

const PAGES = {
  about: () => `
    <p class="eyebrow">About</p>
    <h1>A quiet place to pause</h1>
    <p class="lead">Gita Reflection is a calm digital space for the moments when your mind feels heavy. You share what you're feeling, receive a relevant teaching from the Bhagavad Gita, and take a moment to reflect.</p>
    ${divider()}
    <h2>What we are</h2>
    <p>A reflection and educational tool inspired by the Bhagavad Gita — a 700-verse dialogue between Krishna and Arjuna that people across traditions have turned to for perspective in difficult moments.</p>
    <p>We are not a religious authority, and we don't ask you to believe anything. The Gita is offered here as a source of perspective, the way a wise friend might share a passage that once helped them.</p>
    <h2>What we are not</h2>
    <p>Gita Reflection is <strong>not a replacement for professional mental-health care</strong>, medical advice or therapy. Scripture can offer perspective, but it is not treatment. If you are struggling, please reach out to someone you trust or a qualified professional. In India, ${esc(c.name)} offers free, 24×7 support at <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>.</p>
    <h2>How we treat the text</h2>
    <p>Every teaching on this site is presented in clearly labelled layers, so the scripture is never confused with interpretation:</p>
    <dl class="layers-explained">
      <dt>Original Sanskrit</dt><dd>The verse as it appears in the Bhagavad Gita, in Devanagari, with IAST transliteration.</dd>
      <dt>Translation</dt><dd>An English rendering adapted for readability from the standard meaning of the verse, and a Hindi भावार्थ. Translations always involve choices; we aim to stay close to the text.</dd>
      <dt>Interpretation</dt><dd>“In simple words”, “Why this may speak to you”, context notes, reflection questions and practices are interpretations written for Gita Reflection. They are not scripture.</dd>
    </dl>
    <p>Our interpretive writing was drafted with the help of AI and is offered humbly. The site does <strong>not</strong> generate text with AI while you use it: your words are matched to a curated set of ${VERSES.length} verses by simple rules that run in your browser.</p>`,

  how: () => `
    <p class="eyebrow">How it works</p>
    <h1>Three quiet steps</h1>
    <ol class="how-list">
      <li><h2>Tell us how you're feeling</h2><p>Write in English, Hindi or Hinglish, choose a feeling, or choose “I don't know what I feel”. What you type is processed only in your browser — it is never sent to a server.</p></li>
      <li><h2>Receive a relevant teaching</h2><p>We look for words that describe feelings — like “thak gaya”, “डर” or “overthinking” — and match them to themes in a curated library of verses. You see the original Sanskrit, transliteration, a translation, a Hindi meaning, and a short interpretation of why the teaching may speak to you.</p></li>
      <li><h2>Take a moment to reflect</h2><p>Each teaching ends with one question. Write, take a 2-minute breathing pause, or simply read. If you'd like to keep it, save it to your journey.</p></li>
    </ol>
    ${divider()}
    <h2>Accounts</h2>
    <p>You never need an account to reflect. Creating one lets you save reflections, follow the 7-day journey and see your monthly summary. Accounts are currently stored privately in your browser on this device — so they don't sync between devices yet.</p>
    <h2>When someone may be in danger</h2>
    <p>If what you write suggests you may be at risk of harming yourself, we don't show a verse. Instead we show crisis support, because in that moment a person matters more than a teaching.</p>`,

  privacy: () => `
    <p class="eyebrow">Privacy</p>
    <h1>Privacy policy</h1>
    <p class="lead">Short version: what you write stays on your device.</p>
    <h2>What we store, and where</h2>
    <ul>
      <li><strong>Your reflections, account details and preferences</strong> are stored in your browser's local storage, on your device. They are not sent to our servers.</li>
      <li><strong>Passwords</strong> are never stored as text — only a salted PBKDF2 hash, also kept on your device.</li>
      <li><strong>Drafts in progress</strong> are kept in session storage and disappear when you close the tab.</li>
    </ul>
    <h2>What we don't do</h2>
    <ul>
      <li>We don't send what you type to any AI service or server.</li>
      <li>We don't sell data or show advertising.</li>
      <li>We don't use analytics or tracking cookies.</li>
    </ul>
    <h2>Third parties</h2>
    <p>Fonts are loaded from Google Fonts, which receives your IP address as part of a normal web request. If you look up a verse outside our curated library, the complete text is fetched from a public dataset hosted on GitHub Pages. When you choose to share to WhatsApp, that service's own policy applies. If paid plans are introduced, payments will be handled by a payment provider under its own policy.</p>
    <h2>Your control</h2>
    <p>From your Profile you can download all your data or delete your account, which removes your reflections from this device. Clearing your browser's site data also removes everything.</p>
    <p class="fine">Last updated: ${new Date(2026, 9, 5).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.</p>`,

  terms: () => `
    <p class="eyebrow">Terms</p>
    <h1>Terms of use</h1>
    <h2>A reflection tool</h2>
    <p>Gita Reflection offers verses from the Bhagavad Gita with translations and interpretations for personal reflection and education. It does not provide medical, psychological, legal or financial advice, and it is not a substitute for professional care. Do not use it in an emergency — call ${esc(c.emergency)} or ${esc(c.name)} at ${esc(c.phone)}.</p>
    <h2>Interpretations</h2>
    <p>Interpretive content (simple meanings, explanations, questions and practices) reflects one gentle reading of the text and may differ from traditional commentaries. It is offered humbly and without any claim of religious authority.</p>
    <h2>Your account</h2>
    <p>Accounts are stored in your browser. You are responsible for keeping your device secure. Because data lives on your device, clearing browser data or losing the device will remove it; please download a copy from your Profile if it matters to you.</p>
    <h2>Paid features</h2>
    <p>The core experience is free. Optional paid plans and digital products, when available, will be described clearly before purchase. Digital products are delivered as downloads.</p>
    <h2>Sharing</h2>
    <p>You're welcome to share cards and verses for personal, non-commercial purposes.</p>`,

  contact: () => `
    <p class="eyebrow">Contact</p>
    <h1>Say hello</h1>
    <p class="lead">We'd love to hear how Gita Reflection could be a kinder, more useful space.</p>
    ${CONFIG.contactEmail
      ? `<p>Write to us at <a href="mailto:${esc(CONFIG.contactEmail)}">${esc(CONFIG.contactEmail)}</a>. We read every message, though replies may take a few days.</p>`
      : `<p>A contact address is being set up. In the meantime, thank you for being here.</p>`}
    <div class="soft-card">
      <h2>If you need support right now</h2>
      <p>We can't offer counselling by email. If you are struggling, please call ${esc(c.name)} at <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a> (India, free, 24×7) or emergency services at <a href="tel:${esc(c.emergency)}">${esc(c.emergency)}</a>. Outside India, <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a> lists local helplines.</p>
    </div>`
};

export function render(root, { mode }) {
  root.innerHTML = `<article class="wrap narrow prose page-pad">${PAGES[mode]()}</article>`;
}
