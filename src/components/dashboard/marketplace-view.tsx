"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Plus,
  Loader2,
  Package,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Pack {
  id: string;
  name: string;
  description: string | null;
  language: string;
  focus: string;
  installs: number;
  ownerName?: string;
  mine: boolean;
  content: { ban: { term: string; category?: string }[]; allow: string[]; instructions?: string[]; sensitivity?: number; mode?: string };
  createdAt: string;
}

const FOCUS_OPTIONS = ["all", "gambling", "scam", "phishing", "spam", "toxic"];

export function MarketplaceView({ communities }: { communities: { id: string; name: string }[] }) {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [focus, setFocus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch(`/api/marketplace?focus=${focus}`)
      .then((r) => r.json())
      .then((d) => setPacks(d.packs ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [focus]);

  async function install(packId: string) {
    if (communities.length === 0) {
      setError("Add a community first, then install a pack into it.");
      return;
    }
    setInstalling(packId);
    setError(null);
    const res = await fetch("/api/marketplace/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId, communityId: communities[0].id }),
    });
    setInstalling(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Install failed");
      return;
    }
    router.refresh();
    load();
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-16 items-center justify-between border-b border-border px-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Marketplace</h1>
          <p className="text-xs text-slate-500">Browse & install community rule packs</p>
        </div>
        <Button size="sm" onClick={() => setPublishing(!publishing)}>
          <Plus className="h-4 w-4" />
          {publishing ? "Cancel" : "Publish pack"}
        </Button>
      </header>

      <div className="space-y-6 p-8">
        {error && (
          <div className="rounded-lg border border-accent-red/40 bg-accent-red/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {publishing && (
          <PublishForm
            onClose={() => setPublishing(false)}
            onPublished={() => {
              setPublishing(false);
              load();
            }}
          />
        )}

        {/* filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Focus:</span>
          {FOCUS_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFocus(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                focus === f
                  ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                  : "border border-border text-slate-400 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* grid */}
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading packs…</p>
        ) : packs.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-12 text-center">
            <Package className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">No packs yet. Publish one to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((p) => (
              <Card key={p.id} className="flex flex-col p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent-cyan/20 border border-accent-cyan/30">
                      <Package className="h-4 w-4 text-accent-cyan" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight text-white">{p.name}</h3>
                      <p className="text-xs text-slate-500">
                        by {p.ownerName || "Community"} · {p.installs} install{p.installs === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  {p.mine && <Badge variant="cyan">Yours</Badge>}
                </div>

                <p className="mb-4 flex-1 text-sm text-slate-400">{p.description}</p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  <Badge variant="purple" className="capitalize">{p.focus}</Badge>
                  <Badge className="uppercase">{p.language}</Badge>
                  {p.content.sensitivity !== undefined && (
                    <Badge variant="amber">sense {p.content.sensitivity}</Badge>
                  )}
                  {p.content.mode && <Badge variant="green" className="capitalize">{p.content.mode}</Badge>}
                </div>

                <div className="mb-4 space-y-1 text-xs text-slate-500">
                  <p>{p.content.ban.length} banned words · {p.content.allow.length} allowed</p>
                  {p.content.instructions && p.content.instructions.length > 0 && (
                    <p className="flex items-center gap-1 text-accent-purple">
                      <Sparkles className="h-3 w-3" /> AI personality
                    </p>
                  )}
                </div>

                <Button
                  variant={p.mine ? "secondary" : "default"}
                  size="sm"
                  className="w-full"
                  disabled={installing === p.id || p.mine}
                  onClick={() => install(p.id)}
                >
                  {installing === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {p.mine ? "Your pack" : "Install"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PublishForm({ onClose, onPublished }: { onClose: () => void; onPublished: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("gambling");
  const [language, setLanguage] = useState("id");
  const [banText, setBanText] = useState("");
  const [allowText, setAllowText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function publish() {
    setBusy(true);
    setErr(null);
    const ban = banText
      .split(/[,\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .map((term) => ({ term, category: focus }));
    const allow = allowText
      .split(/[,\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const instructions = instruction.trim() ? [instruction.trim()] : [];

    const res = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, focus, language, content: { ban, allow, instructions } }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Publish failed");
      return;
    }
    onPublished();
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-white">
          <ShieldCheck className="h-5 w-5 text-accent-cyan" /> Publish a rule pack
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Pack name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Anti-Judol Pack"
            className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:border-accent-cyan/50 focus:outline-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Focus</span>
            <select value={focus} onChange={(e) => setFocus(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:outline-none">
              {["gambling", "scam", "phishing", "spam", "toxic"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Language</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:outline-none">
              {["id", "en", "ms", "multi"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Description</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this pack protects against"
            className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:border-accent-cyan/50 focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Banned words (comma/newline)</span>
          <textarea value={banText} onChange={(e) => setBanText(e.target.value)} rows={3} placeholder="maxwin, gacor, slot88"
            className="w-full resize-none rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-white focus:border-accent-cyan/50 focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Allowed words (whitelist)</span>
          <textarea value={allowText} onChange={(e) => setAllowText(e.target.value)} rows={3} placeholder="airdrop, bonus"
            className="w-full resize-none rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-white focus:border-accent-cyan/50 focus:outline-none" />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">AI personality instruction (optional)</span>
          <input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Be strict against gambling."
            className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:border-accent-cyan/50 focus:outline-none" />
        </label>
      </div>
      {err && (
        <div className="mt-3 rounded-lg border border-accent-red/40 bg-accent-red/10 px-4 py-2 text-sm text-red-200">{err}</div>
      )}
      <Button className="mt-4 w-full" disabled={busy || !name.trim()} onClick={publish}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Publish to marketplace
      </Button>
    </Card>
  );
}
