"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Loader2, Zap, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Entitlement {
  plan: string;
  communitiesUsed: number;
  communitiesLimit: number;
  features: Record<string, boolean>;
}
interface PlanInfo {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  rank: number;
}

const FEATURE_LABELS: Record<string, string> = {
  maxCommunities: "Communities",
  aiClassifier: "AI classifier",
  analytics: "Analytics",
  customRules: "Custom rules & AI personality",
  marketplacePublish: "Publish to marketplace",
  advancedDetection: "Advanced detection",
};

const PLAN_BENEFITS: Record<string, string[]> = {
  free: ["1 community", "Rule-based detection", "Moderation logs", "Marketplace browse"],
  pro: ["Unlimited communities", "AI classifier", "Full analytics", "Custom rules", "Marketplace publish"],
  business: ["Everything in Pro", "Advanced detection", "Priority scale", "AI personality", "Custom rules marketplace"],
};

export function BillingView({ currentPlan }: { currentPlan: string }) {
  const router = useRouter();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => {
        setEntitlement(d.entitlement);
        setPlans(d.plans);
      });
  }, []);

  async function upgrade(plan: string) {
    setBusy(plan);
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setBusy(null);
    router.refresh();
    const r = await fetch("/api/plans").then((r) => r.json());
    setEntitlement(r.entitlement);
  }

  const used = entitlement?.communitiesUsed ?? 0;
  const limit = entitlement?.communitiesLimit ?? 1;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-16 items-center justify-between border-b border-border px-8">
        <div>
          <h1 className="text-lg font-semibold text-white">Billing & Plan</h1>
          <p className="text-xs text-slate-500">Manage your subscription</p>
        </div>
        <Badge variant="cyan" className="capitalize">
          <Crown className="h-3 w-3" /> {currentPlan}
        </Badge>
      </header>

      <div className="space-y-6 p-8">
        {/* usage */}
        {entitlement && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Community usage</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {used}
                  <span className="text-base font-normal text-slate-500">
                    {" "}/ {limit === -1 ? "∞" : limit}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(entitlement.features).map(([k, v]) =>
                  k === "maxCommunities" ? null : (
                    <Badge key={k} variant={v ? "green" : "default"}>
                      {v ? <Check className="h-3 w-3" /> : null}
                      {FEATURE_LABELS[k] ?? k}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </Card>
        )}

        {/* plans */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = entitlement?.plan === p.id;
            const benefits = PLAN_BENEFITS[p.id] ?? [];
            return (
              <Card key={p.id} className={cn("relative flex flex-col p-8", p.id === "pro" && "border-accent-cyan/50")}>
                {p.id === "pro" && (
                  <Badge variant="cyan" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  {p.id === "business" ? (
                    <Crown className="h-5 w-5 text-accent-purple" />
                  ) : p.id === "pro" ? (
                    <Zap className="h-5 w-5 text-accent-cyan" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-slate-500" />
                  )}
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-400">{p.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  <span className="text-sm text-slate-400">{p.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-accent-green" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={isCurrent ? "secondary" : p.id === "pro" ? "default" : "secondary"}
                  disabled={isCurrent || busy === p.id}
                  onClick={() => upgrade(p.id)}
                >
                  {busy === p.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCurrent ? "Current plan" : p.id === "free" ? "Downgrade" : `Upgrade to ${p.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
        <p className="text-center text-xs text-slate-600">
          Demo billing — upgrading flips your plan instantly (no real payment). In production a Stripe
          webhook would confirm payment before activating.
        </p>
      </div>
    </div>
  );
}
