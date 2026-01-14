import { nanoid } from "nanoid";
import type {
  NPC,
  CreatureArchetype,
  ThreatLevel,
  FactionRole,
  Settlement,
  SettlementSite,
  Faction,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Name Tables ===

const FIRST_NAMES = [
  "Aldric", "Brynn", "Cedric", "Dara", "Elric", "Fiona", "Gareth", "Helena",
  "Ivar", "Jenna", "Kael", "Lyra", "Magnus", "Nadia", "Orin", "Petra",
  "Quinn", "Rowan", "Silas", "Thalia", "Ulric", "Vera", "Willem", "Xara",
  "Yorick", "Zara", "Aldwin", "Brom", "Cora", "Dorian",
];

const LAST_NAMES = [
  "Blackwood", "Stoneheart", "Ironforge", "Shadowmere", "Brightwater",
  "Thornwood", "Stormwind", "Goldmane", "Silverton", "Ravencrest",
  "Oakenshield", "Fireforge", "Frostborn", "Nightingale", "Greymoor",
];

const NICKNAMES = [
  "the Bold", "the Wise", "the Swift", "the Silent", "the Fierce",
  "the Cunning", "the Kind", "the Grim", "the Lucky", "the Lost",
];

// === Trait Tables ===

const WANTS_BY_ARCHETYPE: Record<CreatureArchetype, string[]> = {
  commoner: [
    "A better life for their family",
    "To be left alone",
    "Simple pleasures and good company",
    "Justice for a past wrong",
  ],
  bandit: [
    "Enough gold to retire",
    "Revenge on those who wronged them",
    "Power over others",
    "To escape their past",
  ],
  guard: [
    "To protect the innocent",
    "A promotion",
    "Peace and quiet",
    "To catch a particular criminal",
  ],
  knight: [
    "Honor and glory",
    "To serve their lord faithfully",
    "To prove themselves in battle",
    "To protect the weak",
  ],
  assassin: [
    "The perfect kill",
    "Freedom from their masters",
    "Enough gold to disappear",
    "Revenge on a target who escaped",
  ],
  witch: [
    "Forbidden knowledge",
    "Power over nature",
    "Respect from the ignorant",
    "To complete a great working",
  ],
  priest: [
    "To spread the faith",
    "Divine revelation",
    "To build a great temple",
    "To root out heresy",
  ],
  noble: [
    "More power and influence",
    "A worthy heir",
    "Revenge on rival houses",
    "The throne itself",
  ],
  merchant: [
    "Wealth beyond measure",
    "A monopoly on trade",
    "Rare and valuable goods",
    "Political influence",
  ],
  scholar: [
    "Lost knowledge",
    "Recognition for their work",
    "Ancient artifacts",
    "To solve a great mystery",
  ],
  thief: [
    "The big score",
    "Respect in the underworld",
    "To pay off a debt",
    "Information worth more than gold",
  ],
  cultist: [
    "To summon their dark god",
    "Power from dark rituals",
    "More converts to the cause",
    "To destroy the old faiths",
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
}

/**
 * Generate a single NPC.
 */
export function generateNPC(options: NPCGeneratorOptions): NPC {
  const { seed, archetype, factionId, factionRole, locationId, siteId } = options;
  const rng = new SeededRandom(`${seed}-npc-${nanoid(4)}`);

  const finalArchetype = archetype ?? rng.pick(Object.keys(ARCHETYPE_DESCRIPTIONS) as CreatureArchetype[]);
  const name = generateNPCName(rng);
  const description = rng.pick(ARCHETYPE_DESCRIPTIONS[finalArchetype]);
  const wants = rng.pick(WANTS_BY_ARCHETYPE[finalArchetype]);
  const threatLevel = ARCHETYPE_THREAT[finalArchetype];

  const npc: NPC = {
    id: `npc-${nanoid(8)}`,
    name,
    description,
    archetype: finalArchetype,
    threatLevel,
    wants,
    status: "alive",
    tags: [finalArchetype],
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

function generateNPCName(rng: SeededRandom): string {
  const first = rng.pick(FIRST_NAMES);
  const last = rng.pick(LAST_NAMES);

  // 20% chance of a nickname
  if (rng.chance(0.2)) {
    const nickname = rng.pick(NICKNAMES);
    return `${first} ${nickname} ${last}`;
  }

  return `${first} ${last}`;
}

export interface SettlementNPCOptions {
  seed: string;
  settlement: Settlement;
  sites: SettlementSite[];
}

/**
 * Generate NPCs for a settlement and its sites.
 */
export function generateSettlementNPCs(options: SettlementNPCOptions): NPC[] {
  const { seed, settlement, sites } = options;
  const rng = new SeededRandom(`${seed}-settlement-npcs-${settlement.id}`);
  const npcs: NPC[] = [];

  // Generate owner/staff for each site
  for (const site of sites) {
    // Site owner
    const ownerArchetype = getSiteOwnerArchetype(site.type);
    const owner = generateNPC({
      seed: `${seed}-site-${site.id}`,
      archetype: ownerArchetype,
      locationId: settlement.id,
      siteId: site.id,
    });
    npcs.push(owner);

    // 1-2 staff for larger sites
    if (rng.chance(0.5)) {
      const staff = generateNPC({
        seed: `${seed}-staff-${site.id}`,
        archetype: "commoner",
        locationId: settlement.id,
        siteId: site.id,
      });
      npcs.push(staff);
    }
  }

  // Generate some general townsfolk
  const populationFactor = Math.floor(settlement.population / 500);
  const townsfolkCount = Math.min(rng.between(2, 5) + populationFactor, 10);

  for (let i = 0; i < townsfolkCount; i++) {
    const archetype = rng.pick(["commoner", "commoner", "guard", "merchant"] as CreatureArchetype[]);
    const npc = generateNPC({
      seed: `${seed}-townsfolk-${i}`,
      archetype,
      locationId: settlement.id,
    });
    npcs.push(npc);
  }

  return npcs;
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
}

/**
 * Generate NPCs for a faction.
 */
export function generateFactionNPCs(options: FactionNPCOptions): NPC[] {
  const { seed, faction } = options;
  const rng = new SeededRandom(`${seed}-faction-npcs-${faction.id}`);
  const npcs: NPC[] = [];

  // Generate leader
  const leader = generateNPC({
    seed: `${seed}-leader-${faction.id}`,
    archetype: faction.leaderArchetype,
    factionId: faction.id,
    factionRole: "leader",
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
    });
    npcs.push(member);
  }

  return npcs;
}
