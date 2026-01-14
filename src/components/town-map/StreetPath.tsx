import type { TownStreet } from "~/models";
import { STREET_COLOR, SCALE } from "./theme-colors";

interface StreetPathProps {
  street: TownStreet;
}

const STREET_WIDTHS = {
  main: 6,
  side: 4,
  alley: 2,
};

/** Convert waypoints to SVG path data */
function waypointsToPathData(waypoints: { x: number; y: number }[]): string {
  if (waypoints.length < 2) return "";

  const points = waypoints.map((wp) => ({
    x: wp.x * SCALE,
    y: wp.y * SCALE,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

export function StreetPath({ street }: StreetPathProps) {
  const pathData = waypointsToPathData(street.waypoints);
  const width = STREET_WIDTHS[street.width];

  if (!pathData) return null;

  return (
    <g className="street-path">
      <path
        d={pathData}
        stroke={STREET_COLOR}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* Center line for main streets */}
      {street.width === "main" && (
        <path
          d={pathData}
          stroke="#a8a29e"
          strokeWidth={0.5}
          fill="none"
          strokeDasharray="2 2"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}
