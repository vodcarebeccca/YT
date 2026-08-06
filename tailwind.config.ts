import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyber security + AI palette
        background: {
          DEFAULT: "#070b14",
          subtle: "#0b1120",
          card: "#0f172a",
          elevated: "#131c33",
        },
        border: {
          DEFAULT: "#1e293b",
          subtle: "#172033",
        },
        primary: {
          DEFAULT: "#0ea5e9", // sky-500
          foreground: "#f0f9ff",
        },
        accent: {
          cyan: "#22d3ee", // AI cyan
          purple: "#a855f7",
          green: "#22c55e",
          red: "#ef4444",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), transparent)",
        "glow-cyan": "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        scan: "scan 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        scan: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.5" },
          "50%": { transform: "translateY(100%)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
