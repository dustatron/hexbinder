import type { WardType } from "~/models";

export const WARD_COLORS: Record<WardType, { fill: string; stroke: string }> = {
  market: { fill: "#fef3c7", stroke: "#d97706" },
  residential: { fill: "#e7e5e4", stroke: "#78716c" },
  craftsmen: { fill: "#fed7aa", stroke: "#c2410c" },
  merchant: { fill: "#dbeafe", stroke: "#2563eb" },
  temple: { fill: "#ede9fe", stroke: "#7c3aed" },
  tavern: { fill: "#fecaca", stroke: "#dc2626" },
  castle: { fill: "#d1d5db", stroke: "#374151" },
  slum: { fill: "#a8a29e", stroke: "#57534e" },
  park: { fill: "#bbf7d0", stroke: "#16a34a" },
};

export const BUILDING_COLOR = "#f5f5f4";
export const WALL_COLOR = "#44403c";
export const STREET_COLOR = "#d6d3d1";
export const SCALE = 1; // pixels per unit
