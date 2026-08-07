"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Ban, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  ruleType: "ban" | "allow" | "ai_instruction";
  term: string;
  category: string;
  weight: number;
}

const CATEGORIES = ["gambling", "scam", "phishing", "spam", "toxic", "custom"];

export function CustomRulesEditor({ communityId }: { communityId: string }) {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"ban" | "allow" | "ai_instruction">("ban");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("custom");
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    fetch(`/api/communities/${communityId}/rules`)
      .then((r) => r.json())
      .then((d) => setRules(d.rules ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(load, [communityId]);

  async function add() {
    if (!term.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/communities/${communityId}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleType: type, term, category }),
    });
    setBusy(false);
    if (res.ok) {
      setTerm("");
      router.refresh();
      load();
    }
  }

  async function remove(id: string) {
    await fetch(`/api/custom-rules/${id}`, { method: "DELETE" });
    load();
  }

  const bans = rules.filter((r) => r.ruleType === "ban");
  const allows = rules.filter((r) => r.ruleType === "allow");
  const instrs = rules.filter((r) => r.ruleType === "ai_instruction");

  return (
    <Card className="p-6">
      <h3 className="mb-1 flex items-center gap-2 font-semibold text-white">
        <Sparkles className="h-4 w-4 text-accent-purple" />
        Custom rules & AI personality
      </h3>
      <p className="mb-5 text-xs text-slate-500">
        Banned words always trigger; allowed words suppress matches; instructions bias the AI's strictness.
      </p>

      {/* add form */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg bg-background-elevated/40 p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs text-slate-400">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="h-10 rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:outline-none"
          >
            <option value="ban">Ban word</option>
            <option value="allow">Allow word</option>
            <option value="ai_instruction">AI instruction</option>
          </select>
        </label>
        <label className="block flex-1 min-w-[180px]">
          <span className="mb-1.5 block text-xs text-slate-400">
            {type === "ai_instruction" ? "Instruction" : "Word / phrase"}
          </span>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={type === "ai_instruction" ? "Be strict against gambling." : "e.g. maxwin"}
            className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:border-accent-cyan/50 focus:outline-none"
          />
        </label>
        {type === "ban" && (
          <label className="block">
            <span className="mb-1.5 block text-xs text-slate-400">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
        <Button onClick={add} disabled={busy || !term.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>

      {/* lists */}
      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">Loading…</p>
      ) : rules.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No custom rules yet. Add banned words, allow safe words, or set an AI personality.
        </p>
      ) : (
        <div className="space-y-5">
          <RuleGroup
            title="Banned words"
            icon={<Ban className="h-4 w-4 text-accent-red" />}
            rules={bans}
            onRemove={remove}
            render={(r) => (
              <>
                <span className="text-sm text-slate-300">{r.term}</span>
                <Badge variant="amber">{r.category}</Badge>
              </>
            )}
          />
          <RuleGroup
            title="Allowed words (whitelist)"
            icon={<CheckCircle2 className="h-4 w-4 text-accent-green" />}
            rules={allows}
            onRemove={remove}
            render={(r) => <span className="text-sm text-slate-300">{r.term}</span>}
          />
          <RuleGroup
            title="AI personality instructions"
            icon={<Sparkles className="h-4 w-4 text-accent-purple" />}
            rules={instrs}
            onRemove={remove}
            render={(r) => <span className="text-sm text-slate-300">{r.term}</span>}
          />
        </div>
      )}
    </Card>
  );
}

function RuleGroup({
  title,
  icon,
  rules,
  onRemove,
  render,
}: {
  title: string;
  icon: React.ReactNode;
  rules: Rule[];
  onRemove: (id: string) => void;
  render: (r: Rule) => React.ReactNode;
}) {
  if (rules.length === 0) return null;
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon} {title}
      </p>
      <div className="space-y-2">
        {rules.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-background-elevated/40 px-4 py-2.5"
          >
            <div className="flex flex-1 items-center gap-3">{render(r)}</div>
            <button
              onClick={() => onRemove(r.id)}
              className="text-slate-500 transition-colors hover:text-accent-red"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
