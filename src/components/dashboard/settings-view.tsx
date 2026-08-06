"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, ShieldOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "safe", label: "Safe", desc: "Warn only — never delete" },
  { value: "balanced", label: "Balanced", desc: "Delete + warn" },
  { value: "aggressive", label: "Aggressive", desc: "Delete + mute + ban" },
] as const;

export function SettingsView({ communities }: { communities: any[] }) {
  if (communities.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-8">
          <Card className="flex flex-col items-center gap-3 p-12 text-center">
            <ShieldOff className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">
              No communities to configure. Add one first.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header />
      <div className="space-y-6 p-8">
        {communities.map((c) => (
          <CommunitySettings key={c.id} community={c} />
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-16 items-center border-b border-border px-8">
      <div>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-xs text-slate-500">Configure protection for each community</p>
      </div>
    </header>
  );
}

function CommunitySettings({ community }: { community: any }) {
  const router = useRouter();
  const [mode, setMode] = useState(community.protectionMode);
  const [sensitivity, setSensitivity] = useState(community.sensitivity);
  const [enabled, setEnabled] = useState(community.enabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/communities/${community.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ protectionMode: mode, sensitivity, enabled }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const dirty =
    mode !== community.protectionMode ||
    sensitivity !== community.sensitivity ||
    enabled !== community.enabled;

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{community.name}</h3>
          <p className="text-xs capitalize text-slate-500">{community.platform} · {community.platformRef}</p>
        </div>
        <Badge variant={enabled ? "green" : "default"}>{enabled ? "Active" : "Paused"}</Badge>
      </div>

      {/* protection mode */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-300">Protection mode</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                mode === m.value
                  ? "border-accent-cyan/50 bg-accent-cyan/10"
                  : "border-border bg-background-elevated/40 hover:border-border"
              )}
            >
              <p className={cn("font-medium", mode === m.value ? "text-accent-cyan" : "text-white")}>
                {m.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* sensitivity */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Detection sensitivity</label>
          <span className="text-sm font-semibold text-accent-cyan">{sensitivity}/100</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sensitivity}
          onChange={(e) => setSensitivity(Number(e.target.value))}
          className="w-full accent-accent-cyan"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>Lenient (fewer false positives)</span>
          <span>Strict (catch more)</span>
        </div>
      </div>

      {/* enable toggle */}
      <div className="mb-6 flex items-center justify-between rounded-lg bg-background-elevated/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Protection enabled</p>
          <p className="text-xs text-slate-500">When off, messages are scanned but no action is taken.</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            enabled ? "bg-accent-cyan" : "bg-background-elevated"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              enabled ? "translate-x-[22px]" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-accent-green">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </Card>
  );
}
