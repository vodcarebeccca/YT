/**
 * SQLite database client (Node built-in `node:sqlite`).
 *
 * Dev uses a local file ./data/guardai.db. No external service or binary
 * download required. To move to PostgreSQL in production, swap this module's
 * implementation — the repository functions above it stay the same.
 */
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DB_PATH =
  process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")
    ? resolve(process.cwd(), process.env.DATABASE_URL.slice("file:".length))
    : resolve(process.cwd(), "data/guardai.db");

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  mkdirSync(dirname(DB_PATH), { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  _db = db;
  return db;
}

/** Reset the cached connection (useful for tests / hot reload in dev). */
export function resetDb(): void {
  _db = null;
}

export const DB_FILE = DB_PATH;
