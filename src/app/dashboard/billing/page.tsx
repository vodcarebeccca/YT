import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { ensureReady } from "@/lib/db/seed";
import { BillingView } from "@/components/dashboard/billing-view";

export default async function BillingPage() {
  ensureReady();
  const session = await getServerSession(authOptions);
  const user = getUserById(session!.user.id);
  return <BillingView currentPlan={user?.plan ?? "free"} />;
}
