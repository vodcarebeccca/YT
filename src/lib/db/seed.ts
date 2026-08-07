/**
 * Seed a demo environment with an admin account + sample community + logs.
 * Idempotent — only seeds when the database is empty.
 */
import bcrypt from "bcryptjs";
import { countUsers, createUser, getUserByEmail, updatePlan } from "./users";
import { createCommunity, getCommunityByPlatformRef } from "./communities";
import { logMessage, logModeration } from "./logs";
import { createPack, listPacks } from "./marketplace";
import { detect } from "@/lib/detection/detector";
import type { ProtectionMode } from "@/lib/detection/types";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { migrate } from "./schema";

const SAMPLE_MESSAGES = [
  "daftar sekarang bonus besar, slot gacor maxwin malam ini klik link",
  "Selamat! kamu menang hadiah iPhone, klaim sekarang di bit.ly/xxx",
  "kamu goblok dan bangsat, jangan muncul lagi",
  "verifikasi akunmu di login-aman.xyz segera",
  "Halo semuanya, selamat pagi dan semoga harimu menyenangkan!",
  "investasi modal 50rb profit berkali lipat dijamin tembus",
  "main j-u-d-i online yuk, daftar gratis",
  "Bagaimana cara deposito di bank ini?",
  "cekk link free saldo bit.ly/free-saldo sekarang limited",
  "Terima kasih infonya, sangat membantu",
];

/** Seed a few starter marketplace packs if none exist. */
function seedPacksIfEmpty(): void {
  if (listPacks().length > 0) return;
  const admin = getUserByEmail(DEMO_CREDENTIALS.email);
  if (!admin) return;

  const STARTER = [
    {
      name: "Anti Judol Strict (ID)",
      description: "Daftar kata judi online + obfuscation umum. Sensitivitas tinggi untuk komunitas Indonesia.",
      language: "id" as const,
      focus: "gambling",
      content: {
        ban: [
          { term: "maxwin", category: "gambling", weight: 0.9 },
          { term: "gacor", category: "gambling", weight: 0.9 },
          { term: "rtp", category: "gambling", weight: 0.6 },
          { term: "pgsoft", category: "gambling", weight: 0.6 },
          { term: "pragmatic", category: "gambling", weight: 0.5 },
        ],
        allow: [],
        instructions: ["Be strict against gambling."],
        sensitivity: 50,
        mode: "aggressive",
      },
    },
    {
      name: "Crypto Scam Shield (EN)",
      description: "Catches fake giveaways, airdrop gas-fee scams and impersonation in English crypto communities.",
      language: "en" as const,
      focus: "scam",
      content: {
        ban: [
          { term: "gas fee", category: "scam", weight: 0.6 },
          { term: "send me", category: "scam", weight: 0.4 },
        ],
        allow: ["airdrop"],
        instructions: ["Be strict against scam and phishing."],
        sensitivity: 55,
        mode: "balanced",
      },
    },
    {
      name: "Family-Friendly (Multi)",
      description: "Toxicity-first rules + safe-word allowlist. Great for education & family communities.",
      language: "multi" as const,
      focus: "toxic",
      content: {
        ban: [
          { term: "kontol", category: "toxic", weight: 0.9 },
          { term: "memek", category: "toxic", weight: 0.9 },
          { term: "anjing", category: "toxic", weight: 0.6 },
          { term: "fuck", category: "toxic", weight: 0.7 },
        ],
        allow: [],
        instructions: ["Keep the community family-friendly."],
        sensitivity: 45,
        mode: "balanced",
      },
    },
  ];

  for (const p of STARTER) {
    createPack({ ...p, ownerId: admin.id });
  }
}

/** Ensure schema exists + demo data is seeded. Idempotent; safe to call anywhere. */
export function ensureReady(): void {
  migrate();
  if (countUsers() === 0) {
    seedSync();
  }
  // Make sure the demo account is on the top plan (so all features are explorable).
  const demo = getUserByEmail(DEMO_CREDENTIALS.email);
  if (demo && demo.plan === "free") {
    updatePlan(demo.id, "business");
  }
  seedPacksIfEmpty();
}

/** Async-compatible alias (operations are synchronous under node:sqlite). */
export async function seedIfEmpty(): Promise<void> {
  ensureReady();
}

function seedSync(): void {
  const passwordHash = bcrypt.hashSync(DEMO_CREDENTIALS.password, 10);
  const user = createUser({
    name: "GuardAI Admin",
    email: DEMO_CREDENTIALS.email,
    passwordHash,
    role: "admin",
  });
  // Demo account gets the top plan so all Phase 3 features are explorable.
  updatePlan(user.id, "business");

  const community =
    getCommunityByPlatformRef("telegram", "-1001234567890") ??
    createCommunity({
      name: "Demo Community",
      platform: "telegram",
      platformRef: "-1001234567890",
      ownerId: user.id,
      protectionMode: "balanced",
      sensitivity: 60,
    });

  const mode: ProtectionMode = "balanced";
  for (const text of SAMPLE_MESSAGES) {
    const result = detect(text, { sensitivity: community.sensitivity });
    const action = result.recommendedAction(mode);
    logMessage({
      communityId: community.id,
      senderId: "demo_user_" + Math.floor(Math.random() * 5),
      senderName: "Member " + Math.floor(Math.random() * 10),
      text,
      riskScore: result.riskScore,
      categories: result.categories.join(","),
      normalized: result.normalized,
      blocked: action !== "none",
    });
    if (action !== "none" && result.categories[0] !== "safe") {
      logModeration({
        communityId: community.id,
        actorId: null,
        senderId: "demo_user",
        messageText: text,
        category: result.categories[0] as any,
        riskScore: result.riskScore,
        action,
        reason: result.signals.map((s) => s.reason).join("; "),
      });
    }
  }
}

// Run directly: `npm run db:seed`
if (require.main === module) {
  ensureReady();
  // eslint-disable-next-line no-console
  console.log("[seed] done");
}
