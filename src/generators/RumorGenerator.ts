import { nanoid } from "nanoid";
import type {
  Rumor,
  Notice,
  Faction,
  Hook,
  Dungeon,
  NPC,
  Settlement,
  Hex,
  Location,
  SignificantItem,
  AgendaGoal,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

// === Rumor Types ===

type RumorType =
  | "dungeon_lead"
  | "npc_secret"
  | "faction_intrigue"
  | "settlement_trouble"
  | "treasure_hint"
  | "danger_warning"
  | "item_rumor"
  | "agenda_rumor";

// === Dungeon Lead Templates ===
// Point players toward dungeons with mystery and stakes

const DUNGEON_LEAD_TEMPLATES = [
  "Three travelers vanished on the road near {dungeon}. The only survivor babbled about {theme_hint} before dying.",
  "An old map surfaced showing {dungeon}. The merchant who sold it was found dead the next morning.",
  "They pulled a body from the river - covered in wounds no beast could make. He had a sketch of {dungeon} in his pocket.",
  "{dungeon} has been quiet for years, but lights were seen there last night. Torches. Moving deeper.",
  "A dying adventurer stumbled into town from {dungeon}. Her last words: 'Don't let them finish the ritual.'",
  "The {theme_hint} at {dungeon} isn't abandoned. Someone - or something - has been stockpiling supplies there.",
  "Refugees from the east claim {dungeon} is the source of the blight spreading across the land.",
  "A child went missing near {dungeon}. The search party found only her doll - and strange tracks leading inside.",
];

const DUNGEON_THEME_HINTS: Record<string, string[]> = {
  tomb: ["ancient crypt", "burial chambers", "the dead walking", "sealed tombs"],
  cave: ["twisting caverns", "things in the dark", "echoing depths", "underground lake"],
  temple: ["profane altar", "dark worship", "blasphemous rites", "corrupted shrine"],
  mine: ["abandoned tunnels", "something they dug up", "collapsed shafts", "ore that glows wrong"],
  fortress: ["old battlements", "war machines", "armored dead", "siege tunnels"],
  sewer: ["flooded tunnels", "the stench of death", "things that swim", "forgotten passages"],
  crypt: ["bone-lined walls", "whispering dead", "sealed sarcophagi", "eternal guardians"],
  lair: ["beast's den", "gnawed bones", "territorial markers", "the creature's hoard"],
  shrine: ["sacred relics", "divine presence", "blessed ground", "ancient prayers", "holy guardians"],
  bandit_hideout: ["stolen goods", "armed thugs", "hidden entrance", "hostages"],
  cultist_lair: ["ritual circles", "chanting", "sacrificial altar", "robed figures"],
  witch_hut: ["strange herbs", "caged creatures", "bubbling cauldron", "hexed land"],
  sea_cave: ["tidal chambers", "drowned dead", "smuggler's cache", "something from the deep"],
  beast_den: ["territorial predator", "half-eaten prey", "young to protect", "marked territory"],
  floating_keep: ["impossible architecture", "warped magic", "sky-touched stones", "vertigo-inducing heights"],
};

// === NPC Secret Templates ===
// Hint at NPC secrets, wants, or hidden agendas

const NPC_SECRET_TEMPLATES = [
  "{npc} at {site} pays well for certain errands - but never ask where the coin comes from.",
  "Watch {npc}'s hands when strangers come to town. Old habit from their past life, I reckon.",
  "{npc} has been meeting someone outside town at night. Won't say who. Won't say why.",
  "They say {npc} knows more about {dungeon} than they let on. Ask about their missing years.",
  "{npc} is desperate for {want}. Desperate enough to do something foolish.",
  "Don't trust {npc}. I've seen the letters they burn. Someone's pulling their strings.",
  "{npc} was asking around about {faction}. Seemed scared. Real scared.",
  "Before {npc} came here, they went by a different name. The kind of name people remember.",
];

// === Faction Intrigue Templates ===
// Faction activities, conflicts, recruitment opportunities

const FACTION_INTRIGUE_TEMPLATES = [
  "{faction} is offering good coin for information about {other_faction}'s movements.",
  "Someone's been leaving {faction}'s mark around town. They're recruiting - or warning.",
  "{faction} lost something valuable. They're not advertising, but they're searching hard.",
  "I heard {faction} and {other_faction} had a... disagreement. Bodies were involved.",
  "{faction} agents were seen heading toward {location}. Armed. In a hurry.",
  "Join {faction}? You'd have to do something to prove yourself first. Something ugly.",
  "The {faction} war is coming to a head. Pick a side or get caught in the middle.",
  "{faction} is looking for someone with your skills. The pay is good. The work... less so.",
];

// === Settlement Trouble Templates ===
// Tie into the settlement's existing trouble or mood

const SETTLEMENT_TROUBLE_TEMPLATES = [
  "The {trouble} has gotten worse. The council's pretending everything's fine, but it's not.",
  "Three families left town this week. All of them mentioned the {trouble}.",
  "Someone needs to do something about the {trouble}. The guard won't. The mayor can't.",
  "The {trouble} started after {npc} arrived. Coincidence? I don't believe in those.",
  "We've tried everything for the {trouble}. Nothing works. Maybe outsiders could help.",
  "The {trouble} is just the surface. There's something deeper going on here.",
];

// === Treasure Hint Templates ===
// Valuable items, lost things, rewards

const TREASURE_HINT_TEMPLATES = [
  "{dead_npc}'s family says they hid something valuable before they vanished. Never found it.",
  "The old {site} has a hidden cellar. Sealed up years ago. Nobody remembers why.",
  "A merchant lost a strongbox on the road to {location}. Offering no questions asked.",
  "They say the {dungeon_theme} at {dungeon} holds treasure from the old kingdom. Cursed, probably.",
  "Someone's been digging in the {terrain} at night. Looking for something buried.",
  "{npc} inherited a map but can't read it. Might be worth something to the right person.",
];

// === Danger Warning Templates ===
// Threats, monster sightings, urgent warnings

const DANGER_WARNING_TEMPLATES = [
  "Don't take the road past {location}. Something's hunting travelers. The guards found pieces.",
  "The {creature} attacks are getting bolder. Closer to town each time.",
  "That {terrain} isn't safe anymore. Three hunters went in. None came back.",
  "Lock your doors when the fog rolls in. That's when {threat} comes out.",
  "Whatever's in {dungeon} is waking up. The ground shakes at night now.",
  "The old-timers say when {sign} appears, {consequence}. We saw {sign} last night.",
];

const CREATURES = [
  "wolf pack", "goblin raiders", "shambling dead", "something with too many legs",
  "a beast no one's seen before", "bandits", "wild dogs", "giant spiders",
];

const THREATS = [
  "the thing in the woods", "whatever killed the miller", "the night hunters",
  "the shadows that move wrong", "the howling",
];

const SIGNS = [
  "crows circle the tower", "the well runs red", "dogs won't stop barking",
  "the old stones glow", "fish float belly-up",
];

const CONSEQUENCES = [
  "death follows", "someone goes missing", "the dead walk", "the harvest fails",
  "madness spreads",
];

const TERRAIN_DESCRIPTORS: Record<string, string> = {
  plains: "open fields",
  forest: "deep woods",
  hills: "rocky hills",
  mountains: "mountain pass",
  water: "lakeside",
  swamp: "marshland",
};

// === Rumor Sources ===

const RUMOR_SOURCES = [
  "A drunk at the tavern",
  "The innkeeper's whisper",
  "Overheard at the market",
  "A nervous traveler",
  "Local gossip",
  "A dying stranger",
  "Graffiti on a wall",
  "An unsigned note",
  "The temple beggar",
  "A merchant's warning",
];

// === Main Generator ===

export interface RumorGeneratorOptions {
  seed: string;
  count?: number;
  // World data for connected rumors
  hooks?: Hook[];
  factions?: Faction[];
  dungeons?: Dungeon[];
  npcs?: NPC[];
  settlements?: Settlement[];
  hexes?: Hex[];
  currentSettlement?: Settlement;
  // Cairn-inspired Setting Seeds data
  significantItems?: SignificantItem[];
}

const MAX_RUMORS = 8;

export function generateRumors(options: RumorGeneratorOptions): Rumor[] {
  const {
    seed,
    count = 6,
    hooks = [],
    factions = [],
    dungeons = [],
    npcs = [],
    settlements = [],
    hexes = [],
    currentSettlement,
    significantItems = [],
  } = options;

  const rng = new SeededRandom(`${seed}-rumors`);
  const rumors: Rumor[] = [];
  const targetCount = Math.min(count, MAX_RUMORS);

  // Priority 1: Significant item rumors (Cairn-style - most interesting to players)
  const desiredItems = significantItems.filter(
    (item) => item.desiredByFactionIds.length > 0 || item.status === "hidden" || item.status === "lost"
  );
  for (const item of desiredItems.slice(0, 2)) {
    if (rumors.length >= targetCount) break;
    const rumor = generateItemRumor(rng, item, factions);
    if (rumor) {
      rumors.push({
        id: `rumor-${nanoid(8)}`,
        text: rumor,
        isTrue: true,
        source: rng.pick(RUMOR_SOURCES),
      });
    }
  }

  // Priority 2: Faction agenda rumors (what factions are actively doing)
  for (const faction of factions.slice(0, 2)) {
    if (rumors.length >= targetCount) break;
    const agendaRumor = generateAgendaRumor(rng, faction);
    if (agendaRumor) {
      rumors.push({
        id: `rumor-${nanoid(8)}`,
        text: agendaRumor,
        isTrue: true,
        source: rng.pick(RUMOR_SOURCES),
      });
    }
  }

  // Priority 3: Hook-linked rumors (if available) - shuffle to get different hooks each time
  const shuffledHooks = [...hooks];
  rng.shuffle(shuffledHooks);
  for (const hook of shuffledHooks.slice(0, 2)) {
    if (rumors.length >= targetCount) break;
    rumors.push({
      id: `rumor-${nanoid(8)}`,
      text: hook.rumor,
      isTrue: true,
      source: rng.pick(RUMOR_SOURCES),
      linkedHookId: hook.id,
    });
  }

  // Build a pool of rumor generators based on available data
  const generators: Array<() => Rumor | null> = [];

  // Dungeon leads
  if (dungeons.length > 0) {
    generators.push(() => generateDungeonLead(rng, dungeons, hexes));
    generators.push(() => generateDungeonLead(rng, dungeons, hexes));
  }

  // NPC secrets
  const npcsWithSecrets = npcs.filter((n) => n.secret || n.wants.length > 0);
  if (npcsWithSecrets.length > 0 && currentSettlement) {
    generators.push(() => generateNpcSecret(rng, npcsWithSecrets, currentSettlement, dungeons, factions));
  }

  // Faction intrigue
  if (factions.length > 0) {
    generators.push(() => generateFactionIntrigue(rng, factions, dungeons, settlements));
    if (factions.length > 1) {
      generators.push(() => generateFactionIntrigue(rng, factions, dungeons, settlements));
    }
  }

  // Settlement trouble
  if (currentSettlement?.trouble) {
    generators.push(() => generateSettlementTrouble(rng, currentSettlement, npcs));
  }

  // Treasure hints
  if (dungeons.length > 0 || currentSettlement) {
    generators.push(() => generateTreasureHint(rng, dungeons, currentSettlement, npcs, hexes));
  }

  // Danger warnings
  if (dungeons.length > 0 || hexes.length > 0) {
    generators.push(() => generateDangerWarning(rng, dungeons, hexes, settlements));
  }

  // Shuffle generators for variety
  rng.shuffle(generators);

  // Generate rumors from pool
  for (const generator of generators) {
    if (rumors.length >= targetCount) break;
    const rumor = generator();
    if (rumor) {
      rumors.push(rumor);
    }
  }

  // Fill remaining with generic atmospheric rumors if needed
  while (rumors.length < targetCount) {
    rumors.push(generateGenericRumor(rng, dungeons, factions, hexes));
  }

  return rumors;
}

// === Cairn-style Item Rumors ===

/**
 * Generate a rumor about a significant item.
 */
function generateItemRumor(
  rng: SeededRandom,
  item: SignificantItem,
  factions: Faction[]
): string | null {
  const templates: string[] = [];

  // Rumors about the item's existence
  if (item.knownToExist) {
    templates.push(
      `They say ${item.name} still exists somewhere in the realm`,
      `My grandfather spoke of ${item.name} - a ${item.type} of great power`,
      `${item.name}... I've heard that name before. Something about ${item.effect.toLowerCase().slice(0, 30)}...`
    );
  }

  // Rumors about factions seeking it
  if (item.desiredByFactionIds.length > 0) {
    const seekingFaction = factions.find((f) => item.desiredByFactionIds.includes(f.id));
    if (seekingFaction) {
      templates.push(
        `${seekingFaction.name} has been asking questions about ${item.name}`,
        `I heard ${seekingFaction.name} agents are searching for some artifact... ${item.name}, I think`,
        `Watch yourself - ${seekingFaction.name} wants ${item.name} badly, and they'll do anything to get it`
      );
    }
  }

  // Rumors about location (vague)
  if (item.status === "hidden" && item.locationKnown) {
    templates.push(
      `Some say ${item.name} lies in a dungeon to the ${rng.pick(["east", "west", "north", "south"])}`,
      `${item.name} was hidden away long ago - in a place of darkness`,
      `If you're brave enough to seek ${item.name}, look in the old ruins`
    );
  }

  // Rumors about lost items
  if (item.status === "lost") {
    templates.push(
      `${item.name} was lost ages ago - no one knows where`,
      `Many have sought ${item.name}. None have found it`,
      `The location of ${item.name} died with its last owner`
    );
  }

  // Rumors about possessed items
  if (item.status === "possessed" && item.currentHolderId) {
    const holder = factions.find((f) => f.id === item.currentHolderId);
    if (holder) {
      templates.push(
        `${holder.name} guards ${item.name} jealously`,
        `They say ${holder.name} draws power from ${item.name}`,
        `Want ${item.name}? You'd have to take it from ${holder.name} first`
      );
    }
  }

  if (templates.length === 0) return null;
  return rng.pick(templates);
}

/**
 * Generate a rumor about a faction's current agenda progress.
 */
function generateAgendaRumor(rng: SeededRandom, faction: Faction): string | null {
  // Find the in-progress goal
  const currentGoal = faction.agenda?.find((g) => g.status === "in_progress");
  if (!currentGoal) return null;

  const templates = [
    `${faction.name} is working on something - "${currentGoal.description.toLowerCase()}" they say`,
    `Word is ${faction.name} plans to ${currentGoal.description.toLowerCase()}`,
    `${faction.name} agents have been busy lately. Something about "${currentGoal.description.toLowerCase()}"`,
    `I overheard ${faction.name} members talking - they're trying to ${currentGoal.description.toLowerCase()}`,
  ];

  // Add obstacle-related rumors
  if (faction.obstacle) {
    templates.push(
      `${faction.name} seems frustrated - ${faction.obstacle.description.toLowerCase()}`,
      `Something's blocking ${faction.name}'s plans. ${faction.obstacle.description}`
    );
  }

  // Add advantage-related rumors
  if (faction.advantages && faction.advantages.length > 0) {
    const advantage = rng.pick(faction.advantages);
    templates.push(
      `${faction.name}'s power comes from their ${advantage.name.toLowerCase()}`,
      `Don't underestimate ${faction.name} - they have ${advantage.name.toLowerCase()}`
    );
  }

  return rng.pick(templates);
}

// === Rumor Generators ===

function generateDungeonLead(
  rng: SeededRandom,
  dungeons: Dungeon[],
  hexes: Hex[]
): Rumor | null {
  const dungeon = rng.pick(dungeons);
  if (!dungeon) return null;

  const template = rng.pick(DUNGEON_LEAD_TEMPLATES);
  const themeHints = DUNGEON_THEME_HINTS[dungeon.theme] || ["darkness", "danger"];
  const themeHint = rng.pick(themeHints);

  const text = template
    .replace(/{dungeon}/g, dungeon.name)
    .replace(/{theme_hint}/g, themeHint);

  return {
    id: `rumor-${nanoid(8)}`,
    text,
    isTrue: true,
    source: rng.pick(RUMOR_SOURCES),
    targetLocationId: dungeon.id,
  };
}

function generateNpcSecret(
  rng: SeededRandom,
  npcs: NPC[],
  settlement: Settlement,
  dungeons: Dungeon[],
  factions: Faction[]
): Rumor | null {
  const npc = rng.pick(npcs);
  if (!npc) return null;

  // Find site for NPC
  const site = settlement.sites.find((s) => s.ownerId === npc.id || s.staffIds?.includes(npc.id));
  const siteName = site?.name || "the edge of town";

  const template = rng.pick(NPC_SECRET_TEMPLATES);

  let text = template
    .replace(/{npc}/g, npc.name)
    .replace(/{site}/g, siteName);

  // Fill optional placeholders
  if (text.includes("{want}") && npc.wants.length > 0) {
    text = text.replace(/{want}/g, npc.wants[0].personalStakes || "something they won't name");
  } else if (text.includes("{want}")) {
    text = text.replace(/{want}/g, npc.flavorWant || "answers");
  }

  if (text.includes("{dungeon}") && dungeons.length > 0) {
    text = text.replace(/{dungeon}/g, rng.pick(dungeons).name);
  } else if (text.includes("{dungeon}")) {
    text = text.replace(/{dungeon}/g, "the old ruins");
  }

  if (text.includes("{faction}") && factions.length > 0) {
    text = text.replace(/{faction}/g, rng.pick(factions).name);
  } else if (text.includes("{faction}")) {
    text = text.replace(/{faction}/g, "dangerous people");
  }

  return {
    id: `rumor-${nanoid(8)}`,
    text,
    isTrue: true,
    source: rng.pick(RUMOR_SOURCES),
  };
}

function generateFactionIntrigue(
  rng: SeededRandom,
  factions: Faction[],
  dungeons: Dungeon[],
  settlements: Settlement[]
): Rumor | null {
  const faction = rng.pick(factions);
  if (!faction) return null;

  const template = rng.pick(FACTION_INTRIGUE_TEMPLATES);

  let text = template.replace(/{faction}/g, faction.name);

  // Other faction for rivalry rumors
  if (text.includes("{other_faction}")) {
    const otherFactions = factions.filter((f) => f.id !== faction.id);
    if (otherFactions.length > 0) {
      text = text.replace(/{other_faction}/g, rng.pick(otherFactions).name);
    } else {
      text = text.replace(/{other_faction}/g, "their enemies");
    }
  }

  // Location reference
  if (text.includes("{location}")) {
    const locations = [...dungeons.map((d) => d.name), ...settlements.map((s) => s.name)];
    if (locations.length > 0) {
      text = text.replace(/{location}/g, rng.pick(locations));
    } else {
      text = text.replace(/{location}/g, "the borderlands");
    }
  }

  return {
    id: `rumor-${nanoid(8)}`,
    text,
    isTrue: true,
    source: rng.pick(RUMOR_SOURCES),
  };
}

function generateSettlementTrouble(
  rng: SeededRandom,
  settlement: Settlement,
  npcs: NPC[]
): Rumor | null {
  const template = rng.pick(SETTLEMENT_TROUBLE_TEMPLATES);
  const localNpcs = npcs.filter((n) => n.locationId === settlement.id);

  let text = template.replace(/{trouble}/g, settlement.trouble.toLowerCase());

  if (text.includes("{npc}") && localNpcs.length > 0) {
    text = text.replace(/{npc}/g, rng.pick(localNpcs).name);
  } else if (text.includes("{npc}")) {
    text = text.replace(/{npc}/g, "the newcomer");
  }

  return {
    id: `rumor-${nanoid(8)}`,
    text,
    isTrue: true,
    source: rng.pick(RUMOR_SOURCES),
    targetLocationId: settlement.id,
  };
}

function generateTreasureHint(
  rng: SeededRandom,
  dungeons: Dungeon[],
  settlement: Settlement | undefined,
  npcs: NPC[],
  hexes: Hex[]
): Rumor | null {
  const template = rng.pick(TREASURE_HINT_TEMPLATES);
  let text = template;

  // Dead/missing NPC reference
  const deadNpcs = npcs.filter((n) => n.status === "dead" || n.status === "missing");
  if (text.includes("{dead_npc}") && deadNpcs.length > 0) {
    text = text.replace(/{dead_npc}/g, rng.pick(deadNpcs).name);
  } else if (text.includes("{dead_npc}")) {
    text = text.replace(/{dead_npc}/g, "Old Marten");
  }

  // Site reference
  if (text.includes("{site}") && settlement?.sites.length) {
    text = text.replace(/{site}/g, rng.pick(settlement.sites).name);
  } else if (text.includes("{site}")) {
    text = text.replace(/{site}/g, "tavern");
  }

  // Location reference
  if (text.includes("{location}")) {
    if (dungeons.length > 0) {
      text = text.replace(/{location}/g, rng.pick(dungeons).name);
    } else {
      text = text.replace(/{location}/g, "the crossroads");
    }
  }

  // Dungeon reference
  if (text.includes("{dungeon}") && dungeons.length > 0) {
    const dungeon = rng.pick(dungeons);
    text = text.replace(/{dungeon}/g, dungeon.name);
    const themeHints = DUNGEON_THEME_HINTS[dungeon.theme] || ["ruins"];
    text = text.replace(/{dungeon_theme}/g, rng.pick(themeHints));
  } else {
    text = text.replace(/{dungeon}/g, "the old ruins");
    text = text.replace(/{dungeon_theme}/g, "darkness");
  }

  // Terrain reference
  if (text.includes("{terrain}")) {
    const terrainTypes = [...new Set(hexes.map((h) => h.terrain))];
    const terrain = terrainTypes.length > 0 ? rng.pick(terrainTypes) : "plains";
    text = text.replace(/{terrain}/g, TERRAIN_DESCRIPTORS[terrain] || "wilderness");
  }

  // NPC reference
  if (text.includes("{npc}") && npcs.length > 0) {
    text = text.replace(/{npc}/g, rng.pick(npcs).name);
  } else if (text.includes("{npc}")) {
    text = text.replace(/{npc}/g, "a local farmer");
  }

  return {
    id: `rumor-${nanoid(8)}`,
    text,
    isTrue: true,
    source: rng.pick(RUMOR_SOURCES),
  };
}

function generateDangerWarning(
  rng: SeededRandom,
  dungeons: Dungeon[],
  hexes: Hex[],
  settlements: Settlement[]
): Rumor | null {
  const template = rng.pick(DANGER_WARNING_TEMPLATES);
  let text = template;

  // Location reference
  if (text.includes("{location}")) {
    const locations = [...dungeons.map((d) => d.name), ...settlements.map((s) => s.name)];
    if (locations.length > 0) {
      text = text.replace(/{location}/g, rng.pick(locations));
    } else {
      text = text.replace(/{location}/g, "the old road");
    }
  }

  // Dungeon reference
  if (text.includes("{dungeon}") && dungeons.length > 0) {
    text = text.replace(/{dungeon}/g, rng.pick(dungeons).name);
  } else if (text.includes("{dungeon}")) {
    text = text.replace(/{dungeon}/g, "the ruins");
  }

  // Terrain reference
  if (text.includes("{terrain}")) {
    const terrainTypes = [...new Set(hexes.map((h) => h.terrain))];
    const terrain = terrainTypes.length > 0 ? rng.pick(terrainTypes) : "forest";
    text = text.replace(/{terrain}/g, TERRAIN_DESCRIPTORS[terrain] || "wilderness");
  }

  // Creature/threat
  text = text.replace(/{creature}/g, rng.pick(CREATURES));
  text = text.replace(/{threat}/g, rng.pick(THREATS));

  // Signs and consequences
  text = text.replace(/{sign}/g, rng.pick(SIGNS));
  text = text.replace(/{consequence}/g, rng.pick(CONSEQUENCES));

  return {
    id: `rumor-${nanoid(8)}`,
    text,
    isTrue: true,
    source: rng.pick(RUMOR_SOURCES),
  };
}

function generateGenericRumor(
  rng: SeededRandom,
  dungeons: Dungeon[],
  factions: Faction[],
  hexes: Hex[]
): Rumor {
  // Fallback atmospheric rumors when no world data available
  const GENERIC_TEMPLATES = [
    "Something's wrong with the water. Tastes like copper. Like blood.",
    "The crows have been circling for three days now. Never a good sign.",
    "A stranger paid in old coins last night. Coins that haven't been minted in a hundred years.",
    "The temple bells rang at midnight. No one was in the tower.",
    "Dreams have been strange lately. Everyone's having the same one.",
    "The dogs won't stop howling. They know something we don't.",
    "An old woman warned me not to travel east. Wouldn't say why. Just shook her head.",
    "The dead have been restless, they say. Graves disturbed. Nothing taken.",
  ];

  return {
    id: `rumor-${nanoid(8)}`,
    text: rng.pick(GENERIC_TEMPLATES),
    isTrue: true,
    source: rng.pick(RUMOR_SOURCES),
  };
}

// === Notice Generator ===

type NoticeType = "bounty" | "job" | "warning" | "announcement" | "request";

const NOTICE_TEMPLATES: Record<NoticeType, string[]> = {
  bounty: [
    "WANTED: {target}. Reward: {reward} gold",
    "BOUNTY: {target} - Dead or Alive. {reward} gold reward",
  ],
  job: [
    "ADVENTURERS SOUGHT: {task}. Speak to {contact}",
    "HELP NEEDED: {task}. Inquire at {location}",
  ],
  warning: [
    "WARNING: {threat} reported on the {location} road",
    "DANGER: Do not enter {location} - {threat} sighted",
  ],
  announcement: [
    "By decree of {authority}: {announcement}",
    "PUBLIC NOTICE: {announcement}",
  ],
  request: [
    "SEEKING: {goods} - will pay top coin",
    "LOST: {item} - reward for return",
  ],
};

const TARGETS = [
  "the bandit leader", "a dangerous criminal", "a notorious thief",
  "a pack of wolves", "goblin raiders", "escaped prisoners",
];

const TASKS = [
  "Escort needed to {location}",
  "Clear {location} of monsters",
  "Investigate disappearances",
  "Retrieve stolen goods",
  "Guard the caravan",
];

const NOTICE_THREATS = [
  "bandits", "wolves", "goblins", "undead", "strange beasts",
];

const AUTHORITIES = [
  "the Lord Mayor", "the Town Council", "the Guard Captain",
  "the High Priest", "the Guild Master",
];

const ANNOUNCEMENTS = [
  "a festival will be held next moon",
  "the market tax has increased",
  "travel restrictions are in effect",
  "a curfew is now in place",
];

const LOCATIONS = [
  "the old mill", "the forest edge", "the abandoned mine", "the crossroads",
  "the temple ruins", "the eastern hills", "the swamp", "the tower",
];

export interface NoticeGeneratorOptions {
  seed: string;
  count?: number;
  settlementSize?: string;
  factions?: Faction[];
  significantItems?: SignificantItem[];
  npcs?: NPC[]; // Settlement NPCs for contact assignments
}

/**
 * Generate notice board postings.
 * Includes faction-driven and item-driven notices.
 */
export function generateNotices(options: NoticeGeneratorOptions): Notice[] {
  const {
    seed,
    count = 2,
    settlementSize = "village",
    factions = [],
    significantItems = [],
    npcs = [],
  } = options;
  const rng = new SeededRandom(`${seed}-notices`);
  const notices: Notice[] = [];

  const actualCount = settlementSize === "city" ? count + 2
    : settlementSize === "town" ? count + 1
    : count;

  // Priority 1: Faction agenda-driven notices (hiring adventurers)
  for (const faction of factions.slice(0, 2)) {
    if (notices.length >= actualCount) break;

    const agendaNotice = generateAgendaNotice(rng, faction, npcs);
    if (agendaNotice) {
      notices.push(agendaNotice);
    }
  }

  // Priority 2: Item-seeking notices
  const soughtItems = significantItems.filter(
    (item) => item.desiredByFactionIds.length > 0 && item.status !== "possessed"
  );
  for (const item of soughtItems.slice(0, 1)) {
    if (notices.length >= actualCount) break;

    const seekingFaction = factions.find((f) => item.desiredByFactionIds.includes(f.id));
    const itemNotice = generateItemNotice(rng, item, seekingFaction, npcs);
    if (itemNotice) {
      notices.push(itemNotice);
    }
  }

  // Priority 3: Counter-notices (warnings about faction activity)
  for (const faction of factions) {
    if (notices.length >= actualCount) break;

    // 30% chance for a warning notice about a faction
    if (rng.chance(0.3)) {
      notices.push({
        id: `notice-${nanoid(8)}`,
        title: "WARNING",
        description: `Beware: ${faction.name} agents have been spotted in the area. Report suspicious activity to the guard.`,
        noticeType: "warning",
      });
    }
  }

  // Fill remaining with generic notices
  const noticeTypes: NoticeType[] = ["bounty", "job", "warning", "announcement", "request"];

  while (notices.length < actualCount) {
    const noticeType = rng.pick(noticeTypes);
    const template = rng.pick(NOTICE_TEMPLATES[noticeType]);

    notices.push({
      id: `notice-${nanoid(8)}`,
      title: noticeType.toUpperCase(),
      description: fillNoticeTemplate(rng, template),
      noticeType,
      reward: noticeType === "bounty" ? `${rng.between(10, 100)} gp` : undefined,
    });
  }

  return notices;
}

/**
 * Generate a notice related to a faction's current agenda goal.
 * These are jobs that (unknowingly) help the faction.
 * Links to a real NPC in the settlement when available.
 */
function generateAgendaNotice(rng: SeededRandom, faction: Faction, npcs: NPC[]): Notice | null {
  const currentGoal = faction.agenda?.find((g) => g.status === "in_progress");
  if (!currentGoal) return null;

  // Find a suitable NPC contact in town
  // Priority: faction members > innkeeper > merchant > any NPC
  const factionMembers = npcs.filter((n) => n.factionId === faction.id);
  const innkeepers = npcs.filter((n) => n.role === "innkeeper");
  const merchants = npcs.filter((n) => n.role === "merchant" || n.archetype === "merchant");

  let contactNpc: NPC | undefined;
  if (factionMembers.length > 0) {
    contactNpc = rng.pick(factionMembers);
  } else if (innkeepers.length > 0) {
    contactNpc = rng.pick(innkeepers);
  } else if (merchants.length > 0) {
    contactNpc = rng.pick(merchants);
  } else if (npcs.length > 0) {
    contactNpc = rng.pick(npcs);
  }

  const contactName = contactNpc?.name ?? `a representative of ${faction.name}`;
  const contactLocation = contactNpc ? "at the inn" : "";

  // Create a notice that hires adventurers to help with the goal
  const templates: Array<{ title: string; desc: string; type: NoticeType }> = [
    {
      title: "ADVENTURERS WANTED",
      desc: `Seeking capable individuals for discreet work. Good pay. Ask for ${contactName}${contactLocation ? ` ${contactLocation}` : ""}.`,
      type: "job",
    },
    {
      title: "ESCORTS NEEDED",
      desc: `Protection required for sensitive cargo. ${rng.between(20, 50)} gp. Inquire with ${contactName}.`,
      type: "job",
    },
    {
      title: "INFORMATION WANTED",
      desc: `Information sought regarding ${currentGoal.description.toLowerCase().slice(0, 40)}. Rewards for credible leads. Contact ${contactName}.`,
      type: "request",
    },
    {
      title: "SKILLED HELP NEEDED",
      desc: `Specialists required. Nature of work: confidential. Generous compensation. See ${contactName}.`,
      type: "job",
    },
  ];

  // If goal targets an item, make it more specific
  if (currentGoal.targetType === "item") {
    templates.push({
      title: "ARTIFACT SOUGHT",
      desc: `Substantial reward for information leading to the recovery of a certain relic. Discretion required. Contact ${contactName}.`,
      type: "request",
    });
  }

  const choice = rng.pick(templates);

  return {
    id: `notice-${nanoid(8)}`,
    title: choice.title,
    description: choice.desc,
    noticeType: choice.type,
    reward: rng.chance(0.5) ? `${rng.between(30, 100)} gp` : undefined,
    posterId: contactNpc?.id,
  };
}

/**
 * Generate a notice about seeking a significant item.
 * Links to a real NPC in the settlement when available.
 */
function generateItemNotice(
  rng: SeededRandom,
  item: SignificantItem,
  seekingFaction?: Faction,
  npcs: NPC[] = []
): Notice | null {
  // Find a suitable NPC contact
  // Priority: faction members > shady types > any NPC
  let contactNpc: NPC | undefined;

  if (seekingFaction) {
    const factionMembers = npcs.filter((n) => n.factionId === seekingFaction.id);
    if (factionMembers.length > 0) {
      contactNpc = rng.pick(factionMembers);
    }
  }

  if (!contactNpc) {
    // Look for shady-sounding NPCs
    const shadyTypes = npcs.filter(
      (n) => n.archetype === "thief" || n.archetype === "merchant" || n.role === "criminal"
    );
    if (shadyTypes.length > 0) {
      contactNpc = rng.pick(shadyTypes);
    } else if (npcs.length > 0) {
      contactNpc = rng.pick(npcs);
    }
  }

  const contactName = contactNpc?.name
    ?? (seekingFaction ? `agents of ${seekingFaction.name}` : "an anonymous patron");

  const templates: Array<{ title: string; desc: string }> = [
    {
      title: "RELIC SOUGHT",
      desc: `REWARD: Information regarding "${item.name}". No questions asked. Contact ${contactName}.`,
    },
    {
      title: "SEEKING ANTIQUITIES",
      desc: `Collector seeks items of historical significance, particularly "${item.name}". Top prices paid. See ${contactName}.`,
    },
    {
      title: "EXPEDITION MEMBERS WANTED",
      desc: `Dangerous expedition planned. Destination: classified. Object: artifact recovery. Speak to ${contactName}.`,
    },
  ];

  const choice = rng.pick(templates);

  return {
    id: `notice-${nanoid(8)}`,
    title: choice.title,
    description: choice.desc,
    noticeType: "request",
    reward: `${rng.between(50, 200)} gp`,
    posterId: contactNpc?.id,
  };
}

function fillNoticeTemplate(rng: SeededRandom, template: string): string {
  return template
    .replace("{target}", rng.pick(TARGETS))
    .replace("{reward}", String(rng.between(10, 100)))
    .replace("{task}", rng.pick(TASKS).replace("{location}", rng.pick(LOCATIONS)))
    .replace("{location}", rng.pick(LOCATIONS))
    .replace("{contact}", rng.pick(["the innkeeper", "the guard captain", "the mayor"]))
    .replace("{threat}", rng.pick(NOTICE_THREATS))
    .replace("{authority}", rng.pick(AUTHORITIES))
    .replace("{announcement}", rng.pick(ANNOUNCEMENTS))
    .replace("{goods}", rng.pick(["horses", "weapons", "supplies", "potions"]))
    .replace("{item}", rng.pick(["a ring", "a pendant", "documents", "a pet"]));
}
