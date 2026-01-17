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
  locationName?: string;
  dungeonTheme?: DungeonTheme;
  isCapital?: boolean;
  isSelected: boolean;
  isCurrent?: boolean; // Party is currently here
  isVisited?: boolean; // Party has been here before
  onClick: (coord: HexCoord) => void;
  showIcon?: boolean;
  showLabel?: boolean;
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
  locationName,
  dungeonTheme,
  isCapital,
  isSelected,
  isCurrent = false,
  isVisited = false,
  onClick,
  showIcon = true,
  showLabel = false,
  iconOnly = false,
}: HexTileProps) {
  const points = hexToPolygonPoints(honeycombHex);
  const center = hexToCenter(honeycombHex);
  const fillColor = TERRAIN_COLORS[hexData.terrain];

  // Determine stroke color: current > selected > normal
  let strokeColor = TERRAIN_BORDER_COLORS[hexData.terrain];
  if (isSelected) {
    strokeColor = "#f59e0b"; // amber-500 for selection
  }
  if (isCurrent) {
    strokeColor = "#22c55e"; // green-500 for current location
  }

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
        strokeWidth={isSelected || isCurrent ? 3 : 1}
      />
      {/* Current location: pulsing green ring */}
      {isCurrent && (
        <circle
          cx={center.x}
          cy={center.y}
          r={18}
          fill="none"
          stroke="#22c55e"
          strokeWidth={3}
          opacity={0.8}
          className="animate-pulse"
        />
      )}
      {/* Visited indicator: small dot in corner */}
      {isVisited && !isCurrent && (
        <circle
          cx={center.x + 20}
          cy={center.y - 20}
          r={5}
          fill="#a855f7"
          stroke="#1c1917"
          strokeWidth={1}
        />
      )}
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
      {showLabel && locationName && (
        <text
          x={center.x}
          y={center.y + 20}
          textAnchor="middle"
          fontSize={10}
          fontWeight="bold"
          fill="#1c1917"
          stroke="#fafaf9"
          strokeWidth={2}
          paintOrder="stroke"
          style={{ pointerEvents: "none" }}
        >
          {locationName}
        </text>
      )}
    </g>
  );
}
