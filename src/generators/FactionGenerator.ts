import { nanoid } from "nanoid";
import type {
  Faction,
  FactionArchetype,
  FactionScale,
  FactionType,
  CreatureArchetype,
  FactionRelationship,
  RelationshipType,
  FactionLair,
  HexCoord,
  Hex,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Name Tables ===

const FACTION_PREFIXES = [
  "The",
  "Order of the",
  "Brotherhood of",
  "Circle of",
  "Guild of",
  "Cult of the",
  "House",
  "Clan",
  "Band of",
  "Sons of",
];

const FACTION_NOUNS: Record<FactionArchetype, string[]> = {
  criminal: ["Shadow", "Night", "Blade", "Serpent", "Raven", "Viper", "Wolf", "Dagger"],
  religious: ["Dawn", "Light", "Flame", "Radiance", "Truth", "Redemption", "Salvation"],
  political: ["Crown", "Throne", "Council", "Banner", "Iron", "Stone", "Gold"],
  mercantile: ["Coin", "Scale", "Merchant", "Fortune", "Trade", "Silver", "Road"],
  military: ["Sword", "Shield", "Lance", "Iron", "Steel", "Hammer", "Valor"],
  arcane: ["Rune", "Sigil", "Star", "Void", "Arcane", "Mystic", "Crystal"],
  tribal: ["Bear", "Wolf", "Elk", "Storm", "Mountain", "River", "Thunder"],
  monstrous: ["Fang", "Claw", "Blood", "Bone", "Horror", "Shadow", "Doom"],
  secret: ["Veil", "Mask", "Whisper", "Echo", "Silence", "Hidden", "Unknown"],
};

const ARCHETYPE_WEIGHTS = createWeightedTable<FactionArchetype>({
  criminal: 20,
  religious: 15,
  political: 10,
  mercantile: 15,
  military: 15,
  arcane: 10,
  tribal: 5,
  monstrous: 5,
  secret: 5,
});

// === Faction Type ===

const FACTION_TYPE_WEIGHTS = createWeightedTable<FactionType>({
  cult: 25,
  militia: 25,
  syndicate: 20,
  guild: 20,
  tribe: 10,
});

const PURPOSE_BY_TYPE: Record<FactionType, string[]> = {
  cult: [
    "conducting dark rituals",
    "summoning demons",
    "worshipping forbidden gods",
  ],
  militia: [
    "protecting trade routes",
    "defending the realm",
    "hunting monsters",
  ],
  syndicate: [
    "controlling smuggling operations",
    "running protection rackets",
    "gathering secrets",
  ],
  guild: [
    "monopolizing trade",
    "advancing arcane research",
    "training warriors",
  ],
  tribe: [
    "claiming ancestral lands",
    "raiding settlements",
    "preserving ancient ways",
  ],
};

const LEADER_ARCHETYPES: Record<FactionArchetype, CreatureArchetype[]> = {
  criminal: ["bandit", "thief", "assassin"],
  religious: ["priest", "cultist"],
  political: ["noble", "knight"],
  mercantile: ["merchant", "noble"],
  military: ["knight", "guard"],
  arcane: ["witch", "scholar"],
  tribal: ["commoner", "bandit"],
  monstrous: ["bandit", "cultist"],
  secret: ["assassin", "cultist", "scholar"],
};

const MEMBER_ARCHETYPES: Record<FactionArchetype, CreatureArchetype[]> = {
  criminal: ["bandit", "thief", "commoner"],
  religious: ["priest", "commoner", "cultist"],
  political: ["guard", "noble", "commoner"],
  mercantile: ["merchant", "commoner", "guard"],
  military: ["guard", "knight", "commoner"],
  arcane: ["scholar", "witch", "commoner"],
  tribal: ["commoner", "bandit"],
  monstrous: ["bandit", "cultist"],
  secret: ["commoner", "thief", "cultist"],
};

const GOALS: Record<FactionArchetype, string[]> = {
  criminal: [
    "Control the black market",
    "Eliminate rival gangs",
    "Corrupt local officials",
    "Expand smuggling operations",
  ],
  religious: [
    "Convert the unfaithful",
    "Build a grand temple",
    "Destroy heretical texts",
    "Summon divine favor",
  ],
  political: [
    "Claim the throne",
    "Forge powerful alliances",
    "Discredit rivals",
    "Expand territorial control",
  ],
  mercantile: [
    "Monopolize trade routes",
    "Acquire rare goods",
    "Eliminate competition",
    "Fund expansion",
  ],
  military: [
    "Defend the realm",
    "Conquer new territory",
    "Train elite soldiers",
    "Fortify defenses",
  ],
  arcane: [
    "Uncover ancient secrets",
    "Master forbidden magic",
    "Create powerful artifacts",
    "Open a portal",
  ],
  tribal: [
    "Reclaim ancestral lands",
    "Preserve old ways",
    "Prove strength in battle",
    "Unite the clans",
  ],
  monstrous: [
    "Spread terror",
    "Devour the weak",
    "Corrupt the land",
    "Summon the dark one",
  ],
  secret: [
    "Infiltrate positions of power",
    "Gather forbidden knowledge",
    "Manipulate events from shadows",
    "Achieve the grand design",
  ],
};

const METHODS: Record<FactionArchetype, string[]> = {
  criminal: ["Bribery", "Intimidation", "Theft", "Smuggling", "Assassination"],
  religious: ["Preaching", "Charity", "Persecution", "Miracles", "Crusades"],
  political: ["Diplomacy", "Marriage", "Intrigue", "Patronage", "Legislation"],
  mercantile: ["Trade deals", "Price fixing", "Loans", "Sabotage", "Monopolies"],
  military: ["Warfare", "Training", "Fortification", "Patrols", "Conquest"],
  arcane: ["Research", "Rituals", "Enchantment", "Divination", "Summoning"],
  tribal: ["Raids", "Rituals", "Hunting", "Challenges", "Migrations"],
  monstrous: ["Terror", "Corruption", "Hunting", "Breeding", "Destruction"],
  secret: ["Infiltration", "Blackmail", "Manipulation", "Misdirection", "Silence"],
};

const SYMBOLS = [
  "A black hand",
  "A golden sun",
  "A silver moon",
  "A red eye",
  "A coiled serpent",
  "A crowned skull",
  "A broken chain",
  "A flaming sword",
  "A raven in flight",
  "An iron fist",
];

export interface FactionGeneratorOptions {
  seed: string;
  count?: number;
  hexes?: Hex[]; // for lair placement
}

/**
 * Generate factions for the world.
 */
export function generateFactions(options: FactionGeneratorOptions): Faction[] {
  const { seed, count = 2, hexes = [] } = options;
  const rng = new SeededRandom(`${seed}-factions`);
  const factions: Faction[] = [];

  // Filter hexes suitable for lairs
  const lairHexes = hexes.filter(
    (h) => h.terrain === "hills" || h.terrain === "forest" || h.terrain === "mountains"
  );

  for (let i = 0; i < count; i++) {
    const faction = generateFaction(rng, `faction-${i}`, lairHexes);
    factions.push(faction);
  }

  // Generate relationships between factions
  if (factions.length >= 2) {
    const relationship = generateRelationship(rng);
    factions[0].relationships.push({
      factionId: factions[1].id,
      type: relationship,
      reason: getRelationshipReason(rng, relationship),
    });
    factions[1].relationships.push({
      factionId: factions[0].id,
      type: relationship,
      reason: getRelationshipReason(rng, relationship),
    });
  }

  return factions;
}

function generateFaction(rng: SeededRandom, idSuffix: string, lairHexes: Hex[]): Faction {
  const archetype = rng.pickWeighted(ARCHETYPE_WEIGHTS);
  const factionType = rng.pickWeighted(FACTION_TYPE_WEIGHTS);
  const name = generateFactionName(rng, archetype);
  const purpose = rng.pick(PURPOSE_BY_TYPE[factionType]);

  // 40% chance of lair
  let lair: FactionLair | undefined;
  if (lairHexes.length > 0 && rng.chance(0.4)) {
    const lairHex = rng.pick(lairHexes);
    lair = { hexCoord: { q: lairHex.coord.q, r: lairHex.coord.r } };
  }

  return {
    id: `faction-${nanoid(8)}`,
    name,
    description: `A ${archetype} organization known as ${name}.`,
    archetype,
    factionType,
    purpose,
    lair,
    scale: rng.pick(["local", "local", "regional"] as FactionScale[]),
    goals: [
      {
        description: rng.pick(GOALS[archetype]),
        progress: 0,
      },
    ],
    methods: rng.sample(METHODS[archetype], rng.between(2, 3)),
    resources: [],
    relationships: [],
    territoryIds: [],
    influenceIds: [],
    leaderArchetype: rng.pick(LEADER_ARCHETYPES[archetype]),
    memberArchetype: rng.pick(MEMBER_ARCHETYPES[archetype]),
    symbols: [rng.pick(SYMBOLS)],
    rumors: [],
    status: "active",
  };
}

function generateFactionName(rng: SeededRandom, archetype: FactionArchetype): string {
  const prefix = rng.pick(FACTION_PREFIXES);
  const noun = rng.pick(FACTION_NOUNS[archetype]);
  return `${prefix} ${noun}`;
}

function generateRelationship(rng: SeededRandom): RelationshipType {
  const weights = createWeightedTable<RelationshipType>({
    allied: 5,
    friendly: 10,
    neutral: 20,
    rival: 35,
    hostile: 25,
    war: 5,
  });
  return rng.pickWeighted(weights);
}

function getRelationshipReason(rng: SeededRandom, type: RelationshipType): string {
  const reasons: Record<RelationshipType, string[]> = {
    allied: ["Shared enemies", "Common goals", "Historic pact", "Mutual benefit"],
    friendly: ["Trade relations", "Shared values", "Past cooperation", "Family ties"],
    neutral: ["No significant contact", "Careful distance", "Recent truce", "Indifference"],
    rival: ["Competing interests", "Old grudge", "Territory dispute", "Ideological clash"],
    hostile: ["Betrayal", "Murder", "Theft", "Religious conflict", "Resource war"],
    war: ["Open conflict", "Vengeance", "Existential threat", "Total opposition"],
  };
  return rng.pick(reasons[type]);
}
