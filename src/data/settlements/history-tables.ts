/**
 * Settlement history tables for procedural lore generation
 */

import type { SettlementSize } from "~/models";

export type FounderType =
  | "noble_exile"
  | "merchant_guild"
  | "religious_order"
  | "refugees"
  | "adventurers"
  | "military_outpost";

export type SettlementAge = "ancient" | "old" | "established" | "young" | "new";

export interface FounderEntry {
  type: FounderType;
  weight: number;
  templates: string[]; // Founding story templates
}

export interface EventEntry {
  text: string;
  weight: number;
}

export interface CulturalNote {
  text: string;
  weight: number;
}

// Founder types with story templates
export const FOUNDER_TABLE: FounderEntry[] = [
  {
    type: "noble_exile",
    weight: 2,
    templates: [
      "Founded by a disgraced noble house seeking a fresh start",
      "Established by an exiled lord and their loyal retainers",
      "Built by a noble family fleeing political enemies",
      "Created as a refuge for a fallen aristocratic line",
    ],
  },
  {
    type: "merchant_guild",
    weight: 3,
    templates: [
      "Founded by a merchant guild seeking new trade routes",
      "Established at a crossroads by enterprising traders",
      "Built by wealthy merchants escaping guild wars",
      "Created as a trading post that grew into permanence",
    ],
  },
  {
    type: "religious_order",
    weight: 2,
    templates: [
      "Founded around a sacred site by devoted pilgrims",
      "Established by missionaries spreading their faith",
      "Built by monks seeking isolation for contemplation",
      "Created to protect a holy relic or shrine",
    ],
  },
  {
    type: "refugees",
    weight: 3,
    templates: [
      "Founded by refugees fleeing war in the north",
      "Established by survivors of a destroyed homeland",
      "Built by families escaping famine and plague",
      "Created by outcasts from a neighboring realm",
    ],
  },
  {
    type: "adventurers",
    weight: 2,
    templates: [
      "Founded by retired adventurers with their earned fortunes",
      "Established near a cleared dungeon by its conquerors",
      "Built by explorers who found this land unclaimed",
      "Created by a famous hero as their retirement project",
    ],
  },
  {
    type: "military_outpost",
    weight: 2,
    templates: [
      "Originally a military fort that attracted settlers",
      "Established as a garrison to guard the frontier",
      "Built to defend against raids from the wilderness",
      "Created as a waystation for marching armies",
    ],
  },
];

// Age distribution by settlement size
export const AGE_DISTRIBUTION: Record<SettlementSize, { age: SettlementAge; weight: number }[]> = {
  thorpe: [
    { age: "new", weight: 4 },
    { age: "young", weight: 3 },
    { age: "established", weight: 2 },
    { age: "old", weight: 1 },
  ],
  hamlet: [
    { age: "new", weight: 3 },
    { age: "young", weight: 4 },
    { age: "established", weight: 2 },
    { age: "old", weight: 1 },
  ],
  village: [
    { age: "young", weight: 2 },
    { age: "established", weight: 5 },
    { age: "old", weight: 3 },
  ],
  town: [
    { age: "established", weight: 4 },
    { age: "old", weight: 4 },
    { age: "ancient", weight: 2 },
  ],
  city: [
    { age: "established", weight: 1 },
    { age: "old", weight: 4 },
    { age: "ancient", weight: 5 },
  ],
};

// Age descriptions
export const AGE_DESCRIPTIONS: Record<SettlementAge, string> = {
  new: "Founded within living memory",
  young: "A few generations old",
  established: "Several generations of history",
  old: "Centuries of tradition",
  ancient: "Roots lost to time",
};

// Major historical events
export const MAJOR_EVENTS: EventEntry[] = [
  { text: "Survived a devastating plague", weight: 3 },
  { text: "Rebuilt after a great fire", weight: 3 },
  { text: "Repelled an invasion from the east", weight: 2 },
  { text: "Endured a decade-long famine", weight: 2 },
  { text: "Witnessed a royal visit that changed everything", weight: 1 },
  { text: "Discovered a valuable resource nearby", weight: 2 },
  { text: "The trade route shifted to pass through here", weight: 2 },
  { text: "A famous battle was fought on these grounds", weight: 2 },
  { text: "Overthrew a tyrannical leader", weight: 1 },
  { text: "Absorbed refugees from a neighboring settlement", weight: 2 },
  { text: "A legendary hero was born here", weight: 1 },
  { text: "Negotiated a crucial treaty with a rival power", weight: 1 },
  { text: "The old temple was destroyed in a storm", weight: 2 },
  { text: "A guild established their headquarters here", weight: 2 },
  { text: "Survived a siege that lasted months", weight: 2 },
  { text: "The river changed course, reshaping the land", weight: 1 },
  { text: "A mining boom brought sudden wealth", weight: 2 },
  { text: "The founding family died out mysteriously", weight: 1 },
  { text: "Won independence from a distant overlord", weight: 1 },
  { text: "A magical phenomenon occurred here", weight: 1 },
];

// Former name patterns
export const FORMER_NAME_PREFIXES = [
  "Old", "East", "West", "North", "South", "Upper", "Lower", "New", "Greater", "Lesser",
];

export const FORMER_NAME_SUFFIXES = [
  "ford", "ton", "wick", "ham", "bury", "dale", "field", "mere", "wood", "hollow",
];

// Cultural notes
export const CULTURAL_NOTES: CulturalNote[] = [
  { text: "Known for its autumn harvest festival", weight: 3 },
  { text: "Famous for a local brewing tradition", weight: 3 },
  { text: "Home to an annual market fair", weight: 2 },
  { text: "Residents speak with a distinctive accent", weight: 2 },
  { text: "Known for exceptional craftwork in leather", weight: 2 },
  { text: "Celebrates the founding with a week of feasts", weight: 2 },
  { text: "Has a tradition of welcoming travelers", weight: 2 },
  { text: "Known for being suspicious of outsiders", weight: 2 },
  { text: "Famous for a local delicacy", weight: 2 },
  { text: "Home to a renowned bardic tradition", weight: 1 },
  { text: "Known for its skilled herbalists", weight: 2 },
  { text: "Has an unusual architectural style", weight: 1 },
  { text: "Residents follow an old superstition faithfully", weight: 2 },
  { text: "Known for its elaborate funeral rites", weight: 1 },
  { text: "Famous for horse breeding", weight: 2 },
  { text: "Known for its skilled stonemasons", weight: 2 },
  { text: "Has a tradition of public debates", weight: 1 },
  { text: "Celebrates a patron saint's day", weight: 2 },
  { text: "Known for its gardens and orchards", weight: 2 },
  { text: "Famous for a unique musical instrument", weight: 1 },
];

// Sensory impressions for quick scene-setting (3 bullets: sight, sound, smell)
export const SENSORY_SIGHTS: string[] = [
  "Crooked timber buildings lean against each other",
  "Smoke rises from a dozen chimneys",
  "Washing lines crisscross between windows",
  "A weathered statue stands in the square",
  "Muddy streets wind between stone foundations",
  "Thatched roofs cluster around a central well",
  "Colorful market stalls line the main road",
  "A crumbling wall rings the settlement",
  "Moss grows on ancient cobblestones",
  "Children chase geese through narrow alleys",
  "Carts loaded with goods crowd the gate",
  "Candles flicker in grimy windows",
  "A temple spire rises above the rooftops",
  "Fishing nets hang drying in the breeze",
  "Iron-bound doors mark the wealthier homes",
];

export const SENSORY_SOUNDS: string[] = [
  "A blacksmith's hammer rings out steadily",
  "Dogs bark at passing strangers",
  "The murmur of haggling fills the air",
  "Church bells toll the hour",
  "Chickens cluck from nearby coops",
  "A bard's tune drifts from the tavern",
  "Cart wheels rattle on cobblestones",
  "The town crier announces the news",
  "Children's laughter echoes between buildings",
  "Pigs squeal from the butcher's yard",
  "The creak of a windmill turning",
  "Distant prayers chant from the temple",
  "Merchants call out their wares",
  "A baby wails from an upper window",
  "The splash of a fountain in the square",
];

export const SENSORY_SMELLS: string[] = [
  "Fresh bread wafts from the baker's",
  "Woodsmoke hangs in the air",
  "The tang of the tannery lingers",
  "Spices drift from an open window",
  "Horse manure and wet straw",
  "Roasting meat from the inn",
  "Incense from the temple",
  "Fish drying in the sun",
  "The earthy smell of turned soil",
  "Ale and sweat from the tavern",
  "Flowers from the market stalls",
  "The acrid bite of the smithy",
  "Damp stone and old moss",
  "Herbs drying on windowsills",
  "The copper smell of the butcher's",
];
