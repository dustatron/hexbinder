export { SeededRandom, createWeightedTable } from "./SeededRandom";
export type { WeightedTable, WeightedEntry } from "./SeededRandom";

export { generateTerrain, findSettlementHexes, findDungeonHexes } from "./TerrainGenerator";
export type { TerrainGeneratorOptions } from "./TerrainGenerator";

export { generateFactions } from "./FactionGenerator";
export type { FactionGeneratorOptions } from "./FactionGenerator";

export { generateWeather, getSeasonFromDay, getMoonPhase } from "./WeatherGenerator";
export type { WeatherGeneratorOptions } from "./WeatherGenerator";

export { placeSettlement } from "./SettlementGenerator";
export type { SettlementPlacementOptions } from "./SettlementGenerator";

export { generateTownLayout, assignNPCsToBuildings } from "./TownLayoutEngine";
export type { TownLayoutInput, TownLayoutOutput } from "./TownLayoutEngine";

export { placeDungeon } from "./DungeonGenerator";
export type { DungeonPlacementOptions } from "./DungeonGenerator";

export { generateFactionClock, generateWorldClock, advanceClock, checkClockTriggers } from "./ClockGenerator";
export type { ClockGeneratorOptions, WorldClockOptions } from "./ClockGenerator";

export { generateRoads, getRoadModifier } from "./RoadGenerator";
export type { RoadGeneratorOptions, RoadNetwork } from "./RoadGenerator";

export { generateSites } from "./SiteGenerator";
export type { SiteGeneratorOptions } from "./SiteGenerator";

export { generateRoomEncounters, generateRoomTreasure, populateRoom, populateDungeonRooms } from "./RoomContentGenerator";
export type { RoomContentOptions } from "./RoomContentGenerator";

export { generateNPC, generateSettlementNPCs, generateFactionNPCs } from "./NPCGenerator";
export type { NPCGeneratorOptions, SettlementNPCOptions, SettlementNPCResult, FactionNPCOptions } from "./NPCGenerator";

export { generateNPCRelationships, getRelatives, getEnemies } from "./NPCRelationshipGenerator";
export type { RelationshipGeneratorOptions, RelationshipGeneratorResult, FamilyCluster } from "./NPCRelationshipGenerator";

export { weaveHooks } from "./HookWeaver";
export type { HookWeaverOptions, HookWeaverResult } from "./HookWeaver";

export { generateDungeonConnections, validateConnectivity, getAdjacentRooms, findRoomPath } from "./DungeonConnectionGenerator";
export type { ConnectionGeneratorOptions } from "./DungeonConnectionGenerator";

export { clusterTerrain, createBiomeZones, smoothTerrainEdges } from "./TerrainClusterGenerator";
export type { TerrainClusterOptions, BiomeZoneOptions, TerrainEdgeOptions } from "./TerrainClusterGenerator";

export { generateRivers, hasRiver, findBridgeSites } from "./RiverGenerator";
export type { RiverGeneratorOptions, RiverNetwork } from "./RiverGenerator";

export { generateRumors, generateNotices } from "./RumorGenerator";
export type { RumorGeneratorOptions, NoticeGeneratorOptions } from "./RumorGenerator";

export { generateEncounter, checkWandererEncounter, generateLairEncounter, describeEncounter } from "./EncounterGenerator";
export type { EncounterGeneratorOptions, WandererEncounterOptions, LairEncounterOptions } from "./EncounterGenerator";

export { generateTreasure, generateMagicItem } from "./TreasureGenerator";
export type { TreasureGeneratorOptions } from "./TreasureGenerator";

export { generateBridges, isBridgePassable, getBridgeDifficulty, describeBridge } from "./BridgeGenerator";
export type { Bridge, BridgeGeneratorOptions } from "./BridgeGenerator";

export { generateCompleteMagicItem, generateRandomMagicItem } from "./MagicItemGenerator";
export type { MagicItemGeneratorOptions } from "./MagicItemGenerator";

export {
  generateSignificantItems,
  assignItemToFaction,
  addFactionDesire,
  placeItemInLocation,
  generateItemRumorText,
} from "./SignificantItemGenerator";
export type { SignificantItemGeneratorOptions, SignificantItemCategory } from "./SignificantItemGenerator";

export { generateHook, generateSettlementHooks, generateDungeonHook, generateFactionHook, updateHookStatus } from "./HookGenerator";
export type { HookGeneratorOptions } from "./HookGenerator";

export { generateWorld, advanceDay, getWorldSummary } from "./WorldGenerator";
export type { WorldGeneratorOptions, GeneratedWorld } from "./WorldGenerator";

export { generateSpiralTerrain, getMapRadius } from "./SpiralTerrainGenerator";
export type { SpiralTerrainOptions, SpiralTerrainResult, MapSize, StartPosition } from "./SpiralTerrainGenerator";

export { generateHexEncounters } from "./HexEncounterGenerator";
export type { HexEncounterGeneratorOptions } from "./HexEncounterGenerator";

export { generateFeatures } from "./FeatureGenerator";
export type { FeatureGeneratorOptions, FeatureGeneratorResult } from "./FeatureGenerator";

export { generateDwellings } from "./DwellingGenerator";
export type { DwellingGeneratorOptions, DwellingGeneratorResult } from "./DwellingGenerator";

export { generateQuestObjects } from "./QuestObjectGenerator";
export type { QuestObjectGeneratorOptions } from "./QuestObjectGenerator";

export { generateDayEvents } from "./DayEventGenerator";
export type { DayEventGeneratorOptions } from "./DayEventGenerator";

export { Voronoi, createVoronoiWithRandomPoints } from "./Voronoi";
export type { Point, Triangle, Edge, VoronoiCell } from "./Voronoi";
