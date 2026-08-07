"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Dices,
  ShieldAlert,
  MessageSquareWarning,
  Bot,
  Zap,
  Link2,
  ScanSearch,
  ShieldCheck,
  Check,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------- Trusted strip ----------------
export function TrustStrip() {
  const items = [
    "Judi Online",
    "Scam & Phishing",
    "Spam",
    "Toxic Behavior",
    "Hate Speech",
    "Bot Abuse",
  ];
  return (
    <div className="border-y border-border/60 bg-background-subtle/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Protects against
        </span>
        {items.map((i) => (
          <span key={i} className="text-sm font-medium text-slate-300">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------- Features ----------------
const FEATURES = [
  {
    icon: Brain,
    title: "AI Threat Detection",
    desc: "Context-aware engine understands intent — not just keywords. Blocks promotions while allowing warnings.",
    color: "text-accent-cyan",
  },
  {
    icon: Dices,
    title: "Anti Gambling Protection",
    desc: "Detects judi online, slot, gacor even when obfuscated with Cyrillic homoglyphs, spacing or fullwidth chars.",
    color: "text-accent-purple",
  },
  {
    icon: ShieldAlert,
    title: "Anti Scam & Phishing",
    desc: "Catches fake giveaways, impersonation, fake login pages, shortened and suspicious-domain URLs.",
    color: "text-accent-red",
  },
  {
    icon: MessageSquareWarning,
    title: "Toxic Filter",
    desc: "Indonesian-first toxic language detection: insults, harassment, hate speech and sexual content.",
    color: "text-accent-amber",
  },
  {
    icon: Bot,
    title: "Smart Moderation",
    desc: "Three protection modes — Safe, Balanced, Aggressive — auto delete, mute, ban or just warn.",
    color: "text-accent-green",
  },
  {
    icon: Zap,
    title: "Real-time, 24/7",
    desc: "Every message scanned in milliseconds. Never sleeps, never tires, handles thousands of messages.",
    color: "text-accent-cyan",
  },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        badge="Features"
        title="Everything you need to keep your community safe"
        subtitle="A complete moderation arsenal, powered by AI and tuned for Indonesian communities."
      />
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="group h-full p-6 transition-all hover:border-accent-cyan/40 hover:bg-background-elevated/60">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-background-elevated border border-border">
                <f.icon className={cn("h-6 w-6", f.color)} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ---------------- How it works ----------------
const STEPS = [
  { icon: Link2, title: "Connect your community", desc: "Add a Telegram or Discord bot to your group in seconds." },
  { icon: ScanSearch, title: "AI scans messages", desc: "Every message is normalized, analyzed and scored in real time." },
  { icon: ShieldCheck, title: "Threats removed automatically", desc: "Spam, scams and toxicity are deleted, muted or banned instantly." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative border-y border-border/60 bg-background-subtle/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          badge="How it works"
          title="Three steps to a safer community"
        />
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent-cyan/20 border border-accent-cyan/30">
                <s.icon className="h-7 w-7 text-accent-cyan" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan text-xs font-bold text-background">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-full bg-gradient-to-r from-accent-cyan/40 to-transparent md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- Pricing ----------------
const PLANS = [
  {
    name: "Free",
    price: "Rp0",
    period: "/mo",
    desc: "For small communities getting started.",
    features: ["1 community", "Basic detection", "Moderation logs", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "Rp149K",
    period: "/mo",
    desc: "For growing communities that need more.",
    features: ["Unlimited communities", "Advanced AI detection", "Full analytics", "All protection modes", "Priority support"],
    cta: "Start Pro trial",
    highlight: true,
  },
  {
    name: "Business",
    price: "Custom",
    period: "",
    desc: "For large communities & networks.",
    features: ["Everything in Pro", "Large community scale", "Custom rules", "Dedicated manager", "SLA & onboarding"],
    cta: "Contact sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        badge="Pricing"
        title="Simple, transparent pricing"
        subtitle="Start free. Upgrade when your community grows."
      />
      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <Card
            key={p.name}
            className={cn(
              "relative flex flex-col p-8",
              p.highlight && "border-accent-cyan/50 shadow-2xl shadow-accent-cyan/10"
            )}
          >
            {p.highlight && (
              <Badge variant="cyan" className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-white">{p.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{p.desc}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{p.price}</span>
              <span className="text-sm text-slate-400">{p.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-accent-green" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-8">
              <Button variant={p.highlight ? "default" : "secondary"} className="w-full">
                {p.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ---------------- FAQ ----------------
import * as React from "react";
const FAQS = [
  { q: "How does GuardAI detect obfuscated gambling words?", a: "Our normalizer collapses Unicode tricks — Cyrillic/Greek homoglyphs, fullwidth characters, zero-width characters, repeated letters and spacing — so 'jυdі' or 'j-u-d-i' are matched as 'judi'." },
  { q: "Will it false-positive on warnings about scams?", a: "No. The engine understands negation context — 'jangan percaya link judi itu' is treated as safe, while 'klik link judi ini' is blocked." },
  { q: "What platforms are supported?", a: "Phase 1 ships with full Telegram integration. Discord lands in Phase 2. The detection engine itself is platform-agnostic." },
  { q: "Is my data private?", a: "Yes. Messages are scanned in real time and only moderation-relevant metadata is retained for your logs. You own your data." },
  { q: "Can I tune how strict moderation is?", a: "Absolutely. Choose Safe (warn only), Balanced (delete + warn) or Aggressive (delete + mute + ban), and adjust sensitivity per community." },
];

export function FAQ() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeading badge="FAQ" title="Frequently asked questions" />
      <div className="mt-12 space-y-3">
        {FAQS.map((f, i) => (
          <Card key={i} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-white">{f.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                  open === i && "rotate-180"
                )}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                {f.a}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

// ---------------- CTA ----------------
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to make your community <span className="gradient-text">safe again?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Join community owners who trust GuardAI to keep spam, scams and toxicity out — automatically, 24/7.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign in</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------- Footer ----------------
export function Footer() {
  return (
    <footer className="border-t border-border bg-background-subtle/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-cyan">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">GuardAI</span>
            <span className="ml-2 text-xs text-slate-500">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#faq">FAQ</Link>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-600">
          GuardAI — AI Community Security Platform · Phase 1 build
        </p>
      </div>
    </footer>
  );
}

// ---------------- shared heading ----------------
function SectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl text-center"
    >
      <Badge variant="cyan" className="mb-4">{badge}</Badge>
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-slate-400">{subtitle}</p>}
    </motion.div>
  );
}
