import type { WorldData, HexCoord, DungeonTheme, SettlementSize, Dungeon, Settlement } from "~/models";
import { placeDungeon, placeWildernessLair } from "~/generators/DungeonGenerator";
import { placeSettlement } from "~/generators/SettlementGenerator";
import { SeededRandom } from "~/generators/SeededRandom";
import { nanoid } from "nanoid";

// Dungeon themes (standard)
const DUNGEON_THEMES = ["tomb", "cave", "temple", "mine", "fortress", "sewer", "crypt", "lair"] as const;

// Wilderness lair themes
const WILDERNESS_THEMES = ["bandit_hideout", "cultist_lair", "witch_hut", "sea_cave", "beast_den", "floating_keep"] as const;

// Settlement sizes
const SETTLEMENT_SIZES = ["thorpe", "hamlet", "village", "town", "city"] as const;

export type RegenerationType =
  | "random"
  | "clear"
  // Dungeon themes
  | "tomb"
  | "cave"
  | "temple"
  | "mine"
  | "fortress"
  | "sewer"
  | "crypt"
  | "lair"
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
 */
export function clearHexLocation(world: WorldData, coord: HexCoord): WorldData {
  const hex = world.hexes.find(h => h.coord.q === coord.q && h.coord.r === coord.r);
  if (!hex || !hex.locationId) return world;

  const locationId = hex.locationId;

  // Remove location from locations array
  const locations = world.locations.filter(loc => loc.id !== locationId);

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
  const hexRef = { ...hex };

  const result = placeDungeon({
    seed,
    hexes: [hexRef],
    theme: forcedTheme,
  });

  if (!result) return world;

  // Update hex with new locationId
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

function generateWildernessAtHex(
  world: WorldData,
  hex: typeof world.hexes[0],
  seed: string,
  forcedTheme?: DungeonTheme
): WorldData {
  // Create a mutable hex reference
  const hexRef = { ...hex };

  // If forcing a theme, use placeDungeon with lair size
  if (forcedTheme) {
    const result = placeDungeon({
      seed,
      hexes: [hexRef],
      theme: forcedTheme,
      size: "lair",
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

  // placeSettlement mutates the hex in the array, but we want immutable updates
  const hexes = world.hexes.map(h => {
    if (h.coord.q === hex.coord.q && h.coord.r === hex.coord.r) {
      return { ...h, locationId: result.settlement.id };
    }
    return h;
  });

  return {
    ...world,
    hexes,
    locations: [...world.locations, result.settlement],
  };
}
