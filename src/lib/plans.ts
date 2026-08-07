/**
 * Subscription plans & feature gating (Phase 3).
 *
 *   free      — 1 community, rule engine only, marketplace browse
 *   pro       — unlimited communities, AI classifier, analytics, custom rules, publish packs
 *   business  — everything in pro + higher limits
 *
 * Billing is demo-mode: upgrading flips the plan in-DB (no real payment). A
 * Stripe adapter would hook into `updatePlan` after a successful webhook.
 */
import { getUserById } from "@/lib/db/users";
import { listCommunitiesByOwner } from "@/lib/db/communities";

export type Plan = "free" | "pro" | "business";

export interface PlanFeatures {
  maxCommunities: number; // -1 = unlimited
  aiClassifier: boolean;
  analytics: boolean;
  customRules: boolean;
  marketplacePublish: boolean;
  advancedDetection: boolean;
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    maxCommunities: 1,
    aiClassifier: false,
    analytics: false,
    customRules: false,
    marketplacePublish: false,
    advancedDetection: false,
  },
  pro: {
    maxCommunities: -1,
    aiClassifier: true,
    analytics: true,
    customRules: true,
    marketplacePublish: true,
    advancedDetection: true,
  },
  business: {
    maxCommunities: -1,
    aiClassifier: true,
    analytics: true,
    customRules: true,
    marketplacePublish: true,
    advancedDetection: true,
  },
};

export const PLAN_INFO: Record<
  Plan,
  { name: string; price: string; period: string; tagline: string }
> = {
  free: { name: "Free", price: "Rp0", period: "/mo", tagline: "For small communities" },
  pro: { name: "Pro", price: "Rp149K", period: "/mo", tagline: "For growing communities" },
  business: {
    name: "Business",
    price: "Rp499K",
    period: "/mo",
    tagline: "For large communities & networks",
  },
};

export const PLAN_ORDER: Plan[] = ["free", "pro", "business"];

export function planRank(plan: string): number {
  return PLAN_ORDER.indexOf(plan as Plan);
}

export function featuresFor(plan: string): PlanFeatures {
  return PLAN_FEATURES[(plan as Plan) ?? "free"] ?? PLAN_FEATURES.free;
}

export interface Entitlement {
  plan: Plan;
  features: PlanFeatures;
  communitiesUsed: number;
  communitiesLimit: number; // -1 unlimited
  canAddCommunity: boolean;
  canUseFeature: (key: keyof PlanFeatures) => boolean;
}

export function getEntitlement(userId: string): Entitlement {
  const user = getUserById(userId);
  const plan = (user?.plan as Plan) ?? "free";
  const features = featuresFor(plan);
  const used = listCommunitiesByOwner(userId).length;
  const limit = features.maxCommunities;
  return {
    plan,
    features,
    communitiesUsed: used,
    communitiesLimit: limit,
    canAddCommunity: limit === -1 || used < limit,
    canUseFeature: (key) => Boolean(features[key]),
  };
}
