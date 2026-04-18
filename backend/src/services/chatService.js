import { env } from "../config/env.js";

export async function askGemini({ message, petData }) {
  if (!env.geminiApiKey) {
    return {
      reply:
        "Demo mode: keep your pet hydrated, monitor appetite and activity, and visit a vet immediately for severe symptoms like breathing issues, seizures, or bleeding."
    };
  }

  const prompt = `You are PawLife AI, a pet healthcare assistant.
Use pet context carefully and provide safe, concise guidance.
Pet context: ${JSON.stringify(petData)}
User message: ${message}
Return practical advice, possible causes, and when to seek emergency vet help.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Gemini request failed");
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I could not generate a response right now.";
  return { reply };
}
