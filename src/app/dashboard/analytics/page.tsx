import { TrendingUp, Activity, Clock, AlertTriangle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunitiesByOwner } from "@/lib/db/communities";
import {
  getDailyThreatSeries,
  getCategoryBreakdown,
  getActionDistribution,
  getTopOffenders,
  getHourlyDistribution,
  getOverviewStats,
} from "@/lib/db/logs";
import { ensureReady } from "@/lib/db/seed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ThreatChart,
  CategoryDonut,
  ActionDistribution,
  HourlyChart,
} from "@/components/dashboard/charts";
import { cn } from "@/lib/utils";

const PEAK_HOUR_NOTE = "Busiest hour for threats";

export default async function AnalyticsPage() {
  ensureReady();
  const session = await getServerSession(authOptions);
  const communities = listCommunitiesByOwner(session!.user.id);
  const cid = communities[0]?.id;

  const series = getDailyThreatSeries(cid, 30);
  const categories = getCategoryBreakdown(cid);
  const actions = getActionDistribution(cid);
  const offenders = getTopOffenders(cid, 6);
  const hourly = getHourlyDistribution(cid);
  const stats = getOverviewStats(cid);

  const peakHour = hourly.reduce((a, b) => (b.count > a.count ? b : a), hourly[0]);

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-16 items-center border-b border-border px-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Analytics</h1>
          <p className="text-xs text-slate-500">
            Threat trends, category breakdowns and offender insights
          </p>
        </div>
      </header>

      <div className="space-y-6 p-8">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MiniStat
            icon={<TrendingUp className="h-4 w-4 text-accent-cyan" />}
            label="Threats (30d)"
            value={series.reduce((a, b) => a + b.threats, 0)}
          />
          <MiniStat
            icon={<Activity className="h-4 w-4 text-accent-green" />}
            label="Messages (30d)"
            value={series.reduce((a, b) => a + b.scanned, 0)}
          />
          <MiniStat
            icon={<AlertTriangle className="h-4 w-4 text-accent-red" />}
            label="Auto-removed"
            value={stats.deleted + stats.muted + stats.usersBanned}
          />
          <MiniStat
            icon={<Clock className="h-4 w-4 text-accent-purple" />}
            label={PEAK_HOUR_NOTE}
            value={`${String(peakHour?.hour ?? 0).padStart(2, "0")}:00`}
          />
        </div>

        {/* trend */}
        <ThreatChart data={series} />

        {/* breakdown row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryDonut data={categories} />
          <ActionDistribution data={actions} />
        </div>

        {/* hourly + offenders */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HourlyChart data={hourly} />
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-white">Top offenders</h3>
            {offenders.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">No offenders yet.</p>
            ) : (
              <div className="space-y-2">
                {offenders.map((o, i) => (
                  <div
                    key={o.senderId + i}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-background-elevated/40 px-4 py-3"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background-elevated text-xs font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">
                        {o.senderName || o.senderId}
                      </p>
                      <p className="truncate text-xs text-slate-500">{o.actions} action{ o.actions > 1 ? "s" : ""}</p>
                    </div>
                    <Badge variant={o.maxRisk >= 80 ? "red" : o.maxRisk >= 60 ? "amber" : "default"}>
                      max {o.maxRisk}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex items-center gap-3 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background-elevated border border-border">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </Card>
  );
}
