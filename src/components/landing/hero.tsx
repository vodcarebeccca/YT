"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAnimation } from "./shield-animation";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background grid + radial fade */}
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 bg-radial-fade" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-6"
        >
          <Badge variant="cyan" className="px-3 py-1">
            <Sparkles className="h-3 w-3" />
            AI-powered moderation 24/7
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Protect Your Community With{" "}
            <span className="gradient-text">AI-Powered Moderation</span>
          </h1>

          <p className="max-w-xl text-lg text-slate-400">
            Automatically detect spam, scams, gambling, toxic behavior and threats
            before they damage your community. GuardAI scans every message in
            real time and acts instantly.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg" className="group">
                Start Protecting Community
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                <Play className="h-4 w-4" />
                View Demo
              </Button>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400">
            <div>
              <span className="text-2xl font-bold text-white">5+</span> threat categories
            </div>
            <div>
              <span className="text-2xl font-bold text-white">&gt;90%</span> detection accuracy
            </div>
            <div>
              <span className="text-2xl font-bold text-white">&lt;5%</span> false positives
            </div>
          </div>
        </motion.div>

        {/* animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ShieldAnimation />
        </motion.div>
      </div>
    </section>
  );
}
