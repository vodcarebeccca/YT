"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AddCommunityForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      platform: String(form.get("platform") || "telegram"),
      platformRef: String(form.get("platformRef") || ""),
      protectionMode: String(form.get("protectionMode") || "balanced"),
      sensitivity: Number(form.get("sensitivity") || 60),
    };
    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create community");
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Add a community</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field name="name" label="Community name" placeholder="My Telegram Group" />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            name="platform"
            label="Platform"
            options={[
              { value: "telegram", label: "Telegram" },
              { value: "discord", label: "Discord" },
            ]}
          />
          <Field name="platformRef" label="Chat / Guild ID" placeholder="-1001234567890" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            name="protectionMode"
            label="Protection mode"
            options={[
              { value: "safe", label: "Safe (warn only)" },
              { value: "balanced", label: "Balanced (delete + warn)" },
              { value: "aggressive", label: "Aggressive (mute/ban)" },
            ]}
          />
          <RangeField name="sensitivity" label="Sensitivity" min={0} max={100} defaultVal={60} />
        </div>
        {error && (
          <div className="rounded-lg border border-accent-red/40 bg-accent-red/10 px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create community
        </Button>
      </form>
    </Card>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        required
        className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <select
        name={name}
        defaultValue={options[0].value}
        className="h-10 w-full rounded-lg border border-border bg-background-elevated px-3 text-sm text-white focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeField({
  name,
  label,
  min,
  max,
  defaultVal,
}: {
  name: string;
  label: string;
  min: number;
  max: number;
  defaultVal: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        defaultValue={defaultVal}
        className="mt-2 w-full accent-accent-cyan"
      />
    </label>
  );
}
