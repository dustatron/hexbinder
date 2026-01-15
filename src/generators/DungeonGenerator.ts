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
  TerrainType,
  Encounter,
  TreasureEntry,
  SpatialDungeon,
  SpatialRoom,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";
import { DungeonLayoutGenerator } from "./DungeonLayoutEngine";

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
  shrine: ["Shrine", "Sanctum", "Fane", "Holy Place", "Sacred Grove"],
  // Wilderness lair themes
  bandit_hideout: ["Hideout", "Camp", "Stronghold", "Outpost", "Den"],
  cultist_lair: ["Sanctum", "Temple", "Lair", "Altar", "Chamber"],
  witch_hut: ["Hut", "Cottage", "Hovel", "Dwelling", "Sanctum"],
  sea_cave: ["Grotto", "Cove", "Cavern", "Hideaway", "Lair"],
  beast_den: ["Den", "Lair", "Nest", "Warren", "Cave"],
  floating_keep: ["Keep", "Citadel", "Tower", "Fortress", "Spire"],
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
  shrine: 10,
  // Wilderness themes have 0 weight - selected separately by placeWildernessLair
  bandit_hideout: 0,
  cultist_lair: 0,
  witch_hut: 0,
  sea_cave: 0,
  beast_den: 0,
  floating_keep: 0,
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
 * Find a suitable hex and place a dungeon with spatial layout.
 * Returns the dungeon and updates the hex with locationId.
 */
export function placeDungeon(options: DungeonPlacementOptions): {
  dungeon: SpatialDungeon;
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
  const dungeon = generateSpatialDungeon(seed, hex.coord, theme, size);

  // Update hex with location ID
  hex.locationId = dungeon.id;

  return { dungeon, hex };
}

// === Wilderness Lair Themes ===

const WILDERNESS_THEMES: DungeonTheme[] = [
  "bandit_hideout",
  "cultist_lair",
  "witch_hut",
  "sea_cave",
  "beast_den",
  "floating_keep",
];

const WILDERNESS_TERRAIN_PREFS: Record<DungeonTheme, TerrainType[]> = {
  bandit_hideout: ["forest", "hills"],
  cultist_lair: ["swamp", "hills", "mountains"],
  witch_hut: ["swamp", "forest"],
  sea_cave: ["water"],
  beast_den: ["forest", "hills", "mountains"],
  floating_keep: ["plains", "hills", "mountains"],
  // Regular themes (not wilderness, but needed for type completeness)
  tomb: ["hills"],
  cave: ["hills", "mountains"],
  temple: ["hills", "forest"],
  mine: ["hills", "mountains"],
  fortress: ["hills"],
  sewer: ["plains"],
  crypt: ["hills"],
  lair: ["forest", "hills"],
};

export interface WildernessLairOptions {
  seed: string;
  hexes: Hex[];
}

/**
 * Place a wilderness lair (mini-dungeon) with terrain-appropriate theme.
 * These are smaller sites like bandit camps, cultist lairs, witch huts.
 */
export function placeWildernessLair(options: WildernessLairOptions): {
  dungeon: SpatialDungeon;
  hex: Hex;
} | null {
  const { seed, hexes } = options;
  const rng = new SeededRandom(`${seed}-wilderness-lair`);

  // Pick a random wilderness theme
  const theme = rng.pick(WILDERNESS_THEMES);
  const preferredTerrains = WILDERNESS_TERRAIN_PREFS[theme];

  // Find hexes matching terrain preference
  let candidates = hexes.filter(
    (h) => preferredTerrains.includes(h.terrain) && !h.locationId
  );

  // For sea_cave, look for water-adjacent hexes instead
  if (theme === "sea_cave" && candidates.length === 0) {
    candidates = hexes.filter(
      (h) => !h.locationId && isAdjacentToWater(h, hexes)
    );
  }

  // Fallback to any non-water hex
  if (candidates.length === 0) {
    candidates = hexes.filter(
      (h) => h.terrain !== "water" && !h.locationId
    );
  }

  if (candidates.length === 0) return null;

  const hex = rng.pick(candidates);

  // Wilderness lairs are always small (3-5 rooms)
  const dungeon = generateSpatialDungeon(seed, hex.coord, theme, "lair");

  hex.locationId = dungeon.id;

  return { dungeon, hex };
}

/**
 * Check if a hex is adjacent to water terrain.
 */
function isAdjacentToWater(hex: Hex, allHexes: Hex[]): boolean {
  const { q, r } = hex.coord;
  const neighbors = [
    { q: q + 1, r: r },
    { q: q - 1, r: r },
    { q: q, r: r + 1 },
    { q: q, r: r - 1 },
    { q: q + 1, r: r - 1 },
    { q: q - 1, r: r + 1 },
  ];

  return neighbors.some((coord) =>
    allHexes.some(
      (h) => h.coord.q === coord.q && h.coord.r === coord.r && h.terrain === "water"
    )
  );
}

/**
 * Generate a spatial dungeon with layout, rooms, and passages.
 */
function generateSpatialDungeon(
  seed: string,
  coord: HexCoord,
  forcedTheme?: DungeonTheme,
  forcedSize?: DungeonSize
): SpatialDungeon {
  const rng = new SeededRandom(`${seed}-dungeon-gen`);
  const id = `dungeon-${nanoid(8)}`;
  const theme = forcedTheme ?? rng.pickWeighted(THEME_WEIGHTS);
  const size = forcedSize ?? rng.pickWeighted(SIZE_WEIGHTS);
  const name = generateDungeonName(rng, theme);
  const roomCount = getRoomCountForSize(rng, size);
  const depth = getDepthForSize(size);

  // Generate spatial layout
  const layoutGenerator = new DungeonLayoutGenerator(seed);
  const layout = layoutGenerator.generate(size, theme, roomCount, coord);

  // Add content (features, hazards, secrets) to each room
  const rooms = layout.rooms.map((room) => addRoomContent(rng, room));

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
    gridWidth: layout.gridWidth,
    gridHeight: layout.gridHeight,
    rooms,
    passages: layout.passages,
    entranceRoomId: rooms[0]?.id ?? "",
    cleared: false,
    linkedHookIds: [],
  };
}

/**
 * Add features, hazards, and secrets to a spatial room.
 */
function addRoomContent(rng: SeededRandom, room: SpatialRoom): SpatialRoom {
  const features: RoomFeature[] = [];
  const hazards: Hazard[] = [];
  const secrets: RoomSecret[] = [];

  // Add 0-2 features
  const featureCount = rng.between(0, 2);
  if (featureCount > 0) {
    features.push(...rng.sample(ROOM_FEATURES, featureCount));
  }

  // 20% chance of hazard (higher in trap rooms)
  const hazardChance = room.type === "trap_room" ? 0.8 : 0.2;
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
    ...room,
    features,
    hazards,
    secrets,
  };
}

// Legacy function kept for compatibility - wraps spatial generation
function generateDungeon(
  rng: SeededRandom,
  coord: HexCoord,
  forcedTheme?: DungeonTheme,
  forcedSize?: DungeonSize
): Dungeon {
  // Generate spatial dungeon and convert to legacy format
  const spatial = generateSpatialDungeon(
    rng.next().toString(),
    coord,
    forcedTheme,
    forcedSize
  );

  // Convert SpatialRooms to DungeonRooms (drop bounds)
  const rooms: DungeonRoom[] = spatial.rooms.map((sr) => ({
    id: sr.id,
    name: sr.name,
    description: sr.description,
    type: sr.type,
    size: sr.size,
    depth: sr.depth,
    encounters: sr.encounters,
    treasure: sr.treasure,
    features: sr.features,
    hazards: sr.hazards,
    secrets: sr.secrets,
    explored: sr.explored,
  }));

  // Convert Passages to RoomConnections (drop waypoints)
  const connections: RoomConnection[] = spatial.passages.map((p) => ({
    fromRoomId: p.fromRoomId,
    toRoomId: p.toRoomId,
    type: p.connectionType,
    locked: p.locked,
    hidden: p.hidden,
  }));

  return {
    id: spatial.id,
    name: spatial.name,
    type: "dungeon",
    description: spatial.description,
    hexCoord: coord,
    tags: spatial.tags,
    size: spatial.size,
    theme: spatial.theme,
    depth: spatial.depth,
    rooms,
    connections,
    entranceRoomId: spatial.entranceRoomId,
    cleared: spatial.cleared,
    linkedHookIds: spatial.linkedHookIds,
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

// Old generateRooms, generateRoom, getRoomName, generateConnections functions
// have been removed - spatial layout now handles room/passage generation.
