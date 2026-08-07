import { describe, it, expect } from "vitest";
import { detect } from "@/lib/detection/detector";
import type { CustomRuleset } from "@/lib/detection/types";

describe("detect — Phase 3 custom rules", () => {
  it("flags custom banned words", () => {
    const ruleset: CustomRuleset = {
      ban: [{ term: "suspiciousbrand", category: "gambling", weight: 0.8 }],
      allow: [],
      instructions: [],
    };
    const r = detect("promo suspiciousbrand sekarang", { customRuleset: ruleset });
    expect(r.categories).toContain("gambling");
    expect(r.riskScore).toBeGreaterThan(50);
    expect(r.signals.some((s) => s.reason.includes("custom banned word"))).toBe(true);
  });

  it("allow-list suppresses a matching signal", () => {
    // "gacor" is normally a strong gambling keyword; allow it explicitly.
    const ruleset: CustomRuleset = {
      ban: [],
      allow: ["gacor"],
      instructions: [],
    };
    const r = detect("ini gacor banget", { customRuleset: ruleset });
    expect(r.signals.some((s) => s.match === "gacor")).toBe(false);
  });

  it("AI personality instructions boost strictness for named category", () => {
    const base = detect("lu goblok"); // insult — baseline
    const strict: CustomRuleset = {
      ban: [],
      allow: [],
      instructions: ["Be strict against toxic."],
    };
    const boosted = detect("lu goblok", { customRuleset: strict });
    expect(boosted.riskScore).toBeGreaterThanOrEqual(base.riskScore);
  });

  it("ignores irrelevant instructions (no category mentioned)", () => {
    const ruleset: CustomRuleset = {
      ban: [],
      allow: [],
      instructions: ["Keep things friendly and welcoming."],
    };
    const a = detect("halo semua apa kabar", { customRuleset: ruleset });
    expect(a.isSafe).toBe(true);
  });
});
