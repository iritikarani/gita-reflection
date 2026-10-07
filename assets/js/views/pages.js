import { esc, divider } from "../ui.js";
import { CONFIG } from "../config.js";
import { VERSES } from "../data/verses.js";
import { backendMode } from "../store.js";
import { isHindi, locale } from "../i18n.js";

const remote = () => backendMode() === "supabase";

const c = CONFIG.crisis;
const updated = () => new Date(2026, 9, 7).toLocaleDateString(locale(), {
  day: "numeric",
  month: "long",
  year: "numeric"
});

const CONTACT_EMAIL = "gitareflection@gmail.com";

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
      <dt>Original Sanskrit</dt>
      <dd>The verse as it appears in the Bhagavad Gita, in Devanagari, with IAST transliteration.</dd>

      <dt>Translation</dt>
      <dd>An English rendering adapted for readability from the standard meaning of the verse, and a Hindi भावार्थ. Translations always involve choices; we aim to stay close to the text.</dd>

      <dt>Interpretation</dt>
      <dd>“In simple words”, “Why this may speak to you”, context notes, reflection questions and practices are interpretations written for Gita Reflection. They are not scripture.</dd>
    </dl>

    <p>Our interpretive writing was drafted with the help of AI and is offered humbly. The site does <strong>not</strong> generate text with AI while you use it: your words are matched to a curated set of ${VERSES.length} verses by simple rules that run in your browser.</p>
  `,

  how: () => `
    <p class="eyebrow">How it works</p>
    <h1>Three quiet steps</h1>

    <ol class="how-list">
      <li>
        <h2>Tell us how you're feeling</h2>
        <p>Write in English, Hindi or Hinglish, choose a feeling, or choose “I don't know what I feel”. What you type is processed only in your browser — it is never sent to a server.</p>
      </li>

      <li>
        <h2>Receive a relevant teaching</h2>
        <p>We look for words that describe feelings — like “thak gaya”, “डर” or “overthinking” — and match them to themes in a curated library of verses. You see the original Sanskrit, transliteration, a translation, a Hindi meaning, and a short interpretation of why the teaching may speak to you.</p>
      </li>

      <li>
        <h2>Take a moment to reflect</h2>
        <p>Each teaching ends with one question. Write, take a 2-minute breathing pause, or simply read. If you'd like to keep it, save it to your journey.</p>
      </li>
    </ol>

    ${divider()}

    <h2>Accounts</h2>
    <p>You never need an account to reflect. Creating one lets you save reflections, follow the 7-day journey and see your monthly summary. ${remote()
      ? "Your account works on any device: log in on your phone or laptop and your reflections are there."
      : "Accounts are currently stored privately in your browser on this device — so they don't sync between devices yet."}</p>

    <h2>When someone may be in danger</h2>
    <p>If what you write suggests you may be at risk of harming yourself, we don't show a verse. Instead we show crisis support, because in that moment a person matters more than a teaching.</p>
  `,

  privacy: () => `
    <p class="eyebrow">Privacy</p>
    <h1>Privacy policy</h1>

    <p class="lead">Gita Reflection is designed to collect as little personal information as reasonably necessary to provide accounts, saved reflections and Premium features.</p>

    <h2>Who this policy applies to</h2>
    <p>This Privacy Policy explains how Gita Reflection handles information when you use our website, create an account, save reflections or use Premium features.</p>

    <h2>What we store, and where</h2>
    <ul>
      <li><strong>What you type to find a verse</strong> is matched to a teaching inside your browser. It is not sent to an AI service or our server merely because you typed it.</li>

      ${remote() ? `
      <li><strong>Your account information</strong>, including your name and email address, is managed using Supabase Auth, our authentication and database provider. Authentication credentials are handled by Supabase's authentication system.</li>

      <li><strong>Saved reflections and account content</strong>, including saved verses, journey information and monthly notes, are stored in our Supabase database so that they can be available to you across supported devices.</li>

      <li><strong>Subscription information</strong>, such as your subscription ID, plan, subscription status, billing period and renewal date, is stored so that we can provide and manage Premium access.</li>

      <li><strong>Payment-event records</strong> received from Razorpay may be stored for payment verification, subscription management, customer support, fraud prevention, dispute handling and financial recordkeeping. These records can contain information supplied by Razorpay about a payment or subscription.</li>

      <li>We use your email for account-related messages such as email confirmation, password reset and important account or subscription communications.</li>
      ` : `
      <li><strong>Your reflections, account details and preferences</strong> are stored in your browser's local storage, on your device. They are not sent to our servers.</li>

      <li><strong>Passwords</strong> are never stored as plain text in the local-browser version — only a salted PBKDF2 hash is stored on your device.</li>
      `}

      <li><strong>Drafts in progress</strong> are kept in your browser's session storage and normally disappear when you close the tab.</li>
    </ul>

    <h2>What we don't do</h2>
    <ul>
      <li>We don't sell your personal information.</li>
      <li>We don't use your reflections to create advertising profiles.</li>
      <li>We don't send the text you type into the reflection experience to an AI service.</li>
      <li>We don't use analytics or tracking cookies as part of the reflection experience.</li>
      <li>We don't store your card, UPI PIN, bank-login credentials or other payment credentials ourselves.</li>
    </ul>

    <h2>Payments and Razorpay</h2>
    <p>Premium payments and recurring subscriptions are processed by Razorpay. Razorpay may process payment, customer, device and transaction information as necessary to provide payment services and comply with applicable requirements. Gita Reflection does not collect or store your card number, UPI PIN, bank-login credentials or similar payment credentials.</p>

    <p>Gita Reflection does retain limited subscription and payment-event information supplied by Razorpay where necessary to verify payments, activate Premium, manage renewals and cancellations, respond to payment questions, prevent fraud, resolve disputes and maintain required financial or business records.</p>

    <h2>Other third parties</h2>
    <p>Fonts are loaded from Google Fonts, which may receive your IP address as part of a normal web request. If you look up a verse outside our curated library, the complete text may be fetched from a public dataset hosted on GitHub Pages.</p>

    ${remote() ? `
    <p>Saved reflections and account information are processed by Supabase on our behalf for authentication and database services.</p>
    ` : ""}

    <p>When you choose to share something through WhatsApp or another external service, that service's own privacy policy and terms apply.</p>

    <h2>How long we keep information</h2>
    <p>We keep account information and saved content while your account remains active or while it is needed to provide the service.</p>

    <p>If you delete your account, we will delete or anonymize personal information and saved content that we no longer need. Some information may need to be retained for a reasonable period where necessary for security, fraud prevention, payment verification, financial records, dispute resolution, legal obligations or other legitimate business purposes.</p>

    <h2>Your choices and rights</h2>
    <p>${remote()
      ? "From your Profile, you can download your available account data or request deletion of your account. You can also contact us about questions concerning your personal information, corrections or deletion requests."
      : "From your Profile you can download your available data or delete your account, which removes your reflections from this device. Clearing your browser's site data also removes locally stored information."}</p>

    <h2>Privacy questions and requests</h2>
    <p>For privacy questions, personal-data requests, account-deletion questions or complaints about how your information is handled, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>

    <h2>Security</h2>
    <p>We use reasonable technical and organizational measures intended to protect information against unauthorized access, loss, misuse or disclosure. No internet service can guarantee absolute security.</p>

    <p class="fine">Last updated: ${updated()}.</p>
  `,

  terms: () => `
    <p class="eyebrow">Terms</p>
    <h1>Terms of use</h1>

    <h2>A reflection tool</h2>
    <p>Gita Reflection offers verses from the Bhagavad Gita with translations and interpretations for personal reflection and education. It does not provide medical, psychological, legal or financial advice, and it is not a substitute for professional care. Do not use it in an emergency — call ${esc(c.emergency)} or ${esc(c.name)} at ${esc(c.phone)}.</p>

    <h2>Interpretations</h2>
    <p>Interpretive content (simple meanings, explanations, questions and practices) reflects one gentle reading of the text and may differ from traditional commentaries. It is offered without any claim of religious authority.</p>

    <h2>Your account</h2>
    <p>${remote()
      ? "Please keep your password and account credentials private. You are responsible for activity carried out through your account unless caused by a security issue outside your reasonable control. You can download or request deletion of your data from your Profile."
      : "Accounts are stored in your browser. You are responsible for keeping your device secure. Because data lives on your device, clearing browser data or losing the device may remove it; please download a copy from your Profile if it matters to you."}</p>

    <h2>Acceptable use</h2>
    <p>You agree not to misuse Gita Reflection, attempt unauthorized access, interfere with the service, introduce malicious code, abuse payment systems, scrape the service at an unreasonable scale, or use the service to violate applicable law or another person's rights.</p>

    <h2>Paid subscriptions</h2>
    <p>The core experience may be available for free. Premium plans are optional paid subscriptions. The applicable price, billing period and important payment details are shown before purchase.</p>

    <p>Unless otherwise stated, Premium subscriptions renew automatically at the end of each billing period until cancelled. You can cancel through the available account controls. When a subscription is cancelled at the end of its billing period, Premium normally remains available until the end of the period already paid for and the next renewal charge is not made.</p>

    <p>Payments and recurring billing are processed by Razorpay. Gita Reflection does not store your card, UPI PIN or bank-login credentials.</p>

    <h2>Refunds and cancellations</h2>
    <p>Refunds and cancellation requests are handled according to our <a href="#/refunds">Refunds &amp; cancellations policy</a>. Cancelling a subscription does not automatically create a refund for the period already paid for.</p>

    <h2>Digital products</h2>
    <p>Where digital journals or other downloadable resources are offered, the applicable description and price will be shown before purchase. Delivery and refund terms are described in our Refunds &amp; cancellations policy.</p>

    <h2>Intellectual property</h2>
    <p>The Gita Reflection website, including its original design, interface, original written explanations, graphics, code and other original materials, is protected by applicable intellectual-property laws. You may use the service for personal, lawful purposes but may not copy, reproduce, sell or redistribute substantial portions of the service without permission, except where the underlying material is in the public domain or otherwise lawfully reusable.</p>

    <h2>Sharing</h2>
    <p>You're welcome to share cards and verses for personal, non-commercial purposes. Please do not present Gita Reflection's interpretations as official scripture or as the views of a religious authority.</p>

    <h2>Service changes</h2>
    <p>We may improve, modify, suspend or discontinue features from time to time. We will try to give reasonable notice for significant changes where practical. Nothing in these Terms removes rights you have under applicable law.</p>

    <h2>Account suspension or termination</h2>
    <p>We may suspend or terminate an account where reasonably necessary to protect the service, users or third parties, including in cases of fraud, abuse, unauthorized access or serious violations of these Terms. Where appropriate, we will provide notice and an opportunity to resolve the issue.</p>

    <h2>No guarantee of uninterrupted service</h2>
    <p>We aim to keep Gita Reflection available and reliable, but we cannot guarantee that the service will always be uninterrupted, error-free or available on every device or network.</p>

    <h2>Limitation</h2>
    <p>To the extent permitted by applicable law, Gita Reflection is provided for personal reflection and educational purposes and should not be relied upon as professional advice or emergency support. Nothing in these Terms excludes liability that cannot lawfully be excluded.</p>

    <h2>Contact</h2>
    <p>Questions about these Terms can be sent to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>

    <p class="fine">Last updated: ${updated()}.</p>
  `,

  refunds: () => `
    <p class="eyebrow">Refunds &amp; cancellations</p>
    <h1>Refunds and cancellations</h1>

    <p class="lead">We want paying for Gita Reflection to feel as calm as using it.</p>

    <h2>Premium membership</h2>
    <ul>
      <li><strong>Cancellation:</strong> You can cancel Premium at any time through the available cancellation option in your account.</li>

      <li><strong>After cancellation:</strong> If you cancel at the end of the current billing cycle, you keep Premium until the end of the period you've already paid for. The subscription will not renew and you should not be charged for the next billing period.</li>

      <li><strong>Refunds:</strong> If you were charged by mistake, or forgot to cancel before a renewal, write to us within 7 days of the charge at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. We will review the request and, where it falls within this policy, refund the charge in full.</li>

      <li><strong>Cancellation is not automatically a refund:</strong> Cancelling a subscription stops future renewals but does not automatically refund the period that has already been paid for.</li>

      <li><strong>Your reflections:</strong> Your saved reflections remain yours. If Premium ends, your eligible saved content is not deleted solely because Premium ended.</li>
    </ul>

    <h2>Digital journals and resources</h2>
    <ul>
      <li>Digital products are delivered as downloads. Because they can be accessed immediately, we don't usually offer refunds once a file has been successfully downloaded.</li>

      <li>If a file doesn't arrive, won't open, is materially defective, or isn't what was described, contact us within 7 days. We will provide a working copy or, where appropriate, a full refund.</li>
    </ul>

    <h2>Refunds and subscription status</h2>
    <p>A refund of a payment does not automatically cancel future subscription renewals. If you want to stop future recurring charges, please cancel the subscription as well.</p>

    <h2>How refunds are paid</h2>
    <p>Approved refunds are normally returned through the original payment method used for the transaction. The time taken for the refund to appear can depend on the payment provider and your bank.</p>

    <h2>Payment support</h2>
    <p>For payment, refund or cancellation questions, write to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> and include the email address used for your Gita Reflection account and, where available, your payment receipt or transaction details. Please do not send your password, UPI PIN, card number or banking credentials by email.</p>

    <p class="fine">Last updated: ${updated()}.</p>
  `,

  contact: () => `
    <p class="eyebrow">Contact</p>
    <h1>Say hello</h1>

    <p class="lead">We'd love to hear how Gita Reflection could be a kinder, more useful space.</p>

    <p>For general questions, technical support, privacy requests, account questions, payment issues, refund requests or cancellation questions, write to us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>

    <p>Please do not send passwords, UPI PINs, card numbers, bank-login details or other sensitive payment credentials by email.</p>

    <div class="soft-card">
      <h2>Privacy and data requests</h2>
      <p>If you want to ask about your personal information, request account deletion, request a correction, or raise a privacy complaint, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
    </div>

    <div class="soft-card">
      <h2>If you need support right now</h2>
      <p>We can't offer counselling by email. If you are struggling, please call ${esc(c.name)} at <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a> (India, free, 24×7) or emergency services at <a href="tel:${esc(c.emergency)}">${esc(c.emergency)}</a>. Outside India, <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a> lists local helplines.</p>
    </div>
  `
};


// हिन्दी संस्करण
const PAGES_HI = {
  about: () => `
    <p class="eyebrow">परिचय</p>
    <h1>ठहरने के लिए एक शांत जगह</h1>
    <p class="lead">गीता रिफ्लेक्शन उन पलों के लिए एक शांत डिजिटल जगह है जब मन भारी लगे। आप बताते हैं कि आप क्या महसूस कर रहे हैं, भगवद्गीता से एक प्रासंगिक शिक्षा पाते हैं, और एक पल रुककर चिंतन करते हैं।</p>
    ${divider()}

    <h2>हम क्या हैं</h2>
    <p>भगवद्गीता से प्रेरित एक चिंतन और शैक्षिक साधन — श्रीकृष्ण और अर्जुन के बीच 700 श्लोकों का संवाद, जिसकी ओर अलग-अलग परंपराओं के लोग कठिन पलों में दृष्टिकोण के लिए मुड़ते रहे हैं।</p>

    <p>हम कोई धार्मिक प्राधिकरण नहीं हैं, और आपसे किसी बात पर विश्वास करने को नहीं कहते। गीता यहाँ एक दृष्टिकोण के स्रोत के रूप में है — वैसे ही जैसे कोई समझदार मित्र वह अंश बताए जिसने कभी उसकी मदद की थी।</p>

    <h2>हम क्या नहीं हैं</h2>
    <p>गीता रिफ्लेक्शन <strong>पेशेवर मानसिक-स्वास्थ्य देख
