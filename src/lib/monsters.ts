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

// Map legacy/plural encounter names to Shadowdark monster names
const LEGACY_NAME_MAP: Record<string, string> = {
  wolves: "wolf",
  bandits: "bandit",
  merchants: "the wandering merchant",
  "wild horses": "horse",
  bears: "bear, brown",
  goblins: "goblin",
  deer: "elk",
  "wood elves": "elf",
  orcs: "orc",
  "giant eagles": "griffon",
  goats: "giant, goat",
  miners: "dwarf",
  ogres: "ogre",
  griffins: "griffon",
  dwarves: "dwarf",
  yetis: "giant, frost",
  lizardfolk: "lizardfolk",
  crocodiles: "crocodile",
  "will-o-wisps": "will-o'-wisp",
  hags: "hag, weald",
};

export function getMonster(name: string): Monster | undefined {
  const normalizedName = name.toLowerCase();
  // Try direct match first
  const direct = monstersByName.get(normalizedName);
  if (direct) return direct;
  // Try legacy name mapping
  const mappedName = LEGACY_NAME_MAP[normalizedName];
  if (mappedName) return monstersByName.get(mappedName);
  return undefined;
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
