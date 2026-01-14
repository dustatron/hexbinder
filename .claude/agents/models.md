# Models Agent

TypeScript interfaces and data structures.

## Context Files
- `hexcrawl-prd.md` (Data Models section)
- `src/models/**/*`

## Output Location
`src/models/index.ts` (or split files)

## Core Interfaces
- World, WorldState, WorldData
- Hex, HexCoord, HexEdge
- Location, Settlement, Dungeon
- SettlementSite, DungeonRoom
- NPC, CreatureArchetype
- Faction, FactionRelationship
- Clock, ClockTrigger
- Hook
- WeatherState, Season, MoonPhase

## WorldData (Storage Schema)
```typescript
interface WorldData {
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
```

## Tasks
- Create all TypeScript interfaces
- Define WorldData for localStorage
- Ensure type consistency
- Add Zod schemas if validation needed

## Patterns
- Use discriminated unions for type field
- Keep interfaces flat where possible
- ID references between entities (not nested)
- Timestamps as numbers (Date.now())

## Example Tasks
- "Create all models from PRD data section"
- "Define Settlement and Dungeon extending Location"
- "Add Zod schema for WorldData validation"
