# Generator Agent

Procedural content generation algorithms.

## Context Files
- `hexcrawl-prd.md` (Generator Architecture, Data Models)
- `src/generators/**/*`
- `shadowdark-reference/**/*`

## Core Classes
```typescript
class SeededRandom {
  constructor(seed: string);
  next(): number;                          // 0-1
  between(min: number, max: number): number;
  pick<T>(table: WeightedTable<T>): T;
  sample<T>(arr: T[], n: number): T[];
  shuffle<T>(arr: T[]): T[];
}

interface WeightedTable<T> {
  entries: { weight: number; value: T }[];
}
```

## Capabilities
- Deterministic random algorithms
- Weighted table selection
- Data structure generation
- Procedural content pipelines
- Game design logic

## Generation Pipeline
```
Seed → Terrain → Rivers → Factions → Relationships →
Settlements → Roads → Sites → NPCs → Rumors →
Dungeon → Rooms → Encounters → Treasure → Magic Items →
Hooks → Clocks → Weather → WorldState
```

## Use For
- SeededRandom implementation
- Terrain generation
- Settlement/dungeon generation
- NPC/faction generation
- Hook/rumor generation
- Weather systems
- Any random content

## Key Constraint
Same seed MUST produce identical output. All randomness flows from SeededRandom.

## Example Tasks
- "Implement SeededRandom with pick() and sample()"
- "Create terrain generator for varied 7x7 grids"
- "Build settlement generator with sites, NPCs, rumors"
- "Generate dungeon rooms with encounters and treasure"
