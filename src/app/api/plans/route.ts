import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { ensureReady } from "@/lib/db/seed";
import { updatePlan } from "@/lib/db/users";
import { getEntitlement, PLAN_INFO, PLAN_ORDER, planRank } from "@/lib/plans";

export async function GET() {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const entitlement = getEntitlement(session.user.id);
  return NextResponse.json({ entitlement, plans: PLAN_ORDER.map((p) => ({ ...PLAN_INFO[p], id: p, rank: planRank(p) })) });
}

const schema = z.object({ plan: z.enum(["free", "pro", "business"]) });

/** Demo billing: flip the plan in-DB (no real payment). A Stripe webhook would
 *  call updatePlan() after a successful checkout. */
export async function POST(req: Request) {
  ensureReady();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  // expire in 30 days for demo
  const expires = new Date(Date.now() + 30 * 86400000).toISOString();
  updatePlan(session.user.id, parsed.data.plan, "active", parsed.data.plan === "free" ? null : expires);
  const entitlement = getEntitlement(session.user.id);
  return NextResponse.json({ ok: true, entitlement });
}
