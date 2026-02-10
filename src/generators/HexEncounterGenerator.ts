import { nanoid } from "nanoid";
import type { Hex, HexEncounter, TerrainType } from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Terrain-Specific Creature Pools ===
// Names must match exactly with shadowdark-reference/monsters.json

const CREATURES_BY_TERRAIN: Record<TerrainType, string[]> = {
  plains: ["Wolf", "Bandit", "Horse", "Boar", "Centaur"],
  forest: ["Wolf", "Bear, Brown", "Goblin", "Owlbear", "Elf", "Spider, Giant"],
  hills: ["Orc", "Giant, Hill", "Ogre", "Hobgoblin", "Gnoll"],
  mountains: ["Ogre", "Griffon", "Giant, Stone", "Orc, Chieftain", "Harpy"],
  swamp: ["Lizardfolk", "Crocodile", "Will-o'-wisp", "Hag, Weald", "Frog, Giant"],
  water: [], // no encounters
  desert: ["Manticore", "Scorpion, Giant", "Gnoll", "Bandit", "Vulture, Giant"],
};

// Behavior weights: hostile 50%, neutral 30%, fleeing 20%
const BEHAVIOR_WEIGHTS = createWeightedTable<HexEncounter["behavior"]>({
  hostile: 50,
  neutral: 30,
  fleeing: 20,
});

// === Types ===

export interface HexEncounterGeneratorOptions {
  seed: string;
  hexes: Hex[];
}

// === Generator ===

/**
 * Place encounters on 20-30% of hexes without locations or features.
 * Skips water terrain.
 */
export function generateHexEncounters(options: HexEncounterGeneratorOptions): Hex[] {
  const { seed, hexes } = options;
  const rng = new SeededRandom(`${seed}-hex-encounters`);

  // Target 20-30% coverage
  const targetPercent = rng.float(0.2, 0.3);

  // Filter eligible hexes (no location, no feature, not water)
  const eligibleHexes = hexes.filter(
    (hex) =>
      !hex.locationId &&
      !hex.feature &&
      hex.terrain !== "water"
  );

  const targetCount = Math.floor(eligibleHexes.length * targetPercent);

  // Shuffle and pick
  const shuffled = rng.shuffle([...eligibleHexes]);
  const selectedHexes = shuffled.slice(0, targetCount);
  const selectedCoords = new Set(
    selectedHexes.map((h) => `${h.coord.q},${h.coord.r}`)
  );

  // Map hexes, adding encounters to selected ones
  return hexes.map((hex) => {
    const coordKey = `${hex.coord.q},${hex.coord.r}`;
    if (!selectedCoords.has(coordKey)) return hex;

    const encounter = generateSingleEncounter(
      rng.child(`${coordKey}`),
      hex.terrain
    );

    return { ...hex, encounter };
  });
}

/**
 * Generate a single hex encounter.
 */
function generateSingleEncounter(
  rng: SeededRandom,
  terrain: TerrainType
): HexEncounter {
  const creatures = CREATURES_BY_TERRAIN[terrain];
  if (!creatures || creatures.length === 0) {
    // Fallback to plains if terrain has no creatures
    return generateSingleEncounter(rng, "plains");
  }

  return {
    id: `hex-enc-${nanoid(8)}`,
    creature: rng.pick(creatures),
    count: rng.between(1, 4),
    behavior: rng.pickWeighted(BEHAVIOR_WEIGHTS),
    probability: rng.between(30, 80),
  };
}
