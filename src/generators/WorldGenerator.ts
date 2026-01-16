import { nanoid } from "nanoid";
import type {
  WorldData,
  WorldState,
  Hex,
  HexEdge,
  Location,
  Settlement,
  SpatialDungeon,
  NPC,
  Faction,
  Clock,
  Hook,
  Dwelling,
  SettlementSize,
  DayRecord,
  SignificantItem,
} from "~/models";
import { SeededRandom } from "./SeededRandom";
import { generateSpiralTerrain, type MapSize, type StartPosition } from "./SpiralTerrainGenerator";
import { generateRivers } from "./RiverGenerator";
import { placeSettlement } from "./SettlementGenerator";
import { assignNPCsToBuildings, linkSitesToBuildings } from "./TownLayoutEngine";
import { placeDungeon, placeWildernessLair } from "./DungeonGenerator";
import { generateSites } from "./SiteGenerator";
import { generateFactions, pickFactionDungeonTheme } from "./FactionGenerator";
import { generateFactionClock } from "./ClockGenerator";
import { generateRoads } from "./RoadGenerator";
import { generateBridges, type Bridge } from "./BridgeGenerator";
import { generateNPC, generateSettlementNPCs, generateFactionNPCs } from "./NPCGenerator";
import { NameRegistry } from "./NameRegistry";
import { generateNPCRelationships } from "./NPCRelationshipGenerator";
import { weaveHooks } from "./HookWeaver";
import { generateRumors, generateNotices } from "./RumorGenerator";
import { generateSettlementHooks, generateDungeonHook, generateFactionHook } from "./HookGenerator";
import { populateSpatialDungeonRooms } from "./RoomContentGenerator";
import { generateWeather, getSeasonFromDay, getMoonPhase } from "./WeatherGenerator";
import { generateTerrainDescription } from "./TerrainDescriptionGenerator";
import { generateDayEvents } from "./DayEventGenerator";
import { generateFeatures } from "./FeatureGenerator";
import { generateHexEncounters } from "./HexEncounterGenerator";
import { generateDwellings } from "./DwellingGenerator";
import { generateQuestObjects } from "./QuestObjectGenerator";
import { generateSignificantItems, placeItemInLocation } from "./SignificantItemGenerator";

export interface WorldGeneratorOptions {
  name: string;
  seed?: string;
  mapSize?: MapSize;
  startPosition?: StartPosition;
  startingSettlementSize?: SettlementSize;
  settlementCount?: number;
  dungeonCount?: number;
  wildernessLairCount?: number;
  factionCount?: number;
  significantItemCount?: number; // Setting Seed items (default: 4)
}

export interface GeneratedWorld {
  world: WorldData;
  bridges: Bridge[];
}

/**
 * Generate a complete world with all content.
 */
// Default counts by map size
const DEFAULT_COUNTS: Record<MapSize, { settlements: number; dungeons: number; wildernessLairs: number }> = {
  small: { settlements: 8, dungeons: 4, wildernessLairs: 6 },
  medium: { settlements: 12, dungeons: 8, wildernessLairs: 10 },
  large: { settlements: 20, dungeons: 12, wildernessLairs: 16 },
};

export function generateWorld(options: WorldGeneratorOptions): GeneratedWorld {
  const {
    name,
    seed = nanoid(8),
    mapSize = "medium",
    startPosition = "center",
    startingSettlementSize = "village",
    factionCount = 2,
  } = options;

  const defaults = DEFAULT_COUNTS[mapSize];
  const settlementCount = options.settlementCount ?? defaults.settlements;
  const dungeonCount = options.dungeonCount ?? defaults.dungeons;
  const wildernessLairCount = options.wildernessLairCount ?? defaults.wildernessLairs;

  const rng = new SeededRandom(seed);
  const worldId = `world-${nanoid(8)}`;
  const nameRegistry = new NameRegistry(seed);

  // Step 1: Generate terrain using spiral pattern
  const { hexes, startCoord, poiCoords } = generateSpiralTerrain({
    seed,
    mapSize,
    startPosition,
  });

  // Step 2: Generate rivers
  const { rivers, riverHexes } = generateRivers({ seed, hexes, riverCount: 2 });

  // Step 3: Generate significant items (Setting Seeds - narrative artifacts)
  // These drive faction conflict and dungeon purpose
  const significantItemCount = options.significantItemCount ?? 4;
  const significantItems = generateSignificantItems({
    seed,
    count: significantItemCount,
  });

  // Step 4: Place settlements first (factions need them for HQ assignment)
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
      linkSitesToBuildings(startSettlement.settlement);
      startSettlement.settlement.rumors = []; // Will populate after factions
      startSettlement.settlement.notices = [];
      settlements.push(startSettlement.settlement);
      settlementHexes.push(startSettlement.hex);
    }
  }

  // Place additional settlements
  const extraSettlementCount = settlementCount - 1;

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
      linkSitesToBuildings(result.settlement);
      result.settlement.rumors = [];
      result.settlement.notices = [];
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
      linkSitesToBuildings(result.settlement);
      result.settlement.rumors = [];
      result.settlement.notices = [];
      settlements.push(result.settlement);
      settlementHexes.push(result.hex);
    }
  }

  // Step 5: Generate factions (now with settlements for HQ assignment)
  // Factions may possess or desire significant items
  const factions = generateFactions({
    seed,
    count: factionCount,
    hexes,
    settlements: settlements.map((s) => ({ id: s.id, name: s.name })),
    significantItems,
  });

  // Step 6: Generate rumors and notices for each settlement (now that factions exist)
  for (let i = 0; i < settlements.length; i++) {
    const settlement = settlements[i];
    settlement.rumors = generateRumors({
      seed: `${seed}-rumors-${i}`,
      factions,
      settlements,
      hexes,
      currentSettlement: settlement,
      significantItems,
    });
    settlement.notices = generateNotices({
      seed: `${seed}-notices-${i}`,
      settlementSize: settlement.size,
      factions,
      significantItems,
    });
  }

  // Step 7: Designate capital - largest settlement becomes regional seat of power
  if (settlements.length > 0) {
    const capitalRng = new SeededRandom(`${seed}-capital`);

    // Find the largest settlement, or use the starting one
    const sizeOrder: Record<string, number> = { thorpe: 1, hamlet: 2, village: 3, town: 4, city: 5 };
    settlements.sort((a, b) => sizeOrder[b.size] - sizeOrder[a.size]);
    const capital = settlements[0];

    // Upgrade to city if not already
    if (capital.size !== "city") {
      capital.size = "city";
      capital.population = capitalRng.between(5000, 15000);
      capital.defenses = "fortified";
    }

    // Mark as capital
    capital.isCapital = true;
    capital.governmentType = "lord";

    // Pick ruler title based on map size
    const titles: Array<"baron" | "count" | "duke" | "king"> =
      mapSize === "large" ? ["duke", "king"] :
      mapSize === "medium" ? ["count", "duke", "baron"] :
      ["baron", "count"];
    capital.rulerTitle = capitalRng.pick(titles);

    // Re-sort settlements back to original order for consistency
    settlements.sort((a, b) => a.id.localeCompare(b.id));
  }

  // Step 7: Generate roads between settlements
  const { roads, roadHexes } = generateRoads({ seed, hexes, settlementHexes });

  // Step 8: Generate bridges where roads cross rivers
  const bridges = generateBridges({ seed, roads, riverHexes });

  // Step 8b: Generate faction lair dungeons
  // Factions with wilderness lairs get a dungeon generated at their lair hex
  const dungeons: SpatialDungeon[] = [];
  const factionLairRng = new SeededRandom(`${seed}-faction-lairs`);

  for (const faction of factions) {
    if (faction.lair?.hexCoord) {
      // Pick a theme appropriate for this faction type
      const theme = pickFactionDungeonTheme(factionLairRng, faction.factionType);

      // Generate dungeon at the faction's lair hex
      const result = placeDungeon({
        seed: `${seed}-faction-lair-${faction.id}`,
        hexes,
        forceCoord: faction.lair.hexCoord,
        forceTheme: theme,
      });

      if (result) {
        // Link dungeon to faction
        result.dungeon.controllingFactionId = faction.id;
        faction.headquartersId = result.dungeon.id;
        faction.lair.dungeonId = result.dungeon.id;

        // Populate rooms
        result.dungeon.rooms = populateSpatialDungeonRooms(
          `${seed}-faction-lair-${faction.id}`,
          result.dungeon.rooms,
          result.dungeon.depth
        );

        dungeons.push(result.dungeon);
      }
    }
  }

  // Step 9: Place additional dungeons

  for (let i = 0; i < dungeonCount; i++) {
    const result = placeDungeon({ seed: `${seed}-dungeon-${i}`, hexes });
    if (result) {
      // Populate dungeon rooms with encounters and treasure
      result.dungeon.rooms = populateSpatialDungeonRooms(seed, result.dungeon.rooms, result.dungeon.depth);
      dungeons.push(result.dungeon);
    }
  }

  // Step 9b: Place wilderness lairs (mini-dungeons)
  for (let i = 0; i < wildernessLairCount; i++) {
    const result = placeWildernessLair({ seed: `${seed}-wilderness-${i}`, hexes });
    if (result) {
      result.dungeon.rooms = populateSpatialDungeonRooms(seed, result.dungeon.rooms, result.dungeon.depth);
      dungeons.push(result.dungeon);
    }
  }

  // Step 9c: Place hidden significant items in dungeons
  // Items that aren't possessed by factions get placed in dungeons
  const itemRng = new SeededRandom(`${seed}-item-placement`);
  const hiddenItems = significantItems.filter(
    (item) => item.status === "hidden" || item.status === "lost"
  );

  for (const item of hiddenItems) {
    if (dungeons.length === 0) break;

    // Pick a dungeon that doesn't have too many items already
    const eligibleDungeons = dungeons.filter(
      (d) => !significantItems.some((i) => i.locationId === d.id)
    );

    if (eligibleDungeons.length > 0) {
      const targetDungeon = itemRng.pick(eligibleDungeons);
      const dungeonHex = hexes.find(
        (h) => h.coord.q === targetDungeon.hexCoord.q && h.coord.r === targetDungeon.hexCoord.r
      );

      // Update the item with its location
      item.locationId = targetDungeon.id;
      item.hexCoord = targetDungeon.hexCoord;
      item.status = "hidden";
      item.locationKnown = itemRng.chance(0.3); // 30% chance location is known
    }
  }

  // Step 10: Generate dwellings
  const { dwellings, hexes: hexesWithDwellings } = generateDwellings({
    seed,
    hexes,
    roadHexes,
  });
  let updatedHexes = hexesWithDwellings;

  // Step 11: Generate features
  const { hexes: hexesWithFeatures } = generateFeatures({
    seed,
    hexes: updatedHexes,
    roadHexes,
  });
  updatedHexes = hexesWithFeatures;

  // Step 12: Generate hex encounters
  updatedHexes = generateHexEncounters({ seed, hexes: updatedHexes });

  // Step 13: Generate quest objects
  updatedHexes = generateQuestObjects({ seed, hexes: updatedHexes });

  // Step 14: Add terrain descriptions to all hexes
  const terrainRng = new SeededRandom(`${seed}-terrain-desc`);
  updatedHexes = updatedHexes.map((hex) => ({
    ...hex,
    description: generateTerrainDescription(hex.terrain, terrainRng),
  }));

  // Step 15: Generate NPCs
  const npcs: NPC[] = [];

  // Settlement NPCs
  for (const settlement of settlements) {
    const sites = settlement.sites;
    const { npcs: settlementNPCs, mayorNpcId, siteOwnerMap } = generateSettlementNPCs({
      seed,
      settlement,
      sites,
      nameRegistry,
      settlementType: settlement.settlementType,
    });
    npcs.push(...settlementNPCs);

    // Link NPC IDs to settlement
    settlement.npcIds = settlementNPCs.map((n) => n.id);
    settlement.mayorNpcId = mayorNpcId;

    // Generate ruler for capital
    if (settlement.isCapital && settlement.rulerTitle) {
      const ruler = generateNPC({
        seed: `${seed}-ruler-${settlement.id}`,
        archetype: "noble",
        locationId: settlement.id,
        role: settlement.rulerTitle,
        age: rng.between(35, 65),
        nameRegistry,
        settlementType: settlement.settlementType,
      });
      npcs.push(ruler);
      settlement.npcIds.push(ruler.id);
      settlement.rulerNpcId = ruler.id;
    }

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
  }

  // Faction NPCs
  for (const faction of factions) {
    const factionNPCs = generateFactionNPCs({ seed, faction, nameRegistry });
    npcs.push(...factionNPCs);
  }

  // Step 16: Generate NPC relationships (family clusters, rivalries)
  const { npcs: npcsWithRelationships } = generateNPCRelationships({
    seed,
    npcs,
    settlements,
  });

  // Step 17: Generate clocks for factions
  const clocks: Clock[] = [];
  for (const faction of factions) {
    const clock = generateFactionClock({ seed, faction });
    clocks.push(clock);
  }

  // Step 18: Generate interconnected hooks using HookWeaver
  const { hooks: wovenHooks, npcs: npcsWithWants } = weaveHooks({
    seed,
    npcs: npcsWithRelationships,
    settlements,
    dungeons,
    factions,
  });

  // Also add legacy dungeon hooks (for dungeons not covered by weaveHooks)
  const hooks: Hook[] = [...wovenHooks];
  for (const dungeon of dungeons) {
    // Only add if dungeon doesn't already have hooks from weaveHooks
    const hasHook = wovenHooks.some((h) => h.targetLocationId === dungeon.id);
    if (!hasHook) {
      const dungeonHook = generateDungeonHook(seed, dungeon);
      hooks.push(dungeonHook);
      dungeon.linkedHookIds.push(dungeonHook.id);
    }
  }

  // Link woven hooks to dungeons
  for (const hook of wovenHooks) {
    if (hook.targetLocationId) {
      const dungeon = dungeons.find((d) => d.id === hook.targetLocationId);
      if (dungeon && !dungeon.linkedHookIds.includes(hook.id)) {
        dungeon.linkedHookIds.push(hook.id);
      }
    }
  }

  // Step 18b: Distribute hook rumors to settlements
  const hookRng = new SeededRandom(`${seed}-hook-rumors`);
  for (const hook of wovenHooks) {
    // Find source settlement for this hook
    let sourceSettlement: Settlement | undefined;
    if (hook.sourceSettlementId) {
      sourceSettlement = settlements.find((s) => s.id === hook.sourceSettlementId);
    } else if (hook.sourceNpcId) {
      const sourceNpc = npcsWithWants.find((n) => n.id === hook.sourceNpcId);
      if (sourceNpc?.locationId) {
        sourceSettlement = settlements.find((s) => s.id === sourceNpc.locationId);
      }
    }

    if (sourceSettlement) {
      // Create a rumor linked to this hook
      const rumor = {
        id: `rumor-${hook.id}`,
        text: hook.rumor,
        isTrue: true,
        source: "tavern talk",
        linkedHookId: hook.id,
        targetLocationId: hook.targetLocationId,
      };
      sourceSettlement.rumors.push(rumor);
    }
  }

  // Step 18c: Link faction recruitment hooks and distribute goal rumors
  for (const faction of factions) {
    // Recruitment hooks already linked in weaveHooks

    // Create goal rumors for influenced settlements
    if (faction.influenceIds.length > 0 || settlements.length > 0) {
      const targetSettlement = hookRng.pick(settlements);
      const goalRumor = {
        id: `rumor-faction-${faction.id}`,
        text: `The ${faction.name} is ${faction.purpose}`,
        isTrue: true,
        source: "whispered rumors",
      };
      targetSettlement.rumors.push(goalRumor);
      faction.goalRumorIds.push(goalRumor.id);
    }
  }

  // Cap rumors at 8 per settlement, prioritizing linked rumors
  const MAX_RUMORS = 8;
  for (const settlement of settlements) {
    if (settlement.rumors.length > MAX_RUMORS) {
      // Sort to prioritize linked rumors (hooks/factions) over generic ones
      settlement.rumors.sort((a, b) => {
        const aLinked = a.linkedHookId ? 1 : 0;
        const bLinked = b.linkedHookId ? 1 : 0;
        return bLinked - aLinked;
      });
      settlement.rumors = settlement.rumors.slice(0, MAX_RUMORS);
    }
  }

  // Step 18d: Create notice board postings from hooks
  for (const hook of wovenHooks) {
    if (!hook.sourceNpcId) continue;

    const sourceNpc = npcsWithWants.find((n) => n.id === hook.sourceNpcId);
    if (!sourceNpc?.locationId) continue;

    const settlement = settlements.find((s) => s.id === sourceNpc.locationId);
    if (!settlement) continue;

    // Create a notice for this hook
    const noticeType = hook.type === "retrieval" ? "job"
      : hook.type === "rescue" ? "request"
      : hook.type === "assassination" ? "bounty"
      : hook.type === "investigation" ? "job"
      : "request";

    const notice = {
      id: `notice-${hook.id}`,
      title: hook.rumor.slice(0, 50) + (hook.rumor.length > 50 ? "..." : ""),
      description: hook.rumor,
      posterId: sourceNpc.id,
      noticeType: noticeType as "bounty" | "job" | "warning" | "announcement" | "request",
      reward: hook.reward,
      linkedHookId: hook.id,
    };

    settlement.notices.push(notice);
  }

  // Update npcs to final version with relationships and wants
  const finalNPCs = npcsWithWants;

  // Step 19: Build edges array (roads + rivers)
  const edges: HexEdge[] = [...roads, ...rivers];

  // Step 20: Build locations array
  const locations: Location[] = [...settlements, ...dungeons];

  // Step 21: Generate initial weather/time state
  const day = 1;
  const year = 1;
  const season = getSeasonFromDay(day);
  const weather = generateWeather({ seed, season, day });
  const moonPhase = getMoonPhase(day);

  // Step 22: Assemble world data (without calendar first)
  const FORECAST_DAYS = 28;
  const world: WorldData = {
    id: worldId,
    name,
    seed,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: {
      day,
      season,
      year,
      weather,
      moonPhase,
      calendar: [],
      forecastEndDay: FORECAST_DAYS,
    },
    hexes: updatedHexes,
    edges,
    locations,
    dwellings,
    npcs: finalNPCs,
    factions,
    significantItems, // Setting Seed narrative items
    hooks,
    clocks,
  };

  // Step 23: Pre-generate 28 days of events/weather
  for (let d = 1; d <= FORECAST_DAYS; d++) {
    const daySeason = getSeasonFromDay(d);
    const dayWeather = generateWeather({ seed, season: daySeason, day: d });
    const dayMoonPhase = getMoonPhase(d);
    const dayEvents = generateDayEvents({ seed, day: d, world });

    world.state.calendar.push({
      day: d,
      weather: dayWeather,
      moonPhase: dayMoonPhase,
      events: dayEvents,
    });
  }

  return { world, bridges };
}

const FORECAST_DAYS = 28;

/**
 * Advance the world by one day.
 * Reads from pre-generated calendar. Returns null if at end of forecast.
 */
export function advanceDay(world: WorldData): WorldData | null {
  const newDay = world.state.day + 1;

  // Can't advance past forecast
  if (newDay > world.state.forecastEndDay) {
    return null;
  }

  const dayRecord = world.state.calendar.find((r) => r.day === newDay);
  if (!dayRecord) {
    return null;
  }

  // Advance clocks for any clock_tick events on this day
  const updatedClocks = world.clocks.map((clock) => {
    const clockTickEvent = dayRecord.events.find(
      (e) => e.type === "clock_tick" && e.linkedClockId === clock.id
    );
    if (clockTickEvent && !clock.paused && clock.completedAt === undefined) {
      return {
        ...clock,
        filled: Math.min(clock.filled + 1, clock.segments),
        completedAt: clock.filled + 1 >= clock.segments ? Date.now() : undefined,
      };
    }
    return clock;
  });

  return {
    ...world,
    clocks: updatedClocks,
    updatedAt: Date.now(),
    state: {
      ...world.state,
      day: newDay,
      year: Math.floor(newDay / 360) + 1,
      season: getSeasonFromDay(newDay),
      weather: dayRecord.weather,
      moonPhase: dayRecord.moonPhase,
    },
  };
}

/**
 * Go back one day.
 * Returns null if already at day 1.
 */
export function goBackDay(world: WorldData): WorldData | null {
  if (world.state.day <= 1) {
    return null;
  }

  const newDay = world.state.day - 1;
  const dayRecord = world.state.calendar.find((r) => r.day === newDay);
  if (!dayRecord) {
    return null;
  }

  return {
    ...world,
    updatedAt: Date.now(),
    state: {
      ...world.state,
      day: newDay,
      year: Math.floor(newDay / 360) + 1,
      season: getSeasonFromDay(newDay),
      weather: dayRecord.weather,
      moonPhase: dayRecord.moonPhase,
    },
  };
}

/**
 * Extend forecast by generating another 28 days.
 */
export function extendForecast(world: WorldData): WorldData {
  const startDay = world.state.forecastEndDay + 1;
  const endDay = startDay + FORECAST_DAYS - 1;
  const newCalendar = [...world.state.calendar];

  for (let d = startDay; d <= endDay; d++) {
    const daySeason = getSeasonFromDay(d);
    const dayWeather = generateWeather({ seed: world.seed, season: daySeason, day: d });
    const dayMoonPhase = getMoonPhase(d);
    const dayEvents = generateDayEvents({ seed: world.seed, day: d, world });

    newCalendar.push({
      day: d,
      weather: dayWeather,
      moonPhase: dayMoonPhase,
      events: dayEvents,
    });
  }

  return {
    ...world,
    updatedAt: Date.now(),
    state: {
      ...world.state,
      calendar: newCalendar,
      forecastEndDay: endDay,
    },
  };
}

/**
 * Check if forecast needs extending (within 5 days of end).
 */
export function needsForecastExtension(world: WorldData): boolean {
  return world.state.day >= world.state.forecastEndDay - 5;
}

/**
 * Get a summary of the world.
 */
export function getWorldSummary(world: WorldData): string {
  const settlements = world.locations.filter((l) => l.type === "settlement");
  const dungeons = world.locations.filter((l) => l.type === "dungeon");

  return `${world.name}: ${world.hexes.length} hexes, ${settlements.length} settlements, ${dungeons.length} dungeons, ${world.factions.length} factions, ${world.npcs.length} NPCs, ${world.hooks.length} hooks`;
}
