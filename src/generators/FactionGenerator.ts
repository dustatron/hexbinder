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
  FactionAdvantage,
  AdvantageType,
  AgendaGoal,
  FactionObstacle,
  ObstacleType,
  SignificantItem,
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

// === Cairn-Inspired Advantage Tables ===

const ADVANTAGE_TYPES_BY_ARCHETYPE: Record<FactionArchetype, AdvantageType[]> = {
  criminal: ["wealth", "knowledge", "territory", "influence"],
  religious: ["influence", "alliance", "magic", "territory"],
  political: ["influence", "wealth", "alliance", "military"],
  mercantile: ["wealth", "knowledge", "influence", "territory"],
  military: ["military", "territory", "alliance", "wealth"],
  arcane: ["magic", "knowledge", "artifact", "alliance"],
  tribal: ["territory", "military", "alliance", "knowledge"],
  monstrous: ["military", "territory", "magic", "alliance"],
  secret: ["knowledge", "influence", "wealth", "magic"],
};

const ADVANTAGE_NAMES: Record<AdvantageType, string[]> = {
  wealth: [
    "Hidden treasury",
    "Trade monopoly",
    "Wealthy patron",
    "Smuggling network",
    "Tax collection rights",
  ],
  military: [
    "Elite guard unit",
    "Mercenary contract",
    "Fortress stronghold",
    "Weapons cache",
    "Battle-hardened veterans",
  ],
  influence: [
    "Noble ally",
    "Blackmail material",
    "Royal charter",
    "Popular support",
    "Temple endorsement",
  ],
  knowledge: [
    "Spy network",
    "Ancient archives",
    "Informants in every town",
    "Stolen secrets",
    "Oracle's favor",
  ],
  magic: [
    "Bound elemental",
    "Enchanted ward",
    "Ritual circle",
    "Captive spellcaster",
    "Ley line nexus",
  ],
  territory: [
    "Hidden stronghold",
    "Strategic chokepoint",
    "Defensible position",
    "Underground tunnels",
    "Coastal hideout",
  ],
  alliance: [
    "Monster tribe pact",
    "Mercenary company",
    "Foreign power backing",
    "Church alliance",
    "Noble house bond",
  ],
  artifact: [
    "Ancient relic",
    "Legendary weapon",
    "Crown of authority",
    "Tome of secrets",
    "Seal of power",
  ],
};

// === Cairn-Inspired Obstacle Tables ===

const OBSTACLE_TYPES_BY_ARCHETYPE: Record<FactionArchetype, ObstacleType[]> = {
  criminal: ["rival_faction", "powerful_enemy", "lack_of_resources"],
  religious: ["rival_faction", "divine_opposition", "missing_item"],
  political: ["rival_faction", "internal_conflict", "powerful_enemy"],
  mercantile: ["rival_faction", "lack_of_resources", "geographic"],
  military: ["powerful_enemy", "lack_of_resources", "geographic"],
  arcane: ["missing_item", "missing_knowledge", "divine_opposition"],
  tribal: ["powerful_enemy", "geographic", "lack_of_resources"],
  monstrous: ["powerful_enemy", "rival_faction", "geographic"],
  secret: ["missing_knowledge", "internal_conflict", "powerful_enemy"],
};

const OBSTACLE_DESCRIPTIONS: Record<ObstacleType, string[]> = {
  rival_faction: [
    "A rival faction blocks their every move",
    "An opposing group has sworn to destroy them",
    "Competition for the same goal creates conflict",
  ],
  missing_item: [
    "They need an artifact they don't possess",
    "A key component is held by another",
    "The tool they need is lost to time",
  ],
  missing_knowledge: [
    "They don't know the location of their goal",
    "Ancient secrets must be uncovered first",
    "A ritual's final component remains unknown",
  ],
  lack_of_resources: [
    "They need more gold, troops, or supplies",
    "Their coffers run low at a critical moment",
    "Resources are stretched too thin",
  ],
  powerful_enemy: [
    "A mighty foe stands in their way",
    "An ancient creature guards what they seek",
    "A legendary hero opposes them",
  ],
  internal_conflict: [
    "Leadership is contested from within",
    "A faction member works against them",
    "Ideological splits threaten unity",
  ],
  divine_opposition: [
    "The gods themselves seem to work against them",
    "Divine wards block their progress",
    "Prophecy foretells their failure",
  ],
  geographic: [
    "Mountains, seas, or deserts block their path",
    "The location is nearly inaccessible",
    "Natural barriers protect their goal",
  ],
};

// === Cairn-Inspired Agenda Templates ===
// Progressive goals that build toward an objective

interface AgendaTemplate {
  objective: string;
  goals: string[]; // 3-5 progressive goals
}

const AGENDA_TEMPLATES_BY_ARCHETYPE: Record<FactionArchetype, AgendaTemplate[]> = {
  criminal: [
    {
      objective: "Control the underworld",
      goals: [
        "Eliminate the current crime boss",
        "Unite the street gangs under one banner",
        "Corrupt the city guard",
        "Establish monopoly on smuggling",
        "Install a puppet ruler",
      ],
    },
    {
      objective: "Pull off the heist of the century",
      goals: [
        "Gather intelligence on the target",
        "Recruit specialists for the job",
        "Neutralize security measures",
        "Execute the heist",
      ],
    },
  ],
  religious: [
    {
      objective: "Bring about the prophecy",
      goals: [
        "Recover the sacred relics",
        "Convert the unbelievers",
        "Purify the holy site",
        "Perform the grand ritual",
      ],
    },
    {
      objective: "Destroy the heretics",
      goals: [
        "Identify the heretic leaders",
        "Cut off their support",
        "Expose their blasphemy",
        "Execute divine judgment",
        "Consecrate their former stronghold",
      ],
    },
  ],
  political: [
    {
      objective: "Seize the throne",
      goals: [
        "Discredit the current ruler",
        "Win key noble houses to our cause",
        "Secure military support",
        "Stage the coup",
        "Eliminate remaining loyalists",
      ],
    },
    {
      objective: "Forge an empire",
      goals: [
        "Annex the border territories",
        "Subjugate the neighboring realm",
        "Establish puppet governments",
        "Crush all resistance",
      ],
    },
  ],
  mercantile: [
    {
      objective: "Achieve trade monopoly",
      goals: [
        "Eliminate the competition",
        "Secure exclusive contracts",
        "Control the trade routes",
        "Install guild leadership",
      ],
    },
    {
      objective: "Acquire legendary wealth",
      goals: [
        "Find the lost treasure map",
        "Mount the expedition",
        "Overcome the guardians",
        "Secure the treasure",
        "Silence any witnesses",
      ],
    },
  ],
  military: [
    {
      objective: "Conquer the realm",
      goals: [
        "Secure the border fortresses",
        "Defeat the enemy's main army",
        "Capture the capital",
        "Hunt down the remaining resistance",
      ],
    },
    {
      objective: "Defend against the invasion",
      goals: [
        "Rally the defenders",
        "Fortify key positions",
        "Strike at enemy supply lines",
        "Break the siege",
        "Pursue and destroy the invaders",
      ],
    },
  ],
  arcane: [
    {
      objective: "Unlock ultimate power",
      goals: [
        "Gather the components",
        "Decipher the ancient texts",
        "Prepare the ritual site",
        "Channel the raw energy",
      ],
    },
    {
      objective: "Open the portal",
      goals: [
        "Locate the nexus point",
        "Acquire the key artifact",
        "Neutralize the wards",
        "Perform the binding ritual",
        "Stabilize the gateway",
      ],
    },
  ],
  tribal: [
    {
      objective: "Reclaim ancestral lands",
      goals: [
        "Unite the scattered clans",
        "Drive out the settlers",
        "Restore the sacred sites",
        "Establish the new homeland",
      ],
    },
    {
      objective: "Prove dominance",
      goals: [
        "Challenge the rival chieftains",
        "Win the great hunt",
        "Claim the trophy of power",
        "Force submission from all clans",
      ],
    },
  ],
  monstrous: [
    {
      objective: "Awaken the ancient one",
      goals: [
        "Gather the sacrifices",
        "Corrupt the sacred places",
        "Break the binding seals",
        "Perform the summoning",
      ],
    },
    {
      objective: "Spread corruption",
      goals: [
        "Establish breeding grounds",
        "Poison the water sources",
        "Overwhelm isolated settlements",
        "March on the cities",
      ],
    },
  ],
  secret: [
    {
      objective: "Achieve the grand design",
      goals: [
        "Place agents in positions of power",
        "Manipulate events from the shadows",
        "Acquire the final piece",
        "Execute the master plan",
      ],
    },
    {
      objective: "Control everything",
      goals: [
        "Infiltrate every major faction",
        "Eliminate those who suspect",
        "Orchestrate the crisis",
        "Emerge as the solution",
        "Assume total control",
      ],
    },
  ],
};

export interface FactionGeneratorOptions {
  seed: string;
  count?: number;
  hexes?: Hex[]; // for lair placement
  settlements?: Array<{ id: string; name: string }>; // for HQ assignment
  significantItems?: SignificantItem[]; // for item-driven agendas
  existingFactions?: Faction[]; // for creating obstacles that reference other factions
}

/**
 * Generate factions for the world.
 */
export function generateFactions(options: FactionGeneratorOptions): Faction[] {
  const { seed, count = 2, hexes = [], settlements = [], significantItems = [] } = options;
  const rng = new SeededRandom(`${seed}-factions`);
  const factions: Faction[] = [];

  // Filter hexes suitable for lairs
  const lairHexes = hexes.filter(
    (h) => h.terrain === "hills" || h.terrain === "forest" || h.terrain === "mountains"
  );

  // Track which items have been claimed
  const claimedItemIds = new Set<string>();
  const desiredItemIds = new Map<string, string[]>(); // itemId -> factionIds

  // Track which settlements are claimed as HQs
  const claimedSettlementIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    const faction = generateFaction(
      rng,
      `faction-${i}`,
      lairHexes,
      settlements,
      claimedSettlementIds,
      significantItems,
      claimedItemIds,
      desiredItemIds,
      factions
    );
    factions.push(faction);
  }

  // Generate relationships between factions
  generateFactionRelationships(rng, factions, desiredItemIds);

  return factions;
}

/**
 * Generate relationships between factions.
 * Factions that desire the same item are automatically rivals/hostile.
 */
function generateFactionRelationships(
  rng: SeededRandom,
  factions: Faction[],
  desiredItemIds: Map<string, string[]>
): void {
  // Create relationships based on shared item desires
  for (const [itemId, factionIds] of desiredItemIds.entries()) {
    if (factionIds.length >= 2) {
      // Factions competing for the same item are rivals or hostile
      for (let i = 0; i < factionIds.length; i++) {
        for (let j = i + 1; j < factionIds.length; j++) {
          const faction1 = factions.find((f) => f.id === factionIds[i]);
          const faction2 = factions.find((f) => f.id === factionIds[j]);
          if (faction1 && faction2) {
            const relationship: RelationshipType = rng.pick(["rival", "hostile", "hostile"]);
            const reason = "Both seek the same artifact";

            // Add if not already related
            if (!faction1.relationships.some((r) => r.factionId === faction2.id)) {
              faction1.relationships.push({ factionId: faction2.id, type: relationship, reason });
              faction2.relationships.push({ factionId: faction1.id, type: relationship, reason });
            }
          }
        }
      }
    }
  }

  // Fill in remaining relationships randomly
  for (let i = 0; i < factions.length; i++) {
    for (let j = i + 1; j < factions.length; j++) {
      const faction1 = factions[i];
      const faction2 = factions[j];

      // Skip if already related
      if (faction1.relationships.some((r) => r.factionId === faction2.id)) {
        continue;
      }

      const relationship = generateRelationship(rng);
      faction1.relationships.push({
        factionId: faction2.id,
        type: relationship,
        reason: getRelationshipReason(rng, relationship),
      });
      faction2.relationships.push({
        factionId: faction1.id,
        type: relationship,
        reason: getRelationshipReason(rng, relationship),
      });
    }
  }
}

// Chance of wilderness lair vs settlement HQ by faction type
const LAIR_CHANCE_BY_TYPE: Record<FactionType, number> = {
  cult: 0.7,      // Cults prefer hidden wilderness lairs
  tribe: 0.8,     // Tribes are wilderness-based
  militia: 0.3,   // Militias usually in settlements
  guild: 0.1,     // Guilds are urban
  syndicate: 0.3, // Syndicates operate from cities but may have hideouts
};

function generateFaction(
  rng: SeededRandom,
  idSuffix: string,
  lairHexes: Hex[],
  settlements: Array<{ id: string; name: string }>,
  claimedSettlementIds: Set<string>,
  significantItems: SignificantItem[],
  claimedItemIds: Set<string>,
  desiredItemIds: Map<string, string[]>,
  existingFactions: Faction[]
): Faction {
  const archetype = rng.pickWeighted(ARCHETYPE_WEIGHTS);
  const factionType = rng.pickWeighted(FACTION_TYPE_WEIGHTS);
  const name = generateFactionName(rng, archetype);
  const purpose = rng.pick(PURPOSE_BY_TYPE[factionType]);
  const factionId = `faction-${nanoid(8)}`;

  // Determine base type: wilderness lair OR settlement HQ
  // Every faction gets one or the other
  let lair: FactionLair | undefined;
  let headquartersId: string | undefined;
  let territoryIds: string[] = [];

  const lairChance = LAIR_CHANCE_BY_TYPE[factionType];
  const wantsLair = rng.chance(lairChance);
  const availableSettlements = settlements.filter((s) => !claimedSettlementIds.has(s.id));

  if (wantsLair && lairHexes.length > 0) {
    // Wilderness lair
    const lairHex = rng.pick(lairHexes);
    lair = { hexCoord: { q: lairHex.coord.q, r: lairHex.coord.r } };
  } else if (availableSettlements.length > 0) {
    // Settlement HQ - claim a settlement
    const hqSettlement = rng.pick(availableSettlements);
    headquartersId = hqSettlement.id;
    territoryIds = [hqSettlement.id];
    claimedSettlementIds.add(hqSettlement.id);
  } else if (lairHexes.length > 0) {
    // Fallback to lair if no settlements available
    const lairHex = rng.pick(lairHexes);
    lair = { hexCoord: { q: lairHex.coord.q, r: lairHex.coord.r } };
  }
  // If neither available, faction has no physical base (rare edge case)

  // Generate Cairn-inspired advantages (2-3)
  const advantages = generateAdvantages(
    rng,
    archetype,
    significantItems,
    claimedItemIds,
    factionId
  );

  // Generate Cairn-inspired obstacle
  const obstacle = generateObstacle(rng, archetype, existingFactions, significantItems);

  // Generate Cairn-inspired agenda (3-5 progressive goals)
  const agenda = generateAgenda(
    rng,
    archetype,
    significantItems,
    claimedItemIds,
    desiredItemIds,
    factionId,
    obstacle
  );

  return {
    id: factionId,
    name,
    description: `A ${archetype} organization known as ${name}.`,
    archetype,
    factionType,
    purpose,
    lair,
    scale: rng.pick(["local", "local", "regional"] as FactionScale[]),

    // Cairn-inspired fields
    advantages,
    agenda,
    obstacle,
    seneschalId: undefined, // Will be assigned when NPCs are generated

    // Legacy fields
    goals: [
      {
        description: agenda[0]?.description ?? rng.pick(GOALS[archetype]),
        progress: 0,
      },
    ],
    methods: rng.sample(METHODS[archetype], rng.between(2, 3)),
    resources: advantages.map((a) => a.name), // Populate legacy field

    relationships: [],
    headquartersId,
    territoryIds,
    influenceIds: [],
    recruitmentHookIds: [],
    goalRumorIds: [],
    leaderArchetype: rng.pick(LEADER_ARCHETYPES[archetype]),
    memberArchetype: rng.pick(MEMBER_ARCHETYPES[archetype]),
    symbols: [rng.pick(SYMBOLS)],
    rumors: [],
    status: "active",
  };
}

/**
 * Generate 2-3 advantages for a faction.
 * May include possession of a significant item.
 */
function generateAdvantages(
  rng: SeededRandom,
  archetype: FactionArchetype,
  significantItems: SignificantItem[],
  claimedItemIds: Set<string>,
  factionId: string
): FactionAdvantage[] {
  const advantages: FactionAdvantage[] = [];
  const advantageCount = rng.between(2, 3);
  const usedTypes = new Set<AdvantageType>();

  // 30% chance to possess a significant item (if available and not claimed)
  const availableItems = significantItems.filter(
    (item) => !claimedItemIds.has(item.id) && item.status !== "possessed"
  );

  if (availableItems.length > 0 && rng.chance(0.3)) {
    const item = rng.pick(availableItems);
    claimedItemIds.add(item.id);

    // Update item to be possessed by this faction
    item.status = "possessed";
    item.currentHolderId = factionId;
    item.holderType = "faction";

    advantages.push({
      type: "artifact",
      name: item.name,
      description: `Possesses ${item.name}: ${item.effect}`,
      magicItemId: item.id,
    });
    usedTypes.add("artifact");
  }

  // Fill remaining slots with standard advantages
  const archetypeAdvantages = ADVANTAGE_TYPES_BY_ARCHETYPE[archetype];

  while (advantages.length < advantageCount) {
    const type = rng.pick(archetypeAdvantages.filter((t) => !usedTypes.has(t)));
    if (!type) break;

    usedTypes.add(type);
    const name = rng.pick(ADVANTAGE_NAMES[type]);

    advantages.push({
      type,
      name,
      description: `${name} provides ${type} advantage`,
    });
  }

  return advantages;
}

/**
 * Generate the faction's primary obstacle.
 */
function generateObstacle(
  rng: SeededRandom,
  archetype: FactionArchetype,
  existingFactions: Faction[],
  significantItems: SignificantItem[]
): FactionObstacle {
  const obstacleTypes = OBSTACLE_TYPES_BY_ARCHETYPE[archetype];
  const type = rng.pick(obstacleTypes);
  let description = rng.pick(OBSTACLE_DESCRIPTIONS[type]);
  let targetId: string | undefined;

  // If obstacle is rival_faction and we have existing factions, reference one
  if (type === "rival_faction" && existingFactions.length > 0) {
    const rival = rng.pick(existingFactions);
    targetId = rival.id;
    description = `${rival.name} blocks their every move`;
  }

  // If obstacle is missing_item and we have items, reference one
  if (type === "missing_item" && significantItems.length > 0) {
    const item = rng.pick(significantItems);
    targetId = item.id;
    description = `They need ${item.name} to complete their plans`;
  }

  return { type, description, targetId };
}

/**
 * Generate a progressive agenda (3-5 goals) for the faction.
 * May include goals to acquire significant items.
 */
function generateAgenda(
  rng: SeededRandom,
  archetype: FactionArchetype,
  significantItems: SignificantItem[],
  claimedItemIds: Set<string>,
  desiredItemIds: Map<string, string[]>,
  factionId: string,
  obstacle: FactionObstacle
): AgendaGoal[] {
  const templates = AGENDA_TEMPLATES_BY_ARCHETYPE[archetype];
  const template = rng.pick(templates);

  const agenda: AgendaGoal[] = [];
  const goalCount = Math.min(template.goals.length, rng.between(3, 5));

  // Determine if we should insert an item-acquisition goal
  const unclaimedItems = significantItems.filter(
    (item) => !claimedItemIds.has(item.id)
  );
  const insertItemGoal = unclaimedItems.length > 0 && rng.chance(0.6);
  const itemGoalPosition = insertItemGoal ? rng.between(1, goalCount - 1) : -1;
  let desiredItem: SignificantItem | undefined;

  if (insertItemGoal) {
    desiredItem = rng.pick(unclaimedItems);
    // Track this desire
    const existing = desiredItemIds.get(desiredItem.id) ?? [];
    existing.push(factionId);
    desiredItemIds.set(desiredItem.id, existing);

    // Update the item
    if (!desiredItem.desiredByFactionIds.includes(factionId)) {
      desiredItem.desiredByFactionIds.push(factionId);
    }
  }

  // Determine which goal addresses the obstacle
  const obstacleGoalPosition = rng.between(0, goalCount - 1);

  for (let i = 0; i < goalCount; i++) {
    const goalId = `goal-${nanoid(6)}`;

    // Check if this is the item acquisition goal
    if (i === itemGoalPosition && desiredItem) {
      agenda.push({
        id: goalId,
        order: i + 1,
        description: `Acquire ${desiredItem.name}`,
        status: i === 0 ? "in_progress" : "pending",
        targetType: "item",
        targetId: desiredItem.id,
        addressesObstacle: obstacle.type === "missing_item" && obstacle.targetId === desiredItem.id,
      });
    } else {
      // Use template goal
      const templateIndex = i >= itemGoalPosition && insertItemGoal ? i : i;
      const templateGoal = template.goals[templateIndex] ?? template.goals[template.goals.length - 1];

      agenda.push({
        id: goalId,
        order: i + 1,
        description: templateGoal,
        status: i === 0 ? "in_progress" : "pending",
        addressesObstacle: i === obstacleGoalPosition,
      });
    }
  }

  return agenda;
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
