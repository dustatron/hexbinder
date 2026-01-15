import { AlertTriangle } from "lucide-react";
import type { Passage, DungeonTheme } from "~/models";
import { THEME_COLORS, CELL_SIZE, PASSAGE_WIDTH } from "./theme-colors";

interface PassagePathProps {
  passage: Passage;
  theme: DungeonTheme;
}

/** Convert waypoints to SVG path data */
function waypointsToPathData(waypoints: { x: number; y: number }[]): string {
  if (waypoints.length < 2) return "";

  const points = waypoints.map((wp) => ({
    x: wp.x * CELL_SIZE + CELL_SIZE / 2,
    y: wp.y * CELL_SIZE + CELL_SIZE / 2,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

export function PassagePath({ passage, theme }: PassagePathProps) {
  const colors = THEME_COLORS[theme];
  const pathData = waypointsToPathData(passage.waypoints);

  if (!pathData) return null;

  // Calculate trap marker position (midpoint of passage)
  const hasTrap = passage.trap && !passage.trap.disarmed;
  const midIndex = Math.floor(passage.waypoints.length / 2);
  const trapPos = passage.waypoints[midIndex];

  return (
    <g className="passage">
      {/* Main passage line */}
      <path
        d={pathData}
        stroke={colors.passage}
        strokeWidth={PASSAGE_WIDTH}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Secret passage dashing */}
      {passage.hidden && (
        <path
          d={pathData}
          stroke="#a3a3a3"
          strokeWidth={2}
          fill="none"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      )}
      {/* Door marker at start */}
      {passage.connectionType === "door" && passage.waypoints.length >= 2 && (
        <DoorMarker
          x={passage.waypoints[0].x}
          y={passage.waypoints[0].y}
          locked={passage.locked}
        />
      )}
      {/* Trap marker at midpoint */}
      {hasTrap && trapPos && (
        <TrapMarker x={trapPos.x} y={trapPos.y} />
      )}
    </g>
  );
}

interface DoorMarkerProps {
  x: number;
  y: number;
  locked: boolean;
}

function DoorMarker({ x, y, locked }: DoorMarkerProps) {
  const cx = x * CELL_SIZE + CELL_SIZE / 2;
  const cy = y * CELL_SIZE + CELL_SIZE / 2;
  const size = 4;

  return (
    <g>
      <rect
        x={cx - size}
        y={cy - size / 2}
        width={size * 2}
        height={size}
        fill={locked ? "#ef4444" : "#fbbf24"}
        stroke="#1f2937"
        strokeWidth={1}
      />
    </g>
  );
}

interface TrapMarkerProps {
  x: number;
  y: number;
}

function TrapMarker({ x, y }: TrapMarkerProps) {
  const cx = x * CELL_SIZE + CELL_SIZE / 2;
  const cy = y * CELL_SIZE + CELL_SIZE / 2;

  return (
    <foreignObject
      x={cx - 6}
      y={cy - 6}
      width={12}
      height={12}
    >
      <div className="flex items-center justify-center w-full h-full">
        <AlertTriangle size={10} className="text-orange-400" />
      </div>
    </foreignObject>
  );
}
