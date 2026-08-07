import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { ensureReady } from "@/lib/db/seed";
import { getCommunityById } from "@/lib/db/communities";
import { listCustomRules, addCustomRule } from "@/lib/db/custom-rules";
import { getEntitlement } from "@/lib/plans";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const community = getCommunityById(params.id);
  if (!community || community.ownerId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ rules: listCustomRules(community.id) });
}

const schema = z.object({
  ruleType: z.enum(["ban", "allow", "ai_instruction"]),
  term: z.string().min(1).max(200),
  category: z.string().optional(),
  weight: z.number().min(0).max(1).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ent = getEntitlement(session.user.id);
  if (!ent.features.customRules)
    return NextResponse.json({ error: "Custom rules require a Pro plan or higher" }, { status: 403 });

  const community = getCommunityById(params.id);
  if (!community || community.ownerId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rule = addCustomRule({ communityId: community.id, ...parsed.data });
  if (!rule) return NextResponse.json({ error: "Rule already exists" }, { status: 409 });
  return NextResponse.json({ rule });
}
