import { NextResponse } from "next/server";
import { z } from "zod";
import { detect } from "@/lib/detection/detector";
import type { ProtectionMode } from "@/lib/detection/types";

const schema = z.object({
  text: z.string().min(1).max(5000),
  mode: z.enum(["safe", "balanced", "aggressive"]).default("balanced"),
  sensitivity: z.number().int().min(0).max(100).default(60),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { text, mode, sensitivity } = parsed.data;
  const result = detect(text, { sensitivity });
  const action = result.recommendedAction(mode as ProtectionMode);
  return NextResponse.json({
    raw: result.raw,
    normalized: result.normalized,
    riskScore: result.riskScore,
    categories: result.categories,
    signals: result.signals,
    isSafe: result.isSafe,
    action,
  });
}
