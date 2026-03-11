import {
  GiCastle,
  GiElvenCastle,
  GiCrown,
  GiHut,
  GiHutsVillage,
  GiVillage,
  GiSkullCrossedBones,
  GiCrossedSwords,
  GiMoonBats,
  GiMagicSwirl,
  GiAnchor,
  GiFootprint,
  GiMountainCave,
  GiTempleGate,
  GiMining,
  GiShield,
} from "react-icons/gi";
import type { IconType } from "react-icons";
import type { Hex as HexType } from "honeycomb-grid";
import type { Hex, HexCoord, LocationType, DungeonTheme, SettlementSize } from "~/models";
import {
  hexToPolygonPoints,
  hexToCenter,
  TERRAIN_COLORS,
  TERRAIN_BORDER_COLORS,
  HEX_SIZE,
} from "~/lib/hex-utils";
import { getVariantIconPath } from "~/lib/terrain-variants";

interface HexTileProps {
  honeycombHex: HexType;
  hexData: Hex;
  locationType?: LocationType;
  locationName?: string;
  dungeonTheme?: DungeonTheme;
  settlementSize?: SettlementSize;
  isCapital?: boolean;
  isSelected: boolean;
  isCurrent?: boolean; // Party is currently here
  isVisited?: boolean; // Party has been here before
  onClick: (coord: HexCoord) => void;
  onDoubleClick?: (coord: HexCoord) => void;
  showIcon?: boolean;
  showLabel?: boolean;
  iconOnly?: boolean;
}

const LOCATION_ICONS: Record<LocationType, IconType> = {
  settlement: GiCastle,
  dungeon: GiSkullCrossedBones,
  landmark: GiCastle,
  wilderness: GiCastle,
};

const SETTLEMENT_ICONS: Record<SettlementSize, IconType> = {
  thorpe: GiHut,
  hamlet: GiHutsVillage,
  village: GiVillage,
  town: GiCastle,
  city: GiElvenCastle,
};

const DUNGEON_ICONS: Partial<Record<DungeonTheme, IconType>> = {
  tomb: GiSkullCrossedBones,
  cave: GiMountainCave,
  temple: GiTempleGate,
  mine: GiMining,
  fortress: GiShield,
  sewer: GiSkullCrossedBones,
  crypt: GiSkullCrossedBones,
  lair: GiFootprint,
  // Wilderness themes
  bandit_hideout: GiCrossedSwords,
  cultist_lair: GiMoonBats,
  witch_hut: GiMagicSwirl,
  sea_cave: GiAnchor,
  beast_den: GiFootprint,
  floating_keep: GiCastle,
};

export function HexTile({
  honeycombHex,
  hexData,
  locationType,
  locationName,
  dungeonTheme,
  settlementSize,
  isCapital,
  isSelected,
  isCurrent = false,
  isVisited = false,
  onClick,
  onDoubleClick,
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
  let Icon: IconType | null = null;
  if (isCapital) {
    Icon = GiCrown;
  } else if (locationType === "dungeon" && dungeonTheme) {
    Icon = DUNGEON_ICONS[dungeonTheme] ?? GiSkullCrossedBones;
  } else if (locationType === "settlement" && settlementSize) {
    Icon = SETTLEMENT_ICONS[settlementSize] ?? GiCastle;
  } else if (locationType) {
    Icon = LOCATION_ICONS[locationType];
  }

  // Capital icons get gold fill
  const iconFill = isCapital ? "#fbbf24" : "none"; // amber-400

  // Icon-only mode: just render the icon without polygon (for layering above roads)
  if (iconOnly) {
    if (!Icon) return null;
    return (
      <foreignObject
        x={center.x - 12}
        y={center.y - 12}
        width={24}
        height={24}
        style={{ cursor: "pointer", overflow: "visible" }}
        onClick={() => onClick(hexData.coord)}
        onDoubleClick={() => onDoubleClick?.(hexData.coord)}
      >
        <Icon size={24} color="#1c1917" style={{ filter: iconFill !== "none" ? `drop-shadow(0 0 0 ${iconFill})` : undefined }} />
      </foreignObject>
    );
  }

  return (
    <g
      onClick={() => onClick(hexData.coord)}
      onDoubleClick={() => onDoubleClick?.(hexData.coord)}
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
      {hexData.variant && (
        <>
          <defs>
            <clipPath id={`hex-clip-${hexData.coord.q}-${hexData.coord.r}`}>
              <polygon points={points} />
            </clipPath>
          </defs>
          <image
            href={getVariantIconPath(hexData.variant)}
            x={center.x - HEX_SIZE * 0.75}
            y={center.y - HEX_SIZE * 0.75}
            width={HEX_SIZE * 1.5}
            height={HEX_SIZE * 1.5}
            clipPath={`url(#hex-clip-${hexData.coord.q}-${hexData.coord.r})`}
            preserveAspectRatio="xMidYMid slice"
            style={{ pointerEvents: "none" }}
          />
        </>
      )}
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
        <foreignObject
          x={center.x - 12}
          y={center.y - 12}
          width={24}
          height={24}
          style={{ overflow: "visible" }}
        >
          <Icon size={24} color="#1c1917" style={{ filter: iconFill !== "none" ? `drop-shadow(0 0 0 ${iconFill})` : undefined }} />
        </foreignObject>
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
