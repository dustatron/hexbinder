import type { CreatureArchetype, Ruleset } from "~/models";
import { getMonster, type Monster } from "./monsters";
import { getCairnMonster, type CairnMonster } from "./cairn-monsters";

/**
 * Maps NPC archetypes to their corresponding Shadowdark monster statblocks.
 */
const ARCHETYPE_TO_SHADOWDARK: Record<CreatureArchetype, string> = {
  bandit: "Bandit",
  guard: "Guard",
  knight: "Knight",
  assassin: "Assassin",
  priest: "Priest",
  thief: "Thief",
  cultist: "Cultist",
  witch: "Mage",
  noble: "Knight",
  commoner: "Commoner",
  merchant: "Commoner",
  scholar: "Commoner",
  ranger: "Knight",
  explorer: "Bandit",
  artisan: "Commoner",
  diplomat: "Commoner",
  shaman: "Mage",
  swordmaster: "Knight",
  courier: "Guard",
  pirate: "Bandit",
  spirit_bonded: "Mage",
};

/**
 * Maps NPC archetypes to their corresponding Cairn monster titles.
 */
const ARCHETYPE_TO_CAIRN: Record<CreatureArchetype, string> = {
  bandit: "Bandit",
  guard: "Guard",
  knight: "Knight",
  assassin: "Assassin",
  priest: "Acolyte",
  thief: "Thief",
  cultist: "Acolyte",
  witch: "Wood Witch",
  noble: "Knight",
  commoner: "Commoner",
  merchant: "Commoner",
  scholar: "Commoner",
  ranger: "Knight",
  explorer: "Bandit",
  artisan: "Commoner",
  diplomat: "Commoner",
  shaman: "Wood Witch",
  swordmaster: "Knight",
  courier: "Guard",
  pirate: "Bandit",
  spirit_bonded: "Wood Witch",
};

/**
 * Get the Shadowdark monster statblock for an NPC archetype.
 * Falls back to Commoner if the mapped monster is not found.
 */
export function getMonsterForArchetype(archetype: CreatureArchetype): Monster {
  const monsterName = ARCHETYPE_TO_SHADOWDARK[archetype];
  return getMonster(monsterName) ?? getMonster("Commoner")!;
}

/**
 * Get the Cairn monster for an NPC archetype.
 * Falls back to Commoner if the mapped monster is not found.
 */
export function getCairnMonsterForArchetype(archetype: CreatureArchetype): CairnMonster | undefined {
  const monsterTitle = ARCHETYPE_TO_CAIRN[archetype];
  return getCairnMonster(monsterTitle) ?? getCairnMonster("Commoner");
}

/**
 * Unified NPC stats for display, works with both rule systems.
 */
export interface NPCStats {
  hp: number;
  defense: number;
  defenseLabel: string;
  level?: number; // Shadowdark only
  attack: string;
  abilities?: {
    STR: number;
    DEX: number;
    WIL?: number; // Cairn
    CON?: number; // Shadowdark
    INT?: number; // Shadowdark
    WIS?: number; // Shadowdark
    CHA?: number; // Shadowdark
  };
}

/**
 * Get NPC stats for the given archetype and ruleset.
 */
export function getNPCStats(archetype: CreatureArchetype, ruleset: Ruleset): NPCStats {
  if (ruleset === "shadowdark") {
    const monster = getMonsterForArchetype(archetype);
    return {
      hp: monster.hit_points,
      defense: monster.armor_class,
      defenseLabel: "AC",
      level: monster.level,
      attack: getPrimaryAttack(monster.attacks),
      abilities: {
        STR: monster.strength,
        DEX: monster.dexterity,
        CON: monster.constitution,
        INT: monster.intelligence,
        WIS: monster.wisdom,
        CHA: monster.charisma,
      },
    };
  }

  // Cairn
  const monster = getCairnMonsterForArchetype(archetype);
  if (monster) {
    return {
      hp: monster.stats.hp,
      defense: monster.stats.armor,
      defenseLabel: "Armor",
      attack: monster.stats.attack,
      abilities: {
        STR: monster.stats.str,
        DEX: monster.stats.dex,
        WIL: monster.stats.wil,
      },
    };
  }

  // Fallback for Cairn if no monster found
  return {
    hp: 4,
    defense: 0,
    defenseLabel: "Armor",
    attack: "dagger (d6)",
    abilities: {
      STR: 10,
      DEX: 10,
      WIL: 10,
    },
  };
}

/**
 * Parse the primary attack from a monster's attacks string.
 * Format: "2 claws (+3) 1d6, 1 bite (+5) 1d10" -> "2 claws (+3) 1d6"
 */
export function getPrimaryAttack(attacks: string): string {
  return attacks.split(",")[0]?.trim() ?? attacks;
}
