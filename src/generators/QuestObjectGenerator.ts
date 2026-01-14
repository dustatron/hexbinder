import { nanoid } from "nanoid";
import type { Hex, QuestObject, QuestObjectType, TerrainType } from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Name Pools ===

const PLANT_NAMES = [
  "Moonpetal",
  "Ghostcap Mushroom",
  "Bloodthorn",
  "Witchbane Root",
  "Silverleaf",
  "Dragon's Breath Moss",
  "Nightshade Bloom",
  "Starfern",
  "Corpseflower",
  "Firemoss",
  "Shadow Orchid",
  "Crystal Fern",
];

const MINERAL_NAMES = [
  "Star Sapphire Vein",
  "Ancient Gold Ore",
  "Shadowite Deposit",
  "Mithril Seam",
  "Glowstone Cluster",
  "Darkite Crystals",
  "Dragon Glass Shard",
  "Heartstone Geode",
  "Moonsilver Ore",
  "Bloodiron Vein",
  "Frozen Ember",
  "Void Crystal",
];

const ARTIFACT_NAMES = [
  "Runed Stone",
  "Broken Crown",
  "Ancient Tablet",
  "Shattered Orb",
  "Cursed Idol",
  "Forgotten Sigil",
  "Bound Tome",
  "Sealed Urn",
  "Cracked Scepter",
  "Tarnished Amulet",
  "Etched Blade Fragment",
  "Petrified Wand",
];

const REMAINS_NAMES = [
  "Adventurer's Skeleton",
  "Dragon Bones",
  "Giant's Skull",
  "Petrified Warrior",
  "Ancient Knight's Armor",
  "Mummified Hand",
  "Shattered Golem Core",
  "Lich's Phylactery Fragments",
  "Fossilized Beast",
  "Fallen Hero's Shield",
  "Undead's Scattered Bones",
  "Demon Husk",
];

const NAME_POOLS: Record<QuestObjectType, string[]> = {
  plant: PLANT_NAMES,
  mineral: MINERAL_NAMES,
  artifact: ARTIFACT_NAMES,
  remains: REMAINS_NAMES,
};

// === Description Templates ===

const DESCRIPTIONS: Record<QuestObjectType, string[]> = {
  plant: [
    "A rare botanical specimen with magical properties.",
    "Glows faintly in darkness. Prized by alchemists.",
    "Said to bloom only under specific celestial conditions.",
    "Its petals shimmer with an otherworldly light.",
    "Dangerous to touch without proper gloves.",
  ],
  mineral: [
    "Veins of precious ore glint in the rock face.",
    "The crystals hum with latent magical energy.",
    "Ancient dwarves once mined this material.",
    "Radiates a subtle warmth even in coldest weather.",
    "Worth a fortune to the right buyer.",
  ],
  artifact: [
    "Covered in runes of an ancient language.",
    "Pulses with residual magical energy.",
    "Bears the mark of a forgotten civilization.",
    "Something stirs when you approach it.",
    "Cold to the touch, despite the ambient temperature.",
  ],
  remains: [
    "What tragedy befell this soul?",
    "The bones tell a story of violent end.",
    "Still clutching something in its skeletal grip.",
    "Partially consumed by the elements.",
    "Evidence of a fierce battle long past.",
  ],
};

// === Terrain Bias Tables ===

function getTerrainWeights(terrain: TerrainType): Record<QuestObjectType, number> {
  // Base distribution: plant 35%, mineral 25%, artifact 25%, remains 15%
  const base = { plant: 35, mineral: 25, artifact: 25, remains: 15 };

  // Apply terrain biases
  switch (terrain) {
    case "forest":
      // Plants: 50% in forest
      return { plant: 50, mineral: 10, artifact: 20, remains: 20 };
    case "swamp":
      // Plants: 30% in swamp
      return { plant: 30, mineral: 10, artifact: 25, remains: 35 };
    case "plains":
      // Plants: 20% in plains
      return { plant: 20, mineral: 15, artifact: 30, remains: 35 };
    case "mountains":
      // Minerals: 50% in mountains
      return { plant: 10, mineral: 50, artifact: 25, remains: 15 };
    case "hills":
      // Minerals: 40% in hills
      return { plant: 15, mineral: 40, artifact: 25, remains: 20 };
    case "water":
      // Water gets more artifacts/remains (sunken things)
      return { plant: 10, mineral: 15, artifact: 40, remains: 35 };
    default:
      return base;
  }
}

// === Generator ===

export interface QuestObjectGeneratorOptions {
  seed: string;
  hexes: Hex[];
}

/**
 * Generate and place quest objects on 5-10% of hexes.
 * Returns new Hex array with questObject field populated.
 */
export function generateQuestObjects(options: QuestObjectGeneratorOptions): Hex[] {
  const { seed, hexes } = options;
  const rng = new SeededRandom(`${seed}-quest-objects`);

  // Determine how many hexes get quest objects (5-10%)
  const minObjects = Math.floor(hexes.length * 0.05);
  const maxObjects = Math.floor(hexes.length * 0.1);
  const objectCount = rng.between(minObjects, maxObjects);

  if (objectCount === 0) return hexes;

  // Filter to hexes without existing quest objects
  const eligibleHexes = hexes.filter((h) => !h.questObject);
  if (eligibleHexes.length === 0) return hexes;

  // Randomly select hexes to receive quest objects
  const selectedHexes = rng.sample(eligibleHexes, Math.min(objectCount, eligibleHexes.length));
  const selectedCoords = new Set(selectedHexes.map((h) => `${h.coord.q},${h.coord.r}`));

  // Generate quest objects for selected hexes
  return hexes.map((hex) => {
    const key = `${hex.coord.q},${hex.coord.r}`;
    if (!selectedCoords.has(key)) return hex;

    const questObject = generateSingleQuestObject(rng, hex.terrain, hex.coord.q, hex.coord.r);
    return { ...hex, questObject };
  });
}

function generateSingleQuestObject(
  rng: SeededRandom,
  terrain: TerrainType,
  q: number,
  r: number
): QuestObject {
  // Pick type based on terrain-weighted distribution
  const weights = getTerrainWeights(terrain);
  const typeTable = createWeightedTable<QuestObjectType>(weights);
  const type = rng.pickWeighted(typeTable);

  // Pick name from pool
  const namePool = NAME_POOLS[type];
  const name = rng.pick(namePool);

  // Pick description
  const descPool = DESCRIPTIONS[type];
  const description = rng.pick(descPool);

  return {
    id: `qo-${nanoid(8)}`,
    type,
    name,
    description,
    found: false,
  };
}
