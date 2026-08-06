"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, ScanLine } from "lucide-react";

/**
 * Hero animation — an AI shield with:
 *  - orbiting security particles
 *  - message bubbles streaming in, being scanned
 *  - threat bubbles rejected (red), clean ones confirmed (green)
 */
const SCAN_MESSAGES = [
  { text: "slot gacor maxwin", threat: true, delay: 0 },
  { text: "klaim hadiah bit.ly/x", threat: true, delay: 1.4 },
  { text: "halo semuanya 👋", threat: false, delay: 2.8 },
  { text: "login verifikasi.xyz", threat: true, delay: 4.2 },
  { text: "terima kasih infonya", threat: false, delay: 5.6 },
];

export function ShieldAnimation() {
  return (
    <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center">
      {/* radial glow */}
      <div className="absolute inset-0 bg-glow-cyan blur-2xl" />

      {/* concentric rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-accent-cyan/20"
          style={{ width: 180 + i * 80, height: 180 + i * 80 }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* orbiting particles */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 150;
        return (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50%", originY: "50%" }}
          >
            <div
              style={{
                transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
              }}
              className="h-2 w-2 rounded-full bg-accent-cyan"
            />
          </motion.div>
        );
      })}

      {/* central shield */}
      <motion.div
        className="relative z-10 flex h-40 w-40 items-center justify-center rounded-[2rem] border border-accent-cyan/40 bg-gradient-to-br from-background-card to-background-elevated shadow-2xl shadow-accent-cyan/20"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-accent-cyan/10 to-transparent" />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <ShieldCheck className="h-20 w-20 text-accent-cyan drop-shadow-[0_0_16px_rgba(34,211,238,0.7)]" strokeWidth={1.5} />
        </motion.div>
        <Lock className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-background-elevated p-1.5 text-accent-green border border-accent-green/40" />
        {/* scanning line */}
        <motion.div
          className="absolute left-2 right-2 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent"
          animate={{ top: ["15%", "85%", "15%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* streaming message bubbles */}
      <div className="absolute -left-4 top-8 flex flex-col gap-3">
        {SCAN_MESSAGES.slice(0, 3).map((m, i) => (
          <motion.div
            key={i}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs backdrop-blur-md ${
              m.threat
                ? "border-accent-red/40 bg-accent-red/10 text-red-200"
                : "border-accent-green/40 bg-accent-green/10 text-green-200"
            }`}
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: m.delay, repeatDelay: 4 }}
          >
            <ScanLine className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{m.text}</span>
            <span className="text-[10px] font-bold">
              {m.threat ? "BLOCKED" : "OK"}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="absolute -right-4 bottom-8 flex flex-col gap-3">
        {SCAN_MESSAGES.slice(3).map((m, i) => (
          <motion.div
            key={i}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs backdrop-blur-md ${
              m.threat
                ? "border-accent-red/40 bg-accent-red/10 text-red-200"
                : "border-accent-green/40 bg-accent-green/10 text-green-200"
            }`}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: m.delay, repeatDelay: 4 }}
          >
            <ScanLine className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{m.text}</span>
            <span className="text-[10px] font-bold">
              {m.threat ? "BLOCKED" : "OK"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
