/**
 * Database schema — idempotent migrations run on app startup.
 *
 * SQLite stores booleans as 0/1 INTEGER, enums as TEXT, timestamps as
 * ISO-8601 TEXT, ids as TEXT (cuid-style via app layer).
 */

const SCHEMA_SQL = /* sql */ `
-- ---------------- Auth ----------------
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  email         TEXT UNIQUE,
  email_verified TEXT,
  image         TEXT,
  password_hash TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounts (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               TEXT NOT NULL,
  provider           TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token      TEXT,
  access_token       TEXT,
  expires_at         INTEGER,
  token_type         TEXT,
  scope              TEXT,
  id_token           TEXT,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ---------------- Domain ----------------
CREATE TABLE IF NOT EXISTS communities (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  platform        TEXT NOT NULL DEFAULT 'telegram',
  platform_ref    TEXT NOT NULL,
  owner_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  protection_mode TEXT NOT NULL DEFAULT 'balanced',
  sensitivity     INTEGER NOT NULL DEFAULT 60,
  enabled         INTEGER NOT NULL DEFAULT 1,
  api_key         TEXT NOT NULL UNIQUE,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (platform, platform_ref)
);

CREATE TABLE IF NOT EXISTS message_logs (
  id            TEXT PRIMARY KEY,
  community_id  TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  sender_id     TEXT NOT NULL,
  sender_name   TEXT,
  text          TEXT NOT NULL,
  risk_score    INTEGER NOT NULL DEFAULT 0,
  categories    TEXT NOT NULL DEFAULT '',
  normalized    TEXT NOT NULL DEFAULT '',
  blocked       INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_msg_community_time ON message_logs(community_id, created_at);
CREATE INDEX IF NOT EXISTS idx_msg_risk ON message_logs(risk_score);

CREATE TABLE IF NOT EXISTS moderation_logs (
  id            TEXT PRIMARY KEY,
  community_id  TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  actor_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  message_id    TEXT,
  sender_id     TEXT NOT NULL,
  sender_name   TEXT,
  message_text  TEXT NOT NULL,
  category      TEXT NOT NULL,
  risk_score    INTEGER NOT NULL,
  action        TEXT NOT NULL,
  reason        TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mod_community_time ON moderation_logs(community_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mod_category ON moderation_logs(category);

CREATE TABLE IF NOT EXISTS daily_stats (
  id           TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  date         TEXT NOT NULL,
  scanned      INTEGER NOT NULL DEFAULT 0,
  threats      INTEGER NOT NULL DEFAULT 0,
  deleted      INTEGER NOT NULL DEFAULT 0,
  muted        INTEGER NOT NULL DEFAULT 0,
  banned       INTEGER NOT NULL DEFAULT 0,
  UNIQUE (community_id, date)
);
`;

let _migrated = false;

/** Run migrations idempotently against the given (or default) db. */
export function migrate(): void {
  if (_migrated) return;
  const { getDb } = require("./client");
  const db = getDb();
  db.exec(SCHEMA_SQL);
  _migrated = true;
}

/** Force re-run of migrations (tests). */
export function runMigrations(): void {
  _migrated = false;
  migrate();
}
