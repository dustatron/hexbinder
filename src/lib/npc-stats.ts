import type { CreatureArchetype } from "~/models";
import { getMonster, type Monster } from "./monsters";

/**
 * Maps NPC archetypes to their corresponding Shadowdark monster statblocks.
 */
const ARCHETYPE_TO_MONSTER: Record<CreatureArchetype, string> = {
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
};

/**
 * Get the monster statblock for an NPC archetype.
 * Falls back to Commoner if the mapped monster is not found.
 */
export function getMonsterForArchetype(archetype: CreatureArchetype): Monster {
  const monsterName = ARCHETYPE_TO_MONSTER[archetype];
  return getMonster(monsterName) ?? getMonster("Commoner")!;
}

/**
 * Parse the primary attack from a monster's attacks string.
 * Format: "2 claws (+3) 1d6, 1 bite (+5) 1d10" -> "2 claws (+3) 1d6"
 */
export function getPrimaryAttack(attacks: string): string {
  return attacks.split(",")[0]?.trim() ?? attacks;
}
