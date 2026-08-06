import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createCommunity, listCommunitiesByOwner } from "@/lib/db/communities";
import { migrate } from "@/lib/db/schema";

const schema = z.object({
  name: z.string().min(1).max(80),
  platform: z.enum(["telegram", "discord"]).default("telegram"),
  platformRef: z.string().min(1),
  protectionMode: z.enum(["safe", "balanced", "aggressive"]).default("balanced"),
  sensitivity: z.number().int().min(0).max(100).default(60),
});

export async function GET() {
  migrate();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = listCommunitiesByOwner(session.user.id);
  return NextResponse.json({ communities: rows });
}

export async function POST(req: Request) {
  migrate();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const community = createCommunity({ ...parsed.data, ownerId: session.user.id });
  return NextResponse.json({ community });
}
