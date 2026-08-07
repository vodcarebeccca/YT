import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listModerationLogs } from "@/lib/db/logs";
import { ensureReady } from "@/lib/db/seed";
import { LogsView } from "@/components/dashboard/logs-view";
import type { DetectionCategory, ModerationAction } from "@/lib/detection/types";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; action?: string; page?: string };
}) {
  ensureReady();
  const session = await getServerSession(authOptions);
  const limit = 20;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const { rows, total } = listModerationLogs({
    search: searchParams.search,
    category: searchParams.category as DetectionCategory,
    action: searchParams.action as ModerationAction,
    limit,
    offset: (page - 1) * limit,
  });

  return (
    <Suspense fallback={null}>
      <LogsView
        rows={rows}
        total={total}
        page={page}
        limit={limit}
        search={searchParams.search ?? ""}
        category={searchParams.category ?? ""}
        action={searchParams.action ?? ""}
      />
    </Suspense>
  );
}
