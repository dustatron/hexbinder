// Hexbinder TypeScript Models
// Based on hexcrawl-prd.md

// === Coordinates ===

export type HexCoord = {
  q: number;
  r: number;
};

// === Terrain ===

export type TerrainType =
  | "plains"
  | "forest"
  | "hills"
  | "mountains"
  | "water"
  | "swamp";

// === Hex ===

export interface Hex {
  coord: HexCoord;
  terrain: TerrainType;
  locationId?: string;
  // NEW: hex content layers
  feature?: HexFeature;
  encounter?: HexEncounter;
  questObject?: QuestObject;
  dwellingId?: string;
  description?: string; // terrain flavor text
}

// === Hex Feature (Landmarks) ===

export type FeatureType =
  | "standing_stones"
  | "abandoned_farm"
  | "caravan_camp"
  | "crossroads_shrine"
  | "hunters_camp"
  | "druid_grove"
  | "ancient_tree"
  | "ruined_tower"
  | "watchtower"
  | "mining_camp"
  | "hermit_cave"
  | "burial_mound"
  | "mountain_pass"
  | "eagle_nest"
  | "frozen_shrine"
  | "abandoned_mine"
  | "witch_hut"
  | "sunken_ruins"
  | "sacrificial_altar"
  | "wayshrine"
  | "traveler_camp"
  | "battlefield"
  | "monster_lair"
  // Water features
  | "shipwreck"
  | "reef"
  | "sea_shrine"
  | "whirlpool"
  | "lighthouse_ruins"
  | "drowned_village";

export interface HexFeature {
  id: string;
  type: FeatureType;
  name: string;
  description: string;
  interactive: boolean; // can be cleared/looted
  cleared?: boolean;
  encounter?: HexEncounter;
  treasure?: TreasureEntry[];
}

// === Hex Encounter ===

export interface HexEncounter {
  id: string;
  creature: string;
  count: number;
  behavior: "hostile" | "neutral" | "fleeing";
  probability: number; // 0-100, chance when entering hex
  treasure?: TreasureEntry;
  rumor?: string;
  defeated?: boolean;
}

// === Quest Object ===

export type QuestObjectType = "plant" | "mineral" | "artifact" | "remains";

export interface QuestObject {
  id: string;
  type: QuestObjectType;
  name: string;
  description: string;
  found: boolean;
  linkedHookId?: string;
}

// === Dwelling (Mini-Location) ===

export type DwellingType = "farmstead" | "cottage" | "hermitage" | "ranger_station" | "roadside_inn";

export interface Dwelling {
  id: string;
  type: DwellingType;
  hexCoord: HexCoord;
  name: string;
  description: string;
  npcIds: string[];
  hasQuest?: boolean;
}

// === Location (base) ===

export type LocationType = "settlement" | "dungeon" | "landmark" | "wilderness";

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  hexCoord: HexCoord;
  factionId?: string;
  tags: string[];
}

// === Settlement ===

export type SettlementSize = "thorpe" | "hamlet" | "village" | "town" | "city";
export type GovernmentType = "council" | "mayor" | "lord" | "elder" | "guild" | "theocracy";
export type EconomyType = "farming" | "trade" | "mining" | "fishing" | "crafting" | "logging";
export type SettlementMood = "prosperous" | "struggling" | "fearful" | "hostile" | "welcoming" | "secretive";
export type DefenseLevel = "none" | "militia" | "guards" | "walls" | "fortified";

export interface Settlement extends Location {
  type: "settlement";
  size: SettlementSize;
  population: number;
  governmentType: GovernmentType;
  economyBase: EconomyType[];
  mood: SettlementMood;
  trouble: string;
  quirk: string;
  sites: SettlementSite[];
  npcIds: string[];
  mayorNpcId?: string; // Reference to mayor/elder NPC
  isCapital?: boolean; // Regional seat of power
  rulerNpcId?: string; // King/Baron/Duke who rules from here
  rulerTitle?: RulerTitle; // What to call the ruler
  rumors: Rumor[];
  notices: Notice[];
  defenses: DefenseLevel;
}

// === Spatial Town Types ===

export interface TownPoint { x: number; y: number }
export interface TownPolygon { vertices: TownPoint[] }

export type WardType =
  | "market" | "residential" | "craftsmen" | "merchant"
  | "temple" | "tavern" | "castle" | "slum" | "park";

export interface TownWard {
  id: string;
  type: WardType;
  shape: TownPolygon;
  siteId?: string;
  buildings: TownBuilding[];
}

export interface TownBuilding {
  id: string;
  shape: TownPolygon;
  type: "house" | "shop" | "landmark" | "civic";
}

export interface TownWall {
  shape: TownPolygon;
  gates: TownPoint[];
  towers: TownPoint[];
}

export interface TownStreet {
  id: string;
  waypoints: TownPoint[];
  width: "main" | "side" | "alley";
}

export interface SpatialSettlement extends Settlement {
  center: TownPoint;
  radius: number;
  wards: TownWard[];
  wall?: TownWall;
  streets: TownStreet[];
  plaza?: TownPolygon;
}

export const WARD_COUNTS: Record<SettlementSize, number> = {
  thorpe: 3,
  hamlet: 5,
  village: 8,
  town: 15,
  city: 25,
};

export function isSpatialSettlement(s: Settlement): s is SpatialSettlement {
  return "wards" in s && Array.isArray((s as SpatialSettlement).wards);
}

// === Settlement Site ===

export type SiteType =
  | "tavern"
  | "inn"
  | "temple"
  | "blacksmith"
  | "general_store"
  | "market"
  | "guild_hall"
  | "noble_estate";

export interface SiteService {
  name: string;
  cost: string;
  description?: string;
}

export interface SettlementSite {
  id: string;
  name: string;
  type: SiteType;
  description: string;
  ownerId?: string;
  staffIds: string[];
  quirk?: string;
  secret?: string;
  services: SiteService[];
  rumorSource: boolean;
  noticeBoard: boolean;
}

// === Rumors & Notices ===

export interface Rumor {
  id: string;
  text: string;
  isTrue: boolean;
  source: string; // site name or NPC name
  linkedHookId?: string;
  targetLocationId?: string; // Where rumor points
  used?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  reward?: string;
  posterId?: string;
  noticeType: "bounty" | "job" | "warning" | "announcement" | "request";
  linkedHookId?: string;
  used?: boolean;
}

// === NPC ===

export type CreatureArchetype =
  | "commoner"
  | "bandit"
  | "guard"
  | "knight"
  | "assassin"
  | "witch"
  | "priest"
  | "noble"
  | "merchant"
  | "scholar"
  | "thief"
  | "cultist";

export type ThreatLevel = 1 | 2 | 3 | 4 | 5;

export type FactionRole = "leader" | "lieutenant" | "member" | "agent" | "informant";

export type NPCRole =
  | "mayor"
  | "elder"
  | "innkeeper"
  | "shopkeeper"
  | "blacksmith"
  | "priest"
  | "guard_captain"
  | "farmer"
  | "merchant"
  | "craftsman"
  | "healer"
  | "sage"
  | "beggar"
  | "criminal"
  | "noble"
  | "king"
  | "baron"
  | "duke"
  | "count";

export type RulerTitle = "king" | "baron" | "duke" | "count";

export type NPCRelationshipType =
  | "parent"
  | "child"
  | "sibling"
  | "spouse"
  | "friend"
  | "rival"
  | "enemy"
  | "employer"
  | "employee"
  | "former_lover";

export type NPCRelationshipSentiment =
  | "love"
  | "hate"
  | "fear"
  | "respect"
  | "resentment"
  | "indifferent";

export interface NPCRelationship {
  targetNpcId: string;
  type: NPCRelationshipType;
  sentiment: NPCRelationshipSentiment;
}

export interface NPCWant {
  hookId: string;
  personalStakes: string; // "my daughter", "my inheritance", "revenge"
}

export interface NPCFactionAspiration {
  factionId: string;
  task?: string; // "prove yourself", "bring us information"
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  archetype: CreatureArchetype;
  threatLevel: ThreatLevel;
  variants?: string[];
  factionId?: string;
  factionRole?: FactionRole;
  locationId?: string;
  siteId?: string;
  age?: number;
  role?: NPCRole;
  relationships: NPCRelationship[];
  flavorWant: string; // Background desire (flavor text)
  wants: NPCWant[]; // Actionable hook-linked wants
  factionAspiration?: NPCFactionAspiration;
  secret?: string;
  status: "alive" | "dead" | "missing" | "unknown" | "captured";
  tags: string[];
}

// === Faction ===

export type FactionArchetype =
  | "criminal"
  | "religious"
  | "political"
  | "mercantile"
  | "military"
  | "arcane"
  | "tribal"
  | "monstrous"
  | "secret";

export type FactionScale = "local" | "regional" | "major";

export type RelationshipType = "allied" | "friendly" | "neutral" | "rival" | "hostile" | "war";

export interface FactionGoal {
  description: string;
  progress: number; // 0-100
  clockId?: string;
}

export interface FactionRelationship {
  factionId: string;
  type: RelationshipType;
  reason?: string;
}

export type FactionType = "cult" | "militia" | "syndicate" | "guild" | "tribe";

export interface FactionLair {
  dungeonId?: string;
  hexCoord?: HexCoord;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  archetype: FactionArchetype;
  factionType: FactionType;
  purpose: string; // "conducting dark rituals", etc.
  lair?: FactionLair;
  scale: FactionScale;
  goals: FactionGoal[];
  methods: string[];
  resources: string[];
  relationships: FactionRelationship[];
  headquartersId?: string;
  territoryIds: string[];
  influenceIds: string[];
  leaderArchetype: CreatureArchetype;
  memberArchetype: CreatureArchetype;
  symbols: string[];
  rumors: string[];
  recruitmentHookIds: string[]; // Hook IDs for joining faction
  goalRumorIds: string[]; // Rumor IDs spreading faction activity
  status: "active" | "destroyed" | "disbanded" | "underground";
}

// === Clock ===

export type ClockTrigger =
  | { type: "time"; daysPerTick: number }
  | { type: "event"; events: string[] }
  | { type: "manual" };

export interface ClockConsequence {
  description: string;
  type: "event" | "state_change" | "spawn" | "destroy";
}

export interface Clock {
  id: string;
  name: string;
  description: string;
  segments: number;
  filled: number;
  ownerId?: string; // faction or NPC
  ownerType?: "faction" | "npc" | "world";
  trigger: ClockTrigger;
  consequences: ClockConsequence[];
  visible: boolean;
  paused: boolean;
  completedAt?: number;
}

// === Hook ===

export type HookStatus = "available" | "active" | "completed" | "failed" | "expired";

export type HookType =
  | "delivery" // Take X to NPC Y
  | "assassination" // Kill target NPC/creature
  | "theft" // Steal item from NPC
  | "rescue" // Save NPC from location
  | "retrieval" // Get item from location
  | "investigation" // Find out what happened
  | "escort" // Protect NPC traveling
  | "faction_task" // Task to join/help faction
  | "mystery" // Something happening (sheep dying, etc.)
  | "revenge" // Payback against NPC
  | "debt"; // Collect money from NPC

export interface Hook {
  id: string;
  type: HookType;
  rumor: string; // what players hear
  truth: string; // what's actually happening

  // Sources - who gives this hook
  sourceNpcId?: string;
  sourceSettlementId?: string;
  sourceFactionId?: string;

  // Targets
  targetNpcId?: string; // For delivery, kill, theft
  targetLocationId?: string; // Dungeon, settlement, wilderness
  targetFactionId?: string;
  targetItemId?: string; // For retrieval hooks

  // For rescue/missing person hooks
  missingNpcId?: string; // NPC placed at target location

  // Legacy fields for compatibility
  involvedNpcIds: string[];
  involvedLocationIds: string[];
  involvedFactionIds: string[];

  reward?: string;
  danger?: string;
  status: HookStatus;
  discoveredAt?: number;
  completedAt?: number;
}

// === Dungeon ===

export type DungeonSize = "lair" | "small" | "medium" | "large" | "megadungeon";
export type DungeonTheme =
  | "tomb"
  | "cave"
  | "temple"
  | "mine"
  | "fortress"
  | "sewer"
  | "crypt"
  | "lair"
  // Wilderness lair themes
  | "bandit_hideout"
  | "cultist_lair"
  | "witch_hut"
  | "sea_cave"
  | "beast_den"
  | "floating_keep";

export interface Dungeon extends Location {
  type: "dungeon";
  size: DungeonSize;
  theme: DungeonTheme;
  depth: number;
  rooms: DungeonRoom[];
  connections: RoomConnection[];
  entranceRoomId: string;
  bossEncounterId?: string;
  cleared: boolean;
  linkedHookIds: string[];
}

// === Dungeon Room ===

export type RoomType =
  | "entrance"
  | "corridor"
  | "chamber"
  | "shrine"
  | "treasury"
  | "prison"
  | "lair"
  | "trap_room"
  | "puzzle_room";

export type RoomSize = "cramped" | "small" | "medium" | "large" | "vast";

export interface RoomFeature {
  name: string;
  description: string;
  interactive: boolean;
}

export interface Hazard {
  name: string;
  description: string;
  damage?: string;
  save?: string;
  disarmed: boolean;
}

export interface RoomSecret {
  description: string;
  trigger: string; // how to find it
  reward?: string;
  discovered: boolean;
}

export interface DungeonRoom {
  id: string;
  name: string;
  description: string;
  type: RoomType;
  size: RoomSize;
  depth: number; // distance from entrance
  encounters: Encounter[];
  treasure: TreasureEntry[];
  features: RoomFeature[];
  hazards: Hazard[];
  secrets: RoomSecret[];
  explored: boolean;
}

export interface RoomConnection {
  fromRoomId: string;
  toRoomId: string;
  type: "door" | "archway" | "passage" | "stairs" | "ladder" | "secret";
  locked: boolean;
  hidden: boolean;
}

// === Spatial Dungeon Types (for map rendering) ===

/** Cell state in the occupancy grid */
export type CellState = "empty" | "room" | "passage" | "reserved" | "blocked";

/** 2D point in grid space (1 cell = 5ft) */
export interface GridPoint {
  x: number;
  y: number;
}

/** Rectangular bounds in grid space */
export interface GridRect {
  x: number; // top-left x
  y: number; // top-left y
  width: number; // cells wide
  height: number; // cells tall
}

/** Cardinal direction for room placement */
export type PlacementDirection = "n" | "s" | "e" | "w";

/** Room size to dimensions mapping (in 5ft cells) */
export const ROOM_DIMENSIONS: Record<
  RoomSize,
  { minW: number; maxW: number; minH: number; maxH: number }
> = {
  cramped: { minW: 2, maxW: 3, minH: 2, maxH: 3 },
  small: { minW: 3, maxW: 4, minH: 3, maxH: 4 },
  medium: { minW: 4, maxW: 6, minH: 4, maxH: 6 },
  large: { minW: 5, maxW: 8, minH: 5, maxH: 8 },
  vast: { minW: 6, maxW: 9, minH: 6, maxH: 9 },
};

/** Dungeon size to grid dimensions */
export const DUNGEON_GRID_SIZES: Record<DungeonSize, number> = {
  lair: 40,
  small: 60,
  medium: 80,
  large: 100,
  megadungeon: 150,
};

/** Spatial room with position and dimensions */
export interface SpatialRoom {
  id: string;
  name: string;
  description: string;
  type: RoomType;
  size: RoomSize;
  depth: number;
  // Spatial properties
  bounds: GridRect;
  // Content (same as DungeonRoom)
  encounters: Encounter[];
  treasure: TreasureEntry[];
  features: RoomFeature[];
  hazards: Hazard[];
  secrets: RoomSecret[];
  explored: boolean;
}

/** Passage between rooms with spatial path */
export interface Passage {
  id: string;
  fromRoomId: string;
  toRoomId: string;
  waypoints: GridPoint[]; // Path through grid
  connectionType: RoomConnection["type"];
  locked: boolean;
  hidden: boolean;
}

/** Dungeon with spatial layout for map rendering */
export interface SpatialDungeon extends Location {
  type: "dungeon";
  size: DungeonSize;
  theme: DungeonTheme;
  depth: number;
  // Spatial layout
  gridWidth: number;
  gridHeight: number;
  rooms: SpatialRoom[];
  passages: Passage[];
  entranceRoomId: string;
  bossEncounterId?: string;
  cleared: boolean;
  linkedHookIds: string[];
}

// === Encounter ===

export type EncounterBehavior = "hostile" | "neutral" | "negotiable" | "fleeing";

export interface Encounter {
  id: string;
  creatureType: string; // reference to monster data
  count: number;
  behavior: EncounterBehavior;
  notes?: string;
  defeated: boolean;
}

// === Treasure ===

export type TreasureType = "coins" | "gems" | "art" | "item" | "magic_item";

export interface TreasureEntry {
  id: string;
  type: TreasureType;
  name: string;
  value?: string;
  description?: string;
  magicItemId?: string; // if type is magic_item
  looted: boolean;
}

// === Magic Item ===

export type MagicItemRarity = "common" | "uncommon" | "rare" | "legendary";

export interface MagicItem {
  id: string;
  name: string;
  type: string; // weapon, armor, potion, etc.
  rarity: MagicItemRarity;
  description: string;
  effect: string;
  charges?: number;
  cursed: boolean;
}

// === Weather ===

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "overcast"
  | "rain_light"
  | "rain_heavy"
  | "storm"
  | "thunderstorm"
  | "fog"
  | "snow_light"
  | "snow_heavy"
  | "blizzard";

export type Temperature = "freezing" | "cold" | "cool" | "mild" | "warm" | "hot";

export type WindLevel = "calm" | "breeze" | "wind" | "gale";

export type Visibility = "clear" | "hazy" | "poor" | "none";

export interface WeatherState {
  condition: WeatherCondition;
  temperature: Temperature;
  wind: WindLevel;
  visibility?: Visibility;
  duration?: number; // days
}

// === Time ===

export type Season = "spring" | "summer" | "autumn" | "winter";

export type MoonPhase = "new" | "waxing" | "full" | "waning";

// === Day Events (Atlas) ===

export type DayEventType = "clock_tick" | "weather_change" | "rumor" | "encounter" | "arrival";

export interface DayEvent {
  id: string;
  type: DayEventType;
  description: string;
  linkedClockId?: string;
  linkedFactionId?: string;
  linkedLocationId?: string;
}

export interface DayRecord {
  day: number;
  weather: WeatherState;
  moonPhase: MoonPhase;
  events: DayEvent[];
}

// === World State ===

export interface WorldState {
  day: number;
  season: Season;
  year: number;
  weather: WeatherState;
  moonPhase: MoonPhase;
  calendar: DayRecord[]; // Pre-generated days (past + future)
  forecastEndDay: number; // Last day with generated events
}

// === Edge Types (for roads/rivers) ===

export type EdgeType = "road" | "river" | "trail" | "bridge";

export interface HexEdge {
  from: HexCoord;
  to: HexCoord;
  type: EdgeType;
}

// === World Data (main storage blob) ===

export interface WorldData {
  id: string;
  name: string;
  seed: string;
  createdAt: number;
  updatedAt: number;
  state: WorldState;
  hexes: Hex[];
  edges: HexEdge[];
  locations: Location[];
  dwellings: Dwelling[]; // NEW
  npcs: NPC[];
  factions: Faction[];
  hooks: Hook[];
  clocks: Clock[];
}

// === World Summary (for list view) ===

export interface WorldSummary {
  id: string;
  name: string;
  updatedAt: number;
}

// === Type Guards ===

export function isSettlement(location: Location): location is Settlement {
  return location.type === "settlement";
}

export function isDungeon(location: Location): location is Dungeon {
  return location.type === "dungeon";
}

export function isSpatialDungeon(location: Location): location is SpatialDungeon {
  return (
    location.type === "dungeon" &&
    "gridWidth" in location &&
    "passages" in location
  );
}
