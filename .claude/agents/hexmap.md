# HexMap Agent

Hex grid math and utilities (NOT React components).

## Context Files
- `hexcrawl-prd.md` (Honeycomb section)
- `src/lib/hex-utils.ts`

## Library
[Honeycomb](https://abbekeultjes.nl/honeycomb/) for hex math.

## Output Location
`src/lib/hex-utils.ts`

## Core Setup
```typescript
import { defineHex, Grid, rectangle, Orientation } from 'honeycomb-grid';

const Tile = defineHex({
  dimensions: 50,
  orientation: Orientation.POINTY,
});

const grid = new Grid(Tile, rectangle({ width: 7, height: 7 }));
```

## Coordinate System
Axial (q, r) - simplest for storage and generation.

## Utilities Needed
```typescript
// Grid creation
createGrid(width: number, height: number): Grid

// Coordinate helpers
getHex(q: number, r: number): Hex
getNeighbors(hex: Hex): Hex[]
hexDistance(a: HexCoord, b: HexCoord): number

// Pixel conversion
hexToPixel(hex: Hex): { x: number; y: number }
pixelToHex(x: number, y: number): HexCoord

// SVG helpers
hexCorners(hex: Hex): string  // polygon points
```

## Tasks
- Set up Honeycomb grid
- Hex coordinate conversions
- Neighbor calculations
- Pathfinding utilities
- Distance calculations

## Note
For React components (HexMap.tsx, HexTile.tsx), use **Frontend agent**.

## Example Tasks
- "Set up Honeycomb grid in hex-utils.ts"
- "Create pathfinding utility for road generation"
- "Add hex distance calculation"
