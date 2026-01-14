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
  rumors: Rumor[];
  notices: Notice[];
  defenses: DefenseLevel;
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
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  reward?: string;
  posterId?: string;
  noticeType: "bounty" | "job" | "warning" | "announcement" | "request";
  linkedHookId?: string;
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
  wants: string;
  secret?: string;
  status: "alive" | "dead" | "missing" | "unknown";
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

export interface Faction {
  id: string;
  name: string;
  description: string;
  archetype: FactionArchetype;
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

export interface Hook {
  id: string;
  rumor: string; // what players hear
  truth: string; // what's actually happening
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
export type DungeonTheme = "tomb" | "cave" | "temple" | "mine" | "fortress" | "sewer" | "crypt" | "lair";

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

// === World State ===

export interface WorldState {
  day: number;
  season: Season;
  year: number;
  weather: WeatherState;
  moonPhase: MoonPhase;
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
