import type { DungeonTheme, RoomType } from "~/models";

/** Theme-based color schemes for dungeon rendering */
export const THEME_COLORS: Record<
  DungeonTheme,
  { fill: string; stroke: string; passage: string }
> = {
  tomb: { fill: "#44403c", stroke: "#78716c", passage: "#57534e" },
  cave: { fill: "#292524", stroke: "#57534e", passage: "#44403c" },
  temple: { fill: "#4c1d95", stroke: "#7c3aed", passage: "#5b21b6" },
  mine: { fill: "#78350f", stroke: "#b45309", passage: "#92400e" },
  fortress: { fill: "#374151", stroke: "#6b7280", passage: "#4b5563" },
  sewer: { fill: "#14532d", stroke: "#166534", passage: "#15803d" },
  crypt: { fill: "#1c1917", stroke: "#44403c", passage: "#292524" },
  lair: { fill: "#450a0a", stroke: "#7f1d1d", passage: "#991b1b" },
  shrine: { fill: "#fef3c7", stroke: "#f59e0b", passage: "#d97706" },
  // Wilderness themes
  bandit_hideout: { fill: "#365314", stroke: "#4d7c0f", passage: "#3f6212" },
  cultist_lair: { fill: "#4a044e", stroke: "#86198f", passage: "#701a75" },
  witch_hut: { fill: "#422006", stroke: "#713f12", passage: "#854d0e" },
  sea_cave: { fill: "#164e63", stroke: "#0e7490", passage: "#155e75" },
  beast_den: { fill: "#3f3f46", stroke: "#71717a", passage: "#52525b" },
  floating_keep: { fill: "#1e3a5f", stroke: "#3b82f6", passage: "#1d4ed8" },
};

/** Room type icon mapping - using Lucide icon names */
export const ROOM_ICONS: Record<RoomType, string> = {
  entrance: "DoorOpen",
  exit: "LogOut",
  corridor: "ArrowRight",
  chamber: "Square",
  shrine: "Sparkles",
  treasury: "Gem",
  prison: "Lock",
  lair: "Skull",
  trap_room: "AlertTriangle",
};

/** Cell size in pixels (1 cell = 5ft) */
export const CELL_SIZE = 10;

/** Passage width in pixels */
export const PASSAGE_WIDTH = 8;

/** Special room colors (override theme colors) */
export const SPECIAL_ROOM_COLORS = {
  entrance: { fill: "#166534", stroke: "#22c55e" }, // Green for entrance/exit
  exit: { fill: "#166534", stroke: "#22c55e" },
};
