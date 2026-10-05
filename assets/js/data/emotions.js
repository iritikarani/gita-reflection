// Emotions, the words people use for them (English, Hindi, Hinglish),
// and the gentle language used to respond. All text here is interpretation
// written for Gita Reflection — never presented as scripture.

export const EMOTIONS = {
  tired: {
    label: "I'm tired",
    said: "I'm tired.",
    tags: ["tired", "exhausted", "burnout", "rest", "overwhelmed", "results"],
    group: "peace",
    bridge: "When you're tired, it can start to feel as if everything depends on you, all at once.",
    ack: "That sounds exhausting. Let's slow down for a moment.",
    questions: [
      "What is one thing you could stop carrying today, even for a little while?",
      "What would rest look like for you right now — truly?",
      "What would change if you focused only on what you can do today?"
    ]
  },
  scared: {
    label: "I'm scared",
    said: "I'm scared.",
    tags: ["fear", "future", "worry", "courage", "trust", "security"],
    group: "fear",
    bridge: "Fear often lives in the future — in what might happen, more than in what is happening right now.",
    ack: "Fear can feel so loud. You're safe to pause here.",
    questions: [
      "What are you afraid will happen if things don't go as planned?",
      "What is actually true right now, in this moment?",
      "What would a steady friend remind you of?"
    ]
  },
  overthinking: {
    label: "I'm overthinking",
    said: "I can't stop overthinking.",
    tags: ["overthinking", "mind", "restless", "worry", "rumination", "anxious"],
    group: "peace",
    bridge: "An overthinking mind is usually trying to protect you — it just doesn't know when to rest.",
    ack: "A busy mind is tiring. Let's give it somewhere gentle to land.",
    questions: [
      "What are you trying to control that may not be yours to control?",
      "Which thought keeps returning — and what is it asking for?",
      "If you set this question down for today, what would remain?"
    ]
  },
  failed: {
    label: "I failed",
    said: "I failed.",
    tags: ["failure", "effort", "mistake", "worth", "results", "perfectionism"],
    group: "growth",
    bridge: "When something doesn't work out, it's easy to let one result speak for your whole worth.",
    ack: "I'm sorry it didn't go the way you hoped. That hurts.",
    questions: [
      "What did you learn about yourself through trying?",
      "What would you say to a friend who failed at the same thing?",
      "What would change if you separated your effort from the result?"
    ]
  },
  confused: {
    label: "I'm confused",
    said: "I'm confused.",
    tags: ["confused", "decision", "unsure", "clarity", "lost", "choice"],
    group: "purpose",
    bridge: "Confusion can feel like being lost, but it's often the honest beginning of finding your way.",
    ack: "It's okay not to know yet. Let's sit with the question together.",
    questions: [
      "What do you already know, beneath the confusion?",
      "If you didn't have to decide today, what would you want to explore?",
      "What would you choose if no one else's expectations mattered?"
    ]
  },
  lonely: {
    label: "I'm lonely",
    said: "I feel lonely.",
    tags: ["lonely", "alone", "friend", "unseen", "comfort", "disconnected"],
    group: "relationships",
    bridge: "Loneliness can make it feel as if no one is on your side.",
    ack: "Feeling alone is heavy. Thank you for sharing it here.",
    questions: [
      "Who, even in a small way, has been on your side lately?",
      "What kind of connection are you missing most?",
      "How could you be a kinder companion to yourself today?"
    ]
  },
  angry: {
    label: "I'm angry",
    said: "I'm angry.",
    tags: ["anger", "conflict", "irritation", "react", "relationship", "resentment"],
    group: "relationships",
    bridge: "Anger is often a signal that something important to you feels threatened or unheard.",
    ack: "Anger is real and it's okay to feel it. Let's give it a little space before it decides anything.",
    questions: [
      "What does your anger want you to know?",
      "What would you say once the anger softens a little?",
      "What is underneath the anger — hurt, fear, or something else?"
    ]
  },
  lost: {
    label: "I feel lost",
    said: "I feel lost.",
    tags: ["lost", "purpose", "comparison", "identity", "confused", "stuck"],
    group: "purpose",
    bridge: "Feeling lost can mean you've outgrown an old path before the new one has appeared.",
    ack: "Feeling lost is disorienting. You don't need the whole map right now.",
    questions: [
      "What has felt truly yours, even in small moments?",
      "Whose path have you been trying to walk instead of your own?",
      "What is the smallest next step that feels honest?"
    ]
  },
  courage: {
    label: "I need courage",
    said: "I need courage.",
    tags: ["courage", "brave", "rise", "fear", "action", "honest"],
    group: "fear",
    bridge: "Courage rarely feels like confidence. Usually it feels like fear, with one small step taken anyway.",
    ack: "Asking for courage is itself a brave thing. Let's find some together.",
    questions: [
      "What would you do today if you trusted your own strength a little more?",
      "What is the smallest brave thing you could do this week?",
      "What would you attempt if winning and losing mattered a little less?"
    ]
  },
  // States offered after "I don't know what I feel"
  heavy: {
    label: "Heavy",
    said: "I feel heavy.",
    tags: ["heavy", "overwhelmed", "rest", "grief", "pain", "surrender"],
    group: "peace",
    bridge: "When everything feels heavy, even small things can take a lot of strength.",
    ack: "That heaviness sounds hard to carry. You can set it down here for a moment.",
    questions: [
      "What would it feel like to put the weight down, just for a few minutes?",
      "What part of this heaviness is yours, and what part belongs to someone or something else?",
      "What is one gentle thing you could do for yourself today?"
    ]
  },
  empty: {
    label: "Empty",
    said: "I feel empty.",
    tags: ["empty", "numb", "worth", "disconnected", "gratitude", "self"],
    group: "self",
    bridge: "Emptiness can be a quiet signal that something in you is asking for attention and care.",
    ack: "Emptiness is a real feeling too. Let's be gentle with it.",
    questions: [
      "When did you last feel even a little bit full — of joy, meaning, or connection?",
      "What small thing could you notice today as if for the first time?",
      "What might this emptiness be making room for?"
    ]
  },
  restless: {
    label: "Restless",
    said: "I feel restless.",
    tags: ["restless", "overthinking", "scattered", "focus", "craving", "mind"],
    group: "peace",
    bridge: "Restlessness often means the mind is looking for somewhere to settle.",
    ack: "Restlessness can feel like static. Let's find a still point.",
    questions: [
      "What is the 'wind' that keeps making your mind flicker?",
      "What does your restlessness want you to do — and what do you actually need?",
      "Where in your body do you feel this restlessness?"
    ]
  },
  numb: {
    label: "Numb",
    said: "I feel numb.",
    tags: ["numb", "tired", "empty", "rest", "temporary", "ordinary"],
    group: "self",
    bridge: "Numbness can be the mind's way of protecting you when things have felt like too much.",
    ack: "Numbness can be a way of coping. There's no need to force any feeling right now.",
    questions: [
      "What has been asking too much of you lately?",
      "What is one small sensation you can notice right now — warmth, sound, breath?",
      "What would gentle care look like for you this week?"
    ]
  },
  overwhelmed: {
    label: "Overwhelmed",
    said: "I feel overwhelmed.",
    tags: ["overwhelmed", "tired", "heavy", "pressure", "stuck", "rest"],
    group: "peace",
    bridge: "When everything arrives at once, it's natural to feel that none of it is manageable.",
    ack: "That's a lot to hold. Let's make it smaller, together.",
    questions: [
      "What would change if you focused only on what you can do today?",
      "Which one thing, if handled, would make everything else feel lighter?",
      "What could wait until tomorrow?"
    ]
  },
  // Default for free text we couldn't place
  general: {
    label: "Something else",
    said: "",
    tags: ["heavy", "balance", "peace", "steady", "overwhelmed"],
    group: "peace",
    bridge: "Whatever you're carrying, it makes sense to want a moment of perspective.",
    ack: "Thank you for sharing that. Let's take a breath with it.",
    questions: [
      "What would you like to feel by the end of today?",
      "What is within your control right now — and what isn't?",
      "What would a wise, kind friend say to you about this?"
    ]
  }
};

export const QUICK_CHOICES = ["tired", "scared", "overthinking", "failed", "confused", "lonely", "angry", "lost", "courage"];
export const UNKNOWN_STATES = ["heavy", "empty", "restless", "confused", "numb", "overwhelmed"];

// Groups shown on My Journey ("All, Peace, Fear, Relationships, Purpose, Self, Growth, Letting Go")
export const GROUPS = [
  { id: "peace", label: "Peace", pattern: "peace" },
  { id: "fear", label: "Fear", pattern: "uncertainty" },
  { id: "relationships", label: "Relationships", pattern: "relationships" },
  { id: "purpose", label: "Purpose", pattern: "purpose and direction" },
  { id: "self", label: "Self", pattern: "self-worth" },
  { id: "growth", label: "Growth", pattern: "growth" },
  { id: "letting-go", label: "Letting Go", pattern: "letting go" }
];

// Library category -> journey group
export const CATEGORY_GROUP = {
  "peace": "peace", "overthinking": "peace", "gratitude": "peace",
  "fear": "fear", "courage": "fear", "difficult-times": "fear",
  "relationships": "relationships",
  "purpose": "purpose",
  "self-worth": "self",
  "failure": "growth", "growth": "growth",
  "detachment": "letting-go"
};

// Words people actually type. Order does not matter; every match adds weight.
// Each entry: [regex, emotionKey]
export const LEXICON = [
  // English
  [/\b(tired|exhausted|drained|burn(ed|t)? ?out|no energy|fatigued|worn out|sleepy)\b/i, "tired"],
  [/\b(scared|afraid|fear|frightened|terrified|nervous|panic|worried about (the )?future|uncertain(ty)?)\b/i, "scared"],
  [/\b(overthink\w*|can'?t stop thinking|racing thoughts|ruminat\w*|anxious|anxiety|worry|worried|stress(ed)?|mind won'?t)\b/i, "overthinking"],
  [/\b(fail(ed|ure|ing)?|lost (the|my) job|rejected|rejection|didn'?t (get|clear|pass)|mistake|messed up|screwed up|not good enough|useless)\b/i, "failed"],
  [/\b(confus(ed|ion|ing)|don'?t know what to do|unsure|can'?t decide|decision|dilemma|torn between|should i)\b/i, "confused"],
  [/\b(lonely|alone|isolated|no one (cares|understands)|nobody|left out|no friends|miss (him|her|them))\b/i, "lonely"],
  [/\b(angry|anger|furious|mad at|irritated|annoyed|frustrat\w*|rage|hate|resent\w*)\b/i, "angry"],
  [/\b(lost|no purpose|purpose|meaning(less)?|direction|stuck|what am i doing|pointless|career)\b/i, "lost"],
  [/\b(should i (continue|quit|stay|leave|keep going)|whether (i|to) (should )?(continue|quit|stay|leave)|give up|giving up|keep going|quit)\b/i, "confused"],
  [/\b(falling behind|behind everyone|compar(e|ing|ison)|everyone else is)\b/i, "lost"],
  [/\b(courage|brave|strength|confidence|dare|need to face|scared to start)\b/i, "courage"],
  [/\b(heavy|weigh(ed|s|ing)? (me )?down|burden|grief|griev\w*|sad|sadness|heartbroken|breakup|broke up|loss|died|passed away)\b/i, "heavy"],
  [/\b(empty|hollow|nothing matters|void|worthless)\b/i, "empty"],
  [/\b(restless|can'?t sit still|distracted|scattered|can'?t focus|agitated)\b/i, "restless"],
  [/\b(numb|feel nothing|don'?t feel anything|disconnected)\b/i, "numb"],
  [/\b(overwhelm\w*|too much|so much to do|pressure|can'?t cope|drowning|exam|exams|deadline)\b/i, "overwhelmed"],
  // Hinglish (Roman Hindi)
  [/\b(thak (gaya|gayi|gaye|chuka|chuki)|thaka hua|thaki hui|thakaan|thakan|bahut tired)\b/i, "tired"],
  [/\b(dar (lag|lagta|lagti|raha|rahi)|darr|ghabrahat|ghabra|bhavishya|future ki (tension|chinta))\b/i, "scared"],
  [/\b(zyada soch|jyada soch|bahut soch|soch soch|dimag (shant|chal) nahi|tension|chinta|pareshan)\b/i, "overthinking"],
  [/\b(fail ho|haar gaya|haar gayi|nakam|asafal|galti)\b/i, "failed"],
  [/\b(chhod (du|doon|dun)|continue karu|haar maan)\b/i, "confused"],
  [/\b(samajh nahi|kya karu|kya karoon|kya karun|confuse|uljhan)\b/i, "confused"],
  [/\b(akela|akeli|akelapan|koi nahi hai|tanha)\b/i, "lonely"],
  [/\b(gussa|gusse|krodh|chidh)\b/i, "angry"],
  [/\b(bhatak|raasta nahi|rasta nahi|maksad|uddeshya|purpose nahi)\b/i, "lost"],
  [/\b(himmat|saahas|sahas|hausla)\b/i, "courage"],
  [/\b(mann bhari|man bhari|dil bhari|udaas|udas|dukh|dard)\b/i, "heavy"],
  [/\b(khali|khaali|sunapan)\b/i, "empty"],
  [/\b(bechain|bechaini|ashant|man nahi lag)\b/i, "restless"],
  [/\b(sab kuch zyada|bahut zyada ho gaya|bojh)\b/i, "overwhelmed"],
  // Hindi (Devanagari) — no \b, which does not work with Devanagari
  [/(थक|थकान|थका|थकी|ऊर्जा नहीं)/, "tired"],
  [/(डर|भय|घबराहट|घबरा|भविष्य)/, "scared"],
  [/(ज़्यादा सोच|ज्यादा सोच|बहुत सोच|चिंता|चिंतित|तनाव|परेशान)/, "overthinking"],
  [/(असफल|हार गया|हार गई|नाकाम|गलती|ग़लती)/, "failed"],
  [/(उलझन|भ्रम|समझ नहीं|क्या करूँ|क्या करूं|दुविधा)/, "confused"],
  [/(अकेला|अकेली|अकेलापन|तन्हा)/, "lonely"],
  [/(गुस्सा|क्रोध|चिढ़)/, "angry"],
  [/(भटक|रास्ता नहीं|उद्देश्य|मकसद)/, "lost"],
  [/(हिम्मत|साहस|हौसला)/, "courage"],
  [/(उदास|दुख|दुःख|भारी|शोक|दर्द)/, "heavy"],
  [/(खाली|सूनापन)/, "empty"],
  [/(बेचैन|अशांत)/, "restless"],
  [/(बोझ|बहुत ज़्यादा|सब कुछ एक साथ)/, "overwhelmed"]
];

// Phrases that indicate someone may be in danger. We err on the side of care.
const CRISIS_PATTERNS = [
  /\b(kill(ing)? myself|end (it all|my life|everything)|suicid\w*|want to die|wanna die|wish i (was|were) dead|better off dead|don'?t want to (live|be alive|exist)|no reason to live|not worth living|hurt(ing)? myself|self[- ]?harm|cut(ting)? myself|take my (own )?life|overdose)\b/i,
  /\b(marna chahta|marna chahti|mar jaun|mar jaana|mar jana chahta|jeena nahi|jeene ka mann nahi|jeene ka man nahi|khudkushi|aatmhatya|atmahatya|khud ko (khatam|nuksan|nuksaan))\b/i,
  /(आत्महत्या|मरना चाहता|मरना चाहती|मर जाऊं|मर जाऊँ|जीने का मन नहीं|जीना नहीं चाहता|जीना नहीं चाहती|खुद को नुकसान|ख़ुद को नुकसान|खुद को खत्म|ज़िंदगी खत्म)/
];

export function isCrisis(text) {
  const t = String(text || "");
  return CRISIS_PATTERNS.some(p => p.test(t));
}

// Returns emotion keys ranked by how strongly the text matches.
export function detectEmotions(text) {
  const t = String(text || "");
  const scores = {};
  for (const [pattern, key] of LEXICON) {
    if (pattern.test(t)) scores[key] = (scores[key] || 0) + 1;
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

// Hindi (gender-neutral phrasing). Interpretation written for Gita Reflection.
const EMOTIONS_HI = {
  tired: { label: "थकान है", said: "मुझे बहुत थकान है।",
    bridge: "जब थकान हो, तो लगने लगता है कि सब कुछ एक साथ आप पर ही निर्भर है।",
    ack: "यह सच में थका देने वाला लगता है। आइए, एक पल के लिए धीमे हो जाएँ।",
    questions: ["आज, थोड़ी देर के लिए ही सही, आप कौन-सा एक बोझ उठाना बंद कर सकते हैं?", "अभी आपके लिए सच्चा विश्राम कैसा दिखेगा?", "अगर आप सिर्फ़ उस पर ध्यान दें जो आज कर सकते हैं, तो क्या बदलेगा?"] },
  scared: { label: "डर लग रहा है", said: "मुझे डर लग रहा है।",
    bridge: "डर अक्सर भविष्य में रहता है — जो हो सकता है उसमें, उससे ज़्यादा जो अभी हो रहा है।",
    ack: "डर बहुत ज़ोर से बोल सकता है। आप यहाँ रुककर साँस ले सकते हैं।",
    questions: ["अगर चीज़ें योजना के अनुसार न हों, तो आपको किस बात का डर है?", "इस पल, अभी, वास्तव में क्या सच है?", "एक स्थिर मित्र आपको क्या याद दिलाता?"] },
  overthinking: { label: "मन बहुत सोच रहा है", said: "मन सोचना बंद ही नहीं कर रहा।",
    bridge: "ज़्यादा सोचने वाला मन अक्सर आपकी रक्षा करने की कोशिश कर रहा होता है — बस उसे पता नहीं कि कब आराम करना है।",
    ack: "व्यस्त मन थका देता है। आइए, उसे टिकने के लिए कोई कोमल जगह दें।",
    questions: ["आप ऐसा क्या नियंत्रित करने की कोशिश कर रहे हैं जो शायद आपके नियंत्रण में है ही नहीं?", "कौन-सा विचार बार-बार लौट रहा है — और वह क्या माँग रहा है?", "अगर आप आज के लिए यह प्रश्न नीचे रख दें, तो क्या बचेगा?"] },
  failed: { label: "मुझसे नहीं हो पाया", said: "मुझसे नहीं हो पाया।",
    bridge: "जब कुछ नहीं बनता, तो एक परिणाम को अपनी पूरी कीमत तय करने देना आसान हो जाता है।",
    ack: "मुझे दुख है कि बात आपकी आशा के अनुसार नहीं बनी। यह चुभता है।",
    questions: ["कोशिश करते हुए आपने अपने बारे में क्या सीखा?", "उसी चीज़ में असफल हुए किसी मित्र से आप क्या कहते?", "अगर आप अपने प्रयास को परिणाम से अलग करके देखें, तो क्या बदलेगा?"] },
  confused: { label: "उलझन में हूँ", said: "मैं उलझन में हूँ।",
    bridge: "उलझन भटकने जैसी लग सकती है, पर अक्सर यह रास्ता खोजने की ईमानदार शुरुआत होती है।",
    ack: "अभी न जानना ठीक है। आइए, इस प्रश्न के साथ थोड़ी देर बैठें।",
    questions: ["उलझन के नीचे, आप पहले से क्या जानते हैं?", "अगर आज निर्णय लेना ज़रूरी न होता, तो आप क्या खोजना चाहते?", "अगर किसी और की अपेक्षाएँ मायने न रखतीं, तो आप क्या चुनते?"] },
  lonely: { label: "अकेलापन लग रहा है", said: "मुझे अकेलापन लग रहा है।",
    bridge: "अकेलापन ऐसा महसूस करा सकता है जैसे कोई आपके साथ नहीं है।",
    ack: "अकेलापन भारी होता है। यहाँ बताने के लिए धन्यवाद।",
    questions: ["हाल में, छोटे से तरीके से भी, कौन आपके साथ रहा है?", "आपको किस तरह के जुड़ाव की सबसे ज़्यादा कमी लग रही है?", "आज आप स्वयं के लिए एक ज़्यादा दयालु साथी कैसे बन सकते हैं?"] },
  angry: { label: "गुस्सा आ रहा है", said: "मुझे गुस्सा आ रहा है।",
    bridge: "गुस्सा अक्सर संकेत होता है कि आपके लिए कोई ज़रूरी चीज़ ख़तरे में या अनसुनी लग रही है।",
    ack: "गुस्सा सच्चा है और उसे महसूस करना ठीक है। आइए, उसके कुछ तय करने से पहले उसे थोड़ी जगह दें।",
    questions: ["आपका गुस्सा आपको क्या बताना चाहता है?", "गुस्सा थोड़ा शांत होने पर आप क्या कहेंगे?", "गुस्से के नीचे क्या है — चोट, डर, या कुछ और?"] },
  lost: { label: "रास्ता नहीं सूझ रहा", said: "मुझे रास्ता नहीं सूझ रहा।",
    bridge: "भटका हुआ महसूस करने का अर्थ हो सकता है कि नया रास्ता दिखने से पहले ही आप पुराने से आगे बढ़ चुके हैं।",
    ack: "रास्ता न सूझना बेचैन करता है। अभी आपको पूरा नक्शा नहीं चाहिए।",
    questions: ["छोटे पलों में भी, क्या चीज़ सच में आपकी अपनी लगी है?", "आप अपने रास्ते की जगह किसका रास्ता चलने की कोशिश कर रहे हैं?", "अगला सबसे छोटा कदम कौन-सा है जो ईमानदार लगता है?"] },
  courage: { label: "मुझे हिम्मत चाहिए", said: "मुझे हिम्मत चाहिए।",
    bridge: "साहस शायद ही कभी आत्मविश्वास जैसा लगता है। अक्सर यह डर जैसा लगता है — फिर भी उठाया गया एक छोटा कदम।",
    ack: "हिम्मत माँगना अपने आप में एक साहसी बात है। आइए, साथ मिलकर थोड़ी ढूँढें।",
    questions: ["अगर आप अपनी शक्ति पर थोड़ा और भरोसा करते, तो आज क्या करते?", "इस हफ़्ते आप सबसे छोटा साहसी काम क्या कर सकते हैं?", "अगर जीत और हार थोड़ा कम मायने रखतीं, तो आप क्या करने की कोशिश करते?"] },
  heavy: { label: "भारी", said: "मन भारी है।",
    bridge: "जब सब कुछ भारी लगे, तो छोटी चीज़ों में भी बहुत ताक़त लगती है।",
    ack: "यह भारीपन उठाना कठिन लगता है। आप इसे यहाँ एक पल के लिए नीचे रख सकते हैं।",
    questions: ["कुछ मिनटों के लिए ही सही, यह बोझ नीचे रख देना कैसा लगेगा?", "इस भारीपन का कौन-सा हिस्सा आपका है, और कौन-सा किसी और व्यक्ति या चीज़ का?", "आज आप अपने लिए कौन-सी एक कोमल चीज़ कर सकते हैं?"] },
  empty: { label: "ख़ाली", said: "भीतर ख़ालीपन है।",
    bridge: "ख़ालीपन एक शांत संकेत हो सकता है कि आपके भीतर कुछ ध्यान और देखभाल माँग रहा है।",
    ack: "ख़ालीपन भी एक सच्ची भावना है। आइए, इसके साथ कोमल रहें।",
    questions: ["पिछली बार कब आपने थोड़ा-सा भी भराव महसूस किया — आनंद, अर्थ या जुड़ाव का?", "आज आप कौन-सी छोटी चीज़ ऐसे देख सकते हैं जैसे पहली बार देख रहे हों?", "यह ख़ालीपन शायद किस चीज़ के लिए जगह बना रहा है?"] },
  restless: { label: "बेचैन", said: "मन बेचैन है।",
    bridge: "बेचैनी का अर्थ अक्सर यह होता है कि मन कहीं ठहरने की जगह खोज रहा है।",
    ack: "बेचैनी शोर जैसी लग सकती है। आइए, एक ठहरा हुआ बिंदु खोजें।",
    questions: ["वह कौन-सी 'हवा' है जो आपके मन की लौ को बार-बार डगमगाती है?", "आपकी बेचैनी आपसे क्या करवाना चाहती है — और आपको वास्तव में क्या चाहिए?", "शरीर में यह बेचैनी आपको कहाँ महसूस होती है?"] },
  numb: { label: "सुन्न", said: "मन सुन्न-सा है।",
    bridge: "सुन्नपन मन का आपको बचाने का तरीका हो सकता है, जब चीज़ें बहुत ज़्यादा हो गई हों।",
    ack: "सुन्नपन सामना करने का एक तरीका हो सकता है। अभी कोई भावना ज़बरदस्ती लाने की ज़रूरत नहीं।",
    questions: ["हाल में आपसे बहुत ज़्यादा क्या माँगा जा रहा है?", "अभी आप कौन-सी एक छोटी अनुभूति महसूस कर सकते हैं — गर्माहट, आवाज़, साँस?", "इस हफ़्ते आपके लिए कोमल देखभाल कैसी दिखेगी?"] },
  overwhelmed: { label: "सब बहुत ज़्यादा है", said: "सब कुछ बहुत ज़्यादा लग रहा है।",
    bridge: "जब सब कुछ एक साथ आ जाए, तो यह लगना स्वाभाविक है कि कुछ भी सँभलने लायक नहीं।",
    ack: "यह बहुत कुछ है थामने के लिए। आइए, इसे साथ मिलकर छोटा करें।",
    questions: ["अगर आप सिर्फ़ उस पर ध्यान दें जो आज कर सकते हैं, तो क्या बदलेगा?", "कौन-सी एक चीज़ सँभल जाए तो बाकी सब हल्का लगेगा?", "क्या कल तक इंतज़ार कर सकता है?"] },
  general: { label: "कुछ और", said: "",
    bridge: "आप जो भी उठाए हुए हैं, उसके लिए एक पल का नया दृष्टिकोण चाहना स्वाभाविक है।",
    ack: "बताने के लिए धन्यवाद। आइए, इसके साथ एक साँस लें।",
    questions: ["आज के अंत तक आप क्या महसूस करना चाहेंगे?", "अभी आपके नियंत्रण में क्या है — और क्या नहीं?", "एक समझदार, दयालु मित्र इस बारे में आपसे क्या कहता?"] }
};

const GROUPS_HI = {
  "peace": { label: "शांति", pattern: "शांति" },
  "fear": { label: "डर", pattern: "अनिश्चितता" },
  "relationships": { label: "रिश्ते", pattern: "रिश्तों" },
  "purpose": { label: "उद्देश्य", pattern: "उद्देश्य और दिशा" },
  "self": { label: "स्वयं", pattern: "आत्म-मूल्य" },
  "growth": { label: "विकास", pattern: "विकास" },
  "letting-go": { label: "छोड़ना", pattern: "छोड़ने" }
};

for (const [k, e] of Object.entries(EMOTIONS)) e.hiText = EMOTIONS_HI[k];
for (const g of GROUPS) g.hiText = GROUPS_HI[g.id];
