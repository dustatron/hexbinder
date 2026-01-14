import {
  Castle,
  Crown,
  Skull,
  Swords,
  Moon,
  Wand2,
  Anchor,
  Footprints,
  Mountain,
  Church,
  Pickaxe,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { Hex as HexType } from "honeycomb-grid";
import type { Hex, HexCoord, LocationType, DungeonTheme } from "~/models";
import {
  hexToPolygonPoints,
  hexToCenter,
  TERRAIN_COLORS,
  TERRAIN_BORDER_COLORS,
} from "~/lib/hex-utils";

interface HexTileProps {
  honeycombHex: HexType;
  hexData: Hex;
  locationType?: LocationType;
  dungeonTheme?: DungeonTheme;
  isCapital?: boolean;
  isSelected: boolean;
  onClick: (coord: HexCoord) => void;
  showIcon?: boolean;
  iconOnly?: boolean;
}

const LOCATION_ICONS: Record<LocationType, LucideIcon> = {
  settlement: Castle,
  dungeon: Skull,
  landmark: Castle,
  wilderness: Castle,
};

const DUNGEON_ICONS: Partial<Record<DungeonTheme, LucideIcon>> = {
  tomb: Skull,
  cave: Mountain,
  temple: Church,
  mine: Pickaxe,
  fortress: Shield,
  sewer: Skull,
  crypt: Skull,
  lair: Footprints,
  // Wilderness themes
  bandit_hideout: Swords,
  cultist_lair: Moon,
  witch_hut: Wand2,
  sea_cave: Anchor,
  beast_den: Footprints,
  floating_keep: Castle,
};

export function HexTile({
  honeycombHex,
  hexData,
  locationType,
  dungeonTheme,
  isCapital,
  isSelected,
  onClick,
  showIcon = true,
  iconOnly = false,
}: HexTileProps) {
  const points = hexToPolygonPoints(honeycombHex);
  const center = hexToCenter(honeycombHex);
  const fillColor = TERRAIN_COLORS[hexData.terrain];
  const strokeColor = isSelected
    ? "#f59e0b" // amber-500 for selection
    : TERRAIN_BORDER_COLORS[hexData.terrain];

  // Use dungeon-specific icon if available, otherwise fall back to location icon
  // Capitals get Crown icon
  let Icon: LucideIcon | null = null;
  if (isCapital) {
    Icon = Crown;
  } else if (locationType === "dungeon" && dungeonTheme) {
    Icon = DUNGEON_ICONS[dungeonTheme] ?? Skull;
  } else if (locationType) {
    Icon = LOCATION_ICONS[locationType];
  }

  // Capital icons get gold fill
  const iconFill = isCapital ? "#fbbf24" : "none"; // amber-400

  // Icon-only mode: just render the icon without polygon (for layering above roads)
  if (iconOnly) {
    if (!Icon) return null;
    return (
      <Icon
        x={center.x - 12}
        y={center.y - 12}
        width={24}
        height={24}
        stroke="#1c1917"
        strokeWidth={2}
        fill={iconFill}
        style={{ cursor: "pointer" }}
        onClick={() => onClick(hexData.coord)}
      />
    );
  }

  return (
    <g
      onClick={() => onClick(hexData.coord)}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(hexData.coord);
        }
      }}
    >
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 1}
      />
      {showIcon && Icon && (
        <Icon
          x={center.x - 12}
          y={center.y - 12}
          width={24}
          height={24}
          stroke="#1c1917" // stone-900
          strokeWidth={2}
          fill={iconFill}
        />
      )}
    </g>
  );
}
