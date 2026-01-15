import type { TownStreet } from "~/models";
import { STREET_COLOR, SCALE } from "./theme-colors";

interface StreetPathProps {
  street: TownStreet;
}

// Street widths - narrow to let buildings dominate
const STREET_WIDTHS = {
  main: 3,
  side: 2,
  alley: 1,
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

/**
 * Street rendered as ground/negative space.
 * In watabou style, streets are the gaps between buildings.
 * This renders subtle paths that blend with parchment background.
 */
export function StreetPath({ street }: StreetPathProps) {
  const pathData = waypointsToPathData(street.waypoints);
  const width = STREET_WIDTHS[street.width];

  if (!pathData) return null;

  return (
    <g className="street-path">
      {/* Street as subtle ground color */}
      <path
        d={pathData}
        stroke={STREET_COLOR}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      {/* Subtle edge for definition */}
      <path
        d={pathData}
        stroke="#a89870"
        strokeWidth={width + 1}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.15}
      />
    </g>
  );
}
