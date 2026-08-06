import { describe, it, expect } from "vitest";
import { detect, detectAndAct, actionFor } from "@/lib/detection/detector";
import type { ProtectionMode } from "@/lib/detection/types";

describe("detect — gambling (judol)", () => {
  it("flags plain gambling promo", () => {
    const r = detect("daftar sekarang bonus besar, slot gacor maxwin");
    expect(r.riskScore).toBeGreaterThan(70);
    expect(r.categories).toContain("gambling");
    expect(r.isSafe).toBe(false);
  });

  it("flags obfuscated judi (j-u-d-i, j u d i)", () => {
    const a = detect("main j-u-d-i online");
    const b = detect("main j u d i online");
    expect(a.riskScore).toBeGreaterThan(50);
    expect(b.riskScore).toBeGreaterThan(50);
    expect(a.categories).toContain("gambling");
  });

  it("flags homoglyph judi (Cyrillic)", () => {
    const r = detect("jυdі οnlіne terpercaya");
    expect(r.normalized).toContain("judi");
    expect(r.categories).toContain("gambling");
    expect(r.riskScore).toBeGreaterThan(50);
  });

  it("flags fullwidth judi", () => {
    const r = detect("ｊｕｄｉ gacor");
    expect(r.categories).toContain("gambling");
  });

  it("blocks promo with link + bonus", () => {
    const { result, action } = detectAndAct(
      "Klik link judi ini dapat bonus maxwin",
      "aggressive"
    );
    expect(result.categories).toContain("gambling");
    expect(["mute", "ban"]).toContain(action);
  });
});

describe("detect — context / negation (false-positive control)", () => {
  it("treats a warning about judol as low-risk", () => {
    const r = detect("Jangan percaya link judi itu, itu penipuan");
    // negation should dampen the gambling signal dramatically
    expect(r.riskScore).toBeLessThan(50);
    expect(r.isSafe).toBe(true);
  });

  it("'jangan jadi toxic' is not flagged as toxic", () => {
    const r = detect("Jangan jadi toxic ya");
    expect(r.isSafe).toBe(true);
    expect(r.riskScore).toBeLessThan(50);
  });

  it("keeps direct insults toxic even in a warning sentence", () => {
    const r = detect("kamu bodoh dan tolol");
    expect(r.categories).toContain("toxic");
    expect(r.riskScore).toBeGreaterThan(50);
  });
});

describe("detect — scam", () => {
  it("flags fake giveaway", () => {
    const r = detect("Selamat! kamu menang hadiah iPhone, klik link untuk klaim");
    expect(r.categories).toContain("scam");
    expect(r.riskScore).toBeGreaterThan(50);
  });

  it("flags fake admin impersonation", () => {
    const r = detect("Saya admin asli, silakan transfer untuk verifikasi");
    expect(r.categories).toContain("scam");
    expect(r.riskScore).toBeGreaterThan(60);
  });

  it("flags investment scam", () => {
    const r = detect("investasi modal kecil, profit berkali lipat dijamin");
    expect(r.categories).toContain("scam");
  });
});

describe("detect — phishing", () => {
  it("flags shortened URLs", () => {
    const r = detect("cek ini https://bit.ly/3xY free saldo");
    expect(r.categories).toContain("phishing");
  });

  it("flags suspicious TLDs", () => {
    const r = detect("daftar di situsresmi.xyz sekarang");
    expect(r.categories).toContain("phishing");
  });

  it("flags login lure with link", () => {
    const r = detect("verifikasi akunmu di login-aman.com segera");
    expect(r.categories).toContain("phishing");
  });
});

describe("detect — spam", () => {
  it("flags mass mentions", () => {
    const r = detect("@a @b @c @d @e gabung yuk");
    expect(r.categories).toContain("spam");
  });

  it("flags excessive links", () => {
    const r = detect(
      "klik http://a.com http://b.com http://c.com http://d.com"
    );
    expect(r.categories).toContain("spam");
  });
});

describe("detect — toxic", () => {
  it("flags insults", () => {
    const r = detect("kamu goblok dan bangsat");
    expect(r.categories).toContain("toxic");
    expect(r.riskScore).toBeGreaterThan(70);
  });

  it("flags threats", () => {
    const r = detect("aku akan bunuh kamu");
    expect(r.categories).toContain("toxic");
  });
});

describe("actionFor — protection modes", () => {
  const high = 90;
  const mid = 65;
  const low = 30;

  it("safe mode: never deletes, only warns above threshold", () => {
    expect(actionFor(high, "gambling", "safe", 60)).toBe("warning");
    expect(actionFor(low, "gambling", "safe", 60)).toBe("none");
  });

  it("balanced mode: deletes mid, mutes high", () => {
    expect(actionFor(mid, "gambling", "balanced", 60)).toBe("delete");
    expect(actionFor(high, "gambling", "balanced", 60)).toBe("mute");
  });

  it("aggressive mode: mutes mid, bans high gambling", () => {
    expect(actionFor(mid, "gambling", "aggressive", 60)).toBe("mute");
    expect(actionFor(high, "gambling", "aggressive", 60)).toBe("ban");
  });

  it("aggressive mode: high toxic mutes (not ban)", () => {
    expect(actionFor(high, "toxic", "aggressive", 60)).toBe("mute");
  });

  it("below threshold returns none (mostly)", () => {
    expect(actionFor(low, "gambling", "balanced", 60)).toBe("none");
  });
});

describe("detect — clean messages are safe", () => {
  it("does not flag ordinary messages", () => {
    const r = detect("Halo semuanya, apa kabar hari ini?");
    expect(r.isSafe).toBe(true);
    expect(r.categories).toEqual(["safe"]);
  });

  it("does not flag normal business talk with 'deposit'", () => {
    // single weak term, no co-occurrence
    const r = detect("saya mau tanya soal deposito bank");
    expect(r.riskScore).toBeLessThan(60);
  });
});

describe("detectAndAct — end-to-end action selection", () => {
  it("aggressive gambling promo gets muted or banned", () => {
    const { result, action } = detectAndAct("slot gacor maxwin malam ini", "aggressive");
    expect(result.categories).toContain("gambling");
    expect(["mute", "ban"]).toContain(action);
  });

  it("safe-mode clean message: no action", () => {
    const { action } = detectAndAct("selamat pagi semua", "safe");
    expect(action).toBe("none");
  });
});
