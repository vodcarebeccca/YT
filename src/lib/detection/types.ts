/**
 * Detection engine — shared types.
 */

export type DetectionCategory =
  | "gambling"
  | "scam"
  | "phishing"
  | "spam"
  | "toxic"
  | "safe";

export type ModerationAction =
  | "none"
  | "warning"
  | "delete"
  | "mute"
  | "ban"
  | "report";

export type ProtectionMode = "safe" | "balanced" | "aggressive";

export type Platform = "telegram" | "discord";

export interface Signal {
  category: Exclude<DetectionCategory, "safe">;
  /** Human-readable reason, e.g. "matched gambling keyword: gacor". */
  reason: string;
  /** Confidence weight 0..1 contributed by this signal. */
  weight: number;
  /** The normalized substring that triggered it (when applicable). */
  match?: string;
}

export interface DetectionResult {
  /** Original input (echoed back). */
  raw: string;
  /** Canonical normalized text used for matching. */
  normalized: string;
  /** 0..100 aggregate risk score. */
  riskScore: number;
  /** Categories that triggered, ordered by contribution. */
  categories: DetectionCategory[];
  /** Individual signals explaining the score. */
  signals: Signal[];
  /** Recommended action given the result + a protection mode. */
  recommendedAction: (mode: ProtectionMode) => ModerationAction;
  /** True when risk is below threshold and no strong signal fired. */
  isSafe: boolean;
}

export interface DetectionConfig {
  /** Overall sensitivity 0..100 (higher = stricter). Affects thresholds. */
  sensitivity: number;
  /** Per-category enable toggles. */
  enabled: Record<Exclude<DetectionCategory, "safe">, boolean>;
}

export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  sensitivity: 60,
  enabled: {
    gambling: true,
    scam: true,
    phishing: true,
    spam: true,
    toxic: true,
  },
};
