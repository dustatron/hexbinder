import { nanoid } from "nanoid";
import type {
  Hook,
  HookType,
  NPC,
  NPCWant,
  Settlement,
  SpatialDungeon,
  Faction,
  Rumor,
  isSettlement,
  isDungeon,
} from "~/models";
import { SeededRandom } from "./SeededRandom";
import { getRelatives, getEnemies } from "./NPCRelationshipGenerator";

// === Hook Type Arrays for Random Selection ===

const NPC_HOOK_TYPES: HookType[] = [
  "delivery", "delivery", "delivery",
  "rescue", "rescue",
  "retrieval", "retrieval",
  "revenge", "revenge",
  "debt",
  "theft",
  "investigation",
];

const DUNGEON_HOOK_TYPES: HookType[] = [
  "retrieval", "retrieval", "retrieval",
  "rescue", "rescue", "rescue",
  "investigation", "investigation",
  "assassination",
];

const FACTION_HOOK_TYPES: HookType[] = [
  "faction_task", "faction_task", "faction_task", "faction_task",
  "theft", "theft",
  "assassination",
  "investigation",
  "escort",
];

// === Personal Stakes Templates ===

const STAKES_BY_TYPE: Record<HookType, string[]> = {
  delivery: [
    "a letter to my %relation%",
    "a family heirloom to my %relation%",
    "payment to my business partner",
    "medicine for my sick %relation%",
  ],
  assassination: [
    "the creature that killed my %relation%",
    "the beast terrorizing our village",
    "the monster in the %location%",
  ],
  theft: [
    "the deed my %relation% stole",
    "my inheritance that was taken",
    "the evidence against my enemy",
    "a family treasure stolen years ago",
  ],
  rescue: [
    "my %relation% who went missing",
    "my %relation% who was captured",
    "a villager taken by bandits",
  ],
  retrieval: [
    "an artifact for my collection",
    "proof of my family lineage",
    "a cure hidden in the depths",
    "treasure my %relation% lost",
  ],
  investigation: [
    "what happened to my %relation%",
    "who murdered the merchant",
    "the source of the corruption",
  ],
  escort: [
    "safe passage for my %relation%",
    "protection for the caravan",
  ],
  faction_task: [
    "proving myself to the %faction%",
    "earning membership",
    "a task for the guild",
  ],
  mystery: [
    "stopping whatever is killing our livestock",
    "discovering what stalks the night",
    "ending the curse on our village",
  ],
  revenge: [
    "payback against my %relation%",
    "justice for my family",
    "settling an old score",
  ],
  debt: [
    "money owed by my %relation%",
    "payment long overdue",
    "what the merchant owes me",
  ],
};

const RELATION_WORDS = ["brother", "sister", "father", "mother", "son", "daughter", "spouse", "cousin"];

export interface HookWeaverOptions {
  seed: string;
  npcs: NPC[];
  settlements: Settlement[];
  dungeons: SpatialDungeon[];
  factions: Faction[];
}

export interface HookWeaverResult {
  hooks: Hook[];
  npcs: NPC[]; // NPCs with wants populated
  rumors: Rumor[]; // Additional rumors linked to hooks
}

/**
 * Generate interconnected hooks between NPCs, locations, and factions.
 * Updates NPCs with wants that reference hooks.
 */
export function weaveHooks(options: HookWeaverOptions): HookWeaverResult {
  const { seed, npcs, settlements, dungeons, factions } = options;
  const rng = new SeededRandom(`${seed}-hookweaver`);

  const hooks: Hook[] = [];
  const rumors: Rumor[] = [];
  const updatedNPCs = npcs.map((npc) => ({ ...npc, wants: [...npc.wants] }));
  const npcMap = new Map(updatedNPCs.map((n) => [n.id, n]));

  // Phase 1: Generate rescue hooks from NPCs with family (dungeon targets)
  if (dungeons.length > 0) {
    const rescueHooks = generateRescueHooks(rng, updatedNPCs, dungeons, npcMap);
    hooks.push(...rescueHooks);
  }

  // Phase 2: Generate delivery hooks (cross-settlement)
  if (settlements.length > 1) {
    const deliveryHooks = generateDeliveryHooks(rng, updatedNPCs, settlements, npcMap);
    hooks.push(...deliveryHooks);
  }

  // Phase 3: Generate revenge/rivalry hooks
  const revengeHooks = generateRevengeHooks(rng, updatedNPCs, npcMap);
  hooks.push(...revengeHooks);

  // Phase 4: Generate retrieval hooks (dungeon treasures)
  if (dungeons.length > 0) {
    const retrievalHooks = generateRetrievalHooks(rng, updatedNPCs, dungeons, npcMap);
    hooks.push(...retrievalHooks);
  }

  // Phase 5: Generate faction recruitment hooks
  if (factions.length > 0) {
    const factionHooks = generateFactionHooks(rng, updatedNPCs, factions, dungeons, npcMap);
    hooks.push(...factionHooks);
  }

  // Phase 6: Generate mystery hooks
  const mysteryHooks = generateMysteryHooks(rng, updatedNPCs, settlements, dungeons, npcMap);
  hooks.push(...mysteryHooks);

  // Phase 7: Generate personal hooks for all NPCs without hooks yet
  const personalHooks = generatePersonalHooks(rng, updatedNPCs, dungeons, settlements, npcMap);
  hooks.push(...personalHooks);

  return { hooks, npcs: updatedNPCs, rumors };
}

// === Hook Generators ===

function generateRescueHooks(
  rng: SeededRandom,
  npcs: NPC[],
  dungeons: SpatialDungeon[],
  npcMap: Map<string, NPC>
): Hook[] {
  const hooks: Hook[] = [];

  // Find NPCs with children or siblings (potential rescue targets)
  const npcsWithFamily = npcs.filter((n) => {
    const relatives = getRelatives(n);
    return relatives.some((r) => r.type === "child" || r.type === "sibling");
  });

  // 20% of dungeons should have a rescue hook
  const rescueCount = Math.max(1, Math.floor(dungeons.length * 0.2));

  for (let i = 0; i < rescueCount; i++) {
    if (npcsWithFamily.length === 0 || dungeons.length === 0) break;

    const sourceNpc = rng.pick(npcsWithFamily);
    const relatives = getRelatives(sourceNpc);
    const rescueTarget = relatives.find(
      (r) => r.type === "child" || r.type === "sibling"
    );
    if (!rescueTarget) continue;

    const targetNpc = npcMap.get(rescueTarget.targetNpcId);
    if (!targetNpc || targetNpc.status !== "alive") continue;

    const dungeon = rng.pick(dungeons);
    const relationType = rescueTarget.type === "child"
      ? (rng.chance(0.5) ? "son" : "daughter")
      : (rng.chance(0.5) ? "brother" : "sister");

    const hook = createHook(rng, {
      type: "rescue",
      sourceNpcId: sourceNpc.id,
      targetLocationId: dungeon.id,
      missingNpcId: targetNpc.id,
      rumor: `${sourceNpc.name}'s ${relationType} went to ${dungeon.name} and hasn't returned`,
      truth: `${targetNpc.name} is trapped in ${dungeon.name}, held by its denizens`,
      reward: rng.pick(["Gold reward", "Family heirloom", "Valuable information"]),
    });

    hooks.push(hook);

    // Update source NPC wants
    addWantToNpc(npcMap, sourceNpc.id, hook.id, `find my ${relationType}`);

    // Mark target NPC as captured
    targetNpc.status = "captured";
    targetNpc.locationId = dungeon.id;

    // Remove from pool
    const idx = npcsWithFamily.indexOf(sourceNpc);
    if (idx > -1) npcsWithFamily.splice(idx, 1);
  }

  return hooks;
}

function generateDeliveryHooks(
  rng: SeededRandom,
  npcs: NPC[],
  settlements: Settlement[],
  npcMap: Map<string, NPC>
): Hook[] {
  const hooks: Hook[] = [];

  // Find NPCs with cross-settlement relatives
  const npcsWithDistantRelatives = npcs.filter((n) => {
    const relatives = getRelatives(n);
    return relatives.some((r) => {
      const relative = npcMap.get(r.targetNpcId);
      return relative && relative.locationId !== n.locationId;
    });
  });

  const deliveryCount = Math.min(rng.between(2, 4), npcsWithDistantRelatives.length);

  for (let i = 0; i < deliveryCount; i++) {
    if (npcsWithDistantRelatives.length === 0) break;

    const sourceNpc = rng.pick(npcsWithDistantRelatives);
    const relatives = getRelatives(sourceNpc).filter((r) => {
      const rel = npcMap.get(r.targetNpcId);
      return rel && rel.locationId !== sourceNpc.locationId;
    });

    if (relatives.length === 0) continue;

    const targetRel = rng.pick(relatives);
    const targetNpc = npcMap.get(targetRel.targetNpcId);
    if (!targetNpc) continue;

    const targetSettlement = settlements.find((s) => s.id === targetNpc.locationId);
    const item = rng.pick(["sealed letter", "family heirloom", "medicine", "payment"]);

    const hook = createHook(rng, {
      type: "delivery",
      sourceNpcId: sourceNpc.id,
      targetNpcId: targetNpc.id,
      targetLocationId: targetSettlement?.id,
      rumor: `${sourceNpc.name} needs someone to deliver a ${item} to ${targetSettlement?.name ?? "another town"}`,
      truth: `A ${item} must reach ${targetNpc.name} in ${targetSettlement?.name ?? "another settlement"}`,
      reward: rng.pick(["5-10 gold", "A favor owed", "Information"]),
    });

    hooks.push(hook);
    addWantToNpc(npcMap, sourceNpc.id, hook.id, `deliver ${item} to my ${targetRel.type}`);

    const idx = npcsWithDistantRelatives.indexOf(sourceNpc);
    if (idx > -1) npcsWithDistantRelatives.splice(idx, 1);
  }

  return hooks;
}

function generateRevengeHooks(
  rng: SeededRandom,
  npcs: NPC[],
  npcMap: Map<string, NPC>
): Hook[] {
  const hooks: Hook[] = [];

  // Find NPCs with enemies/rivals
  const npcsWithEnemies = npcs.filter((n) => getEnemies(n).length > 0);
  const revengeCount = Math.min(rng.between(1, 3), npcsWithEnemies.length);

  for (let i = 0; i < revengeCount; i++) {
    if (npcsWithEnemies.length === 0) break;

    const sourceNpc = rng.pick(npcsWithEnemies);
    const enemies = getEnemies(sourceNpc);
    const enemy = rng.pick(enemies);
    const targetNpc = npcMap.get(enemy.targetNpcId);
    if (!targetNpc) continue;

    const hookType = rng.pick(["revenge", "theft", "debt"] as HookType[]);
    let rumor: string;
    let truth: string;
    let stakes: string;

    if (hookType === "theft") {
      rumor = `${sourceNpc.name} claims ${targetNpc.name} stole something valuable`;
      truth = `${targetNpc.name} has an item ${sourceNpc.name} believes is rightfully theirs`;
      stakes = "stolen inheritance";
    } else if (hookType === "debt") {
      rumor = `${sourceNpc.name} is owed money by ${targetNpc.name}`;
      truth = `An old debt between ${sourceNpc.name} and ${targetNpc.name}`;
      stakes = "money long owed";
    } else {
      rumor = `${sourceNpc.name} seeks payback against ${targetNpc.name}`;
      truth = `Bad blood between ${sourceNpc.name} and ${targetNpc.name}`;
      stakes = "settling an old score";
    }

    const hook = createHook(rng, {
      type: hookType,
      sourceNpcId: sourceNpc.id,
      targetNpcId: targetNpc.id,
      rumor,
      truth,
      reward: rng.pick(["Gold", "A favor", "Information", "An item"]),
    });

    hooks.push(hook);
    addWantToNpc(npcMap, sourceNpc.id, hook.id, stakes);

    const idx = npcsWithEnemies.indexOf(sourceNpc);
    if (idx > -1) npcsWithEnemies.splice(idx, 1);
  }

  return hooks;
}

function generateRetrievalHooks(
  rng: SeededRandom,
  npcs: NPC[],
  dungeons: SpatialDungeon[],
  npcMap: Map<string, NPC>
): Hook[] {
  const hooks: Hook[] = [];

  // 30% of dungeons get a retrieval hook
  const retrievalCount = Math.max(1, Math.floor(dungeons.length * 0.3));
  const eligibleNPCs = npcs.filter(
    (n) => n.role && ["merchant", "sage", "noble", "priest"].includes(n.role)
  );

  for (let i = 0; i < retrievalCount; i++) {
    if (eligibleNPCs.length === 0 || dungeons.length === 0) break;

    const sourceNpc = rng.pick(eligibleNPCs);
    const dungeon = dungeons[i % dungeons.length];
    const item = rng.pick([
      "ancient artifact",
      "family heirloom",
      "sacred relic",
      "valuable gemstone",
      "lost tome",
    ]);

    const hook = createHook(rng, {
      type: "retrieval",
      sourceNpcId: sourceNpc.id,
      targetLocationId: dungeon.id,
      targetItemId: `item-${nanoid(6)}`,
      rumor: `${sourceNpc.name} seeks a ${item} lost in ${dungeon.name}`,
      truth: `A ${item} lies somewhere in ${dungeon.name}`,
      reward: rng.pick(["50 gold", "100 gold", "A magic item"]),
    });

    hooks.push(hook);
    addWantToNpc(npcMap, sourceNpc.id, hook.id, `the ${item} in ${dungeon.name}`);

    const idx = eligibleNPCs.indexOf(sourceNpc);
    if (idx > -1) eligibleNPCs.splice(idx, 1);
  }

  return hooks;
}

function generateFactionHooks(
  rng: SeededRandom,
  npcs: NPC[],
  factions: Faction[],
  dungeons: SpatialDungeon[],
  npcMap: Map<string, NPC>
): Hook[] {
  const hooks: Hook[] = [];

  for (const faction of factions) {
    // Find NPCs who might want to join (no faction, ambitious)
    const aspirants = npcs.filter(
      (n) => !n.factionId && n.role && ["merchant", "guard_captain", "criminal"].includes(n.role)
    );

    if (aspirants.length === 0) continue;

    const aspirant = rng.pick(aspirants);
    const task = rng.pick([
      "retrieve a token from a dangerous place",
      "deliver a message to a contact",
      "acquire information about rivals",
    ]);

    const targetLocation = dungeons.length > 0 ? rng.pick(dungeons) : undefined;

    const hook = createHook(rng, {
      type: "faction_task",
      sourceNpcId: aspirant.id,
      sourceFactionId: faction.id,
      targetLocationId: targetLocation?.id,
      rumor: `${aspirant.name} wants to join ${faction.name} but needs help with a task`,
      truth: `${faction.name} has set a trial: ${task}`,
      reward: "Faction membership opportunity",
    });

    hooks.push(hook);
    faction.recruitmentHookIds.push(hook.id);

    // Set aspiration on NPC
    aspirant.factionAspiration = { factionId: faction.id, task };
    addWantToNpc(npcMap, aspirant.id, hook.id, `joining ${faction.name}`);
  }

  return hooks;
}

function generateMysteryHooks(
  rng: SeededRandom,
  npcs: NPC[],
  settlements: Settlement[],
  dungeons: SpatialDungeon[],
  npcMap: Map<string, NPC>
): Hook[] {
  const hooks: Hook[] = [];

  // 1 mystery hook per 2 settlements
  const mysteryCount = Math.max(1, Math.floor(settlements.length / 2));

  const mysteries = [
    { rumor: "Livestock found dead with strange wounds", truth: "A creature from the nearby lair hunts at night" },
    { rumor: "Travelers have gone missing on the road", truth: "Bandits or creatures waylay travelers" },
    { rumor: "Strange lights seen in the hills", truth: "Cultists perform rituals in secret" },
    { rumor: "Children report seeing monsters", truth: "A creature has moved into the area" },
    { rumor: "The well water has turned foul", truth: "Something corrupts the water source" },
  ];

  for (let i = 0; i < mysteryCount; i++) {
    const settlement = settlements[i % settlements.length];
    const localNPCs = npcs.filter((n) => n.locationId === settlement.id);
    if (localNPCs.length === 0) continue;

    const sourceNpc = rng.pick(localNPCs);
    const mystery = rng.pick(mysteries);
    const nearbyDungeon = dungeons.find((d) => d.size === "lair");

    const hook = createHook(rng, {
      type: "mystery",
      sourceNpcId: sourceNpc.id,
      sourceSettlementId: settlement.id,
      targetLocationId: nearbyDungeon?.id,
      rumor: mystery.rumor,
      truth: mystery.truth,
      reward: rng.pick(["Gratitude of the village", "Small gold reward", "Free lodging"]),
    });

    hooks.push(hook);
    addWantToNpc(npcMap, sourceNpc.id, hook.id, "solving the mystery");
  }

  return hooks;
}

/**
 * Generate personal hooks for NPCs who don't have one yet.
 * Maps their flavorWant to an actionable hook.
 */
function generatePersonalHooks(
  rng: SeededRandom,
  npcs: NPC[],
  dungeons: SpatialDungeon[],
  settlements: Settlement[],
  npcMap: Map<string, NPC>
): Hook[] {
  const hooks: Hook[] = [];

  // Find NPCs without hooks
  const npcsWithoutHooks = npcs.filter((n) => n.wants.length === 0);

  // Hook templates with actionable quests
  const wantToHook: Array<{
    keywords: string[];
    type: HookType;
    makeRumor: (npc: NPC, target?: string) => string;
    makeTruth: (npc: NPC, target?: string) => string;
    makeStakes: (npc: NPC, target?: string) => string;
    reward: string[];
  }> = [
    {
      keywords: ["family", "better life", "children"],
      type: "delivery",
      makeRumor: (npc, target) => `${npc.name} needs a package delivered to ${target}`,
      makeTruth: (npc, target) => `Medicine must reach ${npc.name}'s relative in ${target}`,
      makeStakes: (_npc, target) => `deliver medicine to ${target} (pays 15gp)`,
      reward: ["15 gp", "20 gp", "Free lodging for a week"],
    },
    {
      keywords: ["justice", "wrong", "revenge", "payback"],
      type: "investigation",
      makeRumor: (npc) => `${npc.name} seeks information about a past wrong`,
      makeTruth: (npc) => `${npc.name} wants evidence to confront an old enemy`,
      makeStakes: () => `find evidence of wrongdoing (pays 25gp)`,
      reward: ["25 gp", "30 gp", "A favor owed"],
    },
    {
      keywords: ["gold", "retire", "wealth", "fortune", "treasure"],
      type: "retrieval",
      makeRumor: (npc, target) => `${npc.name} has heard of treasure in ${target}`,
      makeTruth: (npc, target) => `${npc.name} will pay for any valuables from ${target}`,
      makeStakes: (_npc, target) => `retrieve treasure from ${target} (shares profit)`,
      reward: ["Share of treasure", "50 gp finder's fee", "30 gp"],
    },
    {
      keywords: ["protect", "innocent", "criminal", "catch", "promotion"],
      type: "investigation",
      makeRumor: (npc) => `${npc.name} is tracking a criminal`,
      makeTruth: (npc) => `${npc.name} needs help catching a specific lawbreaker`,
      makeStakes: () => `help catch a criminal (pays 20gp)`,
      reward: ["20 gp", "Official commendation", "15 gp"],
    },
    {
      keywords: ["knowledge", "secret", "mystery", "lost", "artifact"],
      type: "retrieval",
      makeRumor: (npc, target) => `${npc.name} seeks something hidden in ${target}`,
      makeTruth: (npc, target) => `Ancient texts in ${target} hold what ${npc.name} seeks`,
      makeStakes: (_npc, target) => `retrieve a tome from ${target} (pays 40gp)`,
      reward: ["40 gp", "A minor magic item", "Valuable information"],
    },
    {
      keywords: ["faith", "spread", "temple", "divine", "pilgrimage"],
      type: "escort",
      makeRumor: (npc) => `${npc.name} needs escort to a sacred site`,
      makeTruth: (npc) => `${npc.name} must complete a dangerous pilgrimage`,
      makeStakes: () => `escort to holy site (blessing + 20gp)`,
      reward: ["Blessing + 20 gp", "30 gp", "Healing services"],
    },
    {
      keywords: ["power", "influence", "prove", "honor", "glory"],
      type: "retrieval",
      makeRumor: (npc, target) => `${npc.name} wants a trophy from ${target}`,
      makeTruth: (npc, target) => `Proof of prowess from ${target} earns ${npc.name}'s respect`,
      makeStakes: (_npc, target) => `bring trophy from ${target} (pays 30gp + favor)`,
      reward: ["30 gp + favor", "Political introduction", "50 gp"],
    },
    {
      keywords: ["alone", "peace", "quiet"],
      type: "mystery",
      makeRumor: (npc) => `${npc.name} wants something dealt with quietly`,
      makeTruth: (npc) => `Someone is harassing ${npc.name} and they want it stopped`,
      makeStakes: () => `stop harassment (pays 15gp)`,
      reward: ["15 gp", "20 gp", "Information"],
    },
    {
      keywords: ["escape", "past", "disappear"],
      type: "delivery",
      makeRumor: (npc) => `${npc.name} needs help with a discrete errand`,
      makeTruth: (npc) => `${npc.name} needs documents forged or delivered secretly`,
      makeStakes: () => `deliver sealed documents (pays 25gp, no questions)`,
      reward: ["25 gp", "30 gp", "A contact"],
    },
  ];

  for (const npc of npcsWithoutHooks) {
    // Skip NPCs without locationId (faction NPCs without settlement)
    if (!npc.locationId) continue;

    // Find matching template based on flavorWant keywords
    const want = npc.flavorWant.toLowerCase();
    let template = wantToHook.find((t) =>
      t.keywords.some((k) => want.includes(k))
    );

    // Default to random actionable quests if no keyword match
    if (!template) {
      const defaultQuests = [
        {
          type: "delivery" as HookType,
          makeRumor: (n: NPC, target?: string) => `${n.name} needs something delivered to ${target}`,
          makeTruth: (n: NPC) => `${n.name} has an urgent package`,
          makeStakes: (_n: NPC, target?: string) => `deliver package to ${target} (pays 15gp)`,
          reward: ["15 gp", "20 gp"],
        },
        {
          type: "retrieval" as HookType,
          makeRumor: (n: NPC, target?: string) => `${n.name} lost something in ${target}`,
          makeTruth: (n: NPC) => `${n.name} needs a keepsake recovered`,
          makeStakes: (_n: NPC, target?: string) => `find lost keepsake in ${target} (pays 20gp)`,
          reward: ["20 gp", "25 gp"],
        },
        {
          type: "investigation" as HookType,
          makeRumor: (n: NPC) => `${n.name} suspects someone of theft`,
          makeTruth: (n: NPC) => `${n.name} needs proof of who stole from them`,
          makeStakes: () => `find the thief (pays 25gp)`,
          reward: ["25 gp", "30 gp"],
        },
        {
          type: "escort" as HookType,
          makeRumor: (n: NPC, target?: string) => `${n.name} needs safe passage to ${target}`,
          makeTruth: (n: NPC) => `${n.name} fears the roads are dangerous`,
          makeStakes: (_n: NPC, target?: string) => `escort to ${target} (pays 20gp)`,
          reward: ["20 gp", "25 gp"],
        },
        {
          type: "mystery" as HookType,
          makeRumor: (n: NPC) => `${n.name} has a pest problem`,
          makeTruth: (n: NPC) => `Something is killing ${n.name}'s livestock at night`,
          makeStakes: () => `kill the beast (pays 30gp)`,
          reward: ["30 gp", "35 gp"],
        },
        {
          type: "debt" as HookType,
          makeRumor: (n: NPC) => `${n.name} is owed money`,
          makeTruth: (n: NPC) => `${n.name} needs help collecting a debt`,
          makeStakes: () => `collect debt (keeps 10% as fee)`,
          reward: ["10% of debt", "15 gp"],
        },
      ];
      const picked = rng.pick(defaultQuests);
      template = {
        keywords: [],
        ...picked,
      };
    }

    // Pick a target location (dungeon or nearby settlement)
    let targetLocation: string | undefined;
    let targetId: string | undefined;

    if (dungeons.length > 0 && rng.chance(0.7)) {
      const dungeon = rng.pick(dungeons);
      targetLocation = dungeon.name;
      targetId = dungeon.id;
    } else if (settlements.length > 1) {
      const otherSettlements = settlements.filter((s) => s.id !== npc.locationId);
      if (otherSettlements.length > 0) {
        const settlement = rng.pick(otherSettlements);
        targetLocation = settlement.name;
        targetId = settlement.id;
      }
    }

    if (!targetLocation) {
      targetLocation = "the wilderness";
    }

    const hook = createHook(rng, {
      type: template.type,
      sourceNpcId: npc.id,
      targetLocationId: targetId,
      rumor: template.makeRumor(npc, targetLocation),
      truth: template.makeTruth(npc, targetLocation),
      reward: rng.pick(template.reward),
    });

    hooks.push(hook);
    // Use the template's makeStakes for actionable quest description
    const stakes = template.makeStakes
      ? template.makeStakes(npc, targetLocation)
      : `help with task (pays ${rng.pick(template.reward)})`;
    addWantToNpc(npcMap, npc.id, hook.id, stakes);
  }

  return hooks;
}

// === Helpers ===

interface CreateHookParams {
  type: HookType;
  sourceNpcId?: string;
  sourceSettlementId?: string;
  sourceFactionId?: string;
  targetNpcId?: string;
  targetLocationId?: string;
  targetFactionId?: string;
  targetItemId?: string;
  missingNpcId?: string;
  rumor: string;
  truth: string;
  reward: string;
}

function createHook(rng: SeededRandom, params: CreateHookParams): Hook {
  return {
    id: `hook-${nanoid(8)}`,
    type: params.type,
    rumor: params.rumor,
    truth: params.truth,
    sourceNpcId: params.sourceNpcId,
    sourceSettlementId: params.sourceSettlementId,
    sourceFactionId: params.sourceFactionId,
    targetNpcId: params.targetNpcId,
    targetLocationId: params.targetLocationId,
    targetFactionId: params.targetFactionId,
    targetItemId: params.targetItemId,
    missingNpcId: params.missingNpcId,
    involvedNpcIds: [params.sourceNpcId, params.targetNpcId, params.missingNpcId].filter(Boolean) as string[],
    involvedLocationIds: [params.targetLocationId].filter(Boolean) as string[],
    involvedFactionIds: [params.sourceFactionId, params.targetFactionId].filter(Boolean) as string[],
    reward: params.reward,
    status: "available",
  };
}

function addWantToNpc(
  npcMap: Map<string, NPC>,
  npcId: string,
  hookId: string,
  personalStakes: string
): void {
  const npc = npcMap.get(npcId);
  if (!npc) return;

  npc.wants.push({ hookId, personalStakes });
}
