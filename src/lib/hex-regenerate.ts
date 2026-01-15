import type { WorldData, HexCoord, DungeonTheme, SettlementSize, Dungeon, Settlement, SpatialSettlement, TerrainType } from "~/models";
import { isDungeon, isSettlement } from "~/models";
import { placeDungeon, placeWildernessLair } from "~/generators/DungeonGenerator";
import { placeSettlement } from "~/generators/SettlementGenerator";
import { generateSites } from "~/generators/SiteGenerator";
import { generateSettlementNPCs } from "~/generators/NPCGenerator";
import { generateRumors, generateNotices } from "~/generators/RumorGenerator";
import { assignNPCsToBuildings, linkSitesToBuildings } from "~/generators/TownLayoutEngine";
import { SeededRandom } from "~/generators/SeededRandom";
import { nanoid } from "nanoid";

// Dungeon themes (standard)
const DUNGEON_THEMES = ["tomb", "cave", "temple", "mine", "fortress", "sewer", "crypt", "lair", "shrine"] as const;

// Wilderness lair themes
const WILDERNESS_THEMES = ["bandit_hideout", "cultist_lair", "witch_hut", "sea_cave", "beast_den", "floating_keep"] as const;

// Settlement sizes
const SETTLEMENT_SIZES = ["thorpe", "hamlet", "village", "town", "city"] as const;

export type RegenerationType =
  | "random"
  | "clear"
  // Terrain types (keep as wilderness)
  | "plains"
  | "forest"
  | "hills"
  | "mountains"
  | "water"
  | "swamp"
  // Dungeon themes
  | "tomb"
  | "cave"
  | "temple"
  | "mine"
  | "fortress"
  | "sewer"
  | "crypt"
  | "lair"
  | "shrine"
  // Wilderness lair themes
  | "bandit_hideout"
  | "cultist_lair"
  | "witch_hut"
  | "sea_cave"
  | "beast_den"
  | "floating_keep"
  // Settlement sizes
  | "thorpe"
  | "hamlet"
  | "village"
  | "town"
  | "city";

/**
 * Remove any location at this hex, cleaning up world data.
 * Also removes NPCs that belonged to that location.
 */
export function clearHexLocation(world: WorldData, coord: HexCoord): WorldData {
  const hex = world.hexes.find(h => h.coord.q === coord.q && h.coord.r === coord.r);
  if (!hex || !hex.locationId) return world;

  const locationId = hex.locationId;

  // Find the location to get its NPCs
  const location = world.locations.find(loc => loc.id === locationId);
  const npcIdsToRemove = new Set<string>();

  if (location && location.type === "settlement") {
    const settlement = location as Settlement;
    // Collect all NPC IDs from this settlement
    for (const npcId of settlement.npcIds) {
      npcIdsToRemove.add(npcId);
    }
  }

  // Remove location from locations array
  const locations = world.locations.filter(loc => loc.id !== locationId);

  // Remove NPCs that belonged to this location
  const npcs = world.npcs.filter(npc => !npcIdsToRemove.has(npc.id));

  // Clear hex locationId
  const hexes = world.hexes.map(h => {
    if (h.coord.q === coord.q && h.coord.r === coord.r) {
      const { locationId: _, ...rest } = h;
      return rest;
    }
    return h;
  });

  return {
    ...world,
    hexes,
    locations,
    npcs,
  };
}

/**
 * Regenerate hex content based on type.
 * Clears existing location first, then generates new content.
 */
export function regenerateHex(world: WorldData, coord: HexCoord, type: RegenerationType): WorldData {
  // Always clear first
  let updated = clearHexLocation(world, coord);

  // If just clearing, we're done
  if (type === "clear") return updated;

  // If changing terrain type, update the hex terrain
  const TERRAIN_TYPES = ["plains", "forest", "hills", "mountains", "water", "swamp"] as const;
  if (TERRAIN_TYPES.includes(type as typeof TERRAIN_TYPES[number])) {
    return {
      ...updated,
      hexes: updated.hexes.map(h =>
        h.coord.q === coord.q && h.coord.r === coord.r
          ? { ...h, terrain: type as typeof TERRAIN_TYPES[number] }
          : h
      ),
    };
  }

  const hex = updated.hexes.find(h => h.coord.q === coord.q && h.coord.r === coord.r);
  if (!hex) return updated;

  // Generate unique seed for regeneration
  const regenSeed = `${world.seed}-regen-${coord.q},${coord.r}-${nanoid(4)}`;

  if (type === "random") {
    return generateRandom(updated, hex, regenSeed);
  }

  // Check if it's a dungeon theme
  if (DUNGEON_THEMES.includes(type as (typeof DUNGEON_THEMES)[number])) {
    return generateDungeonAtHex(updated, hex, regenSeed, type as DungeonTheme);
  }

  // Check if it's a wilderness theme
  if (WILDERNESS_THEMES.includes(type as (typeof WILDERNESS_THEMES)[number])) {
    return generateWildernessAtHex(updated, hex, regenSeed, type as DungeonTheme);
  }

  // Check if it's a settlement size
  if (SETTLEMENT_SIZES.includes(type as (typeof SETTLEMENT_SIZES)[number])) {
    return generateSettlementAtHex(updated, hex, regenSeed, type as SettlementSize);
  }

  return updated;
}

function generateRandom(world: WorldData, hex: typeof world.hexes[0], seed: string): WorldData {
  const rng = new SeededRandom(seed);
  const choice = rng.between(0, 2);

  switch (choice) {
    case 0:
      return generateDungeonAtHex(world, hex, seed);
    case 1:
      return generateWildernessAtHex(world, hex, seed);
    case 2:
      return generateSettlementAtHex(world, hex, seed);
    default:
      return world;
  }
}

function generateDungeonAtHex(
  world: WorldData,
  hex: typeof world.hexes[0],
  seed: string,
  forcedTheme?: DungeonTheme
): WorldData {
  // Create a mutable hex reference for placeDungeon
  // If water terrain, change to hills first (dungeons can't spawn in water)
  const hexRef = {
    ...hex,
    terrain: hex.terrain === "water" ? "hills" as TerrainType : hex.terrain,
  };

  const result = placeDungeon({
    seed,
    hexes: [hexRef],
    theme: forcedTheme,
  });

  if (!result) return world;

  // Update hex with new locationId and terrain change if needed
  const hexes = world.hexes.map(h => {
    if (h.coord.q === hex.coord.q && h.coord.r === hex.coord.r) {
      return {
        ...h,
        locationId: result.dungeon.id,
        terrain: hexRef.terrain, // Apply terrain change if water was converted
      };
    }
    return h;
  });

  return {
    ...world,
    hexes,
    locations: [...world.locations, result.dungeon],
  };
}

// Terrain types that certain wilderness lairs should set
const LAIR_TERRAIN_MAP: Partial<Record<string, TerrainType>> = {
  sea_cave: "water",
  witch_hut: "swamp",
  beast_den: "forest",
};

function generateWildernessAtHex(
  world: WorldData,
  hex: typeof world.hexes[0],
  seed: string,
  forcedTheme?: DungeonTheme
): WorldData {
  // Determine terrain - if water and not sea_cave, convert to appropriate terrain
  const targetTerrain = LAIR_TERRAIN_MAP[forcedTheme ?? ""];
  let workingTerrain = hex.terrain;

  if (hex.terrain === "water" && forcedTheme !== "sea_cave") {
    // Convert water to forest for most lairs
    workingTerrain = targetTerrain ?? "forest";
  }

  // Create a mutable hex reference with correct terrain
  const hexRef = { ...hex, terrain: workingTerrain };

  // If forcing a theme, use placeDungeon with lair size
  if (forcedTheme) {
    const result = placeDungeon({
      seed,
      hexes: [hexRef],
      theme: forcedTheme,
      size: "lair",
    });

    if (!result) return world;

    // Determine final terrain - use LAIR_TERRAIN_MAP if set, otherwise use working terrain
    const finalTerrain = targetTerrain ?? workingTerrain;

    const hexes = world.hexes.map(h => {
      if (h.coord.q === hex.coord.q && h.coord.r === hex.coord.r) {
        return {
          ...h,
          locationId: result.dungeon.id,
          terrain: finalTerrain,
        };
      }
      return h;
    });

    return {
      ...world,
      hexes,
      locations: [...world.locations, result.dungeon],
    };
  }

  // Otherwise use placeWildernessLair for random wilderness theme
  const result = placeWildernessLair({
    seed,
    hexes: [hexRef],
  });

  if (!result) return world;

  const hexes = world.hexes.map(h => {
    if (h.coord.q === hex.coord.q && h.coord.r === hex.coord.r) {
      return { ...h, locationId: result.dungeon.id };
    }
    return h;
  });

  return {
    ...world,
    hexes,
    locations: [...world.locations, result.dungeon],
  };
}

function generateSettlementAtHex(
  world: WorldData,
  hex: typeof world.hexes[0],
  seed: string,
  forcedSize?: SettlementSize
): WorldData {
  const result = placeSettlement({
    seed,
    hexes: world.hexes,
    forceCoord: hex.coord,
    forceSize: forcedSize,
  });

  if (!result) return world;

  const settlement = result.settlement;

  // Generate sites for this settlement (key locations like taverns, temples, etc.)
  const sites = generateSites({ seed, settlement });
  settlement.sites = sites;

  // Link sites to landmark buildings (needed since layout was generated before sites)
  linkSitesToBuildings(settlement);

  // Generate NPCs for this settlement
  const { npcs: settlementNPCs, mayorNpcId, siteOwnerMap } = generateSettlementNPCs({
    seed,
    settlement,
    sites: settlement.sites,
  });

  // Link NPC IDs to settlement
  settlement.npcIds = settlementNPCs.map((n) => n.id);
  settlement.mayorNpcId = mayorNpcId;

  // Link site owners
  for (const site of settlement.sites) {
    const ownerId = siteOwnerMap.get(site.id);
    if (ownerId) {
      site.ownerId = ownerId;
    }
  }

  // Assign NPCs to buildings in spatial settlement
  if ("wards" in settlement && Array.isArray(settlement.wards)) {
    assignNPCsToBuildings(
      settlement as unknown as Parameters<typeof assignNPCsToBuildings>[0],
      settlementNPCs
    );
  }

  // Generate rumors and notices with world-connected content
  const existingDungeons = world.locations.filter(isDungeon) as Dungeon[];
  const existingSettlements = world.locations.filter(isSettlement) as Settlement[];

  settlement.rumors = generateRumors({
    seed: `${seed}-rumors`,
    count: Math.min(8, Math.max(4, Math.floor(settlementNPCs.length / 2))),
    hooks: world.hooks,
    factions: world.factions,
    dungeons: existingDungeons,
    npcs: [...world.npcs, ...settlementNPCs],
    settlements: existingSettlements,
    hexes: world.hexes,
    currentSettlement: settlement,
  });

  settlement.notices = generateNotices({
    seed: `${seed}-notices`,
    count: Math.max(1, Math.floor(settlementNPCs.length / 3)),
    settlementSize: settlement.size,
  });

  // placeSettlement mutates the hex in the array, but we want immutable updates
  const hexes = world.hexes.map(h => {
    if (h.coord.q === hex.coord.q && h.coord.r === hex.coord.r) {
      return { ...h, locationId: settlement.id };
    }
    return h;
  });

  return {
    ...world,
    hexes,
    locations: [...world.locations, settlement],
    npcs: [...world.npcs, ...settlementNPCs],
  };
}
