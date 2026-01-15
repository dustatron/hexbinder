import { nanoid } from "nanoid";
import type { WorldData, WorldSummary } from "~/models";

const WORLD_PREFIX = "world:";

/** Check if we're in browser environment */
const isBrowser = typeof window !== "undefined";

export function saveWorld(world: WorldData): void {
  if (!isBrowser) return;
  world.updatedAt = Date.now();
  localStorage.setItem(`${WORLD_PREFIX}${world.id}`, JSON.stringify(world));
}

export function loadWorld(id: string): WorldData | null {
  if (!isBrowser) return null;
  const data = localStorage.getItem(`${WORLD_PREFIX}${id}`);
  return data ? JSON.parse(data) : null;
}

export function listWorlds(): WorldSummary[] {
  if (!isBrowser) return [];
  const worlds: WorldSummary[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(WORLD_PREFIX)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const world = JSON.parse(data) as WorldData;
          const hexCount = world.hexes?.length ?? 0;
          const mapSize = hexCount < 60 ? "small" : hexCount < 150 ? "medium" : "large";
          worlds.push({
            id: world.id,
            name: world.name,
            updatedAt: world.updatedAt,
            mapSize,
            settlementCount: world.locations?.filter(l => l.type === "settlement").length ?? 0,
            dungeonCount: world.locations?.filter(l => l.type === "dungeon").length ?? 0,
            factionCount: world.factions?.length ?? 0,
            day: world.state?.day ?? 1,
          });
        }
      } catch {
        // Skip invalid entries
      }
    }
  }

  return worlds.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteWorld(id: string): void {
  if (!isBrowser) return;
  localStorage.removeItem(`${WORLD_PREFIX}${id}`);
}

export function exportWorld(world: WorldData): void {
  const blob = new Blob([JSON.stringify(world, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${world.name.toLowerCase().replace(/\s+/g, "-")}.hexbinder.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importWorld(file: File): Promise<WorldData> {
  const text = await file.text();
  const world = JSON.parse(text) as WorldData;
  // Generate new ID to avoid conflicts
  world.id = nanoid();
  world.updatedAt = Date.now();
  saveWorld(world);
  return world;
}
