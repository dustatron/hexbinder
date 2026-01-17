import type { CreatureArchetype, Ruleset } from "~/models";
import { getNPCStats } from "~/lib/npc-stats";

interface NPCStatLineProps {
  archetype: CreatureArchetype;
  ruleset: Ruleset;
}

/**
 * Displays a compact one-line stat block for an NPC based on their archetype.
 * Shadowdark format: AC 15 | HP 4 | LV 1 | spear +1 (1d6)
 * Cairn format: Armor 1 | HP 4 | STR 10 DEX 12 WIL 8 | dagger (d6)
 */
export function NPCStatLine({ archetype, ruleset }: NPCStatLineProps) {
  const stats = getNPCStats(archetype, ruleset);

  if (ruleset === "cairn") {
    return (
      <p className="text-xs text-stone-500">
        {stats.defenseLabel} {stats.defense} | HP {stats.hp} |{" "}
        STR {stats.abilities?.STR} DEX {stats.abilities?.DEX} WIL {stats.abilities?.WIL} |{" "}
        {stats.attack}
      </p>
    );
  }

  return (
    <p className="text-xs text-stone-500">
      {stats.defenseLabel} {stats.defense} | HP {stats.hp} | LV {stats.level} |{" "}
      {stats.attack}
    </p>
  );
}
