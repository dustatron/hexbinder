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
  // Improved encounter system overrides
  encounterOverrides?: EncounterOverrides;
  // Timestamp of last encounter generation
  lastEncounterTimestamp?: number;
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

// === Improved Encounter System ===

/** Master encounter table result (1d6) */
export type EncounterType =
  | "creature"
  | "sign"
  | "environment"
  | "loss"
  | "npc"
  | "area-effect";

/** Reaction roll result (1d10) - applies to creature and NPC encounters */
export type Reaction =
  | "hostile"
  | "wary"
  | "curious"
  | "friendly"
  | "helpful";

/** Override flags for manual encounter selections (index pointers, not data) */
export interface EncounterOverrides {
  masterIndex?: number;     // 0-5 for 1d6 result
  creatureIndex?: number;   // index in terrain creature list
  reactionIndex?: number;   // 0-4 for reaction result
  subTableIndex?: number;   // for sign/env/loss/area-effect sub-tables
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
export type SettlementType = "human" | "dwarven" | "elven" | "goblin";

export interface Settlement extends Location {
  type: "settlement";
  settlementType: SettlementType;
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
  siteId?: string;    // Link to SettlementSite
  npcIds?: string[];  // NPCs who live/work here
  name?: string;      // Display name for landmarks
  icon?: string;      // Emoji icon for map display
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

export type NPCRace =
  | "human"
  | "elf"
  | "dwarf"
  | "halfling"
  | "half-elf"
  | "half-orc"
  | "gnome"
  | "goblin";

export type NPCGender = "male" | "female";

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
  race: NPCRace;
  gender: NPCGender;
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

// === Faction Advantage (Cairn-inspired) ===

export type AdvantageType =
  | "wealth"        // Gold, treasure, trade income
  | "military"      // Soldiers, mercenaries, weapons
  | "influence"     // Political connections, noble favor
  | "knowledge"     // Secrets, lore, intelligence network
  | "magic"         // Spells, artifacts, magical allies
  | "territory"     // Land, fortresses, hidden bases
  | "alliance"      // Pacts with other factions or creatures
  | "artifact";     // Possession of a significant magic item

export interface FactionAdvantage {
  type: AdvantageType;
  name: string;
  description: string;
  magicItemId?: string; // If type is "artifact", links to the item
}

// === Faction Agenda Goal (Cairn-inspired progressive goals) ===

export type AgendaGoalStatus = "pending" | "in_progress" | "completed" | "failed";

export interface AgendaGoal {
  id: string;
  order: number;        // Sequence in the agenda (1-5)
  description: string;
  status: AgendaGoalStatus;
  targetType?: "item" | "location" | "npc" | "faction" | "territory";
  targetId?: string;    // What this goal targets (item to acquire, location to control, etc.)
  addressesObstacle?: boolean; // Does this goal address the faction's primary obstacle?
  agentId?: string;     // NPC assigned to this goal
  clockId?: string;     // Progress clock for this goal
}

// === Faction Obstacle (Cairn-inspired) ===

export type ObstacleType =
  | "rival_faction"     // Another faction blocks them
  | "missing_item"      // Need an artifact they don't have
  | "missing_knowledge" // Don't know location/method
  | "lack_of_resources" // Need money, troops, etc.
  | "powerful_enemy"    // Individual or creature opposes them
  | "internal_conflict" // Faction members disagree
  | "divine_opposition" // Gods or fate work against them
  | "geographic";       // Physical barrier (mountains, ocean, etc.)

export interface FactionObstacle {
  type: ObstacleType;
  description: string;
  targetId?: string;    // The faction/NPC/item that IS the obstacle
}

// === Legacy FactionGoal (deprecated, kept for compatibility) ===

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

  // === Cairn-inspired Agenda System ===
  advantages: FactionAdvantage[];      // What resources/power they have
  agenda: AgendaGoal[];                // 3-5 progressive goals toward objective
  obstacle: FactionObstacle;           // Primary thing blocking their agenda
  seneschalId?: string;                // NPC who is the "face" of the faction

  // === Legacy fields (kept for compatibility) ===
  goals: FactionGoal[];                // @deprecated - use agenda instead
  methods: string[];
  resources: string[];                 // @deprecated - use advantages instead

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
  | "shrine"
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
  | "exit"
  | "corridor"
  | "chamber"
  | "shrine"
  | "treasury"
  | "prison"
  | "lair"
  | "trap_room";

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
  // Ecology fields (optional for backwards compatibility)
  themeRoomType?: ThemeRoomType;
  geometry?: RoomGeometry;
  isDeadEnd?: boolean;
  activity?: CreatureActivity;
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
  // Ecology fields
  trap?: Hazard;
  keyId?: string; // key required to unlock
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
  // Ecology layer
  ecology?: DungeonEcology;
  wanderingMonsters?: WanderingMonsterTable;
  dungeonNPCs?: DungeonNPC[];
}

// === Dungeon Ecology System ===

/** Room geometry classification based on shape */
export type RoomGeometry = "corridor" | "chamber" | "gallery" | "alcove";

/** What creatures are doing in a room */
export type CreatureActivity =
  | "sleeping"
  | "eating"
  | "patrolling"
  | "guarding"
  | "worshipping"
  | "working"
  | "hiding"
  | "fighting"
  | "socializing";

/** Theme-specific room types - union of all themes */
export type ThemeRoomType =
  // Universal
  | "entrance"
  | "corridor"
  | "chamber"
  | "dead_end"
  // Tomb
  | "sarcophagus_chamber"
  | "embalming_room"
  | "burial_niches"
  | "offering_hall"
  | "priest_quarters"
  | "false_tomb"
  | "guardian_chamber"
  | "treasure_vault"
  // Cave
  | "mushroom_garden"
  | "underground_pool"
  | "bat_roost"
  | "crystal_grotto"
  | "natural_chimney"
  | "stalactite_hall"
  | "collapsed_section"
  | "creature_nest"
  // Temple
  | "nave"
  | "vestry"
  | "meditation_cells"
  | "altar_room"
  | "clergy_quarters"
  | "temple_library"
  | "reliquary"
  | "baptistery"
  // Mine
  | "ore_vein"
  | "cart_tracks"
  | "collapsed_tunnel"
  | "flooded_level"
  | "equipment_room"
  | "ore_processing"
  | "shaft_entrance"
  | "support_beams"
  // Fortress
  | "barracks"
  | "armory"
  | "war_room"
  | "prison_block"
  | "mess_hall"
  | "watchtower"
  | "throne_room"
  | "secret_escape"
  // Sewer
  | "junction"
  | "overflow_chamber"
  | "maintenance_access"
  | "rat_nest"
  | "smuggler_cache"
  | "toxic_pool"
  | "drain_grate"
  // Crypt
  | "ossuary"
  | "charnel_pit"
  | "memorial_hall"
  | "burial_alcoves"
  | "caretaker_quarters"
  | "sealed_vault"
  | "ritual_chamber"
  // Lair
  | "nest"
  | "feeding_area"
  | "bone_pile"
  | "sleeping_den"
  | "trophy_room"
  | "entrance_cave"
  // Shrine
  | "sacred_pool"
  | "meditation_garden"
  | "offering_altar"
  | "pilgrim_shelter"
  | "oracle_chamber"
  | "relic_display"
  // Bandit Hideout
  | "lookout_post"
  | "sleeping_quarters"
  | "loot_storage"
  | "planning_room"
  | "escape_tunnel"
  | "prisoner_hold"
  | "common_area"
  // Cultist Lair
  | "summoning_circle"
  | "sacrifice_altar"
  | "initiates_quarters"
  | "leaders_chamber"
  | "forbidden_library"
  | "ritual_pool"
  // Witch Hut
  | "potion_workshop"
  | "ingredient_storage"
  | "divination_room"
  | "sleeping_loft"
  | "garden_access"
  | "familiar_den"
  // Sea Cave
  | "tidal_pool"
  | "smuggler_dock"
  | "treasure_grotto"
  | "kelp_garden"
  | "shell_shrine"
  | "underwater_passage"
  // Beast Den
  | "primary_nest"
  | "feeding_ground"
  | "bone_yard"
  | "young_nursery"
  | "territorial_marker"
  | "water_source"
  // Floating Keep
  | "observation_deck"
  | "arcane_engine"
  | "sky_dock"
  | "wind_shrine"
  | "cloud_garden"
  | "storm_chamber";

/** Configuration for a theme-specific room type */
export interface ThemeRoomConfig {
  type: ThemeRoomType;
  names: string[];
  description: string;
  geometries: RoomGeometry[];
  minSize?: RoomSize;
  features?: string[];
  treasureBonus: number; // multiplier for treasure chance
  encounterBonus: number; // multiplier for encounter chance
}

/** Adjacency preference rule */
export interface AdjacencyRule {
  roomType: ThemeRoomType;
  preferred: ThemeRoomType[];
  forbidden: ThemeRoomType[];
}

/** Trap template for generation */
export interface TrapTemplate {
  name: string;
  description: string;
  damage: string;
  save: string;
  themes: (DungeonTheme | "*")[]; // "*" means universal
  locations: ("room" | "passage")[];
}

/** Blueprint for guided dungeon generation */
export interface DungeonBlueprint {
  theme: DungeonTheme;
  requiredRooms: ThemeRoomType[];
  optionalRooms: ThemeRoomType[];
  bossRoom: ThemeRoomType;
  adjacencyRules: AdjacencyRule[];
  creaturePool: string[]; // monster slugs
  trapPool: TrapTemplate[];
  emptyRoomDescriptions: string[];
}

/** Faction profile for dungeon ecology */
export interface DungeonFactionProfile {
  name: string;
  factionId?: string; // link to world Faction if active
  creaturePool: string[]; // monster slugs
  leaderCreature: string;
  organization: "tribal" | "military" | "horde" | "cult" | "solitary";
}

/** Room activity assignment */
export interface RoomActivityAssignment {
  roomId: string;
  creatures: string[];
  count: number;
  activity: CreatureActivity;
  schedule?: "day" | "night" | "always";
}

/** Dungeon ecology - who built it, who lives there */
export interface DungeonEcology {
  builders?: DungeonFactionProfile; // who built it (may be dead/gone)
  inhabitants: DungeonFactionProfile; // who lives here now
  activities: RoomActivityAssignment[];
}

/** Wandering monster table entry */
export interface WanderingMonsterEntry {
  creatureType: string;
  count: string; // dice notation e.g. "1d4"
  weight: number;
  activity: string; // what they're doing when encountered
}

/** Wandering monster table for a dungeon */
export interface WanderingMonsterTable {
  checkFrequency: string; // e.g. "every 2 turns" or "on loud noise"
  entries: WanderingMonsterEntry[];
}

/** Key/lock relationship */
export interface KeyLockPair {
  keyId: string;
  keyDescription: string;
  keyRoomId: string;
  lockRoomId: string;
  lockDescription: string;
  clueText?: string; // hint about key location
}

/** Dungeon NPC category */
export type DungeonNPCCategory =
  | "rival_party" // adventurers (hostile/neutral/friendly)
  | "prisoner" // rescue hook
  | "hermit" // info source, trader
  | "ghost" // cursed, haunts room
  | "refugee"; // hiding from inhabitants

/** NPC present in a dungeon */
export interface DungeonNPC {
  npcId: string; // reference to NPC
  category: DungeonNPCCategory;
  roomId: string;
  disposition: "hostile" | "neutral" | "friendly";
  hasInfo?: string; // clue about dungeon
  hasItem?: string; // key or treasure
  wantsRescue?: boolean;
  partySize?: number; // for rival_party
}

/** Extended spatial room with ecology fields */
export interface SpatialRoomEcology {
  themeRoomType?: ThemeRoomType;
  geometry: RoomGeometry;
  isDeadEnd: boolean;
  activity?: RoomActivityAssignment;
  keyLockPairs?: KeyLockPair[];
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

// === Significant Item (Setting Seed narrative items) ===

export type SignificantItemStatus =
  | "possessed"      // A faction/NPC has it
  | "hidden"         // In a dungeon/location, unknown to most
  | "lost"           // Location unknown, requires investigation
  | "contested";     // Multiple parties actively seeking it

export interface SignificantItem {
  id: string;
  name: string;
  type: string;                         // weapon, armor, crown, tome, etc.
  rarity: MagicItemRarity;
  description: string;
  effect: string;

  // === Narrative Fields (Setting Seeds) ===
  history: string;                      // "Forged by the Flame Kings of old..."
  significance: string;                 // Why it matters to the setting
  status: SignificantItemStatus;

  // === Location/Ownership ===
  currentHolderId?: string;             // Faction or NPC ID if possessed
  holderType?: "faction" | "npc";
  locationId?: string;                  // Dungeon/location ID if hidden
  hexCoord?: HexCoord;                  // Where it is on the map

  // === Desires (who wants it) ===
  desiredByFactionIds: string[];        // Factions seeking this item
  desiredByNpcIds: string[];            // Individual NPCs seeking it

  // === Discovery ===
  knownToExist: boolean;                // Do people know it's real?
  locationKnown: boolean;               // Do people know where it is?
  rumorIds: string[];                   // Rumors about this item

  charges?: number;
  cursed: boolean;
}

// === Basic Magic Item (for regular treasure) ===

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
  tempLow: number;  // Fahrenheit
  tempHigh: number; // Fahrenheit
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
  dwellings: Dwelling[];
  npcs: NPC[];
  factions: Faction[];
  significantItems: SignificantItem[]; // Setting Seed narrative items
  hooks: Hook[];
  clocks: Clock[];
}

// === World Summary (for list view) ===

export interface WorldSummary {
  id: string;
  name: string;
  updatedAt: number;
  mapSize: "small" | "medium" | "large";
  settlementCount: number;
  dungeonCount: number;
  factionCount: number;
  day: number;
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
