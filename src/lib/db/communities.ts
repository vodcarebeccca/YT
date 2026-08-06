import { getDb } from "./client";
import { newId, newApiKey } from "./ids";
import type { Platform, ProtectionMode } from "@/lib/detection/types";

export interface Community {
  id: string;
  name: string;
  platform: Platform;
  platformRef: string;
  ownerId: string;
  protectionMode: ProtectionMode;
  sensitivity: number;
  enabled: boolean;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

function row(r: any): Community | null {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    platform: r.platform,
    platformRef: r.platform_ref,
    ownerId: r.owner_id,
    protectionMode: r.protection_mode,
    sensitivity: r.sensitivity,
    enabled: !!r.enabled,
    apiKey: r.api_key,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function getCommunityById(id: string): Community | null {
  return row(getDb().prepare("SELECT * FROM communities WHERE id = ?").get(id));
}

export function getCommunityByPlatformRef(
  platform: Platform,
  platformRef: string
): Community | null {
  return row(
    getDb()
      .prepare("SELECT * FROM communities WHERE platform = ? AND platform_ref = ?")
      .get(platform, String(platformRef))
  );
}

export function getCommunityByApiKey(apiKey: string): Community | null {
  return row(getDb().prepare("SELECT * FROM communities WHERE api_key = ?").get(apiKey));
}

export function listCommunitiesByOwner(ownerId: string): Community[] {
  const rows = getDb()
    .prepare("SELECT * FROM communities WHERE owner_id = ? ORDER BY created_at DESC")
    .all(ownerId) as any[];
  return rows.map(row).filter(Boolean) as Community[];
}

export function listAllCommunities(): Community[] {
  const rows = getDb()
    .prepare("SELECT * FROM communities ORDER BY created_at DESC")
    .all() as any[];
  return rows.map(row).filter(Boolean) as Community[];
}

export function createCommunity(input: {
  name: string;
  platform?: Platform;
  platformRef: string;
  ownerId: string;
  protectionMode?: ProtectionMode;
  sensitivity?: number;
  enabled?: boolean;
}): Community {
  const id = newId("com");
  getDb()
    .prepare(
      `INSERT INTO communities (id, name, platform, platform_ref, owner_id, protection_mode, sensitivity, enabled, api_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.name,
      input.platform ?? "telegram",
      String(input.platformRef),
      input.ownerId,
      input.protectionMode ?? "balanced",
      input.sensitivity ?? 60,
      input.enabled === false ? 0 : 1,
      newApiKey()
    );
  return getCommunityById(id)!;
}

export function updateCommunity(
  id: string,
  patch: Partial<Pick<Community, "name" | "protectionMode" | "sensitivity" | "enabled">>
): void {
  const sets: string[] = [];
  const args: any[] = [];
  if (patch.name !== undefined) {
    sets.push("name = ?");
    args.push(patch.name);
  }
  if (patch.protectionMode !== undefined) {
    sets.push("protection_mode = ?");
    args.push(patch.protectionMode);
  }
  if (patch.sensitivity !== undefined) {
    sets.push("sensitivity = ?");
    args.push(patch.sensitivity);
  }
  if (patch.enabled !== undefined) {
    sets.push("enabled = ?");
    args.push(patch.enabled ? 1 : 0);
  }
  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  args.push(id);
  getDb().prepare(`UPDATE communities SET ${sets.join(", ")} WHERE id = ?`).run(...args);
}

export function deleteCommunity(id: string): void {
  getDb().prepare("DELETE FROM communities WHERE id = ?").run(id);
}
