import type { DistrictType, DistrictMood, EconomyType } from "~/models";

// === District Names ===

export const DISTRICT_NAME_PREFIXES: Record<DistrictType, string[]> = {
  market: ["Market", "Merchant's", "Trader's", "Coin", "Exchange"],
  temple: ["Temple", "Holy", "Sacred", "Pilgrim's", "Divine"],
  noble: ["Crown", "High", "Silver", "Noble", "Lord's"],
  slums: ["The Warrens", "Rat's", "Low", "Beggar's", "Gutter"],
  docks: ["Gull's", "Harbor", "Anchor", "Tide", "Wharf"],
  warehouse: ["Crate", "Storehouse", "Iron", "Barrel"],
  artisan: ["Hammer", "Craft", "Maker's", "Forge", "Potter's"],
  military: ["Shield", "Garrison", "Iron", "Sword", "Watch"],
  academic: ["Scroll", "Sage's", "Ink", "Scholar's", "Tome"],
  foreign: ["Stranger's", "Silk", "Spice", "Far", "Exile's"],
  residential: ["Hearth", "Common", "Lamb's", "Meadow", "Hearthstone"],
  ruins: ["Ashfall", "Old", "Broken", "Fallen", "Shadow"],
  cannery: ["Salt", "Brine", "Fish", "Smokehouse", "Curing"],
  smelter: ["Slag", "Furnace", "Ember", "Crucible", "Smelt"],
  lumber_yard: ["Timber", "Sawdust", "Axe", "Stump", "Log"],
  caravan: ["Dusty", "Wagon", "Caravan", "Trail's", "Drovers'"],
  arcane_academy: ["Arcane", "Mystic", "Star", "Crystal", "Rune"],
  arena: ["Blood", "Glory", "Champion's", "Sand", "Pit"],
  foundry: ["Ironworks", "Anvil", "Cinder", "Steel", "Bellows"],
};

export const DISTRICT_NAME_SUFFIXES: Record<DistrictType, string[]> = {
  market: ["Quarter", "Row", "Ward", "Square", "District"],
  temple: ["Quarter", "Hill", "Ward", "Close", "Heights"],
  noble: ["Hill", "Heights", "Ward", "Quarter", "Court"],
  slums: ["Quarter", "End", "Bottoms", "Reach", "Narrows"],
  docks: ["Landing", "Reach", "Quarter", "Row", "Wharf"],
  warehouse: ["Quarter", "Row", "Yards", "District"],
  artisan: ["Quarter", "Row", "Lane", "Ward"],
  military: ["Quarter", "Gate", "Ward", "Keep"],
  academic: ["Quarter", "Hill", "Court", "Ward"],
  foreign: ["Quarter", "Ward", "Enclave", "Gate"],
  residential: ["Quarter", "Ward", "Green", "Common"],
  ruins: ["Quarter", "Ward", "Hollow", "Reach", "Ruin"],
  cannery: ["Row", "Quarter", "Yards", "Wharf"],
  smelter: ["Quarter", "Works", "Yards", "Row"],
  lumber_yard: ["Yards", "Quarter", "Mill", "Row"],
  caravan: ["Quarter", "End", "Rest", "Yard"],
  arcane_academy: ["Quarter", "Tower", "Ward", "Circle"],
  arena: ["Quarter", "Pit", "Ring", "Ward"],
  foundry: ["Quarter", "Works", "Yard", "Row"],
};

// === District Troubles ===

export const DISTRICT_TROUBLES: Record<DistrictType, string[]> = {
  market: [
    "A counterfeit coin ring is undermining trust",
    "A merchant guild is squeezing out independent traders",
    "Pickpockets have become brazen and organized",
    "A rare goods shipment has gone missing",
    "Price gouging during the current shortage",
  ],
  temple: [
    "A heretical sect is gaining followers",
    "Temple offerings have been stolen",
    "Clergy members are disappearing at night",
    "A supposed miracle is drawing dangerous crowds",
    "Rival faiths are on the verge of open conflict",
  ],
  noble: [
    "A succession dispute threatens to turn violent",
    "Servants are being found dead under mysterious circumstances",
    "A noble family has been secretly bankrupted",
    "Poisoning attempts at a recent feast",
    "A scandal threatens to topple a powerful house",
  ],
  slums: [
    "A plague is spreading through the overcrowded tenements",
    "A crime boss is recruiting children as thieves",
    "Fires keep breaking out under suspicious circumstances",
    "People are vanishing from the streets at night",
    "Tainted water from the upper district runoff",
  ],
  docks: [
    "A smuggling ring operates openly",
    "Ships have been found adrift with no crew",
    "Pirates are demanding protection money",
    "A sea creature has been spotted in the harbor",
    "Dock workers are striking over dangerous conditions",
  ],
  warehouse: [
    "Goods are being stolen from locked warehouses",
    "A warehouse fire revealed a secret underground passage",
    "Rats are spreading disease through stored grain",
    "A merchant is hoarding essential supplies",
  ],
  artisan: [
    "A guild master has been fixing prices",
    "Apprentices are being overworked and abused",
    "A rival city is undercutting local craftsmen",
    "Someone is sabotaging workshop equipment",
  ],
  military: [
    "Guard corruption is rampant",
    "Deserters are hiding among the populace",
    "Weapons are going missing from the armory",
    "A training accident killed a recruit under suspicious circumstances",
  ],
  academic: [
    "A forbidden experiment has gone wrong",
    "Stolen texts are appearing on the black market",
    "Students are forming a dangerous secret society",
    "A scholar has made a discovery that powerful people want suppressed",
  ],
  foreign: [
    "Tensions between locals and foreigners are escalating",
    "A spy network operates from this quarter",
    "Exotic diseases from abroad are causing panic",
    "A diplomatic incident threatens trade relations",
  ],
  residential: [
    "A serial prowler terrorizes residents at night",
    "Property disputes are turning violent",
    "An infestation of unusual vermin",
    "Ghost sightings in an old townhouse",
  ],
  ruins: [
    "Creatures are emerging from below at night",
    "A cult has established a hideout in the rubble",
    "Scavengers keep disappearing inside",
    "Strange lights and sounds emanate from the depths",
    "The ground is subsiding, threatening adjacent districts",
  ],
  cannery: [
    "Workers are getting sick from toxic fumes",
    "The catch has been declining mysteriously",
    "Someone is tampering with preserved goods",
  ],
  smelter: [
    "Toxic runoff is poisoning the lower districts",
    "Ore shipments are being hijacked",
    "Workers are organizing against brutal conditions",
  ],
  lumber_yard: [
    "Logging has angered forest-dwelling creatures",
    "Sabotaged equipment has injured workers",
    "Illegal logging in protected groves",
  ],
  caravan: [
    "Caravans are being raided on the approach roads",
    "A con artist is selling fake maps and guides",
    "Disease brought in by foreign traders",
  ],
  arcane_academy: [
    "A magical experiment breached containment",
    "Students are trading in forbidden spells",
    "An enchantment is affecting nearby residents' dreams",
  ],
  arena: [
    "A champion fighter was found dead before a major bout",
    "Illegal beast fights are being held after hours",
    "Match-fixing has angered the betting guilds",
  ],
  foundry: [
    "A new alloy is driving workers mad",
    "Industrial sabotage from a competing city",
    "The forge fires are burning unnaturally hot",
  ],
};

// === District Flavors (sensory impressions) ===

export const DISTRICT_FLAVORS: Record<DistrictType, string[]> = {
  market: [
    "The air rings with haggling voices and the scent of exotic spices",
    "Colorful awnings shade crowded stalls as coins change hands",
    "Cart wheels rattle over cobblestones as merchants hawk their wares",
  ],
  temple: [
    "Incense smoke drifts between soaring spires as bells toll the hours",
    "Chanting echoes from candlelit doorways along quiet, clean streets",
    "Pilgrims crowd the steps of grand temples, prayer beads clicking",
  ],
  noble: [
    "Manicured gardens line wide boulevards patrolled by private guards",
    "The scent of perfume and polished stone hangs in the still air",
    "Tall iron gates guard mansions where servants move in practiced silence",
  ],
  slums: [
    "Cramped alleys stink of refuse and desperation",
    "Laundry hangs between leaning buildings that block out the sky",
    "Hollow-eyed faces watch from doorways as rats scurry past",
  ],
  docks: [
    "Salt spray mingles with tar and fish as gulls wheel overhead",
    "Creaking ships and shouting stevedores fill the busy waterfront",
    "Ropes creak and waves slap against barnacled pilings",
  ],
  warehouse: [
    "The clatter of crates and rumble of wagons echo off tall stone walls",
    "Dust motes float in shafts of light between towering storage buildings",
  ],
  artisan: [
    "Hammers ring and kilns glow as craftsmen ply their trades",
    "The smell of fresh sawdust and hot metal fills the narrow streets",
  ],
  military: [
    "Soldiers drill in packed-earth yards while armor clanks in workshops",
    "The snap of pennants and bark of orders carry over stone walls",
  ],
  academic: [
    "Ink-stained scholars argue in shaded courtyards between ivy-covered towers",
    "The scratch of quills and rustle of parchment drift from open windows",
  ],
  foreign: [
    "Unfamiliar music and the smell of strange cooking fill the air",
    "Colorful banners in foreign scripts hang above market stalls",
  ],
  residential: [
    "Smoke rises from chimneys as the smell of cooking drifts into quiet streets",
    "Children play in small yards while neighbors gossip over fences",
  ],
  ruins: [
    "Crumbling walls and collapsed roofs stand as silent monuments to disaster",
    "Wind whistles through empty windows and rats nest in the rubble",
    "Charred timbers and shattered stone tell of the catastrophe that emptied this quarter",
  ],
  cannery: [
    "The sharp reek of brine and fish guts hangs heavy in the air",
  ],
  smelter: [
    "Furnace heat and acrid smoke pour from blackened chimneys",
  ],
  lumber_yard: [
    "The crack of axes and scent of fresh-cut pine fill the air",
  ],
  caravan: [
    "Dusty wagons and braying pack animals crowd the muddy yards",
  ],
  arcane_academy: [
    "Faint magical resonance hums in the air near crystalline towers",
  ],
  arena: [
    "The roar of crowds and clash of steel echo from the great pit",
  ],
  foundry: [
    "Sparks fly and molten metal glows orange in vast open-sided sheds",
  ],
};

// === District Mood Weights (per type) ===

export const DISTRICT_MOOD_WEIGHTS: Record<DistrictType, Array<{ mood: DistrictMood; weight: number }>> = {
  market:      [{ mood: "bustling", weight: 40 }, { mood: "prosperous", weight: 25 }, { mood: "tense", weight: 15 }, { mood: "festive", weight: 20 }],
  temple:      [{ mood: "quiet", weight: 35 }, { mood: "prosperous", weight: 20 }, { mood: "oppressed", weight: 15 }, { mood: "festive", weight: 15 }, { mood: "tense", weight: 15 }],
  noble:       [{ mood: "prosperous", weight: 40 }, { mood: "quiet", weight: 25 }, { mood: "tense", weight: 20 }, { mood: "oppressed", weight: 15 }],
  slums:       [{ mood: "dangerous", weight: 35 }, { mood: "oppressed", weight: 30 }, { mood: "decaying", weight: 20 }, { mood: "tense", weight: 15 }],
  docks:       [{ mood: "bustling", weight: 35 }, { mood: "dangerous", weight: 25 }, { mood: "tense", weight: 20 }, { mood: "festive", weight: 20 }],
  warehouse:   [{ mood: "quiet", weight: 35 }, { mood: "bustling", weight: 30 }, { mood: "tense", weight: 20 }, { mood: "dangerous", weight: 15 }],
  artisan:     [{ mood: "bustling", weight: 40 }, { mood: "prosperous", weight: 25 }, { mood: "quiet", weight: 20 }, { mood: "oppressed", weight: 15 }],
  military:    [{ mood: "tense", weight: 35 }, { mood: "quiet", weight: 25 }, { mood: "oppressed", weight: 20 }, { mood: "bustling", weight: 20 }],
  academic:    [{ mood: "quiet", weight: 40 }, { mood: "prosperous", weight: 25 }, { mood: "tense", weight: 20 }, { mood: "bustling", weight: 15 }],
  foreign:     [{ mood: "bustling", weight: 30 }, { mood: "tense", weight: 25 }, { mood: "festive", weight: 25 }, { mood: "dangerous", weight: 20 }],
  residential: [{ mood: "quiet", weight: 40 }, { mood: "prosperous", weight: 25 }, { mood: "tense", weight: 20 }, { mood: "bustling", weight: 15 }],
  ruins:       [{ mood: "decaying", weight: 40 }, { mood: "dangerous", weight: 35 }, { mood: "quiet", weight: 25 }],
  cannery:     [{ mood: "bustling", weight: 35 }, { mood: "oppressed", weight: 30 }, { mood: "quiet", weight: 20 }, { mood: "tense", weight: 15 }],
  smelter:     [{ mood: "bustling", weight: 30 }, { mood: "oppressed", weight: 30 }, { mood: "dangerous", weight: 25 }, { mood: "tense", weight: 15 }],
  lumber_yard: [{ mood: "bustling", weight: 35 }, { mood: "quiet", weight: 25 }, { mood: "prosperous", weight: 20 }, { mood: "tense", weight: 20 }],
  caravan:     [{ mood: "bustling", weight: 40 }, { mood: "festive", weight: 25 }, { mood: "tense", weight: 20 }, { mood: "dangerous", weight: 15 }],
  arcane_academy: [{ mood: "quiet", weight: 40 }, { mood: "tense", weight: 25 }, { mood: "prosperous", weight: 20 }, { mood: "bustling", weight: 15 }],
  arena:       [{ mood: "bustling", weight: 35 }, { mood: "festive", weight: 30 }, { mood: "dangerous", weight: 20 }, { mood: "tense", weight: 15 }],
  foundry:     [{ mood: "bustling", weight: 35 }, { mood: "oppressed", weight: 25 }, { mood: "tense", weight: 20 }, { mood: "dangerous", weight: 20 }],
};

// === Economy to District Type Mapping ===

export const ECONOMY_TO_DISTRICT_TYPES: Record<EconomyType, DistrictType[]> = {
  fishing:  ["docks", "cannery"],
  mining:   ["smelter", "foundry"],
  logging:  ["lumber_yard", "artisan"],
  trade:    ["caravan", "foreign", "warehouse"],
  crafting: ["artisan", "foundry", "arena"],
  farming:  ["market", "caravan", "residential"],
};

// === Universal district types (any city can have these) ===

export const UNIVERSAL_DISTRICT_TYPES: DistrictType[] = [
  "market", "temple", "noble", "slums", "docks",
  "warehouse", "artisan", "military", "academic",
  "foreign", "residential",
];

// === City Epithets ===

export const CITY_EPITHETS: Array<{ economies: EconomyType[]; epithets: string[] }> = [
  { economies: ["fishing"], epithets: ["the Pearl of the Coast", "Harbor of the South", "the Tide Gate", "the Salt Throne"] },
  { economies: ["mining"], epithets: ["the Iron Crown", "the Deep Forge", "the Mountain Gate", "Jewel of the Hills"] },
  { economies: ["trade"], epithets: ["the Crossroads", "the Golden Gate", "the Coin Throne", "the Merchant's Jewel"] },
  { economies: ["logging"], epithets: ["the Timber Throne", "the Green Gate", "the Forest Crown", "the Sawmill City"] },
  { economies: ["crafting"], epithets: ["the Maker's Pride", "the Anvil City", "the Artisan's Crown", "the Forge Gate"] },
  { economies: ["farming"], epithets: ["the Breadbasket", "the Golden Fields", "the Harvest Throne", "the Green Crown"] },
];

// Fallback epithets for any economy
export const GENERIC_EPITHETS = [
  "the Unconquered", "the Eternal", "the Jewel of the Realm",
  "the Shield of the West", "the Last Bastion", "the City of Spires",
  "the Old Crown", "the Bright City", "the Grey Citadel",
];

// === Abandoned Quarter ===

export const ABANDONED_REASONS = [
  "A devastating plague swept through decades ago",
  "A great fire consumed the quarter in a single night",
  "A magical disaster warped reality here",
  "An invading army breached the walls and sacked this district",
  "The ground began to subside into ancient tunnels below",
  "A curse fell upon the quarter after a temple was desecrated",
  "Flooding from a catastrophic storm rendered it uninhabitable",
  "A clan war destroyed the buildings and drove out residents",
];

export const ABANDONED_DANGERS = [
  "A nest of monsters has taken up residence in the cellars",
  "A cult uses the ruins as a secret meeting place",
  "Undead wander the streets at night, remnants of the disaster",
  "Collapsed tunnels hide a forgotten dungeon complex below",
  "A magical anomaly warps space and time within the ruins",
  "A territorial beast has claimed the largest ruin as its lair",
  "Bandits use the ruins as a base for raids on adjacent districts",
  "Something ancient was unearthed during the collapse",
];

export const ABANDONED_FORMER_PURPOSES: DistrictType[] = [
  "market", "noble", "residential", "artisan", "temple", "warehouse",
];

// === District Economy Descriptions ===

export const DISTRICT_ECONOMIES: Record<DistrictType, string[]> = {
  market:      ["Trade and commerce drive everything here", "Merchants and traders fill the squares daily"],
  temple:      ["Pilgrimage and devotional trade sustain the quarter", "Temple tithes and charitable works"],
  noble:       ["Land rents and political patronage", "Old wealth and inheritance"],
  slums:       ["Day labor and scavenging", "Underground economy and petty crime"],
  docks:       ["Shipping, fishing, and maritime trade", "Cargo loading and ship repair"],
  warehouse:   ["Storage fees and logistics services", "Import and export staging"],
  artisan:     ["Skilled craft production and commissions", "Guild workshops and apprenticeships"],
  military:    ["Military contracts and guard wages", "Arms manufacturing and training"],
  academic:    ["Tuition, research patronage, and book trade", "Knowledge brokering and consulting"],
  foreign:     ["Exotic goods import and cultural exchange", "Foreign trade missions"],
  residential: ["Modest rents and local services", "Small shops serving neighborhood needs"],
  ruins:       ["Scavenging and black market salvage", "Nothing legitimate remains"],
  cannery:     ["Fish processing and preservation", "Salt trade and preserved goods export"],
  smelter:     ["Ore processing and metal refining", "Raw material conversion"],
  lumber_yard: ["Timber processing and woodworking", "Building material supply"],
  caravan:     ["Overland trade and animal husbandry", "Supply provisioning for travelers"],
  arcane_academy: ["Magical research and enchantment services", "Spell component trade"],
  arena:       ["Entertainment, gambling, and spectacle", "Fighter contracts and beast trade"],
  foundry:     ["Metal fabrication and industrial crafting", "Arms and tool manufacturing"],
};

// === District Site Affinities (which site types spawn in which districts) ===

export const DISTRICT_SITE_TYPES: Record<DistrictType, SiteType[]> = {
  market:      ["market", "tavern", "general_store", "inn"],
  temple:      ["temple", "inn", "market"],
  noble:       ["noble_estate", "guild_hall", "inn"],
  slums:       ["tavern", "gambling_hall", "general_store"],
  docks:       ["dock", "tavern", "warehouse", "inn"],
  warehouse:   ["warehouse", "general_store", "market"],
  artisan:     ["blacksmith", "market", "tavern", "guild_hall"],
  military:    ["barracks", "blacksmith", "tavern"],
  academic:    ["library", "temple", "inn"],
  foreign:     ["embassy", "market", "tavern", "inn"],
  residential: ["tavern", "temple", "general_store"],
  ruins:       ["ruins_entrance", "tavern"],
  cannery:     ["warehouse", "tavern", "market"],
  smelter:     ["blacksmith", "tavern", "warehouse"],
  lumber_yard: ["warehouse", "tavern", "general_store"],
  caravan:     ["inn", "market", "general_store", "tavern"],
  arcane_academy: ["library", "temple", "inn"],
  arena:       ["arena", "tavern", "gambling_hall", "inn"],
  foundry:     ["blacksmith", "warehouse", "tavern"],
};

// Need to import SiteType for the affinities table
import type { SiteType, NPCRole } from "~/models";

// === Face NPC Role by District Type ===

export const DISTRICT_FACE_ROLES: Record<DistrictType, NPCRole> = {
  market:      "merchant",
  temple:      "high_priest",
  noble:       "noble",
  slums:       "crime_boss",
  docks:       "harbormaster",
  warehouse:   "merchant",
  artisan:     "guild_master",
  military:    "watch_captain",
  academic:    "sage",
  foreign:     "ambassador",
  residential: "elder",
  ruins:       "criminal",
  cannery:     "guild_master",
  smelter:     "guild_master",
  lumber_yard: "guild_master",
  caravan:     "merchant",
  arcane_academy: "sage",
  arena:       "arena_master",
  foundry:     "guild_master",
};

// === Face NPC Site Type (what site the face NPC owns) ===

export const DISTRICT_FACE_SITE_TYPE: Record<DistrictType, SiteType> = {
  market:      "market",
  temple:      "temple",
  noble:       "noble_estate",
  slums:       "gambling_hall",
  docks:       "dock",
  warehouse:   "warehouse",
  artisan:     "guild_hall",
  military:    "barracks",
  academic:    "library",
  foreign:     "embassy",
  residential: "tavern",
  ruins:       "ruins_entrance",
  cannery:     "warehouse",
  smelter:     "blacksmith",
  lumber_yard: "warehouse",
  caravan:     "inn",
  arcane_academy: "library",
  arena:       "arena",
  foundry:     "blacksmith",
};
