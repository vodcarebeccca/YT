import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getCommunityById, updateCommunity, deleteCommunity } from "@/lib/db/communities";
import { migrate } from "@/lib/db/schema";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  protectionMode: z.enum(["safe", "balanced", "aggressive"]).optional(),
  sensitivity: z.number().int().min(0).max(100).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  migrate();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const community = getCommunityById(params.id);
  if (!community || community.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  updateCommunity(params.id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  migrate();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const community = getCommunityById(params.id);
  if (!community || community.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  deleteCommunity(params.id);
  return NextResponse.json({ ok: true });
}
