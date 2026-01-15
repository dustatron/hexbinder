import type { CreatureArchetype } from "~/models";
import { getMonsterForArchetype, getPrimaryAttack } from "~/lib/npc-stats";

interface NPCStatLineProps {
  archetype: CreatureArchetype;
}

/**
 * Displays a compact one-line stat block for an NPC based on their archetype.
 * Format: AC 15 | HP 4 | LV 1 | spear +1 (1d6)
 */
export function NPCStatLine({ archetype }: NPCStatLineProps) {
  const monster = getMonsterForArchetype(archetype);
  const primaryAttack = getPrimaryAttack(monster.attacks);

  return (
    <p className="text-xs text-stone-500">
      AC {monster.armor_class} | HP {monster.hit_points} | LV {monster.level} |{" "}
      {primaryAttack}
    </p>
  );
}
