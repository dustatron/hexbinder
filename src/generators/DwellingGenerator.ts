import { nanoid } from "nanoid";
import type { Dwelling, DwellingType, Hex, HexCoord } from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";
import { coordKey, getNeighbors } from "~/lib/hex-utils";

// === Name Tables ===

const FARMSTEAD_NAMES = [
  "Miller's Farm", "Tanner's Homestead", "Cooper's Farm", "Smith's Fields",
  "Baker's Acres", "Fletcher's Farm", "Shepherd's Rest", "Thatcher's Hold",
  "Brewer's Farm", "Potter's Fields", "Wheelwright Farm", "Sawyer's Stead",
];

const COTTAGE_NAMES = [
  "Old Cottage", "Moss Cottage", "Ivy Cottage", "Stone Cottage",
  "Willow Cottage", "Brook Cottage", "Fern Cottage", "Heather Cottage",
  "Bramble House", "Rose Cottage", "Birch Cottage", "Oak House",
];

const HERMITAGE_NAMES = [
  "Hermit's Cave", "Sage's Retreat", "Lonely Hut", "Recluse's Den",
  "Silent Hollow", "Monk's Cell", "Seer's Cave", "Wanderer's Rest",
  "Mystic's Refuge", "Anchorite's Hold", "Solitary Haven", "Pilgrim's End",
];

const RANGER_STATION_NAMES = [
  "Warden's Post", "Forest Watch", "Trail Station", "Woodsman's Lodge",
  "Scout's Cabin", "Hunter's Outpost", "Tracker's Camp", "Boundary Post",
  "Ranger's Rest", "Patrol Cabin", "Wilds Station", "Guardian's Lodge",
];

const ROADSIDE_INN_NAMES = [
  "The Weary Traveler", "Crossroads Inn", "The Wanderer's Rest", "Mile Marker Inn",
  "The Dusty Boot", "Wayfarer's Stop", "The Last Mile", "Road's End Tavern",
  "The Lucky Horseshoe", "Traveler's Haven", "The Open Door", "Roadside Refuge",
];

const NAME_TABLES: Record<DwellingType, string[]> = {
  farmstead: FARMSTEAD_NAMES,
  cottage: COTTAGE_NAMES,
  hermitage: HERMITAGE_NAMES,
  ranger_station: RANGER_STATION_NAMES,
  roadside_inn: ROADSIDE_INN_NAMES,
};

const DESCRIPTION_TEMPLATES: Record<DwellingType, string[]> = {
  farmstead: [
    "A modest farm with tilled fields and a weathered barn.",
    "A small homestead with livestock pens and a vegetable garden.",
    "A working farm surrounded by golden wheat fields.",
    "A rustic farmhouse with a smoking chimney and grazing animals.",
  ],
  cottage: [
    "A quaint cottage with a thatched roof and flower garden.",
    "A small stone dwelling nestled among the trees.",
    "A humble cottage with smoke curling from its chimney.",
    "A cozy home with shuttered windows and a wooden fence.",
  ],
  hermitage: [
    "A secluded dwelling of someone who prefers solitude.",
    "A small shelter hidden away from the world.",
    "A remote dwelling belonging to a reclusive inhabitant.",
    "A modest shelter for one who has forsaken society.",
  ],
  ranger_station: [
    "A sturdy cabin used by those who patrol the wilds.",
    "An outpost for tracking game and watching the borders.",
    "A functional lodge stocked with supplies for wilderness travel.",
    "A well-maintained station overlooking the surrounding terrain.",
  ],
  roadside_inn: [
    "A welcoming establishment offering food and lodging to travelers.",
    "A busy inn frequented by merchants and wanderers alike.",
    "A comfortable stop along the road with warm beds and hot meals.",
    "A popular waypoint known for its hearty fare and local gossip.",
  ],
};

// Type weights: farmstead 40%, cottage 30%, hermitage 15%, ranger_station 10%, roadside_inn 5%
const DWELLING_TYPE_WEIGHTS = createWeightedTable<DwellingType>({
  farmstead: 40,
  cottage: 30,
  hermitage: 15,
  ranger_station: 10,
  roadside_inn: 5,
});

export interface DwellingGeneratorOptions {
  seed: string;
  hexes: Hex[];
  roadHexes: Set<string>;
}

export interface DwellingGeneratorResult {
  dwellings: Dwelling[];
  hexes: Hex[];
}

/**
 * Generate dwellings on 5-10% of plains/forest hexes without locations.
 * 70% bias toward road-adjacent hexes.
 */
export function generateDwellings(options: DwellingGeneratorOptions): DwellingGeneratorResult {
  const { seed, hexes, roadHexes } = options;
  const rng = new SeededRandom(`${seed}-dwellings`);

  // Find eligible hexes: plains/forest without locations or dwellings
  const eligibleHexes = hexes.filter(
    (h) =>
      (h.terrain === "plains" || h.terrain === "forest") &&
      !h.locationId &&
      !h.dwellingId
  );

  if (eligibleHexes.length === 0) {
    return { dwellings: [], hexes };
  }

  // Determine dwelling count: 5-10% of eligible hexes
  const minCount = Math.max(1, Math.floor(eligibleHexes.length * 0.05));
  const maxCount = Math.max(1, Math.floor(eligibleHexes.length * 0.10));
  const dwellingCount = rng.between(minCount, maxCount);

  // Separate hexes by road adjacency
  const roadAdjacentHexes: Hex[] = [];
  const nonRoadHexes: Hex[] = [];

  for (const hex of eligibleHexes) {
    const neighbors = getNeighbors(hex.coord);
    const isNearRoad = neighbors.some((n) => roadHexes.has(coordKey(n))) ||
                       roadHexes.has(coordKey(hex.coord));
    if (isNearRoad) {
      roadAdjacentHexes.push(hex);
    } else {
      nonRoadHexes.push(hex);
    }
  }

  // Build dwelling list
  const dwellings: Dwelling[] = [];
  const usedHexKeys = new Set<string>();

  for (let i = 0; i < dwellingCount; i++) {
    // 70% bias toward road-adjacent
    const preferRoad = rng.chance(0.7);
    let candidatePool: Hex[];

    if (preferRoad && roadAdjacentHexes.length > 0) {
      candidatePool = roadAdjacentHexes.filter((h) => !usedHexKeys.has(coordKey(h.coord)));
    } else {
      candidatePool = nonRoadHexes.filter((h) => !usedHexKeys.has(coordKey(h.coord)));
    }

    // Fallback to other pool if empty
    if (candidatePool.length === 0) {
      candidatePool = [...roadAdjacentHexes, ...nonRoadHexes].filter(
        (h) => !usedHexKeys.has(coordKey(h.coord))
      );
    }

    if (candidatePool.length === 0) break;

    const hex = rng.pick(candidatePool);
    const dwelling = generateDwelling(rng, hex.coord);

    // Link dwelling to hex
    hex.dwellingId = dwelling.id;
    usedHexKeys.add(coordKey(hex.coord));

    dwellings.push(dwelling);
  }

  return { dwellings, hexes };
}

function generateDwelling(rng: SeededRandom, coord: HexCoord): Dwelling {
  const id = `dwelling-${nanoid(8)}`;
  const type = rng.pickWeighted(DWELLING_TYPE_WEIGHTS);
  const name = rng.pick(NAME_TABLES[type]);
  const description = rng.pick(DESCRIPTION_TEMPLATES[type]);
  const hasQuest = rng.chance(0.1); // 10% chance

  return {
    id,
    type,
    hexCoord: coord,
    name,
    description,
    npcIds: [],
    hasQuest,
  };
}
