/**
 * SettlementHistoryGenerator - Creates founding story, major events, and cultural notes for settlements.
 * Mirrors the dungeon history pattern for consistent lore depth.
 */

import type { SettlementSize, SettlementHistory, FounderType, SettlementAge } from "~/models";
import { SeededRandom } from "../SeededRandom";
import {
  FOUNDER_TABLE,
  AGE_DISTRIBUTION,
  MAJOR_EVENTS,
  CULTURAL_NOTES,
  FORMER_NAME_PREFIXES,
  FORMER_NAME_SUFFIXES,
  SENSORY_SIGHTS,
  SENSORY_SOUNDS,
  SENSORY_SMELLS,
  type FounderEntry,
} from "~/data/settlements/history-tables";

export interface SettlementHistoryOptions {
  seed: string;
  size: SettlementSize;
  name: string; // Current settlement name
}

/**
 * Pick a weighted entry from a table.
 */
function pickWeighted<T extends { weight: number }>(rng: SeededRandom, table: T[]): T {
  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng.next() * totalWeight;

  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }

  return table[table.length - 1];
}

/**
 * Generate the settlement's age based on size.
 */
function generateAge(rng: SeededRandom, size: SettlementSize): SettlementAge {
  const ageTable = AGE_DISTRIBUTION[size];
  return pickWeighted(rng, ageTable).age;
}

/**
 * Generate the founder type and founding story.
 */
function generateFounding(rng: SeededRandom): { founderType: FounderType; founding: string } {
  const entry = pickWeighted(rng, FOUNDER_TABLE);
  const founding = rng.pick(entry.templates);
  return { founderType: entry.type, founding };
}

/**
 * Generate major historical events.
 * Number of events scales with settlement age.
 */
function generateMajorEvents(rng: SeededRandom, age: SettlementAge): string[] {
  // Event count based on age
  const eventCountByAge: Record<SettlementAge, [number, number]> = {
    new: [0, 1],
    young: [1, 1],
    established: [1, 2],
    old: [2, 3],
    ancient: [2, 3],
  };

  const [minEvents, maxEvents] = eventCountByAge[age];
  const eventCount = rng.between(minEvents, maxEvents);

  if (eventCount === 0) return [];

  // Pick unique events
  const events: string[] = [];
  const availableEvents = [...MAJOR_EVENTS];

  for (let i = 0; i < eventCount && availableEvents.length > 0; i++) {
    const event = pickWeighted(rng, availableEvents);
    events.push(event.text);
    // Remove to prevent duplicates
    const idx = availableEvents.indexOf(event);
    if (idx > -1) availableEvents.splice(idx, 1);
  }

  return events;
}

/**
 * Generate a former name for the settlement.
 * 25% chance to have a former name.
 */
function generateFormerName(rng: SeededRandom, currentName: string): string | undefined {
  if (!rng.chance(0.25)) return undefined;

  // Generate a different name
  const prefix = rng.pick(FORMER_NAME_PREFIXES);
  const suffix = rng.pick(FORMER_NAME_SUFFIXES);
  const formerName = `${prefix}${suffix}`;

  // Make sure it's different from current name
  if (formerName.toLowerCase() === currentName.toLowerCase()) {
    // Try once more with different choices
    const altPrefix = rng.pick(FORMER_NAME_PREFIXES.filter(p => p !== prefix));
    return `${altPrefix}${suffix}`;
  }

  return formerName;
}

/**
 * Generate a cultural note.
 * 35% chance to have a cultural note.
 */
function generateCulturalNote(rng: SeededRandom): string | undefined {
  if (!rng.chance(0.35)) return undefined;
  return pickWeighted(rng, CULTURAL_NOTES).text;
}

/**
 * Generate complete settlement history.
 */
export function generateSettlementHistory(options: SettlementHistoryOptions): SettlementHistory {
  const { seed, size, name } = options;
  const rng = new SeededRandom(`${seed}-settlement-history`);

  const age = generateAge(rng, size);
  const { founderType, founding } = generateFounding(rng);
  const majorEvents = generateMajorEvents(rng, age);
  const formerName = generateFormerName(rng, name);
  const culturalNote = generateCulturalNote(rng);

  return {
    founding,
    founderType,
    age,
    majorEvents,
    formerName,
    culturalNote,
  };
}

/**
 * Generate 3 sensory impressions for a settlement (sight, sound, smell).
 * Brief, evocative phrases for quick scene-setting.
 */
export function generateSensoryImpressions(seed: string): string[] {
  const rng = new SeededRandom(`${seed}-sensory`);

  return [
    rng.pick(SENSORY_SIGHTS),
    rng.pick(SENSORY_SOUNDS),
    rng.pick(SENSORY_SMELLS),
  ];
}
