/**
 * Dungeon Blueprints - Theme-specific room configurations and generation rules.
 * Each theme defines its unique room types, adjacency rules, creature pools, and traps.
 */

import type {
  DungeonBlueprint,
  DungeonTheme,
  ThemeRoomType,
  ThemeRoomConfig,
  AdjacencyRule,
  TrapTemplate,
} from "~/models";

// === Universal Trap Templates ===

const UNIVERSAL_TRAPS: TrapTemplate[] = [
  {
    name: "Pit Trap",
    description: "A concealed pit trap",
    damage: "2d6 fall",
    save: "DC 12 DEX",
    themes: ["*"],
    locations: ["room", "passage"],
  },
  {
    name: "Dart Trap",
    description: "Poison dart launchers in the walls",
    damage: "1d4 + poison",
    save: "DC 13 DEX",
    themes: ["*"],
    locations: ["passage"],
  },
  {
    name: "Falling Block",
    description: "A heavy stone block drops from above",
    damage: "3d6 bludgeoning",
    save: "DC 14 DEX",
    themes: ["*"],
    locations: ["passage"],
  },
];

// === Tomb Theme ===

const TOMB_ROOM_CONFIGS: ThemeRoomConfig[] = [
  {
    type: "sarcophagus_chamber",
    names: ["Burial Vault", "Stone Sepulcher", "Royal Tomb", "Final Rest"],
    description: "Ancient sarcophagi line the walls, dust motes drift in stale air",
    geometries: ["chamber", "gallery"],
    minSize: "medium",
    features: ["sarcophagus", "funerary_urns", "death_masks"],
    treasureBonus: 1.5,
    encounterBonus: 0.5,
  },
  {
    type: "embalming_room",
    names: ["Preparation Chamber", "Embalming Hall", "Mortuary"],
    description: "Stone tables and jars of preserved organs fill this space",
    geometries: ["chamber"],
    minSize: "small",
    features: ["canopic_jars", "embalming_tools", "drained_pool"],
    treasureBonus: 0.5,
    encounterBonus: 0.3,
  },
  {
    type: "burial_niches",
    names: ["Bone Alcoves", "Resting Niches", "Wall Tombs"],
    description: "Rows of alcoves hold ancient remains",
    geometries: ["corridor", "gallery"],
    features: ["skeletal_remains", "faded_inscriptions"],
    treasureBonus: 0.3,
    encounterBonus: 0.6,
  },
  {
    type: "offering_hall",
    names: ["Offering Chamber", "Gift Hall", "Tribute Room"],
    description: "A space for offerings to the dead",
    geometries: ["chamber"],
    features: ["offering_bowls", "withered_flowers", "coins"],
    treasureBonus: 1.2,
    encounterBonus: 0.2,
  },
  {
    type: "priest_quarters",
    names: ["Priest's Cell", "Keeper's Chamber", "Guardian Quarters"],
    description: "Living quarters for tomb guardians",
    geometries: ["chamber", "alcove"],
    features: ["simple_bed", "religious_texts", "dried_food"],
    treasureBonus: 0.8,
    encounterBonus: 0.7,
  },
  {
    type: "false_tomb",
    names: ["Decoy Burial", "False Crypt", "Dummy Vault"],
    description: "A fake burial chamber designed to mislead grave robbers",
    geometries: ["chamber"],
    features: ["empty_sarcophagus", "obvious_treasures"],
    treasureBonus: 0.2,
    encounterBonus: 0.9, // Traps!
  },
  {
    type: "guardian_chamber",
    names: ["Guardian Post", "Eternal Watch", "Sentinel Room"],
    description: "A chamber where undead guardians stand eternal vigil",
    geometries: ["chamber"],
    minSize: "medium",
    features: ["statue_alcoves", "weapon_racks"],
    treasureBonus: 0.3,
    encounterBonus: 1.5,
  },
  {
    type: "treasure_vault",
    names: ["Treasure Vault", "Burial Hoard", "King's Wealth"],
    description: "The accumulated wealth meant to follow the dead",
    geometries: ["chamber", "alcove"],
    minSize: "small",
    features: ["treasure_chests", "gold_coins", "jewelry"],
    treasureBonus: 3.0,
    encounterBonus: 0.8,
  },
];

const TOMB_ADJACENCY: AdjacencyRule[] = [
  {
    roomType: "embalming_room",
    preferred: ["burial_niches", "sarcophagus_chamber"],
    forbidden: ["treasure_vault", "entrance"],
  },
  {
    roomType: "priest_quarters",
    preferred: ["offering_hall", "guardian_chamber"],
    forbidden: ["false_tomb"],
  },
  {
    roomType: "treasure_vault",
    preferred: ["sarcophagus_chamber", "guardian_chamber"],
    forbidden: ["entrance", "embalming_room"],
  },
  {
    roomType: "false_tomb",
    preferred: ["entrance", "corridor"],
    forbidden: ["treasure_vault", "sarcophagus_chamber"],
  },
];

const TOMB_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Curse Glyph",
    description: "A magical glyph etched into the floor",
    damage: "3d8 necrotic",
    save: "DC 15 WIS",
    themes: ["tomb", "crypt"],
    locations: ["room"],
  },
  {
    name: "Poison Needle Lock",
    description: "A poison needle in a door mechanism",
    damage: "1d4 + DC 14 CON or paralyzed",
    save: "DC 14 DEX",
    themes: ["tomb", "fortress"],
    locations: ["passage"],
  },
  {
    name: "Crushing Walls",
    description: "The walls slowly close in",
    damage: "4d10 bludgeoning",
    save: "DC 15 STR to hold",
    themes: ["tomb"],
    locations: ["room"],
  },
];

const TOMB_EMPTY_DESCRIPTIONS = [
  "Dust motes drift in stale air. An overturned offering bowl lies forgotten.",
  "Scratches on the wall count days. Someone was trapped here once.",
  "Faded hieroglyphs tell of a great king. The paint is crumbling.",
  "The scent of ancient incense lingers. Dried flowers crumble at a touch.",
  "Boot prints in the dust. You are not the first to come here.",
  "A cold draft whispers through cracks. The dead do not rest easy.",
];

export const TOMB_BLUEPRINT: DungeonBlueprint = {
  theme: "tomb",
  requiredRooms: ["entrance", "sarcophagus_chamber"],
  optionalRooms: [
    "embalming_room",
    "burial_niches",
    "offering_hall",
    "priest_quarters",
    "false_tomb",
    "guardian_chamber",
    "treasure_vault",
  ],
  bossRoom: "sarcophagus_chamber",
  adjacencyRules: TOMB_ADJACENCY,
  creaturePool: ["skeleton", "zombie", "mummy", "wight", "ghost", "specter"],
  trapPool: TOMB_TRAPS,
  emptyRoomDescriptions: TOMB_EMPTY_DESCRIPTIONS,
};

// === Cave Theme ===

const CAVE_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Unstable Ceiling",
    description: "Loose rocks threaten to collapse",
    damage: "3d6 bludgeoning",
    save: "DC 13 DEX",
    themes: ["cave", "mine"],
    locations: ["room", "passage"],
  },
  {
    name: "Slippery Slope",
    description: "A steep, wet incline",
    damage: "2d6 fall",
    save: "DC 12 DEX or slide",
    themes: ["cave"],
    locations: ["passage"],
  },
];

const CAVE_EMPTY_DESCRIPTIONS = [
  "Water drips steadily from stalactites. The sound echoes endlessly.",
  "Glowing fungi provide dim, eerie light. They pulse slowly.",
  "Guano covers the floor. Bats roosted here recently.",
  "A narrow squeeze leads nowhere. Someone carved initials in the rock.",
  "The air is damp and cold. Your breath mists before you.",
];

export const CAVE_BLUEPRINT: DungeonBlueprint = {
  theme: "cave",
  requiredRooms: ["entrance", "creature_nest"],
  optionalRooms: [
    "mushroom_garden",
    "underground_pool",
    "bat_roost",
    "crystal_grotto",
    "natural_chimney",
    "stalactite_hall",
    "collapsed_section",
  ],
  bossRoom: "creature_nest",
  adjacencyRules: [
    {
      roomType: "underground_pool",
      preferred: ["mushroom_garden", "crystal_grotto"],
      forbidden: ["bat_roost"],
    },
  ],
  creaturePool: ["giant_spider", "giant_bat", "cave_fisher", "troglodyte", "grick", "purple_worm_young"],
  trapPool: CAVE_TRAPS,
  emptyRoomDescriptions: CAVE_EMPTY_DESCRIPTIONS,
};

// === Temple Theme ===

const TEMPLE_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Holy Flame Jet",
    description: "Sacred flames burst from hidden vents",
    damage: "3d6 fire (half for faithful)",
    save: "DC 14 DEX",
    themes: ["temple", "shrine"],
    locations: ["room"],
  },
  {
    name: "Divine Judgment",
    description: "A magical ward strikes the unworthy",
    damage: "2d8 radiant",
    save: "DC 15 CHA",
    themes: ["temple"],
    locations: ["passage"],
  },
];

const TEMPLE_EMPTY_DESCRIPTIONS = [
  "Faded murals depict forgotten gods. Their eyes seem to follow you.",
  "Broken pews line the walls. Worship ended long ago.",
  "An altar stands bare. Offerings have long since rotted away.",
  "Incense holders hang empty. The scent of holiness has faded.",
  "Prayer cushions lie scattered. The faithful fled in haste.",
];

export const TEMPLE_BLUEPRINT: DungeonBlueprint = {
  theme: "temple",
  requiredRooms: ["entrance", "altar_room"],
  optionalRooms: [
    "nave",
    "vestry",
    "meditation_cells",
    "clergy_quarters",
    "temple_library",
    "reliquary",
    "baptistery",
  ],
  bossRoom: "altar_room",
  adjacencyRules: [
    {
      roomType: "altar_room",
      preferred: ["nave", "reliquary"],
      forbidden: ["meditation_cells"],
    },
    {
      roomType: "clergy_quarters",
      preferred: ["vestry", "temple_library"],
      forbidden: ["altar_room"],
    },
  ],
  creaturePool: ["cultist", "acolyte", "priest", "animated_armor", "gargoyle", "shadow_demon"],
  trapPool: TEMPLE_TRAPS,
  emptyRoomDescriptions: TEMPLE_EMPTY_DESCRIPTIONS,
};

// === Mine Theme ===

const MINE_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Flooded Tunnel",
    description: "Rising water threatens to drown intruders",
    damage: "Drowning risk",
    save: "DC 12 CON per round",
    themes: ["mine", "sewer"],
    locations: ["passage"],
  },
  {
    name: "Explosive Gas",
    description: "Flammable gas ignites from any spark",
    damage: "4d6 fire in 20ft",
    save: "DC 14 DEX",
    themes: ["mine"],
    locations: ["room"],
  },
];

const MINE_EMPTY_DESCRIPTIONS = [
  "Rusted tools lie abandoned. The miners left in a hurry.",
  "Cart tracks disappear into darkness. Something derailed here.",
  "Support beams creak ominously. The ceiling sags.",
  "Ore samples litter a work table. The vein was never finished.",
  "A miner's lunch sits untouched. Decades old but preserved.",
];

export const MINE_BLUEPRINT: DungeonBlueprint = {
  theme: "mine",
  requiredRooms: ["entrance", "ore_vein"],
  optionalRooms: [
    "cart_tracks",
    "collapsed_tunnel",
    "flooded_level",
    "equipment_room",
    "ore_processing",
    "shaft_entrance",
    "support_beams",
  ],
  bossRoom: "ore_vein",
  adjacencyRules: [
    {
      roomType: "ore_processing",
      preferred: ["ore_vein", "cart_tracks"],
      forbidden: ["flooded_level"],
    },
  ],
  creaturePool: ["kobold", "dwarf_ghost", "rust_monster", "earth_elemental", "purple_worm_young", "umber_hulk"],
  trapPool: MINE_TRAPS,
  emptyRoomDescriptions: MINE_EMPTY_DESCRIPTIONS,
};

// === Fortress Theme ===

const FORTRESS_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Murder Holes",
    description: "Holes above rain down arrows and oil",
    damage: "2d6 piercing + fire risk",
    save: "DC 13 DEX",
    themes: ["fortress"],
    locations: ["passage"],
  },
  {
    name: "Portcullis Trap",
    description: "Heavy portcullis drops to trap intruders",
    damage: "3d6 bludgeoning",
    save: "DC 14 DEX",
    themes: ["fortress"],
    locations: ["passage"],
  },
];

const FORTRESS_EMPTY_DESCRIPTIONS = [
  "Weapon racks stand empty. The garrison stripped it bare.",
  "Battle maps cover a table. Outdated strategies for a lost war.",
  "Bunks line the walls. Soldiers' personal effects remain.",
  "A half-finished letter lies on a desk. It was never sent.",
  "Arrow slits look out on nothing. The view has changed.",
];

export const FORTRESS_BLUEPRINT: DungeonBlueprint = {
  theme: "fortress",
  requiredRooms: ["entrance", "throne_room"],
  optionalRooms: [
    "barracks",
    "armory",
    "war_room",
    "prison_block",
    "mess_hall",
    "watchtower",
    "secret_escape",
  ],
  bossRoom: "throne_room",
  adjacencyRules: [
    {
      roomType: "barracks",
      preferred: ["armory", "mess_hall"],
      forbidden: ["throne_room", "prison_block"],
    },
    {
      roomType: "throne_room",
      preferred: ["war_room", "secret_escape"],
      forbidden: ["barracks", "mess_hall"],
    },
  ],
  creaturePool: ["hobgoblin", "orc", "ogre", "knight", "veteran", "warlord"],
  trapPool: FORTRESS_TRAPS,
  emptyRoomDescriptions: FORTRESS_EMPTY_DESCRIPTIONS,
};

// === Sewer Theme ===

const SEWER_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Toxic Gas Vent",
    description: "Noxious fumes rise from the depths",
    damage: "2d6 poison",
    save: "DC 13 CON",
    themes: ["sewer"],
    locations: ["room", "passage"],
  },
  {
    name: "Waste Surge",
    description: "A sudden flood of sewage",
    damage: "1d6 + disease risk",
    save: "DC 12 STR or swept away",
    themes: ["sewer"],
    locations: ["passage"],
  },
];

const SEWER_EMPTY_DESCRIPTIONS = [
  "The stench is overwhelming. Something died here recently.",
  "Graffiti marks thieves' cant directions. A hidden path.",
  "Rusted grates block side passages. Someone bent them.",
  "A maintenance hatch hangs open. It leads to the surface.",
  "Rats scatter at your approach. They were eating something.",
];

export const SEWER_BLUEPRINT: DungeonBlueprint = {
  theme: "sewer",
  requiredRooms: ["entrance", "junction"],
  optionalRooms: [
    "overflow_chamber",
    "maintenance_access",
    "rat_nest",
    "smuggler_cache",
    "toxic_pool",
    "drain_grate",
  ],
  bossRoom: "junction",
  adjacencyRules: [
    {
      roomType: "smuggler_cache",
      preferred: ["maintenance_access", "drain_grate"],
      forbidden: ["toxic_pool"],
    },
  ],
  creaturePool: ["giant_rat", "otyugh", "wererat", "ghoul", "crocodile", "black_pudding"],
  trapPool: SEWER_TRAPS,
  emptyRoomDescriptions: SEWER_EMPTY_DESCRIPTIONS,
};

// === Crypt Theme ===

const CRYPT_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Spectral Chains",
    description: "Ghostly chains attempt to bind the living",
    damage: "Restrained",
    save: "DC 14 STR or CHA",
    themes: ["crypt"],
    locations: ["room"],
  },
];

const CRYPT_EMPTY_DESCRIPTIONS = [
  "Bones spill from cracked ossuary walls. There are too many.",
  "Names carved in stone fade to illegibility. Forgotten dead.",
  "Candle stubs litter the floor. Someone held vigil here.",
  "A memorial wreath crumbles at a touch. Ancient grief.",
  "The air is thick with the smell of decay. It never leaves.",
];

export const CRYPT_BLUEPRINT: DungeonBlueprint = {
  theme: "crypt",
  requiredRooms: ["entrance", "sealed_vault"],
  optionalRooms: [
    "ossuary",
    "charnel_pit",
    "memorial_hall",
    "burial_alcoves",
    "caretaker_quarters",
    "ritual_chamber",
  ],
  bossRoom: "sealed_vault",
  adjacencyRules: [
    {
      roomType: "ossuary",
      preferred: ["charnel_pit", "burial_alcoves"],
      forbidden: ["caretaker_quarters"],
    },
  ],
  creaturePool: ["skeleton", "zombie", "ghoul", "wight", "wraith", "vampire_spawn"],
  trapPool: CRYPT_TRAPS,
  emptyRoomDescriptions: CRYPT_EMPTY_DESCRIPTIONS,
};

// === Lair Theme ===

const LAIR_EMPTY_DESCRIPTIONS = [
  "Bones crunch underfoot. Meals from many creatures.",
  "Claw marks gouge the walls. Territorial markings.",
  "A musty animal smell pervades everything. Recent occupation.",
  "Shed scales or fur coat the ground. Something lives here.",
  "Gnawed bones pile in a corner. Nothing was wasted.",
];

export const LAIR_BLUEPRINT: DungeonBlueprint = {
  theme: "lair",
  requiredRooms: ["entrance", "nest"],
  optionalRooms: [
    "feeding_area",
    "bone_pile",
    "sleeping_den",
    "trophy_room",
    "entrance_cave",
  ],
  bossRoom: "nest",
  adjacencyRules: [
    {
      roomType: "feeding_area",
      preferred: ["bone_pile", "nest"],
      forbidden: ["entrance"],
    },
  ],
  creaturePool: ["owlbear", "troll", "chimera", "manticore", "dragon_young", "hydra"],
  trapPool: UNIVERSAL_TRAPS,
  emptyRoomDescriptions: LAIR_EMPTY_DESCRIPTIONS,
};

// === Shrine Theme ===

const SHRINE_EMPTY_DESCRIPTIONS = [
  "Flower petals carpet the floor. Offerings from pilgrims.",
  "A peaceful aura lingers. The divine touched this place.",
  "Prayer beads hang from hooks. Left by the faithful.",
  "Spring water trickles from a font. Still pure after ages.",
  "Carved blessings cover the walls. Protection for travelers.",
];

export const SHRINE_BLUEPRINT: DungeonBlueprint = {
  theme: "shrine",
  requiredRooms: ["entrance", "offering_altar"],
  optionalRooms: [
    "sacred_pool",
    "meditation_garden",
    "pilgrim_shelter",
    "oracle_chamber",
    "relic_display",
  ],
  bossRoom: "oracle_chamber",
  adjacencyRules: [
    {
      roomType: "sacred_pool",
      preferred: ["meditation_garden", "offering_altar"],
      forbidden: ["pilgrim_shelter"],
    },
  ],
  creaturePool: ["deva", "couatl", "guardian_naga", "ki-rin", "unicorn"],
  trapPool: [...UNIVERSAL_TRAPS, ...TEMPLE_TRAPS.filter(t => t.themes.includes("shrine"))],
  emptyRoomDescriptions: SHRINE_EMPTY_DESCRIPTIONS,
};

// === Bandit Hideout Theme ===

const BANDIT_EMPTY_DESCRIPTIONS = [
  "Playing cards scatter across a table. Game interrupted.",
  "A wanted poster hangs on the wall. Someone here is famous.",
  "Empty bottles litter the floor. Last night was wild.",
  "A hastily packed bag sits abandoned. Someone fled.",
  "Crude maps mark trade routes. Future targets.",
];

export const BANDIT_HIDEOUT_BLUEPRINT: DungeonBlueprint = {
  theme: "bandit_hideout",
  requiredRooms: ["entrance", "loot_storage"],
  optionalRooms: [
    "lookout_post",
    "sleeping_quarters",
    "planning_room",
    "escape_tunnel",
    "prisoner_hold",
    "common_area",
  ],
  bossRoom: "planning_room",
  adjacencyRules: [
    {
      roomType: "prisoner_hold",
      preferred: ["sleeping_quarters"],
      forbidden: ["escape_tunnel", "entrance"],
    },
  ],
  creaturePool: ["bandit", "bandit_captain", "thug", "spy", "assassin"],
  trapPool: UNIVERSAL_TRAPS,
  emptyRoomDescriptions: BANDIT_EMPTY_DESCRIPTIONS,
};

// === Cultist Lair Theme ===

const CULTIST_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Blood Sigil",
    description: "A magical sigil drawn in blood",
    damage: "2d8 necrotic + bleed",
    save: "DC 14 WIS",
    themes: ["cultist_lair"],
    locations: ["room"],
  },
];

const CULTIST_EMPTY_DESCRIPTIONS = [
  "Disturbing symbols cover every surface. Madness in paint.",
  "Burnt offerings leave greasy residue. Something was sacrificed.",
  "Robes hang from hooks. Ready for the next ritual.",
  "A journal details descent into madness. Chilling reading.",
  "The floor is stained dark. Not all of it is wine.",
];

export const CULTIST_LAIR_BLUEPRINT: DungeonBlueprint = {
  theme: "cultist_lair",
  requiredRooms: ["entrance", "summoning_circle"],
  optionalRooms: [
    "sacrifice_altar",
    "initiates_quarters",
    "leaders_chamber",
    "forbidden_library",
    "ritual_pool",
  ],
  bossRoom: "summoning_circle",
  adjacencyRules: [
    {
      roomType: "summoning_circle",
      preferred: ["sacrifice_altar", "ritual_pool"],
      forbidden: ["entrance"],
    },
  ],
  creaturePool: ["cultist", "cult_fanatic", "shadow_demon", "succubus", "chain_devil", "pit_fiend"],
  trapPool: CULTIST_TRAPS,
  emptyRoomDescriptions: CULTIST_EMPTY_DESCRIPTIONS,
};

// === Witch Hut Theme ===

const WITCH_EMPTY_DESCRIPTIONS = [
  "Dried herbs hang from every beam. The smell is overwhelming.",
  "A black cat watches from the shadows. It seems intelligent.",
  "Bottles of strange liquids line shelves. Labels are cryptic.",
  "A bubbling cauldron sits cold. The fire died recently.",
  "Runes scratched into the floor hum faintly. Magic lingers.",
];

export const WITCH_HUT_BLUEPRINT: DungeonBlueprint = {
  theme: "witch_hut",
  requiredRooms: ["entrance", "potion_workshop"],
  optionalRooms: [
    "ingredient_storage",
    "divination_room",
    "sleeping_loft",
    "garden_access",
    "familiar_den",
  ],
  bossRoom: "divination_room",
  adjacencyRules: [
    {
      roomType: "potion_workshop",
      preferred: ["ingredient_storage", "garden_access"],
      forbidden: [],
    },
  ],
  creaturePool: ["hag", "scarecrow", "will_o_wisp", "animated_broom", "black_cat", "toad_familiar"],
  trapPool: UNIVERSAL_TRAPS,
  emptyRoomDescriptions: WITCH_EMPTY_DESCRIPTIONS,
};

// === Sea Cave Theme ===

const SEA_CAVE_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Tidal Surge",
    description: "Sudden rush of seawater",
    damage: "2d6 + swept away",
    save: "DC 14 STR",
    themes: ["sea_cave"],
    locations: ["passage"],
  },
];

const SEA_CAVE_EMPTY_DESCRIPTIONS = [
  "Seaweed drapes the walls. High tide reaches here.",
  "Shells crunch underfoot. The sea claims this space.",
  "Salt crystals glitter on every surface. Beautiful but corrosive.",
  "A shipwreck's timbers have washed in. Someone's final voyage.",
  "Tide pools teem with life. Crabs scatter at your light.",
];

export const SEA_CAVE_BLUEPRINT: DungeonBlueprint = {
  theme: "sea_cave",
  requiredRooms: ["entrance", "treasure_grotto"],
  optionalRooms: [
    "tidal_pool",
    "smuggler_dock",
    "kelp_garden",
    "shell_shrine",
    "underwater_passage",
  ],
  bossRoom: "treasure_grotto",
  adjacencyRules: [
    {
      roomType: "smuggler_dock",
      preferred: ["treasure_grotto"],
      forbidden: ["underwater_passage"],
    },
  ],
  creaturePool: ["sahuagin", "merrow", "sea_hag", "giant_crab", "giant_octopus", "water_elemental"],
  trapPool: SEA_CAVE_TRAPS,
  emptyRoomDescriptions: SEA_CAVE_EMPTY_DESCRIPTIONS,
};

// === Beast Den Theme ===

const BEAST_EMPTY_DESCRIPTIONS = [
  "Massive claw marks scar the stone. Territorial warnings.",
  "A half-eaten carcass rots in the corner. Recent kill.",
  "Nests of bone and fur fill alcoves. Young were raised here.",
  "The musk of a great beast pervades everything. It knows you're here.",
  "Tufts of fur cling to rocky outcrops. Shedding season.",
];

export const BEAST_DEN_BLUEPRINT: DungeonBlueprint = {
  theme: "beast_den",
  requiredRooms: ["entrance", "primary_nest"],
  optionalRooms: [
    "feeding_ground",
    "bone_yard",
    "young_nursery",
    "territorial_marker",
    "water_source",
  ],
  bossRoom: "primary_nest",
  adjacencyRules: [
    {
      roomType: "young_nursery",
      preferred: ["primary_nest", "water_source"],
      forbidden: ["entrance", "territorial_marker"],
    },
  ],
  creaturePool: ["dire_wolf", "cave_bear", "saber_tooth_tiger", "giant_boar", "winter_wolf"],
  trapPool: UNIVERSAL_TRAPS,
  emptyRoomDescriptions: BEAST_EMPTY_DESCRIPTIONS,
};

// === Floating Keep Theme ===

const FLOATING_TRAPS: TrapTemplate[] = [
  ...UNIVERSAL_TRAPS,
  {
    name: "Gravity Reversal",
    description: "Gravity suddenly inverts",
    damage: "3d6 fall (to ceiling)",
    save: "DC 15 DEX to grab something",
    themes: ["floating_keep"],
    locations: ["room"],
  },
  {
    name: "Wind Blast",
    description: "Powerful winds threaten to sweep you off",
    damage: "1d6 + fall risk",
    save: "DC 14 STR or pushed",
    themes: ["floating_keep"],
    locations: ["passage"],
  },
];

const FLOATING_EMPTY_DESCRIPTIONS = [
  "Windows look out on clouds. The ground is far below.",
  "Strange machinery hums. It keeps the keep aloft.",
  "Star charts cover the walls. Someone studied the heavens.",
  "Wind whistles through cracks. The altitude is dizzying.",
  "Crystal prisms catch light. They power something.",
];

export const FLOATING_KEEP_BLUEPRINT: DungeonBlueprint = {
  theme: "floating_keep",
  requiredRooms: ["entrance", "arcane_engine"],
  optionalRooms: [
    "observation_deck",
    "sky_dock",
    "wind_shrine",
    "cloud_garden",
    "storm_chamber",
  ],
  bossRoom: "arcane_engine",
  adjacencyRules: [
    {
      roomType: "arcane_engine",
      preferred: ["storm_chamber", "observation_deck"],
      forbidden: ["entrance"],
    },
  ],
  creaturePool: ["air_elemental", "djinni", "aarakocra", "griffon", "cloud_giant", "storm_giant"],
  trapPool: FLOATING_TRAPS,
  emptyRoomDescriptions: FLOATING_EMPTY_DESCRIPTIONS,
};

// === Master Blueprint Registry ===

export const DUNGEON_BLUEPRINTS: Record<DungeonTheme, DungeonBlueprint> = {
  tomb: TOMB_BLUEPRINT,
  cave: CAVE_BLUEPRINT,
  temple: TEMPLE_BLUEPRINT,
  mine: MINE_BLUEPRINT,
  fortress: FORTRESS_BLUEPRINT,
  sewer: SEWER_BLUEPRINT,
  crypt: CRYPT_BLUEPRINT,
  lair: LAIR_BLUEPRINT,
  shrine: SHRINE_BLUEPRINT,
  bandit_hideout: BANDIT_HIDEOUT_BLUEPRINT,
  cultist_lair: CULTIST_LAIR_BLUEPRINT,
  witch_hut: WITCH_HUT_BLUEPRINT,
  sea_cave: SEA_CAVE_BLUEPRINT,
  beast_den: BEAST_DEN_BLUEPRINT,
  floating_keep: FLOATING_KEEP_BLUEPRINT,
};

// === Room Config Lookup ===

export const THEME_ROOM_CONFIGS: Record<DungeonTheme, ThemeRoomConfig[]> = {
  tomb: TOMB_ROOM_CONFIGS,
  cave: [], // TODO: Add cave room configs
  temple: [], // TODO: Add temple room configs
  mine: [],
  fortress: [],
  sewer: [],
  crypt: [],
  lair: [],
  shrine: [],
  bandit_hideout: [],
  cultist_lair: [],
  witch_hut: [],
  sea_cave: [],
  beast_den: [],
  floating_keep: [],
};

/**
 * Get the blueprint for a dungeon theme.
 */
export function getBlueprint(theme: DungeonTheme): DungeonBlueprint {
  return DUNGEON_BLUEPRINTS[theme];
}

/**
 * Get room configs for a theme.
 */
export function getRoomConfigs(theme: DungeonTheme): ThemeRoomConfig[] {
  return THEME_ROOM_CONFIGS[theme] ?? [];
}
