import { monsterListV2, type MonsterV2, type Stats } from "../../cairn-reference/monsters";

export type { MonsterV2 as CairnMonster, Stats as CairnStats };

// Build lookup map by title (lowercase for case-insensitive matching)
const monstersByTitle = new Map<string, MonsterV2>(
  monsterListV2.map((m) => [m.title.toLowerCase(), m])
);

/**
 * Get a Cairn monster by title (case-insensitive)
 */
export function getCairnMonster(title: string): MonsterV2 | undefined {
  return monstersByTitle.get(title.toLowerCase());
}

/**
 * Get all Cairn monsters
 */
export function getAllCairnMonsters(): MonsterV2[] {
  return monsterListV2;
}

/**
 * Get Cairn monsters by environment
 */
export function getCairnMonstersByEnvironment(environment: string): MonsterV2[] {
  const envLower = environment.toLowerCase();
  return monsterListV2.filter((m) =>
    m.environments.some((e) => e.toLowerCase().includes(envLower))
  );
}
