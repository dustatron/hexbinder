/**
 * Obojima World Builder
 *
 * Reads the base world JSON, merges in canon static data (factions, NPCs,
 * settlements, hooks, clocks, companion spirits, corruption zones),
 * validates all cross-references, and writes the final world JSON.
 *
 * Run: pnpm run build:obojima
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { WorldData, Settlement, Hex, NPC, Dungeon, Notice, Hook, Faction, SpatialDungeon } from "~/models";
import { isSettlement, isDungeon } from "~/models";

// Static canon data
import { OBOJIMA_FACTIONS } from "~/data/obojima/factions";
import { OBOJIMA_NPCS } from "~/data/obojima/npcs";
import { SETTLEMENT_ENRICHMENTS } from "~/data/obojima/settlements";
import { OBOJIMA_COMPANION_SPIRITS } from "~/data/obojima/companion-spirits";
import { CORRUPTION_ZONES, buildCorruptionMap } from "~/data/obojima/corruption-zones";
import { OBOJIMA_HOOKS } from "~/data/obojima/hooks";
import { OBOJIMA_CLOCKS } from "~/data/obojima/clocks";
import { LANDMARK_ENRICHMENTS } from "~/data/obojima/landmarks";
import { OBOJIMA_DUNGEON_CREATURES } from "~/data/obojima/dungeon-creatures";
import { CANON_DUNGEON_ENRICHMENTS } from "~/data/obojima/canon-dungeons";
import { OBOJIMA_QUEST_NAMES, OBOJIMA_QUEST_DESCRIPTIONS } from "~/data/obojima/quest-objects";

// Procedural generators
import { generateFeatures } from "~/generators/FeatureGenerator";
import { generateDwellings } from "~/generators/DwellingGenerator";
import { placeWildernessLair, placeDungeon } from "~/generators/DungeonGenerator";
import { generateTownLayout, assignNPCsToBuildings, linkSitesToBuildings } from "~/generators/TownLayoutEngine";
import { generateSites } from "~/generators/SiteGenerator";
import { generateRumors } from "~/generators/RumorGenerator";
import { generateQuestObjects } from "~/generators/QuestObjectGenerator";
import { SeededRandom } from "~/generators/SeededRandom";
import { generateDayEvents } from "~/generators/DayEventGenerator";
import { generateWeather, getSeasonFromDay, getMoonPhase } from "~/generators/WeatherGenerator";
import { coordKey } from "~/lib/hex-utils";

// ============================================================
// Configuration
// ============================================================

const BASE_PATH = resolve("public/worlds/obojima.hexbinder.json");
const OUTPUT_PATH = BASE_PATH; // overwrite in place

// ============================================================
// Helpers
// ============================================================

function log(msg: string) {
  console.log(`[obojima-builder] ${msg}`);
}

function warn(msg: string) {
  console.warn(`[obojima-builder] ⚠ ${msg}`);
}

// ============================================================
// Main
// ============================================================

function main() {
  log("Reading base world...");
  const raw = readFileSync(BASE_PATH, "utf-8");
  const world: WorldData = JSON.parse(raw);

  log(`Base: ${world.hexes.length} hexes, ${world.locations.length} locations, ${world.edges.length} edges`);

  // --- Set themeId and name ---
  world.themeId = "obojima";
  world.name = "Obojima";

  // --- Merge Factions ---
  log(`Adding ${OBOJIMA_FACTIONS.length} factions...`);
  world.factions = OBOJIMA_FACTIONS;

  // --- Merge NPCs ---
  log(`Adding ${OBOJIMA_NPCS.length} NPCs...`);
  world.npcs = OBOJIMA_NPCS;

  // --- Merge Hooks ---
  log(`Adding ${OBOJIMA_HOOKS.length} hooks...`);
  world.hooks = OBOJIMA_HOOKS;

  // --- Merge Clocks ---
  log(`Adding ${OBOJIMA_CLOCKS.length} clocks...`);
  world.clocks = OBOJIMA_CLOCKS;

  // --- Merge Companion Spirits ---
  log(`Adding ${OBOJIMA_COMPANION_SPIRITS.length} companion spirits...`);
  world.companionSpirits = OBOJIMA_COMPANION_SPIRITS;

  // --- Enrich Settlements ---
  log("Enriching settlements...");
  enrichSettlements(world);

  // --- Enrich Landmarks ---
  // On re-runs, landmarks may already be converted to dungeons, so look up both IDs
  log("Enriching landmarks...");
  let landmarkCount = 0;
  for (const enrichment of LANDMARK_ENRICHMENTS) {
    const dungeonId = enrichment.id.replace("landmark-", "dungeon-");
    const loc = world.locations.find(l => l.id === enrichment.id || l.id === dungeonId);
    if (!loc) {
      warn(`Landmark not found: ${enrichment.id}`);
      continue;
    }
    loc.description = enrichment.description;
    loc.encounters = enrichment.encounters;
    if (enrichment.npcIds) loc.npcIds = enrichment.npcIds;
    // Merge tags (keep existing, add new)
    const existingTags = new Set(loc.tags);
    for (const tag of enrichment.tags) existingTags.add(tag);
    loc.tags = [...existingTags];
    // Set faction if specified
    if (enrichment.factionId) loc.factionId = enrichment.factionId;
    landmarkCount++;
  }
  log(`  Enriched ${landmarkCount}/${LANDMARK_ENRICHMENTS.length} landmarks`);

  // --- Convert explorable landmarks to dungeons ---
  log("Converting landmarks to dungeons...");
  let convertedCount = 0;
  for (const enrichment of LANDMARK_ENRICHMENTS) {
    if (!enrichment.dungeonConversion) continue;
    const dungeonId = enrichment.id.replace("landmark-", "dungeon-");
    // Find either the original landmark or previously-converted dungeon
    const loc = world.locations.find(l => l.id === enrichment.id || l.id === dungeonId);
    if (!loc) continue;

    const conv = enrichment.dungeonConversion;
    const result = placeDungeon({
      seed: `obojima-landmark-${enrichment.id}`,
      hexes: world.hexes,
      forceCoord: loc.hexCoord,
      forceTheme: conv.theme,
      size: conv.size,
    });
    if (!result) {
      warn(`Failed to convert landmark to dungeon: ${enrichment.id}`);
      continue;
    }

    const dungeon = result.dungeon as SpatialDungeon;
    // Override generated name/description with canon data
    dungeon.id = enrichment.id.replace("landmark-", "dungeon-");
    dungeon.name = loc.name;
    dungeon.description = loc.description;
    dungeon.encounters = enrichment.encounters;
    if (enrichment.npcIds) dungeon.npcIds = enrichment.npcIds;
    if (enrichment.factionId) dungeon.factionId = enrichment.factionId;
    dungeon.tags = [...loc.tags];

    // Apply room overrides from source material
    if (conv.roomOverrides && dungeon.rooms) {
      for (const override of conv.roomOverrides) {
        if (override.index < dungeon.rooms.length) {
          dungeon.rooms[override.index].name = override.name;
          dungeon.rooms[override.index].description = override.description;
        }
      }
    }

    // Replace the landmark with the dungeon in locations
    const locIdx = world.locations.findIndex(l => l.id === enrichment.id);
    if (locIdx >= 0) world.locations[locIdx] = dungeon;

    // Update hex locationId to new dungeon ID
    const hexIdx = world.hexes.findIndex(
      h => h.coord.q === loc.hexCoord.q && h.coord.r === loc.hexCoord.r
    );
    if (hexIdx >= 0) world.hexes[hexIdx].locationId = dungeon.id;

    convertedCount++;
  }
  log(`  Converted ${convertedCount} landmarks to dungeons`);

  // --- Generate Canon Dungeon Layouts ---
  log("Generating canon dungeon layouts...");
  let canonGenerated = 0;
  for (const enrichment of CANON_DUNGEON_ENRICHMENTS) {
    const existing = world.locations.find(l => l.id === enrichment.id);
    if (!existing) {
      warn(`Canon dungeon not found: ${enrichment.id}`);
      continue;
    }

    // Only regenerate if the dungeon has no rooms
    const existingDungeon = existing as SpatialDungeon;
    if (existingDungeon.rooms && existingDungeon.rooms.length > 0) continue;

    const result = placeDungeon({
      seed: `obojima-canon-${enrichment.id}`,
      hexes: world.hexes,
      forceCoord: existing.hexCoord,
      forceTheme: enrichment.theme,
      size: enrichment.size,
    });
    if (!result) {
      warn(`Failed to generate canon dungeon: ${enrichment.id}`);
      continue;
    }

    const dungeon = result.dungeon as SpatialDungeon;
    // Preserve original ID and overlay canon content
    dungeon.id = enrichment.id;
    dungeon.name = existing.name;
    dungeon.description = enrichment.description;
    dungeon.tags = enrichment.tags;
    if (enrichment.npcIds) dungeon.npcIds = enrichment.npcIds;
    if (enrichment.factionId) dungeon.factionId = enrichment.factionId;

    // Apply room overrides
    if (dungeon.rooms) {
      for (const override of enrichment.roomOverrides) {
        if (override.index < dungeon.rooms.length) {
          dungeon.rooms[override.index].name = override.name;
          dungeon.rooms[override.index].description = override.description;
        }
      }
    }

    // Replace in locations array
    const locIdx = world.locations.findIndex(l => l.id === enrichment.id);
    if (locIdx >= 0) world.locations[locIdx] = dungeon;

    canonGenerated++;
  }
  log(`  Generated layouts for ${canonGenerated} canon dungeons`);

  // --- Apply Corruption Zones ---
  log("Applying corruption zones...");
  applyCorruption(world);

  // --- Link NPCs to Settlements ---
  log("Linking NPCs to settlements...");
  linkNpcsToSettlements(world);

  // --- Procedural Generation ---
  const SEED = "obojima";

  // Build roadHexes set from edges
  const roadHexes = new Set<string>();
  for (const edge of world.edges) {
    roadHexes.add(coordKey(edge.from));
    roadHexes.add(coordKey(edge.to));
  }
  log(`Road hexes: ${roadHexes.size}`);

  // Clean previously-generated procedural content (builder overwrites its own output)
  // Protect canon dungeon IDs (converted landmarks + hand-authored dungeons)
  const canonDungeonIds = new Set([
    ...LANDMARK_ENRICHMENTS.filter(e => e.dungeonConversion).map(e => e.id.replace("landmark-", "dungeon-")),
    "dungeon-sunken-town", "dungeon-coral-castle", "dungeon-crak-caves",
    "dungeon-temple-of-shoom", "dungeon-glittering-depot", "dungeon-prison-oghmai",
  ]);
  const generatedLairIds = new Set(
    world.locations.filter(l => isDungeon(l) && l.size === "lair" && !canonDungeonIds.has(l.id)).map(l => l.id)
  );
  // Also remove non-canon small dungeons from previous landmark conversions that may have stale IDs
  const nonCanonSmall = new Set(
    world.locations.filter(l => isDungeon(l) && (l.size === "lair" || l.size === "small") && !canonDungeonIds.has(l.id)).map(l => l.id)
  );
  const toRemove = new Set([...generatedLairIds, ...nonCanonSmall]);
  world.locations = world.locations.filter(l => !toRemove.has(l.id));
  // Clear hex references to removed lairs, features, dwellings
  for (const hex of world.hexes) {
    if (hex.locationId && toRemove.has(hex.locationId)) hex.locationId = undefined;
    hex.feature = undefined;
    hex.dwellingId = undefined;
    hex.questObject = undefined;
  }
  world.dwellings = [];
  log(`Cleaned procedural content: removed ${toRemove.size} old generated dungeons`);

  // Step 1: Generate hex features (ruins, shrines, etc.) — higher density for Obojima
  log("Generating hex features...");
  const featureResult = generateFeatures({ seed: SEED, hexes: world.hexes, roadHexes, density: [0.30, 0.40] });
  world.hexes = featureResult.hexes;
  log(`  Placed ${featureResult.features.length} features`);

  // Step 2: Generate dwellings near roads
  log("Generating dwellings...");
  const dwellingResult = generateDwellings({ seed: SEED, hexes: world.hexes, roadHexes });
  world.hexes = dwellingResult.hexes;
  world.dwellings = dwellingResult.dwellings;
  log(`  Placed ${dwellingResult.dwellings.length} dwellings`);

  // Step 3: Place wilderness lairs (mini-dungeons)
  log("Placing wilderness lairs...");
  let lairCount = 0;
  for (let i = 0; i < 20; i++) {
    const eligible = world.hexes.filter(h => !h.locationId);
    const result = placeWildernessLair({ seed: `${SEED}-lair-${i}`, hexes: eligible });
    if (result) {
      world.locations.push(result.dungeon);
      // Update hex with locationId
      const hexIdx = world.hexes.findIndex(
        h => h.coord.q === result.hex.coord.q && h.coord.r === result.hex.coord.r
      );
      if (hexIdx >= 0) {
        world.hexes[hexIdx] = { ...world.hexes[hexIdx], locationId: result.dungeon.id };
      }
      lairCount++;
    }
  }
  log(`  Placed ${lairCount} wilderness lairs`);

  // Step 3b: Generate quest objects (discoverable items on hexes)
  log("Generating quest objects...");
  world.hexes = generateQuestObjects({ seed: SEED, hexes: world.hexes });
  replaceQuestObjectsWithObojima(world);

  // Step 3c: Replace dungeon creatures with Obojima bestiary
  log("Replacing dungeon creatures with Obojima bestiary...");
  replaceCreaturesWithObojima(world);

  // Step 4: Generate town layouts and sites for settlements
  log("Generating town layouts...");
  const settlements = world.locations.filter(isSettlement) as Settlement[];
  for (const settlement of settlements) {
    const rng = new SeededRandom(`${SEED}-town-${settlement.id}`);

    // Generate procedural sites (merge with canon enrichment sites)
    const enrichmentSites = settlement.sites.filter(s => s.id.startsWith("site-settlement-"));
    const proceduralSites = generateSites({ seed: SEED, settlement });

    // Keep enrichment sites, fill remaining slots with procedural ones
    if (enrichmentSites.length > 0) {
      // Add procedural sites that don't duplicate enrichment site types
      const existingTypes = new Set(enrichmentSites.map(s => s.type));
      const extras = proceduralSites.filter(s => !existingTypes.has(s.type));
      settlement.sites = [...enrichmentSites, ...extras];
    } else {
      settlement.sites = proceduralSites;
    }

    // Generate spatial layout
    const layout = generateTownLayout({ size: settlement.size, sites: settlement.sites }, rng);
    Object.assign(settlement, layout);

    // Link sites to landmark buildings
    linkSitesToBuildings(settlement);

    // Assign NPCs to buildings
    const settlementNpcs = world.npcs.filter(n => n.locationId === settlement.id);
    if (settlement.npcIds.length > 0) {
      assignNPCsToBuildings(settlement, settlementNpcs);
    }
  }
  log(`  Generated layouts for ${settlements.length} settlements`);

  // Step 5: Generate rumors & notices
  log("Generating rumors and notices...");
  const dungeons = world.locations.filter(isDungeon) as Dungeon[];
  for (let i = 0; i < settlements.length; i++) {
    const settlement = settlements[i];
    const settlementNpcs = world.npcs.filter(n => n.locationId === settlement.id);

    settlement.rumors = generateRumors({
      seed: `${SEED}-rumors-${i}`,
      factions: world.factions,
      hooks: world.hooks,
      npcs: world.npcs,
      dungeons,
      settlements,
      hexes: world.hexes,
      currentSettlement: settlement,
    });

    settlement.notices = generateObojimaNotices(
      new SeededRandom(`${SEED}-notices-${i}`),
      settlement,
      settlementNpcs,
      world.factions,
      world.hooks,
    );
  }
  const totalRumors = settlements.reduce((sum, s) => sum + s.rumors.length, 0);
  const totalNotices = settlements.reduce((sum, s) => sum + s.notices.length, 0);
  log(`  Generated ${totalRumors} rumors, ${totalNotices} notices`);

  // Step 6: Fill missing NPC flavorWants
  log("Generating NPC wants...");
  generateMissingWants(world);

  // --- Generate Calendar (28 days of events/weather) ---
  log("Generating calendar...");
  const FORECAST_DAYS = 28;
  world.state.calendar = [];
  for (let d = 1; d <= FORECAST_DAYS; d++) {
    const daySeason = getSeasonFromDay(d);
    const dayWeather = generateWeather({ seed: SEED, season: daySeason, day: d });
    const dayMoonPhase = getMoonPhase(d);
    const dayEvents = generateDayEvents({ seed: SEED, day: d, world });
    world.state.calendar.push({ day: d, weather: dayWeather, moonPhase: dayMoonPhase, events: dayEvents });
  }
  world.state.forecastEndDay = FORECAST_DAYS;
  const totalEvents = world.state.calendar.reduce((s, r) => s + r.events.length, 0);
  log(`  Generated ${FORECAST_DAYS} days, ${totalEvents} events`);

  // --- Validate ---
  log("Validating cross-references...");
  const errors = validate(world);
  if (errors.length > 0) {
    console.error("\n=== VALIDATION ERRORS ===");
    for (const err of errors) {
      console.error(`  ✗ ${err}`);
    }
    console.error(`\n${errors.length} validation error(s) found.`);
  } else {
    log("All cross-references valid.");
  }

  // --- Write ---
  log(`Writing to ${OUTPUT_PATH}...`);
  writeFileSync(OUTPUT_PATH, JSON.stringify(world, null, 2), "utf-8");

  // --- Summary ---
  log("\n=== BUILD SUMMARY ===");
  log(`Hexes: ${world.hexes.length}`);
  log(`Locations: ${world.locations.length} (${world.locations.filter(l => l.type === "settlement").length} settlements, ${world.locations.filter(l => l.type === "dungeon").length} dungeons, ${world.locations.filter(l => l.type === "landmark").length} landmarks)`);
  log(`NPCs: ${world.npcs.length}`);
  log(`Factions: ${world.factions.length}`);
  log(`Hooks: ${world.hooks.length}`);
  log(`Clocks: ${world.clocks.length}`);
  log(`Companion Spirits: ${world.companionSpirits?.length ?? 0}`);
  log(`Dwellings: ${world.dwellings.length}`);
  log(`Hex features: ${world.hexes.filter(h => h.feature).length}`);
  log(`Quest objects: ${world.hexes.filter(h => h.questObject).length}`);
  log(`Corrupted hexes: ${world.hexes.filter(h => h.corruption === "corrupted").length}`);
  log(`Threatened hexes: ${world.hexes.filter(h => h.corruption === "threatened").length}`);
  log(`Edges: ${world.edges.length}`);
  log(`Rumors: ${settlements.reduce((s, set) => s + (set as Settlement).rumors.length, 0)}`);
  log(`Notices: ${settlements.reduce((s, set) => s + (set as Settlement).notices.length, 0)}`);
  log(`Calendar: ${world.state.calendar.length} days, ${world.state.calendar.reduce((s, r) => s + r.events.length, 0)} events`);
  log(`Validation errors: ${errors.length}`);
  log("Done.");
}

// ============================================================
// Settlement Enrichment
// ============================================================

function enrichSettlements(world: WorldData) {
  const settlementMap = new Map<string, Settlement>();
  for (const loc of world.locations) {
    if (loc.type === "settlement") {
      settlementMap.set(loc.id, loc as Settlement);
    }
  }

  let enriched = 0;
  for (const enrichment of SETTLEMENT_ENRICHMENTS) {
    const settlement = settlementMap.get(enrichment.id);
    if (!settlement) {
      warn(`Settlement enrichment ID not found in world: ${enrichment.id}`);
      continue;
    }

    // Only overwrite TBD/empty values
    if (settlement.trouble === "TBD" || !settlement.trouble) {
      settlement.trouble = enrichment.trouble;
    }
    if (settlement.quirk === "TBD" || !settlement.quirk) {
      settlement.quirk = enrichment.quirk;
    }

    // Add sensory impressions if settlement doesn't have them
    if (!settlement.sensoryImpressions || settlement.sensoryImpressions.length === 0) {
      (settlement as Settlement & { sensoryImpressions: string[] }).sensoryImpressions =
        enrichment.sensoryImpressions;
    }

    // Always apply known sites from enrichment data
    if (enrichment.knownSites.length > 0) {
      settlement.sites = enrichment.knownSites.map((site, i) => ({
        id: `site-${enrichment.id}-${i}`,
        name: site.name ?? "Unknown Site",
        type: site.type ?? "general_store",
        description: site.description ?? "",
        npcIds: site.npcIds ?? [],
        staffIds: [],
        services: [],
        rumorSource: site.type === "tavern" || site.type === "inn",
        noticeBoard: site.type === "tavern" || site.type === "guild_hall",
      }));
    }

    enriched++;
  }
  log(`  Enriched ${enriched}/${SETTLEMENT_ENRICHMENTS.length} settlements`);
}

// ============================================================
// Corruption Zones
// ============================================================

function applyCorruption(world: WorldData) {
  const corruptionMap = buildCorruptionMap();
  let corrupted = 0;
  let threatened = 0;

  for (const hex of world.hexes) {
    const key = `${hex.coord.q},${hex.coord.r}`;
    const level = corruptionMap.get(key);
    if (level) {
      hex.corruption = level;
      if (level === "corrupted") corrupted++;
      else threatened++;
    }
  }
  log(`  Applied corruption: ${corrupted} corrupted, ${threatened} threatened`);
}

// ============================================================
// Link NPCs to Settlements
// ============================================================

function linkNpcsToSettlements(world: WorldData) {
  // Build NPC -> locationId map
  const npcsByLocation = new Map<string, string[]>();
  for (const npc of world.npcs) {
    if (npc.locationId) {
      const existing = npcsByLocation.get(npc.locationId) ?? [];
      existing.push(npc.id);
      npcsByLocation.set(npc.locationId, existing);
    }
  }

  // Assign to settlements
  let linked = 0;
  for (const loc of world.locations) {
    if (loc.type === "settlement") {
      const settlement = loc as Settlement;
      const npcIds = npcsByLocation.get(settlement.id);
      if (npcIds && npcIds.length > 0) {
        settlement.npcIds = npcIds;
        linked += npcIds.length;
      }
    }
  }
  log(`  Linked ${linked} NPCs to settlements`);
}

// ============================================================
// Obojima Notice Board Generator
// ============================================================


interface NoticeTemplate {
  title: string;
  description: string;
  noticeType: Notice["noticeType"];
  reward?: string;
}

// Faction-specific job postings that feel like the faction wrote them
const FACTION_NOTICES: Record<string, NoticeTemplate[]> = {
  "faction-obojima-mariners-guild": [
    { title: "DIVERS WANTED", description: "Experienced swimmers needed for salvage work in the Shallows. Dangerous currents — Corruption-resistant gear provided. Report to the Coastal Divers' Lodge.", noticeType: "job", reward: "Fair share of salvage" },
    { title: "COASTAL SURVEY", description: "The Guild seeks volunteers to map tidal changes along the southern coast. Three-day expedition. Boat and provisions supplied.", noticeType: "job", reward: "15 Gold Flowers" },
    { title: "SUBMARINE PARTS", description: "Seeking anyone with knowledge of First Age machinery or underwater breathing apparatus. Discretion appreciated.", noticeType: "request" },
  ],
  "faction-obojima-courier-brigade": [
    { title: "COURIER RUNNERS NEEDED", description: "Fast feet wanted for eastern route deliveries. Route passes through threatened territory — hazard pay included. Must outrun a heron.", noticeType: "job", reward: "8 Gold Flowers per run" },
    { title: "RELAY STATION BUILDERS", description: "Volunteers needed to help construct a new postal relay east of the wetlands. Carpentry skills preferred.", noticeType: "job", reward: "20 Gold Flowers + meals" },
    { title: "LOST MAILBAG", description: "A courier's satchel went missing between Toggle and the Gale Fields. Contents include sealed letters — DO NOT OPEN. Reward for safe return.", noticeType: "request", reward: "12 Gold Flowers" },
  ],
  "faction-obojima-aha": [
    { title: "EXPEDITION ESCORTS", description: "AHA researchers require armed escort into subway tunnels beneath Yatamon. Three-day survey. Previous underground experience preferred.", noticeType: "job", reward: "25 Gold Flowers" },
    { title: "ARTIFACT IDENTIFICATION", description: "First Age objects recovered from recent dig. Seeking anyone with knowledge of old scripts or spirit-touched materials. Visit AHA headquarters.", noticeType: "request" },
    { title: "FIELD ASSISTANTS", description: "Archaeologists need help cataloguing ruins in the Brackwater region. Waterproof boots essential. Corruption-resistance a plus.", noticeType: "job", reward: "10 Gold Flowers/day" },
  ],
  "faction-obojima-rangers": [
    { title: "CORRUPTION WATCH", description: "The Greenward Path seeks able bodies to patrol the wetland boundary. Report any Corruption spread, mutated creatures, or unusual plant growth.", noticeType: "job", reward: "5 Gold Flowers/day" },
    { title: "CREATURE SIGHTING REPORTS", description: "Rangers request all travelers report unusual creature behavior east of the Gale Fields. Leave reports at any Ranger waystation.", noticeType: "announcement" },
    { title: "TRACKER NEEDED", description: "Something large has been moving through the forest at night. Experienced tracker needed to identify the creature and assess the threat.", noticeType: "job", reward: "18 Gold Flowers" },
  ],
  "faction-obojima-dawn-blossom": [
    { title: "COUNTERFEIT ALERT", description: "Fake Gold Flowers have been circulating. Check your coins — counterfeits are slightly lighter and the blossom stamp is off-center. Report fakes to Dawn Blossom.", noticeType: "warning" },
    { title: "TRADE CARAVAN GUARD", description: "Guards needed for merchant caravan heading north. Good pay, hot meals. Sword skills required, spirit companions welcome.", noticeType: "job", reward: "20 Gold Flowers" },
    { title: "MISSING LEDGER", description: "An accounting ledger was lost during last week's storm. Green leather cover, brass clasp. No questions asked.", noticeType: "request", reward: "8 Gold Flowers" },
  ],
  "faction-obojima-fish-head-coven": [
    { title: "RARE INGREDIENTS SOUGHT", description: "The Coven purchases unusual botanical specimens, spirit residues, and Corruption samples (properly sealed). Bring to the nearest hedgerow witch.", noticeType: "request", reward: "Varies — potions or coin" },
    { title: "HEDGEROW MAINTENANCE", description: "Help needed repairing spirit wards along the western boundary. No magic ability required — just strong arms and steady nerves.", noticeType: "job", reward: "Protective charm + 5 Gold Flowers" },
  ],
  "faction-obojima-lom-salt": [
    { title: "SPARRING PARTNERS WANTED", description: "Lom & Salt's College of Arms welcomes visiting swordspeople for open sparring. All styles. Bruises guaranteed, honor optional.", noticeType: "announcement" },
    { title: "RARE METALS SOUGHT", description: "The forge seeks First Age alloys and unusual ores. Bring samples to Forge Keeper Duro for assessment. Top prices paid.", noticeType: "request", reward: "Market price + bonus" },
  ],
  "faction-obojima-goro-goros": [
    { title: "ODD JOBS — NO QUESTIONS", description: "Quick work for quick coin. Discreet individuals only. Ask for Tatsu at the usual place.", noticeType: "job", reward: "Depends on the job" },
  ],
  "faction-obojima-crowsworn": [
    { title: "CORRUPTION SAMPLES NEEDED", description: "Sealed samples of Corruption-tainted water or soil needed for alchemical research. Must be collected fresh. Proper containment vessels provided.", noticeType: "request", reward: "15 Gold Flowers per sample" },
    { title: "POTION TESTERS", description: "Volunteers needed to test experimental resistance tonics. Side effects may include mild nausea and temporary color blindness. Compensation provided.", noticeType: "job", reward: "10 Gold Flowers + free potion" },
  ],
};

// Generic Obojima-themed notices for variety
const OBOJIMA_GENERIC_NOTICES: NoticeTemplate[] = [
  { title: "SPIRIT SHRINE DAMAGED", description: "The wayshrine on the eastern road has been vandalized. Stonemason or anyone with spirit-mending skills please respond.", noticeType: "request", reward: "Community gratitude + hot meal" },
  { title: "MISSING TRAVELERS", description: "Two merchants have not arrived from the eastern settlements. Last seen on the Brackwater road. Any information welcome.", noticeType: "warning" },
  { title: "SWORD TOURNAMENT", description: "Open tournament at month's end. All sword styles welcome. Entry fee: 2 Gold Flowers. Winner takes the pot and a master-forged blade.", noticeType: "announcement" },
  { title: "CREATURE BOUNTY", description: "Corrupted beast spotted near the fields. Livestock killed. Armed volunteers needed to track and eliminate the threat.", noticeType: "bounty", reward: "25 Gold Flowers" },
  { title: "FESTIVAL PREPARATIONS", description: "Volunteers needed for the upcoming spirit festival. Lantern-makers, musicians, and cooks especially welcome.", noticeType: "announcement" },
  { title: "BOAT REPAIR", description: "Experienced carpenter needed for hull repair. Vessel beached south of town. Materials provided.", noticeType: "job", reward: "12 Gold Flowers" },
  { title: "MUSHROOM WARNING", description: "Do NOT eat the blue-spotted mushrooms growing near the wetland edge. Three people already sick. Healer says they're Corruption-tainted.", noticeType: "warning" },
  { title: "ESCORT REQUEST", description: "Elderly pilgrim seeks escort to the mountain shrine. Slow pace, safe route preferred. Will pay upon arrival.", noticeType: "request", reward: "10 Gold Flowers" },
  { title: "NIGHT WATCH VOLUNTEERS", description: "Strange sounds reported after dark. Town watch seeks extra eyes for the next week. Lanterns and whistles provided.", noticeType: "job", reward: "3 Gold Flowers/night" },
  { title: "LOST SPIRIT COMPANION", description: "Small fire spirit — looks like a glowing fox. Answers to Kiri. Last seen near the market. Please do not attempt to capture.", noticeType: "request", reward: "5 Gold Flowers" },
  { title: "WELL WATER ADVISORY", description: "The eastern well tastes strange. Avoid until tested. Use the market fountain instead.", noticeType: "warning" },
  { title: "HERBALIST NEEDED", description: "Village healer overwhelmed. Anyone with knowledge of medicinal plants or spirit remedies please come forward.", noticeType: "request" },
  { title: "ROAD CLEARING", description: "Fallen trees blocking the north road after last storm. Bring axes. Lunch provided by the inn.", noticeType: "job", reward: "5 Gold Flowers + lunch" },
  { title: "MAPS PURCHASED", description: "Traveler purchasing hand-drawn maps of routes east of the wetlands. Accuracy valued — fair prices for good cartography.", noticeType: "request", reward: "Varies" },
  { title: "FISH FOLK SIGHTING", description: "Armed fish folk spotted near the coast at dawn. Travelers should move in groups and stay on marked paths.", noticeType: "warning" },
];

function generateObojimaNotices(
  rng: SeededRandom,
  settlement: Settlement,
  npcs: NPC[],
  factions: Faction[],
  hooks: Hook[],
): Notice[] {
  const notices: Notice[] = [];
  const count = settlement.size === "city" ? 6
    : settlement.size === "town" ? 4
    : settlement.size === "village" ? 3
    : 2;

  // Find a contact NPC for notices that need one
  const findContact = (): NPC | undefined => {
    if (npcs.length === 0) return undefined;
    return rng.pick(npcs);
  };

  // Priority 1: Faction-specific notices from factions present in this settlement
  const presentFactionIds = new Set<string>();
  for (const npc of npcs) {
    if (npc.factionId) presentFactionIds.add(npc.factionId);
  }
  for (const faction of factions) {
    if (faction.headquartersId === settlement.id ||
        faction.territoryIds.includes(settlement.id) ||
        faction.influenceIds.includes(settlement.id)) {
      presentFactionIds.add(faction.id);
    }
  }

  for (const factionId of presentFactionIds) {
    if (notices.length >= count) break;
    const templates = FACTION_NOTICES[factionId];
    if (!templates || templates.length === 0) continue;

    const tmpl = rng.pick(templates);
    const contact = npcs.find(n => n.factionId === factionId) ?? findContact();
    notices.push({
      id: `notice-${settlement.id}-${notices.length}`,
      title: tmpl.title,
      description: tmpl.description,
      noticeType: tmpl.noticeType,
      reward: tmpl.reward,
      posterId: contact?.id,
    });
  }

  // Priority 2: Hook-linked notices
  const localHooks = hooks.filter(h =>
    h.sourceSettlementId === settlement.id ||
    h.involvedLocationIds?.includes(settlement.id)
  );
  for (const hook of localHooks) {
    if (notices.length >= count) break;
    const contact = hook.sourceNpcId
      ? npcs.find(n => n.id === hook.sourceNpcId)
      : findContact();
    notices.push({
      id: `notice-${settlement.id}-hook-${notices.length}`,
      title: "HELP WANTED",
      description: hook.rumor.length > 80
        ? hook.rumor.slice(0, 80) + "... Ask around for details."
        : hook.rumor + " Inquire locally.",
      noticeType: "job",
      linkedHookId: hook.id,
      posterId: contact?.id,
    });
  }

  // Fill remaining with generic Obojima notices
  const used = new Set<number>();
  while (notices.length < count) {
    let idx: number;
    let attempts = 0;
    do {
      idx = rng.between(0, OBOJIMA_GENERIC_NOTICES.length - 1);
      attempts++;
    } while (used.has(idx) && attempts < 20);
    used.add(idx);

    const tmpl = OBOJIMA_GENERIC_NOTICES[idx];
    const contact = findContact();
    notices.push({
      id: `notice-${settlement.id}-gen-${notices.length}`,
      title: tmpl.title,
      description: tmpl.description,
      noticeType: tmpl.noticeType,
      reward: tmpl.reward,
      posterId: contact?.id,
    });
  }

  return notices;
}

// ============================================================
// Dungeon Creature Replacement
// ============================================================

// Underwater dungeons should use sea creatures regardless of theme
const CREATURE_POOL_OVERRIDES: Record<string, string[]> = {
  "dungeon-coral-castle": OBOJIMA_DUNGEON_CREATURES.sea_cave,
  "dungeon-sunken-town": OBOJIMA_DUNGEON_CREATURES.sea_cave,
};

function replaceCreaturesWithObojima(world: WorldData) {
  const rng = new SeededRandom("obojima-creatures");
  let dungeonCount = 0;
  let creatureCount = 0;

  for (const loc of world.locations) {
    if (loc.type !== "dungeon") continue;
    const dungeon = loc as SpatialDungeon;
    const pool = CREATURE_POOL_OVERRIDES[dungeon.id] ?? OBOJIMA_DUNGEON_CREATURES[dungeon.theme];
    if (!pool || pool.length === 0) continue;

    dungeonCount++;

    // Replace wandering monster table entries
    if (dungeon.wanderingMonsters) {
      for (const entry of dungeon.wanderingMonsters.entries) {
        entry.creatureType = rng.pick(pool);
        creatureCount++;
      }
    }

    // Replace room encounter creature types
    if (dungeon.rooms) {
      for (const room of dungeon.rooms) {
        if (room.encounters) {
          for (const encounter of room.encounters) {
            encounter.creatureType = rng.pick(pool);
            creatureCount++;
          }
        }
      }
    }
  }

  log(`  Replaced ${creatureCount} creature references across ${dungeonCount} dungeons`);
}

// ============================================================
// Quest Object Replacement
// ============================================================

function replaceQuestObjectsWithObojima(world: WorldData) {
  const rng = new SeededRandom("obojima-quest-objects");
  let replaced = 0;

  for (const hex of world.hexes) {
    if (!hex.questObject) continue;

    const type = hex.questObject.type;
    const names = OBOJIMA_QUEST_NAMES[type];
    const descs = OBOJIMA_QUEST_DESCRIPTIONS[type];
    if (!names || !descs) continue;

    hex.questObject.name = rng.pick(names);
    hex.questObject.description = rng.pick(descs);
    replaced++;
  }

  log(`  Placed ${replaced} quest objects (Obojima-themed)`);
}

// ============================================================
// NPC Want Generation
// ============================================================

const WANT_TEMPLATES_BY_ROLE: Record<string, string[]> = {
  merchant: [
    "Find a reliable supplier for rare goods",
    "Recover stolen merchandise from bandits",
    "Establish a new trade route to the east",
    "Locate a missing shipment lost in the wetlands",
  ],
  innkeeper: [
    "Track down the source of bad ale ruining business",
    "Find entertainment for the upcoming festival",
    "Evict something living in the cellar",
    "Recover a family recipe stolen by a rival",
  ],
  guard: [
    "Investigate disappearances on the night watch",
    "Find proof of corruption in the guard ranks",
    "Clear out a monster den threatening patrols",
    "Escort a VIP through dangerous territory",
  ],
  scholar: [
    "Recover a lost text from a dangerous ruin",
    "Find someone who can translate ancient inscriptions",
    "Gather rare specimens from the Corruption zone",
    "Map unexplored tunnels beneath the city",
  ],
  priest: [
    "Purify a corrupted shrine in the wilderness",
    "Find a missing pilgrim who never arrived",
    "Gather sacred herbs from a dangerous location",
    "Investigate reports of undead near a burial ground",
  ],
  artisan: [
    "Acquire rare materials from a dangerous source",
    "Find an apprentice worthy of the craft",
    "Recover ancestral tools stolen by thieves",
    "Deliver a masterwork to a distant patron",
  ],
  sailor: [
    "Chart safe passage through corrupted waters",
    "Salvage cargo from a recent shipwreck",
    "Find the source of strange lights at sea",
    "Recruit crew for a dangerous expedition",
  ],
  default: [
    "Find a cure for a friend's mysterious illness",
    "Deliver an urgent message to a distant settlement",
    "Recover a family heirloom from a dangerous ruin",
    "Investigate strange sounds coming from the wilds",
    "Escort travelers safely through corrupted territory",
    "Gather rare ingredients from a hard-to-reach place",
    "Track down someone who owes a significant debt",
    "Investigate why shipments keep going missing",
    "Find safe shelter for refugees from the east",
    "Locate a missing person last seen on the road",
    "Clear vermin from a building or mine",
    "Retrieve something dropped in a dangerous area",
  ],
};

function generateMissingWants(world: WorldData) {
  const rng = new SeededRandom("obojima-wants");
  let filled = 0;

  for (const npc of world.npcs) {
    if (npc.flavorWant) continue;

    // Pick from role-specific or default templates
    const roleKey = npc.role ?? "default";
    const templates = WANT_TEMPLATES_BY_ROLE[roleKey] ?? WANT_TEMPLATES_BY_ROLE.default;
    npc.flavorWant = rng.pick(templates);
    filled++;
  }
  log(`  Filled ${filled} missing NPC wants`);
}

// ============================================================
// Validation
// ============================================================

function validate(world: WorldData): string[] {
  const errors: string[] = [];

  // Build lookup sets
  const locationIds = new Set(world.locations.map(l => l.id));
  const npcIds = new Set(world.npcs.map(n => n.id));
  const factionIds = new Set(world.factions.map(f => f.id));
  const hexKeys = new Set(world.hexes.map(h => `${h.coord.q},${h.coord.r}`));

  // Validate NPC references
  for (const npc of world.npcs) {
    if (npc.locationId && !locationIds.has(npc.locationId)) {
      errors.push(`NPC ${npc.id} references unknown location: ${npc.locationId}`);
    }
    if (npc.factionId && !factionIds.has(npc.factionId)) {
      errors.push(`NPC ${npc.id} references unknown faction: ${npc.factionId}`);
    }
  }

  // Validate faction references
  for (const faction of world.factions) {
    if (faction.headquartersId && !locationIds.has(faction.headquartersId)) {
      errors.push(`Faction ${faction.id} references unknown HQ: ${faction.headquartersId}`);
    }
  }

  // Validate hook references
  for (const hook of world.hooks) {
    if (hook.sourceNpcId && !npcIds.has(hook.sourceNpcId)) {
      errors.push(`Hook ${hook.id} references unknown source NPC: ${hook.sourceNpcId}`);
    }
    if (hook.targetNpcId && !npcIds.has(hook.targetNpcId)) {
      errors.push(`Hook ${hook.id} references unknown target NPC: ${hook.targetNpcId}`);
    }
    if (hook.sourceSettlementId && !locationIds.has(hook.sourceSettlementId)) {
      errors.push(`Hook ${hook.id} references unknown source settlement: ${hook.sourceSettlementId}`);
    }
    if (hook.targetLocationId && !locationIds.has(hook.targetLocationId)) {
      errors.push(`Hook ${hook.id} references unknown target location: ${hook.targetLocationId}`);
    }
    if (hook.sourceFactionId && !factionIds.has(hook.sourceFactionId)) {
      errors.push(`Hook ${hook.id} references unknown source faction: ${hook.sourceFactionId}`);
    }
    if (hook.targetFactionId && !factionIds.has(hook.targetFactionId)) {
      errors.push(`Hook ${hook.id} references unknown target faction: ${hook.targetFactionId}`);
    }
  }

  // Validate clock references
  for (const clock of world.clocks) {
    if (clock.ownerId && clock.ownerType === "faction" && !factionIds.has(clock.ownerId)) {
      errors.push(`Clock ${clock.id} references unknown faction: ${clock.ownerId}`);
    }
  }

  // Validate companion spirit references
  if (world.companionSpirits) {
    for (const spirit of world.companionSpirits) {
      if (spirit.bondedNpcId && !npcIds.has(spirit.bondedNpcId)) {
        errors.push(`Spirit ${spirit.id} references unknown bonded NPC: ${spirit.bondedNpcId}`);
      }
      if (spirit.locationId && !locationIds.has(spirit.locationId)) {
        errors.push(`Spirit ${spirit.id} references unknown location: ${spirit.locationId}`);
      }
    }
  }

  // Validate locations have valid hex coords
  for (const loc of world.locations) {
    const key = `${loc.hexCoord.q},${loc.hexCoord.r}`;
    if (!hexKeys.has(key)) {
      errors.push(`Location ${loc.id} at ${key} has no corresponding hex`);
    }
  }

  return errors;
}

// ============================================================
// Run
// ============================================================

main();
