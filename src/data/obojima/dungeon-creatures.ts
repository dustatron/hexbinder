// Obojima-specific creature pools for dungeon themes
// Replaces generic D&D creatures with Obojima bestiary equivalents
// Used by build-obojima-world.ts to post-process generated dungeons

import type { DungeonTheme } from "~/models";

/**
 * Obojima creature pools per dungeon theme.
 * Creature names here are display names (not slugs) since that's what
 * DungeonBlueprints.creaturePool and creatureType fields use.
 */
export const OBOJIMA_DUNGEON_CREATURES: Record<DungeonTheme, string[]> = {
  tomb: [
    "corrupted_muk",
    "corrupted_slime",
    "akaobata",
    "pest_spirit",
    "animalistic_spirit",
    "green_slime",
  ],

  cave: [
    "stul",
    "kafuka",
    "cuddle_bug",
    "soda_slime",
    "dragon_frog",
    "vespoma",
    "giant_bora_bug",
  ],

  temple: [
    "clone_of_viota",
    "postal_knight",
    "yokario",
    "demon",
    "goro_goro",
    "pixie",
  ],

  mine: [
    "rubble_golem",
    "green_slime",
    "cuddle_bug",
    "soda_slime",
    "yokario",
    "corrupted_muk",
  ],

  fortress: [
    "howler_snarler",
    "howler_stalker",
    "howler_yipper",
    "postal_knight",
    "fish_folk",
    "clone_of_viota",
  ],

  sewer: [
    "corrupted_muk",
    "corrupted_slime",
    "green_slime",
    "soda_slime",
    "fish_folk",
    "blowbelly_pufferfish",
  ],

  crypt: [
    "corrupted_muk",
    "corrupted_slime",
    "akaobata",
    "pest_spirit",
    "animalistic_spirit",
    "green_slime",
  ],

  lair: [
    "hill_dragon",
    "cat_of_prodigious_size",
    "stul",
    "field_giant",
    "kafuka",
    "bearracuda",
  ],

  shrine: [
    "mossling",
    "pixie",
    "watchwood_tree",
    "lions_blume",
    "giant_bora_bug",
    "dragon_frog",
  ],

  bandit_hideout: [
    "howler_snarler",
    "howler_stalker",
    "howler_yipper",
    "yokario",
    "howler_snarler",
  ],

  cultist_lair: [
    "demon",
    "crawler",
    "vile_corruption",
    "goro_goro",
    "akaobata",
    "corrupted_slime",
  ],

  witch_hut: [
    "witch",
    "kafuka",
    "vespoma",
    "mossling",
    "dragon_frog",
    "pixie",
  ],

  sea_cave: [
    "fish_folk",
    "lionfish_king",
    "giant_jellyfish",
    "skeletal_fish",
    "seaweed_elemental",
    "blowbelly_pufferfish",
  ],

  beast_den: [
    "hill_dragon",
    "cat_of_prodigious_size",
    "bearracuda",
    "sheep_dragon",
    "acorn_crab",
    "field_giant",
  ],

  floating_keep: [
    "harpy",
    "sheep_dragon",
    "snowball_spirits",
    "hammer_gull",
    "slagger",
    "giant_jellyfish",
  ],
};
