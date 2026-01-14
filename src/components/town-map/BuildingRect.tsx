import type { TownBuilding } from "~/models";
import { BUILDING_COLOR, SCALE } from "./theme-colors";

interface BuildingRectProps {
  building: TownBuilding;
  selected?: boolean;
  onClick?: () => void;
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

export function BuildingRect({ building, selected, onClick }: BuildingRectProps) {
  const pathData = polygonToPathData(building.shape.vertices);

  if (!pathData) return null;

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      className="building-rect"
    >
      <path
        d={pathData}
        fill={BUILDING_COLOR}
        stroke="#292524"
        strokeWidth={selected ? 2 : 0.5}
        opacity={0.9}
      />
      {selected && (
        <path
          d={pathData}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="3 3"
        />
      )}
    </g>
  );
}
