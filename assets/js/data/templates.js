// Printable journal templates: used by the Templates page and the PDF journaling pack.
// Each section: [[English label, Hindi label], number of writing lines]
export const TEMPLATES = [
  {
    id: "daily", verse: "2.14",
    title: ["Daily reflection page", "दैनिक चिंतन पन्ना"],
    desc: ["One page for one quiet moment: how you feel, a shlok, what it tells you, and three small gratitudes.", "एक शांत पल के लिए एक पन्ना: आप कैसा महसूस कर रहे हैं, एक श्लोक, वह आपसे क्या कहता है, और तीन छोटी कृतज्ञताएँ।"],
    sections: [
      [["Date", "तारीख़"], 1],
      [["How I'm feeling today", "आज मैं कैसा महसूस कर रहा/रही हूँ"], 3],
      [["Today's shlok (chapter.verse)", "आज का श्लोक (अध्याय.श्लोक)"], 2],
      [["What it may be telling me", "यह मुझसे क्या कह सकता है"], 5],
      [["One small practice for today", "आज के लिए एक छोटा अभ्यास"], 2],
      [["Three things I'm grateful for", "तीन बातें जिनके लिए मैं आभारी हूँ"], 3]
    ]
  },
  {
    id: "weekly", verse: "2.70",
    title: ["Weekly review", "साप्ताहिक समीक्षा"],
    desc: ["Look back gently at the week: what returned, what stayed with you, what you're ready to set down.", "हफ़्ते को कोमलता से देखिए: क्या बार-बार लौटा, क्या साथ रहा, और आप क्या नीचे रखने को तैयार हैं।"],
    sections: [
      [["Week of", "सप्ताह"], 1],
      [["Feelings and themes I kept returning to", "भावनाएँ और विषय जिन पर मैं बार-बार लौटा/लौटी"], 4],
      [["A verse that stayed with me", "एक श्लोक जो मेरे साथ रहा"], 3],
      [["What I'm ready to let go of", "मैं क्या छोड़ने को तैयार हूँ"], 3],
      [["What I'm carrying forward", "मैं आगे क्या साथ ले जा रहा/रही हूँ"], 3],
      [["One intention for next week", "अगले हफ़्ते के लिए एक संकल्प"], 2]
    ]
  },
  {
    id: "decision", verse: "18.63",
    title: ["Decision worksheet", "निर्णय कार्यपत्र"],
    desc: ["“Reflect on it fully, then do as you choose.” A page for thinking a choice through, inspired by Gita 18.63, 2.47 and 3.35.", "“इस पर पूरी तरह विचार करो, फिर जैसा चाहो वैसा करो।” गीता 18.63, 2.47 और 3.35 से प्रेरित, किसी निर्णय को सोचने का एक पन्ना।"],
    sections: [
      [["The choice in front of me", "मेरे सामने का निर्णय"], 2],
      [["What I already know", "मैं पहले से क्या जानता/जानती हूँ"], 3],
      [["What I'm afraid of", "मुझे किस बात का डर है"], 3],
      [["What is in my control — and what isn't (2.47)", "क्या मेरे नियंत्रण में है — और क्या नहीं (2.47)"], 4],
      [["Which option feels like my own path? (3.35)", "कौन-सा विकल्प मेरा अपना रास्ता लगता है? (3.35)"], 3],
      [["After sleeping on it, I choose…", "एक रात सोचने के बाद, मैं चुनता/चुनती हूँ…"], 2]
    ]
  },
  {
    id: "gratitude", verse: "9.26",
    title: ["Gratitude page", "कृतज्ञता पन्ना"],
    desc: ["“A leaf, a flower, a fruit or a little water.” Small things, noticed with love — inspired by Gita 9.26.", "“एक पत्ता, एक फूल, एक फल या थोड़ा जल।” प्रेम से देखी गई छोटी चीज़ें — गीता 9.26 से प्रेरित।"],
    sections: [
      [["Date", "तारीख़"], 1],
      [["Small things I noticed today", "आज जिन छोटी चीज़ों पर मेरा ध्यान गया"], 5],
      [["Someone who has quietly been on my side", "कोई जो चुपचाप मेरे साथ रहा"], 2],
      [["A small offering I can make today", "आज मैं कौन-सी छोटी भेंट दे सकता/सकती हूँ"], 3]
    ]
  }
];
