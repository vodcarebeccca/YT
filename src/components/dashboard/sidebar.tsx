"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ScrollText,
  ShieldAlert,
  Settings,
  ShieldCheck,
  LogOut,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/communities", label: "Communities", icon: Users },
  { href: "/dashboard/logs", label: "Moderation Logs", icon: ScrollText },
  { href: "/dashboard/detection", label: "Threat Detection", icon: ShieldAlert },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ userName, userEmail }: { userName?: string | null; userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-background-subtle/60 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-cyan">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">
            Guard<span className="gradient-text">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-primary/20 to-accent-cyan/10 text-white border border-accent-cyan/30"
                  : "text-slate-400 hover:bg-background-card hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-accent-cyan")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-background-card px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-primary text-sm font-bold text-white">
            {(userName || userEmail || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{userName || "User"}</p>
            <p className="truncate text-xs text-slate-500">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-background-card hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
