const DATA_URL = "https://chiragmirani.github.io/gita-quotes/data.json";

function crisisText(text) {
  const t = text.toLowerCase();
  return [
    "don't want to live", "dont want to live", "do not want to live",
    "don't feel like living", "dont feel like living", "no reason to live",
    "want to die", "wanna die", "kill myself", "end my life",
    "suicide", "self harm", "hurt myself", "life is not worth living",
    "जीने का मन नहीं", "जीना नहीं", "मरना", "आत्महत्या", "खुद को नुकसान"
  ].some(p => t.includes(p));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "AI is not connected yet. Add OPENAI_API_KEY to your Vercel environment variables."
    });
  }

  const { message, candidates } = req.body || {};

  if (!message || typeof message !== "string" || message.length > 600) {
    return res.status(400).json({ error: "Please enter a short description of what you're feeling." });
  }

  if (crisisText(message)) {
    return res.status(400).json({
      error: "For immediate safety concerns, please use the safety support shown on the website."
    });
  }

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: "No Gita candidates were supplied." });
  }

  const safeCandidates = candidates.slice(0, 18).map(v => ({
    id: String(v.id),
    chapter: Number(v.chapter),
    verse: Number(v.verse),
    sanskrit: String(v.sanskrit).slice(0, 4000),
    english: String(v.english).slice(0, 3000)
  }));

  const system = `
You are the matching layer for a Bhagavad Gita reflection website.

Your job is NOT to invent scripture. Choose exactly ONE candidate verse from the supplied candidates.
Never modify, paraphrase, translate, or reconstruct the Sanskrit.
Use the supplied English translation as the source for the Hindi meaning.

The user describes a personal situation. Select the candidate whose teaching is most relevant and gentle.
Do not claim that the Gita is medical, psychological, legal, or professional treatment.
Do not diagnose the user.
Do not make absolute promises.
Do not shame the user.

Return ONLY valid JSON in exactly this shape:
{
  "selected_id": "BG2.47",
  "hindi": "A clear, faithful Hindi meaning based on the supplied English translation.",
  "english": "The supplied English translation, lightly cleaned only if necessary.",
  "why": "2-4 sentences explaining, in simple language, why this teaching may be relevant to the user's situation."
}

Important:
- selected_id MUST exactly match one candidate id.
- english MUST be based only on that candidate's supplied English translation.
- hindi must be a translation/meaning of that same English text, not a new interpretation of a different verse.
- why should connect the teaching to the user's situation without pretending to know their life.
`;

  const user = JSON.stringify({
    user_message: message,
    candidates: safeCandidates
  });

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        input: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    const raw = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error(raw);
      return res.status(502).json({ error: "The AI service returned an error. Please try again." });
    }

    const outputText =
      raw.output_text ||
      raw.output?.flatMap(item => item.content || [])
        ?.map(item => item.text || "")
        ?.join("") ||
      "";

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      console.error("Could not parse model JSON:", outputText);
      return res.status(502).json({ error: "The AI returned an unexpected response. Please try again." });
    }

    const selected = safeCandidates.find(v => v.id === parsed.selected_id);
    if (!selected) {
      return res.status(502).json({ error: "The AI selected an invalid verse. Please try again." });
    }

    return res.status(200).json({
      verse: {
        id: selected.id,
        chapter: selected.chapter,
        verse: selected.verse,
        sanskrit: selected.sanskrit
      },
      hindi: String(parsed.hindi || ""),
      english: String(parsed.english || selected.english),
      why: String(parsed.why || "")
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not reach the AI service." });
  }
}
