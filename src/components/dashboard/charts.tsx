"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

type Series = { date: string; threats: number; scanned: number };

export function ThreatChart({ data }: { data: Series[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }));
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Threats detected</h3>
          <p className="text-xs text-slate-500">Last 14 days</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-accent-cyan" /> Scanned
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-accent-red" /> Threats
          </span>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gScan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gThreat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area type="monotone" dataKey="scanned" stroke="#22d3ee" strokeWidth={2} fill="url(#gScan)" />
            <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fill="url(#gThreat)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  gambling: "#a855f7",
  scam: "#ef4444",
  phishing: "#f59e0b",
  spam: "#22d3ee",
  toxic: "#22c55e",
  safe: "#64748b",
};

export function CategoryChart({ data }: { data: { category: string; count: number }[] }) {
  const rows = data.length ? data : [{ category: "none", count: 0 }];
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-white">Threat categories</h3>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "rgba(148,163,184,0.05)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {rows.map((d, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[d.category] ?? "#22d3ee"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {cat}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function CategoryDonut({ data }: { data: { category: string; count: number }[] }) {
  const rows = data.filter((d) => d.count > 0);
  const total = rows.reduce((a, b) => a + b.count, 0);
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-white">Category share</h3>
      {rows.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {rows.map((d, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[d.category] ?? "#22d3ee"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
              />
              <Legend
                formatter={(v) => <span className="text-xs text-slate-400">{v}</span>}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {total > 0 && (
        <p className="mt-2 text-center text-xs text-slate-500">{total} threats analyzed</p>
      )}
    </Card>
  );
}

const ACTION_COLORS: Record<string, string> = {
  ban: "#ef4444",
  mute: "#f59e0b",
  delete: "#22d3ee",
  warning: "#a855f7",
  report: "#22c55e",
  none: "#64748b",
};

export function ActionDistribution({ data }: { data: { action: string; count: number }[] }) {
  const rows = data.length ? data : [{ action: "none", count: 0 }];
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-white">Actions taken</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="action" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={70} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "rgba(148,163,184,0.05)" }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {rows.map((d, i) => (
                <Cell key={i} fill={ACTION_COLORS[d.action] ?? "#22d3ee"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function HourlyChart({ data }: { data: { hour: number; count: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: `${d.hour.toString().padStart(2, "0")}h` }));
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-white">Threats by hour</h3>
        <p className="text-xs text-slate-500">When attacks happen (local server time)</p>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={2} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "rgba(148,163,184,0.05)" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#22d3ee" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
      No data yet
    </div>
  );
}
