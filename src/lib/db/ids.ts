import { randomUUID } from "node:crypto";

/** Generate a unique id (UUID v4). */
export function newId(prefix?: string): string {
  const id = randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}

/** Generate an opaque API key. */
export function newApiKey(): string {
  return `ga_${randomUUID().replace(/-/g, "")}`;
}
