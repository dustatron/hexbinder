import { nanoid } from "nanoid";
import type {
  Dungeon,
  DungeonRoom,
  RoomConnection,
  RoomType,
  RoomSize,
  RoomFeature,
  Hazard,
  RoomSecret,
  Hex,
  HexCoord,
  DungeonSize,
  DungeonTheme,
  Encounter,
  TreasureEntry,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Name Tables ===

const DUNGEON_ADJECTIVES = [
  "Forsaken", "Sunken", "Ruined", "Shadowed", "Haunted", "Lost",
  "Ancient", "Cursed", "Hidden", "Forgotten", "Blighted", "Twisted",
];

const DUNGEON_NOUNS: Record<DungeonTheme, string[]> = {
  tomb: ["Tomb", "Mausoleum", "Crypt", "Barrow", "Sepulcher"],
  cave: ["Cavern", "Grotto", "Caves", "Chasm", "Depths"],
  temple: ["Temple", "Sanctuary", "Shrine", "Chapel", "Cathedral"],
  mine: ["Mines", "Quarry", "Pit", "Excavation", "Tunnels"],
  fortress: ["Fortress", "Keep", "Stronghold", "Bastion", "Citadel"],
  sewer: ["Sewers", "Undercity", "Drains", "Warrens", "Tunnels"],
  crypt: ["Crypt", "Ossuary", "Charnel House", "Vault", "Catacombs"],
  lair: ["Lair", "Den", "Nest", "Burrow", "Hideout"],
};

const ROOM_TYPE_WEIGHTS = createWeightedTable<RoomType>({
  entrance: 5,
  corridor: 25,
  chamber: 30,
  lair: 10,
  trap_room: 10,
  treasury: 5,
  shrine: 5,
  prison: 5,
  puzzle_room: 5,
});

const ROOM_SIZE_WEIGHTS = createWeightedTable<RoomSize>({
  cramped: 15,
  small: 35,
  medium: 30,
  large: 15,
  vast: 5,
});

const THEME_WEIGHTS = createWeightedTable<DungeonTheme>({
  tomb: 20,
  cave: 20,
  temple: 15,
  mine: 10,
  fortress: 10,
  sewer: 10,
  crypt: 10,
  lair: 5,
});

const SIZE_WEIGHTS = createWeightedTable<DungeonSize>({
  lair: 30,
  small: 35,
  medium: 25,
  large: 8,
  megadungeon: 2,
});

const ROOM_FEATURES: RoomFeature[] = [
  { name: "Broken Furniture", description: "Broken furniture scattered about", interactive: false },
  { name: "Ancient Altar", description: "An ancient stone altar", interactive: true },
  { name: "Faded Murals", description: "Faded murals on the walls", interactive: false },
  { name: "Bone Pile", description: "Piles of bones in the corners", interactive: true },
  { name: "Glowing Fungi", description: "Glowing fungi provide dim light", interactive: false },
  { name: "Unnatural Torches", description: "Torches burn with an unnatural flame", interactive: true },
  { name: "Stagnant Pool", description: "A pool of stagnant water", interactive: true },
  { name: "Dripping Ceiling", description: "Water drips from the ceiling", interactive: false },
  { name: "Rubble", description: "Rubble blocks part of the room", interactive: false },
  { name: "Collapsed Pillars", description: "Collapsed pillars", interactive: false },
];

const HAZARDS: Omit<Hazard, "disarmed">[] = [
  { name: "Pit Trap", description: "A concealed pit trap", damage: "2d6 fall", save: "DC 12 DEX" },
  { name: "Dart Trap", description: "Poison dart launchers in the walls", damage: "1d4 + poison", save: "DC 13 DEX" },
  { name: "Blade Trap", description: "Swinging blade trap", damage: "2d8 slashing", save: "DC 14 DEX" },
  { name: "Poison Gas", description: "Poison gas vents", damage: "2d6 poison", save: "DC 12 CON" },
  { name: "Collapsing Ceiling", description: "Unstable ceiling", damage: "3d6 bludgeoning", save: "DC 14 DEX" },
  { name: "Glyph of Warding", description: "A magical glyph on the floor", damage: "3d8 fire", save: "DC 15 DEX" },
];

const SECRETS: Omit<RoomSecret, "discovered">[] = [
  { description: "A secret door behind a tapestry", trigger: "Perception DC 14" },
  { description: "A concealed passage in the floor", trigger: "Investigation DC 15" },
  { description: "A hidden compartment in the wall", trigger: "Perception DC 12", reward: "50 gp" },
  { description: "A false bottom in a chest", trigger: "Investigation DC 13", reward: "gems" },
  { description: "A narrow crawlway hidden by rubble", trigger: "Perception DC 14" },
  { description: "A hidden lever opens a secret door", trigger: "Investigation DC 16" },
];

export interface DungeonPlacementOptions {
  seed: string;
  hexes: Hex[];
  theme?: DungeonTheme;
  size?: DungeonSize;
}

/**
 * Find a suitable hex and place a dungeon.
 * Returns the dungeon and updates the hex with locationId.
 */
export function placeDungeon(options: DungeonPlacementOptions): {
  dungeon: Dungeon;
  hex: Hex;
} | null {
  const { seed, hexes, theme, size } = options;
  const rng = new SeededRandom(`${seed}-dungeon`);

  // Find suitable hexes (hills/forest without locations)
  const candidates = hexes.filter(
    (h) => (h.terrain === "hills" || h.terrain === "forest") && !h.locationId
  );

  if (candidates.length === 0) {
    // Fallback to any non-water hex
    const fallback = hexes.filter(
      (h) => h.terrain !== "water" && !h.locationId
    );
    if (fallback.length === 0) return null;
    candidates.push(...fallback);
  }

  const hex = rng.pick(candidates);
  const dungeon = generateDungeon(rng, hex.coord, theme, size);

  // Update hex with location ID
  hex.locationId = dungeon.id;

  return { dungeon, hex };
}

function generateDungeon(
  rng: SeededRandom,
  coord: HexCoord,
  forcedTheme?: DungeonTheme,
  forcedSize?: DungeonSize
): Dungeon {
  const id = `dungeon-${nanoid(8)}`;
  const theme = forcedTheme ?? rng.pickWeighted(THEME_WEIGHTS);
  const size = forcedSize ?? rng.pickWeighted(SIZE_WEIGHTS);
  const name = generateDungeonName(rng, theme);
  const roomCount = getRoomCountForSize(rng, size);
  const depth = getDepthForSize(size);

  const rooms = generateRooms(rng, roomCount);
  const connections = generateConnections(rng, rooms);

  return {
    id,
    name,
    type: "dungeon",
    description: `${name}, a ${size} ${theme}.`,
    hexCoord: coord,
    tags: [size, theme],
    size,
    theme,
    depth,
    rooms,
    connections,
    entranceRoomId: rooms[0].id,
    cleared: false,
    linkedHookIds: [],
  };
}

function generateDungeonName(rng: SeededRandom, theme: DungeonTheme): string {
  const adj = rng.pick(DUNGEON_ADJECTIVES);
  const noun = rng.pick(DUNGEON_NOUNS[theme]);
  return `The ${adj} ${noun}`;
}

function getRoomCountForSize(rng: SeededRandom, size: DungeonSize): number {
  const ranges: Record<DungeonSize, [number, number]> = {
    lair: [3, 5],
    small: [5, 8],
    medium: [8, 12],
    large: [12, 20],
    megadungeon: [20, 30],
  };
  const [min, max] = ranges[size];
  return rng.between(min, max);
}

function getDepthForSize(size: DungeonSize): number {
  const depths: Record<DungeonSize, number> = {
    lair: 1,
    small: 1,
    medium: 2,
    large: 3,
    megadungeon: 5,
  };
  return depths[size];
}

function generateRooms(rng: SeededRandom, count: number): DungeonRoom[] {
  const rooms: DungeonRoom[] = [];

  for (let i = 0; i < count; i++) {
    const roomType = i === 0 ? "entrance" : rng.pickWeighted(ROOM_TYPE_WEIGHTS);
    const room = generateRoom(rng, `room-${i}`, roomType, i);
    rooms.push(room);
  }

  return rooms;
}

function generateRoom(
  rng: SeededRandom,
  id: string,
  roomType: RoomType,
  index: number
): DungeonRoom {
  const size = rng.pickWeighted(ROOM_SIZE_WEIGHTS);
  const features: RoomFeature[] = [];
  const hazards: Hazard[] = [];
  const secrets: RoomSecret[] = [];
  const encounters: Encounter[] = [];
  const treasure: TreasureEntry[] = [];

  // Add 0-2 features
  const featureCount = rng.between(0, 2);
  if (featureCount > 0) {
    features.push(...rng.sample(ROOM_FEATURES, featureCount));
  }

  // 20% chance of hazard (higher in trap rooms)
  const hazardChance = roomType === "trap_room" ? 0.8 : 0.2;
  if (rng.chance(hazardChance)) {
    const hazard = rng.pick(HAZARDS);
    hazards.push({ ...hazard, disarmed: false });
  }

  // 15% chance of secret
  if (rng.chance(0.15)) {
    const secret = rng.pick(SECRETS);
    secrets.push({ ...secret, discovered: false });
  }

  return {
    id,
    name: getRoomName(rng, roomType),
    description: `A ${size} ${roomType.replace("_", " ")}.`,
    type: roomType,
    size,
    depth: Math.floor(index / 3), // Approximate depth from entrance
    encounters,
    treasure,
    features,
    hazards,
    secrets,
    explored: false,
  };
}

function getRoomName(rng: SeededRandom, roomType: RoomType): string {
  const names: Record<RoomType, string[]> = {
    entrance: ["Entry Hall", "Gatehouse", "Antechamber", "Foyer"],
    corridor: ["Passage", "Hallway", "Gallery", "Tunnel"],
    chamber: ["Chamber", "Hall", "Room", "Vault"],
    lair: ["Lair", "Den", "Nest", "Burrow"],
    trap_room: ["Death Corridor", "Gauntlet", "Testing Ground"],
    treasury: ["Treasury", "Vault", "Hoard Room"],
    shrine: ["Shrine", "Chapel", "Altar Room", "Sanctuary"],
    prison: ["Dungeon Cells", "Oubliette", "Prison Block"],
    puzzle_room: ["Puzzle Chamber", "Trial Room", "Testing Grounds"],
  };
  return rng.pick(names[roomType]);
}

function generateConnections(
  rng: SeededRandom,
  rooms: DungeonRoom[]
): RoomConnection[] {
  const connections: RoomConnection[] = [];
  const connectionTypes: RoomConnection["type"][] = ["door", "door", "archway", "passage", "secret"];

  // Create a simple branching structure
  // Each room connects to 1-3 other rooms
  for (let i = 1; i < rooms.length; i++) {
    // Connect to a random earlier room (ensures connectivity)
    const targetIdx = rng.between(0, i - 1);
    connections.push({
      fromRoomId: rooms[targetIdx].id,
      toRoomId: rooms[i].id,
      type: rng.pick(connectionTypes),
      locked: rng.chance(0.15),
      hidden: false,
    });
  }

  // Add some extra connections for loops (30% of room count)
  const extraCount = Math.floor(rooms.length * 0.3);
  for (let i = 0; i < extraCount; i++) {
    const fromIdx = rng.between(0, rooms.length - 1);
    let toIdx = rng.between(0, rooms.length - 1);
    while (toIdx === fromIdx) {
      toIdx = rng.between(0, rooms.length - 1);
    }

    // Check if connection already exists
    const exists = connections.some(
      (c) =>
        (c.fromRoomId === rooms[fromIdx].id && c.toRoomId === rooms[toIdx].id) ||
        (c.fromRoomId === rooms[toIdx].id && c.toRoomId === rooms[fromIdx].id)
    );

    if (!exists) {
      connections.push({
        fromRoomId: rooms[fromIdx].id,
        toRoomId: rooms[toIdx].id,
        type: rng.pick(connectionTypes),
        locked: rng.chance(0.2),
        hidden: rng.chance(0.15),
      });
    }
  }

  return connections;
}
