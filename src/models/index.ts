// Phase 0 TypeScript Models for Hexbinder
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

// === Location ===

export type LocationType = "settlement" | "dungeon" | "landmark" | "wilderness";

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  hexCoord: HexCoord;
  tags: string[];
}

// === Weather ===

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "overcast"
  | "rain_light"
  | "rain_heavy"
  | "storm"
  | "fog"
  | "snow_light"
  | "snow_heavy";

export type Temperature = "freezing" | "cold" | "cool" | "mild" | "warm" | "hot";

export type WindLevel = "calm" | "breeze" | "wind" | "gale";

export interface WeatherState {
  condition: WeatherCondition;
  temperature: Temperature;
  wind: WindLevel;
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
  // Future Phase 0+ additions:
  // npcs: NPC[];
  // factions: Faction[];
  // hooks: Hook[];
  // clocks: Clock[];
}

// === World Summary (for list view) ===

export interface WorldSummary {
  id: string;
  name: string;
  updatedAt: number;
}
