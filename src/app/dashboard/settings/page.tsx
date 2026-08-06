import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunitiesByOwner } from "@/lib/db/communities";
import { migrate } from "@/lib/db/schema";
import { SettingsView } from "@/components/dashboard/settings-view";

export default async function SettingsPage() {
  migrate();
  const session = await getServerSession(authOptions);
  const communities = listCommunitiesByOwner(session!.user.id);
  return <SettingsView communities={communities} />;
}
