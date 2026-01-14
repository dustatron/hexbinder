import { nanoid } from "nanoid";
import type { MagicItem, MagicItemRarity } from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Item Type Tables ===

const ITEM_TYPES = ["weapon", "armor", "ring", "wondrous", "potion", "scroll", "staff", "wand"];

const ITEM_TYPE_WEIGHTS = createWeightedTable({
  weapon: 20,
  armor: 15,
  ring: 10,
  wondrous: 25,
  potion: 15,
  scroll: 10,
  staff: 3,
  wand: 2,
});

const RARITY_WEIGHTS = createWeightedTable<MagicItemRarity>({
  common: 50,
  uncommon: 30,
  rare: 15,
  legendary: 5,
});

// === Name Generation Tables ===

const PREFIXES_BY_TYPE: Record<string, string[]> = {
  weapon: ["Keen", "Flaming", "Frost", "Thunder", "Holy", "Vengeful", "Swift", "Brutal"],
  armor: ["Gleaming", "Shadowed", "Adamantine", "Mithral", "Guardian", "Resilient"],
  ring: ["Silver", "Gold", "Obsidian", "Crystal", "Enchanted", "Signet"],
  wondrous: ["Mysterious", "Ancient", "Blessed", "Cursed", "Ethereal", "Prismatic"],
  potion: ["Minor", "Greater", "Supreme", "Volatile", "Stable", "Pure"],
  scroll: ["Arcane", "Divine", "Ritual", "Quick", "Potent", "Lesser"],
  staff: ["Oaken", "Crystal", "Iron", "Serpent", "Phoenix", "Dragon"],
  wand: ["Bone", "Yew", "Elder", "Ivory", "Obsidian", "Copper"],
};

const SUFFIXES_BY_TYPE: Record<string, string[]> = {
  weapon: ["Blade", "Edge", "Fang", "Claw", "Strike", "Fury"],
  armor: ["Mail", "Plate", "Shield", "Guard", "Bulwark", "Aegis"],
  ring: ["Band", "Loop", "Circle", "Seal", "Ring"],
  wondrous: ["Charm", "Token", "Talisman", "Amulet", "Pendant", "Orb"],
  potion: ["Draught", "Elixir", "Tonic", "Philter", "Brew"],
  scroll: ["Incantation", "Invocation", "Ritual", "Formula"],
  staff: ["Staff", "Rod", "Cane", "Baton"],
  wand: ["Wand", "Focus", "Channeler"],
};

// === Effect Tables ===

const EFFECTS_BY_TYPE: Record<string, Record<MagicItemRarity, string[]>> = {
  weapon: {
    common: ["+1 to damage", "Glows faintly", "Never dulls"],
    uncommon: ["+1 to attack and damage", "Deals extra 1d6 damage of a type", "Returns when thrown"],
    rare: ["+2 to attack and damage", "Deals extra 2d6 damage", "Can cast a spell 1/day"],
    legendary: ["+3 to attack and damage", "Vorpal effect", "Grants flight"],
  },
  armor: {
    common: ["Comfortable in any weather", "Self-cleaning", "Resizes to fit"],
    uncommon: ["+1 to AC", "Resistance to one damage type", "Advantage on saves"],
    rare: ["+2 to AC", "Resistance to two damage types", "Can cast Shield 3/day"],
    legendary: ["+3 to AC", "Immunity to one damage type", "Grants etherealness"],
  },
  ring: {
    common: ["Detects magic nearby", "Changes color with mood", "Translates one language"],
    uncommon: ["+1 to saves", "Grants darkvision", "Stores one spell"],
    rare: ["+2 to saves", "Grants invisibility 1/day", "Teleportation 1/day"],
    legendary: ["Grants three wishes", "Mind shielding", "Elemental command"],
  },
  wondrous: {
    common: ["Provides light", "Keeps items fresh", "Mends small items"],
    uncommon: ["Bag of holding", "Boots of speed", "Cloak of protection"],
    rare: ["Flying carpet", "Portable hole", "Robe of stars"],
    legendary: ["Cube of force", "Talisman of pure good", "Well of many worlds"],
  },
  potion: {
    common: ["Heals 2d4+2 HP", "Grants water breathing for 1 hour", "Removes minor ailments"],
    uncommon: ["Heals 4d4+4 HP", "Grants flying for 1 hour", "Grants invisibility"],
    rare: ["Heals 8d4+8 HP", "Grants giant strength", "Grants speed"],
    legendary: ["Full heal", "Grants invulnerability", "Grants longevity"],
  },
  scroll: {
    common: ["Contains a 1st level spell", "One-time protection ward", "Sends a message"],
    uncommon: ["Contains a 2nd-3rd level spell", "Summons a creature", "Creates a portal"],
    rare: ["Contains a 4th-5th level spell", "Mass effect spell", "Resurrection"],
    legendary: ["Contains a 7th+ level spell", "Wish scroll", "True resurrection"],
  },
  staff: {
    common: ["Casts Light at will", "Can be used as a weapon", "+1 to spell attack"],
    uncommon: ["Contains 10 charges of 1st level spells", "+1 to spell DC", "Grants +1 AC"],
    rare: ["Contains 20 charges", "Can cast 3rd level spells", "+2 to spell attacks"],
    legendary: ["Contains 50 charges", "Grants spell absorption", "Can cast 9th level spells"],
  },
  wand: {
    common: ["Casts Prestidigitation", "10 charges of a cantrip", "Detects magic"],
    uncommon: ["7 charges of a 1st level spell", "Wand of magic missiles", "+1 to spell DC"],
    rare: ["7 charges of a 2nd-3rd level spell", "Wand of fireballs", "Wand of lightning"],
    legendary: ["50 charges of any spell", "Wand of orcus", "Wand of wonder"],
  },
};

// === Curse Tables ===

const CURSES = [
  "Cannot be willingly removed",
  "Attracts monsters",
  "Whispers dark thoughts",
  "Causes paranoia",
  "Drains life force",
  "Binds to a dark entity",
  "Causes uncontrollable rage",
  "Inflicts nightmares",
];

export interface MagicItemGeneratorOptions {
  seed: string;
  rarity?: MagicItemRarity;
  type?: string;
  cursedChance?: number;
}

/**
 * Generate a complete magic item.
 */
export function generateCompleteMagicItem(options: MagicItemGeneratorOptions): MagicItem {
  const { seed, rarity, type, cursedChance = 0.05 } = options;
  const rng = new SeededRandom(`${seed}-magic-item`);

  const finalRarity = rarity ?? rng.pickWeighted(RARITY_WEIGHTS);
  const finalType = type ?? rng.pickWeighted(ITEM_TYPE_WEIGHTS);
  const name = generateItemName(rng, finalType, finalRarity);
  const effect = generateItemEffect(rng, finalType, finalRarity);
  const description = generateItemDescription(rng, finalType, finalRarity);

  // Rare and legendary items have higher curse chance
  const actualCurseChance = finalRarity === "legendary" ? cursedChance * 3
    : finalRarity === "rare" ? cursedChance * 2
    : cursedChance;

  const cursed = rng.chance(actualCurseChance);
  const curseEffect = cursed ? rng.pick(CURSES) : undefined;

  const item: MagicItem = {
    id: `magic-${nanoid(8)}`,
    name,
    type: finalType,
    rarity: finalRarity,
    description,
    effect: cursed ? `${effect}. CURSE: ${curseEffect}` : effect,
    cursed,
  };

  // Add charges for appropriate item types
  if (["staff", "wand", "ring"].includes(finalType) && rng.chance(0.6)) {
    item.charges = getChargesForRarity(rng, finalRarity);
  }

  return item;
}

function generateItemName(rng: SeededRandom, type: string, rarity: MagicItemRarity): string {
  const prefixes = PREFIXES_BY_TYPE[type] ?? ["Mysterious"];
  const suffixes = SUFFIXES_BY_TYPE[type] ?? ["Item"];

  const prefix = rng.pick(prefixes);
  const suffix = rng.pick(suffixes);

  // Higher rarity = more elaborate names
  if (rarity === "legendary") {
    const titles = ["of the Ages", "of Power", "of Doom", "of the Ancients", "of Legends"];
    return `${prefix} ${suffix} ${rng.pick(titles)}`;
  }

  if (rarity === "rare" && rng.chance(0.5)) {
    const epithets = ["Supreme", "Greater", "True", "Royal"];
    return `${rng.pick(epithets)} ${prefix} ${suffix}`;
  }

  return `${prefix} ${suffix}`;
}

function generateItemEffect(rng: SeededRandom, type: string, rarity: MagicItemRarity): string {
  const effects = EFFECTS_BY_TYPE[type]?.[rarity] ?? [`A ${rarity} ${type} effect`];
  return rng.pick(effects);
}

function generateItemDescription(rng: SeededRandom, type: string, rarity: MagicItemRarity): string {
  const materials: Record<MagicItemRarity, string[]> = {
    common: ["iron", "leather", "wood", "cloth"],
    uncommon: ["steel", "silver", "fine leather", "silk"],
    rare: ["mithral", "gold", "dragonhide", "enchanted crystal"],
    legendary: ["adamantine", "platinum", "divine essence", "solidified starlight"],
  };

  const conditions = ["well-crafted", "ancient", "ornate", "mysterious", "gleaming"];

  const material = rng.pick(materials[rarity]);
  const condition = rng.pick(conditions);

  return `A ${condition} ${type} made of ${material}`;
}

function getChargesForRarity(rng: SeededRandom, rarity: MagicItemRarity): number {
  const ranges: Record<MagicItemRarity, [number, number]> = {
    common: [3, 7],
    uncommon: [5, 10],
    rare: [10, 20],
    legendary: [20, 50],
  };
  const [min, max] = ranges[rarity];
  return rng.between(min, max);
}

/**
 * Generate a random magic item of specified rarity.
 */
export function generateRandomMagicItem(seed: string, rarity?: MagicItemRarity): MagicItem {
  return generateCompleteMagicItem({ seed, rarity });
}
