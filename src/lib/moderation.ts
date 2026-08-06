/**
 * Moderation core — bridges the detection engine to persistence + action policy.
 *
 * Given an inbound message and a community config, it:
 *   1. runs the detection pipeline
 *   2. persists a message log (+ moderation log when actioned)
 *   3. returns the concrete action for the platform adapter to execute
 *
 * Platform-specific side effects (deleting a Telegram message, restricting a
 * user) live in the adapter (src/bot/*), keeping this module pure & testable.
 */
import { detect } from "@/lib/detection/detector";
import { logMessage, logModeration } from "@/lib/db/logs";
import type {
  ModerationAction,
  ProtectionMode,
  DetectionCategory,
} from "@/lib/detection/types";

export interface InboundMessage {
  communityId: string;
  messageId?: string;
  senderId: string;
  senderName?: string | null;
  text: string;
}

export interface CommunityConfig {
  id: string;
  protectionMode: ProtectionMode;
  sensitivity: number;
  enabled: boolean;
}

export interface ModerationDecision {
  action: ModerationAction;
  riskScore: number;
  categories: DetectionCategory[];
  normalized: string;
  topCategory: DetectionCategory;
  warning: string;
  logId?: string;
}

/** Build the user-facing warning text for a category. */
export function warningText(category: DetectionCategory): string {
  const map: Record<string, string> = {
    gambling:
      "⚠️ Pesan kamu terdeteksi mengandung promosi judi online dan telah dihapus.",
    scam: "⚠️ Pesan kamu terdeteksi sebagai upaya penipuan/scam dan telah dihapus.",
    phishing:
      "⚠️ Pesan kamu mengandung link mencurigakan (phishing) dan telah dihapus.",
    spam: "⚠️ Pesan kamu terdeteksi sebagai spam dan telah dihapus.",
    toxic:
      "⚠️ Pesan kamu terdeteksi mengandung kata-kata toxic. Mohon jaga sikap.",
    safe: "",
  };
  return map[category] ?? "⚠️ Pesan kamu terdeteksi melanggar aturan komunitas.";
}

/**
 * Moderate an inbound message. Always persists a message log; persists a
 * moderation log when an action beyond "none" is taken.
 */
export function moderate(
  msg: InboundMessage,
  config: CommunityConfig
): ModerationDecision {
  const result = detect(msg.text, { sensitivity: config.sensitivity, ai: true });
  const topCategory = result.categories[0] ?? "safe";

  // If protection is disabled, we still scan+log but never act.
  const action = config.enabled
    ? result.recommendedAction(config.protectionMode)
    : "none";

  logMessage({
    communityId: msg.communityId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    text: msg.text,
    riskScore: result.riskScore,
    categories: result.categories.join(","),
    normalized: result.normalized,
    blocked: action !== "none",
  });

  let logId: string | undefined;
  if (action !== "none" && topCategory !== "safe") {
    const mod = logModeration({
      communityId: msg.communityId,
      actorId: null,
      messageId: msg.messageId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      messageText: msg.text,
      category: topCategory,
      riskScore: result.riskScore,
      action,
      reason: result.signals.map((s) => s.reason).join("; "),
    });
    logId = mod.id;
  }

  return {
    action,
    riskScore: result.riskScore,
    categories: result.categories,
    normalized: result.normalized,
    topCategory,
    warning: warningText(topCategory),
    logId,
  };
}
