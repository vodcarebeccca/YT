import { getDb } from "./client";
import { newId } from "./ids";
import type { DetectionCategory, ModerationAction } from "@/lib/detection/types";

// ---------------- Message logs ----------------

export interface MessageLog {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string | null;
  text: string;
  riskScore: number;
  categories: string;
  normalized: string;
  blocked: boolean;
  createdAt: string;
}

function msgRow(r: any): MessageLog | null {
  if (!r) return null;
  return {
    id: r.id,
    communityId: r.community_id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    text: r.text,
    riskScore: r.risk_score,
    categories: r.categories,
    normalized: r.normalized,
    blocked: !!r.blocked,
    createdAt: r.created_at,
  };
}

export function logMessage(input: {
  communityId: string;
  senderId: string;
  senderName?: string | null;
  text: string;
  riskScore: number;
  categories: string;
  normalized: string;
  blocked: boolean;
}): MessageLog {
  const id = newId("msg");
  getDb()
    .prepare(
      `INSERT INTO message_logs (id, community_id, sender_id, sender_name, text, risk_score, categories, normalized, blocked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.communityId,
      String(input.senderId),
      input.senderName ?? null,
      input.text,
      input.riskScore,
      input.categories,
      input.normalized,
      input.blocked ? 1 : 0
    );
  return msgRow(getDb().prepare("SELECT * FROM message_logs WHERE id = ?").get(id))!;
}

export interface MessageQuery {
  communityId?: string;
  search?: string;
  category?: DetectionCategory;
  minRisk?: number;
  blockedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export function listMessageLogs(q: MessageQuery = {}): { rows: MessageLog[]; total: number } {
  const where: string[] = [];
  const args: any[] = [];
  if (q.communityId) {
    where.push("community_id = ?");
    args.push(q.communityId);
  }
  if (q.search) {
    where.push("(text LIKE ? OR sender_name LIKE ?)");
    args.push(`%${q.search}%`, `%${q.search}%`);
  }
  if (q.minRisk !== undefined) {
    where.push("risk_score >= ?");
    args.push(q.minRisk);
  }
  if (q.blockedOnly) {
    where.push("blocked = 1");
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = q.limit ?? 50;
  const offset = q.offset ?? 0;

  const rows = getDb()
    .prepare(`SELECT * FROM message_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...args, limit, offset) as any[];
  const totalRow = getDb()
    .prepare(`SELECT COUNT(*) as c FROM message_logs ${whereSql}`)
    .get(...args) as { c: number };
  return { rows: rows.map(msgRow).filter(Boolean) as MessageLog[], total: totalRow.c };
}

// ---------------- Moderation logs ----------------

export interface ModerationLog {
  id: string;
  communityId: string;
  actorId: string | null;
  messageId: string | null;
  senderId: string;
  senderName: string | null;
  messageText: string;
  category: DetectionCategory;
  riskScore: number;
  action: ModerationAction;
  reason: string;
  createdAt: string;
}

function modRow(r: any): ModerationLog | null {
  if (!r) return null;
  return {
    id: r.id,
    communityId: r.community_id,
    actorId: r.actor_id,
    messageId: r.message_id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    messageText: r.message_text,
    category: r.category,
    riskScore: r.risk_score,
    action: r.action,
    reason: r.reason,
    createdAt: r.created_at,
  };
}

export function logModeration(input: {
  communityId: string;
  actorId?: string | null;
  messageId?: string | null;
  senderId: string;
  senderName?: string | null;
  messageText: string;
  category: DetectionCategory;
  riskScore: number;
  action: ModerationAction;
  reason?: string;
}): ModerationLog {
  const id = newId("mod");
  getDb()
    .prepare(
      `INSERT INTO moderation_logs (id, community_id, actor_id, message_id, sender_id, sender_name, message_text, category, risk_score, action, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.communityId,
      input.actorId ?? null,
      input.messageId ?? null,
      String(input.senderId),
      input.senderName ?? null,
      input.messageText,
      input.category,
      input.riskScore,
      input.action,
      input.reason ?? ""
    );
  return modRow(getDb().prepare("SELECT * FROM moderation_logs WHERE id = ?").get(id))!;
}

export interface ModerationQuery {
  communityId?: string;
  search?: string;
  category?: DetectionCategory;
  action?: ModerationAction;
  limit?: number;
  offset?: number;
}

export function listModerationLogs(q: ModerationQuery = {}): { rows: ModerationLog[]; total: number } {
  const where: string[] = [];
  const args: any[] = [];
  if (q.communityId) {
    where.push("community_id = ?");
    args.push(q.communityId);
  }
  if (q.search) {
    where.push("(message_text LIKE ? OR sender_name LIKE ? OR reason LIKE ?)");
    args.push(`%${q.search}%`, `%${q.search}%`, `%${q.search}%`);
  }
  if (q.category) {
    where.push("category = ?");
    args.push(q.category);
  }
  if (q.action) {
    where.push("action = ?");
    args.push(q.action);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = q.limit ?? 50;
  const offset = q.offset ?? 0;

  const rows = getDb()
    .prepare(`SELECT * FROM moderation_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...args, limit, offset) as any[];
  const totalRow = getDb()
    .prepare(`SELECT COUNT(*) as c FROM moderation_logs ${whereSql}`)
    .get(...args) as { c: number };
  return { rows: rows.map(modRow).filter(Boolean) as ModerationLog[], total: totalRow.c };
}

// ---------------- Dashboard stats ----------------

export interface OverviewStats {
  messagesScanned: number;
  threatsBlocked: number;
  usersBanned: number;
  spamPrevented: number;
  muted: number;
  deleted: number;
  communityHealth: number;
}

export function getOverviewStats(communityId?: string): OverviewStats {
  const scope = communityId ? "WHERE community_id = ?" : "";
  const args = communityId ? [communityId] : [];
  const scannedRow = getDb()
    .prepare(`SELECT COUNT(*) as c FROM message_logs ${scope}`)
    .get(...args) as { c: number };
  const blockedRow = getDb()
    .prepare(`SELECT COUNT(*) as c FROM message_logs ${scope.replace("community_id", "community_id")} AND blocked = 1`)
    .get(...(communityId ? [communityId] : [])) as { c: number };

  // action-based counts from moderation logs
  const actScope = communityId ? "WHERE community_id = ?" : "";
  const actArgs = communityId ? [communityId] : [];
  const actionCounts = getDb()
    .prepare(
      `SELECT action, COUNT(*) as c FROM moderation_logs ${actScope} GROUP BY action`
    )
    .all(...actArgs) as { action: string; c: number }[];

  const counts: Record<string, number> = {};
  for (const r of actionCounts) counts[r.action] = r.c;

  const scanned = scannedRow.c;
  const threatsBlocked = (counts["delete"] ?? 0) + (counts["mute"] ?? 0) + (counts["ban"] ?? 0);
  const health = scanned === 0 ? 100 : Math.max(0, Math.round(100 - (threatsBlocked / scanned) * 100));

  return {
    messagesScanned: scanned,
    threatsBlocked,
    usersBanned: counts["ban"] ?? 0,
    spamPrevented: counts["delete"] ?? 0,
    muted: counts["mute"] ?? 0,
    deleted: counts["delete"] ?? 0,
    communityHealth: health,
  };
}

/** Daily threat counts for the last N days (for charts). */
export function getDailyThreatSeries(communityId: string | undefined, days = 14) {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const scope = communityId ? "AND community_id = ?" : "";
  const args = communityId ? [communityId] : [];
  const rows = getDb()
    .prepare(
      `SELECT date(created_at) as d, COUNT(*) as threats
       FROM moderation_logs
       WHERE action IN ('delete','mute','ban') AND date(created_at) >= ? ${scope}
       GROUP BY d ORDER BY d ASC`
    )
    .all(since, ...args) as { d: string; threats: number }[];

  const scannedRows = getDb()
    .prepare(
      `SELECT date(created_at) as d, COUNT(*) as scanned
       FROM message_logs
       WHERE date(created_at) >= ? ${scope}
       GROUP BY d ORDER BY d ASC`
    )
    .all(since, ...args) as { d: string; scanned: number }[];

  const byDay = new Map<string, { date: string; threats: number; scanned: number }>();
  for (const r of scannedRows)
    byDay.set(r.d, { date: r.d, threats: 0, scanned: r.scanned });
  for (const r of rows) {
    const e = byDay.get(r.d) ?? { date: r.d, threats: 0, scanned: 0 };
    e.threats = r.threats;
    byDay.set(r.d, e);
  }
  return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/** Top attack categories (for charts). */
export function getCategoryBreakdown(communityId?: string) {
  const scope = communityId ? "WHERE community_id = ?" : "";
  const args = communityId ? [communityId] : [];
  const rows = getDb()
    .prepare(
      `SELECT category, COUNT(*) as c FROM moderation_logs ${scope} GROUP BY category ORDER BY c DESC`
    )
    .all(...args) as { category: string; c: number }[];
  return rows.map((r) => ({ category: r.category, count: r.c }));
}

/** Distribution of actions taken (for charts). */
export function getActionDistribution(communityId?: string) {
  const scope = communityId ? "WHERE community_id = ?" : "";
  const args = communityId ? [communityId] : [];
  const rows = getDb()
    .prepare(
      `SELECT action, COUNT(*) as c FROM moderation_logs ${scope} GROUP BY action ORDER BY c DESC`
    )
    .all(...args) as { action: string; c: number }[];
  return rows.map((r) => ({ action: r.action, count: r.c }));
}

/** Top repeat offenders by action count (for analytics). */
export function getTopOffenders(communityId?: string, limit = 8) {
  const scope = communityId ? "WHERE community_id = ?" : "";
  const args = communityId ? [communityId] : [];
  const rows = getDb()
    .prepare(
      `SELECT sender_id, sender_name, COUNT(*) as actions, MAX(risk_score) as max_risk
       FROM moderation_logs ${scope}
       GROUP BY sender_id
       ORDER BY actions DESC, max_risk DESC
       LIMIT ?`
    )
    .all(...args, limit) as {
      sender_id: string;
      sender_name: string | null;
      actions: number;
      max_risk: number;
    }[];
  return rows.map((r) => ({
    senderId: r.sender_id,
    senderName: r.sender_name,
    actions: r.actions,
    maxRisk: r.max_risk,
  }));
}

/** Hour-of-day activity distribution (when threats happen). */
export function getHourlyDistribution(communityId?: string) {
  const scope = communityId ? "WHERE community_id = ?" : "";
  const args = communityId ? [communityId] : [];
  const rows = getDb()
    .prepare(
      `SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as c
       FROM moderation_logs ${scope}
       GROUP BY hour ORDER BY hour ASC`
    )
    .all(...args) as { hour: number; c: number }[];
  // fill all 24 hours
  const byHour = new Map<number, number>(rows.map((r) => [r.hour, r.c]));
  return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: byHour.get(h) ?? 0 }));
}
