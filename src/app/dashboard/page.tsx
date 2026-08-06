import Link from "next/link";
import {
  MessageSquare,
  ShieldX,
  UserX,
  Sparkles,
  Activity,
  Plus,
  ArrowRight,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getOverviewStats,
  getDailyThreatSeries,
  getCategoryBreakdown,
  listModerationLogs,
} from "@/lib/db/logs";
import { listCommunitiesByOwner as listComms } from "@/lib/db/communities";
import { StatCard } from "@/components/dashboard/stat-card";
import { ThreatChart, CategoryChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { timeAgo, formatNumber } from "@/lib/utils";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const communities = listComms(userId);
  const firstCommunity = communities[0];
  const cid = firstCommunity?.id;

  const stats = getOverviewStats(cid);
  const series = getDailyThreatSeries(cid, 14);
  const breakdown = getCategoryBreakdown(cid);
  const recent = listModerationLogs({ communityId: cid, limit: 6 }).rows;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-16 items-center justify-between border-b border-border px-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Overview</h1>
          <p className="text-xs text-slate-500">
            {firstCommunity ? `Monitoring: ${firstCommunity.name}` : "No community connected"}
          </p>
        </div>
        <Link href="/dashboard/communities">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add community
          </Button>
        </Link>
      </header>

      <div className="space-y-6 p-8">
        {/* stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Messages scanned" value={formatNumber(stats.messagesScanned)} icon={MessageSquare} accent="text-accent-cyan" />
          <StatCard label="Threats blocked" value={formatNumber(stats.threatsBlocked)} icon={ShieldX} accent="text-accent-red" />
          <StatCard label="Users banned" value={formatNumber(stats.usersBanned)} icon={UserX} accent="text-accent-purple" />
          <StatCard label="Health score" value={`${stats.communityHealth}`} icon={Activity} accent="text-accent-green" sub="higher is safer" />
        </div>

        {/* charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ThreatChart data={series} />
          </div>
          <CategoryChart data={breakdown} />
        </div>

        {/* recent activity */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent moderation activity</h3>
            <Link href="/dashboard/logs" className="text-sm text-accent-cyan hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 rounded-lg border border-border/60 bg-background-elevated/40 px-4 py-3"
                >
                  <CategoryBadge category={r.category} />
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-300">{r.messageText}</p>
                  <ActionBadge action={r.action} />
                  <span className="text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, any> = {
    gambling: "purple",
    scam: "red",
    phishing: "amber",
    spam: "cyan",
    toxic: "green",
    safe: "default",
  };
  return <Badge variant={map[category] ?? "default"}>{category}</Badge>;
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, any> = {
    ban: "red",
    mute: "amber",
    delete: "amber",
    warning: "cyan",
    report: "purple",
    none: "default",
  };
  return <Badge variant={map[action] ?? "default"}>{action}</Badge>;
}
