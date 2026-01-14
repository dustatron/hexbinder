import {
  defineHex,
  Grid,
  rectangle,
  Orientation,
  type Hex,
  type HexCoordinates,
} from "honeycomb-grid";
import type { TerrainType } from "~/models";

// Hex size in pixels
export const HEX_SIZE = 50;

// Define hex class with pointy-top orientation
export const Tile = defineHex({
  dimensions: HEX_SIZE,
  orientation: Orientation.POINTY,
  origin: "topLeft",
});

export type TileType = InstanceType<typeof Tile>;

// Create a 7x7 hex grid
export function createHexGrid(width = 7, height = 7): Grid<TileType> {
  return new Grid(Tile, rectangle({ width, height }));
}

// Convert hex corners to SVG polygon points string
export function hexToPolygonPoints(hex: Hex): string {
  return hex.corners.map(({ x, y }) => `${x},${y}`).join(" ");
}

// Get pixel center of hex for icon/label placement
export function hexToCenter(hex: Hex): { x: number; y: number } {
  return { x: hex.x, y: hex.y };
}

// Get hex from grid by coordinates
export function getHexAt(
  grid: Grid<TileType>,
  coords: HexCoordinates
): TileType | undefined {
  return grid.getHex(coords);
}

// Terrain color mapping (Tailwind colors)
export const TERRAIN_COLORS: Record<TerrainType, string> = {
  plains: "#fde68a", // amber-200
  forest: "#16a34a", // green-600
  hills: "#fbbf24", // amber-400
  mountains: "#78716c", // stone-500
  water: "#60a5fa", // blue-400
  swamp: "#166534", // green-800
};

// Terrain border colors (darker variants)
export const TERRAIN_BORDER_COLORS: Record<TerrainType, string> = {
  plains: "#d97706", // amber-600
  forest: "#14532d", // green-900
  hills: "#b45309", // amber-700
  mountains: "#44403c", // stone-700
  water: "#1d4ed8", // blue-700
  swamp: "#14532d", // green-900
};

// Calculate viewBox for grid
export function calculateViewBox(grid: Grid<TileType>): {
  minX: number;
  minY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  grid.forEach((hex) => {
    hex.corners.forEach((corner) => {
      minX = Math.min(minX, corner.x);
      minY = Math.min(minY, corner.y);
      maxX = Math.max(maxX, corner.x);
      maxY = Math.max(maxY, corner.y);
    });
  });

  const padding = HEX_SIZE * 0.5;
  return {
    minX: minX - padding,
    minY: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}
