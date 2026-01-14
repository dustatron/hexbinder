import { nanoid } from "nanoid";
import type {
  DayEvent,
  WorldData,
  Clock,
  Faction,
  WeatherState,
  TerrainType,
} from "~/models";
import { SeededRandom } from "./SeededRandom";
import { generateWeather, getSeasonFromDay } from "./WeatherGenerator";

// === Rumor Text Templates ===

const RUMOR_TEXTS = [
  "Strange lights in the {terrain}",
  "Caravan missing, {direction} road",
  "Travelers fleeing {location}",
  "Bounty raised on {creature}",
  "Treasure rumored near {location}",
  "Smoke rising from the {direction}",
  "Merchants avoiding {direction} road",
  "Extra patrols near {location}",
  "Stranger asking about {subject}",
  "{goods} prices spiking",
];

const DIRECTIONS = ["north", "south", "east", "west", "northeast", "northwest"];
const TERRAINS = ["forest", "hills", "swamp", "mountains", "plains"];
const CREATURES = ["wolves", "bandits", "goblins", "undead", "trolls", "orcs"];
const SUBJECTS = ["the old ruins", "the abandoned mine", "the tower", "travelers", "the mayor"];
const GOODS = ["iron", "salt", "horses", "grain", "weapons", "potions"];
const LOCATIONS = ["the crossroads", "the old mill", "the eastern hills", "the forest edge", "the swamp"];

// === Encounter Sighting Templates ===

const SIGHTING_TEMPLATES = [
  "{creature} spotted near {location}",
  "{behavior} {creature} on {direction} road",
  "{count} {creature} heading to {location}",
  "{creature} tracks near {location}",
];

const BEHAVIORS = ["wounded", "hunting", "roaming", "aggressive", "fleeing"];
const COUNTS = ["a lone", "a pair of", "a small group of", "several"];

// === Settlement Event Templates ===

const SETTLEMENT_EVENTS = [
  "Harvest festival in {settlement}",
  "Market day in {settlement}",
  "Parade in {settlement}",
  "Wedding in {settlement}",
  "Town meeting in {settlement}",
  "Performers in {settlement}",
  "Temple ceremony in {settlement}",
  "Tavern competition in {settlement}",
  "Foreign merchants arrive at {settlement}",
  "Funeral in {settlement}",
];

// === Faction Activity Templates (by faction type) ===

const FACTION_ACTIVITIES: Record<string, string[]> = {
  cult: [
    "{faction} conducts dark ritual",
    "{faction} spotted near {location}",
    "{faction} recruiting acolytes",
    "Chanting heard from {faction}",
    "{faction} holds {moon} moon rite",
  ],
  militia: [
    "{faction} training near {settlement}",
    "{faction} increases patrols",
    "{faction} recruiting in {settlement}",
    "{faction} inspecting defenses",
    "{faction} escorting shipment",
  ],
  syndicate: [
    "{faction} collecting fees in {settlement}",
    "{faction} making deals",
    "{faction} expanding operations",
    "{faction} rival beaten in {settlement}",
    "{faction} meeting with crime lords",
  ],
  guild: [
    "{faction} taking apprentices",
    "{faction} displaying wares",
    "{faction} negotiating in {settlement}",
    "{faction} seeking materials",
    "{faction} project completed",
  ],
  tribe: [
    "{faction} scouts in wilderness",
    "{faction} ceremony underway",
    "{faction} hunting in {terrain}",
    "{faction} seeks parley",
    "{faction} war drums heard",
  ],
};

// === Arrival Event Templates ===

const ARRIVAL_EVENTS = [
  "Stranger arrives in {settlement}",
  "Wounded traveler reaches {settlement}",
  "Caravan from {direction} at {settlement}",
  "Adventurers pass through {settlement}",
  "Royal messenger in {settlement}",
  "Refugees from {danger} at {settlement}",
  "{profession} visits {settlement}",
];

const PROFESSIONS = ["healer", "sage", "bard", "knight", "wizard", "merchant prince"];
const DANGERS = ["bandits", "monsters", "a fire", "flooding", "plague", "war"];

// === World Events (Rare, Major) ===

const WORLD_EVENTS = [
  // Natural disasters
  "Earthquake damages {settlement}",
  "Hurricane hits the {terrain}",
  "Flood near {location}",
  "Wildfire in {terrain}",
  "Landslide near {location}",
  "Sinkhole opens near {settlement}",

  // Celestial events
  "Solar eclipse",
  "Meteor crashes in {terrain}",
  "Strange aurora sighted",
  "Comet appears",
  "Ominous star alignment",

  // Magical phenomena
  "Wild magic surge",
  "Spirits seen in {settlement}",
  "Ancient ward fails",
  "Creatures fleeing {direction}",
  "Magic fails temporarily",

  // Political/Social upheaval
  "War declared nearby",
  "Plague in {settlement}",
  "Controversial decree issued",
  "Refugees flooding in",
  "Dragon over {settlement}",
];

export interface DayEventGeneratorOptions {
  seed: string;
  day: number;
  world: WorldData;
}

/**
 * Generate events for a given day.
 * Checks clocks, weather changes, rumors, and encounter sightings.
 */
export function generateDayEvents(options: DayEventGeneratorOptions): DayEvent[] {
  const { seed, day, world } = options;
  const rng = new SeededRandom(`${seed}-day-events-${day}`);
  const events: DayEvent[] = [];

  // 1. Check clocks for time-based ticks
  const clockEvents = checkClockTicks(world.clocks, world.factions, day);
  events.push(...clockEvents);

  // 2. Generate weather change event if weather differs from previous day
  const weatherEvent = checkWeatherChange(seed, day, world);
  if (weatherEvent) {
    events.push(weatherEvent);
  }

  // 3. Generate settlement event (30% chance)
  if (rng.chance(0.30)) {
    const settlementEvent = generateSettlementEvent(rng, world);
    if (settlementEvent) events.push(settlementEvent);
  }

  // 4. Generate faction activity (40% chance per faction, max 2)
  let factionEventCount = 0;
  for (const faction of world.factions) {
    if (factionEventCount >= 2) break;
    if (rng.chance(0.40)) {
      const factionEvent = generateFactionActivity(rng, world, faction);
      if (factionEvent) {
        events.push(factionEvent);
        factionEventCount++;
      }
    }
  }

  // 5. Generate arrival event (20% chance)
  if (rng.chance(0.20)) {
    const arrivalEvent = generateArrivalEvent(rng, world);
    if (arrivalEvent) events.push(arrivalEvent);
  }

  // 6. Generate 0-1 random rumor events (25% chance)
  if (rng.chance(0.25)) {
    events.push(generateRumorEvent(rng, world));
  }

  // 7. Generate 0-1 random encounter sighting events (15% chance)
  if (rng.chance(0.15)) {
    events.push(generateEncounterSighting(rng, world));
  }

  // 8. Generate world event (5% chance - rare but impactful)
  if (rng.chance(0.05)) {
    const worldEvent = generateWorldEvent(rng, world);
    if (worldEvent) events.push(worldEvent);
  }

  return events;
}

/**
 * Check clocks for time-based ticks.
 */
function checkClockTicks(clocks: Clock[], factions: Faction[], day: number): DayEvent[] {
  const events: DayEvent[] = [];

  for (const clock of clocks) {
    // Skip paused or completed clocks
    if (clock.paused || clock.completedAt !== undefined) continue;

    // Only check time-triggered clocks
    if (clock.trigger.type !== "time") continue;

    const { daysPerTick } = clock.trigger;
    if (day % daysPerTick === 0) {
      // Find faction name if clock is faction-owned
      let factionName = "an unknown force";
      if (clock.ownerType === "faction" && clock.ownerId) {
        const faction = factions.find((f) => f.id === clock.ownerId);
        if (faction) {
          factionName = faction.name;
        }
      }

      events.push({
        id: `event-${nanoid(8)}`,
        type: "clock_tick",
        description: `The ${factionName}'s plans advance...`,
        linkedClockId: clock.id,
        linkedFactionId: clock.ownerType === "faction" ? clock.ownerId : undefined,
      });
    }
  }

  return events;
}

/**
 * Check if weather changed from previous day.
 */
function checkWeatherChange(
  seed: string,
  day: number,
  world: WorldData
): DayEvent | null {
  if (day <= 1) return null;

  const currentSeason = getSeasonFromDay(day);
  const previousSeason = getSeasonFromDay(day - 1);

  const currentWeather = generateWeather({ seed, season: currentSeason, day });
  const previousWeather = generateWeather({ seed, season: previousSeason, day: day - 1 });

  if (currentWeather.condition !== previousWeather.condition) {
    return {
      id: `event-${nanoid(8)}`,
      type: "weather_change",
      description: `The weather shifts to ${formatWeatherCondition(currentWeather.condition)}`,
    };
  }

  return null;
}

/**
 * Format weather condition for display.
 */
function formatWeatherCondition(condition: string): string {
  return condition.replace(/_/g, " ");
}

/**
 * Generate a random rumor event.
 */
function generateRumorEvent(rng: SeededRandom, world: WorldData): DayEvent {
  const template = rng.pick(RUMOR_TEXTS);

  // Try to use actual location names from world if available
  const locationNames = world.locations.map((l) => l.name);
  const location = locationNames.length > 0
    ? rng.pick(locationNames)
    : rng.pick(LOCATIONS);

  const text = template
    .replace("{terrain}", rng.pick(TERRAINS))
    .replace("{direction}", rng.pick(DIRECTIONS))
    .replace("{location}", location)
    .replace("{creature}", rng.pick(CREATURES))
    .replace("{subject}", rng.pick(SUBJECTS))
    .replace("{goods}", rng.pick(GOODS));

  return {
    id: `event-${nanoid(8)}`,
    type: "rumor",
    description: text,
  };
}

/**
 * Generate an encounter sighting event.
 */
function generateEncounterSighting(rng: SeededRandom, world: WorldData): DayEvent {
  const template = rng.pick(SIGHTING_TEMPLATES);

  // Try to use actual location names from world if available
  const locationNames = world.locations.map((l) => l.name);
  const location = locationNames.length > 0
    ? rng.pick(locationNames)
    : rng.pick(LOCATIONS);

  const creature = rng.pick(CREATURES);

  const text = template
    .replace("{creature}", creature)
    .replace("{location}", location)
    .replace("{direction}", rng.pick(DIRECTIONS))
    .replace("{behavior}", rng.pick(BEHAVIORS))
    .replace("{count}", rng.pick(COUNTS));

  return {
    id: `event-${nanoid(8)}`,
    type: "encounter",
    description: text,
  };
}

/**
 * Generate a settlement event (festival, market, parade, etc.)
 */
function generateSettlementEvent(rng: SeededRandom, world: WorldData): DayEvent | null {
  const settlements = world.locations.filter((l) => l.type === "settlement");
  if (settlements.length === 0) return null;

  const settlement = rng.pick(settlements);
  const template = rng.pick(SETTLEMENT_EVENTS);

  const text = template.replace("{settlement}", settlement.name);

  return {
    id: `event-${nanoid(8)}`,
    type: "arrival", // Using arrival type for settlement events
    description: text,
    linkedLocationId: settlement.id,
  };
}

/**
 * Generate a faction activity event based on faction type.
 */
function generateFactionActivity(
  rng: SeededRandom,
  world: WorldData,
  faction: Faction
): DayEvent | null {
  const templates = FACTION_ACTIVITIES[faction.factionType];
  if (!templates || templates.length === 0) return null;

  const template = rng.pick(templates);
  const settlements = world.locations.filter((l) => l.type === "settlement");
  const settlement = settlements.length > 0 ? rng.pick(settlements) : null;
  const locationNames = world.locations.map((l) => l.name);
  const location = locationNames.length > 0 ? rng.pick(locationNames) : rng.pick(LOCATIONS);

  const moonLabels: Record<string, string> = {
    new: "new",
    waxing: "waxing",
    full: "full",
    waning: "waning",
  };

  const text = template
    .replace("{faction}", faction.name)
    .replace("{settlement}", settlement?.name || "a nearby settlement")
    .replace("{location}", location)
    .replace("{terrain}", rng.pick(TERRAINS))
    .replace("{moon}", moonLabels[world.state.moonPhase] || "dark");

  return {
    id: `event-${nanoid(8)}`,
    type: "clock_tick", // Using clock_tick for faction activities
    description: text,
    linkedFactionId: faction.id,
  };
}

/**
 * Generate an arrival event (stranger, caravan, messenger, etc.)
 */
function generateArrivalEvent(rng: SeededRandom, world: WorldData): DayEvent | null {
  const settlements = world.locations.filter((l) => l.type === "settlement");
  if (settlements.length === 0) return null;

  const settlement = rng.pick(settlements);
  const template = rng.pick(ARRIVAL_EVENTS);

  const text = template
    .replace("{settlement}", settlement.name)
    .replace("{direction}", rng.pick(DIRECTIONS))
    .replace("{danger}", rng.pick(DANGERS))
    .replace("{profession}", rng.pick(PROFESSIONS));

  return {
    id: `event-${nanoid(8)}`,
    type: "arrival",
    description: text,
    linkedLocationId: settlement.id,
  };
}

/**
 * Generate a major world event (natural disaster, celestial event, etc.)
 */
function generateWorldEvent(rng: SeededRandom, world: WorldData): DayEvent | null {
  const template = rng.pick(WORLD_EVENTS);

  const settlements = world.locations.filter((l) => l.type === "settlement");
  const settlement = settlements.length > 0 ? rng.pick(settlements) : null;
  const locationNames = world.locations.map((l) => l.name);
  const location = locationNames.length > 0 ? rng.pick(locationNames) : rng.pick(LOCATIONS);

  const text = template
    .replace("{settlement}", settlement?.name || "the region")
    .replace("{location}", location)
    .replace("{terrain}", rng.pick(TERRAINS))
    .replace("{direction}", rng.pick(DIRECTIONS));

  return {
    id: `event-${nanoid(8)}`,
    type: "weather_change", // Using weather_change for world events (catastrophic)
    description: text,
    linkedLocationId: settlement?.id,
  };
}
