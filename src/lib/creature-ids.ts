/**
 * Creature ID normalization and cross-system mapping
 *
 * Uses Shadowdark monster names as canonical IDs.
 * Maps between:
 * - Shadowdark exact names ("Wolf", "Bear, Brown")
 * - Encounter creature slugs ("giant-frog", "dire-wolf")
 * - Legacy plural names ("wolves", "bears")
 * - Cairn monster titles
 */

// Encounter creature slugs -> Shadowdark name (lowercase)
// These map the slugs from src/data/encounters/creatures.ts to monster database names
export const SLUG_TO_SHADOWDARK: Record<string, string> = {
  // Plains
  "wolf": "wolf",
  "warhorse": "horse, war",
  "bandit": "bandit",
  "giant-eagle": "griffon", // closest match
  "gnoll": "gnoll",
  "centaur": "centaur",

  // Forest
  "giant-spider": "spider, giant",
  "goblin": "goblin",
  "owlbear": "owlbear",
  "dryad": "dryad",
  "dire-wolf": "wolf, dire",

  // Hills
  "giant-goat": "goat, giant",
  "orc": "orc",
  "hippogriff": "hippogriff",
  "ogre": "ogre",
  "hobgoblin": "hobgoblin",
  "peryton": "peryton",

  // Mountains
  "mountain-lion": "mountain lion",
  "harpy": "harpy",
  "stone-giant": "giant, stone",
  "wyvern": "wyvern",
  "roc": "roc",

  // Water
  "giant-crab": "crab, giant",
  "merfolk": "merfolk",
  "sea-hag": "hag, sea",
  "giant-octopus": "octopus, giant",
  "sahuagin": "sahuagin",
  "water-elemental": "elemental, water",

  // Swamp
  "giant-frog": "frog, giant",
  "lizardfolk": "lizardfolk",
  "giant-crocodile": "crocodile, giant",
  "will-o-wisp": "will-o'-wisp",
  "shambling-mound": "shambling mound",
  "black-dragon-young": "dragon, black",
};

// Legacy plural/generic names -> Shadowdark name (lowercase)
// Already exists in monsters.ts, but we re-export for convenience
export const LEGACY_NAME_MAP: Record<string, string> = {
  wolves: "wolf",
  bandits: "bandit",
  merchants: "the wandering merchant",
  "wild horses": "horse",
  bears: "bear, brown",
  goblins: "goblin",
  deer: "elk",
  "wood elves": "elf",
  orcs: "orc",
  "giant eagles": "griffon",
  goats: "giant, goat",
  miners: "dwarf",
  ogres: "ogre",
  griffins: "griffon",
  dwarves: "dwarf",
  yetis: "giant, frost",
  lizardfolk: "lizardfolk",
  crocodiles: "crocodile",
  "will-o-wisps": "will-o'-wisp",
  hags: "hag, weald",
};

// Shadowdark name (lowercase) -> Cairn title
// Maps creatures that exist in both systems
export const SHADOWDARK_TO_CAIRN: Record<string, string> = {
  // Plains encounters
  wolf: "Wolf",
  bandit: "Bandit",
  horse: "Horse, Draft",
  boar: "Boar",
  centaur: "Centaur",

  // Forest encounters
  "bear, brown": "Bear, Grizzly",
  goblin: "Goblin",
  owlbear: "Owlbear",
  elf: "Elf",
  "spider, giant": "Giant Spider",

  // Hills encounters
  orc: "Orc",
  "giant, hill": "Hill Giant",
  ogre: "Ogre",
  hobgoblin: "Hobgoblin",
  gnoll: "Gnoll",

  // Mountains encounters
  griffon: "Griffon",
  "giant, stone": "Stone Giant",
  "orc, chieftain": "Orc",
  harpy: "Harpy",

  // Swamp encounters
  lizardfolk: "Lizardfolk",
  crocodile: "Crocodile",
  "will-o'-wisp": "Will-o-the-Wisp",
  "hag, weald": "Sea Hag",
  "frog, giant": "Giant Toad",

  // Common dungeon creatures
  skeleton: "Skeleton",
  zombie: "Zombie",
  ghoul: "Ghoul",
  "rat, giant": "Giant Rat",
  kobold: "Kobold",
  troll: "Troll",
  minotaur: "Minotaur",
  basilisk: "Basilisk",
  "bat, giant": "Giant Bat",
  wight: "Wight",
  wraith: "Wraith",
  vampire: "Vampire",
  lich: "Lich",
  demon: "Demon Knight",
  "dragon, red": "Dragon, Red",
  "dragon, black": "Dragon, Black",
  "dragon, green": "Dragon, Green",
  "dragon, white": "Dragon, White",
  "dragon, blue": "Dragon, Blue",
};

// Cairn title (lowercase) -> Shadowdark name (lowercase)
// Reverse mapping for when we need to go the other way
export const CAIRN_TO_SHADOWDARK: Record<string, string> = Object.fromEntries(
  Object.entries(SHADOWDARK_TO_CAIRN).map(([sd, cairn]) => [cairn.toLowerCase(), sd])
);

/**
 * Normalize any creature name to a canonical lowercase format
 * Handles Shadowdark exact names, legacy plurals, and various formats
 */
export function toCanonicalName(name: string): string {
  const lower = name.toLowerCase().trim();

  // Check if it's a legacy plural name
  if (LEGACY_NAME_MAP[lower]) {
    return LEGACY_NAME_MAP[lower];
  }

  // Already in canonical format
  return lower;
}

/**
 * Get the Shadowdark name for a creature slug
 * Returns the slug itself if no mapping exists
 */
export function slugToShadowdark(slug: string): string {
  return SLUG_TO_SHADOWDARK[slug] ?? slug;
}

/**
 * Get the Cairn title for a given creature name
 * Returns undefined if no mapping exists
 */
export function getCairnTitle(name: string): string | undefined {
  const canonical = toCanonicalName(name);
  return SHADOWDARK_TO_CAIRN[canonical];
}

/**
 * Get the Cairn title for a creature slug
 * Returns undefined if no mapping exists
 */
export function slugToCairn(slug: string): string | undefined {
  const shadowdarkName = slugToShadowdark(slug);
  return SHADOWDARK_TO_CAIRN[shadowdarkName];
}

/**
 * Check if a creature has a Cairn equivalent
 */
export function hasCairnEquivalent(name: string): boolean {
  return getCairnTitle(name) !== undefined;
}
