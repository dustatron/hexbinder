import { useMemo, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { Hex, HexCoord, Location } from "~/models";
import { createHexGrid, calculateViewBox } from "~/lib/hex-utils";
import { HexTile } from "./HexTile";

interface HexMapProps {
  hexes: Hex[];
  locations: Location[];
  selectedCoord: HexCoord | null;
  onHexClick: (coord: HexCoord) => void;
}

export function HexMap({
  hexes,
  locations,
  selectedCoord,
  onHexClick,
}: HexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for pan and zoom
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Create honeycomb grid for rendering
  const grid = useMemo(() => createHexGrid(7, 7), []);
  const viewBox = useMemo(() => calculateViewBox(grid), [grid]);

  // Create lookup maps
  const hexByCoord = useMemo(() => {
    const map = new Map<string, Hex>();
    hexes.forEach((hex) => {
      map.set(`${hex.coord.q},${hex.coord.r}`, hex);
    });
    return map;
  }, [hexes]);

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
        <g>
          {Array.from(grid).map((honeycombHex) => {
            const coordKey = `${honeycombHex.q},${honeycombHex.r}`;
            const hexData = hexByCoord.get(coordKey);
            const location = locationByHex.get(coordKey);

            if (!hexData) return null;

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
      </motion.svg>
    </div>
  );
}
