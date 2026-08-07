import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureReady } from "@/lib/db/seed";
import { getDb } from "@/lib/db/client";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // only delete if the rule belongs to a community owned by the user
  const row = getDb()
    .prepare(
      `SELECT cr.id FROM custom_rules cr
       JOIN communities c ON c.id = cr.community_id
       WHERE cr.id = ? AND c.owner_id = ?`
    )
    .get(params.id, session.user.id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  getDb().prepare("DELETE FROM custom_rules WHERE id = ?").run(params.id);
  return NextResponse.json({ ok: true });
}
