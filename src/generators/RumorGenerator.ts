import { nanoid } from "nanoid";
import type {
  Rumor,
  Notice,
  Faction,
  Hook,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

// === Rumor Templates ===

const RUMOR_TEMPLATES = [
  "They say {subject} has been seen near {location}",
  "I heard {subject} is looking for {object}",
  "Word is {subject} owes money to {other}",
  "Some folk claim {subject} has a secret {object}",
  "Travelers speak of {subject} lurking in {location}",
  "{subject} was spotted heading toward {location} last night",
  "The old timers remember when {subject} caused {event}",
  "There's talk of {subject} making deals with {other}",
];

const FALSE_RUMOR_TEMPLATES = [
  "My cousin's friend saw {subject} turn into {creature}",
  "Everyone knows {subject} is actually {creature} in disguise",
  "I heard {location} is haunted by {creature}",
  "They say touching {object} brings terrible luck",
  "The {location} holds a fortune in {treasure}, mark my words",
];

const SUBJECTS = [
  "a stranger", "the mayor", "a merchant", "a wanderer", "a knight",
  "a witch", "a priest", "bandits", "wolves", "goblins",
];

const LOCATIONS = [
  "the old mill", "the forest edge", "the abandoned mine", "the crossroads",
  "the temple ruins", "the eastern hills", "the swamp", "the tower",
];

const OBJECTS = [
  "gold", "a magic sword", "ancient scrolls", "stolen goods",
  "a hidden map", "dark secrets", "a cure", "powerful allies",
];

const EVENTS = [
  "the great fire", "the plague", "the war", "the drought",
  "the disappearances", "the flood", "the rebellion",
];

const CREATURES = [
  "a werewolf", "a vampire", "a demon", "an undead",
  "a dragon", "a ghost", "a shapeshifter",
];

const RUMOR_SOURCES = [
  "The Drunken Tankard",
  "A traveling merchant",
  "The old innkeeper",
  "A suspicious stranger",
  "Local gossip",
  "The town crier",
  "A nervous farmer",
  "The temple priest",
];

// === Notice Templates ===

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

const THREATS = [
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

export interface RumorGeneratorOptions {
  seed: string;
  count?: number;
  hooks?: Hook[];
  factions?: Faction[];
}

/**
 * Generate rumors for a settlement. All rumors are true/actionable.
 */
export function generateRumors(options: RumorGeneratorOptions): Rumor[] {
  const { seed, count = 3, hooks = [], factions = [] } = options;
  const rng = new SeededRandom(`${seed}-rumors`);
  const rumors: Rumor[] = [];

  // Generate hook-related rumors (always true)
  for (const hook of hooks.slice(0, 2)) {
    rumors.push({
      id: `rumor-${nanoid(8)}`,
      text: hook.rumor,
      isTrue: true,
      source: rng.pick(RUMOR_SOURCES),
      linkedHookId: hook.id,
    });
  }

  // Generate faction-related rumors (always true)
  for (const faction of factions.slice(0, 2)) {
    rumors.push({
      id: `rumor-${nanoid(8)}`,
      text: generateFactionRumor(rng, faction),
      isTrue: true,
      source: rng.pick(RUMOR_SOURCES),
    });
  }

  // Fill remaining with generic true rumors
  while (rumors.length < count) {
    rumors.push({
      id: `rumor-${nanoid(8)}`,
      text: fillTemplate(rng, rng.pick(RUMOR_TEMPLATES)),
      isTrue: true,
      source: rng.pick(RUMOR_SOURCES),
    });
  }

  return rumors;
}

function generateHookRumor(rng: SeededRandom, hook: Hook): string {
  // Create a rumor that hints at the hook
  const hint = hook.rumor.split(" ").slice(0, 5).join(" ");
  return `${hint}... or so they say`;
}

function generateFactionRumor(rng: SeededRandom, faction: Faction): string {
  const templates = [
    `${faction.name} has been active lately`,
    `I heard ${faction.name} is planning something big`,
    `Watch out for ${faction.name} around here`,
    `${faction.name} agents were seen in town`,
  ];
  return rng.pick(templates);
}

function fillTemplate(rng: SeededRandom, template: string): string {
  return template
    .replace("{subject}", rng.pick(SUBJECTS))
    .replace("{location}", rng.pick(LOCATIONS))
    .replace("{object}", rng.pick(OBJECTS))
    .replace("{other}", rng.pick(SUBJECTS))
    .replace("{event}", rng.pick(EVENTS))
    .replace("{creature}", rng.pick(CREATURES))
    .replace("{treasure}", rng.pick(["gold", "gems", "artifacts", "relics"]));
}

export interface NoticeGeneratorOptions {
  seed: string;
  count?: number;
  settlementSize?: string;
}

/**
 * Generate notice board postings.
 */
export function generateNotices(options: NoticeGeneratorOptions): Notice[] {
  const { seed, count = 2, settlementSize = "village" } = options;
  const rng = new SeededRandom(`${seed}-notices`);
  const notices: Notice[] = [];

  // Larger settlements have more notices
  const actualCount = settlementSize === "city" ? count + 2
    : settlementSize === "town" ? count + 1
    : count;

  const noticeTypes: NoticeType[] = ["bounty", "job", "warning", "announcement", "request"];

  for (let i = 0; i < actualCount; i++) {
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

function fillNoticeTemplate(rng: SeededRandom, template: string): string {
  return template
    .replace("{target}", rng.pick(TARGETS))
    .replace("{reward}", String(rng.between(10, 100)))
    .replace("{task}", rng.pick(TASKS).replace("{location}", rng.pick(LOCATIONS)))
    .replace("{location}", rng.pick(LOCATIONS))
    .replace("{contact}", rng.pick(["the innkeeper", "the guard captain", "the mayor"]))
    .replace("{threat}", rng.pick(THREATS))
    .replace("{authority}", rng.pick(AUTHORITIES))
    .replace("{announcement}", rng.pick(ANNOUNCEMENTS))
    .replace("{goods}", rng.pick(["horses", "weapons", "supplies", "potions"]))
    .replace("{item}", rng.pick(["a ring", "a pendant", "documents", "a pet"]));
}
