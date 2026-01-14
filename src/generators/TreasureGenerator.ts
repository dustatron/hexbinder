import { nanoid } from "nanoid";
import type {
  TreasureEntry,
  TreasureType,
  MagicItem,
  MagicItemRarity,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Treasure Type Weights ===

const TREASURE_WEIGHTS = createWeightedTable<TreasureType>({
  coins: 45,
  gems: 20,
  art: 15,
  item: 15,
  magic_item: 5,
});

// === Coin Tables ===

const COIN_TABLES: Record<number, { copper: number; silver: number; gold: number; platinum: number }> = {
  1: { copper: 100, silver: 50, gold: 10, platinum: 0 },
  2: { copper: 200, silver: 100, gold: 50, platinum: 0 },
  3: { copper: 300, silver: 200, gold: 100, platinum: 5 },
  4: { copper: 500, silver: 300, gold: 200, platinum: 20 },
  5: { copper: 1000, silver: 500, gold: 500, platinum: 50 },
};

// === Gem Tables ===

const GEMS_BY_VALUE: Record<number, string[]> = {
  10: ["agate", "quartz", "turquoise", "obsidian", "moss agate"],
  50: ["bloodstone", "carnelian", "onyx", "moonstone", "tiger eye"],
  100: ["amber", "amethyst", "coral", "jade", "pearl"],
  500: ["alexandrite", "aquamarine", "garnet", "peridot", "topaz"],
  1000: ["emerald", "opal", "sapphire", "ruby", "diamond"],
};

// === Art Objects ===

const ART_OBJECTS: Record<number, string[]> = {
  25: [
    "Silver ewer", "Carved bone statuette", "Small gold bracelet",
    "Cloth-of-gold vestments", "Black velvet mask",
  ],
  250: [
    "Gold ring with bloodstone", "Carved ivory statuette",
    "Gold and silver chalice", "Silk robe with gold embroidery",
    "Large tapestry", "Brass mug with jade inlays",
  ],
  750: [
    "Silver comb with moonstones", "Silver-plated steel longsword",
    "Carved harp of exotic wood with ivory inlay", "Small gold idol",
    "Gold dragon comb with red garnet eyes",
  ],
  2500: [
    "Fine gold chain with fire opal", "Gold music box",
    "Painting by a master", "Embroidered silk and velvet mantle",
    "Platinum bracelet with sapphires",
  ],
};

// === Mundane Items ===

const MUNDANE_ITEMS = [
  "A well-crafted longsword",
  "A suit of chainmail",
  "A light crossbow with bolts",
  "A set of thieves' tools",
  "A healer's kit",
  "A hooded lantern",
  "A grappling hook and rope",
  "A vial of antitoxin",
  "A spyglass",
  "A set of fine clothes",
];

// === Magic Item Tables ===

const MAGIC_ITEM_RARITY_WEIGHTS = createWeightedTable<MagicItemRarity>({
  common: 50,
  uncommon: 35,
  rare: 12,
  legendary: 3,
});

type MagicItemTemplate = Omit<MagicItem, "id">;

const MAGIC_ITEMS_BY_RARITY: Record<MagicItemRarity, MagicItemTemplate[]> = {
  common: [
    { name: "Potion of Healing", type: "potion", rarity: "common", description: "Red liquid that shimmers", effect: "Restores 2d4+2 HP", charges: 1, cursed: false },
    { name: "Spell Scroll (1st level)", type: "scroll", rarity: "common", description: "Parchment with arcane writing", effect: "Contains a 1st level spell", charges: 1, cursed: false },
    { name: "Driftglobe", type: "wondrous", rarity: "common", description: "A small glass sphere", effect: "Glows on command, can cast Light or Daylight", cursed: false },
    { name: "Cloak of Billowing", type: "wondrous", rarity: "common", description: "A dramatic dark cloak", effect: "Billows dramatically on command", cursed: false },
  ],
  uncommon: [
    { name: "Bag of Holding", type: "wondrous", rarity: "uncommon", description: "A cloth bag with a dimensional interior", effect: "Holds far more than it should", cursed: false },
    { name: "Boots of Elvenkind", type: "wondrous", rarity: "uncommon", description: "Soft leather boots", effect: "Makes footsteps silent", cursed: false },
    { name: "Cloak of Elvenkind", type: "wondrous", rarity: "uncommon", description: "A grey-green cloak", effect: "Advantage on Stealth checks", cursed: false },
    { name: "Ring of Protection", type: "ring", rarity: "uncommon", description: "A silver ring with runes", effect: "+1 to AC and saves", cursed: false },
    { name: "Longsword +1", type: "weapon", rarity: "uncommon", description: "A finely crafted blade", effect: "+1 to attack and damage", cursed: false },
  ],
  rare: [
    { name: "Armor of Resistance", type: "armor", rarity: "rare", description: "Enchanted armor", effect: "Resistance to one damage type", cursed: false },
    { name: "Ring of Spell Storing", type: "ring", rarity: "rare", description: "A gem-studded ring", effect: "Stores up to 5 levels of spells", charges: 5, cursed: false },
    { name: "Staff of the Woodlands", type: "staff", rarity: "rare", description: "A gnarled wooden staff", effect: "Various nature spells", charges: 10, cursed: false },
    { name: "Flame Tongue", type: "weapon", rarity: "rare", description: "A sword wreathed in fire", effect: "Bursts into flame, +2d6 fire damage", cursed: false },
  ],
  legendary: [
    { name: "Vorpal Sword", type: "weapon", rarity: "legendary", description: "A blade of impossible sharpness", effect: "Can sever heads on a natural 20", cursed: false },
    { name: "Staff of the Magi", type: "staff", rarity: "legendary", description: "A staff of immense power", effect: "Powerful spellcasting abilities", charges: 50, cursed: false },
    { name: "Plate Armor +3", type: "armor", rarity: "legendary", description: "Gleaming enchanted plate", effect: "+3 to AC", cursed: false },
    { name: "Ring of Three Wishes", type: "ring", rarity: "legendary", description: "A ring of ultimate power", effect: "Grants three wishes", charges: 3, cursed: false },
  ],
};

export interface TreasureGeneratorOptions {
  seed: string;
  difficulty?: number;
  itemCount?: number;
}

/**
 * Generate a treasure hoard.
 */
export function generateTreasure(options: TreasureGeneratorOptions): TreasureEntry[] {
  const { seed, difficulty = 2, itemCount = 3 } = options;
  const rng = new SeededRandom(`${seed}-treasure`);
  const treasure: TreasureEntry[] = [];

  for (let i = 0; i < itemCount; i++) {
    const type = rng.pickWeighted(TREASURE_WEIGHTS);
    treasure.push(generateTreasureEntry(rng, type, difficulty));
  }

  return treasure;
}

function generateTreasureEntry(
  rng: SeededRandom,
  type: TreasureType,
  difficulty: number
): TreasureEntry {
  const id = `treasure-${nanoid(8)}`;

  switch (type) {
    case "coins":
      return generateCoins(rng, id, difficulty);
    case "gems":
      return generateGem(rng, id, difficulty);
    case "art":
      return generateArtObject(rng, id, difficulty);
    case "item":
      return generateMundaneItem(rng, id);
    case "magic_item":
      return generateMagicItemEntry(rng, id, difficulty);
  }
}

function generateCoins(
  rng: SeededRandom,
  id: string,
  difficulty: number
): TreasureEntry {
  const table = COIN_TABLES[difficulty] ?? COIN_TABLES[2];
  const copper = rng.between(0, table.copper);
  const silver = rng.between(0, table.silver);
  const gold = rng.between(0, table.gold);
  const platinum = rng.between(0, table.platinum);

  const parts: string[] = [];
  if (copper > 0) parts.push(`${copper} cp`);
  if (silver > 0) parts.push(`${silver} sp`);
  if (gold > 0) parts.push(`${gold} gp`);
  if (platinum > 0) parts.push(`${platinum} pp`);

  return {
    id,
    type: "coins",
    name: "Coins",
    value: parts.join(", ") || "1 cp",
    looted: false,
  };
}

function generateGem(
  rng: SeededRandom,
  id: string,
  difficulty: number
): TreasureEntry {
  const valueOptions = [10, 50, 100, 500, 1000];
  const maxIndex = Math.min(difficulty, valueOptions.length - 1);
  const valueIndex = rng.between(0, maxIndex);
  const value = valueOptions[valueIndex];

  const gems = GEMS_BY_VALUE[value];
  const gem = rng.pick(gems);

  return {
    id,
    type: "gems",
    name: `${gem.charAt(0).toUpperCase()}${gem.slice(1)}`,
    value: `${value} gp`,
    description: `A ${gem} worth ${value} gold pieces`,
    looted: false,
  };
}

function generateArtObject(
  rng: SeededRandom,
  id: string,
  difficulty: number
): TreasureEntry {
  const valueOptions = [25, 250, 750, 2500];
  const maxIndex = Math.min(difficulty - 1, valueOptions.length - 1);
  const valueIndex = Math.max(0, rng.between(0, maxIndex));
  const value = valueOptions[valueIndex];

  const objects = ART_OBJECTS[value];
  const object = rng.pick(objects);

  return {
    id,
    type: "art",
    name: object,
    value: `${value} gp`,
    description: object,
    looted: false,
  };
}

function generateMundaneItem(rng: SeededRandom, id: string): TreasureEntry {
  const item = rng.pick(MUNDANE_ITEMS);

  return {
    id,
    type: "item",
    name: item,
    description: item,
    looted: false,
  };
}

function generateMagicItemEntry(
  rng: SeededRandom,
  id: string,
  difficulty: number
): TreasureEntry {
  // Higher difficulty = better chance of rare items
  const rarity = difficulty >= 4 && rng.chance(0.3)
    ? "rare"
    : difficulty >= 3 && rng.chance(0.4)
    ? "uncommon"
    : rng.pickWeighted(MAGIC_ITEM_RARITY_WEIGHTS);

  const items = MAGIC_ITEMS_BY_RARITY[rarity];
  const item = rng.pick(items);

  return {
    id,
    type: "magic_item",
    name: item.name,
    description: item.description,
    magicItemId: `magic-${nanoid(8)}`,
    looted: false,
  };
}

/**
 * Generate a magic item directly.
 */
export function generateMagicItem(
  seed: string,
  rarity?: MagicItemRarity
): MagicItem {
  const rng = new SeededRandom(`${seed}-magic`);
  const actualRarity = rarity ?? rng.pickWeighted(MAGIC_ITEM_RARITY_WEIGHTS);
  const items = MAGIC_ITEMS_BY_RARITY[actualRarity];
  const template = rng.pick(items);

  return {
    ...template,
    id: `magic-${nanoid(8)}`,
  };
}
