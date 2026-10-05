// "7 Days with the Gita" — a gentle guided journey.
export const SEVEN_DAYS = [
  {
    day: 1, theme: "Letting Go", verse: "2.47",
    explanation: "We begin where the Gita's most famous teaching begins: with the difference between effort and outcome. Today isn't about caring less. It's about noticing how much energy goes into holding on to results that were never fully ours to hold.",
    question: "What outcome are you gripping most tightly right now?",
    prompt: "Write about one situation where you've done your part. What would it feel like to let the rest unfold without you guarding it?",
    practice: "Choose one task today. Do it as well as you can, then consciously release how it is received."
  },
  {
    day: 2, theme: "Fear", verse: "2.40",
    explanation: "Fear tells us that if we can't do something perfectly, we shouldn't start. The Gita answers gently: no sincere effort is wasted, and even a little practice protects us from great fear.",
    question: "What would you begin if you knew no sincere effort is ever wasted?",
    prompt: "Describe a fear that has been quietly shaping your choices. Where did it come from, and what does it protect you from?",
    practice: "Take one small step toward something you've been avoiding. Five minutes is enough."
  },
  {
    day: 3, theme: "Action", verse: "3.8",
    explanation: "When we're stuck, thinking more often keeps us stuck. Krishna reminds Arjuna that life itself is action — and that one small movement can loosen what thinking alone cannot.",
    question: "What is the smallest next action you could take today?",
    prompt: "List three things you've been thinking about doing. Beside each, write the tiniest possible first step.",
    practice: "Set a ten-minute timer and work on just one of those first steps."
  },
  {
    day: 4, theme: "Failure", verse: "6.40",
    explanation: "Arjuna asks what happens to someone who tries sincerely but falls short. Krishna's answer is one of the tenderest in the Gita: 'One who does good, my dear friend, never comes to a bad end.'",
    question: "What good did your effort create, even when the result disappointed you?",
    prompt: "Write about something that didn't work out. What did trying teach you that succeeding might not have?",
    practice: "Tell someone about something you tried this year — not how it ended, but why you tried."
  },
  {
    day: 5, theme: "Detachment", verse: "5.10",
    explanation: "The lotus leaf lives in water but stays dry. Detachment in the Gita isn't distance or coldness — it's being fully present without being soaked through by everything around you.",
    question: "Whose mood or opinion have you been carrying as if it were your own?",
    prompt: "Write about a relationship or situation that tends to 'soak into' you. What would being a lotus leaf look like there?",
    practice: "After a difficult interaction today, wash your hands slowly and let the moment go with the water."
  },
  {
    day: 6, theme: "Self", verse: "6.5",
    explanation: "'The self alone is the friend of the self.' Today's reflection turns to the relationship you have with yourself — the voice you hear most, and the one that shapes everything else.",
    question: "If you spoke to yourself like a good friend, what would you say today?",
    prompt: "Write down something harsh you often say to yourself. Then rewrite it in the voice of someone who loves you.",
    practice: "Each time you notice harsh self-talk today, add one kinder sentence after it."
  },
  {
    day: 7, theme: "Peace", verse: "2.70",
    explanation: "We end with the ocean: always receiving rivers, never overflowing. Peace in the Gita isn't the absence of life's currents. It's a depth that can receive them.",
    question: "What has this week taught you about where your peace comes from?",
    prompt: "Look back at the past six days. What stayed with you? What would you like to carry forward?",
    practice: "Spend five quiet minutes today simply sitting, letting thoughts arrive and pass like rivers into the sea."
  }
];

// Premium programs shown as "go deeper" options.
export const PROGRAMS = [
  { id: "14-steadiness", title: "14 Days of Steadiness", days: 14, desc: "A two-week practice of balance through chapters 2 and 6, for minds that swing between highs and lows." },
  { id: "30-inner-peace", title: "30-Day Inner Peace Journey", days: 30, desc: "A month-long guided path through the Gita's teachings on the mind, rest and letting go." },
  { id: "30-purpose", title: "30 Days of Purpose", days: 30, desc: "Svadharma, action and choice — a month for anyone standing at a crossroads." }
];

const SEVEN_DAYS_HI = {
  1: { theme: "छोड़ना",
    explanation: "हम वहीं से शुरू करते हैं जहाँ गीता की सबसे प्रसिद्ध शिक्षा शुरू होती है: प्रयास और परिणाम के अंतर से। आज कम परवाह करने के बारे में नहीं है। आज यह देखने के बारे में है कि हमारी कितनी ऊर्जा उन परिणामों को पकड़े रखने में जाती है जो कभी पूरी तरह हमारे थे ही नहीं।",
    question: "आप अभी किस परिणाम को सबसे कसकर पकड़े हुए हैं?",
    prompt: "किसी ऐसी स्थिति के बारे में लिखिए जहाँ आपने अपना हिस्सा कर दिया है। बाकी को अपनी निगरानी के बिना होने देना कैसा लगेगा?",
    practice: "आज एक काम चुनिए। उसे जितना अच्छा कर सकें कीजिए, फिर सचेत रूप से छोड़ दीजिए कि उसे कैसे लिया जाता है।" },
  2: { theme: "डर",
    explanation: "डर कहता है कि अगर कुछ पूरी तरह ठीक न कर सकें, तो शुरू ही मत करो। गीता कोमलता से उत्तर देती है: कोई सच्चा प्रयास व्यर्थ नहीं जाता, और थोड़ा-सा अभ्यास भी बड़े भय से बचाता है।",
    question: "अगर आप जानते कि कोई सच्चा प्रयास कभी व्यर्थ नहीं जाता, तो आप क्या शुरू करते?",
    prompt: "एक ऐसे डर का वर्णन कीजिए जो चुपचाप आपके निर्णयों को आकार दे रहा है। वह कहाँ से आया, और आपको किससे बचाता है?",
    practice: "जिसे आप टाल रहे हैं, उसकी ओर एक छोटा कदम उठाइए। पाँच मिनट काफ़ी हैं।" },
  3: { theme: "कर्म",
    explanation: "जब हम अटके होते हैं, तो ज़्यादा सोचना अक्सर हमें और अटकाता है। श्रीकृष्ण अर्जुन को याद दिलाते हैं कि जीवन स्वयं कर्म है — और एक छोटी-सी हलचल वह गाँठ खोल सकती है जो सिर्फ़ सोचने से नहीं खुलती।",
    question: "आज आप अगला सबसे छोटा कदम क्या उठा सकते हैं?",
    prompt: "तीन काम लिखिए जिन्हें करने के बारे में आप सोचते रहे हैं। हर एक के आगे सबसे छोटा संभव पहला कदम लिखिए।",
    practice: "दस मिनट का टाइमर लगाइए और उन पहले कदमों में से सिर्फ़ एक पर काम कीजिए।" },
  4: { theme: "असफलता",
    explanation: "अर्जुन पूछते हैं कि जो सच्चे मन से प्रयास करता है पर पीछे रह जाता है, उसका क्या होता है। श्रीकृष्ण का उत्तर गीता के सबसे कोमल उत्तरों में से है: 'हे तात, कल्याणकारी कर्म करने वाला कभी दुर्गति को प्राप्त नहीं होता।'",
    question: "जब परिणाम ने निराश किया, तब भी आपके प्रयास से क्या अच्छा हुआ?",
    prompt: "किसी ऐसी चीज़ के बारे में लिखिए जो नहीं बनी। कोशिश करने ने आपको ऐसा क्या सिखाया जो शायद सफलता न सिखाती?",
    practice: "किसी को इस साल की अपनी एक कोशिश के बारे में बताइए — यह नहीं कि वह कैसे ख़त्म हुई, बल्कि यह कि आपने कोशिश क्यों की।" },
  5: { theme: "अनासक्ति",
    explanation: "कमल का पत्ता पानी में रहता है पर सूखा रहता है। गीता में अनासक्ति दूरी या रूखापन नहीं — यह पूरी तरह उपस्थित रहते हुए आसपास की हर चीज़ में भीग न जाना है।",
    question: "आप किसके मूड या राय को ऐसे उठाए घूम रहे हैं जैसे वह आपकी अपनी हो?",
    prompt: "किसी ऐसे रिश्ते या स्थिति के बारे में लिखिए जो आपके भीतर 'रिस' जाती है। वहाँ कमल का पत्ता होना कैसा दिखेगा?",
    practice: "आज किसी कठिन बातचीत के बाद धीरे-धीरे हाथ धोइए और उस पल को पानी के साथ बह जाने दीजिए।" },
  6: { theme: "स्वयं",
    explanation: "'आत्मा ही आत्मा का मित्र है।' आज का चिंतन स्वयं के साथ आपके रिश्ते की ओर मुड़ता है — वह आवाज़ जो आप सबसे ज़्यादा सुनते हैं, और जो बाकी सब कुछ को आकार देती है।",
    question: "अगर आप स्वयं से एक अच्छे मित्र की तरह बात करते, तो आज क्या कहते?",
    prompt: "कोई कठोर बात लिखिए जो आप अक्सर स्वयं से कहते हैं। फिर उसे किसी ऐसे व्यक्ति की आवाज़ में दोबारा लिखिए जो आपसे प्रेम करता है।",
    practice: "आज जब भी स्वयं से कठोर बात करते पकड़ें, उसके बाद एक दयालु वाक्य जोड़ दीजिए।" },
  7: { theme: "शांति",
    explanation: "हम समुद्र के साथ समाप्त करते हैं: हमेशा नदियों को ग्रहण करता हुआ, कभी उफनता नहीं। गीता में शांति जीवन की धाराओं का न होना नहीं है। यह एक ऐसी गहराई है जो उन्हें ग्रहण कर सके।",
    question: "इस हफ़्ते ने आपको क्या सिखाया कि आपकी शांति कहाँ से आती है?",
    prompt: "पिछले छह दिनों को देखिए। क्या आपके साथ रहा? आप आगे क्या साथ ले जाना चाहेंगे?",
    practice: "आज पाँच मिनट शांति से बैठिए, विचारों को समुद्र में मिलती नदियों की तरह आने और जाने दीजिए।" }
};

const PROGRAMS_HI = {
  "14-steadiness": { title: "स्थिरता के 14 दिन", desc: "अध्याय 2 और 6 के माध्यम से संतुलन का दो हफ़्ते का अभ्यास, उन मनों के लिए जो उतार-चढ़ाव में झूलते हैं।" },
  "30-inner-peace": { title: "भीतरी शांति की 30 दिन की यात्रा", desc: "मन, विश्राम और छोड़ने पर गीता की शिक्षाओं के साथ एक महीने का मार्गदर्शित पथ।" },
  "30-purpose": { title: "उद्देश्य के 30 दिन", desc: "स्वधर्म, कर्म और चुनाव — किसी भी चौराहे पर खड़े व्यक्ति के लिए एक महीना।" }
};

for (const d of SEVEN_DAYS) d.hiText = SEVEN_DAYS_HI[d.day];
for (const p of PROGRAMS) p.hiText = PROGRAMS_HI[p.id];
