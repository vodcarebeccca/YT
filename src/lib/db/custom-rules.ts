import { getDb } from "./client";
import { newId } from "./ids";
import type { DetectionCategory, CustomRuleset } from "@/lib/detection/types";

export type CustomRuleType = "ban" | "allow" | "ai_instruction";

export interface CustomRule {
  id: string;
  communityId: string;
  ruleType: CustomRuleType;
  term: string;
  category: string;
  weight: number;
  createdAt: string;
}

function row(r: any): CustomRule | null {
  if (!r) return null;
  return {
    id: r.id,
    communityId: r.community_id,
    ruleType: r.rule_type,
    term: r.term,
    category: r.category,
    weight: r.weight,
    createdAt: r.created_at,
  };
}

export function listCustomRules(communityId: string): CustomRule[] {
  const rows = getDb()
    .prepare("SELECT * FROM custom_rules WHERE community_id = ? ORDER BY rule_type, created_at DESC")
    .all(communityId) as any[];
  return rows.map(row).filter(Boolean) as CustomRule[];
}

export function addCustomRule(input: {
  communityId: string;
  ruleType: CustomRuleType;
  term: string;
  category?: string;
  weight?: number;
}): CustomRule | null {
  const id = newId("rule");
  try {
    getDb()
      .prepare(
        "INSERT INTO custom_rules (id, community_id, rule_type, term, category, weight) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        id,
        input.communityId,
        input.ruleType,
        input.term.trim().toLowerCase(),
        input.category ?? "custom",
        input.weight ?? 0.6
      );
  } catch {
    return null; // unique constraint / invalid
  }
  return row(getDb().prepare("SELECT * FROM custom_rules WHERE id = ?").get(id));
}

export function deleteCustomRule(id: string): void {
  getDb().prepare("DELETE FROM custom_rules WHERE id = ?").run(id);
}

export function deleteCustomRulesByCommunity(communityId: string): void {
  getDb().prepare("DELETE FROM custom_rules WHERE community_id = ?").run(communityId);
}

/** Bulk-replace a community's custom rules (used by marketplace install). */
export function setCustomRules(
  communityId: string,
  rules: { ruleType: CustomRuleType; term: string; category?: string; weight?: number }[]
): void {
  const db = getDb();
  const tx = db.exec.bind(db);
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM custom_rules WHERE community_id = ?").run(communityId);
    const stmt = db.prepare(
      "INSERT OR IGNORE INTO custom_rules (id, community_id, rule_type, term, category, weight) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const r of rules) {
      stmt.run(
        newId("rule"),
        communityId,
        r.ruleType,
        r.term.trim().toLowerCase(),
        r.category ?? "custom",
        r.weight ?? 0.6
      );
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

/** A compact view of custom rules for the detection pipeline. */
export function getCustomRuleset(communityId: string): CustomRuleset {
  const rules = listCustomRules(communityId);
  return {
    ban: rules
      .filter((r) => r.ruleType === "ban")
      .map((r) => ({ term: r.term, category: r.category as DetectionCategory, weight: r.weight })),
    allow: rules.filter((r) => r.ruleType === "allow").map((r) => r.term),
    instructions: rules.filter((r) => r.ruleType === "ai_instruction").map((r) => r.term),
  };
}
