import { esc, divider } from "../ui.js";
import { CONFIG } from "../config.js";
import { VERSES } from "../data/verses.js";
import { backendMode } from "../store.js";
import { isHindi, locale } from "../i18n.js";

const remote = () => backendMode() === "supabase";

const c = CONFIG.crisis;
const CONTACT_EMAIL = CONFIG.contactEmail || "gitareflection@gmail.com";

const updated = () => new Date(2026, 9, 8).toLocaleDateString(locale(), {
  day: "numeric",
  month: "long",
  year: "numeric"
});

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
        <p>Write in English, Hindi or Hinglish, choose a feeling, or choose “I don't know what I feel”. What you type is processed in your browser for verse matching. If you choose a feature such as saving an entry to your account, the information needed for that feature may be sent to our services.</p>
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
    <p>You never need an account to reflect. Creating one lets you save reflections, follow the 7-day journey and see your monthly summary. ${
      remote()
        ? "Your account works on any device: log in on your phone or laptop and your saved reflections are there."
        : "Accounts are currently stored privately in your browser on this device — so they don't sync between devices yet."
    }</p>

    <h2>When someone may be in danger</h2>
    <p>If what you write suggests you may be at risk of harming yourself, we don't show a verse. Instead we show crisis support, because in that moment a person matters more than a teaching.</p>
  `,

  privacy: () => `
    <p class="eyebrow">Privacy</p>
    <h1>Privacy policy</h1>

    <p class="lead">
      Gita Reflection is designed to keep your personal reflections private.
      We collect and use only the information needed to provide the features you choose.
    </p>

    <h2>1. What you type</h2>
    <p>
      Your feeling or reflection text used to find a teaching is matched in your browser.
      We do not send your reflection text to an AI service for verse matching.
      If you choose to save a reflection, the information needed to save and display that entry
      is sent to our account and database services.
    </p>

    <h2>2. Account information</h2>
    <p>${
      remote()
        ? "When you create an account, we process information such as your name, email address and account credentials through Supabase Auth. Your password is handled by the authentication system and is not stored by Gita Reflection as readable text."
        : "When the site is operating in local mode, account details are kept in your browser on your device."
    }</p>

    <h2>3. Saved content</h2>
    <p>${
      remote()
        ? "If you are signed in and choose to save content, your saved reflections, saved verses, 7-day journey entries and monthly notes are stored in our Supabase database. Database access controls and row-level security are used to restrict account data to the appropriate user."
        : "In local mode, saved reflections, preferences and related account information remain in your browser's local storage on your device."
    }</p>

    <h2>4. Premium and payment information</h2>
    <p>
      Premium payments are processed by <strong>Razorpay</strong>.
      Razorpay handles the payment credentials you enter at checkout under its own terms and privacy practices.
    </p>

    <p>
      Gita Reflection does <strong>not intentionally store card numbers, CVV, UPI PINs or full bank-account credentials</strong>.
      We do, however, receive and retain the subscription information needed to provide Premium,
      such as your subscription ID, plan or billing period, subscription status and renewal date.
    </p>

    <p>
      We also keep payment and subscription event records received from Razorpay so that we can
      activate Premium, recognise renewals, process cancellations, investigate payment problems
      and maintain transaction records. These event records may contain payment-related metadata
      supplied by Razorpay.
    </p>

    <h2>5. Service providers</h2>
    <p>We use third-party providers to operate parts of the service:</p>

    <ul>
      <li><strong>Supabase</strong> for authentication and database services.</li>
      <li><strong>Razorpay</strong> for Premium subscription payments.</li>
      <li><strong>Vercel</strong> to host the website and deliver its files.</li>
      <li><strong>Google Fonts</strong> for web fonts. Loading a font can involve a normal web request, which may expose network information such as your IP address to the provider.</li>
      <li><strong>GitHub Pages or public datasets</strong> may be used when the site requests scripture data outside its local curated library.</li>
      <li><strong>WhatsApp</strong> applies its own privacy practices when you choose to share content through WhatsApp.</li>
      <li><strong>Email service providers</strong> may be used for account-related messages such as confirmation and password-reset emails.</li>
    </ul>

    <h2>6. What we do not do</h2>
    <ul>
      <li>We do not sell your personal information.</li>
      <li>We do not use your reflections to create advertising profiles.</li>
      <li>We do not intentionally send your reflection text to an AI service for verse matching.</li>
      <li>We do not use analytics or tracking cookies unless this policy is updated to describe a new service.</li>
    </ul>

    <h2>7. Email and account messages</h2>
    <p>
      We may use your email address for essential account communications, including email confirmation,
      password resets, subscription-related notices and important service messages.
      Where applicable law requires consent for unrelated marketing, we will seek that consent separately.
    </p>

    <h2>8. Data retention</h2>
    <p>
      We keep account information and saved content while your account remains active or for as long
      as needed to provide the feature you requested. If you delete your account, we aim to delete or
      anonymise account-linked information that we no longer need.
    </p>

    <p>
      Some information may need to be retained for longer where necessary for security,
      fraud prevention, payment disputes, accounting, legal obligations or the establishment
      or defence of legal claims. Backups may also contain information for a limited period as part
      of normal disaster-recovery processes.
    </p>

    <h2>9. Security</h2>
    <p>
      We use reasonable technical and organisational safeguards, including authentication controls
      and database access rules, to protect stored information.
      No internet service can guarantee absolute security, so please use a strong, unique password
      and keep your account credentials private.
    </p>

    <h2>10. Your choices and rights</h2>
    <p>${
      remote()
        ? "From your Profile, you can download your available account data and request deletion of your account. You can also contact us to ask about personal information we hold about you, subject to applicable law and reasonable identity verification."
        : "From your Profile, you can download your available data or delete your account from this device. Clearing browser site data can also remove locally stored information."
    }</p>

    <h2>11. Children</h2>
    <p>
      Gita Reflection is not intended to bypass age or parental-consent requirements that apply where you live.
      Please use the service only when you are legally permitted to do so.
    </p>

    <h2>12. International processing</h2>
    <p>
      Because our service providers may operate infrastructure in different countries,
      your information may be processed outside your home country.
      Where required, we rely on applicable safeguards and legal bases for that processing.
    </p>

    <h2>13. Changes to this policy</h2>
    <p>
      We may update this policy when the service, providers or legal requirements change.
      The latest version will be published on this page with its update date.
      Material changes will be highlighted where appropriate.
    </p>

    <h2>14. Privacy and grievance contact</h2>
    <p>
      For privacy questions, data requests or complaints about how information is handled,
      contact <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>.
    </p>

    <p>
      Please do not send passwords, OTPs, card numbers, CVV, UPI PINs or other sensitive
      payment credentials by email.
    </p>

    <p class="fine">Last updated: ${updated()}.</p>
  `,

  terms: () => `
    <p class="eyebrow">Terms</p>
    <h1>Terms of use</h1>

    <h2>1. About the service</h2>
    <p>
      Gita Reflection is a digital reflection and educational service inspired by the Bhagavad Gita.
      It provides scripture, translations, interpretations, reflection questions and related tools
      for personal use. It is not a religious authority and does not require users to follow a particular belief system.
    </p>

    <h2>2. Not medical or emergency care</h2>
    <p>
      Gita Reflection is <strong>not medical, psychological or emergency care</strong>.
      Nothing on the site is a diagnosis, treatment plan or substitute for a qualified professional.
      If you are in immediate danger or believe you may harm yourself or someone else,
      stop using the reflective features and contact local emergency services or an appropriate crisis service.
      In India, ${esc(c.name)} is available at <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>.
    </p>

    <h2>3. Scripture, translations and interpretations</h2>
    <p>
      Scripture excerpts are presented as scripture. Translations are translations;
      simple explanations, context, reflection questions and practices are interpretations created
      for Gita Reflection and may differ from traditional commentaries.
      They are not presented as the original text of the Bhagavad Gita.
    </p>

    <p>
      Some interpretive writing was drafted with the help of AI.
      AI is not used during your live reflection text matching unless this policy is later changed
      and clearly disclosed.
    </p>

    <h2>4. Eligibility and responsible use</h2>
    <p>
      You must be legally permitted to use the service where you live.
      You agree not to misuse the site, interfere with its operation, attempt unauthorised access,
      upload malicious code, impersonate another person, abuse payment systems,
      or use the service for unlawful purposes.
    </p>

    <h2>5. Your account</h2>
    <p>${
      remote()
        ? "You are responsible for keeping your sign-in credentials private and for activity carried out through your account, except where an issue is caused by our systems or circumstances outside your reasonable control. You should tell us promptly if you believe your account has been compromised."
        : "In local mode, your account and saved data are stored in your browser on your device. Clearing site data, changing browsers or losing the device may remove that data, so download a copy of anything important."
    }</p>

    <h2>6. Your reflections and content</h2>
    <p>
      You retain any rights you have in the reflections or other content you create.
      You give Gita Reflection only the limited permission needed to store, process, display and
      back up that content so the service can provide the features you requested.
      We do not claim ownership of your personal reflections.
    </p>

    <h2>7. Premium subscriptions</h2>
    <p>
      Premium is an optional recurring subscription.
      The applicable price and billing period are shown before you confirm payment.
      Current plans may include monthly and yearly subscriptions.
      Payment is processed by Razorpay.
    </p>

    <p>
      By starting a subscription, you authorise the applicable recurring payment arrangement
      through the payment method and mandate you approve at checkout.
    </p>

    <p>
      Cancelling a subscription stops future renewal.
      Unless a refund is separately approved, you retain Premium access through the paid period
      already purchased. Details are set out in the <a href="#/refunds">Refunds &amp; cancellations</a> policy.
    </p>

    <h2>8. Refunds and cancellations</h2>
    <p>
      Our refund rules are described on the Refunds &amp; cancellations page.
      Nothing in that policy or these Terms removes any consumer rights that cannot legally
      be excluded or waived under applicable law.
    </p>

    <h2>9. Intellectual property</h2>
    <p>
      The Gita Reflection name, branding, software, interface, original written interpretations,
      visual design and site materials are protected by applicable intellectual-property laws
      and remain our property or the property of the respective rights holder.
    </p>

    <p>
      You may use the service and share permitted cards or links for personal, non-commercial purposes.
      Do not copy, republish, sell, scrape or redistribute substantial portions of the service
      without permission.
    </p>

    <h2>10. Third-party services and links</h2>
    <p>
      The service depends on third parties including hosting, authentication/database,
      email, payment and sharing providers.
      Their own terms and privacy policies may apply to the services they provide.
      We are not responsible for a third-party service's independent actions,
      availability or policies.
    </p>

    <h2>11. Availability and changes</h2>
    <p>
      We aim to keep Gita Reflection available, but we do not promise uninterrupted
      or error-free operation.
      We may improve, modify, suspend or discontinue features, including free or paid features,
      when reasonably necessary for security, technical, legal or business reasons.
      We will make reasonable efforts to communicate material changes affecting paid access.
    </p>

    <h2>12. Suspension or termination</h2>
    <p>
      We may suspend or terminate access when reasonably necessary to protect the service,
      users or third parties, to address abuse or unlawful activity, or to comply with legal requirements.
      Where appropriate, we will give notice and an opportunity to resolve the issue.
    </p>

    <p>
      Account deletion or termination does not automatically erase records that we are legally
      or operationally required to retain.
    </p>

    <h2>13. Disclaimers and limitation</h2>
    <p>
      The service is provided for reflection and education.
      To the maximum extent permitted by law, we are not responsible for decisions you make
      based solely on site content, interruptions caused by third parties, or losses arising
      from misuse of your account.
    </p>

    <p>
      Nothing in these Terms limits liability that cannot legally be limited.
    </p>

    <h2>14. Governing law</h2>
    <p>
      These Terms are intended to be interpreted under applicable law in India,
      subject to any mandatory consumer or other legal protections that apply to you.
      Any dispute will be handled by a court or other forum that has lawful jurisdiction.
    </p>

    <h2>15. Contact</h2>
    <p>
      Questions about these Terms can be sent to
      <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>.
    </p>

    <p class="fine">Last updated: ${updated()}.</p>
  `,

  refunds: () => `
    <p class="eyebrow">Refunds &amp; cancellations</p>
    <h1>Refunds and cancellations</h1>

    <p class="lead">
      Here is how cancellation and refunds work for Gita Reflection Premium.
    </p>

    <h2>1. Cancelling Premium</h2>
    <ul>
      <li>You can cancel your Premium subscription through your account at any time.</li>
      <li>When you cancel at the end of the current billing cycle, your existing Premium access continues until the paid-through date.</li>
      <li>After cancellation takes effect, the subscription will not renew and no further recurring charge should be made for that subscription.</li>
      <li>Cancellation does not delete your reflections or other saved personal content.</li>
    </ul>

    <h2>2. Refunds for Premium</h2>
    <ul>
      <li>
        If you were charged by mistake, charged after a cancellation should already have stopped renewal,
        or genuinely forgot to cancel before a renewal, contact us within <strong>7 days of the charge</strong>
        at <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>.
      </li>

      <li>
        We will review the request and, where it falls within this policy,
        provide a full refund for the relevant charge.
      </li>

      <li>
        We may ask for the payment receipt, subscription details or other information needed
        to identify the transaction.
        Never send your card number, CVV, UPI PIN or bank password.
      </li>
    </ul>

    <h2>3. Refunds are not the same as cancellation</h2>
    <p>
      Canceling a subscription prevents future renewal;
      it does not automatically reverse a payment that has already been made.
      Refunds are handled separately under the rules above and any rights you have under applicable law.
    </p>

    <h2>4. Payment method and timing</h2>
    <p>
      Approved refunds are normally returned to the original payment method used for the transaction.
      The time it takes to appear can depend on Razorpay, your bank or payment provider.
    </p>

    <h2>5. Digital products</h2>
    <p>
      If Gita Reflection offers a paid digital journal, template or other download in the future,
      the product page will state the applicable price and delivery details before purchase.
    </p>

    <ul>
      <li>
        Because digital downloads can be delivered immediately, downloads are generally non-refundable
        once the file has been successfully delivered and downloaded, except where required by law
        or where the file is defective or materially different from its description.
      </li>

      <li>
        If a file does not arrive, will not open, or is materially different from what was promised,
        contact us within 7 days and we will try to provide a working replacement or an appropriate refund.
      </li>
    </ul>

    <h2>6. Consumer rights</h2>
    <p>
      Nothing in this policy limits any refund, cancellation or consumer-protection right
      that you cannot legally waive under applicable law.
    </p>

    <h2>7. Contact</h2>
    <p>
      For a cancellation or refund request, email
      <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>
      and include the email address on the account, the relevant subscription/payment date
      and your payment receipt if available.
    </p>

    <p class="fine">Last updated: ${updated()}.</p>
  `,

  contact: () => `
    <p class="eyebrow">Contact</p>
    <h1>Say hello</h1>

    <p class="lead">
      We'd love to hear how Gita Reflection could be a kinder, more useful space.
    </p>

    <p>
      For general questions, privacy requests, account help, payment questions or complaints,
      write to <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>.
    </p>

    <p>
      Please do not send passwords, OTPs, card numbers, CVV, UPI PINs
      or bank credentials by email.
    </p>

    <div class="soft-card">
      <h2>If you need support right now</h2>
      <p>
        We can't offer counselling by email.
        If you are struggling, please call ${esc(c.name)}
        at <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>
        (India, free, 24×7) or emergency services at
        <a href="tel:${esc(c.emergency)}">${esc(c.emergency)}</a>.
        Outside India,
        <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com</a>
        lists local helplines.
      </p>
    </div>

    <p class="fine">
      For privacy or data requests, please use the same email address above.
      We may need to verify account ownership before making account-level changes.
    </p>
  `
};

// हिन्दी संस्करण
const PAGES_HI = {
  about: () => `
    <p class="eyebrow">परिचय</p>
    <h1>ठहरने के लिए एक शांत जगह</h1>

    <p class="lead">
      गीता रिफ्लेक्शन उन पलों के लिए एक शांत डिजिटल जगह है जब मन भारी लगे।
      आप बताते हैं कि आप क्या महसूस कर रहे हैं, भगवद्गीता से एक प्रासंगिक शिक्षा पाते हैं,
      और एक पल रुककर चिंतन करते हैं।
    </p>

    ${divider()}

    <h2>हम क्या हैं</h2>
    <p>
      भगवद्गीता से प्रेरित एक चिंतन और शैक्षिक साधन — श्रीकृष्ण और अर्जुन के बीच
      700 श्लोकों का संवाद, जिसकी ओर अलग-अलग परंपराओं के लोग कठिन पलों में
      दृष्टिकोण के लिए मुड़ते रहे हैं।
    </p>

    <p>
      हम कोई धार्मिक प्राधिकरण नहीं हैं, और आपसे किसी बात पर विश्वास करने को नहीं कहते।
      गीता यहाँ एक दृष्टिकोण के स्रोत के रूप में है — वैसे ही जैसे कोई समझदार मित्र
      वह अंश बताए जिसने कभी उसकी मदद की थी।
    </p>

    <h2>हम क्या नहीं हैं</h2>
    <p>
      गीता रिफ्लेक्शन <strong>पेशेवर मानसिक-स्वास्थ्य देखभाल, चिकित्सा सलाह या थेरेपी का विकल्प नहीं है</strong>।
      शास्त्र दृष्टिकोण दे सकते हैं, पर वे उपचार नहीं हैं।
      अगर आप कठिनाई में हैं, तो किसी भरोसेमंद व्यक्ति या योग्य विशेषज्ञ से बात कीजिए।
      भारत में ${esc(c.name)}
      <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a> पर मुफ़्त, 24×7 सहायता देता है।
    </p>

    <h2>हम पाठ के साथ कैसा व्यवहार करते हैं</h2>
    <p>
      इस साइट पर हर शिक्षा साफ़-साफ़ चिह्नित परतों में दिखाई जाती है,
      ताकि शास्त्र और व्याख्या कभी आपस में न मिलें:
    </p>

    <dl class="layers-explained">
      <dt>मूल संस्कृत</dt>
      <dd>श्लोक जैसा वह भगवद्गीता में है — देवनागरी में, IAST लिप्यंतरण के साथ।</dd>

      <dt>अनुवाद</dt>
      <dd>
        श्लोक के मानक अर्थ से पढ़ने में आसान बनाया गया अंग्रेज़ी अनुवाद,
        और एक हिन्दी भावार्थ। अनुवाद में हमेशा कुछ चुनाव होते हैं;
        हम पाठ के क़रीब रहने का प्रयास करते हैं।
      </dd>

      <dt>व्याख्या</dt>
      <dd>
        “सरल शब्दों में”, “यह आपसे क्यों बात कर सकता है”, संदर्भ,
        चिंतन प्रश्न और अभ्यास गीता रिफ्लेक्शन के लिए लिखी गई व्याख्याएँ हैं।
        ये शास्त्र नहीं हैं।
      </dd>
    </dl>

    <p>
      हमारी व्याख्यात्मक सामग्री AI की मदद से तैयार की गई है और विनम्रता से प्रस्तुत है।
      आपके उपयोग के दौरान साइट AI से कोई पाठ <strong>नहीं</strong> बनाती:
      आपके शब्दों को आपके ब्राउज़र में चलने वाले सरल नियमों से
      ${VERSES.length} चुने हुए श्लोकों से मिलाया जाता है।
    </p>
  `,

  how: () => `
    <p class="eyebrow">यह कैसे काम करता है</p>
    <h1>तीन शांत कदम</h1>

    <ol class="how-list">
      <li>
        <h2>बताइए आप कैसा महसूस कर रहे हैं</h2>
        <p>
          अंग्रेज़ी, हिन्दी या हिंग्लिश में लिखिए, कोई भावना चुनिए,
          या “मुझे नहीं पता मैं क्या महसूस कर रहा/रही हूँ” चुनिए।
          आपके लिखे शब्दों को श्लोक मिलाने के लिए आपके ब्राउज़र में संसाधित किया जाता है।
          खाते में कुछ सहेजने जैसी सुविधाओं के लिए आवश्यक जानकारी सर्वर पर जा सकती है।
        </p>
      </li>

      <li>
        <h2>एक प्रासंगिक शिक्षा पाइए</h2>
        <p>
          हम भावनाओं को बताने वाले शब्द खोजते हैं — जैसे “thak gaya”, “डर” या “overthinking” —
          और उन्हें चुने हुए श्लोकों के विषयों से मिलाते हैं।
          आपको मूल संस्कृत, लिप्यंतरण, अनुवाद, हिन्दी भावार्थ,
          और यह छोटी-सी व्याख्या दिखती है कि यह शिक्षा आपसे क्यों बात कर सकती है।
        </p>
      </li>

      <li>
        <h2>एक पल रुककर चिंतन कीजिए</h2>
        <p>
          हर शिक्षा एक प्रश्न के साथ ख़त्म होती है।
          लिखिए, दो मिनट साँस के साथ ठहरिए, या बस पढ़िए।
          अगर रखना चाहें, तो अपनी यात्रा में सहेज लीजिए।
        </p>
      </li>
    </ol>

    ${divider()}

    <h2>खाते</h2>
    <p>
      चिंतन के लिए कभी खाते की ज़रूरत नहीं।
      खाता बनाने से आप चिंतन सहेज सकते हैं, 7 दिन की यात्रा कर सकते हैं
      और मासिक सारांश देख सकते हैं।
      ${
        remote()
          ? "आपका खाता हर डिवाइस पर काम करता है: फ़ोन या लैपटॉप पर लॉग इन कीजिए और आपके सहेजे चिंतन वहाँ होंगे।"
          : "अभी खाते आपके ब्राउज़र में, इसी डिवाइस पर निजी रूप से रखे जाते हैं — इसलिए वे अभी डिवाइसों के बीच सिंक नहीं होते।"
      }
    </p>

    <h2>जब कोई ख़तरे में हो सकता है</h2>
    <p>
      अगर आपके लिखे से लगे कि आप स्वयं को नुकसान पहुँचाने के ख़तरे में हो सकते हैं,
      तो हम श्लोक नहीं दिखाते। इसके बजाय हम संकट सहायता दिखाते हैं,
      क्योंकि उस पल में एक व्यक्ति किसी शिक्षा से ज़्यादा मायने रखता है।
    </p>
  `,

  privacy: () => `
    <p class="eyebrow">गोपनीयता</p>
    <h1>गोपनीयता नीति</h1>

    <p class="lead">
      गीता रिफ्लेक्शन आपकी निजी चिंतन सामग्री को यथासंभव निजी रखने के लिए बनाया गया है।
      हम वही जानकारी लेते और उपयोग करते हैं जो आपकी चुनी हुई सुविधाएँ देने के लिए आवश्यक है।
    </p>

    <h2>1. आप जो लिखते हैं</h2>
    <p>
      श्लोक खोजने के लिए आपकी भावना या चिंतन का मिलान आपके ब्राउज़र में किया जाता है।
      हम मिलान के लिए आपके चिंतन को किसी AI सेवा को नहीं भेजते।
      यदि आप किसी चिंतन को सहेजना चुनते हैं, तो उसे आपके खाते में सहेजने और दिखाने
      के लिए आवश्यक जानकारी डेटाबेस सेवा को भेजी जाती है।
    </p>

    <h2>2. खाते की जानकारी</h2>
    <p>
      ${
        remote()
          ? "खाता बनाते समय आपका नाम, ईमेल पता और खाता प्रमाण-पत्र Supabase Auth के माध्यम से संसाधित होते हैं। आपका पासवर्ड Gita Reflection द्वारा पढ़ने योग्य रूप में संग्रहीत नहीं किया जाता।"
          : "लोकल मोड में खाते की जानकारी आपके डिवाइस के ब्राउज़र में रखी जाती है।"
      }
    </p>

    <h2>3. सहेजा गया डेटा</h2>
    <p>
      ${
        remote()
          ? "यदि आप लॉग इन हैं और सामग्री सहेजते हैं, तो आपके सहेजे चिंतन, सहेजे श्लोक, 7 दिन की यात्रा और मासिक नोट्स Supabase डेटाबेस में रखे जाते हैं। डेटाबेस एक्सेस नियम और row-level security आपके खाते के डेटा को उचित उपयोगकर्ता तक सीमित रखने के लिए उपयोग किए जाते हैं।"
          : "लोकल मोड में सहेजे गए चिंतन, प्राथमिकताएँ और संबंधित खाता जानकारी आपके डिवाइस के ब्राउज़र में रहती हैं।"
      }
    </p>

    <h2>4. प्रीमियम और भुगतान की जानकारी</h2>
    <p>
      प्रीमियम भुगतान <strong>Razorpay</strong> द्वारा संसाधित किए जाते हैं।
      चेकआउट में आप जो भुगतान क्रेडेंशियल देते हैं, उन्हें Razorpay अपनी
      शर्तों और गोपनीयता प्रथाओं के अनुसार संभालता है।
    </p>

    <p>
      Gita Reflection <strong>कार्ड नंबर, CVV, UPI PIN या पूरे बैंक-खाते के क्रेडेंशियल
      जानबूझकर संग्रहीत नहीं करता</strong>।
      लेकिन प्रीमियम चलाने के लिए हमें सदस्यता ID, प्लान/अवधि,
      सदस्यता स्थिति और नवीनीकरण तिथि जैसी सदस्यता जानकारी मिलती और रखी जाती है।
    </p>

    <p>
      Razorpay से मिलने वाले भुगतान/सदस्यता इवेंट रिकॉर्ड भी रखे जाते हैं ताकि
      प्रीमियम सक्रिय करना, नवीनीकरण पहचानना, रद्दीकरण संभालना,
      भुगतान समस्या की जाँच और लेन-देन रिकॉर्ड रखना संभव हो।
      इन रिकॉर्ड में Razorpay द्वारा भेजा गया भुगतान-संबंधी मेटाडेटा हो सकता है।
    </p>

    <h2>5. सेवा प्रदाता</h2>
    <ul>
      <li><strong>Supabase</strong> — प्रमाणीकरण और डेटाबेस।</li>
      <li><strong>Razorpay</strong> — प्रीमियम सदस्यता भुगतान।</li>
      <li><strong>Vercel</strong> — वेबसाइट होस्टिंग और फ़ाइल वितरण।</li>
      <li><strong>Google Fonts</strong> — वेब फ़ॉन्ट। सामान्य वेब अनुरोध के दौरान IP जैसी नेटवर्क जानकारी प्रदाता तक पहुँच सकती है।</li>
      <li><strong>GitHub Pages या सार्वजनिक डेटासेट</strong> — जहाँ लागू हो, लोकल चुने हुए संग्रह से बाहर के श्लोक डेटा के लिए।</li>
      <li><strong>WhatsApp</strong> — वहाँ साझा करते समय उसकी अपनी गोपनीयता प्रथाएँ लागू होती हैं।</li>
      <li><strong>ईमेल सेवा प्रदाता</strong> — खाते से जुड़े आवश्यक ईमेल के लिए, जैसा तकनीकी कॉन्फ़िगरेशन में लागू हो।</li>
    </ul>

    <h2>6. हम क्या नहीं करते</h2>
    <ul>
      <li>हम आपकी व्यक्तिगत जानकारी बेचते नहीं हैं।</li>
      <li>हम आपके चिंतनों से विज्ञापन प्रोफ़ाइल बनाने के लिए उनका उपयोग नहीं करते।</li>
      <li>हम श्लोक मिलाने के लिए आपके चिंतन को किसी AI सेवा को जानबूझकर नहीं भेजते।</li>
      <li>हम एनालिटिक्स या ट्रैकिंग कुकीज़ का उपयोग नहीं करते, जब तक नई सेवा के बारे में इस नीति में स्पष्ट बदलाव न किया जाए।</li>
    </ul>

    <h2>7. ईमेल और खाता संदेश</h2>
    <p>
      आपके ईमेल का उपयोग खाता पुष्टि, पासवर्ड रीसेट, सदस्यता से जुड़ी सूचनाओं
      और महत्वपूर्ण सेवा संदेशों के लिए किया जा सकता है।
      जहाँ लागू कानून अलग सहमति माँगता है, वहाँ असंबंधित मार्केटिंग के लिए
      अलग सहमति ली जाएगी।
    </p>

    <h2>8. डेटा कितने समय तक रखा जाता है</h2>
    <p>
      खाते की जानकारी और सहेजा गया डेटा आपके खाते के सक्रिय रहने तक या
      सुविधा देने के लिए आवश्यक समय तक रखा जाता है।
      खाता हटाने के बाद, जिन खाते-संबंधित जानकारी की अब आवश्यकता नहीं है,
      उन्हें हटाने या अनाम करने का प्रयास किया जाता है।
    </p>

    <p>
      सुरक्षा, धोखाधड़ी की रोकथाम, भुगतान विवाद, लेखांकन, कानूनी दायित्व
      या कानूनी दावों के लिए कुछ रिकॉर्ड अधिक समय तक रखना आवश्यक हो सकता है।
      सामान्य बैकअप प्रक्रियाओं के कारण बैकअप में कुछ डेटा सीमित अवधि तक रह सकता है।
    </p>

    <h2>9. सुरक्षा</h2>
    <p>
      संग्रहीत जानकारी की सुरक्षा के लिए हम उचित तकनीकी और संगठनात्मक उपायों का उपयोग करते हैं,
      जिनमें प्रमाणीकरण नियंत्रण और डेटाबेस एक्सेस नियम शामिल हैं।
      कोई भी इंटरनेट सेवा पूर्ण सुरक्षा की गारंटी नहीं दे सकती,
      इसलिए मजबूत और अलग पासवर्ड रखें और अपने खाते के प्रमाण-पत्र निजी रखें।
    </p>

    <h2>10. आपका नियंत्रण और अधिकार</h2>
    <p>
      ${
        remote()
          ? "अपनी प्रोफ़ाइल से आप उपलब्ध खाता डेटा डाउनलोड कर सकते हैं और खाता हटाने का अनुरोध कर सकते हैं। आप हमसे यह भी पूछ सकते हैं कि आपके बारे में कौन-सी व्यक्तिगत जानकारी रखी गई है, जहाँ लागू कानून और उचित पहचान सत्यापन इसकी अनुमति देते हों।"
          : "अपनी प्रोफ़ाइल से आप उपलब्ध डेटा डाउनलोड कर सकते हैं या इस डिवाइस से खाता हटा सकते हैं। ब्राउज़र का साइट डेटा साफ़ करने से भी लोकल जानकारी हट सकती है।"
      }
    </p>

    <h2>11. बच्चे और आयु</h2>
    <p>
      गीता रिफ्लेक्शन स्थानीय आयु या माता-पिता की सहमति संबंधी आवश्यकताओं को दरकिनार करने के लिए नहीं है।
      सेवा का उपयोग तभी करें जब आपके स्थान के लागू कानून के अनुसार आपको इसकी अनुमति हो।
    </p>

    <h2>12. अंतरराष्ट्रीय प्रसंस्करण</h2>
    <p>
      हमारे सेवा प्रदाता अलग-अलग देशों में बुनियादी ढाँचा चला सकते हैं,
      इसलिए आपकी जानकारी आपके देश से बाहर भी संसाधित हो सकती है।
      जहाँ कानून की आवश्यकता हो, हम लागू सुरक्षा उपायों और कानूनी आधारों पर निर्भर करते हैं।
    </p>

    <h2>13. नीति में बदलाव</h2>
    <p>
      सेवा, प्रदाताओं या कानूनी आवश्यकताओं में बदलाव होने पर यह नीति अपडेट की जा सकती है।
      नवीनतम संस्करण इसी पृष्ठ पर तिथि के साथ प्रकाशित होगा।
      महत्वपूर्ण बदलाव जहाँ उचित होगा, स्पष्ट रूप से बताए जाएँगे।
    </p>

    <h2>14. गोपनीयता और शिकायत संपर्क</h2>
    <p>
      गोपनीयता प्रश्न, डेटा अनुरोध या जानकारी संभालने से जुड़ी शिकायत के लिए
      <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a> पर लिखें।
    </p>

    <p>
      कृपया पासवर्ड, OTP, कार्ड नंबर, CVV, UPI PIN या अन्य भुगतान क्रेडेंशियल ईमेल से न भेजें।
    </p>

    <p class="fine">अंतिम अपडेट: ${updated()}।</p>
    <p class="fine">यह हिन्दी अनुवाद सुविधा के लिए है; किसी अंतर की स्थिति में अंग्रेज़ी संस्करण मान्य होगा।</p>
  `,

  terms: () => `
    <p class="eyebrow">शर्तें</p>
    <h1>उपयोग की शर्तें</h1>

    <h2>1. सेवा के बारे में</h2>
    <p>
      गीता रिफ्लेक्शन भगवद्गीता से प्रेरित एक डिजिटल चिंतन और शैक्षिक सेवा है।
      यह शास्त्र, अनुवाद, व्याख्या, चिंतन प्रश्न और संबंधित सुविधाएँ व्यक्तिगत उपयोग के लिए देता है।
      यह कोई धार्मिक प्राधिकरण नहीं है और किसी विशेष विश्वास प्रणाली को मानना आवश्यक नहीं करता।
    </p>

    <h2>2. चिकित्सा या आपातकालीन देखभाल नहीं</h2>
    <p>
      गीता रिफ्लेक्शन <strong>चिकित्सा, मनोवैज्ञानिक या आपातकालीन देखभाल नहीं है</strong>।
      साइट की कोई सामग्री निदान, उपचार योजना या योग्य विशेषज्ञ का विकल्प नहीं है।
      यदि आप तत्काल खतरे में हैं या आपको लगता है कि आप स्वयं या किसी और को नुकसान पहुँचा सकते हैं,
      तो चिंतन सुविधाओं का उपयोग रोकें और स्थानीय आपातकालीन या संकट सहायता से संपर्क करें।
      भारत में ${esc(c.name)} <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a> उपलब्ध है।
    </p>

    <h2>3. शास्त्र, अनुवाद और व्याख्या</h2>
    <p>
      शास्त्र के अंशों को शास्त्र के रूप में प्रस्तुत किया जाता है।
      अनुवाद अनुवाद हैं; सरल व्याख्याएँ, संदर्भ, चिंतन प्रश्न और अभ्यास
      Gita Reflection के लिए बनाई गई व्याख्याएँ हैं और पारंपरिक टीकाओं से अलग हो सकती हैं।
      इन्हें भगवद्गीता का मूल पाठ नहीं बताया जाता।
    </p>

    <p>
      कुछ व्याख्यात्मक लेखन AI की मदद से तैयार किया गया है।
      आपके लाइव चिंतन टेक्स्ट का मिलान AI से नहीं कराया जाता,
      जब तक कि भविष्य में इस नीति में स्पष्ट रूप से बदलाव न किया जाए।
    </p>

    <h2>4. पात्रता और जिम्मेदार उपयोग</h2>
    <p>
      आप जहाँ रहते हैं वहाँ लागू कानून के अनुसार सेवा का उपयोग करने के लिए पात्र होने चाहिए।
      आप साइट का दुरुपयोग, संचालन में हस्तक्षेप, बिना अनुमति पहुँच का प्रयास,
      दुर्भावनापूर्ण कोड अपलोड, किसी अन्य व्यक्ति का रूप धारण,
      भुगतान प्रणाली का दुरुपयोग या गैरकानूनी उद्देश्य के लिए सेवा का उपयोग नहीं करेंगे।
    </p>

    <h2>5. आपका खाता</h2>
    <p>
      ${
        remote()
          ? "आप अपने लॉग-इन प्रमाण-पत्र निजी रखने और अपने खाते से होने वाली गतिविधि के लिए जिम्मेदार हैं, सिवाय उन परिस्थितियों के जहाँ समस्या हमारी प्रणाली या आपके उचित नियंत्रण से बाहर किसी कारण से हुई हो। यदि खाता सुरक्षित नहीं रहा हो, तो हमें यथाशीघ्र बताएं।"
          : "लोकल मोड में आपका खाता और सहेजा डेटा आपके डिवाइस के ब्राउज़र में रहता है। साइट डेटा साफ़ करने, ब्राउज़र बदलने या डिवाइस खोने से यह डेटा हट सकता है, इसलिए जरूरी सामग्री की प्रति डाउनलोड रखें।"
      }
    </p>

    <h2>6. आपके चिंतन और सामग्री</h2>
    <p>
      आपके द्वारा बनाई गई सामग्री में जो अधिकार आपके पास हैं, वे आपके पास बने रहते हैं।
      आप Gita Reflection को केवल उतनी सीमित अनुमति देते हैं जितनी आपकी चुनी हुई सुविधा देने के लिए
      सामग्री को सहेजने, संसाधित करने, दिखाने और बैकअप करने में आवश्यक है।
      हम आपके निजी चिंतनों पर स्वामित्व का दावा नहीं करते।
    </p>

    <h2>7. प्रीमियम सदस्यता</h2>
    <p>
      प्रीमियम एक वैकल्पिक आवर्ती सदस्यता है।
      भुगतान की कीमत और बिलिंग अवधि भुगतान की पुष्टि से पहले दिखाई जाती है।
      वर्तमान योजनाओं में मासिक और वार्षिक सदस्यता शामिल हो सकती है।
      भुगतान Razorpay द्वारा संसाधित किया जाता है।
    </p>

    <p>
      सदस्यता शुरू करके आप चेकआउट में स्वीकृत भुगतान विधि
      और संबंधित recurring-payment mandate के अनुसार लागू आवर्ती भुगतान को अधिकृत करते हैं।
    </p>

    <p>
      सदस्यता रद्द करने से भविष्य का नवीनीकरण रुकता है।
      अलग से रिफंड स्वीकृत न होने पर, पहले से खरीदी गई भुगतान अवधि के अंत तक आपका Premium बना रहता है।
      विवरण <a href="#/refunds">रिफ़ंड और रद्दीकरण</a> नीति में हैं।
    </p>

    <h2>8. रिफ़ंड और रद्दीकरण</h2>
    <p>
      हमारे रिफ़ंड नियम Refunds &amp; cancellations पृष्ठ पर दिए गए हैं।
      इस नीति या इन शर्तों का कोई भी हिस्सा उन उपभोक्ता अधिकारों को समाप्त नहीं करता
      जिन्हें लागू कानून के तहत हटाया या छोड़ा नहीं जा सकता।
    </p>

    <h2>9. बौद्धिक संपदा</h2>
    <p>
      Gita Reflection का नाम, ब्रांडिंग, सॉफ़्टवेयर, इंटरफ़ेस,
      मूल व्याख्यात्मक लेखन, दृश्य डिज़ाइन और साइट सामग्री लागू बौद्धिक-संपदा कानूनों
      के अंतर्गत सुरक्षित हो सकती है और हमारे या संबंधित अधिकारधारक की संपत्ति बनी रहती है।
    </p>

    <p>
      आप निजी, गैर-व्यावसायिक उपयोग के लिए सेवा और अनुमत कार्ड/लिंक साझा कर सकते हैं।
      बिना अनुमति सेवा की बड़ी मात्रा को कॉपी, पुनर्प्रकाशित, बेचना,
      scrape या पुनर्वितरित न करें।
    </p>

    <h2>10. तीसरे पक्ष की सेवाएँ और लिंक</h2>
    <p>
      सेवा होस्टिंग, प्रमाणीकरण/डेटाबेस, ईमेल, भुगतान और साझा करने वाले प्रदाताओं पर निर्भर करती है।
      उनके अपने नियम और गोपनीयता नीतियाँ उनके द्वारा प्रदान की गई सेवाओं पर लागू हो सकती हैं।
      किसी तीसरे पक्ष की स्वतंत्र कार्रवाई, उपलब्धता या नीति के लिए हम जिम्मेदार नहीं हैं।
    </p>

    <h2>11. उपलब्धता और बदलाव</h2>
    <p>
      हम Gita Reflection उपलब्ध रखने का प्रयास करते हैं,
      लेकिन निरंतर या त्रुटि-मुक्त संचालन की गारंटी नहीं देते।
      सुरक्षा, तकनीकी, कानूनी या व्यावसायिक कारणों से सुविधाएँ जोड़ी,
      बदली, निलंबित या बंद की जा सकती हैं।
      भुगतान वाली सुविधाओं तक पहुँच को प्रभावित करने वाले महत्वपूर्ण बदलावों
      के बारे में उचित प्रयास से सूचना दी जाएगी।
    </p>

    <h2>12. निलंबन या समाप्ति</h2>
    <p>
      सेवा, उपयोगकर्ताओं या तीसरे पक्ष की सुरक्षा, दुरुपयोग या गैरकानूनी गतिविधि से निपटने,
      या कानूनी आवश्यकताओं का पालन करने के लिए आवश्यक होने पर हम पहुँच को निलंबित या समाप्त कर सकते हैं।
      जहाँ उचित होगा, हम सूचना और समस्या सुलझाने का अवसर देंगे।
    </p>

    <p>
      खाता हटाने या समाप्त होने से वे रिकॉर्ड अपने आप नहीं मिटते
      जिन्हें कानूनी या परिचालन कारणों से रखना आवश्यक हो।
    </p>

    <h2>13. अस्वीकरण और दायित्व की सीमा</h2>
    <p>
      सेवा चिंतन और शिक्षा के लिए है।
      लागू कानून द्वारा अनुमत अधिकतम सीमा तक, हम केवल साइट की सामग्री पर आधारित
      आपके निर्णयों, तीसरे पक्ष के कारण हुए व्यवधानों या खाते के दुरुपयोग से होने वाले नुकसान
      के लिए जिम्मेदार नहीं हैं।
    </p>

    <p>
      ऐसा कोई दायित्व सीमित नहीं किया जाता जिसे कानूनन सीमित करना संभव न हो।
    </p>

    <h2>14. लागू कानून</h2>
    <p>
      इन शर्तों की व्याख्या भारत में लागू कानून के अनुसार करने का उद्देश्य है,
      और आपके लिए लागू अनिवार्य उपभोक्ता या अन्य कानूनी अधिकार बने रहते हैं।
      कोई विवाद उस न्यायालय या मंच में निपटाया जाएगा जिसके पास वैध अधिकार क्षेत्र हो।
    </p>

    <h2>15. संपर्क</h2>
    <p>
      इन शर्तों से जुड़े प्रश्नों के लिए
      <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a> पर लिखें।
    </p>

    <p class="fine">अंतिम अपडेट: ${updated()}।</p>
    <p class="fine">यह हिन्दी अनुवाद सुविधा के लिए है; किसी अंतर की स्थिति में अंग्रेज़ी संस्करण मान्य होगा।</p>
  `,

  refunds: () => `
    <p class="eyebrow">रिफ़ंड और रद्दीकरण</p>
    <h1>रिफ़ंड और रद्दीकरण</h1>

    <p class="lead">
      यहाँ बताया गया है कि Gita Reflection Premium में रद्दीकरण और रिफ़ंड कैसे काम करते हैं।
    </p>

    <h2>1. प्रीमियम रद्द करना</h2>
    <ul>
      <li>आप अपने खाते से किसी भी समय Premium सदस्यता रद्द कर सकते हैं।</li>
      <li>वर्तमान बिलिंग अवधि के अंत में रद्द करने पर पहले से भुगतान की गई अवधि की समाप्ति तक Premium जारी रहता है।</li>
      <li>रद्दीकरण प्रभावी होने के बाद सदस्यता नवीनीकृत नहीं होगी और उस सदस्यता पर आगे का आवर्ती शुल्क नहीं लगना चाहिए।</li>
      <li>रद्दीकरण आपके चिंतन या अन्य सहेजी हुई निजी सामग्री को नहीं मिटाता।</li>
    </ul>

    <h2>2. Premium रिफ़ंड</h2>
    <ul>
      <li>
        अगर ग़लती से शुल्क कट गया, रद्दीकरण के बाद भी शुल्क लगा,
        या आप नवीनीकरण से पहले रद्द करना भूल गए,
        तो शुल्क की तारीख से <strong>7 दिनों के भीतर</strong>
        <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a> पर संपर्क करें।
      </li>

      <li>
        हम अनुरोध की समीक्षा करेंगे और जहाँ यह इस नीति के अंतर्गत आता है,
        संबंधित शुल्क का पूरा रिफ़ंड देंगे।
      </li>

      <li>
        लेन-देन पहचानने के लिए हम भुगतान रसीद या सदस्यता विवरण माँग सकते हैं।
        कार्ड नंबर, CVV, UPI PIN या बैंक पासवर्ड कभी न भेजें।
      </li>
    </ul>

    <h2>3. रद्दीकरण और रिफ़ंड अलग हैं</h2>
    <p>
      सदस्यता रद्द करने से भविष्य का नवीनीकरण रुकता है;
      इससे पहले से किए गए भुगतान का पैसा अपने आप वापस नहीं होता।
      रिफ़ंड ऊपर दिए नियमों और लागू कानून के अनुसार अलग से संभाला जाता है।
    </p>

    <h2>4. भुगतान माध्यम और समय</h2>
    <p>
      स्वीकृत रिफ़ंड आम तौर पर उसी भुगतान माध्यम में लौटाया जाता है
      जिसका उपयोग लेन-देन में हुआ था।
      पैसा खाते में दिखने में Razorpay, बैंक या भुगतान प्रदाता के कारण अलग समय लग सकता है।
    </p>

    <h2>5. डिजिटल उत्पाद</h2>
    <p>
      यदि भविष्य में Gita Reflection कोई डिजिटल जर्नल, टेम्पलेट या अन्य डाउनलोड बेचता है,
      तो खरीद से पहले उत्पाद पृष्ठ पर उसकी कीमत और डिलीवरी की जानकारी दी जाएगी।
    </p>

    <ul>
      <li>
        क्योंकि डिजिटल डाउनलोड तुरंत दिए जा सकते हैं,
        सफलतापूर्वक डिलीवर और डाउनलोड होने के बाद वे आम तौर पर non-refundable होंगे,
        सिवाय जहाँ कानून कुछ और कहता हो या फ़ाइल खराब/विवरण से भिन्न हो।
      </li>

      <li>
        यदि फ़ाइल नहीं मिली, खुल नहीं रही, या बताए गए उत्पाद से महत्वपूर्ण रूप से अलग है,
        तो 7 दिनों के भीतर संपर्क करें; हम सही प्रति या उचित रिफ़ंड देने का प्रयास करेंगे।
      </li>
    </ul>

    <h2>6. उपभोक्ता अधिकार</h2>
    <p>
      इस नीति की कोई बात उन रिफ़ंड, रद्दीकरण या उपभोक्ता सुरक्षा अधिकारों को सीमित नहीं करती
      जिन्हें लागू कानून के तहत कानूनी रूप से हटाया नहीं जा सकता।
    </p>

    <h2>7. संपर्क</h2>
    <p>
      रद्दीकरण या रिफ़ंड अनुरोध के लिए
      <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a> पर लिखें
      और खाते का ईमेल, संबंधित भुगतान/सदस्यता की तारीख और उपलब्ध भुगतान रसीद शामिल करें।
    </p>

    <p class="fine">अंतिम अपडेट: ${updated()}।</p>
    <p class="fine">यह हिन्दी अनुवाद सुविधा के लिए है; किसी अंतर की स्थिति में अंग्रेज़ी संस्करण मान्य होगा।</p>
  `,

  contact: () => `
    <p class="eyebrow">संपर्क</p>
    <h1>नमस्ते कहिए</h1>

    <p class="lead">
      हमें जानकर ख़ुशी होगी कि गीता रिफ्लेक्शन को और कोमल, और उपयोगी जगह कैसे बनाया जा सकता है।
    </p>

    <p>
      सामान्य प्रश्न, गोपनीयता अनुरोध, खाता सहायता, भुगतान प्रश्न या शिकायत के लिए
      <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a> पर लिखें।
    </p>

    <p>
      कृपया पासवर्ड, OTP, कार्ड नंबर, CVV, UPI PIN या बैंक क्रेडेंशियल ईमेल से न भेजें।
    </p>

    <div class="soft-card">
      <h2>अगर आपको अभी सहायता चाहिए</h2>
      <p>
        हम ईमेल पर परामर्श नहीं दे सकते।
        अगर आप कठिनाई में हैं, तो कृपया ${esc(c.name)}
        को <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a> पर
        (भारत, मुफ़्त, 24×7) या आपातकालीन सेवाओं को
        <a href="tel:${esc(c.emergency)}">${esc(c.emergency)}</a> पर कॉल करें।
        भारत के बाहर,
        <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com</a>
        पर स्थानीय हेल्पलाइनें मिलती हैं।
      </p>
    </div>

    <p class="fine">
      गोपनीयता या डेटा अनुरोधों के लिए ऊपर दिए गए ईमेल का उपयोग करें।
      खाता-स्तर के बदलाव से पहले हमें खाता स्वामित्व सत्यापित करना पड़ सकता है।
    </p>
  `
};

export function render(root, { mode }) {
  const pages = isHindi() ? PAGES_HI : PAGES;
  const page = pages[mode];

  root.innerHTML = `
    <article class="wrap narrow prose page-pad">
      ${
        page
          ? page()
          : `
            <h1>Page not found</h1>
            <p>Sorry, this page is not available.</p>
          `
      }
    </article>
  `;
}
