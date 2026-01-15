import type { WardType } from "~/models";

// === Watabou-Inspired Parchment Palette ===

// Parchment background
export const PARCHMENT_BG = "#f5f0e1";
export const PARCHMENT_TEXTURE = "#e8dcc8";

// Streets/ground
export const STREET_COLOR = "#d4c8a8";
export const ALLEY_COLOR = "#c9bc9c";

// Buildings
export const BUILDING_FILL = "#e8e0d0";
export const BUILDING_STROKE = "#6b5c4a";
export const BUILDING_STROKE_WIDTH = 0.8;

// Legacy alias
export const BUILDING_COLOR = BUILDING_FILL;

// Roofs (slightly darker than walls)
export const ROOF_FILL = "#d8cfc0";
export const ROOF_SHADOW = "#b8a890";
export const RIDGE_COLOR = "#8b7d6b";

// Shadows
export const SHADOW_COLOR = "rgba(60, 50, 40, 0.12)";
export const SHADOW_OFFSET = { x: 2, y: 2 };

// Water
export const WATER_FILL = "#a8c8d8";
export const WATER_STROKE = "#7898a8";

// Parks/greens
export const PARK_FILL = "#b8c8a0";
export const PARK_STROKE = "#889868";

// Special buildings
export const TEMPLE_FILL = "#d0d8e8";
export const CASTLE_FILL = "#c8c0b8";

// Walls (if re-enabled)
export const WALL_COLOR = "#5c5248";
export const WALL_STROKE = "#3d3830";

// Ward colors - muted parchment-compatible palette
export const WARD_COLORS: Record<WardType, { fill: string; stroke: string }> = {
  market: { fill: "#f0e6c8", stroke: "#a89060" },      // Warm tan
  residential: { fill: "#e8e0d0", stroke: "#8b8070" }, // Neutral parchment
  craftsmen: { fill: "#e8d8c0", stroke: "#9c7c58" },   // Warm brown
  merchant: { fill: "#dce4e8", stroke: "#7088a0" },    // Cool gray-blue
  temple: { fill: "#e0d8e8", stroke: "#7868a0" },      // Muted purple
  tavern: { fill: "#e8d0c8", stroke: "#a07060" },      // Warm rose
  castle: { fill: "#d8d4d0", stroke: "#686460" },      // Stone gray
  slum: { fill: "#d0c8b8", stroke: "#787060" },        // Dirty tan
  park: { fill: "#d0e0c0", stroke: "#688050" },        // Muted green
};

// Scale factor for SVG coordinates
export const SCALE = 1;
