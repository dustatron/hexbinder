// Creature Tables by Terrain
// Each terrain has a weighted list of creatures for encounter generation

import type { TerrainType } from "~/models";

export interface CreatureEntry {
  name: string;
  slug: string;       // reference to monster data
  level: number;      // approximate challenge
  weight: number;     // selection weight (higher = more common)
  countDice: string;  // dice notation for count, e.g. "1d4"
}

// === Creature Tables by Terrain ===

export const CREATURES_BY_TERRAIN: Record<TerrainType, CreatureEntry[]> = {
  plains: [
    { name: "Wolf Pack", slug: "wolf", level: 1, weight: 4, countDice: "1d4" },
    { name: "Wild Horses", slug: "warhorse", level: 1, weight: 3, countDice: "1d4" },
    { name: "Bandits", slug: "bandit", level: 1, weight: 3, countDice: "1d4" },
    { name: "Giant Eagle", slug: "giant-eagle", level: 2, weight: 2, countDice: "1d2" },
    { name: "Gnolls", slug: "gnoll", level: 2, weight: 2, countDice: "1d4" },
    { name: "Centaur Scout", slug: "centaur", level: 3, weight: 1, countDice: "1d2" },
  ],

  forest: [
    { name: "Wolf Pack", slug: "wolf", level: 1, weight: 4, countDice: "1d4" },
    { name: "Giant Spider", slug: "giant-spider", level: 2, weight: 3, countDice: "1d2" },
    { name: "Goblin Scouts", slug: "goblin", level: 1, weight: 3, countDice: "1d4" },
    { name: "Owlbear", slug: "owlbear", level: 4, weight: 1, countDice: "1" },
    { name: "Dryad", slug: "dryad", level: 2, weight: 2, countDice: "1" },
    { name: "Dire Wolf", slug: "dire-wolf", level: 3, weight: 2, countDice: "1d2" },
  ],

  hills: [
    { name: "Giant Goat", slug: "giant-goat", level: 1, weight: 3, countDice: "1d4" },
    { name: "Orc Raiders", slug: "orc", level: 2, weight: 3, countDice: "1d4" },
    { name: "Hippogriff", slug: "hippogriff", level: 3, weight: 2, countDice: "1d2" },
    { name: "Ogre", slug: "ogre", level: 4, weight: 1, countDice: "1" },
    { name: "Hobgoblins", slug: "hobgoblin", level: 2, weight: 2, countDice: "1d4" },
    { name: "Peryton", slug: "peryton", level: 3, weight: 1, countDice: "1d2" },
  ],

  mountains: [
    { name: "Mountain Lion", slug: "mountain-lion", level: 2, weight: 3, countDice: "1d2" },
    { name: "Harpy", slug: "harpy", level: 2, weight: 3, countDice: "1d4" },
    { name: "Giant Eagle", slug: "giant-eagle", level: 2, weight: 2, countDice: "1d2" },
    { name: "Stone Giant", slug: "stone-giant", level: 5, weight: 1, countDice: "1" },
    { name: "Wyvern", slug: "wyvern", level: 4, weight: 1, countDice: "1" },
    { name: "Roc (young)", slug: "roc", level: 6, weight: 1, countDice: "1" },
  ],

  water: [
    { name: "Giant Crab", slug: "giant-crab", level: 1, weight: 3, countDice: "1d4" },
    { name: "Merfolk", slug: "merfolk", level: 1, weight: 3, countDice: "1d4" },
    { name: "Sea Hag", slug: "sea-hag", level: 3, weight: 2, countDice: "1" },
    { name: "Giant Octopus", slug: "giant-octopus", level: 3, weight: 2, countDice: "1" },
    { name: "Sahuagin", slug: "sahuagin", level: 2, weight: 2, countDice: "1d4" },
    { name: "Water Elemental", slug: "water-elemental", level: 4, weight: 1, countDice: "1" },
  ],

  swamp: [
    { name: "Giant Frog", slug: "giant-frog", level: 1, weight: 4, countDice: "1d4" },
    { name: "Lizardfolk", slug: "lizardfolk", level: 1, weight: 3, countDice: "1d4" },
    { name: "Giant Crocodile", slug: "giant-crocodile", level: 4, weight: 2, countDice: "1" },
    { name: "Will-o'-Wisp", slug: "will-o-wisp", level: 3, weight: 2, countDice: "1d2" },
    { name: "Shambling Mound", slug: "shambling-mound", level: 5, weight: 1, countDice: "1" },
    { name: "Black Dragon (young)", slug: "black-dragon-young", level: 6, weight: 1, countDice: "1" },
  ],

  desert: [
    { name: "Giant Scorpion", slug: "giant-scorpion", level: 2, weight: 4, countDice: "1d2" },
    { name: "Gnoll Raiders", slug: "gnoll", level: 2, weight: 3, countDice: "1d4" },
    { name: "Manticore", slug: "manticore", level: 4, weight: 2, countDice: "1" },
    { name: "Giant Vulture", slug: "giant-vulture", level: 1, weight: 3, countDice: "1d4" },
    { name: "Dust Devil", slug: "air-elemental", level: 4, weight: 1, countDice: "1" },
    { name: "Blue Dragon (young)", slug: "blue-dragon-young", level: 6, weight: 1, countDice: "1" },
  ],
};

// === Helper Functions ===

import { getObojimCreaturesForTerrain } from "./creatures-obojima";

/** Get creature list for terrain, branching on themeId */
export function getCreaturesForTerrain(terrain: TerrainType, themeId?: string): CreatureEntry[] {
  if (themeId === "obojima") {
    return getObojimCreaturesForTerrain(terrain);
  }
  return CREATURES_BY_TERRAIN[terrain] ?? CREATURES_BY_TERRAIN.plains;
}

/** Calculate total weight for terrain */
export function getTotalWeight(terrain: TerrainType): number {
  return getCreaturesForTerrain(terrain).reduce((sum, c) => sum + c.weight, 0);
}

/** Get creature by index */
export function getCreatureByIndex(
  terrain: TerrainType,
  index: number
): CreatureEntry | undefined {
  const creatures = getCreaturesForTerrain(terrain);
  return creatures[index];
}
