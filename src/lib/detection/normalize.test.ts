import { describe, it, expect } from "vitest";
import { normalizeText } from "@/lib/detection/normalize";

describe("normalizeText — obfuscation collapse", () => {
  it("strips zero-width and invisible characters", () => {
    const input = "judi\u200B\u200Conline";
    const { normalized } = normalizeText(input);
    expect(normalized).toBe("judionline");
  });

  it("maps Cyrillic lookalikes to ASCII", () => {
    // j(Cyrillic і) -> judi
    const input = "jυdі οnlіne";
    const { normalized } = normalizeText(input);
    // separators between letters are removed
    expect(normalized).toContain("judi");
    expect(normalized).toContain("online");
  });

  it("strips separators between letters (j-u-d-i -> judi)", () => {
    expect(normalizeText("j-u-d-i").normalized).toBe("judi");
    expect(normalizeText("j u d i").normalized).toBe("judi");
    expect(normalizeText("j.u.d.i").normalized).toBe("judi");
  });

  it("collapses repeated characters (gacoor -> gacor)", () => {
    expect(normalizeText("gacoooor").normalized).toBe("gacor");
    expect(normalizeText("sllloot").normalized).toBe("slot");
  });

  it("handles fullwidth via NFKC", () => {
    const { normalized } = normalizeText("ｊｕｄｉ");
    expect(normalized).toBe("judi");
  });

  it("preserves word boundaries for context", () => {
    const { normalized } = normalizeText("Klik link judi ini dapat bonus");
    expect(normalized).toContain("klik");
    expect(normalized).toContain("judi");
  });

  it("lowercases output", () => {
    expect(normalizeText("GACOR MAXWIN").normalized).toBe("gacor maxwin");
  });

  it("handles empty input", () => {
    expect(normalizeText("").normalized).toBe("");
  });

  it("removes decorative emoji between letters", () => {
    // emoji is a separator between letters → removed; resulting word collapses
    const { normalized } = normalizeText("judi🔥🔥");
    expect(normalized).toContain("judi");
    expect(normalized).not.toContain("🔥");
  });
});
