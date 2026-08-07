import { getDb } from "./client";
import { newId } from "./ids";

export interface RulePack {
  id: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  description: string | null;
  language: string;
  focus: string;
  content: string; // JSON
  installs: number;
  createdAt: string;
}

export interface PackContent {
  ban: { term: string; category?: string; weight?: number }[];
  allow: string[];
  instructions?: string[];
  sensitivity?: number;
  mode?: string;
}

function row(r: any): RulePack | null {
  if (!r) return null;
  return {
    id: r.id,
    ownerId: r.owner_id,
    ownerName: r.owner_name ?? undefined,
    name: r.name,
    description: r.description,
    language: r.language,
    focus: r.focus,
    content: r.content,
    installs: r.installs,
    createdAt: r.created_at,
  };
}

export function listPacks(filter?: { focus?: string; language?: string }): RulePack[] {
  const where: string[] = [];
  const args: any[] = [];
  if (filter?.focus && filter.focus !== "all") {
    where.push("focus = ?");
    args.push(filter.focus);
  }
  if (filter?.language && filter.language !== "all") {
    where.push("language = ?");
    args.push(filter.language);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = getDb()
    .prepare(
      `SELECT p.*, u.name as owner_name FROM rule_packs p
       LEFT JOIN users u ON u.id = p.owner_id
       ${whereSql} ORDER BY p.installs DESC, p.created_at DESC`
    )
    .all(...args) as any[];
  return rows.map(row).filter(Boolean) as RulePack[];
}

export function getPack(id: string): RulePack | null {
  return row(
    getDb()
      .prepare(
        `SELECT p.*, u.name as owner_name FROM rule_packs p
         LEFT JOIN users u ON u.id = p.owner_id WHERE p.id = ?`
      )
      .get(id)
  );
}

export function createPack(input: {
  ownerId: string;
  name: string;
  description?: string;
  language?: string;
  focus?: string;
  content: PackContent;
}): RulePack {
  const id = newId("pack");
  getDb()
    .prepare(
      "INSERT INTO rule_packs (id, owner_id, name, description, language, focus, content) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      input.ownerId,
      input.name,
      input.description ?? null,
      input.language ?? "id",
      input.focus ?? "general",
      JSON.stringify(input.content)
    );
  return getPack(id)!;
}

export function incrementInstalls(id: string): void {
  getDb().prepare("UPDATE rule_packs SET installs = installs + 1 WHERE id = ?").run(id);
}

export function deletePack(id: string, ownerId: string): boolean {
  const r = getDb()
    .prepare("DELETE FROM rule_packs WHERE id = ? AND owner_id = ?")
    .run(id, ownerId);
  return r.changes > 0;
}

export function parseContent(pack: RulePack): PackContent {
  try {
    return JSON.parse(pack.content) as PackContent;
  } catch {
    return { ban: [], allow: [] };
  }
}
