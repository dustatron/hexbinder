// Obojima-specific quest object name/description pools
// Replaces generic D&D quest objects with Obojima-themed equivalents
// Used by build-obojima-world.ts to post-process generated quest objects

import type { QuestObjectType } from "~/models";

export const OBOJIMA_QUEST_NAMES: Record<QuestObjectType, string[]> = {
  plant: [
    "Witch's Eye Coral",
    "Spirit Blossom",
    "Moonvine",
    "Drowner's Kelp",
    "Lion's Blume Seedling",
    "Corruption Thorn",
    "Spirit Grass Tuft",
    "Ghost Orchid",
    "Tide Lily",
    "Amber Fern",
    "Dragon Pepper",
    "Cuddle Bug Moss",
  ],

  mineral: [
    "Spirit Coal Deposit",
    "First Age Alloy Fragment",
    "Nakudama Crystal",
    "Starstone Geode",
    "Sea Glass Cluster",
    "Volcanic Glass Shard",
    "Coral Stone",
    "Shell Ore",
    "Iron Sand Vein",
    "Moon Pearl",
    "Storm Quartz",
    "Spirit-Touched Amber",
  ],

  artifact: [
    "Cracked Cassette Tape",
    "Rusted Floppy Disk",
    "Corroded Circuit Board",
    "Battered Walkie-Talkie",
    "Dented Soda Can (Magical)",
    "Faded Instaprint Photo",
    "Broken Calculator Watch",
    "Tarnished Subway Token",
    "Cracked CRT Screen",
    "Old Vinyl Record",
    "Waterlogged Arcade Token",
    "Bent Radio Antenna",
  ],

  remains: [
    "Nakudama Warrior's Armor",
    "Fossilized Spirit Shell",
    "Petrified Mossling",
    "Fish Folk Skeleton",
    "Corrupted Beast Husk",
    "Fallen Ranger's Pack",
    "Ancient Pilot's Jacket",
    "Wrecked Kite-Plane Fragment",
    "Shattered Spirit Vessel",
    "Abandoned Courier Satchel",
    "Drowned Sailor's Effects",
    "Howler Den Remnants",
  ],
};

export const OBOJIMA_QUEST_DESCRIPTIONS: Record<QuestObjectType, string[]> = {
  plant: [
    "Glows faintly with spirit energy. Prized by the Fish Head Coven.",
    "Grows only where Corruption meets clean soil. Handle with care.",
    "Said to bloom when a spirit is nearby. Alchemists pay well for it.",
    "Its petals shimmer like the Shallows at dawn. Used in healing tonics.",
    "Dangerous to touch without gloves — the thorns carry Corruption.",
    "Smells of the sea even miles inland. Witches brew it into ward-potions.",
    "A rare specimen that feeds on spirit residue. The AHA would want samples.",
    "Releases spores that glow blue at night. Marks old spirit paths.",
  ],
  mineral: [
    "Dark crystals that shimmer with trapped energy. The Wandering Line ran on this.",
    "First Age metal — lighter than steel, stronger than iron. Lom & Salt pays top coin.",
    "Hums faintly when touched. Nakudama sealing magic is stored within.",
    "Radiates warmth even in cold weather. Spirit-touched from the deep earth.",
    "Worth a fortune to the right buyer. Dawn Blossom would broker a deal.",
    "Ancient ore exposed by erosion. The AHA has been cataloguing deposits.",
    "Fused coral and stone — formed where spirit energy pooled for centuries.",
    "Sand that sparkles with iron and spirit residue. Used in traditional forging.",
  ],
  artifact: [
    "First Age tech — still faintly humming. A wizard could use this as a spell focus.",
    "Covered in First Age script. The AHA would pay for intact specimens.",
    "Contains residual magic — could be recharged by a witch or spirit-smith.",
    "A relic of the old world. Collectors in Yatamon would bid high.",
    "Still works if powered by a spirit or Jolt spell. Useful or valuable.",
    "Waterlogged but intact. First Age preservation magic kept it from total decay.",
    "Bears the stamp of a First Age manufacturer. Surprisingly good condition.",
    "Something stirs inside when spirit energy is nearby. Not quite dead tech.",
  ],
  remains: [
    "From the Second Age conflicts. The armor still bears clan markings.",
    "Petrified by Corruption. Whatever lived in this shell was spirit-touched.",
    "The Greenward Path would want to know about this — recent kill.",
    "Bones picked clean by scavengers. The gear might still be salvageable.",
    "Corrupted beyond recognition. Whatever it was, it suffered.",
    "Pack still sealed. Contains ranger supplies and a half-finished map.",
    "Flight insignia still visible. From the Broken Bird era.",
    "Scattered wreckage. The spirit that powered it has long since fled.",
  ],
};
