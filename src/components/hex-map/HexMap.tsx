import { useMemo, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import { motion, useMotionValue } from "framer-motion";
import type { Hex, HexCoord, Location, HexEdge } from "~/models";
import { Tile, HEX_SIZE } from "~/lib/hex-utils";
import { HexTile } from "./HexTile";

interface HexMapProps {
  hexes: Hex[];
  edges: HexEdge[];
  locations: Location[];
  selectedCoord: HexCoord | null;
  onHexClick: (coord: HexCoord) => void;
}

export function HexMap({
  hexes,
  edges,
  locations,
  selectedCoord,
  onHexClick,
}: HexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for pan and zoom
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Create honeycomb hex instances for each world hex
  const honeycombHexes = useMemo(() => {
    return hexes.map(hex => new Tile(hex.coord));
  }, [hexes]);

  // Calculate viewBox from actual hex positions
  const viewBox = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    honeycombHexes.forEach(hex => {
      hex.corners.forEach(corner => {
        minX = Math.min(minX, corner.x);
        minY = Math.min(minY, corner.y);
        maxX = Math.max(maxX, corner.x);
        maxY = Math.max(maxY, corner.y);
      });
    });
    const padding = HEX_SIZE * 0.5;
    return {
      minX: minX - padding,
      minY: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [honeycombHexes]);

  // Create hex center lookup for edge rendering
  const hexCenters = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    honeycombHexes.forEach(hex => {
      map.set(`${hex.q},${hex.r}`, { x: hex.x, y: hex.y });
    });
    return map;
  }, [honeycombHexes]);

  // Create location lookup map
  const locationByHex = useMemo(() => {
    const map = new Map<string, Location>();
    locations.forEach((loc) => {
      map.set(`${loc.hexCoord.q},${loc.hexCoord.r}`, loc);
    });
    return map;
  }, [locations]);

  // Gesture bindings
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy] }) => {
        x.set(ox);
        y.set(oy);
      },
      onPinch: ({ offset: [s] }) => {
        // Clamp scale between 0.5 and 2
        scale.set(Math.min(Math.max(s, 0.5), 2));
      },
      onWheel: ({ delta: [, dy] }) => {
        // Zoom with mouse wheel
        const currentScale = scale.get();
        const newScale = Math.min(Math.max(currentScale - dy * 0.001, 0.5), 2);
        scale.set(newScale);
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
      pinch: {
        from: () => [scale.get(), 0],
        scaleBounds: { min: 0.5, max: 2 },
      },
    }
  );

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden touch-none"
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
        {/* Render hex tiles first (background) */}
        <g>
          {honeycombHexes.map((honeycombHex, index) => {
            const hexData = hexes[index];
            const coordKey = `${hexData.coord.q},${hexData.coord.r}`;
            const location = locationByHex.get(coordKey);

            const isSelected =
              selectedCoord?.q === hexData.coord.q &&
              selectedCoord?.r === hexData.coord.r;

            return (
              <HexTile
                key={coordKey}
                honeycombHex={honeycombHex}
                hexData={hexData}
                locationType={location?.type}
                isSelected={isSelected}
                onClick={onHexClick}
              />
            );
          })}
        </g>
        {/* Render edges (roads/rivers) on top */}
        <g>
          {edges.map((edge, index) => {
            const fromKey = `${edge.from.q},${edge.from.r}`;
            const toKey = `${edge.to.q},${edge.to.r}`;
            const fromCenter = hexCenters.get(fromKey);
            const toCenter = hexCenters.get(toKey);
            if (!fromCenter || !toCenter) return null;

            const isRiver = edge.type === "river";

            if (isRiver) {
              // Curved river using quadratic bezier
              const midX = (fromCenter.x + toCenter.x) / 2;
              const midY = (fromCenter.y + toCenter.y) / 2;
              // Perpendicular offset for curve
              const dx = toCenter.x - fromCenter.x;
              const dy = toCenter.y - fromCenter.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              // Alternate curve direction based on index for variety
              const curveDir = index % 2 === 0 ? 1 : -1;
              const offset = len * 0.16 * curveDir;
              const ctrlX = midX + (-dy / len) * offset;
              const ctrlY = midY + (dx / len) * offset;

              return (
                <path
                  key={`edge-${index}`}
                  d={`M ${fromCenter.x} ${fromCenter.y} Q ${ctrlX} ${ctrlY} ${toCenter.x} ${toCenter.y}`}
                  stroke="#60a5fa"
                  strokeWidth={6}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            }

            // Curved road using quadratic bezier
            const midX = (fromCenter.x + toCenter.x) / 2;
            const midY = (fromCenter.y + toCenter.y) / 2;
            const dx = toCenter.x - fromCenter.x;
            const dy = toCenter.y - fromCenter.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const curveDir = index % 2 === 0 ? 1 : -1;
            const offset = len * 0.12 * curveDir;
            const ctrlX = midX + (-dy / len) * offset;
            const ctrlY = midY + (dx / len) * offset;

            return (
              <path
                key={`edge-${index}`}
                d={`M ${fromCenter.x} ${fromCenter.y} Q ${ctrlX} ${ctrlY} ${toCenter.x} ${toCenter.y}`}
                stroke="#78716c"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="8 4"
                fill="none"
              />
            );
          })}
        </g>
      </motion.svg>
    </div>
  );
}
