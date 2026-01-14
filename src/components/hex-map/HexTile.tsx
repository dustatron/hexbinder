import { Castle, Skull } from "lucide-react";
import type { Hex as HexType } from "honeycomb-grid";
import type { Hex, HexCoord, LocationType } from "~/models";
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
  isSelected: boolean;
  onClick: (coord: HexCoord) => void;
}

const LOCATION_ICONS: Record<LocationType, typeof Castle> = {
  settlement: Castle,
  dungeon: Skull,
  landmark: Castle, // placeholder
  wilderness: Castle, // placeholder
};

export function HexTile({
  honeycombHex,
  hexData,
  locationType,
  isSelected,
  onClick,
}: HexTileProps) {
  const points = hexToPolygonPoints(honeycombHex);
  const center = hexToCenter(honeycombHex);
  const fillColor = TERRAIN_COLORS[hexData.terrain];
  const strokeColor = isSelected
    ? "#f59e0b" // amber-500 for selection
    : TERRAIN_BORDER_COLORS[hexData.terrain];

  const Icon = locationType ? LOCATION_ICONS[locationType] : null;

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
      {Icon && (
        <Icon
          x={center.x - 12}
          y={center.y - 12}
          width={24}
          height={24}
          stroke="#1c1917" // stone-900
          strokeWidth={2}
          fill="none"
        />
      )}
    </g>
  );
}
