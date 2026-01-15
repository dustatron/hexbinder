import type { TownWard } from "~/models";
import { WARD_COLORS, SCALE } from "./theme-colors";
import { BuildingWithRoof } from "./BuildingWithRoof";

interface WardPolygonProps {
  ward: TownWard;
  selectedBuildingId?: string;
  selectedWardId?: string;
  onBuildingClick?: (buildingId: string) => void;
  onWardClick?: (wardId: string) => void;
}

/** Convert polygon vertices to SVG path data */
function polygonToPathData(vertices: { x: number; y: number }[]): string {
  if (vertices.length < 3) return "";

  const points = vertices.map((v) => ({
    x: v.x * SCALE,
    y: v.y * SCALE,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  d += " Z"; // Close path
  return d;
}

export function WardPolygon({
  ward,
  selectedBuildingId,
  selectedWardId,
  onBuildingClick,
  onWardClick,
}: WardPolygonProps) {
  const colors = WARD_COLORS[ward.type];
  const pathData = polygonToPathData(ward.shape.vertices);
  const isSelected = selectedWardId === ward.id;

  if (!pathData) return null;

  return (
    <g className="ward-polygon">
      {/* Ward background - subtle fill only, buildings define the shape */}
      <path
        d={pathData}
        fill={colors.fill}
        stroke={isSelected ? "#f59e0b" : "none"}
        strokeWidth={isSelected ? 2 : 0}
        opacity={isSelected ? 0.5 : 0.3}
        className={onWardClick ? "cursor-pointer hover:opacity-50" : ""}
        onClick={onWardClick ? () => onWardClick(ward.id) : undefined}
      />

      {/* Buildings within ward (with 3D roofs) */}
      {ward.buildings.map((building) => (
        <BuildingWithRoof
          key={building.id}
          building={building}
          selected={building.id === selectedBuildingId}
          onClick={onBuildingClick ? () => onBuildingClick(building.id) : undefined}
        />
      ))}
    </g>
  );
}
