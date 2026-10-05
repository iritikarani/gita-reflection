// Premium guided programs. Each day pairs a curated verse (its meaning, question
// and practice come from verses.js / verses-hi.js) with a day theme and a
// journaling prompt. [verseId, English theme, Hindi theme]
export const PROGRAM_DAYS = {
  "14-steadiness": [
    ["2.14", "Feelings pass", "भावनाएँ गुज़रती हैं"], ["2.15", "A steady centre", "एक स्थिर केंद्र"],
    ["2.48", "Evenness", "समता"], ["2.38", "Beyond winning and losing", "जीत-हार से परे"],
    ["2.56", "Not ruled by feeling", "भावनाओं के वश में नहीं"], ["6.5", "Your own friend", "स्वयं के मित्र"],
    ["6.6", "The mind as an ally", "मन एक साथी"], ["6.7", "Praise and blame", "प्रशंसा और निंदा"],
    ["6.17", "Balance in daily life", "रोज़मर्रा में संतुलन"], ["6.19", "The still flame", "स्थिर लौ"],
    ["6.26", "Returning", "बार-बार लौटना"], ["6.35", "Practice and letting go", "अभ्यास और वैराग्य"],
    ["12.18", "Steady among people", "लोगों के बीच स्थिर"], ["2.70", "Like the ocean", "समुद्र की तरह"]
  ],
  "30-inner-peace": [
    ["2.66", "Peace before happiness", "सुख से पहले शांति"], ["2.14", "This too will pass", "यह भी गुज़रेगा"],
    ["6.34", "The restless mind", "चंचल मन"], ["6.35", "Gentle practice", "कोमल अभ्यास"],
    ["6.26", "Coming back", "लौट आना"], ["6.19", "Stillness", "ठहराव"],
    ["2.62", "Where spirals begin", "भँवर कहाँ शुरू होता है"], ["2.63", "When anger clouds", "जब क्रोध ढक ले"],
    ["3.37", "Inner restlessness", "भीतर की बेचैनी"], ["5.22", "Quieter joys", "शांत आनंद"],
    ["2.70", "The ocean", "समुद्र"], ["2.71", "Holding lightly", "हल्के हाथ से थामना"],
    ["2.47", "Effort, not outcome", "प्रयास, परिणाम नहीं"], ["5.10", "The lotus leaf", "कमल का पत्ता"],
    ["6.17", "Rest is part of the path", "विश्राम भी मार्ग है"], ["6.5", "Kindness to yourself", "स्वयं से दया"],
    ["6.6", "Befriending the mind", "मन से मित्रता"], ["6.7", "Praise and criticism", "प्रशंसा और आलोचना"],
    ["2.56", "Steady wisdom", "स्थिर बुद्धि"], ["2.15", "The steady one", "धीर व्यक्ति"],
    ["12.13", "Forgiveness", "क्षमा"], ["12.15", "Giving peace", "शांति देना"],
    ["17.15", "Gentle speech", "कोमल वाणी"], ["5.29", "A friend to all", "सबके सुहृद"],
    ["9.22", "You are cared for", "आपकी देखभाल होती है"], ["9.26", "Small offerings", "छोटी भेंटें"],
    ["7.8", "The sacred in the ordinary", "साधारण में पवित्र"], ["10.20", "Within your heart", "आपके हृदय में"],
    ["15.7", "You belong", "आप यहीं के हैं"], ["18.66", "Do not grieve", "शोक मत करो"]
  ],
  "30-purpose": [
    ["2.7", "Admitting confusion", "उलझन स्वीकारना"], ["2.3", "Remembering your strength", "अपनी शक्ति याद करना"],
    ["3.8", "The next small step", "अगला छोटा कदम"], ["3.35", "Your own path", "अपना रास्ता"],
    ["2.47", "Your part", "आपका हिस्सा"], ["2.48", "Balanced action", "संतुलित कर्म"],
    ["2.50", "Skill in action", "कर्म में कुशलता"], ["3.19", "Work without applause", "बिना तालियों के काम"],
    ["2.38", "Beyond the scoreboard", "स्कोरबोर्ड से परे"], ["2.40", "Nothing is wasted", "कुछ भी व्यर्थ नहीं"],
    ["4.38", "Clarity takes time", "स्पष्टता समय लेती है"], ["4.39", "Trust and practice", "श्रद्धा और अभ्यास"],
    ["6.40", "Sincere effort", "सच्चा प्रयास"], ["18.48", "Imperfect is enough", "अपूर्ण भी काफ़ी है"],
    ["16.1", "Courage first", "पहले साहस"], ["4.36", "A fresh start", "नई शुरुआत"],
    ["6.5", "Lifting yourself", "स्वयं को उठाना"], ["2.13", "You have changed before", "आप पहले भी बदले हैं"],
    ["2.22", "Endings and beginnings", "अंत और आरंभ"], ["2.20", "What cannot be lost", "जो खो नहीं सकता"],
    ["10.20", "The sacred within", "भीतर का पवित्र"], ["15.7", "Your worth", "आपका मूल्य"],
    ["7.8", "Strength in you", "आपमें शक्ति"], ["9.26", "What you can offer", "आप क्या दे सकते हैं"],
    ["6.32", "Seeing others", "दूसरों को देखना"], ["12.13", "A kind heart", "दयालु हृदय"],
    ["17.15", "Speaking your truth", "अपना सच कहना"], ["2.70", "Desires and direction", "इच्छाएँ और दिशा"],
    ["18.63", "Reflect, then choose", "सोचिए, फिर चुनिए"], ["18.78", "Wisdom and action", "ज्ञान और कर्म"]
  ]
};

// Journaling prompts, rotating through each program.
export const PROGRAM_PROMPTS = [
  ["What did today's teaching stir in you?", "आज की शिक्षा ने आपके भीतर क्या जगाया?"],
  ["Describe one moment from this week where this verse could have helped.", "इस हफ़्ते का एक पल लिखिए जहाँ यह श्लोक मदद कर सकता था।"],
  ["What would change this week if you lived this teaching a little more?", "अगर आप इस शिक्षा को थोड़ा और जीते, तो इस हफ़्ते क्या बदलता?"],
  ["Write a few lines to yourself from the steadiest version of you.", "अपने सबसे स्थिर रूप की ओर से स्वयं को कुछ पंक्तियाँ लिखिए।"],
  ["What are you ready to set down, and what are you ready to begin?", "आप क्या नीचे रखने को तैयार हैं, और क्या शुरू करने को?"]
];

// Deeper prompts for Premium reflections (added to the usual single question).
export const DEEPER_PROMPTS = [
  ["If this feeling could speak, what would it ask you for?", "अगर यह भावना बोल पाती, तो आपसे क्या माँगती?"],
  ["What part of this situation is within your control today — and what isn't?", "आज इस स्थिति का कौन-सा हिस्सा आपके नियंत्रण में है — और कौन-सा नहीं?"],
  ["Imagine yourself a year from now. What would you want to remember about this moment?", "एक साल बाद के स्वयं की कल्पना कीजिए। इस पल के बारे में आप क्या याद रखना चाहेंगे?"],
  ["Where in your body do you feel this, and what happens when you breathe into it?", "यह आपको शरीर में कहाँ महसूस होता है, और उसमें साँस लेने पर क्या होता है?"],
  ["What would the steadiest version of you do next?", "आपका सबसे स्थिर रूप आगे क्या करता?"],
  ["Which belief is making this heavier than it needs to be?", "कौन-सा विश्वास इसे ज़रूरत से ज़्यादा भारी बना रहा है?"]
];

// Prompts offered in the private journal.
export const JOURNAL_PROMPTS = [
  ["What is on your mind right now?", "अभी आपके मन में क्या है?"],
  ["What are you grateful for today, even in a small way?", "आज आप किस बात के लिए आभारी हैं, छोटे से तरीके से भी?"],
  ["What do you need to let go of?", "आपको क्या छोड़ने की ज़रूरत है?"],
  ["What would a kind friend tell you today?", "आज एक दयालु मित्र आपसे क्या कहता?"],
  ["What small thing could you do tomorrow to care for yourself?", "कल अपनी देखभाल के लिए आप कौन-सी छोटी चीज़ कर सकते हैं?"]
];
