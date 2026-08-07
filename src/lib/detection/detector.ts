/**
 * Detection Engine — core pipeline.
 *
 *   raw → normalize → pattern detect (per category) → context adjust
 *        → risk score → recommended action
 *
 * Designed to be deterministic, fast, dependency-free, and fully unit-testable.
 * The Phase 2 AI classifier slots in as an additional signal provider.
 */

import { normalizeText } from "./normalize";
import { classify as aiClassify } from "@/lib/ai/classifier";
import {
  GAMBLING_TERMS,
  SCAM_PATTERNS,
  SPAM_PATTERNS,
  PHISHING_PATTERNS,
  URL_SHORTENERS,
  SUSPICIOUS_TLDS,
  TOXIC_INSULT,
  TOXIC_HARASSMENT,
  TOXIC_HATE,
  NEGATION_CUES,
  type Term,
} from "./dictionaries";
import type {
  DetectionResult,
  Signal,
  DetectionConfig,
  ProtectionMode,
  ModerationAction,
  DetectionCategory,
} from "./types";

// ---------- helpers ----------

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Match a whole-word-ish term against normalized text (word boundaries are fuzzy). */
function matchTerms(normalized: string, terms: Term[]): Signal[] {
  const out: Signal[] = [];
  for (const term of terms) {
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(term.t)}([^a-z0-9]|$)`, "i");
    if (re.test(normalized)) {
      out.push({
        category: "gambling",
        reason: `matched keyword: ${term.t}`,
        weight: term.w,
        match: term.t,
      });
    }
  }
  return out;
}

/** Count distinct URL-like tokens. */
function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9-]+\.(com|net|org|id|xyz|top|click|link|tk|ml|ga|cf|live|buzz|io|co|me|info|biz)/gi);
  return matches ?? [];
}

/** Check whether the message context neutralizes flagged terms (educational/warning). */
function isNeutralizingContext(normalized: string): { neutralized: boolean; cue?: string } {
  for (const cue of NEGATION_CUES) {
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(cue)}([^a-z0-9]|$)`, "i");
    if (re.test(normalized)) {
      return { neutralized: true, cue };
    }
  }
  return { neutralized: false };
}

// ---------- per-category detectors ----------

function detectGambling(normalized: string): Signal[] {
  const sigs = matchTerms(normalized, GAMBLING_TERMS);
  return sigs;
}

function detectScam(normalized: string): Signal[] {
  const sigs: Signal[] = [];
  for (const p of SCAM_PATTERNS) {
    if (p.re.test(normalized)) {
      sigs.push({ category: "scam", reason: p.label, weight: p.w, match: p.label });
    }
  }
  return sigs;
}

function detectPhishing(normalized: string): Signal[] {
  const sigs: Signal[] = [];
  const urls = extractUrls(normalized);
  if (urls.length > 0) {
    // shortener
    for (const url of urls) {
      const low = url.toLowerCase();
      if (URL_SHORTENERS.some((s) => low.includes(s))) {
        sigs.push({ category: "phishing", reason: "shortened URL", weight: 0.45, match: url });
      }
      if (SUSPICIOUS_TLDS.some((tld) => low.endsWith(tld) || low.includes(tld + "/"))) {
        sigs.push({ category: "phishing", reason: "suspicious TLD", weight: 0.4, match: url });
      }
    }
  }
  for (const p of PHISHING_PATTERNS) {
    if (p.re.test(normalized)) {
      sigs.push({ category: "phishing", reason: p.label, weight: p.w, match: p.label });
    }
  }
  return sigs;
}

function detectSpam(normalized: string): Signal[] {
  const sigs: Signal[] = [];
  for (const p of SPAM_PATTERNS) {
    if (p.re.test(normalized)) {
      sigs.push({ category: "spam", reason: p.label, weight: p.w, match: p.label });
    }
  }
  return sigs;
}

function detectToxic(normalized: string): Signal[] {
  const sigs: Signal[] = [];
  for (const term of TOXIC_INSULT) {
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(term.t)}([^a-z0-9]|$)`, "i");
    if (re.test(normalized)) {
      sigs.push({ category: "toxic", reason: `insult: ${term.t}`, weight: term.w, match: term.t });
    }
  }
  for (const p of [...TOXIC_HARASSMENT, ...TOXIC_HATE]) {
    if (p.re.test(normalized)) {
      sigs.push({ category: "toxic", reason: p.label, weight: p.w, match: p.label });
    }
  }
  return sigs;
}

// ---------- risk scoring ----------

/**
 * Convert a list of signals into a 0..100 risk score.
 * Uses a saturating probabilistic combination so multiple weak signals
 * compound, but a single weak signal stays low.
 */
function scoreFromSignals(signals: Signal[]): number {
  if (signals.length === 0) return 0;
  // combined probability of "at least one true threat": 1 - product(1 - w)
  let probFalse = 1;
  for (const s of signals) probFalse *= 1 - s.weight;
  const combined = 1 - probFalse;
  // mild boost for signal diversity (multiple distinct categories)
  const distinctCats = new Set(signals.map((s) => s.category)).size;
  const diversityBoost = 1 + 0.06 * (distinctCats - 1);
  const raw = combined * diversityBoost;
  return Math.min(100, Math.round(raw * 100));
}

// ---------- action mapping ----------

/**
 * Map a (riskScore, category, protectionMode) to a moderation action,
 * per the PRD's three protection modes.
 */
export function actionFor(
  riskScore: number,
  topCategory: DetectionCategory,
  mode: ProtectionMode,
  sensitivity: number
): ModerationAction {
  if (riskScore < sensitivity) {
    // below threshold — still warn a little in aggressive mode
    if (mode === "aggressive" && riskScore >= sensitivity * 0.5) return "warning";
    return "none";
  }

  const high = riskScore >= 80;

  switch (mode) {
    case "safe":
      // warning only
      return "warning";
    case "balanced":
      // delete + warning; ban on repeated/severe handled by caller using history
      return high ? "mute" : "delete";
    case "aggressive":
      // delete + mute + ban
      if (topCategory === "toxic" && high) return "mute";
      return high ? "ban" : "mute";
    default:
      return "warning";
  }
}

// ---------- main entry ----------

export function detect(
  raw: string,
  config: Partial<DetectionConfig> = {}
): DetectionResult {
  const cfg: DetectionConfig = {
    sensitivity: config.sensitivity ?? 60,
    enabled: {
      gambling: true,
      scam: true,
      phishing: true,
      spam: true,
      toxic: true,
      ...config.enabled,
    },
    ai: config.ai ?? false,
    customRuleset: config.customRuleset,
  };

  const { normalized, cleaned, lower } = normalizeText(raw);

  let signals: Signal[] = [];
  // keyword-based detectors use the aggressive normalized form
  if (cfg.enabled.gambling) signals.push(...detectGambling(normalized));
  // structural/regex detectors use the cleaned form (URLs, mentions, punctuation preserved)
  if (cfg.enabled.scam) signals.push(...detectScam(cleaned));
  if (cfg.enabled.phishing) signals.push(...detectPhishing(cleaned));
  if (cfg.enabled.spam) signals.push(...detectSpam(cleaned));
  if (cfg.enabled.toxic) signals.push(...detectToxic(normalized));

  // --- Phase 2: AI classifier fusion ---
  // Adds a learned (Naive Bayes) signal that can catch paraphrases the rule
  // dictionary misses. Only adds threat signals (safe predictions contribute
  // nothing, naturally keeping clean messages low-risk).
  if (cfg.ai) {
    const clf = aiClassify(raw);
    if (clf.category !== "safe") {
      signals.push({
        category: clf.category,
        reason: `AI classifier: ${clf.category} (${Math.round(clf.confidence * 100)}%)`,
        weight: Math.min(0.85, clf.confidence * 0.7),
        match: `ai:${clf.category}`,
      });
    }
  }

  // --- Phase 3: custom rules (per-community) ---
  // ban terms add signals; allow terms suppress matching signals; AI personality
  // instructions boost strictness for the categories they mention.
  if (cfg.customRuleset) {
    const { ban, allow, instructions } = cfg.customRuleset;

    // add custom ban signals
    for (const b of ban) {
      const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(b.term)}([^a-z0-9]|$)`, "i");
      if (re.test(normalized)) {
        const validCats = ["gambling", "scam", "phishing", "spam", "toxic"];
        const cat = (validCats.includes(b.category) ? b.category : "gambling") as Exclude<
          DetectionCategory,
          "safe"
        >;
        signals.push({
          category: cat,
          reason: `custom banned word: ${b.term}`,
          weight: b.weight,
          match: b.term,
        });
      }
    }

    // allow terms suppress any signal whose match equals an allowed term
    if (allow.length) {
      const allowSet = new Set(allow);
      signals = signals.filter((s) => !allowSet.has(s.match ?? ""));
    }

    // AI personality: instructions mentioning a category make it stricter
    if (instructions.length) {
      const instr = instructions.join(" ").toLowerCase();
      const strictCats: DetectionCategory[] = [];
      for (const c of ["gambling", "scam", "phishing", "spam", "toxic"] as DetectionCategory[]) {
        if (instr.includes(c)) strictCats.push(c);
      }
      if (strictCats.length) {
        signals = signals.map((s) =>
          strictCats.includes(s.category) ? { ...s, weight: Math.min(1, s.weight * 1.3) } : s
        );
      }
    }
  }

  // --- Context adjustment ---
  // If the message is clearly a warning *about* threats ("jangan klik link judi"),
  // dampen the gambling/scam/phishing signals but keep toxic fully (insults are
  // still insults even in a warning).
  const ctx = isNeutralizingContext(normalized);
  if (ctx.neutralized && signals.some((s) => s.category !== "toxic")) {
    signals = signals.map((s) =>
      s.category === "toxic" ? s : { ...s, weight: s.weight * 0.25 }
    );
  }

  // Dedupe near-identical signals (same category+match) keeping the heaviest.
  const seen = new Map<string, Signal>();
  for (const s of signals) {
    const key = `${s.category}:${s.match ?? s.reason}`;
    const prev = seen.get(key);
    if (!prev || s.weight > prev.weight) seen.set(key, s);
  }
  signals = Array.from(seen.values()).sort((a, b) => b.weight - a.weight);

  const riskScore = scoreFromSignals(signals);

  // Determine categories present
  const catSet = new Set<DetectionCategory>(signals.map((s) => s.category));
  const categories: DetectionCategory[] = Array.from(catSet);
  if (categories.length === 0) categories.push("safe");

  const topCategory: DetectionCategory = categories[0] ?? "safe";
  const isSafe = riskScore < cfg.sensitivity;

  return {
    raw,
    normalized,
    riskScore,
    categories,
    signals,
    isSafe,
    recommendedAction: (mode: ProtectionMode) =>
      actionFor(riskScore, topCategory, mode, cfg.sensitivity),
  };
}

/** Convenience: get the recommended action directly. */
export function detectAndAct(
  raw: string,
  mode: ProtectionMode,
  config: Partial<DetectionConfig> = {}
): { result: DetectionResult; action: ModerationAction } {
  const result = detect(raw, config);
  return { result, action: result.recommendedAction(mode) };
}

export { normalizeText } from "./normalize";
export * from "./types";
