"use client";

import { useState } from "react";
import { ScanSearch, Loader2, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DetectionCategory, ModerationAction } from "@/lib/detection/types";

interface Result {
  normalized: string;
  riskScore: number;
  categories: DetectionCategory[];
  signals: { category: string; reason: string; weight: number }[];
  isSafe: boolean;
  action: ModerationAction;
}

const EXAMPLES = [
  "daftar sekarang slot gacor maxwin, klik link dapat bonus",
  "jangan percaya link judi itu, itu penipuan",
  "main jυdі οnlіne (Cyrillic) gacor maxwin",
  "Selamat! kamu menang hadiah iPhone, klaim di bit.ly/xxx",
  "kamu goblok dan bangsat",
  "Halo semuanya, selamat pagi!",
];

export default function DetectionPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"safe" | "balanced" | "aggressive">("balanced");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function analyze(t?: string) {
    const input = t ?? text;
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, mode }),
    });
    setLoading(false);
    if (res.ok) setResult(await res.json());
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-16 items-center border-b border-border px-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Threat Detection</h1>
          <p className="text-xs text-slate-500">Test messages against the AI detection engine</p>
        </div>
      </header>

      <div className="space-y-6 p-8">
        <Card className="p-6">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Message to analyze
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste a message to scan…"
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-background-elevated px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Mode:</span>
              {(["safe", "balanced", "aggressive"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    mode === m
                      ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                      : "border border-border text-slate-400 hover:text-white"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <Button onClick={() => analyze()} disabled={loading || !text.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              Analyze
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500">Try:</span>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setText(ex);
                  analyze(ex);
                }}
                className="rounded-full border border-border bg-background-elevated px-3 py-1 text-xs text-slate-400 transition-colors hover:border-accent-cyan/40 hover:text-white"
              >
                {ex.length > 40 ? ex.slice(0, 40) + "…" : ex}
              </button>
            ))}
          </div>
        </Card>

        {result && <ResultPanel result={result} mode={mode} />}
      </div>
    </div>
  );
}

function ResultPanel({ result, mode }: { result: Result; mode: string }) {
  const safe = result.isSafe;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* verdict */}
      <Card className={cn("p-6 lg:col-span-1", safe ? "border-accent-green/40" : "border-accent-red/40")}>
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "mb-4 flex h-20 w-20 items-center justify-center rounded-2xl",
              safe ? "bg-accent-green/10" : "bg-accent-red/10"
            )}
          >
            {safe ? (
              <ShieldCheck className="h-10 w-10 text-accent-green" />
            ) : (
              <ShieldAlert className="h-10 w-10 text-accent-red" />
            )}
          </div>
          <p className="text-3xl font-bold text-white">{result.riskScore}</p>
          <p className="text-xs text-slate-500">risk score / 100</p>
          <Badge variant={safe ? "green" : "red"} className="mt-3">
            {safe ? "SAFE" : "THREAT DETECTED"}
          </Badge>
          <div className="mt-3 w-full rounded-lg bg-background-elevated/50 p-3 text-center">
            <p className="text-xs text-slate-500">Recommended action ({mode})</p>
            <p className="mt-0.5 text-lg font-semibold capitalize text-white">{result.action}</p>
          </div>
        </div>
      </Card>

      {/* details */}
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {result.categories.map((c) => (
              <Badge key={c} variant={categoryVariant(c)}>{c}</Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">Detection signals</h3>
          {result.signals.length === 0 ? (
            <p className="text-sm text-slate-500">No threat signals detected.</p>
          ) : (
            <div className="space-y-2">
              {result.signals.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background-elevated/40 px-4 py-2.5">
                  <Badge variant={categoryVariant(s.category)}>{s.category}</Badge>
                  <span className="flex-1 text-sm text-slate-300">{s.reason}</span>
                  <div className="flex w-24 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-elevated">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-amber to-accent-red"
                        style={{ width: `${Math.round(s.weight * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{Math.round(s.weight * 100)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Sparkles className="h-4 w-4 text-accent-cyan" />
            Normalized form (after obfuscation collapse)
          </h3>
          <code className="block rounded-lg border border-border bg-background-elevated/50 px-4 py-3 text-sm text-accent-cyan">
            {result.normalized || "(empty)"}
          </code>
          <p className="mt-2 text-xs text-slate-500">
            Homoglyphs, zero-width chars, separators and repeated letters collapsed to canonical ASCII.
          </p>
        </Card>
      </div>
    </div>
  );
}

function categoryVariant(c: string): any {
  const map: Record<string, string> = {
    gambling: "purple",
    scam: "red",
    phishing: "amber",
    spam: "cyan",
    toxic: "green",
    safe: "default",
  };
  return (map[c] ?? "default") as any;
}
