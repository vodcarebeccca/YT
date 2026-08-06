/**
 * Optional LLM adapter (OpenAI-compatible).
 *
 * When OPENAI_API_KEY is set, the AI layer can route to a real LLM for deeper
 * context understanding beyond the local Naive Bayes classifier. Uses native
 * fetch — no SDK dependency. Falls back to the local classifier when no key is
 * configured (the default in this sandbox).
 */
import type { AIClass } from "./training-data";

export interface LLMClassification {
  category: AIClass;
  confidence: number;
  reasoning: string;
}

const SYSTEM_PROMPT = `You are a community content moderation classifier for Indonesian online communities.
Classify the user message into exactly one category:
- gambling: judi online / slot / betting promotion
- scam: penipuan, fake giveaway, impersonation, investment fraud
- phishing: suspicious/fake login links, shortened URLs, fake verification
- spam: repetitive promotion, mass mention, excessive links, flooding
- toxic: insults, harassment, hate speech, threats
- safe: normal, legitimate conversation (including warnings ABOUT threats)
Respond ONLY with compact JSON: {"category": "...", "confidence": 0.0-1.0, "reasoning": "..."}`;

export function isLLMEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function classifyWithLLM(text: string): Promise<LLMClassification | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    return {
      category: parsed.category as AIClass,
      confidence: Number(parsed.confidence) || 0.5,
      reasoning: String(parsed.reasoning || ""),
    };
  } catch {
    return null;
  }
}
