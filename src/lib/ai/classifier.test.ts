import { describe, it, expect } from "vitest";
import { classify } from "@/lib/ai/classifier";

describe("AI classifier — Naive Bayes", () => {
  it("returns probabilities that sum to ~1", () => {
    const r = classify("halo semua apa kabar");
    const sum = Object.values(r.probabilities).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
  });

  it("classifies a held-out gambling promo", () => {
    const r = classify("ayo main slot demo gacor cuan tiap hari");
    expect(r.category).toBe("gambling");
    expect(r.confidence).toBeGreaterThan(0.4);
  });

  it("classifies a held-out scam", () => {
    const r = classify("selamat kamu menang total dapat hadiah langsung, klaim via admin");
    expect(["scam", "phishing"]).toContain(r.category);
  });

  it("classifies a held-out toxic message", () => {
    const r = classify("lu tolol ya, otak udang, pergi sana");
    expect(r.category).toBe("toxic");
  });

  it("classifies a held-out spam with mass mention", () => {
    const r = classify("PROMO JUALAN MURAH HUBUNGI WA SEKARANG JUGA");
    expect(r.category).toBe("spam");
  });

  it("classifies a clean message as safe", () => {
    const r = classify("selamat datang di grup, semoga betah");
    expect(r.category).toBe("safe");
  });

  it("treats a warning about judol as non-gambling", () => {
    // The classifier leans on word stats; "jangan percaya link judi itu penipuan"
    // should NOT be classified as gambling-promo with high confidence.
    const r = classify("jangan percaya link judi itu, itu penipuan");
    expect(r.probabilities.gambling).toBeLessThan(0.6);
  });

  it("handles empty input gracefully", () => {
    const r = classify("");
    expect(Object.values(r.probabilities).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
  });
});
