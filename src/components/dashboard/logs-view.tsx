"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

const CATEGORIES = ["", "gambling", "scam", "phishing", "spam", "toxic"];
const ACTIONS = ["", "warning", "delete", "mute", "ban", "report"];

export function LogsView({
  rows,
  total,
  page,
  limit,
  search,
  category,
  action,
}: {
  rows: any[];
  total: number;
  page: number;
  limit: number;
  search: string;
  category: string;
  action: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(search);

  function update(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete("page");
    router.push(`/dashboard/logs?${sp.toString()}`);
  }

  function gotoPage(p: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    router.push(`/dashboard/logs?${sp.toString()}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-16 items-center justify-between border-b border-border px-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Moderation Logs</h1>
          <p className="text-xs text-slate-500">{total} total actions</p>
        </div>
        <a
          href={`/api/logs/export?${new URLSearchParams({ search, category, action }).toString()}`}
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </a>
      </header>

      <div className="space-y-4 p-8">
        {/* filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && update("search", q)}
                placeholder="Search messages, senders, reasons…"
                className="h-10 w-full rounded-lg border border-border bg-background-elevated pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => update("category", e.target.value)}
              className="h-10 rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c ? `Category: ${c}` : "All categories"}
                </option>
              ))}
            </select>
            <select
              value={action}
              onChange={(e) => update("action", e.target.value)}
              className="h-10 rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:outline-none"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a ? `Action: ${a}` : "All actions"}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No logs match your filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-background-elevated/30">
                      <td className="max-w-xs truncate px-4 py-3 text-slate-300">{r.messageText}</td>
                      <td className="px-4 py-3">
                        <Badge variant={catVariant(r.category)}>{r.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBar score={r.riskScore} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={actVariant(r.action)}>{r.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{r.senderName ?? r.senderId}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        {timeAgo(r.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => gotoPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => gotoPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function RiskBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-accent-red" : score >= 60 ? "bg-accent-amber" : "bg-accent-green";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-background-elevated">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-400">{score}</span>
    </div>
  );
}

function catVariant(c: string): any {
  const map: Record<string, string> = {
    gambling: "purple", scam: "red", phishing: "amber", spam: "cyan", toxic: "green", safe: "default",
  };
  return (map[c] ?? "default") as any;
}
function actVariant(a: string): any {
  const map: Record<string, string> = {
    ban: "red", mute: "amber", delete: "amber", warning: "cyan", report: "purple", none: "default",
  };
  return (map[a] ?? "default") as any;
}
