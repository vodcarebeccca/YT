import { getDb } from "./client";
import { newId } from "./ids";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: string | null;
  image: string | null;
  passwordHash: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

function row(r: any): User | null {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    emailVerified: r.email_verified,
    image: r.image,
    passwordHash: r.password_hash,
    role: r.role,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function getUserById(id: string): User | null {
  return row(getDb().prepare("SELECT * FROM users WHERE id = ?").get(id));
}

export function getUserByEmail(email: string): User | null {
  return row(
    getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase())
  );
}

export function createUser(input: {
  name?: string;
  email: string;
  passwordHash: string;
  role?: string;
}): User {
  const id = newId("usr");
  getDb()
    .prepare(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
    )
    .run(id, input.name ?? null, input.email.toLowerCase(), input.passwordHash, input.role ?? "user");
  return getUserById(id)!;
}

export function countUsers(): number {
  const r = getDb().prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  return r.c;
}
