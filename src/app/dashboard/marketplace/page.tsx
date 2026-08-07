import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunitiesByOwner } from "@/lib/db/communities";
import { ensureReady } from "@/lib/db/seed";
import { MarketplaceView } from "@/components/dashboard/marketplace-view";

export default async function MarketplacePage() {
  ensureReady();
  const session = await getServerSession(authOptions);
  const communities = listCommunitiesByOwner(session!.user.id).map((c) => ({ id: c.id, name: c.name }));
  return <MarketplaceView communities={communities} />;
}
