import { useMemo, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import { motion, useMotionValue } from "framer-motion";
import { Plus, Minus, RotateCcw } from "lucide-react";
import type { Hex, HexCoord, Location, HexEdge, Dungeon, Settlement } from "~/models";
import { Tile, HEX_SIZE } from "~/lib/hex-utils";
import { HexTile } from "./HexTile";

const MAX_LABEL_CHARS = 10;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

/**
 * Split a label into multiple lines for better readability.
 * Tries to split at word boundaries, falls back to mid-word split.
 */
function splitLabel(name: string): string[] {
  if (name.length <= MAX_LABEL_CHARS) {
    return [name];
  }

  // Try to split at a space near the middle
  const mid = Math.floor(name.length / 2);
  const spaceIndex = name.lastIndexOf(" ", mid + 3);

  if (spaceIndex > 2) {
    return [name.slice(0, spaceIndex), name.slice(spaceIndex + 1)];
  }

  // No good space - split mid-word with hyphen
  const splitAt = Math.min(MAX_LABEL_CHARS - 1, mid);
  return [name.slice(0, splitAt) + "-", name.slice(splitAt)];
}

interface HexMapProps {
  hexes: Hex[];
  edges: HexEdge[];
  locations: Location[];
  selectedCoord: HexCoord | null;
  currentHexId: string | null; // Party's current location (format: "q,r")
  visitedHexIds: string[]; // Hexes party has visited (format: "q,r")
  onHexClick: (coord: HexCoord) => void;
  onHexDoubleClick?: (coord: HexCoord) => void;
  showLabels?: boolean;
}

export function HexMap({
  hexes,
  edges,
  locations,
  selectedCoord,
  currentHexId,
  visitedHexIds,
  onHexClick,
  onHexDoubleClick,
  showLabels = false,
}: HexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for pan and zoom
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Create honeycomb hex instances for each world hex
  const honeycombHexes = useMemo(() => {
    return hexes.map((hex) => new Tile(hex.coord));
  }, [hexes]);

  // Calculate viewBox from actual hex positions
  const viewBox = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    honeycombHexes.forEach((hex) => {
      hex.corners.forEach((corner) => {
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
    honeycombHexes.forEach((hex) => {
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

  // Create visited set for O(1) lookup
  const visitedSet = useMemo(() => new Set(visitedHexIds), [visitedHexIds]);

  // Gesture bindings
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy] }) => {
        x.set(ox);
        y.set(oy);
      },
      onPinch: ({ offset: [s] }) => {
        scale.set(Math.min(Math.max(s, MIN_ZOOM), MAX_ZOOM));
      },
      onWheel: ({ delta: [, dy] }) => {
        // Zoom with mouse wheel
        const currentScale = scale.get();
        const newScale = Math.min(Math.max(currentScale - dy * 0.001, MIN_ZOOM), MAX_ZOOM);
        scale.set(newScale);
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
      pinch: {
        from: () => [scale.get(), 0],
        scaleBounds: { min: MIN_ZOOM, max: MAX_ZOOM },
      },
    },
  );

  // Zoom control handlers
  const handleZoomIn = () => {
    const currentScale = scale.get();
    scale.set(Math.min(currentScale * 1.3, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    const currentScale = scale.get();
    scale.set(Math.max(currentScale / 1.3, MIN_ZOOM));
  };

  const handleReset = () => {
    scale.set(1);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden touch-none"
      {...bind()}
    >
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded bg-stone-800/90 hover:bg-stone-700 border border-stone-600 text-stone-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded bg-stone-800/90 hover:bg-stone-700 border border-stone-600 text-stone-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded bg-stone-800/90 hover:bg-stone-700 border border-stone-600 text-stone-300 hover:text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>
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
        {/* Render hex tiles with icons */}
        <g>
          {honeycombHexes.map((honeycombHex, index) => {
            const hexData = hexes[index];
            const coordKey = `${hexData.coord.q},${hexData.coord.r}`;
            const location = locationByHex.get(coordKey);

            const isSelected =
              selectedCoord?.q === hexData.coord.q &&
              selectedCoord?.r === hexData.coord.r;

            // Get dungeon theme if location is a dungeon
            const dungeonTheme =
              location?.type === "dungeon"
                ? (location as Dungeon).theme
                : undefined;

            // Check if settlement is a capital
            const isCapital =
              location?.type === "settlement"
                ? (location as Settlement).isCapital
                : false;

            const isCurrent = currentHexId === coordKey;
            const isVisited = visitedSet.has(coordKey);

            return (
              <HexTile
                key={coordKey}
                honeycombHex={honeycombHex}
                hexData={hexData}
                locationType={location?.type}
                dungeonTheme={dungeonTheme}
                isCapital={isCapital}
                isSelected={isSelected}
                isCurrent={isCurrent}
                isVisited={isVisited}
                onClick={onHexClick}
                onDoubleClick={onHexDoubleClick}
              />
            );
          })}
        </g>
        {/* Render edges (roads/rivers) */}
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
                  opacity={0.7}
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
                opacity={0.7}
              />
            );
          })}
        </g>
        {/* Render labels in separate layer on top of everything */}
        {showLabels && (
          <g>
            {honeycombHexes.map((honeycombHex, index) => {
              const hexData = hexes[index];
              const coordKey = `${hexData.coord.q},${hexData.coord.r}`;
              const location = locationByHex.get(coordKey);
              if (!location) return null;

              const lines = splitLabel(location.name);
              // Offset first line up if multi-line so label stays centered below icon
              const baseY = honeycombHex.y + 20;
              const startY = lines.length > 1 ? baseY - 5 : baseY;

              return (
                <text
                  key={`label-${coordKey}`}
                  x={honeycombHex.x}
                  y={startY}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#1c1917"
                  stroke="#fafaf9"
                  strokeWidth={2}
                  paintOrder="stroke"
                  style={{ pointerEvents: "none" }}
                >
                  {lines.map((line, i) => (
                    <tspan
                      key={i}
                      x={honeycombHex.x}
                      dy={i === 0 ? 0 : 11}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            })}
          </g>
        )}
      </motion.svg>
    </div>
  );
}
