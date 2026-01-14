import { nanoid } from "nanoid";
import type {
  Encounter,
  EncounterBehavior,
  TerrainType,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Creature Tables by Terrain ===

const CREATURES_BY_TERRAIN: Record<TerrainType, string[]> = {
  plains: [
    "wolves", "bandits", "wild horses", "boars", "giant_eagles",
    "gnolls", "nomad_warriors", "dire_wolves",
  ],
  forest: [
    "wolves", "bears", "spiders", "goblins", "owlbears",
    "treants", "elves", "druids", "sprites",
  ],
  hills: [
    "orcs", "ogres", "trolls", "hill_giants", "wyverns",
    "bandits", "harpies", "giant_boars",
  ],
  mountains: [
    "giant_eagles", "griffons", "stone_giants", "rocs", "dragons",
    "dwarves", "yetis", "rock_trolls",
  ],
  swamp: [
    "lizardfolk", "giant_frogs", "crocodiles", "will_o_wisps",
    "trolls", "hags", "undead", "bullywugs",
  ],
  water: [
    "merfolk", "giant_crabs", "sea_serpents", "water_elementals",
    "pirates", "krakens", "sahaugin",
  ],
};

// Behavior weights
const BEHAVIOR_WEIGHTS = createWeightedTable<EncounterBehavior>({
  hostile: 40,
  neutral: 30,
  negotiable: 20,
  fleeing: 10,
});

// === Encounter Difficulty ===

const DIFFICULTY_MULTIPLIERS: Record<number, { count: [number, number]; creatures: number }> = {
  1: { count: [1, 3], creatures: 0 },  // Easy - basic creatures
  2: { count: [2, 4], creatures: 1 },  // Medium - slightly tougher
  3: { count: [3, 6], creatures: 2 },  // Hard - dangerous
  4: { count: [4, 8], creatures: 3 },  // Deadly - very dangerous
  5: { count: [6, 12], creatures: 4 }, // Legendary - boss level
};

export interface EncounterGeneratorOptions {
  seed: string;
  terrain: TerrainType;
  difficulty?: number;
}

/**
 * Generate a random encounter for a hex.
 */
export function generateEncounter(options: EncounterGeneratorOptions): Encounter {
  const { seed, terrain, difficulty = 2 } = options;
  const rng = new SeededRandom(`${seed}-encounter`);

  const creatureList = CREATURES_BY_TERRAIN[terrain] ?? CREATURES_BY_TERRAIN.plains;
  const difficultyMod = DIFFICULTY_MULTIPLIERS[difficulty] ?? DIFFICULTY_MULTIPLIERS[2];

  // Higher difficulty = access to more dangerous creatures (later in list)
  const creatureIndex = Math.min(
    rng.between(0, difficultyMod.creatures + 3),
    creatureList.length - 1
  );
  const creatureType = creatureList[creatureIndex];

  const [minCount, maxCount] = difficultyMod.count;
  const count = rng.between(minCount, maxCount);

  return {
    id: `encounter-${nanoid(8)}`,
    creatureType,
    count,
    behavior: rng.pickWeighted(BEHAVIOR_WEIGHTS),
    defeated: false,
  };
}

export interface WandererEncounterOptions {
  seed: string;
  terrain: TerrainType;
  daysSinceLastEncounter: number;
}

/**
 * Check if a random encounter occurs during travel.
 */
export function checkWandererEncounter(
  options: WandererEncounterOptions
): { occurs: boolean; encounter?: Encounter } {
  const { seed, terrain, daysSinceLastEncounter } = options;
  const rng = new SeededRandom(`${seed}-wanderer`);

  // Base 15% chance, increases with time since last encounter
  const encounterChance = Math.min(0.15 + (daysSinceLastEncounter * 0.05), 0.5);

  if (!rng.chance(encounterChance)) {
    return { occurs: false };
  }

  // Terrain affects encounter difficulty
  const terrainDifficulty: Record<TerrainType, number> = {
    plains: 1,
    forest: 2,
    hills: 2,
    mountains: 3,
    swamp: 2,
    water: 2,
  };

  const encounter = generateEncounter({
    seed: `${seed}-wanderer-enc`,
    terrain,
    difficulty: terrainDifficulty[terrain],
  });

  return { occurs: true, encounter };
}

export interface LairEncounterOptions {
  seed: string;
  terrain: TerrainType;
  lairType?: string;
}

/**
 * Generate an encounter for a lair/dungeon room.
 */
export function generateLairEncounter(options: LairEncounterOptions): Encounter {
  const { seed, terrain, lairType } = options;
  const rng = new SeededRandom(`${seed}-lair`);

  // Lair encounters are typically tougher
  const difficulty = rng.between(2, 4);

  const encounter = generateEncounter({
    seed: `${seed}-lair-enc`,
    terrain,
    difficulty,
  });

  // Lair creatures are often more aggressive
  if (rng.chance(0.6)) {
    encounter.behavior = "hostile";
  }

  // Add notes for lair context
  if (lairType) {
    encounter.notes = `Guards the ${lairType}`;
  }

  return encounter;
}

/**
 * Get a descriptive name for an encounter.
 */
export function describeEncounter(encounter: Encounter): string {
  const countDesc = encounter.count === 1 ? "a lone"
    : encounter.count <= 3 ? "a small group of"
    : encounter.count <= 6 ? "a band of"
    : "a horde of";

  const behaviorDesc: Record<EncounterBehavior, string> = {
    hostile: "aggressive",
    neutral: "watchful",
    negotiable: "cautious",
    fleeing: "retreating",
  };

  const creature = encounter.creatureType.replace("_", " ");
  return `${countDesc} ${behaviorDesc[encounter.behavior]} ${creature}`;
}
