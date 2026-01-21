import { useRef, useMemo, useCallback } from "react";
import { useGesture } from "@use-gesture/react";
import { motion, useMotionValue } from "framer-motion";
import { Plus, Minus, RotateCcw } from "lucide-react";
import type { SpatialSettlement } from "~/models";
import { WardPolygon } from "./WardPolygon";
import { StreetPath } from "./StreetPath";
import { WallPath } from "./WallPath";
import { SCALE, PARCHMENT_BG, STREET_COLOR } from "./theme-colors";

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

  // Zoom control handlers
  const zoomIn = useCallback(() => {
    const currentScale = scale.get();
    scale.set(Math.min(currentScale + 0.3, 3));
  }, [scale]);

  const zoomOut = useCallback(() => {
    const currentScale = scale.get();
    scale.set(Math.max(currentScale - 0.3, 0.5));
  }, [scale]);

  const resetView = useCallback(() => {
    scale.set(1);
    x.set(0);
    y.set(0);
  }, [scale, x, y]);

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
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[20rem] w-full overflow-hidden touch-none rounded-lg border border-border lg:h-[48rem]"
        style={{ backgroundColor: PARCHMENT_BG }}
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
        {/* SVG Definitions */}
        <defs>
          {/* Parchment grain texture */}
          <pattern id="parchment-grain" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill={PARCHMENT_BG} />
            <circle cx="20" cy="30" r="0.5" fill="#d8ccc0" opacity="0.4" />
            <circle cx="60" cy="10" r="0.3" fill="#e0d4c8" opacity="0.3" />
            <circle cx="80" cy="70" r="0.4" fill="#d0c4b8" opacity="0.35" />
            <circle cx="40" cy="80" r="0.35" fill="#e0d8cc" opacity="0.3" />
            <circle cx="10" cy="60" r="0.45" fill="#d4c8bc" opacity="0.35" />
          </pattern>
          {/* Vignette gradient */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(80, 60, 40, 0.08)" />
          </radialGradient>
        </defs>
        <rect
          x={viewBox.minX}
          y={viewBox.minY}
          width={viewBox.width}
          height={viewBox.height}
          fill={PARCHMENT_BG}
        />
        <rect
          x={viewBox.minX}
          y={viewBox.minY}
          width={viewBox.width}
          height={viewBox.height}
          fill="url(#parchment-grain)"
        />

        {/* Plaza (if present) */}
        {settlement.plaza && (
          <path
            d={polygonToPathData(settlement.plaza.vertices)}
            fill={STREET_COLOR}
            stroke="#8b8070"
            strokeWidth={1}
            opacity={0.7}
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

        {/* Vignette overlay */}
        <rect
          x={viewBox.minX}
          y={viewBox.minY}
          width={viewBox.width}
          height={viewBox.height}
          fill="url(#vignette)"
        />

      </motion.svg>
      </div>

      {/* Zoom controls */}
      <div className="absolute right-2 top-2 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="rounded bg-card/80 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={zoomOut}
          className="rounded bg-card/80 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={resetView}
          className="rounded bg-card/80 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Reset view"
        >
          <RotateCcw size={14} />
        </button>
      </div>
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
