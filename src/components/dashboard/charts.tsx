"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
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
