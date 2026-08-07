import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunitiesByOwner } from "@/lib/db/communities";
import { migrate } from "@/lib/db/schema";
import { CommunitiesList } from "@/components/dashboard/communities-list";

export default async function CommunitiesPage() {
  migrate();
  const session = await getServerSession(authOptions);
  const communities = listCommunitiesByOwner(session!.user.id);
  return <CommunitiesList communities={communities} />;
}
