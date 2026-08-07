"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ShieldCheck, Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_CREDENTIALS } from "@/lib/constants";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    if (mode === "register") {
      const name = String(form.get("name") || "");
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function useDemo() {
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) setError("Demo login failed");
    else router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-cyan shadow-lg shadow-primary/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Guard<span className="gradient-text">AI</span>
          </span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-white">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {mode === "login"
            ? "Sign in to your GuardAI dashboard"
            : "Start protecting your community in minutes"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <Field
            icon={<User className="h-4 w-4" />}
            name="name"
            type="text"
            label="Name (optional)"
            placeholder="Your name"
          />
        )}
        <Field
          icon={<Mail className="h-4 w-4" />}
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
        />
        <Field
          icon={<Lock className="h-4 w-4" />}
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          required
        />

        {error && (
          <div className="rounded-lg border border-accent-red/40 bg-accent-red/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {mode === "login" && (
        <div className="mt-4">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background-card px-2 text-slate-500">or</span>
            </div>
          </div>
          <Button variant="secondary" className="w-full" onClick={useDemo} disabled={loading}>
            <ShieldCheck className="h-4 w-4" />
            Try the demo account
          </Button>
          <p className="mt-2 text-center text-xs text-slate-500">
            admin@guardai.dev · guardai123
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent-cyan hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent-cyan hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  icon,
  name,
  type,
  label,
  placeholder,
  required,
}: {
  icon: React.ReactNode;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-lg border border-border bg-background-elevated pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
        />
      </div>
    </label>
  );
}
