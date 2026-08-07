import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { ensureReady } from "@/lib/db/seed";
import { getPack, incrementInstalls, parseContent } from "@/lib/db/marketplace";
import { getCommunityById, updateCommunity } from "@/lib/db/communities";
import { setCustomRules } from "@/lib/db/custom-rules";
import { getEntitlement } from "@/lib/plans";

const schema = z.object({
  packId: z.string(),
  communityId: z.string(),
});

/** Install a marketplace pack into a community: copies its ban/allow terms +
 *  instructions into the community's custom rules (replacing existing ones),
 *  and applies the pack's sensitivity/mode if present. */
export async function POST(req: Request) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ent = getEntitlement(session.user.id);
  if (!ent.features.customRules) {
    return NextResponse.json({ error: "Installing rule packs requires a Pro plan or higher" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const community = getCommunityById(parsed.data.communityId);
  if (!community || community.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const pack = getPack(parsed.data.packId);
  if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

  const content = parseContent(pack);

  setCustomRules(
    community.id,
    [
      ...content.ban.map((b) => ({
        ruleType: "ban" as const,
        term: b.term,
        category: b.category ?? "custom",
        weight: b.weight ?? 0.7,
      })),
      ...content.allow.map((term) => ({ ruleType: "allow" as const, term })),
      ...(content.instructions ?? []).map((term) => ({ ruleType: "ai_instruction" as const, term })),
    ]
  );

  if (typeof content.sensitivity === "number") {
    updateCommunity(community.id, { sensitivity: content.sensitivity });
  }
  if (content.mode && ["safe", "balanced", "aggressive"].includes(content.mode)) {
    updateCommunity(community.id, { protectionMode: content.mode as any });
  }

  incrementInstalls(pack.id);
  return NextResponse.json({ ok: true, installed: content.ban.length + content.allow.length + (content.instructions?.length ?? 0) });
}
