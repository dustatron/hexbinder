import type { TownBuilding } from "~/models";
import {
  BUILDING_FILL,
  BUILDING_STROKE,
  BUILDING_STROKE_WIDTH,
  ROOF_FILL,
  RIDGE_COLOR,
  SHADOW_COLOR,
  SHADOW_OFFSET,
  TEMPLE_FILL,
  CASTLE_FILL,
  SCALE,
} from "./theme-colors";

interface BuildingWithRoofProps {
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
  d += " Z";
  return d;
}

/** Generate shadow path (offset from building) */
function getShadowPath(vertices: { x: number; y: number }[]): string {
  if (vertices.length < 3) return "";

  const points = vertices.map((v) => ({
    x: (v.x + SHADOW_OFFSET.x) * SCALE,
    y: (v.y + SHADOW_OFFSET.y) * SCALE,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  d += " Z";
  return d;
}

/** Calculate ridge line for gable roof */
function getRidgeLine(
  vertices: { x: number; y: number }[]
): { x1: number; y1: number; x2: number; y2: number } | null {
  if (vertices.length < 3) return null;

  // Find bounding box
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  // Ridge runs along longer axis
  if (width > height) {
    // Horizontal ridge
    const midY = (minY + maxY) / 2;
    return {
      x1: minX * SCALE,
      y1: midY * SCALE,
      x2: maxX * SCALE,
      y2: midY * SCALE,
    };
  } else {
    // Vertical ridge
    const midX = (minX + maxX) / 2;
    return {
      x1: midX * SCALE,
      y1: minY * SCALE,
      x2: midX * SCALE,
      y2: maxY * SCALE,
    };
  }
}

/** Generate roof edge lines (from ridge to corners) */
function getRoofEdges(
  vertices: { x: number; y: number }[]
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  if (vertices.length < 4) return [];

  const ridge = getRidgeLine(vertices);
  if (!ridge) return [];

  // Find bounding box
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  if (width > height) {
    // Horizontal ridge - draw lines to top/bottom edges
    const midY = (minY + maxY) / 2;
    // From ridge endpoints to corners
    edges.push({
      x1: minX * SCALE,
      y1: midY * SCALE,
      x2: minX * SCALE,
      y2: minY * SCALE,
    });
    edges.push({
      x1: minX * SCALE,
      y1: midY * SCALE,
      x2: minX * SCALE,
      y2: maxY * SCALE,
    });
    edges.push({
      x1: maxX * SCALE,
      y1: midY * SCALE,
      x2: maxX * SCALE,
      y2: minY * SCALE,
    });
    edges.push({
      x1: maxX * SCALE,
      y1: midY * SCALE,
      x2: maxX * SCALE,
      y2: maxY * SCALE,
    });
  } else {
    // Vertical ridge - draw lines to left/right edges
    const midX = (minX + maxX) / 2;
    edges.push({
      x1: midX * SCALE,
      y1: minY * SCALE,
      x2: minX * SCALE,
      y2: minY * SCALE,
    });
    edges.push({
      x1: midX * SCALE,
      y1: minY * SCALE,
      x2: maxX * SCALE,
      y2: minY * SCALE,
    });
    edges.push({
      x1: midX * SCALE,
      y1: maxY * SCALE,
      x2: minX * SCALE,
      y2: maxY * SCALE,
    });
    edges.push({
      x1: midX * SCALE,
      y1: maxY * SCALE,
      x2: maxX * SCALE,
      y2: maxY * SCALE,
    });
  }

  return edges;
}

/** Calculate building area for conditional rendering */
function getBuildingArea(vertices: { x: number; y: number }[]): number {
  if (vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

export function BuildingWithRoof({
  building,
  selected,
  onClick,
}: BuildingWithRoofProps) {
  const vertices = building.shape.vertices;
  const pathData = polygonToPathData(vertices);
  const shadowPath = getShadowPath(vertices);
  const isLandmark = building.type === "landmark";

  // Only show roof details on landmarks - regular buildings are just rectangles
  const buildingArea = getBuildingArea(vertices);
  const ridge = isLandmark ? getRidgeLine(vertices) : null;
  const roofEdges = isLandmark ? getRoofEdges(vertices) : [];
  const isLargeBuilding = buildingArea > 100;

  if (!pathData) return null;

  // Landmark buildings get special fill colors and thicker strokes
  const buildingFill = isLandmark ? TEMPLE_FILL : BUILDING_FILL;
  const strokeWidth = isLandmark
    ? BUILDING_STROKE_WIDTH * 2
    : selected
      ? 1.5
      : BUILDING_STROKE_WIDTH;

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      className="building-with-roof"
    >
      {/* Shadow - only for landmarks */}
      {isLandmark && (
        <path
          d={shadowPath}
          fill={SHADOW_COLOR}
          opacity={0.15}
        />
      )}

      {/* Building base - simple rectangle, thin stroke */}
      <path
        d={pathData}
        fill={buildingFill}
        stroke={BUILDING_STROKE}
        strokeWidth={isLandmark ? 1.2 : 0.5}
      />

      {/* Ridge line - ONLY for landmarks */}
      {isLandmark && ridge && (
        <line
          x1={ridge.x1}
          y1={ridge.y1}
          x2={ridge.x2}
          y2={ridge.y2}
          stroke={RIDGE_COLOR}
          strokeWidth={0.8}
          strokeLinecap="round"
        />
      )}

      {/* Roof edge lines - only for landmarks */}
      {isLandmark && roofEdges.map((edge, i) => (
        <line
          key={i}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke={RIDGE_COLOR}
          strokeWidth={0.5}
          strokeLinecap="round"
          opacity={0.6}
        />
      ))}

      {/* Landmark icon or indicator */}
      {isLandmark && ridge && (
        building.icon ? (
          <text
            x={(ridge.x1 + ridge.x2) / 2}
            y={(ridge.y1 + ridge.y2) / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            style={{ pointerEvents: "none" }}
          >
            {building.icon}
          </text>
        ) : (
          <circle
            cx={(ridge.x1 + ridge.x2) / 2}
            cy={(ridge.y1 + ridge.y2) / 2}
            r={2}
            fill="#8b7d6b"
            stroke="#f5f0e1"
            strokeWidth={0.5}
          />
        )
      )}

      {/* Landmark name label */}
      {isLandmark && building.name && ridge && (
        <text
          x={(ridge.x1 + ridge.x2) / 2}
          y={(ridge.y1 + ridge.y2) / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={4}
          fill="#5a4d3a"
          fontWeight="500"
          style={{ pointerEvents: "none" }}
        >
          {building.name}
        </text>
      )}

      {/* Selection highlight */}
      {selected && (
        <path
          d={pathData}
          fill="none"
          stroke="#c9a050"
          strokeWidth={2}
          strokeDasharray="3 3"
        />
      )}
    </g>
  );
}
