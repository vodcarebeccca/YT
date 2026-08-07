import { NextResponse } from "next/server";
import { z } from "zod";
import { detect } from "@/lib/detection/detector";
import { classify } from "@/lib/ai/classifier";
import type { ProtectionMode } from "@/lib/detection/types";

const schema = z.object({
  text: z.string().min(1).max(5000),
  mode: z.enum(["safe", "balanced", "aggressive"]).default("balanced"),
  sensitivity: z.number().int().min(0).max(100).default(60),
  ai: z.boolean().default(true),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { text, mode, sensitivity, ai } = parsed.data;

  // Run both the rule engine and the AI classifier so the UI can compare.
  const ruleResult = detect(text, { sensitivity });
  const aiResult = detect(text, { sensitivity, ai });
  const classifier = classify(text);
  const action = aiResult.recommendedAction(mode as ProtectionMode);

  return NextResponse.json({
    raw: aiResult.raw,
    normalized: aiResult.normalized,
    riskScore: aiResult.riskScore,
    ruleRiskScore: ruleResult.riskScore,
    categories: aiResult.categories,
    signals: aiResult.signals,
    isSafe: aiResult.isSafe,
    action,
    ai: {
      category: classifier.category,
      confidence: Math.round(classifier.confidence * 100),
      probabilities: classifier.probabilities,
      enabled: ai,
    },
  });
}
