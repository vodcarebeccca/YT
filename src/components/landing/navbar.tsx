"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-cyan shadow-lg shadow-primary/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Guard<span className="gradient-text">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Start Protecting</Button>
          </Link>
        </div>

        <button
          className="text-slate-300 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background-card md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-background-elevated"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">Sign in</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button size="sm" className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
