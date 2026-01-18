import { nanoid } from "nanoid";
import type {
  Settlement,
  SpatialSettlement,
  SettlementSize,
  SettlementType,
  GovernmentType,
  EconomyType,
  SettlementMood,
  DefenseLevel,
  Hex,
  HexCoord,
  TerrainType,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";
import { generateTownLayout } from "./TownLayoutEngine";
import { hexDistance } from "~/lib/hex-utils";

// === Name Tables ===

const SETTLEMENT_PREFIXES = [
  "North", "South", "East", "West", "Old", "New", "High", "Low",
  "Green", "Black", "White", "Red", "Grey", "Iron", "Stone", "Oak",
];

const SETTLEMENT_SUFFIXES = [
  "haven", "ford", "dale", "bury", "wick", "ton", "ham", "worth",
  "bridge", "field", "hollow", "crossing", "falls", "mill", "hold",
];

const SETTLEMENT_TROUBLES = [
  "Livestock have been found dead with strange marks",
  "Travelers have gone missing on the road",
  "Strange lights are seen in the hills at night",
  "A sickness is spreading through the village",
  "Crops have been failing despite good weather",
  "Children report seeing monsters in the woods",
  "The local well water has turned foul",
  "Bandits have been demanding tribute",
];

const SETTLEMENT_QUIRKS = [
  "The villagers refuse to speak after dark",
  "All the buildings face away from the forest",
  "A strange monument stands in the center of town",
  "The locals worship an unusual deity",
  "Everyone wears the same color clothing",
  "The village has no children",
  "A permanent mist hangs over the settlement",
  "All the animals here are unusually docile",
];

const SIZE_WEIGHTS = createWeightedTable<SettlementSize>({
  thorpe: 10,
  hamlet: 25,
  village: 40,
  town: 20,
  city: 5,
});

const POPULATION_RANGES: Record<SettlementSize, [number, number]> = {
  thorpe: [10, 50],
  hamlet: [50, 200],
  village: [200, 1000],
  town: [1000, 5000],
  city: [5000, 25000],
};

const GOVERNMENT_WEIGHTS = createWeightedTable<GovernmentType>({
  elder: 30,
  mayor: 25,
  council: 20,
  lord: 15,
  guild: 5,
  theocracy: 5,
});

const ECONOMY_OPTIONS: EconomyType[] = [
  "farming", "trade", "mining", "fishing", "crafting", "logging",
];

const MOOD_WEIGHTS = createWeightedTable<SettlementMood>({
  welcoming: 20,
  prosperous: 15,
  struggling: 25,
  fearful: 20,
  secretive: 15,
  hostile: 5,
});

const DEFENSE_WEIGHTS = createWeightedTable<DefenseLevel>({
  none: 30,
  militia: 35,
  guards: 25,
  walls: 8,
  fortified: 2,
});

// Settlement type based on terrain context
const SETTLEMENT_TYPE_WEIGHTS = createWeightedTable<SettlementType>({
  human: 75,
  dwarven: 10,
  elven: 10,
  goblin: 5,
});

// Terrain hints for non-human settlements
const TERRAIN_SETTLEMENT_HINTS: Partial<Record<TerrainType, SettlementType>> = {
  mountains: "dwarven",
  hills: "dwarven",
  forest: "elven",
  swamp: "goblin",
};

function generateSettlementType(rng: SeededRandom, terrain: TerrainType): SettlementType {
  // 30% chance terrain influences settlement type
  if (rng.chance(0.3)) {
    const hint = TERRAIN_SETTLEMENT_HINTS[terrain];
    if (hint) return hint;
  }
  // Otherwise weighted random (mostly human)
  return rng.pickWeighted(SETTLEMENT_TYPE_WEIGHTS);
}

export interface SettlementPlacementOptions {
  seed: string;
  hexes: Hex[];
  forceCoord?: HexCoord;    // Place at specific coordinate
  forceSize?: SettlementSize; // Force specific settlement size
  forceSettlementType?: SettlementType; // Force specific settlement type (human, dwarven, elven, goblin)
  existingSettlementCoords?: HexCoord[]; // For distance-weighted placement
  riverAdjacentCoords?: HexCoord[]; // Hexes adjacent to rivers (bonus weight)
  settlementIndex?: number; // Which settlement this is (0-based)
  totalSettlements?: number; // Total planned settlements
}

/**
 * Check if a coordinate is in a list of coordinates.
 */
function coordInList(coord: HexCoord, list: HexCoord[]): boolean {
  return list.some(c => c.q === coord.q && c.r === coord.r);
}

/**
 * Calculate distance weight for a hex based on multiple factors:
 * - Distance from existing settlements (farther = higher weight)
 * - River adjacency (bonus weight for river-adjacent hexes)
 * - Graduated spacing (early settlements can be closer)
 */
function calculateDistanceWeight(
  coord: HexCoord,
  existingCoords: HexCoord[],
  riverAdjacentCoords: HexCoord[],
  settlementIndex: number,
  totalSettlements: number
): number {
  let weight = 1;

  if (existingCoords.length > 0) {
    // Find minimum distance to any existing settlement
    let minDistance = Infinity;
    for (const existing of existingCoords) {
      const dist = hexDistance(coord, existing);
      if (dist < minDistance) minDistance = dist;
    }

    // Graduated spacing: first ~30% of settlements use linear distance,
    // remaining settlements use squared distance for stronger spreading
    const earlySettlementThreshold = Math.ceil(totalSettlements * 0.3);
    if (settlementIndex < earlySettlementThreshold) {
      // Early settlements: linear distance (allows closer placement)
      weight = Math.max(1, minDistance);
    } else {
      // Later settlements: squared distance (forces spreading)
      weight = Math.max(1, minDistance * minDistance);
    }
  }

  // River affinity: double weight for river-adjacent hexes
  // Settlements naturally form along rivers for trade and water
  if (coordInList(coord, riverAdjacentCoords)) {
    weight *= 2;
  }

  return weight;
}

/**
 * Find a suitable hex and place a settlement.
 * Returns the settlement with spatial layout and updates the hex with locationId.
 */
export function placeSettlement(options: SettlementPlacementOptions): {
  settlement: SpatialSettlement;
  hex: Hex;
} | null {
  const {
    seed,
    hexes,
    forceCoord,
    forceSize,
    forceSettlementType,
    existingSettlementCoords = [],
    riverAdjacentCoords = [],
    settlementIndex = 0,
    totalSettlements = 1,
  } = options;
  const rng = new SeededRandom(`${seed}-settlement`);

  let hex: Hex | undefined;

  if (forceCoord) {
    // Use specified coordinate
    hex = hexes.find(h => h.coord.q === forceCoord.q && h.coord.r === forceCoord.r);
    if (!hex || hex.locationId) return null;
  } else {
    // Terrain variety: 20% chance to consider non-plains terrain
    // This creates hill towns, forest villages, coastal hamlets
    const allowVariedTerrain = rng.chance(0.2);

    // Find suitable hexes
    let candidates: Hex[];
    if (allowVariedTerrain) {
      // Include forest, hills, and swamp (not water or mountains)
      candidates = hexes.filter(
        (h) => h.terrain !== "water" && h.terrain !== "mountains" && !h.locationId
      );
    } else {
      // Prefer plains (most common settlement terrain)
      candidates = hexes.filter(
        (h) => h.terrain === "plains" && !h.locationId
      );
    }

    if (candidates.length === 0) {
      // Fallback to any non-water/mountain hex
      candidates = hexes.filter(
        (h) => h.terrain !== "water" && h.terrain !== "mountains" && !h.locationId
      );
      if (candidates.length === 0) return null;
    }

    // Build weighted table based on distance, river affinity, and graduated spacing
    const weightedCandidates = candidates.map(h => ({
      hex: h,
      weight: calculateDistanceWeight(
        h.coord,
        existingSettlementCoords,
        riverAdjacentCoords,
        settlementIndex,
        totalSettlements
      ),
    }));

    // Calculate total weight
    const totalWeight = weightedCandidates.reduce((sum, c) => sum + c.weight, 0);

    // Weighted random selection
    let roll = rng.next() * totalWeight;
    for (const candidate of weightedCandidates) {
      roll -= candidate.weight;
      if (roll <= 0) {
        hex = candidate.hex;
        break;
      }
    }

    // Fallback to last candidate
    if (!hex) hex = weightedCandidates[weightedCandidates.length - 1].hex;
  }

  if (!hex) return null;

  const settlement = generateSettlement(rng, hex.coord, hex.terrain, forceSize, forceSettlementType);

  // Generate spatial layout
  const layout = generateTownLayout(
    { size: settlement.size, sites: settlement.sites },
    rng
  );

  const spatialSettlement: SpatialSettlement = {
    ...settlement,
    ...layout,
  };

  // Update hex with location ID
  hex.locationId = spatialSettlement.id;

  return { settlement: spatialSettlement, hex };
}

function generateSettlement(
  rng: SeededRandom,
  coord: HexCoord,
  terrain: TerrainType,
  forceSize?: SettlementSize,
  forceSettlementType?: SettlementType
): Settlement {
  const id = `settlement-${nanoid(8)}`;
  const settlementType = forceSettlementType ?? generateSettlementType(rng, terrain);
  const name = generateSettlementName(rng);
  const size = forceSize ?? rng.pickWeighted(SIZE_WEIGHTS);
  const [minPop, maxPop] = POPULATION_RANGES[size];

  return {
    id,
    name,
    type: "settlement",
    settlementType,
    description: `A ${settlementType} ${size} called ${name}.`,
    hexCoord: coord,
    tags: [size, settlementType],
    size,
    population: rng.between(minPop, maxPop),
    governmentType: rng.pickWeighted(GOVERNMENT_WEIGHTS),
    economyBase: rng.sample(ECONOMY_OPTIONS, rng.between(1, 3)),
    mood: rng.pickWeighted(MOOD_WEIGHTS),
    trouble: rng.pick(SETTLEMENT_TROUBLES),
    quirk: rng.pick(SETTLEMENT_QUIRKS),
    sites: [], // Filled by site generator
    npcIds: [],
    rumors: [],
    notices: [],
    defenses: rng.pickWeighted(DEFENSE_WEIGHTS),
  };
}

function generateSettlementName(rng: SeededRandom): string {
  const prefix = rng.pick(SETTLEMENT_PREFIXES);
  const suffix = rng.pick(SETTLEMENT_SUFFIXES);
  return `${prefix}${suffix}`;
}
