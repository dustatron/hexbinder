import { nanoid } from "nanoid";
import type {
  Hook,
  HookStatus,
  Settlement,
  Dungeon,
  Faction,
  NPC,
} from "~/models";
import { SeededRandom } from "./SeededRandom";

// === Hook Templates ===

interface HookTemplate {
  rumor: string;
  truth: string;
  reward?: string;
  danger?: string;
}

const SETTLEMENT_HOOKS: HookTemplate[] = [
  {
    rumor: "People have been disappearing from the village at night",
    truth: "A group of slavers is kidnapping villagers",
    reward: "Gold and the villagers' gratitude",
    danger: "The slavers are well-armed and ruthless",
  },
  {
    rumor: "Strange lights have been seen in the old mill",
    truth: "A cult is performing rituals there",
    reward: "Whatever treasure the cult has gathered",
    danger: "The cult may have summoned something",
  },
  {
    rumor: "The local lord has been acting strangely",
    truth: "The lord has been replaced by a doppelganger",
    reward: "The grateful lord's favor and gold",
    danger: "The doppelganger has allies in the court",
  },
  {
    rumor: "Livestock have been found dead with strange marks",
    truth: "A vampire lurks in the nearby woods",
    reward: "Bounty from the village council",
    danger: "The vampire is ancient and powerful",
  },
  {
    rumor: "A merchant claims to have a map to ancient treasure",
    truth: "The map is real, but the merchant is a swindler who'll betray the party",
    reward: "Ancient treasure if they survive",
    danger: "The merchant works with bandits",
  },
];

const DUNGEON_HOOKS: HookTemplate[] = [
  {
    rumor: "An ancient evil stirs in the depths",
    truth: "A powerful demon is awakening",
    reward: "Legendary treasure and fame",
    danger: "The demon's minions guard the way",
  },
  {
    rumor: "A noble's heir was kidnapped and taken underground",
    truth: "Cultists plan to sacrifice the heir at the next full moon",
    reward: "Noble's eternal gratitude and gold",
    danger: "The cultists are fanatical",
  },
  {
    rumor: "A famous adventurer never returned from the dungeon",
    truth: "They found something terrible and were transformed",
    reward: "Their legendary equipment",
    danger: "They are now a powerful undead",
  },
  {
    rumor: "The dungeon holds the key to curing a plague",
    truth: "An ancient artifact within can cure any disease",
    reward: "The artifact and eternal gratitude",
    danger: "The artifact is guarded by deadly traps",
  },
];

const FACTION_HOOKS: HookTemplate[] = [
  {
    rumor: "{faction} is planning something big",
    truth: "{faction} is preparing to {goal}",
    reward: "Depending on which side you choose",
    danger: "{faction} has many enemies",
  },
  {
    rumor: "{faction} needs capable individuals for a special job",
    truth: "They want someone expendable for a dangerous mission",
    reward: "Good pay and faction standing",
    danger: "The mission is a suicide run",
  },
  {
    rumor: "Someone stole something important from {faction}",
    truth: "A rival faction has taken a powerful artifact",
    reward: "Faction favor and a share of the recovery",
    danger: "Both factions will be involved",
  },
];

const WILDERNESS_HOOKS: HookTemplate[] = [
  {
    rumor: "A dragon has been spotted in the mountains",
    truth: "A young dragon has claimed territory",
    reward: "Dragon's hoard",
    danger: "It's still a dragon",
  },
  {
    rumor: "Travelers on the road have been attacked by something huge",
    truth: "A troll has taken up residence under a bridge",
    reward: "Bounty and recovered goods",
    danger: "Trolls regenerate",
  },
  {
    rumor: "An ancient tomb has been uncovered by a landslide",
    truth: "The tomb contains a lich's phylactery",
    reward: "Ancient treasures",
    danger: "The lich will not be pleased",
  },
  {
    rumor: "Fey creatures have been spotted near the old woods",
    truth: "A portal to the Feywild has opened",
    reward: "Fey treasures and favors",
    danger: "Time passes differently there",
  },
];

export interface HookGeneratorOptions {
  seed: string;
  settlement?: Settlement;
  dungeon?: Dungeon;
  faction?: Faction;
  npcs?: NPC[];
}

/**
 * Generate adventure hooks.
 */
export function generateHook(options: HookGeneratorOptions): Hook {
  const { seed, settlement, dungeon, faction, npcs = [] } = options;
  const rng = new SeededRandom(`${seed}-hook`);

  let template: HookTemplate;
  const involvedLocationIds: string[] = [];
  const involvedFactionIds: string[] = [];
  const involvedNpcIds: string[] = [];

  // Choose template based on context
  if (dungeon) {
    template = rng.pick(DUNGEON_HOOKS);
    involvedLocationIds.push(dungeon.id);
  } else if (faction) {
    template = rng.pick(FACTION_HOOKS);
    involvedFactionIds.push(faction.id);
    // Fill in faction name
    template = {
      ...template,
      rumor: template.rumor.replace("{faction}", faction.name),
      truth: template.truth
        .replace("{faction}", faction.name)
        .replace("{goal}", faction.goals[0]?.description ?? "expand their influence"),
    };
  } else if (settlement) {
    template = rng.pick(SETTLEMENT_HOOKS);
    involvedLocationIds.push(settlement.id);
  } else {
    template = rng.pick(WILDERNESS_HOOKS);
  }

  // Add involved NPCs
  if (npcs.length > 0) {
    const npcCount = Math.min(rng.between(1, 2), npcs.length);
    const involvedNpcs = rng.sample(npcs, npcCount);
    involvedNpcIds.push(...involvedNpcs.map((n) => n.id));
  }

  return {
    id: `hook-${nanoid(8)}`,
    type: "mystery" as const, // Legacy hooks default to mystery type
    rumor: template.rumor,
    truth: template.truth,
    involvedNpcIds,
    involvedLocationIds,
    involvedFactionIds,
    reward: template.reward,
    danger: template.danger,
    status: "available",
  };
}

/**
 * Generate multiple hooks for a settlement.
 */
export function generateSettlementHooks(
  seed: string,
  settlement: Settlement,
  count: number = 2
): Hook[] {
  const rng = new SeededRandom(`${seed}-settlement-hooks-${settlement.id}`);
  const hooks: Hook[] = [];

  for (let i = 0; i < count; i++) {
    hooks.push(
      generateHook({
        seed: `${seed}-hook-${i}`,
        settlement,
      })
    );
  }

  return hooks;
}

/**
 * Generate a hook for a dungeon.
 */
export function generateDungeonHook(seed: string, dungeon: Dungeon): Hook {
  return generateHook({
    seed: `${seed}-dungeon-hook-${dungeon.id}`,
    dungeon,
  });
}

/**
 * Generate faction-related hooks.
 */
export function generateFactionHook(seed: string, faction: Faction): Hook {
  return generateHook({
    seed: `${seed}-faction-hook-${faction.id}`,
    faction,
  });
}

/**
 * Update hook status.
 */
export function updateHookStatus(hook: Hook, status: HookStatus): Hook {
  return {
    ...hook,
    status,
    discoveredAt: status === "active" && !hook.discoveredAt ? Date.now() : hook.discoveredAt,
    completedAt: (status === "completed" || status === "failed") ? Date.now() : hook.completedAt,
  };
}
