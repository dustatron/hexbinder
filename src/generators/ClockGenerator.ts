import { nanoid } from "nanoid";
import type {
  Clock,
  ClockTrigger,
  ClockConsequence,
  Faction,
  FactionArchetype,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

// === Clock Templates by Faction Archetype ===

interface ClockTemplate {
  name: string;
  description: string;
  segments: number;
  triggerType: "time" | "event";
  daysPerTick?: number;
  events?: string[];
  consequences: ClockConsequence[];
}

const CLOCK_TEMPLATES: Record<FactionArchetype, ClockTemplate[]> = {
  criminal: [
    {
      name: "Expanding Operations",
      description: "The gang is expanding their territory",
      segments: 6,
      triggerType: "time",
      daysPerTick: 7,
      consequences: [
        { description: "Controls a new district", type: "state_change" },
        { description: "Gains resources and recruits", type: "event" },
      ],
    },
    {
      name: "Assassination Plot",
      description: "Planning to eliminate a rival",
      segments: 4,
      triggerType: "time",
      daysPerTick: 5,
      consequences: [
        { description: "Target is assassinated", type: "event" },
        { description: "Power vacuum created", type: "state_change" },
      ],
    },
  ],
  religious: [
    {
      name: "Grand Ritual",
      description: "Preparing for a powerful ceremony",
      segments: 8,
      triggerType: "event",
      events: ["holy_day", "sacrifice_offered", "artifact_acquired"],
      consequences: [
        { description: "Divine intervention occurs", type: "spawn" },
        { description: "Faith spreads across region", type: "state_change" },
      ],
    },
    {
      name: "Crusade",
      description: "Gathering forces for a holy war",
      segments: 6,
      triggerType: "time",
      daysPerTick: 14,
      consequences: [
        { description: "Religious army marches", type: "event" },
        { description: "War declared on heretics", type: "state_change" },
      ],
    },
  ],
  political: [
    {
      name: "Coup Planning",
      description: "Scheming to seize power",
      segments: 6,
      triggerType: "time",
      daysPerTick: 7,
      consequences: [
        { description: "Government overthrown", type: "event" },
        { description: "New ruler takes power", type: "state_change" },
      ],
    },
    {
      name: "Trade Embargo",
      description: "Pressuring rivals economically",
      segments: 4,
      triggerType: "time",
      daysPerTick: 5,
      consequences: [
        { description: "Economic sanctions take effect", type: "state_change" },
        { description: "Trade routes disrupted", type: "event" },
      ],
    },
  ],
  mercantile: [
    {
      name: "Monopoly Formation",
      description: "Buying out all competition",
      segments: 8,
      triggerType: "time",
      daysPerTick: 7,
      consequences: [
        { description: "Complete market control", type: "state_change" },
        { description: "Prices increase dramatically", type: "event" },
      ],
    },
    {
      name: "Trade Route Expansion",
      description: "Establishing new trade connections",
      segments: 6,
      triggerType: "time",
      daysPerTick: 10,
      consequences: [
        { description: "New markets opened", type: "state_change" },
        { description: "Wealth flows into region", type: "event" },
      ],
    },
  ],
  military: [
    {
      name: "Fortification",
      description: "Building defenses",
      segments: 6,
      triggerType: "time",
      daysPerTick: 10,
      consequences: [
        { description: "Stronghold completed", type: "spawn" },
        { description: "Region becomes defensible", type: "state_change" },
      ],
    },
    {
      name: "Campaign",
      description: "Preparing for war",
      segments: 8,
      triggerType: "event",
      events: ["enemy_provocation", "border_incident", "orders_received"],
      consequences: [
        { description: "Military campaign begins", type: "event" },
        { description: "Territory invaded", type: "state_change" },
      ],
    },
  ],
  arcane: [
    {
      name: "Forbidden Research",
      description: "Unlocking dangerous secrets",
      segments: 6,
      triggerType: "event",
      events: ["artifact_found", "tome_deciphered", "experiment_success"],
      consequences: [
        { description: "Breakthrough achieved", type: "event" },
        { description: "New magic unleashed", type: "spawn" },
      ],
    },
    {
      name: "Portal Opening",
      description: "Creating a gateway to another realm",
      segments: 8,
      triggerType: "event",
      events: ["celestial_alignment", "sacrifice_made", "runes_activated"],
      consequences: [
        { description: "Portal opens", type: "spawn" },
        { description: "Extraplanar creatures arrive", type: "spawn" },
      ],
    },
  ],
  tribal: [
    {
      name: "Clan Gathering",
      description: "Uniting the scattered tribes",
      segments: 6,
      triggerType: "time",
      daysPerTick: 14,
      consequences: [
        { description: "United tribal confederation", type: "state_change" },
        { description: "Powerful alliance formed", type: "event" },
      ],
    },
    {
      name: "Migration",
      description: "Moving to new lands",
      segments: 4,
      triggerType: "time",
      daysPerTick: 7,
      consequences: [
        { description: "Tribe settles new territory", type: "state_change" },
        { description: "Old lands abandoned", type: "destroy" },
      ],
    },
  ],
  monstrous: [
    {
      name: "Spawning Cycle",
      description: "Breeding more creatures",
      segments: 4,
      triggerType: "time",
      daysPerTick: 5,
      consequences: [
        { description: "Population explosion", type: "spawn" },
        { description: "Monster raids increase", type: "event" },
      ],
    },
    {
      name: "Corruption Spread",
      description: "Blighting the land",
      segments: 8,
      triggerType: "time",
      daysPerTick: 7,
      consequences: [
        { description: "Land becomes corrupted", type: "state_change" },
        { description: "Wildlife transforms", type: "spawn" },
      ],
    },
  ],
  secret: [
    {
      name: "The Grand Design",
      description: "Executing a mysterious master plan",
      segments: 10,
      triggerType: "time",
      daysPerTick: 14,
      consequences: [
        { description: "Unknown catastrophe", type: "event" },
        { description: "Reality-altering event", type: "state_change" },
      ],
    },
    {
      name: "Infiltration Complete",
      description: "Placing agents in positions of power",
      segments: 6,
      triggerType: "time",
      daysPerTick: 7,
      consequences: [
        { description: "Key positions compromised", type: "state_change" },
        { description: "Secret control established", type: "event" },
      ],
    },
  ],
};

// Generic fallback templates
const GENERIC_TEMPLATES: ClockTemplate[] = [
  {
    name: "Rising Tension",
    description: "Conflict brewing in the region",
    segments: 6,
    triggerType: "time",
    daysPerTick: 7,
    consequences: [
      { description: "Open conflict erupts", type: "event" },
      { description: "Regional instability", type: "state_change" },
    ],
  },
  {
    name: "Resource Depletion",
    description: "Critical supplies running low",
    segments: 4,
    triggerType: "time",
    daysPerTick: 5,
    consequences: [
      { description: "Scarcity crisis", type: "event" },
      { description: "Prices spike, rationing begins", type: "state_change" },
    ],
  },
];

export interface ClockGeneratorOptions {
  seed: string;
  faction: Faction;
}

/**
 * Generate a clock for a faction based on their archetype and goals.
 */
export function generateFactionClock(options: ClockGeneratorOptions): Clock {
  const { seed, faction } = options;
  const rng = new SeededRandom(`${seed}-clock-${faction.id}`);

  // Get templates for this faction's archetype
  const templates = CLOCK_TEMPLATES[faction.archetype] ?? GENERIC_TEMPLATES;
  const template = rng.pick(templates);

  // Build the trigger
  const trigger: ClockTrigger = template.triggerType === "time"
    ? { type: "time", daysPerTick: template.daysPerTick ?? 7 }
    : { type: "event", events: template.events ?? [] };

  return {
    id: `clock-${nanoid(8)}`,
    name: `${faction.name}: ${template.name}`,
    description: `${faction.name} is ${template.description.toLowerCase()}`,
    segments: template.segments,
    filled: 0,
    ownerId: faction.id,
    ownerType: "faction",
    trigger,
    consequences: template.consequences,
    visible: rng.chance(0.7), // 70% chance clock is visible to players
    paused: false,
  };
}

export interface WorldClockOptions {
  seed: string;
  name: string;
  description: string;
  segments?: number;
  daysPerTick?: number;
}

/**
 * Generate a world-level clock (not tied to a specific faction).
 */
export function generateWorldClock(options: WorldClockOptions): Clock {
  const { seed, name, description, segments = 6, daysPerTick = 7 } = options;

  return {
    id: `clock-${nanoid(8)}`,
    name,
    description,
    segments,
    filled: 0,
    ownerType: "world",
    trigger: { type: "time", daysPerTick },
    consequences: [
      { description: "Major world event occurs", type: "event" },
    ],
    visible: true,
    paused: false,
  };
}

/**
 * Advance a clock by filling segments.
 * Returns true if the clock completed.
 */
export function advanceClock(clock: Clock, segments: number = 1): boolean {
  if (clock.paused || clock.completedAt !== undefined) {
    return false;
  }

  clock.filled = Math.min(clock.filled + segments, clock.segments);

  if (clock.filled >= clock.segments) {
    clock.completedAt = Date.now();
    return true;
  }

  return false;
}

/**
 * Check if a time-based clock should advance based on days passed.
 * Returns the number of segments to add.
 */
export function checkClockTriggers(clock: Clock, daysPassed: number): number {
  if (clock.trigger.type !== "time" || clock.paused) {
    return 0;
  }

  return Math.floor(daysPassed / clock.trigger.daysPerTick);
}
