"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Bot, KeyRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddCommunityForm } from "./add-community-form";

export function CommunitiesList({ communities }: { communities: any[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-16 items-center justify-between border-b border-border px-8">
        <h1 className="text-lg font-semibold text-white">Communities</h1>
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4" />
          {adding ? "Cancel" : "Add community"}
        </Button>
      </header>

      <div className="space-y-6 p-8">
        {adding && <AddCommunityForm onClose={() => setAdding(false)} />}

        {communities.length === 0 && !adding ? (
          <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-elevated border border-border">
              <Bot className="h-7 w-7 text-accent-cyan" />
            </div>
            <div>
              <h3 className="font-semibold text-white">No communities yet</h3>
              <p className="mt-1 text-sm text-slate-400">
                Connect your first Telegram or Discord community to start protecting it.
              </p>
            </div>
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" />
              Add your first community
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {communities.map((c) => (
              <Card key={c.id} className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent-cyan/20 border border-accent-cyan/30">
                      <Bot className="h-5 w-5 text-accent-cyan" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{c.name}</h3>
                      <p className="text-xs capitalize text-slate-500">
                        {c.platform} · {c.platformRef}
                      </p>
                    </div>
                  </div>
                  <Badge variant={c.enabled ? "green" : "default"}>
                    {c.enabled ? "Active" : "Paused"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-background-elevated/50 p-3">
                    <p className="text-xs text-slate-500">Protection</p>
                    <p className="mt-0.5 font-medium capitalize text-white">{c.protectionMode}</p>
                  </div>
                  <div className="rounded-lg bg-background-elevated/50 p-3">
                    <p className="text-xs text-slate-500">Sensitivity</p>
                    <p className="mt-0.5 font-medium text-white">{c.sensitivity}/100</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background-elevated/30 px-3 py-2">
                  <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                  <code className="flex-1 truncate text-xs text-slate-400">{c.apiKey}</code>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href="/dashboard/settings" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">Configure</Button>
                  </Link>
                  <Link href="/dashboard/logs" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">View logs</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
