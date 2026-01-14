import { Circle, Shield } from "lucide-react";
import type { TownWall } from "~/models";
import { WALL_COLOR, SCALE } from "./theme-colors";

interface WallPathProps {
  wall: TownWall;
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

export function WallPath({ wall }: WallPathProps) {
  const pathData = polygonToPathData(wall.shape.vertices);

  if (!pathData) return null;

  return (
    <g className="wall-path">
      {/* Wall outline */}
      <path
        d={pathData}
        fill="none"
        stroke={WALL_COLOR}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crenellation pattern on wall */}
      <path
        d={pathData}
        fill="none"
        stroke={WALL_COLOR}
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.6}
      />

      {/* Gates */}
      {wall.gates.map((gate, index) => (
        <g key={`gate-${index}`}>
          <circle
            cx={gate.x * SCALE}
            cy={gate.y * SCALE}
            r={4}
            fill="#fbbf24"
            stroke={WALL_COLOR}
            strokeWidth={1.5}
          />
          <foreignObject
            x={gate.x * SCALE - 6}
            y={gate.y * SCALE - 6}
            width={12}
            height={12}
          >
            <div className="flex items-center justify-center w-full h-full">
              <Shield size={8} className="text-stone-900" />
            </div>
          </foreignObject>
        </g>
      ))}

      {/* Towers */}
      {wall.towers.map((tower, index) => (
        <g key={`tower-${index}`}>
          <circle
            cx={tower.x * SCALE}
            cy={tower.y * SCALE}
            r={5}
            fill="#57534e"
            stroke={WALL_COLOR}
            strokeWidth={1.5}
          />
          <foreignObject
            x={tower.x * SCALE - 6}
            y={tower.y * SCALE - 6}
            width={12}
            height={12}
          >
            <div className="flex items-center justify-center w-full h-full">
              <Circle size={8} className="text-amber-100" />
            </div>
          </foreignObject>
        </g>
      ))}
    </g>
  );
}
