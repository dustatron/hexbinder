/**
 * Unified Monster Stats Interface
 *
 * Provides a common interface for displaying monster stats
 * from different rule systems (Shadowdark, Cairn).
 */

import type { Ruleset } from "~/models";
import { getMonster, type Monster } from "./monsters";
import { getCairnMonster, type CairnMonster } from "./cairn-monsters";
import { toCanonicalName, getCairnTitle, slugToShadowdark, slugToCairn } from "./creature-ids";

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

  // True if stats are estimated (monster not found in database)
  isEstimate?: boolean;

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

/**
 * Get monster stats by creature slug (from encounter generator)
 *
 * This is used by ImprovedEncounterTable which uses creature slugs
 * like "giant-frog", "dire-wolf" instead of display names.
 *
 * @param slug - The creature slug (e.g., "giant-frog")
 * @param ruleset - The rule system to use
 * @returns MonsterStats or undefined if not found
 */
export function getMonsterStatsBySlug(
  slug: string,
  ruleset: Ruleset
): MonsterStats | undefined {
  if (ruleset === "shadowdark") {
    // Map slug to Shadowdark name
    const shadowdarkName = slugToShadowdark(slug);
    const monster = getMonster(shadowdarkName);
    return monster ? mapShadowdarkToStats(monster) : undefined;
  }

  // For Cairn, map slug to Cairn title
  const cairnTitle = slugToCairn(slug);
  if (cairnTitle) {
    const monster = getCairnMonster(cairnTitle);
    return monster ? mapCairnToStats(monster) : undefined;
  }

  // If no mapping, try direct lookup
  const monster = getCairnMonster(slug);
  return monster ? mapCairnToStats(monster) : undefined;
}

/**
 * Generate fallback stats based on creature level when monster data is unavailable
 * These are rough approximations to give the GM something to work with
 */
export function generateFallbackStats(
  name: string,
  level: number,
  ruleset: Ruleset
): MonsterStats {
  // Base stats scale with level
  const baseHP = level * 4 + 2; // 6 at L1, 10 at L2, 14 at L3, etc.
  const baseDefense = 10 + Math.floor(level / 2); // 10 at L1, 11 at L2-3, 12 at L4-5
  const baseDamage = Math.max(1, Math.floor(level / 2)) + 2; // d4 at L1, d6 at L2-3, d8 at L4-5

  const damageNotation = baseDamage <= 2 ? "1d4" : baseDamage <= 4 ? "1d6" : baseDamage <= 6 ? "1d8" : "1d10";

  if (ruleset === "shadowdark") {
    return {
      name,
      ruleset: "shadowdark",
      hp: baseHP,
      defense: baseDefense,
      defenseLabel: "AC",
      attack: `${damageNotation}`,
      description: "Stats not found in monster database. Using level-based estimates.",
      isEstimate: true,
      shadowdark: {
        level,
        alignment: "Neutral",
        movement: "Near",
        abilities: {
          STR: 10 + level,
          DEX: 10,
          CON: 10 + Math.floor(level / 2),
          INT: 8,
          WIS: 10,
          CHA: 8,
        },
        traits: [],
      },
    };
  }

  // Cairn fallback
  // Cap level at 10 for Cairn estimates
  const cappedLevel = Math.min(level, 10);

  // HP = level + 2
  const cairnHP = cappedLevel + 2;

  // Armor is rare in Cairn (63% of monsters have 0 armor)
  // Level 1-6: 0 armor, Level 7-9: 1 armor, Level 10: 2 armor
  let cairnArmor: number;
  if (cappedLevel <= 6) {
    cairnArmor = 0;
  } else if (cappedLevel <= 9) {
    cairnArmor = 1;
  } else {
    cairnArmor = 2;
  }

  // Cairn damage caps at d8 (most powerful standard weapon)
  // d6 for levels 1-4, d8 for levels 5+
  const cairnDamage = cappedLevel >= 5 ? "d8" : "d6";

  return {
    name,
    ruleset: "cairn",
    hp: cairnHP,
    defense: cairnArmor,
    defenseLabel: "Armor",
    attack: `attack (${cairnDamage})`,
    description: "Stats not found in monster database. Using level-based estimates.",
    isEstimate: true,
    cairn: {
      abilities: {
        STR: 10 + cappedLevel,
        DEX: 10,
        WIL: 10,
      },
      details: ["Stats not found in monster database."],
      environments: [],
    },
  };
}
