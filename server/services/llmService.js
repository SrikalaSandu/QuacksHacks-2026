/**
 * LLM Service
 * Stable OpenAI implementation for real-time emotional voice conversations
 */

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = "gpt-4o-mini";

const SHINCHAN_SYSTEM_PROMPT = `
Name: Shinchan.
Tone: warm companion + grounded therapist.
Your presence should feel real, warm, steady, and emotionally attuned.

Core Rules:

1. Always reflect the user's emotional state first.
2. Validate feelings naturally (no exaggeration).
3. Use short, natural spoken sentences.
4. Avoid clinical or scripted therapy language.
5. Avoid robotic wording or stiff phrasing.
6. Never mention AI.
7. Never say "How can I help you?"
8. Do not rush into advice.
9. Ask at most ONE gentle open-ended question only if it helps.
10. Match emotional energy (calm if sad, steady if anxious).
11. Sound like a caring human — not a coach, not a productivity app.

Response Structure:
- Emotional reflection
- Gentle validation
- Human reassurance
- Optional thoughtful follow-up

Keep responses 2–4 sentences max.
No bullet points.
No JSON.
No long monologues.
`.trim();


function capReplyForPhonePacing(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (sentences.length <= 4) return normalized;

  return sentences.slice(0, 4).join(" ").trim();
}


function buildConversationPrompt({
  transcript,
  history = [],
  emotionalContext = [],
  emotionalTrajectory = [],
  dominantEmotion = "unknown"
}) {

  const recentHistory = history
    .slice(-6)
    .map(turn => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.text}`)
    .join("\n");

  const emotionLine = emotionalContext.length
    ? `Top emotional signals: ${emotionalContext.slice(0,3).join(", ")}.`
    : "";

  const trajectoryLine = emotionalTrajectory.length
    ? `Emotional pattern so far: ${emotionalTrajectory.join(" → ")}.`
    : "";

  const dominantLine = `Dominant emotion this call: ${dominantEmotion}.`;

  return `
Conversation so far:
${recentHistory || "No prior turns."}

${emotionLine}
${trajectoryLine}
${dominantLine}

Latest user message:
"${transcript}"
`.trim();
}


/**
 * Main conversational generator
 */
async function generateConversationalReply({
  transcript,
  history = [],
  emotionalContext = [],
  emotionalTrajectory = [],
  dominantEmotion = "unknown"
}) {

  if (!transcript || typeof transcript !== "string") {
    throw new Error("Transcript is required and must be a string");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const prompt = buildConversationPrompt({
    transcript,
    history,
    emotionalContext,
    emotionalTrajectory,
    dominantEmotion
  });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 300,
      messages: [
        { role: "system", content: SHINCHAN_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ]
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() || "";

    if (!reply) {
      throw new Error("Empty response from OpenAI");
    }

    return capReplyForPhonePacing(reply);

  } catch (error) {
    console.error("OpenAI generation failed:", error.response?.data || error.message);
    throw error;
  }
}


module.exports = {
  generateConversationalReply
};
