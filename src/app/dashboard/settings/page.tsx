import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunitiesByOwner } from "@/lib/db/communities";
import { ensureReady } from "@/lib/db/seed";
import { getEntitlement } from "@/lib/plans";
import { SettingsView } from "@/components/dashboard/settings-view";

export default async function SettingsPage() {
  ensureReady();
  const session = await getServerSession(authOptions);
  const communities = listCommunitiesByOwner(session!.user.id);
  const ent = getEntitlement(session!.user.id);
  return <SettingsView communities={communities} canUseCustomRules={ent.features.customRules} />;
}
