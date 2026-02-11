/**
 * Creature ID normalization and cross-system mapping
 *
 * Uses app-level slugs as canonical IDs (e.g., "giant-frog", "dire-wolf").
 * Each rule system has its own direct mapping from slugs.
 *
 * Maps between:
 * - App slugs (canonical): "giant-frog", "dire-wolf"
 * - Shadowdark names: "Frog, Giant", "Wolf, Dire"
 * - Cairn titles: "Giant Toad", "Dire Wolf"
 * - Legacy plural names: "wolves", "bears" (for backwards compat)
 */

// App slugs -> Shadowdark monster name (lowercase for lookup)
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

// App slugs -> Cairn monster title (exact case for lookup)
export const SLUG_TO_CAIRN: Record<string, string> = {
  // Plains
  "wolf": "Wolf",
  "warhorse": "Horse, War",
  "bandit": "Bandit",
  "giant-eagle": "Giant Eagle",
  "gnoll": "Gnoll",
  "centaur": "Centaur",

  // Forest
  "giant-spider": "Giant Spider",
  "goblin": "Goblin",
  "owlbear": "Owlbear",
  "dryad": "Dryad",
  "dire-wolf": "Dire Wolf",

  // Hills
  "giant-goat": "Goat, Giant",
  "orc": "Orc",
  "hippogriff": "Hippogriff",
  "ogre": "Ogre",
  "hobgoblin": "Hobgoblin",
  "peryton": "Peryton",

  // Mountains
  "mountain-lion": "Mountain Lion",
  "harpy": "Harpy",
  "stone-giant": "Stone Giant",
  "wyvern": "Wyvern",
  "roc": "Roc",

  // Water
  "giant-crab": "Giant Crab",
  "merfolk": "Merman",
  "sea-hag": "Sea Hag",
  "giant-octopus": "Giant Octopus",
  "sahuagin": "Sahuagin",
  "water-elemental": "Water Elemental",

  // Swamp
  "giant-frog": "Giant Toad",
  "lizardfolk": "Lizardfolk",
  "giant-crocodile": "Crocodile, Giant",
  "will-o-wisp": "Will-o-the-Wisp",
  "shambling-mound": "Shambling Mound",
  "black-dragon-young": "Dragon, Black",
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
  return SLUG_TO_CAIRN[slug];
}

/**
 * Check if a creature has a Cairn equivalent
 */
export function hasCairnEquivalent(name: string): boolean {
  return getCairnTitle(name) !== undefined;
}

// === Obojima Creature Stats ===
// Inline stat summaries from the Obojima bestiary
// Used for encounter cards since these creatures aren't in Shadowdark/Cairn databases

export interface ObojimaStat {
  name: string;
  cr: number;
  ac: number;
  hp: number;
  speed: string;
  attack: string;
  special?: string;
}

export const OBOJIMA_CREATURE_STATS: Record<string, ObojimaStat> = {
  "dustbunny": { name: "Dustbunny", cr: 0, ac: 12, hp: 2, speed: "40ft", attack: "Kick +4, 1 bludg", special: "Teleport 20ft, no opportunity attacks" },
  "howler-yipper": { name: "Howler Yipper", cr: 0.5, ac: 14, hp: 22, speed: "30ft", attack: "Chomp +4, 1d6+2; Club +4, 1d6+2; Longbow +3, 1d8+1", special: "Sleep-Deprived, Discouraging Chuckle" },
  "howler-stalker": { name: "Howler Stalker", cr: 1, ac: 14, hp: 27, speed: "40ft", attack: "Chomp +5, 1d6+3; Shortsword +5, 1d6+3", special: "Paranoid (can't be surprised)" },
  "howler-snarler": { name: "Howler Snarler", cr: 2, ac: 14, hp: 44, speed: "30ft", attack: "Chomp +4, 1d8+3; Club +4, 1d8+3", special: "Pack Leader, Discouraging Chuckle" },
  "yokario": { name: "Yokario", cr: 0.25, ac: 13, hp: 13, speed: "30ft", attack: "Drum Mallet +4, 1d6+2; Sling +4, 1d4+2", special: "Music-loving goblin-like creatures" },
  "dragon-frog": { name: "Dragon Frog", cr: 1, ac: 15, hp: 45, speed: "45ft", attack: "Chomp +4, 2d6+2; Pulling Tongue DC 12", special: "Magic Removal (level 3 or lower), Standing Leap 30ft" },
  "animalistic-spirit": { name: "Animalistic Spirit", cr: 1, ac: 14, hp: 39, speed: "40ft", attack: "Chomp +5, 2d6+3 + Prone", special: "Promising Threat (Adv on Intimidation)" },
  "hill-dragon": { name: "Hill Dragon", cr: 3, ac: 15, hp: 75, speed: "50ft", attack: "Rend +5, 1d8+3 (x2); Tail +5, 1d10+3 + Prone", special: "Hunting Prowess, Use of Terrain" },
  "field-giant": { name: "Field Giant", cr: 3, ac: 15, hp: 81, speed: "30ft", attack: "Tail +7, 2d10+5 + push 15ft", special: "Magic Resistance, no food/drink/sleep" },
  "mossling": { name: "Mossling", cr: 0, ac: 9, hp: 10, speed: "10ft", attack: "Perfume Poof: Pacify Person DC 11", special: "Shy woodland spirits" },
  "kafuka": { name: "Kafuka", cr: 2, ac: 14, hp: 45, speed: "30ft, climb 30ft", attack: "Claw +5, 1d6+3 (x2)", special: "Mimicry, Summon Swarm 2/Day, spellcaster" },
  "vespoma": { name: "Vespoma", cr: 1, ac: 13, hp: 33, speed: "20ft, fly 20ft", attack: "Chomp +4, 1d4+2; Claw +4, 2d4+2", special: "Master's Voice (Command spell)" },
  "lions-blume": { name: "Lion's Blume", cr: 0.25, ac: 12, hp: 16, speed: "10ft", attack: "Chomp +4, 1d4+2 (10ft reach)", special: "Thorn-Covered (1d4 when grappling)" },
  "watchwood-tree": { name: "Watchwood Tree", cr: 0.5, ac: 13, hp: 25, speed: "10ft", attack: "Slam +4, 2d6+2 (15ft reach)", special: "False Appearance, Unruly Earth (Difficult Terrain 15ft)" },
  "acorn-crab": { name: "Acorn Crab", cr: 2, ac: 14, hp: 58, speed: "30ft, climb 30ft", attack: "Claw +5, 1d8+3 (x2)", special: "Drop Attack, camouflage in trees" },
  "stul": { name: "Stul", cr: 3, ac: 14, hp: 58, speed: "30ft", attack: "Chomp +5, 2d8+3 + 3d6 poison", special: "Hallucinatory Chatter DC 12 (Charmed, 30ft)" },
  "cat-of-prodigious-size": { name: "Cat of Prodigious Size", cr: 8, ac: 15, hp: 157, speed: "50ft, climb 40ft", attack: "Chomp +9, 3d12+6; Claw +9, 3d10+6", special: "Leaping Strike 100ft, reduce fall damage by 200ft" },
  "pixie": { name: "Pixie", cr: 0.5, ac: 14, hp: 15, speed: "30ft, fly 30ft", attack: "Gift of Flight (recharge 6)", special: "Magic Resistance, spellcaster" },
  "sheep-dragon": { name: "Sheep Dragon", cr: 3, ac: 14, hp: 75, speed: "20ft, fly 90ft (hover)", attack: "Chomp +5, 1d6+3; Headbutt +3, 1d12+1", special: "Rush (pull + Prone when flying past)" },
  "rubble-golem": { name: "Rubble Golem", cr: 11, ac: 17, hp: 178, speed: "30ft", attack: "Slam +10, 3d10+6 (x3)", special: "Immutable Form, Magic Resistance, Collapse" },
  "harpy-obojima": { name: "Harpy", cr: 1, ac: 13, hp: 38, speed: "30ft, fly 50ft", attack: "Claws +4, 2d4+2 (Adv if target damaged)", special: "Flyby, Battle Fury 1/Day" },
  "snowball-spirits": { name: "Snowball Spirits", cr: 4, ac: 14, hp: 58, speed: "60ft", attack: "Slam +5, 4d10+3; Pelt +5, 2d6+3 (x3)", special: "Snowball (absorb snow for 10 HP + grow)" },
  "slagger": { name: "Slagger", cr: 8, ac: 16, hp: 126, speed: "fly 60ft (hover)", attack: "Slam +7, 4d6+4 (x2); Spew Magma +8, 2d8+5 fire", special: "Fire Aura 5ft, Scorch, Cough 3d12 poison" },
  "cuddle-bug": { name: "Cuddle Bug", cr: 0.125, ac: 12, hp: 10, speed: "20ft, burrow 10ft", attack: "Drain Heat +3, 1d6+1 cold", special: "Heat Consumption (Freeze Points)" },
  "fish-folk": { name: "Fish Folk", cr: 0.5, ac: 12, hp: 26, speed: "30ft, swim 40ft", attack: "Chomp +4, 1d4+2; Shortsword +4, 1d6+2", special: "Lucky Fool 1/Day" },
  "giant-jellyfish": { name: "Giant Jellyfish", cr: 1, ac: 15, hp: 87, speed: "fly 20ft, swim 20ft", attack: "Toxins DC 12 CON, 1d6 poison + Stunned", special: "Amphibious, contact damage" },
  "skeletal-fish": { name: "Skeletal Fish", cr: 1, ac: 13, hp: 35, speed: "fly 40ft, swim 40ft", attack: "Chomp +4, 4d6+2 (swarm)", special: "Shrapnel (Disadv on next attack when swarm damaged)" },
  "hammer-gull": { name: "Hammer Gull", cr: 1, ac: 13, hp: 37, speed: "10ft, fly 80ft", attack: "Peck +5, 1d6+3 (x2)", special: "Boulder Drop 3d6 + Prone" },
  "bearracuda": { name: "Bearracuda", cr: 2, ac: 13, hp: 68, speed: "fly 60ft", attack: "Chomp +6, 2d8+4", special: "Pacifying Light (Unconscious when Blinded)" },
  "seaweed-elemental": { name: "Seaweed Elemental", cr: 5, ac: 14, hp: 110, speed: "30ft, swim 90ft", attack: "Slam +6, 2d6+3 + 1d6 poison (x2)", special: "Entangling Form, False Appearance, Amorphous" },
  "stone-whale": { name: "Stone Whale", cr: 6, ac: 16, hp: 114, speed: "fly 60ft, swim 60ft", attack: "Chomp +8, 3d8+5 (x2)", special: "Earth Aquatic (move through stone)" },
  "deep-angler": { name: "Deep Angler", cr: 10, ac: 14, hp: 186, speed: "10ft, swim 60ft", attack: "Chomp +10, 3d10+6 + Grapple; Swallow DC 18", special: "Illusionary Lure, can swallow 3 creatures" },
  "corrupted-muk": { name: "Corrupted Muk", cr: 0.25, ac: 11, hp: 27, speed: "30ft", attack: "Slam +3, 1d6+1", special: "Endless Resource (regain 10 HP in Corruption pool)" },
  "corrupted-slime": { name: "Corrupted Slime", cr: 1, ac: 13, hp: 45, speed: "20ft", attack: "Spike +5, 1d6+3 + 1d8 necrotic", special: "Sickness DC 13 (Exhaustion, 5ft aura)" },
  "green-slime": { name: "Green Slime", cr: 0.25, ac: 13, hp: 19, speed: "20ft", attack: "Spike +4, 1d4+2 + 1d4 acid", special: "Amorphous, Flee (split into pieces)" },
  "soda-slime": { name: "Soda Slime", cr: 0.5, ac: 12, hp: 21, speed: "10ft, climb 10ft", attack: "Pseudopod +3, 1d6+1 + 1d8 poison", special: "False Appearance, Soda Pop (explodes at 0 HP)" },
  "yellow-slime": { name: "Yellow Slime", cr: 5, ac: 14, hp: 90, speed: "30ft", attack: "Spike +7, 1d6+4 + 2d6 acid (x2)", special: "Repulsive Stench, Sticky, Amorphous" },
  "vile-corruption": { name: "Vile Corruption", cr: 8, ac: 16, hp: 123, speed: "30ft", attack: "Chomp +7, 3d10+4; Claw +7, 3d8+4 (x2)", special: "Flammable, Magic Resistance, Shape-Shift" },
  "orange-slime": { name: "Orange Slime", cr: 10, ac: 16, hp: 147, speed: "30ft", attack: "Spike +9, 3d8+5 + 2d8 fire (x2, 10ft)", special: "Explosive, Steaming, Sulfurous Haze" },
  "demon-obojima": { name: "Demon", cr: 2, ac: 13, hp: 27, speed: "30ft, fly 30ft", attack: "Chomp +4, 1d6+2; Spectral Pass +4, 1d10+2 necrotic", special: "Intrusive Thoughts DC 11 (10ft aura)" },
  "crawler-demon": { name: "Crawler", cr: 4, ac: 15, hp: 93, speed: "60ft", attack: "Constrict +6, 1d8+3 + memory loss; Stomp +6, 1d10+3 (x3)", special: "Hypnotic DC 12 (30ft aura)" },
  "pest-spirit": { name: "Pest Spirit", cr: 0, ac: 11, hp: 7, speed: "20ft", attack: "Frustration DC 10 (5ft)", special: "Distracting Maneuver, Hard to Catch" },
  "wandering-door": { name: "Wandering Door", cr: 0, ac: 12, hp: 8, speed: "150ft, climb 150ft", attack: "Shake DC 19 STR, throw 10ft + Prone", special: "Teleport to any doorway on any plane, Legendary Resistance 7/Day" },
};
