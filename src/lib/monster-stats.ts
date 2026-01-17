/**
 * Unified Monster Stats Interface
 *
 * Provides a common interface for displaying monster stats
 * from different rule systems (Shadowdark, Cairn).
 */

import type { Ruleset } from "~/models";
import { getMonster, type Monster } from "./monsters";
import { getCairnMonster, type CairnMonster } from "./cairn-monsters";
import { toCanonicalName, getCairnTitle } from "./creature-ids";

// Shadowdark-specific stat display
export interface ShadowdarkStats {
  level: number;
  alignment: string;
  movement: string;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  traits: Array<{ name: string; description: string }>;
}

// Cairn-specific stat display
export interface CairnStats {
  abilities: {
    STR: number;
    DEX: number;
    WIL: number;
  };
  details: string[];
  environments: string[];
}

// Unified monster stats interface
export interface MonsterStats {
  name: string;
  ruleset: Ruleset;

  // Common display fields
  hp: number;
  defense: number;
  defenseLabel: string; // "AC" for Shadowdark, "Armor" for Cairn
  attack: string;
  description?: string;

  // System-specific fields (only one will be present)
  shadowdark?: ShadowdarkStats;
  cairn?: CairnStats;
}

/**
 * Map a Shadowdark monster to the unified MonsterStats interface
 */
function mapShadowdarkToStats(monster: Monster): MonsterStats {
  return {
    name: monster.name,
    ruleset: "shadowdark",
    hp: monster.hit_points,
    defense: monster.armor_class,
    defenseLabel: "AC",
    attack: monster.attacks,
    description: monster.description,
    shadowdark: {
      level: monster.level,
      alignment: monster.alignment === "L" ? "Lawful" : monster.alignment === "C" ? "Chaotic" : "Neutral",
      movement: monster.movement,
      abilities: {
        STR: monster.strength,
        DEX: monster.dexterity,
        CON: monster.constitution,
        INT: monster.intelligence,
        WIS: monster.wisdom,
        CHA: monster.charisma,
      },
      traits: monster.traits,
    },
  };
}

/**
 * Map a Cairn monster to the unified MonsterStats interface
 */
function mapCairnToStats(monster: CairnMonster): MonsterStats {
  // Strip HTML tags from details for clean display
  const cleanDetails = monster.details.map((d) =>
    d.replace(/<\/?[^>]+(>|$)/g, "")
  );

  return {
    name: monster.title,
    ruleset: "cairn",
    hp: monster.stats.hp,
    defense: monster.stats.armor,
    defenseLabel: "Armor",
    attack: monster.stats.attack,
    description: cleanDetails[0], // First detail is usually the description
    cairn: {
      abilities: {
        STR: monster.stats.str,
        DEX: monster.stats.dex,
        WIL: monster.stats.wil,
      },
      details: cleanDetails,
      environments: monster.environments,
    },
  };
}

/**
 * Get monster stats for a given creature name and ruleset
 *
 * This is the main entry point for monster lookup.
 * It handles:
 * - Legacy plural names ("wolves" -> "Wolf")
 * - Cross-system name mapping (Shadowdark "Bear, Brown" -> Cairn "Bear, Grizzly")
 * - Case-insensitive matching
 *
 * @param name - The creature name (any format)
 * @param ruleset - The rule system to use
 * @returns MonsterStats or undefined if not found
 */
export function getMonsterStats(
  name: string,
  ruleset: Ruleset
): MonsterStats | undefined {
  const canonical = toCanonicalName(name);

  if (ruleset === "shadowdark") {
    // For Shadowdark, use the existing monster lookup
    const monster = getMonster(name);
    return monster ? mapShadowdarkToStats(monster) : undefined;
  }

  // For Cairn, first try to map the name to a Cairn title
  const cairnTitle = getCairnTitle(name);

  if (cairnTitle) {
    const monster = getCairnMonster(cairnTitle);
    return monster ? mapCairnToStats(monster) : undefined;
  }

  // If no mapping exists, try direct lookup with canonical name
  const monster = getCairnMonster(canonical);
  return monster ? mapCairnToStats(monster) : undefined;
}

/**
 * Check if monster stats are available for a given creature and ruleset
 */
export function hasMonsterStats(name: string, ruleset: Ruleset): boolean {
  return getMonsterStats(name, ruleset) !== undefined;
}
