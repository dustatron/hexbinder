import monstersData from "../../shadowdark-reference/monsters.json";

export interface MonsterTrait {
  name: string;
  description: string;
}

export interface Monster {
  name: string;
  slug: string;
  description: string;
  armor_class: number;
  armor_type: string | null;
  hit_points: number;
  attacks: string;
  movement: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  alignment: "L" | "N" | "C";
  level: number;
  traits: MonsterTrait[];
}

const monsters = monstersData as Monster[];

const monstersByName = new Map<string, Monster>(
  monsters.map((m) => [m.name.toLowerCase(), m])
);

const monstersByLevel = new Map<number, Monster[]>();
for (const monster of monsters) {
  const list = monstersByLevel.get(monster.level) ?? [];
  list.push(monster);
  monstersByLevel.set(monster.level, list);
}

export function getMonster(name: string): Monster | undefined {
  return monstersByName.get(name.toLowerCase());
}

export function getMonstersByLevel(level: number): Monster[] {
  return monstersByLevel.get(level) ?? [];
}

export function getRandomMonster(rng?: { pick: <T>(arr: T[]) => T }): Monster {
  if (rng) {
    return rng.pick(monsters);
  }
  return monsters[Math.floor(Math.random() * monsters.length)];
}

export { monsters };
