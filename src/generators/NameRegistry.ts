/**
 * NameRegistry - Generates unique NPC names with race/gender specificity
 *
 * Features:
 * - Pre-shuffled name pools for O(1) lookups
 * - Deterministic via dedicated SeededRandom
 * - Syllable combiner fallback for exhausted pools
 * - First name uniqueness tracking per world
 */

import type { NPCRace, NPCGender } from "../models";
import { SeededRandom, type WeightedTable } from "./SeededRandom";
import { NAME_DATA, SURNAMES, NICKNAMES, EMERGENCY_TITLES } from "../data/names";

const RACES: NPCRace[] = [
  "human", "elf", "dwarf", "halfling", "half-elf", "half-orc", "gnome", "goblin"
];

interface NamePool {
  names: string[];
  index: number;
}

export class NameRegistry {
  private rng: SeededRandom;
  private usedFirstNames: Set<string> = new Set();
  private pools: Map<string, NamePool> = new Map();

  constructor(worldSeed: string) {
    // Dedicated RNG for determinism
    this.rng = new SeededRandom(`${worldSeed}-names`);
    this.initializePools();
  }

  private initializePools(): void {
    // Pre-shuffle all pools ONCE at construction
    for (const race of RACES) {
      const raceData = NAME_DATA[race];

      // Male pool
      const maleNames = this.rng.shuffle([...raceData.male]);
      this.pools.set(`${race}-male`, { names: maleNames, index: 0 });

      // Female pool
      const femaleNames = this.rng.shuffle([...raceData.female]);
      this.pools.set(`${race}-female`, { names: femaleNames, index: 0 });
    }
  }

  /**
   * Generate a unique first name for a given race and gender
   */
  generateFirstName(race: NPCRace, gender: NPCGender): string {
    const key = `${race}-${gender}`;
    const pool = this.pools.get(key);

    if (!pool) {
      throw new Error(`Unknown race/gender combination: ${key}`);
    }

    // 1. Try curated pool (O(1) sequential pick)
    while (pool.index < pool.names.length) {
      const name = pool.names[pool.index++];
      if (!this.usedFirstNames.has(name)) {
        this.usedFirstNames.add(name);
        return name;
      }
    }

    // 2. Fallback: syllable combiner
    const raceData = NAME_DATA[race];
    const syllables = gender === "male" ? raceData.maleSyllables : raceData.femaleSyllables;

    if (syllables) {
      for (let attempt = 0; attempt < 100; attempt++) {
        const generated = this.combineSyllables(syllables);
        if (!this.usedFirstNames.has(generated)) {
          this.usedFirstNames.add(generated);
          return generated;
        }
      }
    }

    // 3. Emergency: title suffix (not numbers!)
    const base = pool.names[0];
    for (const title of EMERGENCY_TITLES) {
      const named = `${base} ${title}`;
      if (!this.usedFirstNames.has(named)) {
        this.usedFirstNames.add(named);
        return named;
      }
    }

    // Absolute last resort - should never happen with 700+ names
    const suffix = this.rng.between(1, 999);
    const fallback = `${base} of ${suffix}`;
    this.usedFirstNames.add(fallback);
    return fallback;
  }

  /**
   * Combine syllables to generate a name
   */
  private combineSyllables(syllables: [string[], string[]]): string {
    const [prefixes, suffixes] = syllables;
    const prefix = this.rng.pick(prefixes);
    const suffix = this.rng.pick(suffixes);
    return prefix + suffix;
  }

  /**
   * Generate a full name (first + optional nickname + last)
   */
  generateFullName(race: NPCRace, gender: NPCGender): string {
    const first = this.generateFirstName(race, gender);
    const last = this.rng.pick(SURNAMES);

    // 20% chance for nickname
    if (this.rng.chance(0.2)) {
      const nick = this.rng.pick(NICKNAMES);
      return `${first} ${nick} ${last}`;
    }
    return `${first} ${last}`;
  }

  /**
   * Generate gender (50/50 split)
   */
  generateGender(): NPCGender {
    return this.rng.chance(0.5) ? "male" : "female";
  }

  /**
   * Get count of used first names
   */
  getUsedCount(): number {
    return this.usedFirstNames.size;
  }

  /**
   * Check if a first name has been used
   */
  isNameUsed(name: string): boolean {
    return this.usedFirstNames.has(name);
  }
}

// Race weight tables for different contexts

export const DEFAULT_RACE_WEIGHTS: WeightedTable<NPCRace> = {
  entries: [
    { value: "human", weight: 40 },
    { value: "elf", weight: 10 },
    { value: "dwarf", weight: 10 },
    { value: "halfling", weight: 10 },
    { value: "half-elf", weight: 8 },
    { value: "half-orc", weight: 8 },
    { value: "gnome", weight: 7 },
    { value: "goblin", weight: 7 },
  ],
};

export const SETTLEMENT_RACE_WEIGHTS: Record<string, WeightedTable<NPCRace>> = {
  dwarven: {
    entries: [
      { value: "dwarf", weight: 70 },
      { value: "human", weight: 15 },
      { value: "gnome", weight: 10 },
      { value: "halfling", weight: 5 },
    ],
  },
  elven: {
    entries: [
      { value: "elf", weight: 70 },
      { value: "half-elf", weight: 15 },
      { value: "human", weight: 10 },
      { value: "halfling", weight: 5 },
    ],
  },
  goblin: {
    entries: [
      { value: "goblin", weight: 80 },
      { value: "half-orc", weight: 15 },
      { value: "human", weight: 5 },
    ],
  },
  human: {
    entries: [
      { value: "human", weight: 50 },
      { value: "halfling", weight: 12 },
      { value: "dwarf", weight: 10 },
      { value: "elf", weight: 8 },
      { value: "half-elf", weight: 8 },
      { value: "half-orc", weight: 6 },
      { value: "gnome", weight: 4 },
      { value: "goblin", weight: 2 },
    ],
  },
};

/**
 * Generate race with optional settlement context
 */
export function generateRace(rng: SeededRandom, settlementType?: string): NPCRace {
  const weights = settlementType && SETTLEMENT_RACE_WEIGHTS[settlementType]
    ? SETTLEMENT_RACE_WEIGHTS[settlementType]
    : DEFAULT_RACE_WEIGHTS;
  return rng.pickWeighted(weights);
}
