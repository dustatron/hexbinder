// Obojima Creature Tables by Terrain
// Mapped from the Obojima bestiary (~60 creatures)

import type { TerrainType } from "~/models";
import type { CreatureEntry } from "./creatures";

export const OBOJIMA_CREATURES_BY_TERRAIN: Record<TerrainType, CreatureEntry[]> = {
  plains: [
    { name: "Dustbunny", slug: "dustbunny", level: 0, weight: 4, countDice: "1d4" },
    { name: "Howler Yipper", slug: "howler-yipper", level: 1, weight: 3, countDice: "1d4" },
    { name: "Howler Stalker", slug: "howler-stalker", level: 1, weight: 3, countDice: "1d2" },
    { name: "Yokario", slug: "yokario", level: 1, weight: 3, countDice: "1d4" },
    { name: "Dragon Frog", slug: "dragon-frog", level: 1, weight: 2, countDice: "1d2" },
    { name: "Animalistic Spirit", slug: "animalistic-spirit", level: 1, weight: 2, countDice: "1d2" },
    { name: "Hill Dragon", slug: "hill-dragon", level: 3, weight: 2, countDice: "1" },
    { name: "Field Giant", slug: "field-giant", level: 3, weight: 1, countDice: "1" },
    { name: "Howler Snarler", slug: "howler-snarler", level: 2, weight: 2, countDice: "1d2" },
  ],

  forest: [
    { name: "Mossling", slug: "mossling", level: 0, weight: 3, countDice: "1d4" },
    { name: "Kafuka", slug: "kafuka", level: 2, weight: 3, countDice: "1d2" },
    { name: "Vespoma", slug: "vespoma", level: 1, weight: 3, countDice: "1d4" },
    { name: "Lion's Blume", slug: "lions-blume", level: 1, weight: 3, countDice: "1d4" },
    { name: "Watchwood Tree", slug: "watchwood-tree", level: 1, weight: 2, countDice: "1" },
    { name: "Acorn Crab", slug: "acorn-crab", level: 2, weight: 2, countDice: "1d2" },
    { name: "Stul", slug: "stul", level: 3, weight: 1, countDice: "1" },
    { name: "Cat of Prodigious Size", slug: "cat-of-prodigious-size", level: 8, weight: 1, countDice: "1" },
    { name: "Pixie", slug: "pixie", level: 1, weight: 2, countDice: "1d2" },
  ],

  hills: [
    { name: "Hill Dragon", slug: "hill-dragon", level: 3, weight: 3, countDice: "1" },
    { name: "Sheep Dragon", slug: "sheep-dragon", level: 3, weight: 3, countDice: "1" },
    { name: "Howler Snarler", slug: "howler-snarler", level: 2, weight: 3, countDice: "1d4" },
    { name: "Field Giant", slug: "field-giant", level: 3, weight: 2, countDice: "1" },
    { name: "Rubble Golem", slug: "rubble-golem", level: 11, weight: 1, countDice: "1" },
    { name: "Harpy", slug: "harpy-obojima", level: 1, weight: 2, countDice: "1d4" },
  ],

  mountains: [
    { name: "Sheep Dragon", slug: "sheep-dragon", level: 3, weight: 3, countDice: "1" },
    { name: "Harpy", slug: "harpy-obojima", level: 1, weight: 3, countDice: "1d4" },
    { name: "Snowball Spirits", slug: "snowball-spirits", level: 4, weight: 2, countDice: "1" },
    { name: "Slagger", slug: "slagger", level: 8, weight: 1, countDice: "1" },
    { name: "Cuddle Bug", slug: "cuddle-bug", level: 0, weight: 3, countDice: "1d4" },
  ],

  water: [
    { name: "Fish Folk", slug: "fish-folk", level: 1, weight: 4, countDice: "1d4" },
    { name: "Giant Jellyfish", slug: "giant-jellyfish", level: 1, weight: 3, countDice: "1d2" },
    { name: "Skeletal Fish", slug: "skeletal-fish", level: 1, weight: 3, countDice: "1d4" },
    { name: "Hammer Gull", slug: "hammer-gull", level: 1, weight: 3, countDice: "1d2" },
    { name: "Bearracuda", slug: "bearracuda", level: 2, weight: 2, countDice: "1" },
    { name: "Seaweed Elemental", slug: "seaweed-elemental", level: 5, weight: 1, countDice: "1" },
    { name: "Stone Whale", slug: "stone-whale", level: 6, weight: 1, countDice: "1" },
    { name: "Deep Angler", slug: "deep-angler", level: 10, weight: 1, countDice: "1" },
  ],

  swamp: [
    { name: "Corrupted Muk", slug: "corrupted-muk", level: 0, weight: 4, countDice: "1d4" },
    { name: "Corrupted Slime", slug: "corrupted-slime", level: 1, weight: 3, countDice: "1d2" },
    { name: "Green Slime", slug: "green-slime", level: 1, weight: 3, countDice: "1d4" },
    { name: "Soda Slime", slug: "soda-slime", level: 1, weight: 2, countDice: "1d2" },
    { name: "Yellow Slime", slug: "yellow-slime", level: 5, weight: 1, countDice: "1" },
    { name: "Vile Corruption", slug: "vile-corruption", level: 8, weight: 1, countDice: "1" },
  ],

  desert: [
    { name: "Slagger", slug: "slagger", level: 8, weight: 2, countDice: "1" },
    { name: "Orange Slime", slug: "orange-slime", level: 10, weight: 1, countDice: "1" },
    { name: "Rubble Golem", slug: "rubble-golem", level: 11, weight: 1, countDice: "1" },
    { name: "Demon", slug: "demon-obojima", level: 2, weight: 3, countDice: "1d2" },
    { name: "Dustbunny", slug: "dustbunny", level: 0, weight: 4, countDice: "1d4" },
    { name: "Crawler", slug: "crawler-demon", level: 4, weight: 2, countDice: "1" },
  ],
};

// Cross-terrain creatures (spirits/demons) — added at lower weight to any terrain
const CROSS_TERRAIN_CREATURES: CreatureEntry[] = [
  { name: "Pest Spirit", slug: "pest-spirit", level: 0, weight: 1, countDice: "1d2" },
  { name: "Pixie", slug: "pixie", level: 1, weight: 1, countDice: "1" },
  { name: "Wandering Door", slug: "wandering-door", level: 0, weight: 1, countDice: "1" },
  { name: "Demon", slug: "demon-obojima", level: 2, weight: 1, countDice: "1" },
  { name: "Crawler", slug: "crawler-demon", level: 4, weight: 1, countDice: "1" },
];

/** Get Obojima creatures for a terrain, including cross-terrain pool */
export function getObojimCreaturesForTerrain(terrain: TerrainType): CreatureEntry[] {
  const base = OBOJIMA_CREATURES_BY_TERRAIN[terrain] ?? OBOJIMA_CREATURES_BY_TERRAIN.plains;

  // Add cross-terrain creatures that aren't already in the terrain list
  const existingSlugs = new Set(base.map((c) => c.slug));
  const extras = CROSS_TERRAIN_CREATURES.filter((c) => !existingSlugs.has(c.slug));

  return [...base, ...extras];
}
