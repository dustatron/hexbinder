import { nanoid } from "nanoid";
import type {
  Encounter,
  EncounterBehavior,
  EncounterOverrides,
  EncounterType,
  Reaction,
  TerrainType,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";
import {
  MASTER_TABLE,
  REACTION_TABLE,
  SIGN_TABLE,
  ENVIRONMENT_TABLE,
  getLossTableForTerrain,
  AREA_EFFECT_TABLE,
  getReactionFromIndex,
} from "~/data/encounters/tables";
import {
  getCreaturesForTerrain,
  type CreatureEntry,
} from "~/data/encounters/creatures";
import { getRandomImpressions } from "~/data/encounters/impressions";
import { generateNPC } from "./NPCGenerator";
import type { NPC, CreatureArchetype } from "~/models";

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
  desert: [
    "manticores", "giant_scorpions", "gnolls", "bandits",
    "sand_worms", "fire_elementals", "vultures", "jackals",
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
    desert: 2,
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

// =============================================================================
// IMPROVED ENCOUNTER SYSTEM
// =============================================================================

/** Full result of improved encounter generation */
export interface ImprovedEncounterResult {
  // Master table
  masterRoll: number;
  masterIndex: number;
  encounterType: EncounterType;

  // Sub-results based on type
  creature?: {
    entry: CreatureEntry;
    count: number;
  };
  npc?: NPC;
  reaction?: Reaction;
  reactionIndex?: number;
  sign?: { text: string; detail: string };
  environment?: { text: string; effect: string; magical: boolean };
  loss?: { text: string; effect: string };
  areaEffect?: { text: string; effect: string; magical: boolean };

  // First impressions
  impressions: {
    sight: string;
    sound: string;
    smell: string;
  };

  // Override tracking
  hasOverrides: boolean;
}

export interface ImprovedEncounterOptions {
  seed: string;
  terrain: TerrainType;
  overrides?: EncounterOverrides;
}

/**
 * Generate an improved encounter with all sub-tables.
 * Uses seed for determinism + optional overrides for GM selections.
 */
export function generateImprovedEncounter(
  options: ImprovedEncounterOptions
): ImprovedEncounterResult {
  const { seed, terrain, overrides } = options;
  const rng = new SeededRandom(`${seed}-improved-encounter`);

  // Master table roll (1d6)
  const masterRoll = rng.between(1, 6);
  const masterIndex = overrides?.masterIndex ?? (masterRoll - 1);
  const masterEntry = MASTER_TABLE[masterIndex] ?? MASTER_TABLE[0];
  const encounterType = masterEntry.type;

  // First impressions (always generated)
  const sightIdx = rng.between(0, 5);
  const soundIdx = rng.between(0, 5);
  const smellIdx = rng.between(0, 5);
  const impressions = getRandomImpressions(terrain, sightIdx, soundIdx, smellIdx);

  const hasOverrides = !!(
    overrides?.masterIndex !== undefined ||
    overrides?.creatureIndex !== undefined ||
    overrides?.reactionIndex !== undefined ||
    overrides?.subTableIndex !== undefined
  );

  const result: ImprovedEncounterResult = {
    masterRoll,
    masterIndex,
    encounterType,
    impressions,
    hasOverrides,
  };

  // Generate sub-table results based on encounter type
  switch (encounterType) {
    case "creature": {
      const creatures = getCreaturesForTerrain(terrain);
      const creatureIndex = overrides?.creatureIndex ?? pickWeightedCreatureIndex(rng, creatures);
      const creature = creatures[creatureIndex] ?? creatures[0];

      // Roll 1d4 for count
      const count = rng.between(1, 4);

      // Reaction roll (1d10)
      const reactionRoll = rng.between(1, 10);
      const reactionIndex = overrides?.reactionIndex ?? getReactionIndexFromRoll(reactionRoll);
      const reaction = getReactionFromIndex(reactionIndex);

      result.creature = { entry: creature, count };
      result.reaction = reaction;
      result.reactionIndex = reactionIndex;
      break;
    }

    case "npc": {
      // Generate actual NPC
      const npcArchetypes: CreatureArchetype[] = [
        "commoner", "merchant", "bandit", "guard", "thief", "priest", "scholar"
      ];
      const archetype = rng.pick(npcArchetypes);

      const npc = generateNPC({
        seed: `${seed}-encounter-npc`,
        archetype,
      });

      // NPC uses reaction table too
      const reactionRoll = rng.between(1, 10);
      const reactionIndex = overrides?.reactionIndex ?? getReactionIndexFromRoll(reactionRoll);
      const reaction = getReactionFromIndex(reactionIndex);

      result.npc = npc;
      result.reaction = reaction;
      result.reactionIndex = reactionIndex;
      break;
    }

    case "sign": {
      const signIndex = overrides?.subTableIndex ?? rng.between(0, SIGN_TABLE.length - 1);
      const sign = SIGN_TABLE[signIndex] ?? SIGN_TABLE[0];
      result.sign = { text: sign.text, detail: sign.detail };
      break;
    }

    case "environment": {
      const envIndex = overrides?.subTableIndex ?? rng.between(0, ENVIRONMENT_TABLE.length - 1);
      const env = ENVIRONMENT_TABLE[envIndex] ?? ENVIRONMENT_TABLE[0];
      result.environment = { text: env.text, effect: env.effect, magical: env.magical };
      break;
    }

    case "loss": {
      const lossTable = getLossTableForTerrain(terrain);
      const lossIndex = overrides?.subTableIndex ?? rng.between(0, lossTable.length - 1);
      const loss = lossTable[lossIndex] ?? lossTable[0];
      result.loss = { text: loss.text, effect: loss.effect };
      break;
    }

    case "area-effect": {
      const areaIndex = overrides?.subTableIndex ?? rng.between(0, AREA_EFFECT_TABLE.length - 1);
      const area = AREA_EFFECT_TABLE[areaIndex] ?? AREA_EFFECT_TABLE[0];
      result.areaEffect = { text: area.text, effect: area.effect, magical: area.magical };
      break;
    }
  }

  return result;
}

/** Pick creature index using weighted selection */
function pickWeightedCreatureIndex(rng: SeededRandom, creatures: CreatureEntry[]): number {
  const totalWeight = creatures.reduce((sum, c) => sum + c.weight, 0);
  let roll = rng.next() * totalWeight;

  for (let i = 0; i < creatures.length; i++) {
    roll -= creatures[i].weight;
    if (roll <= 0) return i;
  }

  return creatures.length - 1;
}

/** Convert 1d10 roll to reaction index (0-4) */
function getReactionIndexFromRoll(roll: number): number {
  if (roll <= 2) return 0; // hostile
  if (roll <= 5) return 1; // wary
  if (roll <= 7) return 2; // curious
  if (roll <= 9) return 3; // friendly
  return 4; // helpful
}

/** Generate 16 quick names for sidebar */
export function generateQuickNames(seed: string, count: number = 16): string[] {
  const rng = new SeededRandom(`${seed}-quick-names`);

  // Simple name lists (first names only for quick reference)
  const maleNames = [
    "Aldric", "Brom", "Corwin", "Dain", "Erik", "Finn", "Gareth", "Holt",
    "Ivan", "Jasper", "Kael", "Lorn", "Magnus", "Nils", "Orin", "Pax",
    "Quinn", "Rolf", "Sven", "Theron", "Uther", "Viktor", "Wren", "Xander",
  ];
  const femaleNames = [
    "Mira", "Sylva", "Thessa", "Una", "Vera", "Wren", "Yara", "Zora",
    "Ada", "Brynn", "Celia", "Dara", "Elara", "Freya", "Gwen", "Hilda",
    "Ivy", "Jana", "Kira", "Luna", "Neve", "Opal", "Pria", "Rhea",
  ];

  const shuffledMale = rng.shuffle([...maleNames]);
  const shuffledFemale = rng.shuffle([...femaleNames]);

  const names: string[] = [];
  const half = Math.floor(count / 2);

  for (let i = 0; i < half; i++) {
    names.push(shuffledMale[i % shuffledMale.length]);
  }
  for (let i = 0; i < count - half; i++) {
    names.push(shuffledFemale[i % shuffledFemale.length]);
  }

  return names;
}
