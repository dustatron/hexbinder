import { nanoid } from "nanoid";
import type {
  WorldData,
  WorldState,
  Hex,
  HexEdge,
  Location,
  Settlement,
  Dungeon,
  NPC,
  Faction,
  Clock,
  Hook,
  SettlementSize,
} from "~/models";
import { SeededRandom } from "./SeededRandom";
import { generateSpiralTerrain, type MapSize, type StartPosition } from "./SpiralTerrainGenerator";
import { generateRivers } from "./RiverGenerator";
import { placeSettlement } from "./SettlementGenerator";
import { placeDungeon } from "./DungeonGenerator";
import { generateSites } from "./SiteGenerator";
import { generateFactions } from "./FactionGenerator";
import { generateFactionClock } from "./ClockGenerator";
import { generateRoads } from "./RoadGenerator";
import { generateBridges, type Bridge } from "./BridgeGenerator";
import { generateSettlementNPCs, generateFactionNPCs } from "./NPCGenerator";
import { generateRumors, generateNotices } from "./RumorGenerator";
import { generateSettlementHooks, generateDungeonHook, generateFactionHook } from "./HookGenerator";
import { populateDungeonRooms } from "./RoomContentGenerator";
import { generateWeather, getSeasonFromDay, getMoonPhase } from "./WeatherGenerator";

export interface WorldGeneratorOptions {
  name: string;
  seed?: string;
  mapSize?: MapSize;
  startPosition?: StartPosition;
  startingSettlementSize?: SettlementSize;
  dungeonCount?: number;
  factionCount?: number;
}

export interface GeneratedWorld {
  world: WorldData;
  bridges: Bridge[];
}

/**
 * Generate a complete world with all content.
 */
export function generateWorld(options: WorldGeneratorOptions): GeneratedWorld {
  const {
    name,
    seed = nanoid(8),
    mapSize = "medium",
    startPosition = "center",
    startingSettlementSize = "village",
    dungeonCount = 2,
    factionCount = 2,
  } = options;

  const rng = new SeededRandom(seed);
  const worldId = `world-${nanoid(8)}`;

  // Step 1: Generate terrain using spiral pattern
  const { hexes, startCoord, poiCoords } = generateSpiralTerrain({
    seed,
    mapSize,
    startPosition,
  });

  // Step 2: Generate rivers
  const { rivers, riverHexes } = generateRivers({ seed, hexes, riverCount: 2 });

  // Step 3: Generate factions
  const factions = generateFactions({ seed, count: factionCount });

  // Step 4: Place starting settlement at start position
  const settlements: Settlement[] = [];
  const settlementHexes: Hex[] = [];

  // Find the hex at start position for the starting settlement
  const startHex = hexes.find(h => h.coord.q === startCoord.q && h.coord.r === startCoord.r);
  if (startHex) {
    const startSettlement = placeSettlement({
      seed: `${seed}-settlement-start`,
      hexes,
      forceCoord: startCoord,
      forceSize: startingSettlementSize,
    });
    if (startSettlement) {
      const sites = generateSites({ seed, settlement: startSettlement.settlement });
      startSettlement.settlement.sites = sites;
      startSettlement.settlement.rumors = generateRumors({ seed: `${seed}-rumors-0`, factions });
      startSettlement.settlement.notices = generateNotices({ seed: `${seed}-notices-0`, settlementSize: startSettlement.settlement.size });
      settlements.push(startSettlement.settlement);
      settlementHexes.push(startSettlement.hex);
    }
  }

  // Step 5: Place additional settlements
  // Number of extra settlements based on map size
  const extraSettlementCount = mapSize === "small" ? 1 : mapSize === "medium" ? 2 : 4;

  // First try POI locations on plains
  const poiForSettlements = poiCoords.filter(c =>
    hexes.find(h => h.coord.q === c.q && h.coord.r === c.r)?.terrain === "plains"
  );

  for (let i = 0; i < Math.min(poiForSettlements.length, extraSettlementCount); i++) {
    const result = placeSettlement({
      seed: `${seed}-settlement-${i + 1}`,
      hexes,
      forceCoord: poiForSettlements[i],
    });
    if (result) {
      const sites = generateSites({ seed, settlement: result.settlement });
      result.settlement.sites = sites;
      result.settlement.rumors = generateRumors({ seed: `${seed}-rumors-${i + 1}`, factions });
      result.settlement.notices = generateNotices({ seed: `${seed}-notices-${i + 1}`, settlementSize: result.settlement.size });
      settlements.push(result.settlement);
      settlementHexes.push(result.hex);
    }
  }

  // If not enough POI settlements, place more at random plains
  const remainingCount = extraSettlementCount - (settlements.length - 1);
  for (let i = 0; i < remainingCount; i++) {
    const result = placeSettlement({
      seed: `${seed}-settlement-extra-${i}`,
      hexes,
    });
    if (result) {
      const sites = generateSites({ seed, settlement: result.settlement });
      result.settlement.sites = sites;
      result.settlement.rumors = generateRumors({ seed: `${seed}-rumors-extra-${i}`, factions });
      result.settlement.notices = generateNotices({ seed: `${seed}-notices-extra-${i}`, settlementSize: result.settlement.size });
      settlements.push(result.settlement);
      settlementHexes.push(result.hex);
    }
  }

  // Step 6: Generate roads between settlements
  const { roads, roadHexes } = generateRoads({ seed, hexes, settlementHexes });

  // Step 7: Generate bridges where roads cross rivers
  const bridges = generateBridges({ seed, roads, riverHexes });

  // Step 8: Place dungeons
  const dungeons: Dungeon[] = [];

  for (let i = 0; i < dungeonCount; i++) {
    const result = placeDungeon({ seed: `${seed}-dungeon-${i}`, hexes });
    if (result) {
      // Populate dungeon rooms with encounters and treasure
      result.dungeon.rooms = populateDungeonRooms(seed, result.dungeon.rooms, result.dungeon.depth);
      dungeons.push(result.dungeon);
    }
  }

  // Step 9: Generate NPCs
  const npcs: NPC[] = [];

  // Settlement NPCs
  for (const settlement of settlements) {
    const sites = settlement.sites;
    const settlementNPCs = generateSettlementNPCs({ seed, settlement, sites });
    npcs.push(...settlementNPCs);

    // Link NPC IDs to settlement
    settlement.npcIds = settlementNPCs.map((n) => n.id);
  }

  // Faction NPCs
  for (const faction of factions) {
    const factionNPCs = generateFactionNPCs({ seed, faction });
    npcs.push(...factionNPCs);
  }

  // Step 10: Generate clocks for factions
  const clocks: Clock[] = [];
  for (const faction of factions) {
    const clock = generateFactionClock({ seed, faction });
    clocks.push(clock);
  }

  // Step 11: Generate hooks
  const hooks: Hook[] = [];

  // Settlement hooks
  for (const settlement of settlements) {
    const settlementHooks = generateSettlementHooks(seed, settlement, 1);
    hooks.push(...settlementHooks);
  }

  // Dungeon hooks
  for (const dungeon of dungeons) {
    const dungeonHook = generateDungeonHook(seed, dungeon);
    hooks.push(dungeonHook);
    dungeon.linkedHookIds.push(dungeonHook.id);
  }

  // Faction hooks
  for (const faction of factions) {
    const factionHook = generateFactionHook(seed, faction);
    hooks.push(factionHook);
  }

  // Step 12: Build edges array (roads + rivers)
  const edges: HexEdge[] = [...roads, ...rivers];

  // Step 13: Build locations array
  const locations: Location[] = [...settlements, ...dungeons];

  // Step 14: Generate initial weather/time state
  const day = 1;
  const year = 1;
  const season = getSeasonFromDay(day);
  const weather = generateWeather({ seed, season, day });
  const moonPhase = getMoonPhase(day);

  // Step 15: Assemble world state
  const state: WorldState = {
    day,
    season,
    year,
    weather,
    moonPhase,
  };

  // Step 16: Assemble world data
  const world: WorldData = {
    id: worldId,
    name,
    seed,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state,
    hexes,
    edges,
    locations,
    npcs,
    factions,
    hooks,
    clocks,
  };

  return { world, bridges };
}

/**
 * Advance the world by one day.
 */
export function advanceDay(world: WorldData): WorldData {
  const newDay = world.state.day + 1;
  const newYear = Math.floor(newDay / 360) + 1;
  const season = getSeasonFromDay(newDay);
  const weather = generateWeather({
    seed: world.seed,
    season,
    day: newDay,
  });
  const moonPhase = getMoonPhase(newDay);

  return {
    ...world,
    updatedAt: Date.now(),
    state: {
      ...world.state,
      day: newDay,
      year: newYear,
      season,
      weather,
      moonPhase,
    },
  };
}

/**
 * Get a summary of the world.
 */
export function getWorldSummary(world: WorldData): string {
  const settlements = world.locations.filter((l) => l.type === "settlement");
  const dungeons = world.locations.filter((l) => l.type === "dungeon");

  return `${world.name}: ${world.hexes.length} hexes, ${settlements.length} settlements, ${dungeons.length} dungeons, ${world.factions.length} factions, ${world.npcs.length} NPCs, ${world.hooks.length} hooks`;
}
