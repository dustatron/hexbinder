/**
 * DungeonNPCGenerator - Places NPCs in dungeons.
 * Includes rival adventuring parties, prisoners, hermits, ghosts, and refugees.
 */

import { nanoid } from "nanoid";
import type {
  DungeonTheme,
  SpatialRoom,
  DungeonNPC,
  DungeonNPCCategory,
  NPC,
  Hook,
} from "~/models";
import { SeededRandom } from "../SeededRandom";

// NPC spawn chances
const RIVAL_PARTY_CHANCE = 0.20; // 20% chance of rival adventurers
const HERMIT_CHANCE = 0.10; // 10% chance of hermit/refugee
const GHOST_CHANCE = 0.15; // 15% chance of ghost in appropriate themes

// Themes where ghosts are appropriate
const GHOST_THEMES: DungeonTheme[] = [
  "tomb",
  "crypt",
  "temple",
  "fortress",
  "shrine",
  "cultist_lair",
];

// Themes where hermits might live
const HERMIT_THEMES: DungeonTheme[] = [
  "cave",
  "mine",
  "sewer",
  "witch_hut",
  "sea_cave",
];

// Adventurer name pools
const ADVENTURER_FIRST_NAMES = [
  "Aldric", "Bran", "Celia", "Dorn", "Elena", "Finn",
  "Greta", "Harald", "Iris", "Jax", "Kira", "Leon",
  "Mira", "Nox", "Orin", "Petra", "Quinn", "Raven",
  "Sable", "Theron", "Una", "Vex", "Wren", "Xara", "Yuri", "Zara",
];

const ADVENTURER_EPITHETS = [
  "the Bold", "the Quick", "Shadowbane", "Ironhand",
  "the Wanderer", "Brightblade", "the Cunning", "Stormborn",
  "the Silent", "Fireheart", "the Lucky", "Doomseeker",
];

const ADVENTURER_CLASSES = [
  "Fighter", "Rogue", "Wizard", "Cleric", "Ranger", "Barbarian",
];

// Prisoner descriptions
const PRISONER_REASONS = [
  "captured while exploring",
  "held for ransom",
  "taken as a sacrifice",
  "imprisoned for trespassing",
  "kept as a hostage",
];

// Hermit types
const HERMIT_TYPES = [
  { type: "mad_scholar", info: "ancient lore about the dungeon" },
  { type: "escaped_prisoner", info: "the layout and dangers within" },
  { type: "monster_whisperer", info: "the creatures' weaknesses" },
  { type: "treasure_hunter", info: "the location of hidden valuables" },
  { type: "cult_defector", info: "the inhabitants' plans" },
];

// Ghost motivations
const GHOST_MOTIVATIONS = [
  "seeks revenge on their killer",
  "guards their former treasure",
  "warns explorers of danger",
  "relives their final moments",
  "searches for a lost love",
];

export class DungeonNPCGenerator {
  private rng: SeededRandom;
  private theme: DungeonTheme;

  constructor(theme: DungeonTheme, seed: string) {
    this.theme = theme;
    this.rng = new SeededRandom(`${seed}-dungeon-npcs`);
  }

  /**
   * Generate NPCs for a dungeon.
   */
  generateNPCs(
    rooms: SpatialRoom[],
    hooks: Hook[] = []
  ): DungeonNPC[] {
    const npcs: DungeonNPC[] = [];

    // First, place prisoners from rescue hooks
    const rescueHooks = hooks.filter((h) => h.type === "rescue");
    for (const hook of rescueHooks) {
      const prisoner = this.placePrisoner(rooms, hook);
      if (prisoner) {
        npcs.push(prisoner);
      }
    }

    // Maybe add rival party
    if (this.rng.chance(RIVAL_PARTY_CHANCE)) {
      const rivals = this.generateRivalParty(rooms);
      if (rivals) {
        npcs.push(rivals);
      }
    }

    // Maybe add hermit/refugee
    if (HERMIT_THEMES.includes(this.theme) && this.rng.chance(HERMIT_CHANCE)) {
      const hermit = this.generateHermit(rooms);
      if (hermit) {
        npcs.push(hermit);
      }
    }

    // Maybe add ghost
    if (GHOST_THEMES.includes(this.theme) && this.rng.chance(GHOST_CHANCE)) {
      const ghost = this.generateGhost(rooms);
      if (ghost) {
        npcs.push(ghost);
      }
    }

    return npcs;
  }

  /**
   * Place a prisoner from a rescue hook.
   */
  private placePrisoner(
    rooms: SpatialRoom[],
    hook: Hook
  ): DungeonNPC | null {
    // Find suitable room (prison, lair, or deep dead-end)
    const prisonRooms = rooms.filter(
      (r) =>
        r.type === "prison" ||
        r.themeRoomType === "prison_block" ||
        r.themeRoomType === "prisoner_hold" ||
        (r.isDeadEnd && r.depth >= 2)
    );

    if (prisonRooms.length === 0) {
      // Fallback to deepest room
      const deepest = rooms.reduce((best, r) =>
        r.depth > best.depth ? r : best
      );
      prisonRooms.push(deepest);
    }

    const room = this.rng.pick(prisonRooms);
    const reason = this.rng.pick(PRISONER_REASONS);

    return {
      npcId: hook.missingNpcId ?? `prisoner-${nanoid(8)}`,
      category: "prisoner",
      roomId: room.id,
      disposition: "friendly",
      wantsRescue: true,
      hasInfo: `Knows about the dungeon from being ${reason}.`,
    };
  }

  /**
   * Generate a rival adventuring party.
   */
  private generateRivalParty(rooms: SpatialRoom[]): DungeonNPC | null {
    // Place near entrance or mid-dungeon
    const candidateRooms = rooms.filter((r) => r.depth <= 2);
    if (candidateRooms.length === 0) return null;

    const room = this.rng.pick(candidateRooms);
    const partySize = this.rng.between(2, 4);

    // Generate leader name
    const firstName = this.rng.pick(ADVENTURER_FIRST_NAMES);
    const epithet = this.rng.pick(ADVENTURER_EPITHETS);
    const leaderClass = this.rng.pick(ADVENTURER_CLASSES);

    // Determine disposition
    const dispositionRoll = this.rng.next();
    let disposition: "hostile" | "neutral" | "friendly";
    if (dispositionRoll < 0.3) {
      disposition = "hostile"; // 30% hostile
    } else if (dispositionRoll < 0.7) {
      disposition = "neutral"; // 40% neutral
    } else {
      disposition = "friendly"; // 30% friendly
    }

    return {
      npcId: `rival-party-${nanoid(8)}`,
      category: "rival_party",
      roomId: room.id,
      disposition,
      partySize,
      hasInfo: `${firstName} ${epithet}, a ${leaderClass}, leads a party of ${partySize}. They seek treasure and glory.`,
    };
  }

  /**
   * Generate a hermit or refugee NPC.
   */
  private generateHermit(rooms: SpatialRoom[]): DungeonNPC | null {
    // Place in dead-end or hidden area
    const candidateRooms = rooms.filter(
      (r) => r.isDeadEnd || r.themeRoomType === "collapsed_section"
    );
    if (candidateRooms.length === 0) {
      // Fallback to any room not near entrance
      const deepRooms = rooms.filter((r) => r.depth >= 2);
      if (deepRooms.length === 0) return null;
      candidateRooms.push(...deepRooms);
    }

    const room = this.rng.pick(candidateRooms);
    const hermitType = this.rng.pick(HERMIT_TYPES);

    // Hermits are usually friendly or neutral
    const disposition = this.rng.chance(0.7) ? "friendly" : "neutral";

    return {
      npcId: `hermit-${nanoid(8)}`,
      category: "hermit",
      roomId: room.id,
      disposition,
      hasInfo: `A ${hermitType.type.replace("_", " ")} who knows ${hermitType.info}.`,
    };
  }

  /**
   * Generate a ghost NPC.
   */
  private generateGhost(rooms: SpatialRoom[]): DungeonNPC | null {
    // Place in thematic rooms
    const candidateRooms = rooms.filter(
      (r) =>
        r.themeRoomType === "sarcophagus_chamber" ||
        r.themeRoomType === "burial_niches" ||
        r.themeRoomType === "throne_room" ||
        r.themeRoomType === "altar_room" ||
        r.isDeadEnd
    );

    if (candidateRooms.length === 0) {
      candidateRooms.push(...rooms.filter((r) => r.depth >= 2));
    }

    if (candidateRooms.length === 0) return null;

    const room = this.rng.pick(candidateRooms);
    const motivation = this.rng.pick(GHOST_MOTIVATIONS);

    // Ghosts can be any disposition
    const dispositionRoll = this.rng.next();
    let disposition: "hostile" | "neutral" | "friendly";
    if (dispositionRoll < 0.4) {
      disposition = "hostile";
    } else if (dispositionRoll < 0.7) {
      disposition = "neutral";
    } else {
      disposition = "friendly";
    }

    return {
      npcId: `ghost-${nanoid(8)}`,
      category: "ghost",
      roomId: room.id,
      disposition,
      hasInfo: `A restless spirit that ${motivation}.`,
    };
  }
}

/**
 * Generate dungeon NPCs for a dungeon.
 */
export function generateDungeonNPCs(
  theme: DungeonTheme,
  rooms: SpatialRoom[],
  hooks: Hook[],
  seed: string
): DungeonNPC[] {
  const generator = new DungeonNPCGenerator(theme, seed);
  return generator.generateNPCs(rooms, hooks);
}
