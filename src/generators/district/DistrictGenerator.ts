import { nanoid } from "nanoid";
import type {
  Settlement,
  District,
  DistrictType,
  DistrictMood,
  CityIdentity,
  EconomyType,
  Faction,
  FactionArchetype,
  NPC,
  SettlementSite,
  SiteType,
  Rumor,
  Notice,
  NPCRole,
  CreatureArchetype,
} from "~/models";
import { SeededRandom } from "../SeededRandom";
import { generateNPC } from "../NPCGenerator";
import { NameRegistry } from "../NameRegistry";
import {
  DISTRICT_NAME_PREFIXES,
  DISTRICT_NAME_SUFFIXES,
  DISTRICT_TROUBLES,
  DISTRICT_FLAVORS,
  DISTRICT_MOOD_WEIGHTS,
  ECONOMY_TO_DISTRICT_TYPES,
  UNIVERSAL_DISTRICT_TYPES,
  CITY_EPITHETS,
  GENERIC_EPITHETS,
  DISTRICT_ECONOMIES,
  DISTRICT_SITE_TYPES,
  DISTRICT_FACE_ROLES,
  DISTRICT_FACE_SITE_TYPE,
} from "~/data/districts/district-tables";
import { generateAbandonedQuarter } from "./AbandonedQuarterGenerator";

// === Site name/description tables for new site types ===

const NEW_SITE_NAMES: Record<string, { prefixes: string[]; suffixes: string[] }> = {
  dock: {
    prefixes: ["Harbor", "Quay", "Pier", "Wharf", "Landing"],
    suffixes: ["Master's Office", "Authority", "House", "Station", "Post"],
  },
  warehouse: {
    prefixes: ["Iron", "Stone", "Grand", "Old", "Merchant's"],
    suffixes: ["Warehouse", "Storehouse", "Depot", "Hold", "Vault"],
  },
  arena: {
    prefixes: ["The Blood", "The Glory", "Champion's", "The Grand", "Iron"],
    suffixes: ["Pit", "Arena", "Ring", "Colosseum", "Circle"],
  },
  library: {
    prefixes: ["The Great", "The Ancient", "Scholar's", "The Silent", "Dusty"],
    suffixes: ["Library", "Athenaeum", "Archive", "Repository", "Collection"],
  },
  bathhouse: {
    prefixes: ["The Steaming", "The Marble", "Golden", "The Public", "Crystal"],
    suffixes: ["Baths", "Bathhouse", "Springs", "Pools", "Thermae"],
  },
  gambling_hall: {
    prefixes: ["Lucky", "The Loaded", "Fortune's", "The Silver", "Double"],
    suffixes: ["Dice", "Den", "Table", "Hand", "Chance"],
  },
  embassy: {
    prefixes: ["The Foreign", "Ambassador's", "Treaty", "Diplomatic", "Grand"],
    suffixes: ["Embassy", "Consulate", "Hall", "Quarter", "House"],
  },
  barracks: {
    prefixes: ["City", "Guard", "Watch", "Iron", "Shield"],
    suffixes: ["Barracks", "Garrison", "Post", "Keep", "Quarters"],
  },
  ruins_entrance: {
    prefixes: ["The Crumbling", "The Dark", "Old", "The Sealed", "Broken"],
    suffixes: ["Gate", "Entrance", "Passage", "Stairs", "Threshold"],
  },
};

const NEW_SITE_DESCRIPTIONS: Record<string, string[]> = {
  dock: ["A busy dock office managing harbor traffic", "A weathered building overlooking the quay"],
  warehouse: ["A sturdy stone building packed with crated goods", "A large warehouse with iron-banded doors"],
  arena: ["A circular arena with tiered seating for hundreds", "A fighting pit ringed by cheering spectators"],
  library: ["Towering shelves of dusty tomes in a hushed hall", "A scholarly repository of rare knowledge"],
  bathhouse: ["A warm, steam-filled establishment with marble pools", "A popular gathering spot with heated baths"],
  gambling_hall: ["A smoky hall of dice, cards, and desperate wagers", "A raucous den where fortunes change hands nightly"],
  embassy: ["An ornate building flying foreign banners", "A guarded diplomatic compound"],
  barracks: ["A fortified compound where guards drill and bunk", "A military post with armory and training yard"],
  ruins_entrance: ["A dark opening into the abandoned quarter's depths", "A partially collapsed gateway into the ruins"],
};

const NEW_SITE_SERVICES: Record<string, Array<{ name: string; cost: string }>> = {
  dock: [{ name: "Ship Passage", cost: "10+ gp" }, { name: "Cargo Storage", cost: "1 gp/day" }],
  warehouse: [{ name: "Secure Storage", cost: "5 sp/day" }],
  arena: [{ name: "Entry Fee", cost: "5 sp" }, { name: "Fighter Registration", cost: "5 gp" }],
  library: [{ name: "Research Access", cost: "1 gp/day" }, { name: "Scroll Copying", cost: "25 gp" }],
  bathhouse: [{ name: "Bath (common)", cost: "2 sp" }, { name: "Private Room", cost: "1 gp" }],
  gambling_hall: [{ name: "House Games", cost: "Varies" }, { name: "Private Room", cost: "5 gp" }],
  embassy: [{ name: "Travel Papers", cost: "10 gp" }],
  barracks: [{ name: "Guard Hire", cost: "2 gp/day" }],
  ruins_entrance: [],
};

// === Public API ===

export interface DistrictGenerationResult {
  districts: District[];
  districtSites: SettlementSite[];
  districtNPCs: NPC[];
  cityIdentity: CityIdentity;
}

/**
 * Generate all districts for a city settlement.
 */
export function generateCityDistricts(
  seed: string,
  settlement: Settlement,
  factions: Faction[],
  nameRegistry?: NameRegistry,
): DistrictGenerationResult {
  const rng = new SeededRandom(`${seed}-districts-${settlement.id}`);
  const registry = nameRegistry ?? new NameRegistry(seed);

  // 1. Generate city identity
  const cityIdentity = generateCityIdentity(rng, settlement);

  // 2. Determine district count
  const districtCount = getDistrictCount(settlement.population);

  // 3. Select district types
  const districtTypes = selectDistrictTypes(rng, cityIdentity, districtCount);

  // 4. Generate each district
  const districts: District[] = [];
  const allSites: SettlementSite[] = [];
  const allNPCs: NPC[] = [];

  for (let i = 0; i < districtTypes.length; i++) {
    const dtype = districtTypes[i];

    if (dtype === "ruins") {
      // Special: abandoned quarter
      const abandoned = generateAbandonedQuarter(rng, settlement.id);
      const { sites, npcs } = generateDistrictContent(
        rng, abandoned.district, settlement, registry
      );
      abandoned.district.siteIds = sites.map(s => s.id);
      abandoned.district.npcIds = npcs.map(n => n.id);
      districts.push(abandoned.district);
      allSites.push(...sites);
      allNPCs.push(...npcs);
    } else {
      const district = generateDistrict(rng, dtype, cityIdentity);
      const { sites, npcs } = generateDistrictContent(
        rng, district, settlement, registry
      );
      district.siteIds = sites.map(s => s.id);
      district.npcIds = npcs.map(n => n.id);
      districts.push(district);
      allSites.push(...sites);
      allNPCs.push(...npcs);
    }
  }

  // 5. Build adjacency graph
  generateDistrictAdjacency(rng, districts);

  // 6. Assign factions to districts
  const cityFactions = factions.filter(f =>
    f.status === "active" &&
    (f.territoryIds.includes(settlement.id) ||
     f.influenceIds.includes(settlement.id) ||
     f.headquartersId === settlement.id)
  );
  if (cityFactions.length > 0) {
    assignFactionsToDistricts(rng, districts, cityFactions);
  }

  // 7. Assign positions for node map
  assignDistrictPositions(districts);

  return {
    districts,
    districtSites: allSites,
    districtNPCs: allNPCs,
    cityIdentity,
  };
}

// === City Identity ===

function generateCityIdentity(rng: SeededRandom, settlement: Settlement): CityIdentity {
  const economies = settlement.economyBase;
  const primaryEconomy = economies[0] ?? "trade";
  const secondaryEconomy = economies.length > 1 ? economies[1] : undefined;

  // Generate epithet
  const matchingEpithets = CITY_EPITHETS.filter(e =>
    e.economies.some(ec => economies.includes(ec))
  );
  let epithet: string;
  if (matchingEpithets.length > 0) {
    const entry = rng.pick(matchingEpithets);
    epithet = rng.pick(entry.epithets);
  } else {
    epithet = rng.pick(GENERIC_EPITHETS);
  }

  // Cultural flavor
  const flavors = [
    `${primaryEconomy}-driven ${settlement.settlementType} city`,
    `cosmopolitan ${primaryEconomy} hub`,
    `ancient ${settlement.settlementType} stronghold`,
    `bustling ${primaryEconomy} center`,
    `fortified ${settlement.settlementType} seat of power`,
  ];

  return {
    primaryEconomy,
    secondaryEconomy,
    culturalFlavor: rng.pick(flavors),
    cityEpithet: epithet,
  };
}

// === District Count ===

function getDistrictCount(population: number): number {
  if (population <= 10000) return 4 + Math.floor(Math.random()); // 4-5
  if (population <= 17000) return 5 + Math.floor(Math.random() * 3); // 5-7
  return 7 + Math.floor(Math.random() * 3); // 7-9
}

// === District Type Selection ===

function selectDistrictTypes(
  rng: SeededRandom,
  identity: CityIdentity,
  count: number,
): DistrictType[] {
  const types: DistrictType[] = [];
  const used = new Set<DistrictType>();

  // Always: 1 market
  types.push("market");
  used.add("market");

  // Always: 1 residential-type (slums or noble, weighted)
  const residentialType: DistrictType = rng.chance(0.6) ? "slums" : "noble";
  types.push(residentialType);
  used.add(residentialType);

  // Always: 1 ruins
  types.push("ruins");
  used.add("ruins");

  // Economy-driven: 1-2 based on primary/secondary economy
  const economyTypes = ECONOMY_TO_DISTRICT_TYPES[identity.primaryEconomy] ?? [];
  const availableEcon = economyTypes.filter(t => !used.has(t));
  if (availableEcon.length > 0) {
    const picked = rng.pick(availableEcon);
    types.push(picked);
    used.add(picked);
  }

  if (identity.secondaryEconomy) {
    const secTypes = ECONOMY_TO_DISTRICT_TYPES[identity.secondaryEconomy] ?? [];
    const availableSec = secTypes.filter(t => !used.has(t));
    if (availableSec.length > 0 && types.length < count) {
      const picked = rng.pick(availableSec);
      types.push(picked);
      used.add(picked);
    }
  }

  // Fill remaining from universal pool (no duplicates)
  while (types.length < count) {
    const available = UNIVERSAL_DISTRICT_TYPES.filter(t => !used.has(t));
    if (available.length === 0) break;
    const picked = rng.pick(available);
    types.push(picked);
    used.add(picked);
  }

  return types;
}

// === District Generation ===

function generateDistrict(
  rng: SeededRandom,
  type: DistrictType,
  identity: CityIdentity,
): District {
  const id = `district-${nanoid(8)}`;

  const prefix = rng.pick(DISTRICT_NAME_PREFIXES[type]);
  const suffix = rng.pick(DISTRICT_NAME_SUFFIXES[type]);
  const name = `${prefix} ${suffix}`;

  const mood = pickDistrictMood(rng, type);
  const trouble = rng.pick(DISTRICT_TROUBLES[type]);
  const flavor = rng.pick(DISTRICT_FLAVORS[type]);
  const economies = DISTRICT_ECONOMIES[type];
  const economy = economies ? rng.pick(economies) : "Mixed local economy";

  return {
    id,
    name,
    type,
    description: `The ${name} district of the city. ${flavor}.`,
    mood,
    trouble,
    flavor,
    economy,
    faceNpcId: "", // Set by content generation
    siteIds: [],
    npcIds: [],
    rumors: [],
    notices: [],
    adjacencies: [],
    position: { x: 0, y: 0 },
  };
}

function pickDistrictMood(rng: SeededRandom, type: DistrictType): DistrictMood {
  const weights = DISTRICT_MOOD_WEIGHTS[type];
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const entry of weights) {
    roll -= entry.weight;
    if (roll <= 0) return entry.mood;
  }
  return weights[weights.length - 1].mood;
}

// === District Content (Sites + NPCs) ===

function generateDistrictContent(
  rng: SeededRandom,
  district: District,
  settlement: Settlement,
  nameRegistry: NameRegistry,
): { sites: SettlementSite[]; npcs: NPC[] } {
  const sites: SettlementSite[] = [];
  const npcs: NPC[] = [];

  // Face NPC + their site
  const faceRole = DISTRICT_FACE_ROLES[district.type];
  const faceSiteType = DISTRICT_FACE_SITE_TYPE[district.type];
  const faceArchetype = roleToArchetype(faceRole);

  const faceSite = generateDistrictSite(rng, faceSiteType, district.id);
  sites.push(faceSite);

  const faceNpc = generateNPC({
    seed: `${rng.next()}-face-${district.id}`,
    archetype: faceArchetype,
    locationId: settlement.id,
    siteId: faceSite.id,
    role: faceRole,
    nameRegistry,
    settlementType: settlement.settlementType,
  });
  faceNpc.districtId = district.id;
  faceSite.ownerId = faceNpc.id;
  district.faceNpcId = faceNpc.id;
  npcs.push(faceNpc);

  // Additional sites: 1-3 more (2-4 total including face site)
  const siteTypes = DISTRICT_SITE_TYPES[district.type] ?? ["tavern"];
  const extraSiteCount = rng.between(1, 3);
  for (let i = 0; i < extraSiteCount; i++) {
    const available = siteTypes.filter(t => t !== faceSiteType || sites.length > 2);
    if (available.length === 0) break;
    const siteType = rng.pick(available);
    const site = generateDistrictSite(rng, siteType, district.id);
    sites.push(site);

    // 70% chance site has an owner NPC
    if (rng.chance(0.7)) {
      const ownerRole = siteTypeToRole(siteType);
      const ownerNpc = generateNPC({
        seed: `${rng.next()}-owner-${site.id}`,
        archetype: roleToArchetype(ownerRole),
        locationId: settlement.id,
        siteId: site.id,
        role: ownerRole,
        nameRegistry,
        settlementType: settlement.settlementType,
      });
      ownerNpc.districtId = district.id;
      site.ownerId = ownerNpc.id;
      npcs.push(ownerNpc);
    }
  }

  // 1-2 colorful locals (no site)
  const localCount = rng.between(1, 2);
  const localArchetypes: CreatureArchetype[] = ["commoner", "thief", "merchant", "guard", "scholar"];
  for (let i = 0; i < localCount; i++) {
    const localNpc = generateNPC({
      seed: `${rng.next()}-local-${district.id}-${i}`,
      archetype: rng.pick(localArchetypes),
      locationId: settlement.id,
      nameRegistry,
      settlementType: settlement.settlementType,
    });
    localNpc.districtId = district.id;
    npcs.push(localNpc);
  }

  // Generate district rumors
  district.rumors = generateDistrictRumors(rng, district, sites);
  district.notices = generateDistrictNotices(rng, district);

  return { sites, npcs };
}

function generateDistrictSite(
  rng: SeededRandom,
  type: SiteType,
  districtId: string,
): SettlementSite {
  const id = `site-${nanoid(8)}`;

  // Use new site tables for district-specific types, fall back to existing patterns
  const newSiteData = NEW_SITE_NAMES[type];
  let name: string;
  let description: string;
  let services: Array<{ name: string; cost: string }>;

  if (newSiteData) {
    name = `${rng.pick(newSiteData.prefixes)} ${rng.pick(newSiteData.suffixes)}`;
    description = rng.pick(NEW_SITE_DESCRIPTIONS[type] ?? ["A notable establishment"]);
    services = [...(NEW_SITE_SERVICES[type] ?? [])];
  } else {
    // Reuse existing SiteGenerator patterns for standard types
    name = generateStandardSiteName(rng, type);
    description = generateStandardSiteDescription(rng, type);
    services = getStandardSiteServices(type);
  }

  const rumorSource = type === "tavern" || type === "inn" || rng.chance(0.3);
  const noticeBoard = type === "market" || type === "guild_hall" || type === "barracks" || rng.chance(0.15);

  return {
    id,
    name,
    type,
    description,
    staffIds: [],
    services,
    rumorSource,
    noticeBoard,
    districtId,
    quirk: rng.chance(0.25) ? rng.pick(SITE_QUIRKS) : undefined,
    secret: rng.chance(0.15) ? rng.pick(SITE_SECRETS) : undefined,
  };
}

// Standard site name tables (duplicated from SiteGenerator for self-containment)
const STANDARD_PREFIXES: Partial<Record<SiteType, string[]>> = {
  tavern: ["The Rusty", "The Drunken", "The Jolly", "The Dancing", "The Broken"],
  inn: ["The Weary", "The Golden", "The Silver", "The Red", "The Wandering"],
  temple: ["Temple of", "Shrine of", "Chapel of", "Sanctum of"],
  market: ["Central", "Old", "Grand", "Farmer's"],
  blacksmith: ["Iron", "Steel", "Forge of", "Hammer and"],
  general_store: ["Honest", "Old", "Reliable", "Town"],
  guild_hall: ["Hall of", "House of"],
  noble_estate: ["House", "Manor of", "Estate of"],
};

const STANDARD_SUFFIXES: Partial<Record<SiteType, string[]>> = {
  tavern: ["Tankard", "Barrel", "Goblin", "Sailor", "Mug"],
  inn: ["Traveler", "Dragon", "Stag", "Lion", "Crown"],
  temple: ["the Light", "the Dawn", "the Flame", "the Earth"],
  market: ["Market", "Square", "Bazaar"],
  blacksmith: ["Anvil", "Fire", "Arms", "Blades"],
  general_store: ["Goods", "Provisions", "Trading Post"],
  guild_hall: ["Merchants", "Craftsmen", "Artisans"],
  noble_estate: ["Goldwyn", "Blackwood", "Ravencrest"],
};

function generateStandardSiteName(rng: SeededRandom, type: SiteType): string {
  const prefixes = STANDARD_PREFIXES[type] ?? ["The Old"];
  const suffixes = STANDARD_SUFFIXES[type] ?? ["Place"];
  return `${rng.pick(prefixes)} ${rng.pick(suffixes)}`;
}

function generateStandardSiteDescription(rng: SeededRandom, type: SiteType): string {
  const descriptions: Partial<Record<SiteType, string[]>> = {
    tavern: ["A smoky drinking hall filled with locals", "A rowdy establishment known for strong ale"],
    inn: ["A cozy establishment with warm beds and hot meals", "A well-maintained inn popular with travelers"],
    temple: ["A grand stone structure with soaring spires", "A humble house of worship"],
    market: ["A bustling open-air market", "A covered marketplace with permanent stalls"],
    blacksmith: ["A busy forge with the ring of hammers", "A well-equipped smithy"],
    general_store: ["A cramped shop packed with goods", "A well-organized store with helpful staff"],
    guild_hall: ["An impressive building adorned with guild symbols", "A busy hall where merchants conduct business"],
    noble_estate: ["A grand manor behind iron gates", "An elegant townhouse with manicured grounds"],
  };
  return rng.pick(descriptions[type] ?? ["A notable establishment in the district"]);
}

function getStandardSiteServices(type: SiteType): Array<{ name: string; cost: string }> {
  const services: Partial<Record<SiteType, Array<{ name: string; cost: string }>>> = {
    tavern: [{ name: "Ale", cost: "4 cp" }, { name: "Wine", cost: "2 sp" }, { name: "Meal", cost: "1 sp" }],
    inn: [{ name: "Room (common)", cost: "5 sp/night" }, { name: "Meal", cost: "5 cp" }],
    temple: [{ name: "Healing (1d8)", cost: "10 gp" }, { name: "Blessing", cost: "5 gp" }],
    market: [{ name: "General Goods", cost: "Varies" }],
    blacksmith: [{ name: "Weapon Repair", cost: "5 gp" }, { name: "Armor Repair", cost: "10 gp" }],
    general_store: [{ name: "Adventuring Gear", cost: "Varies" }, { name: "Rations", cost: "5 sp/day" }],
    guild_hall: [{ name: "Contracts", cost: "Varies" }],
    noble_estate: [{ name: "Audience", cost: "By appointment" }],
  };
  return [...(services[type] ?? [])];
}

const SITE_QUIRKS = [
  "The owner is unusually secretive",
  "A strange smell permeates the building",
  "The staff speaks in hushed tones",
  "An unusual pet roams the premises",
  "Locals avoid this place for unknown reasons",
];

const SITE_SECRETS = [
  "A hidden cellar leads to old tunnels",
  "The owner is secretly a spy",
  "Stolen goods are hidden in a back room",
  "A cult meets here after dark",
  "A ghost haunts the upper floors",
];

// === Role/Archetype Mapping ===

function roleToArchetype(role: NPCRole): CreatureArchetype {
  const map: Partial<Record<NPCRole, CreatureArchetype>> = {
    merchant: "merchant",
    high_priest: "priest",
    noble: "noble",
    crime_boss: "thief",
    harbormaster: "guard",
    guild_master: "merchant",
    watch_captain: "guard",
    ambassador: "noble",
    elder: "commoner",
    sage: "scholar",
    arena_master: "knight",
    criminal: "thief",
    innkeeper: "commoner",
    priest: "priest",
    blacksmith: "commoner",
    shopkeeper: "merchant",
  };
  return map[role] ?? "commoner";
}

function siteTypeToRole(type: SiteType): NPCRole {
  const map: Partial<Record<SiteType, NPCRole>> = {
    tavern: "innkeeper",
    inn: "innkeeper",
    temple: "priest",
    blacksmith: "blacksmith",
    general_store: "shopkeeper",
    market: "merchant",
    guild_hall: "guild_master",
    noble_estate: "noble",
    dock: "harbormaster",
    warehouse: "merchant",
    arena: "arena_master",
    library: "sage",
    bathhouse: "merchant",
    gambling_hall: "crime_boss",
    embassy: "ambassador",
    barracks: "watch_captain",
    ruins_entrance: "criminal",
  };
  return map[type] ?? "shopkeeper";
}

// === District Rumors & Notices ===

function generateDistrictRumors(
  rng: SeededRandom,
  district: District,
  sites: SettlementSite[],
): Rumor[] {
  const rumors: Rumor[] = [];
  const count = rng.between(2, 4);

  const templates = [
    `They say ${district.trouble.toLowerCase()}`,
    `The folk in ${district.name} are ${district.mood} these days`,
    `${district.name} used to be different before the trouble started`,
  ];

  // Add site-specific rumors
  for (const site of sites) {
    if (site.secret) {
      templates.push(`Something strange is going on at ${site.name}`);
    }
    if (site.rumorSource) {
      templates.push(`You hear things at ${site.name} — if you know how to listen`);
    }
  }

  const picked = rng.sample(templates, Math.min(count, templates.length));
  for (let i = 0; i < picked.length; i++) {
    rumors.push({
      id: `rumor-${district.id}-${i}`,
      text: picked[i],
      isTrue: rng.chance(0.6),
      source: sites.length > 0 ? rng.pick(sites).name : "street talk",
    });
  }

  return rumors;
}

function generateDistrictNotices(rng: SeededRandom, district: District): Notice[] {
  const notices: Notice[] = [];

  // 40% chance of a notice
  if (rng.chance(0.4)) {
    const types: Array<"bounty" | "job" | "warning" | "announcement" | "request"> =
      ["bounty", "job", "warning", "announcement", "request"];
    notices.push({
      id: `notice-${district.id}-0`,
      title: `${district.name} Notice`,
      description: `Regarding the situation in ${district.name}: ${district.trouble}`,
      noticeType: rng.pick(types),
    });
  }

  return notices;
}

// === Adjacency Graph ===

function generateDistrictAdjacency(rng: SeededRandom, districts: District[]): void {
  if (districts.length <= 1) return;

  const connectionTypes: Array<"street" | "bridge" | "gate" | "tunnel"> =
    ["street", "street", "street", "bridge", "gate", "tunnel"];

  // Step 1: Build spanning tree (all districts reachable)
  const connected = new Set<number>([0]);
  const unconnected = new Set<number>();
  for (let i = 1; i < districts.length; i++) unconnected.add(i);

  while (unconnected.size > 0) {
    const from = rng.pick(Array.from(connected));
    const to = rng.pick(Array.from(unconnected));

    const connType = rng.pick(connectionTypes);
    districts[from].adjacencies.push({
      districtId: districts[to].id,
      connectionType: connType,
    });
    districts[to].adjacencies.push({
      districtId: districts[from].id,
      connectionType: connType,
    });

    connected.add(to);
    unconnected.delete(to);
  }

  // Step 2: Add 2-4 extra edges for more connectivity
  const extraEdges = rng.between(2, Math.min(4, districts.length));
  for (let i = 0; i < extraEdges; i++) {
    const a = rng.between(0, districts.length - 1);
    let b = rng.between(0, districts.length - 1);
    if (a === b) b = (b + 1) % districts.length;

    // Don't add duplicate edges
    if (districts[a].adjacencies.some(adj => adj.districtId === districts[b].id)) continue;

    const connType = rng.pick(connectionTypes);
    districts[a].adjacencies.push({
      districtId: districts[b].id,
      connectionType: connType,
    });
    districts[b].adjacencies.push({
      districtId: districts[a].id,
      connectionType: connType,
    });
  }

  // Step 3: Thematic adjacency rules
  const typeIndex = new Map<DistrictType, number>();
  districts.forEach((d, i) => typeIndex.set(d.type, i));

  // Noble <-> temple (secured corridor)
  addThematicEdge(rng, districts, typeIndex, "noble", "temple", "gate");
  // Noble <-> military (secured corridor)
  addThematicEdge(rng, districts, typeIndex, "noble", "military", "gate");
  // Slums <-> docks (seedy corridor)
  addThematicEdge(rng, districts, typeIndex, "slums", "docks", "street");
  // Slums <-> warehouse (seedy corridor)
  addThematicEdge(rng, districts, typeIndex, "slums", "warehouse", "street");

  // Ruins: limit to 1-2 connections
  const ruinsIdx = typeIndex.get("ruins");
  if (ruinsIdx !== undefined) {
    const ruins = districts[ruinsIdx];
    while (ruins.adjacencies.length > 2) {
      const removed = ruins.adjacencies.pop()!;
      // Remove reverse edge
      const other = districts.find(d => d.id === removed.districtId);
      if (other) {
        other.adjacencies = other.adjacencies.filter(a => a.districtId !== ruins.id);
      }
    }
  }
}

function addThematicEdge(
  rng: SeededRandom,
  districts: District[],
  typeIndex: Map<DistrictType, number>,
  typeA: DistrictType,
  typeB: DistrictType,
  connType: "street" | "bridge" | "gate" | "tunnel",
): void {
  const idxA = typeIndex.get(typeA);
  const idxB = typeIndex.get(typeB);
  if (idxA === undefined || idxB === undefined) return;

  // Don't add if already connected
  if (districts[idxA].adjacencies.some(adj => adj.districtId === districts[idxB].id)) return;

  districts[idxA].adjacencies.push({ districtId: districts[idxB].id, connectionType: connType });
  districts[idxB].adjacencies.push({ districtId: districts[idxA].id, connectionType: connType });
}

// === Faction Assignment ===

function assignFactionsToDistricts(
  rng: SeededRandom,
  districts: District[],
  factions: Faction[],
): void {
  // Map faction archetypes to preferred district types
  const archetypePreferences: Record<FactionArchetype, DistrictType[]> = {
    criminal:   ["slums", "docks", "warehouse", "gambling_hall" as DistrictType],
    religious:  ["temple"],
    political:  ["noble", "military"],
    mercantile: ["market", "warehouse", "caravan"],
    military:   ["military", "docks"],
    arcane:     ["academic", "arcane_academy"],
    tribal:     ["foreign", "slums"],
    monstrous:  ["ruins", "slums"],
    secret:     ["slums", "warehouse", "ruins"],
  };

  // Each faction gets 1-2 districts
  for (const faction of factions) {
    const prefs = archetypePreferences[faction.archetype] ?? ["market"];

    // Try to find a preferred district that isn't already controlled
    const availablePreferred = districts.filter(
      d => prefs.includes(d.type) && !d.controllingFactionId
    );

    if (availablePreferred.length > 0) {
      const controlled = rng.pick(availablePreferred);
      controlled.controllingFactionId = faction.id;

      // 40% chance to contest an adjacent district
      if (rng.chance(0.4)) {
        const adjacentIds = controlled.adjacencies.map(a => a.districtId);
        const adjacentDistricts = districts.filter(
          d => adjacentIds.includes(d.id) && d.type !== "ruins"
        );
        if (adjacentDistricts.length > 0) {
          const contested = rng.pick(adjacentDistricts);
          if (!contested.contestedByFactionIds) contested.contestedByFactionIds = [];
          contested.contestedByFactionIds.push(faction.id);
        }
      }
    } else {
      // Fallback: pick any uncontrolled non-ruins district
      const available = districts.filter(
        d => !d.controllingFactionId && d.type !== "ruins"
      );
      if (available.length > 0) {
        const controlled = rng.pick(available);
        controlled.controllingFactionId = faction.id;
      }
    }
  }
}

// === Position Assignment ===

function assignDistrictPositions(districts: District[]): void {
  if (districts.length === 0) return;

  const radius = 150;
  const angleStep = (2 * Math.PI) / districts.length;

  // Ruins go at the edge; others in circle
  const ruinsIdx = districts.findIndex(d => d.type === "ruins");

  for (let i = 0; i < districts.length; i++) {
    const angle = angleStep * i - Math.PI / 2; // Start from top
    let r = radius;

    // Push ruins further out
    if (i === ruinsIdx) r = radius * 1.3;

    districts[i].position = {
      x: Math.round(200 + r * Math.cos(angle)),
      y: Math.round(200 + r * Math.sin(angle)),
    };
  }
}
