import { useRef, useMemo } from "react";
import { useGesture } from "@use-gesture/react";
import { motion, useMotionValue } from "framer-motion";
import type { SpatialSettlement } from "~/models";
import { WardPolygon } from "./WardPolygon";
import { StreetPath } from "./StreetPath";
import { WallPath } from "./WallPath";
import { SCALE } from "./theme-colors";

interface TownMapProps {
  settlement: SpatialSettlement;
  selectedBuildingId?: string;
  selectedWardId?: string;
  onBuildingClick?: (buildingId: string) => void;
  onWardClick?: (wardId: string) => void;
}

export function TownMap({
  settlement,
  selectedBuildingId,
  selectedWardId,
  onBuildingClick,
  onWardClick,
}: TownMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for pan and zoom
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Calculate viewBox from settlement center and radius
  const viewBox = useMemo(() => {
    const { center, radius } = settlement;
    const padding = radius * 0.2; // 20% padding

    return {
      minX: (center.x - radius - padding) * SCALE,
      minY: (center.y - radius - padding) * SCALE,
      width: (radius * 2 + padding * 2) * SCALE,
      height: (radius * 2 + padding * 2) * SCALE,
    };
  }, [settlement.center, settlement.radius]);

  // Gesture bindings
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy] }) => {
        x.set(ox);
        y.set(oy);
      },
      onPinch: ({ offset: [s] }) => {
        scale.set(Math.min(Math.max(s, 0.5), 3));
      },
      onWheel: ({ delta: [, dy] }) => {
        const currentScale = scale.get();
        const newScale = Math.min(Math.max(currentScale - dy * 0.001, 0.5), 3);
        scale.set(newScale);
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
      pinch: {
        from: () => [scale.get(), 0],
        scaleBounds: { min: 0.5, max: 3 },
      },
    }
  );

  return (
    <div
      ref={containerRef}
      className="h-96 w-full overflow-hidden touch-none rounded-lg bg-amber-50 border border-stone-300"
      {...bind()}
    >
      <motion.svg
        className="h-full w-full"
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          x,
          y,
          scale,
        }}
      >
        {/* Background */}
        <rect
          x={viewBox.minX}
          y={viewBox.minY}
          width={viewBox.width}
          height={viewBox.height}
          fill="#fefce8"
        />

        {/* Plaza (if present) */}
        {settlement.plaza && (
          <path
            d={polygonToPathData(settlement.plaza.vertices)}
            fill="#e7e5e4"
            stroke="#78716c"
            strokeWidth={1}
            opacity={0.5}
          />
        )}

        {/* Streets layer (render first, under wards) */}
        <g className="streets">
          {settlement.streets.map((street) => (
            <StreetPath key={street.id} street={street} />
          ))}
        </g>

        {/* Wards layer */}
        <g className="wards">
          {settlement.wards.map((ward) => (
            <WardPolygon
              key={ward.id}
              ward={ward}
              selectedBuildingId={selectedBuildingId}
              selectedWardId={selectedWardId}
              onBuildingClick={onBuildingClick}
              onWardClick={onWardClick}
            />
          ))}
        </g>

        {/* Wall layer (on top) */}
        {settlement.wall && <WallPath wall={settlement.wall} />}

        {/* Center marker for town center */}
        <circle
          cx={settlement.center.x * SCALE}
          cy={settlement.center.y * SCALE}
          r={3}
          fill="#f59e0b"
          stroke="#78716c"
          strokeWidth={1}
        />
      </motion.svg>
    </div>
  );
}

/** Helper to convert polygon vertices to SVG path data */
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
