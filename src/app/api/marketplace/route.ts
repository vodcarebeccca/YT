import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { ensureReady } from "@/lib/db/seed";
import { listPacks, createPack, parseContent } from "@/lib/db/marketplace";
import { getEntitlement } from "@/lib/plans";

export async function GET(req: Request) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const packs = listPacks({
    focus: url.searchParams.get("focus") ?? undefined,
    language: url.searchParams.get("language") ?? undefined,
  });
  // attach parsed content + ownership flag
  const enriched = packs.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    language: p.language,
    focus: p.focus,
    installs: p.installs,
    ownerName: p.ownerName,
    mine: p.ownerId === session.user.id,
    content: parseContent(p),
    createdAt: p.createdAt,
  }));
  return NextResponse.json({ packs: enriched });
}

const contentSchema = z.object({
  ban: z.array(z.object({ term: z.string(), category: z.string().optional(), weight: z.number().optional() })).default([]),
  allow: z.array(z.string()).default([]),
  instructions: z.array(z.string()).optional().default([]),
});

const schema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(400).optional(),
  language: z.enum(["id", "en", "ms", "multi"]).default("id"),
  focus: z.string().default("general"),
  content: contentSchema,
});

export async function POST(req: Request) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ent = getEntitlement(session.user.id);
  if (!ent.features.marketplacePublish) {
    return NextResponse.json({ error: "Publishing requires a Pro plan or higher" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const pack = createPack({ ...parsed.data, ownerId: session.user.id });
  return NextResponse.json({ pack });
}
