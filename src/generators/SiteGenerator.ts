import { nanoid } from "nanoid";
import type {
  Settlement,
  SettlementSite,
  SiteService,
  SettlementSize,
  SiteType,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

// === Site Types by Settlement Size ===

const SITE_TYPES_BY_SIZE: Record<SettlementSize, SiteType[]> = {
  thorpe: ["inn", "market"],
  hamlet: ["inn", "tavern", "market", "blacksmith"],
  village: ["inn", "tavern", "temple", "market", "blacksmith", "general_store"],
  town: ["inn", "tavern", "temple", "market", "blacksmith", "general_store", "guild_hall"],
  city: ["inn", "tavern", "temple", "market", "blacksmith", "general_store", "guild_hall", "noble_estate"],
};

const SITE_COUNTS: Record<SettlementSize, [number, number]> = {
  thorpe: [1, 2],
  hamlet: [2, 3],
  village: [3, 5],
  town: [5, 8],
  city: [8, 12],
};

// === Name Tables ===

const SITE_NAME_PREFIXES: Partial<Record<SiteType, string[]>> = {
  inn: ["The Weary", "The Golden", "The Silver", "The Red", "The Black", "The Wandering"],
  tavern: ["The Rusty", "The Drunken", "The Jolly", "The Dancing", "The Broken"],
  temple: ["Temple of", "Shrine of", "Chapel of", "Sanctum of"],
  market: ["Central", "Old", "Grand", "Farmer's"],
  blacksmith: ["Iron", "Steel", "Forge of", "Hammer and"],
  general_store: ["Honest", "Old", "Reliable", "Town"],
  guild_hall: ["Hall of", "House of"],
  noble_estate: ["House", "Manor of", "Estate of"],
};

const SITE_NAME_SUFFIXES: Partial<Record<SiteType, string[]>> = {
  inn: ["Traveler", "Dragon", "Stag", "Lion", "Horse", "Crown", "Shield"],
  tavern: ["Tankard", "Barrel", "Goblin", "Orc", "Sailor", "Mug"],
  temple: ["the Light", "the Dawn", "the Flame", "the Earth", "the Storm"],
  market: ["Market", "Square", "Bazaar"],
  blacksmith: ["Anvil", "Fire", "Arms", "Blades"],
  general_store: ["Goods", "Provisions", "Trading Post", "Supply"],
  guild_hall: ["Merchants", "Craftsmen", "Artisans", "Traders"],
  noble_estate: ["Goldwyn", "Blackwood", "Ravencrest", "Thornwood"],
};

// === Services by Site Type ===

const SITE_SERVICES: Partial<Record<SiteType, SiteService[]>> = {
  inn: [
    { name: "Room (common)", cost: "5 sp/night" },
    { name: "Room (private)", cost: "2 gp/night" },
    { name: "Meal", cost: "5 cp" },
    { name: "Stabling", cost: "5 sp/night" },
  ],
  tavern: [
    { name: "Ale", cost: "4 cp" },
    { name: "Wine", cost: "2 sp" },
    { name: "Meal", cost: "1 sp" },
  ],
  temple: [
    { name: "Healing (1d8)", cost: "10 gp" },
    { name: "Cure Disease", cost: "50 gp" },
    { name: "Remove Curse", cost: "100 gp" },
    { name: "Blessing", cost: "5 gp" },
  ],
  market: [
    { name: "General Goods", cost: "Varies" },
    { name: "Food & Supplies", cost: "Varies" },
  ],
  blacksmith: [
    { name: "Weapon Repair", cost: "5 gp" },
    { name: "Armor Repair", cost: "10 gp" },
    { name: "Horseshoes", cost: "1 gp" },
    { name: "Custom Work", cost: "Varies" },
  ],
  general_store: [
    { name: "Adventuring Gear", cost: "Varies" },
    { name: "Rations", cost: "5 sp/day" },
    { name: "Torches (10)", cost: "1 gp" },
    { name: "Rope (50ft)", cost: "1 gp" },
  ],
  guild_hall: [
    { name: "Contracts", cost: "Varies" },
    { name: "Information", cost: "5 gp" },
  ],
  noble_estate: [
    { name: "Audience", cost: "By appointment" },
  ],
};

const SITE_DESCRIPTIONS: Partial<Record<SiteType, string[]>> = {
  inn: [
    "A cozy establishment with warm beds and hot meals",
    "A well-maintained inn popular with travelers",
    "A rustic lodge with a roaring fireplace",
  ],
  tavern: [
    "A smoky drinking hall filled with locals",
    "A rowdy establishment known for its strong ale",
    "A dimly lit bar where secrets are traded",
  ],
  temple: [
    "A grand stone structure with soaring spires",
    "A humble house of worship",
    "An ancient holy site maintained by devoted clergy",
  ],
  market: [
    "A bustling open-air market",
    "A covered marketplace with permanent stalls",
    "A lively trading square",
  ],
  blacksmith: [
    "A busy forge with the ring of hammers",
    "A soot-covered workshop",
    "A well-equipped smithy",
  ],
  general_store: [
    "A cramped shop packed with goods",
    "A well-organized store with helpful staff",
    "A dusty emporium selling everything imaginable",
  ],
  guild_hall: [
    "An impressive building adorned with guild symbols",
    "A busy hall where merchants conduct business",
    "A stately headquarters for local craftsmen",
  ],
  noble_estate: [
    "A grand manor behind iron gates",
    "An elegant townhouse with manicured grounds",
    "A fortified estate overlooking the settlement",
  ],
};

const SITE_QUIRKS: string[] = [
  "The owner is unusually secretive",
  "A strange smell permeates the building",
  "The staff speaks in hushed tones",
  "An unusual pet roams the premises",
  "The building creaks ominously at night",
  "Locals avoid this place for unknown reasons",
  "The prices here change with the owner's mood",
  "A faded portrait watches visitors",
];

const SITE_SECRETS: string[] = [
  "A hidden cellar leads to old tunnels",
  "The owner is secretly a spy",
  "Stolen goods are hidden in a back room",
  "A cult meets here after dark",
  "A ghost haunts the upper floors",
  "The building sits atop an ancient tomb",
  "A wanted criminal hides among the staff",
  "Smuggled goods pass through here regularly",
];

export interface SiteGeneratorOptions {
  seed: string;
  settlement: Settlement;
}

/**
 * Generate sites for a settlement based on its size.
 */
export function generateSites(options: SiteGeneratorOptions): SettlementSite[] {
  const { seed, settlement } = options;
  const rng = new SeededRandom(`${seed}-sites-${settlement.id}`);

  const availableTypes = SITE_TYPES_BY_SIZE[settlement.size];
  const [minSites, maxSites] = SITE_COUNTS[settlement.size];
  const siteCount = rng.between(minSites, maxSites);

  const sites: SettlementSite[] = [];
  const usedTypes = new Set<SiteType>();

  // Always include an inn or tavern if available
  const hasLodging = availableTypes.includes("inn") || availableTypes.includes("tavern");
  if (hasLodging) {
    const lodgingType = availableTypes.includes("inn") ? "inn" : "tavern";
    sites.push(generateSite(rng, lodgingType));
    usedTypes.add(lodgingType);
  }

  // Fill remaining slots
  while (sites.length < siteCount) {
    // Prefer unique types, but allow duplicates for larger settlements
    const candidates = settlement.size === "city" || settlement.size === "town"
      ? availableTypes
      : availableTypes.filter((t) => !usedTypes.has(t));

    if (candidates.length === 0) break;

    const siteType = rng.pick(candidates);
    sites.push(generateSite(rng, siteType));
    usedTypes.add(siteType);
  }

  return sites;
}

function generateSite(rng: SeededRandom, type: SiteType): SettlementSite {
  const name = generateSiteName(rng, type);
  const description = rng.pick(SITE_DESCRIPTIONS[type] ?? ["A notable establishment"]);
  const services = [...(SITE_SERVICES[type] ?? [])];

  // Determine if this is a rumor source (taverns and inns always are)
  const rumorSource = type === "tavern" || type === "inn" || rng.chance(0.3);

  // Determine if this has a notice board
  const noticeBoard = type === "market" || type === "guild_hall" || type === "inn" || rng.chance(0.2);

  const site: SettlementSite = {
    id: `site-${nanoid(8)}`,
    name,
    type,
    description,
    staffIds: [],
    services,
    rumorSource,
    noticeBoard,
  };

  // 30% chance of a quirk
  if (rng.chance(0.3)) {
    site.quirk = rng.pick(SITE_QUIRKS);
  }

  // 15% chance of a secret
  if (rng.chance(0.15)) {
    site.secret = rng.pick(SITE_SECRETS);
  }

  return site;
}

function generateSiteName(rng: SeededRandom, type: SiteType): string {
  const prefix = rng.pick(SITE_NAME_PREFIXES[type] ?? ["The"]);
  const suffix = rng.pick(SITE_NAME_SUFFIXES[type] ?? ["Place"]);
  return `${prefix} ${suffix}`;
}
