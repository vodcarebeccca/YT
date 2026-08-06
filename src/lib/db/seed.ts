/**
 * Seed a demo environment with an admin account + sample community + logs.
 * Idempotent — only seeds when the database is empty.
 */
import bcrypt from "bcryptjs";
import { countUsers, createUser } from "./users";
import { createCommunity, getCommunityByPlatformRef } from "./communities";
import { logMessage, logModeration } from "./logs";
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

/** Ensure schema exists + demo data is seeded. Idempotent; safe to call anywhere. */
export function ensureReady(): void {
  migrate();
  if (countUsers() === 0) {
    seedSync();
  }
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
