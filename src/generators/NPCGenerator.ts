import { nanoid } from "nanoid";
import type {
  NPC,
  NPCRace,
  NPCGender,
  CreatureArchetype,
  ThreatLevel,
  FactionRole,
  NPCRole,
  Settlement,
  SettlementSite,
  SiteType,
  Faction,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";
import { NameRegistry, generateRace } from "./NameRegistry";

// === Age Generation ===

// Age ranges weighted toward middle-aged (30-50)
const AGE_WEIGHTS = createWeightedTable({
  young: 15, // 18-25
  adult: 30, // 26-40
  middleAged: 35, // 41-55
  older: 15, // 56-65
  elderly: 5, // 66-75
});

const AGE_RANGES: Record<string, [number, number]> = {
  young: [18, 25],
  adult: [26, 40],
  middleAged: [41, 55],
  older: [56, 65],
  elderly: [66, 75],
};

function generateAge(rng: SeededRandom): number {
  const bracket = rng.pickWeighted(AGE_WEIGHTS);
  const [min, max] = AGE_RANGES[bracket];
  return rng.between(min, max);
}

// === Site Type to NPC Role mapping ===

const SITE_TYPE_TO_ROLE: Record<SiteType, NPCRole> = {
  inn: "innkeeper",
  tavern: "innkeeper",
  temple: "priest",
  blacksmith: "blacksmith",
  general_store: "shopkeeper",
  market: "merchant",
  guild_hall: "merchant",
  noble_estate: "noble",
};

// === Trait Tables ===

// Actionable wants that map to quest hooks - each has keywords for HookWeaver matching
const WANTS_BY_ARCHETYPE: Record<CreatureArchetype, string[]> = {
  commoner: [
    "Someone to deliver medicine to family in another village",
    "Help finding who's been killing livestock at night",
    "Escort for their child traveling to apprenticeship",
    "Muscle to collect a debt owed by a neighbor",
    "Someone to retrieve a lost family heirloom from the old ruins",
    "Help driving off wolves threatening the farm",
  ],
  bandit: [
    "A fence for stolen treasure worth 200gp",
    "Information about a wealthy merchant's schedule",
    "Someone to help transport stolen cargo past guards",
    "Muscle to intimidate a rival gang",
    "Help escaping their past life - needs forged documents",
    "A partner for one last big score at the noble estate",
  ],
  guard: [
    "Help catching a thief who keeps escaping",
    "Evidence to catch a corrupt official",
    "Someone to investigate disappearances on the road",
    "Escort for a prisoner transfer",
    "Information about a smuggling operation",
    "Help clearing creatures from an abandoned watchtower",
  ],
  knight: [
    "A squire to help prove their honor in a trial",
    "Someone to find proof of a rival's treachery",
    "Help rescuing a captured comrade from bandits",
    "A trophy from a dangerous beast to prove glory",
    "Escort to deliver challenge to a rival knight",
    "Help investigating rumors of corruption in their order",
  ],
  assassin: [
    "Information about a well-guarded target",
    "Someone to create a distraction at a noble's party",
    "Help acquiring rare poison ingredients",
    "A safe house outside the city",
    "Documents to escape their former employers",
    "Someone to deliver a message to their next target",
  ],
  witch: [
    "Rare herbs from a dangerous location",
    "Ancient artifact from a sealed tomb",
    "Test subjects for a new potion (willing volunteers)",
    "Lost knowledge from a ruined library",
    "Someone to gather strange mushrooms from the deep forest",
    "Help dealing with angry villagers spreading rumors",
  ],
  priest: [
    "Escort on a dangerous pilgrimage to a holy site",
    "Help recovering sacred relics stolen by bandits",
    "Someone to investigate heretical activity in town",
    "Materials to build a shrine in a remote village",
    "Help cleansing a cursed location",
    "Delivery of blessed items to a distant temple",
  ],
  noble: [
    "Discrete investigators for a family scandal",
    "Escort for a secret meeting with a rival",
    "Someone to retrieve compromising documents",
    "Mercenaries for a land dispute with neighbors",
    "Information about a rival house's weaknesses",
    "Help finding a suitable match for their heir",
  ],
  merchant: [
    "Guards for a valuable cargo shipment",
    "Someone to investigate missing trade caravans",
    "Rare goods from a dangerous region",
    "Information about a competitor's supplier",
    "Help negotiating with hostile trading partners",
    "Recovery of stolen merchandise from bandits",
  ],
  scholar: [
    "Ancient texts from a sealed dungeon",
    "Someone to map an unexplored ruin",
    "Lost artifact for their research collection",
    "Help translating a mysterious inscription",
    "Specimens from a dangerous creature",
    "Investigation into a historical mystery",
  ],
  thief: [
    "A partner for a heist at the guild hall",
    "Information about guard patrol schedules",
    "Someone to case a wealthy merchant's home",
    "Help paying off a gambling debt before deadline",
    "A fence for unusual stolen goods",
    "Muscle to deal with a blackmailer",
  ],
  cultist: [
    "Rare components for a dark ritual",
    "Someone to distract guards during a ceremony",
    "Recruits for the cause (desperate types preferred)",
    "Ancient texts from a forbidden library",
    "Help silencing someone who knows too much",
    "Sacrifice materials from a holy place",
  ],
};

const SECRETS: string[] = [
  "Is secretly a spy for another faction",
  "Has committed a terrible crime",
  "Is not who they claim to be",
  "Knows the location of hidden treasure",
  "Is slowly being corrupted by dark magic",
  "Has a forbidden love affair",
  "Is planning to betray their allies",
  "Owes a massive debt to dangerous people",
  "Has made a pact with a dark entity",
  "Witnessed something they shouldn't have",
  "Is dying of a mysterious illness",
  "Has the key to an ancient secret",
];

const ARCHETYPE_DESCRIPTIONS: Record<CreatureArchetype, string[]> = {
  commoner: [
    "A weathered farmer with calloused hands",
    "A tired laborer with a kind smile",
    "A nervous townsperson",
  ],
  bandit: [
    "A scarred ruffian with cold eyes",
    "A desperate outlaw on the run",
    "A ruthless brigand seeking easy prey",
  ],
  guard: [
    "A vigilant watchman in worn armor",
    "A stern-faced soldier",
    "A grizzled veteran of many patrols",
  ],
  knight: [
    "An armored warrior of noble bearing",
    "A proud knight in polished plate",
    "A battle-tested champion",
  ],
  assassin: [
    "A quiet figure shrouded in shadow",
    "A professional killer with dead eyes",
    "A nimble operative",
  ],
  witch: [
    "A mysterious figure reeking of herbs",
    "An eccentric hermit with wild eyes",
    "A keeper of old secrets",
  ],
  priest: [
    "A pious figure in religious vestments",
    "A devoted servant of the divine",
    "A holy person radiating calm",
  ],
  noble: [
    "An aristocrat in fine clothes",
    "A haughty lord or lady",
    "A refined individual of breeding",
  ],
  merchant: [
    "A shrewd trader with a ready smile",
    "A calculating businessperson",
    "A well-dressed dealmaker",
  ],
  scholar: [
    "A bespectacled researcher",
    "A dusty academic lost in thought",
    "A curious intellectual",
  ],
  thief: [
    "A quick-fingered opportunist",
    "A shadowy figure with darting eyes",
    "A street-smart survivor",
  ],
  cultist: [
    "A fervent believer with strange markings",
    "A secretive devotee of dark powers",
    "A zealot hiding dark intentions",
  ],
};

const ARCHETYPE_THREAT: Record<CreatureArchetype, ThreatLevel> = {
  commoner: 1,
  bandit: 2,
  guard: 2,
  knight: 3,
  assassin: 4,
  witch: 3,
  priest: 2,
  noble: 2,
  merchant: 1,
  scholar: 1,
  thief: 2,
  cultist: 3,
};

export interface NPCGeneratorOptions {
  seed: string;
  archetype?: CreatureArchetype;
  factionId?: string;
  factionRole?: FactionRole;
  locationId?: string;
  siteId?: string;
  role?: NPCRole;
  age?: number; // Override generated age
  nameRegistry?: NameRegistry; // For unique name generation
  settlementType?: string; // For race distribution (e.g., "dwarven", "elven")
  race?: NPCRace; // Override generated race
  gender?: NPCGender; // Override generated gender
}

/**
 * Generate a single NPC.
 */
export function generateNPC(options: NPCGeneratorOptions): NPC {
  const {
    seed,
    archetype,
    factionId,
    factionRole,
    locationId,
    siteId,
    role,
    age,
    nameRegistry,
    settlementType,
    race: overrideRace,
    gender: overrideGender,
  } = options;
  const rng = new SeededRandom(`${seed}-npc-${nanoid(4)}`);

  const finalArchetype = archetype ?? rng.pick(Object.keys(ARCHETYPE_DESCRIPTIONS) as CreatureArchetype[]);

  // Generate or use provided race/gender
  const race: NPCRace = overrideRace ?? generateRace(rng, settlementType);
  const gender: NPCGender = overrideGender ?? (rng.chance(0.5) ? "male" : "female");

  // Generate name using registry (unique) or fallback to basic generation
  const name = nameRegistry
    ? nameRegistry.generateFullName(race, gender)
    : generateFallbackName(rng);

  const description = rng.pick(ARCHETYPE_DESCRIPTIONS[finalArchetype]);
  const flavorWant = rng.pick(WANTS_BY_ARCHETYPE[finalArchetype]);
  const threatLevel = ARCHETYPE_THREAT[finalArchetype];
  const npcAge = age ?? generateAge(rng);

  const npc: NPC = {
    id: `npc-${nanoid(8)}`,
    name,
    race,
    gender,
    description,
    archetype: finalArchetype,
    threatLevel,
    age: npcAge,
    role,
    relationships: [],
    flavorWant, // Background desire
    wants: [], // Hook-linked wants populated by HookWeaver
    status: "alive",
    tags: [finalArchetype, race],
  };

  if (factionId) {
    npc.factionId = factionId;
    npc.factionRole = factionRole ?? "member";
  }

  if (locationId) {
    npc.locationId = locationId;
  }

  if (siteId) {
    npc.siteId = siteId;
  }

  // 20% chance of a secret
  if (rng.chance(0.2)) {
    npc.secret = rng.pick(SECRETS);
  }

  return npc;
}

// Fallback name generation when no registry is provided (legacy support)
function generateFallbackName(rng: SeededRandom): string {
  const FALLBACK_FIRST = ["Aldric", "Brynn", "Cedric", "Dara", "Elric", "Fiona", "Gareth", "Helena"];
  const FALLBACK_LAST = ["Blackwood", "Stoneheart", "Ironforge", "Shadowmere", "Brightwater"];
  return `${rng.pick(FALLBACK_FIRST)} ${rng.pick(FALLBACK_LAST)}`;
}

export interface SettlementNPCOptions {
  seed: string;
  settlement: Settlement;
  sites: SettlementSite[];
  nameRegistry?: NameRegistry;
  settlementType?: string; // For race distribution (e.g., "dwarven", "elven", "human")
}

export interface SettlementNPCResult {
  npcs: NPC[];
  mayorNpcId?: string;
  siteOwnerMap: Map<string, string>; // siteId -> npcId
}

/**
 * Generate NPCs for a settlement and its sites.
 * Returns NPCs, mayor ID, and site owner mappings.
 */
export function generateSettlementNPCs(options: SettlementNPCOptions): SettlementNPCResult {
  const { seed, settlement, sites, nameRegistry, settlementType } = options;
  const rng = new SeededRandom(`${seed}-settlement-npcs-${settlement.id}`);
  const npcs: NPC[] = [];
  const siteOwnerMap = new Map<string, string>();

  // Generate mayor/elder first (middle-aged or older)
  const mayorRole: NPCRole = settlement.governmentType === "elder" ? "elder" : "mayor";
  const mayorAge = rng.between(45, 70); // Leaders are older
  const mayor = generateNPC({
    seed: `${seed}-mayor-${settlement.id}`,
    archetype: settlement.governmentType === "theocracy" ? "priest" : "noble",
    locationId: settlement.id,
    role: mayorRole,
    age: mayorAge,
    nameRegistry,
    settlementType,
  });
  npcs.push(mayor);
  const mayorNpcId = mayor.id;

  // Generate owner/staff for each site
  for (const site of sites) {
    // Site owner with role based on site type
    const ownerArchetype = getSiteOwnerArchetype(site.type);
    const siteRole = SITE_TYPE_TO_ROLE[site.type];
    const owner = generateNPC({
      seed: `${seed}-site-${site.id}`,
      archetype: ownerArchetype,
      locationId: settlement.id,
      siteId: site.id,
      role: siteRole,
      nameRegistry,
      settlementType,
    });
    npcs.push(owner);
    siteOwnerMap.set(site.id, owner.id);

    // 1-2 staff for larger sites
    if (rng.chance(0.5)) {
      const staff = generateNPC({
        seed: `${seed}-staff-${site.id}`,
        archetype: "commoner",
        locationId: settlement.id,
        siteId: site.id,
        nameRegistry,
        settlementType,
      });
      npcs.push(staff);
    }
  }

  // Generate some general townsfolk with roles
  const populationFactor = Math.floor(settlement.population / 500);
  const townsfolkCount = Math.min(rng.between(2, 5) + populationFactor, 10);

  const TOWNSFOLK_ROLES: NPCRole[] = ["farmer", "craftsman", "merchant", "guard_captain"];
  for (let i = 0; i < townsfolkCount; i++) {
    const archetype = rng.pick(["commoner", "commoner", "guard", "merchant"] as CreatureArchetype[]);
    const role = rng.pick(TOWNSFOLK_ROLES);
    const npc = generateNPC({
      seed: `${seed}-townsfolk-${i}`,
      archetype,
      locationId: settlement.id,
      role,
      nameRegistry,
      settlementType,
    });
    npcs.push(npc);
  }

  return { npcs, mayorNpcId, siteOwnerMap };
}

function getSiteOwnerArchetype(siteType: string): CreatureArchetype {
  const mapping: Record<string, CreatureArchetype> = {
    tavern: "commoner",
    inn: "commoner",
    temple: "priest",
    blacksmith: "commoner",
    general_store: "merchant",
    market: "merchant",
    guild_hall: "merchant",
    noble_estate: "noble",
  };
  return mapping[siteType] ?? "commoner";
}

export interface FactionNPCOptions {
  seed: string;
  faction: Faction;
  nameRegistry?: NameRegistry;
}

/**
 * Generate NPCs for a faction.
 */
export function generateFactionNPCs(options: FactionNPCOptions): NPC[] {
  const { seed, faction, nameRegistry } = options;
  const rng = new SeededRandom(`${seed}-faction-npcs-${faction.id}`);
  const npcs: NPC[] = [];

  // Generate leader
  const leader = generateNPC({
    seed: `${seed}-leader-${faction.id}`,
    archetype: faction.leaderArchetype,
    factionId: faction.id,
    factionRole: "leader",
    nameRegistry,
  });
  npcs.push(leader);

  // Generate 1-2 lieutenants
  const lieutenantCount = rng.between(1, 2);
  for (let i = 0; i < lieutenantCount; i++) {
    const lieutenant = generateNPC({
      seed: `${seed}-lt-${faction.id}-${i}`,
      archetype: faction.leaderArchetype,
      factionId: faction.id,
      factionRole: "lieutenant",
      nameRegistry,
    });
    npcs.push(lieutenant);
  }

  // Generate 2-4 members
  const memberCount = rng.between(2, 4);
  for (let i = 0; i < memberCount; i++) {
    const member = generateNPC({
      seed: `${seed}-member-${faction.id}-${i}`,
      archetype: faction.memberArchetype,
      factionId: faction.id,
      factionRole: "member",
      nameRegistry,
    });
    npcs.push(member);
  }

  return npcs;
}
