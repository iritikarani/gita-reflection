import { esc, divider } from "../ui.js";
import { CONFIG } from "../config.js";
import { VERSES } from "../data/verses.js";
import { backendMode } from "../store.js";
import { isHindi, locale } from "../i18n.js";

const remote = () => backendMode() === "supabase";

const c = CONFIG.crisis;
const updated = () => new Date(2026, 9, 5).toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });

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
    <p>You never need an account to reflect. Creating one lets you save reflections, follow the 7-day journey and see your monthly summary. ${remote()
      ? "Your account works on any device: log in on your phone or laptop and your reflections are there."
      : "Accounts are currently stored privately in your browser on this device — so they don't sync between devices yet."}</p>
    <h2>When someone may be in danger</h2>
    <p>If what you write suggests you may be at risk of harming yourself, we don't show a verse. Instead we show crisis support, because in that moment a person matters more than a teaching.</p>`,

  privacy: () => `
    <p class="eyebrow">Privacy</p>
    <h1>Privacy policy</h1>
    <p class="lead">${remote() ? "Short version: what you type is processed on your device, and only what you choose to save is stored — privately, in your account." : "Short version: what you write stays on your device."}</p>
    <h2>What we store, and where</h2>
    <ul>
      <li><strong>What you type to find a verse</strong> is matched to a teaching inside your browser. It is not sent to a server unless you choose to save it.</li>
      ${remote() ? `
      <li><strong>Your account</strong> (name, email and a securely hashed password) is managed by Supabase Auth, our authentication and database provider.</li>
      <li><strong>Reflections you save</strong>, saved verses, your 7-day journey and monthly notes are stored in our Supabase database. Database rules (row-level security) mean only you, when logged in, can read or change them.</li>
      <li>We use your email only for account messages such as confirming your address and resetting your password.</li>` : `
      <li><strong>Your reflections, account details and preferences</strong> are stored in your browser's local storage, on your device. They are not sent to our servers.</li>
      <li><strong>Passwords</strong> are never stored as text — only a salted PBKDF2 hash, also kept on your device.</li>`}
      <li><strong>Drafts in progress</strong> are kept in your browser's session storage and disappear when you close the tab.</li>
    </ul>
    <h2>What we don't do</h2>
    <ul>
      <li>We don't send what you type to any AI service.</li>
      <li>We don't sell data or show advertising.</li>
      <li>We don't use analytics or tracking cookies.</li>
    </ul>
    <h2>Third parties</h2>
    <p>Fonts are loaded from Google Fonts, which receives your IP address as part of a normal web request. If you look up a verse outside our curated library, the complete text is fetched from a public dataset hosted on GitHub Pages. ${remote() ? "Saved reflections and account details are processed by Supabase (supabase.com) on our behalf. " : ""}When you choose to share to WhatsApp, that service's own policy applies. Payments for Premium are handled by Razorpay (razorpay.com) under its own privacy policy.
    We never see or store your card, UPI or bank details — we only keep whether your subscription is active and when it renews.</p>
    <h2>Your control</h2>
    <p>${remote()
      ? "From your Profile you can download all your data, or delete your account — which permanently deletes your account and every reflection from our database."
      : "From your Profile you can download all your data or delete your account, which removes your reflections from this device. Clearing your browser's site data also removes everything."}</p>
    <p class="fine">Last updated: ${updated()}.</p>`,

  terms: () => `
    <p class="eyebrow">Terms</p>
    <h1>Terms of use</h1>
    <h2>A reflection tool</h2>
    <p>Gita Reflection offers verses from the Bhagavad Gita with translations and interpretations for personal reflection and education. It does not provide medical, psychological, legal or financial advice, and it is not a substitute for professional care. Do not use it in an emergency — call ${esc(c.emergency)} or ${esc(c.name)} at ${esc(c.phone)}.</p>
    <h2>Interpretations</h2>
    <p>Interpretive content (simple meanings, explanations, questions and practices) reflects one gentle reading of the text and may differ from traditional commentaries. It is offered humbly and without any claim of religious authority.</p>
    <h2>Your account</h2>
    <p>${remote()
      ? "Please keep your password private. You can download or delete your data at any time from your Profile."
      : "Accounts are stored in your browser. You are responsible for keeping your device secure. Because data lives on your device, clearing browser data or losing the device will remove it; please download a copy from your Profile if it matters to you."}</p>
    <h2>Paid features</h2>
    <p>The core experience is free. Optional paid plans and digital products, when available, will be described clearly before purchase. Digital products are delivered as downloads.</p>
    <h2>Sharing</h2>
    <p>You're welcome to share cards and verses for personal, non-commercial purposes.</p>`,

  refunds: () => `
    <p class="eyebrow">Refunds &amp; cancellations</p>
    <h1>Refunds and cancellations</h1>
    <p class="lead">We want paying for Gita Reflection to feel as calm as using it.</p>
    <h2>Premium membership</h2>
    <ul>
      <li>You can cancel Premium at any time. You keep Premium until the end of the period you've already paid for, and you won't be charged again.</li>
      <li>If you were charged by mistake, or forgot to cancel before a renewal, write to us within 7 days of the charge and we'll refund it in full.</li>
      <li>Your reflections are always yours. If Premium ends, nothing you've written is deleted; you can still read and download it.</li>
    </ul>
    <h2>Digital journals and resources</h2>
    <ul>
      <li>These are delivered instantly as downloads, so we don't usually offer refunds once a file has been downloaded.</li>
      <li>If a file doesn't arrive, won't open, or isn't what was described, contact us within 7 days and we'll send a working copy or refund you in full.</li>
    </ul>
    <h2>How refunds are paid</h2>
    <p>Approved refunds go back to the original payment method, usually within 5–7 working days, depending on your bank.</p>
    <h2>Contact</h2>
    <p>${CONFIG.contactEmail ? `Write to <a href="mailto:${esc(CONFIG.contactEmail)}">${esc(CONFIG.contactEmail)}</a> with your payment receipt.` : `Reach us through the <a href="#/contact">Contact</a> page with your payment receipt.`}</p>
    <p class="fine">Last updated: ${updated()}.</p>`,

  contact: () => `
    <p class="eyebrow">Contact</p>
    <h1>Say hello</h1>
    <p class="lead">We'd love to hear how Gita Reflection could be a kinder, more useful space.</p>
    ${CONFIG.contactEmail
      ? `<p>For any query, write to us at <a href="mailto:${esc(CONFIG.contactEmail)}">${esc(CONFIG.contactEmail)}</a>. We read every message, though replies may take a few days.</p>`
      : `<p>A contact address is being set up. In the meantime, thank you for being here.</p>`}
    <div class="soft-card">
      <h2>If you need support right now</h2>
      <p>We can't offer counselling by email. If you are struggling, please call ${esc(c.name)} at <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a> (India, free, 24×7) or emergency services at <a href="tel:${esc(c.emergency)}">${esc(c.emergency)}</a>. Outside India, <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a> lists local helplines.</p>
    </div>`
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
    <p>गीता रिफ्लेक्शन <strong>पेशेवर मानसिक-स्वास्थ्य देखभाल, चिकित्सा सलाह या थेरेपी का विकल्प नहीं है</strong>। शास्त्र दृष्टिकोण दे सकते हैं, पर वे उपचार नहीं हैं। अगर आप कठिनाई में हैं, तो किसी भरोसेमंद व्यक्ति या योग्य विशेषज्ञ से बात कीजिए। भारत में ${esc(c.name)} <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a> पर मुफ़्त, 24×7 सहायता देता है।</p>
    <h2>हम पाठ के साथ कैसा व्यवहार करते हैं</h2>
    <p>इस साइट पर हर शिक्षा साफ़-साफ़ चिह्नित परतों में दिखाई जाती है, ताकि शास्त्र और व्याख्या कभी आपस में न मिलें:</p>
    <dl class="layers-explained">
      <dt>मूल संस्कृत</dt><dd>श्लोक जैसा वह भगवद्गीता में है — देवनागरी में, IAST लिप्यंतरण के साथ।</dd>
      <dt>अनुवाद</dt><dd>श्लोक के मानक अर्थ से पढ़ने में आसान बनाया गया अंग्रेज़ी अनुवाद, और एक हिन्दी भावार्थ। अनुवाद में हमेशा कुछ चुनाव होते हैं; हम पाठ के क़रीब रहने का प्रयास करते हैं।</dd>
      <dt>व्याख्या</dt><dd>“सरल शब्दों में”, “यह आपसे क्यों बात कर सकता है”, संदर्भ, चिंतन प्रश्न और अभ्यास गीता रिफ्लेक्शन के लिए लिखी गई व्याख्याएँ हैं। ये शास्त्र नहीं हैं।</dd>
    </dl>
    <p>हमारी व्याख्यात्मक सामग्री AI की मदद से तैयार की गई है और विनम्रता से प्रस्तुत है। आपके उपयोग के दौरान साइट AI से कोई पाठ <strong>नहीं</strong> बनाती: आपके शब्दों को आपके ब्राउज़र में चलने वाले सरल नियमों से ${VERSES.length} चुने हुए श्लोकों से मिलाया जाता है।</p>`,

  how: () => `
    <p class="eyebrow">यह कैसे काम करता है</p>
    <h1>तीन शांत कदम</h1>
    <ol class="how-list">
      <li><h2>बताइए आप कैसा महसूस कर रहे हैं</h2><p>अंग्रेज़ी, हिन्दी या हिंग्लिश में लिखिए, कोई भावना चुनिए, या “मुझे नहीं पता मैं क्या महसूस कर रहा/रही हूँ” चुनिए। आप जो लिखते हैं, वह सिर्फ़ आपके ब्राउज़र में संसाधित होता है — किसी सर्वर पर नहीं भेजा जाता।</p></li>
      <li><h2>एक प्रासंगिक शिक्षा पाइए</h2><p>हम भावनाओं को बताने वाले शब्द खोजते हैं — जैसे “thak gaya”, “डर” या “overthinking” — और उन्हें चुने हुए श्लोकों के विषयों से मिलाते हैं। आपको मूल संस्कृत, लिप्यंतरण, अनुवाद, हिन्दी भावार्थ, और यह छोटी-सी व्याख्या दिखती है कि यह शिक्षा आपसे क्यों बात कर सकती है।</p></li>
      <li><h2>एक पल रुककर चिंतन कीजिए</h2><p>हर शिक्षा एक प्रश्न के साथ ख़त्म होती है। लिखिए, दो मिनट साँस के साथ ठहरिए, या बस पढ़िए। अगर रखना चाहें, तो अपनी यात्रा में सहेज लीजिए।</p></li>
    </ol>
    ${divider()}
    <h2>खाते</h2>
    <p>चिंतन के लिए कभी खाते की ज़रूरत नहीं। खाता बनाने से आप चिंतन सहेज सकते हैं, 7 दिन की यात्रा कर सकते हैं और मासिक सारांश देख सकते हैं। ${remote()
      ? "आपका खाता हर डिवाइस पर काम करता है: फ़ोन या लैपटॉप पर लॉग इन कीजिए और आपके चिंतन वहाँ होंगे।"
      : "अभी खाते आपके ब्राउज़र में, इसी डिवाइस पर निजी रूप से रखे जाते हैं — इसलिए वे अभी डिवाइसों के बीच सिंक नहीं होते।"}</p>
    <h2>जब कोई ख़तरे में हो सकता है</h2>
    <p>अगर आपके लिखे से लगे कि आप स्वयं को नुकसान पहुँचाने के ख़तरे में हो सकते हैं, तो हम श्लोक नहीं दिखाते। इसके बजाय हम संकट सहायता दिखाते हैं, क्योंकि उस पल में एक व्यक्ति किसी शिक्षा से ज़्यादा मायने रखता है।</p>`,

  privacy: () => `
    <p class="eyebrow">गोपनीयता</p>
    <h1>गोपनीयता नीति</h1>
    <p class="lead">${remote() ? "संक्षेप में: आप जो लिखते हैं वह आपके डिवाइस पर संसाधित होता है, और सिर्फ़ वही सहेजा जाता है जिसे आप सहेजना चुनते हैं — निजी रूप से, आपके खाते में।" : "संक्षेप में: आप जो लिखते हैं, वह आपके डिवाइस पर रहता है।"}</p>
    <h2>हम क्या और कहाँ रखते हैं</h2>
    <ul>
      <li><strong>श्लोक खोजने के लिए आप जो लिखते हैं</strong>, वह आपके ब्राउज़र के भीतर ही किसी शिक्षा से मिलाया जाता है। जब तक आप सहेजना न चुनें, यह किसी सर्वर पर नहीं भेजा जाता।</li>
      ${remote() ? `
      <li><strong>आपका खाता</strong> (नाम, ईमेल और सुरक्षित रूप से हैश किया गया पासवर्ड) Supabase Auth द्वारा संभाला जाता है, जो हमारा प्रमाणीकरण और डेटाबेस प्रदाता है।</li>
      <li><strong>आपके सहेजे चिंतन</strong>, सहेजे श्लोक, आपकी 7 दिन की यात्रा और मासिक नोट्स हमारे Supabase डेटाबेस में रखे जाते हैं। डेटाबेस के नियम (row-level security) सुनिश्चित करते हैं कि लॉग इन होने पर सिर्फ़ आप ही उन्हें पढ़ या बदल सकते हैं।</li>
      <li>हम आपका ईमेल सिर्फ़ खाते से जुड़े संदेशों के लिए उपयोग करते हैं, जैसे पता पुष्टि करना और पासवर्ड रीसेट करना।</li>` : `
      <li><strong>आपके चिंतन, खाते का विवरण और प्राथमिकताएँ</strong> आपके ब्राउज़र के लोकल स्टोरेज में, आपके डिवाइस पर रखी जाती हैं। ये हमारे सर्वरों पर नहीं भेजी जातीं।</li>
      <li><strong>पासवर्ड</strong> कभी सादे पाठ के रूप में नहीं रखे जाते — सिर्फ़ एक सॉल्टेड PBKDF2 हैश, वह भी आपके डिवाइस पर।</li>`}
      <li><strong>अधूरे ड्राफ़्ट</strong> आपके ब्राउज़र के सेशन स्टोरेज में रहते हैं और टैब बंद करने पर मिट जाते हैं।</li>
    </ul>
    <h2>हम क्या नहीं करते</h2>
    <ul>
      <li>आप जो लिखते हैं, हम उसे किसी AI सेवा को नहीं भेजते।</li>
      <li>हम डेटा नहीं बेचते और विज्ञापन नहीं दिखाते।</li>
      <li>हम एनालिटिक्स या ट्रैकिंग कुकीज़ का उपयोग नहीं करते।</li>
    </ul>
    <h2>तीसरे पक्ष</h2>
    <p>फ़ॉन्ट Google Fonts से लोड होते हैं, जिसे सामान्य वेब अनुरोध के हिस्से के रूप में आपका IP पता मिलता है। अगर आप चुने हुए संग्रह से बाहर का कोई श्लोक देखते हैं, तो पूरा पाठ GitHub Pages पर होस्ट किए गए एक सार्वजनिक डेटासेट से लाया जाता है। ${remote() ? "सहेजे गए चिंतन और खाते का विवरण हमारी ओर से Supabase (supabase.com) द्वारा संसाधित होते हैं। " : ""}जब आप WhatsApp पर साझा करना चुनते हैं, तो उस सेवा की अपनी नीति लागू होती है। प्रीमियम के भुगतान Razorpay (razorpay.com) द्वारा उसकी अपनी गोपनीयता नीति के तहत संभाले जाते हैं। हम आपके कार्ड, UPI या बैंक का विवरण न कभी देखते हैं, न रखते हैं — हम केवल यह रखते हैं कि आपकी सदस्यता सक्रिय है या नहीं, और कब नवीनीकृत होगी।</p>
    <h2>आपका नियंत्रण</h2>
    <p>${remote()
      ? "अपनी प्रोफ़ाइल से आप अपना सारा डेटा डाउनलोड कर सकते हैं, या अपना खाता हटा सकते हैं — जिससे आपका खाता और हर चिंतन हमारे डेटाबेस से स्थायी रूप से मिट जाता है।"
      : "अपनी प्रोफ़ाइल से आप अपना सारा डेटा डाउनलोड कर सकते हैं या खाता हटा सकते हैं, जिससे आपके चिंतन इस डिवाइस से हट जाते हैं। ब्राउज़र का साइट डेटा साफ़ करने से भी सब कुछ मिट जाता है।"}</p>
    <p class="fine">अंतिम अपडेट: ${updated()}।</p>
    <p class="fine">यह हिन्दी अनुवाद सुविधा के लिए है; किसी अंतर की स्थिति में अंग्रेज़ी संस्करण मान्य होगा।</p>`,

  terms: () => `
    <p class="eyebrow">शर्तें</p>
    <h1>उपयोग की शर्तें</h1>
    <h2>एक चिंतन साधन</h2>
    <p>गीता रिफ्लेक्शन व्यक्तिगत चिंतन और शिक्षा के लिए भगवद्गीता के श्लोक, अनुवाद और व्याख्याओं के साथ प्रस्तुत करता है। यह चिकित्सा, मनोवैज्ञानिक, क़ानूनी या वित्तीय सलाह नहीं देता, और पेशेवर देखभाल का विकल्प नहीं है। आपात स्थिति में इसका उपयोग न करें — ${esc(c.emergency)} पर या ${esc(c.name)} को ${esc(c.phone)} पर कॉल करें।</p>
    <h2>व्याख्याएँ</h2>
    <p>व्याख्यात्मक सामग्री (सरल अर्थ, व्याख्याएँ, प्रश्न और अभ्यास) पाठ की एक कोमल समझ है और पारंपरिक टीकाओं से अलग हो सकती है। यह विनम्रता से, बिना किसी धार्मिक प्राधिकार के दावे के प्रस्तुत है।</p>
    <h2>आपका खाता</h2>
    <p>${remote()
      ? "कृपया अपना पासवर्ड निजी रखें। आप कभी भी अपनी प्रोफ़ाइल से अपना डेटा डाउनलोड या हटा सकते हैं।"
      : "खाते आपके ब्राउज़र में रखे जाते हैं। अपने डिवाइस को सुरक्षित रखना आपकी ज़िम्मेदारी है। क्योंकि डेटा आपके डिवाइस पर है, ब्राउज़र डेटा साफ़ करने या डिवाइस खोने से वह मिट जाएगा; अगर यह आपके लिए मायने रखता है, तो प्रोफ़ाइल से एक प्रति डाउनलोड कर लें।"}</p>
    <h2>भुगतान वाली सुविधाएँ</h2>
    <p>मुख्य अनुभव मुफ़्त है। वैकल्पिक भुगतान वाले प्लान और डिजिटल उत्पाद, जब उपलब्ध होंगे, ख़रीदने से पहले साफ़-साफ़ बताए जाएँगे। डिजिटल उत्पाद डाउनलोड के रूप में दिए जाते हैं।</p>
    <h2>साझा करना</h2>
    <p>आप कार्ड और श्लोक व्यक्तिगत, ग़ैर-व्यावसायिक उद्देश्यों के लिए साझा कर सकते हैं।</p>
    <p class="fine">यह हिन्दी अनुवाद सुविधा के लिए है; किसी अंतर की स्थिति में अंग्रेज़ी संस्करण मान्य होगा।</p>`,

  refunds: () => `
    <p class="eyebrow">रिफ़ंड और रद्दीकरण</p>
    <h1>रिफ़ंड और रद्दीकरण</h1>
    <p class="lead">हम चाहते हैं कि गीता रिफ्लेक्शन के लिए भुगतान करना भी उतना ही शांत हो जितना इसका उपयोग।</p>
    <h2>प्रीमियम सदस्यता</h2>
    <ul>
      <li>आप प्रीमियम कभी भी रद्द कर सकते हैं। जिस अवधि का भुगतान हो चुका है, उसके अंत तक प्रीमियम रहेगा, और आगे कोई शुल्क नहीं लगेगा।</li>
      <li>अगर ग़लती से शुल्क कट गया, या नवीनीकरण से पहले रद्द करना भूल गए, तो शुल्क के 7 दिनों के भीतर हमें लिखिए — हम पूरा पैसा लौटा देंगे।</li>
      <li>आपके चिंतन हमेशा आपके हैं। प्रीमियम ख़त्म होने पर भी आपका लिखा कुछ नहीं मिटता; आप उसे पढ़ औ
