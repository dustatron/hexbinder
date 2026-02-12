import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import type { Hex, HexCoord, Location, HexEdge, Dungeon, Settlement } from "~/models";
import { Tile, HEX_SIZE } from "~/lib/hex-utils";
import { HexTile } from "./HexTile";

const MAX_LABEL_CHARS = 10;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 6;
const WHEEL_ZOOM_SPEED = 0.002;
const ZOOM_BUTTON_FACTOR = 1.4;

/**
 * Split a label into multiple lines for better readability.
 */
function splitLabel(name: string): string[] {
  if (name.length <= MAX_LABEL_CHARS) {
    return [name];
  }
  const mid = Math.floor(name.length / 2);
  const spaceIndex = name.lastIndexOf(" ", mid + 3);
  if (spaceIndex > 2) {
    return [name.slice(0, spaceIndex), name.slice(spaceIndex + 1)];
  }
  const splitAt = Math.min(MAX_LABEL_CHARS - 1, mid);
  return [name.slice(0, splitAt) + "-", name.slice(splitAt)];
}

interface HexMapProps {
  hexes: Hex[];
  edges: HexEdge[];
  locations: Location[];
  selectedCoord: HexCoord | null;
  currentHexId: string | null;
  visitedHexIds: string[];
  onHexClick: (coord: HexCoord) => void;
  onHexDoubleClick?: (coord: HexCoord) => void;
  showLabels?: boolean;
  initialZoom?: number;
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
  initialZoom = 1,
}: HexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Create honeycomb hex instances for each world hex
  const honeycombHexes = useMemo(() => {
    return hexes.map((hex) => new Tile(hex.coord));
  }, [hexes]);

  // Calculate world bounds from hex positions
  const worldBounds = useMemo(() => {
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
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [honeycombHexes]);

  // ViewBox-based pan/zoom state
  // centerX/Y = center of the view in SVG coordinates
  // zoom = multiplier (1 = fit whole map, 2 = zoomed in 2x)
  const [camera, setCamera] = useState(() => ({
    centerX: worldBounds.x + worldBounds.width / 2,
    centerY: worldBounds.y + worldBounds.height / 2,
    zoom: initialZoom,
  }));

  // Compute the viewBox from camera state + container size
  const getViewBox = useCallback(() => {
    const baseWidth = worldBounds.width;
    const baseHeight = worldBounds.height;
    const vw = baseWidth / camera.zoom;
    const vh = baseHeight / camera.zoom;
    return {
      x: camera.centerX - vw / 2,
      y: camera.centerY - vh / 2,
      width: vw,
      height: vh,
    };
  }, [worldBounds, camera]);

  const vb = getViewBox();

  // Persist zoom to localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem("hexbinder:zoom", String(camera.zoom));
      } catch {}
    }, 300);
    return () => clearTimeout(timeout);
  }, [camera.zoom]);

  // Convert screen pixels to SVG units based on current view
  const screenToSvgScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 1;
    return vb.width / el.clientWidth;
  }, [vb.width]);

  // Gesture bindings
  const bind = useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        event.preventDefault();
        const s = screenToSvgScale();
        setCamera((prev) => ({
          ...prev,
          centerX: prev.centerX - dx * s,
          centerY: prev.centerY - dy * s,
        }));
      },
      onPinch: ({ offset: [s] }) => {
        const newZoom = Math.min(Math.max(s, MIN_ZOOM), MAX_ZOOM);
        setCamera((prev) => ({ ...prev, zoom: newZoom }));
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        setCamera((prev) => {
          const factor = 1 - dy * WHEEL_ZOOM_SPEED;
          const newZoom = Math.min(
            Math.max(prev.zoom * factor, MIN_ZOOM),
            MAX_ZOOM
          );
          return { ...prev, zoom: newZoom };
        });
      },
    },
    {
      drag: {
        filterTaps: true,
      },
      pinch: {
        from: () => [camera.zoom, 0],
        scaleBounds: { min: MIN_ZOOM, max: MAX_ZOOM },
      },
      wheel: {
        eventOptions: { passive: false },
      },
    }
  );

  // Zoom control handlers
  const handleZoomIn = () => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * ZOOM_BUTTON_FACTOR, MAX_ZOOM),
    }));
  };

  const handleZoomOut = () => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / ZOOM_BUTTON_FACTOR, MIN_ZOOM),
    }));
  };

  const handleReset = () => {
    setCamera({
      centerX: worldBounds.x + worldBounds.width / 2,
      centerY: worldBounds.y + worldBounds.height / 2,
      zoom: 1,
    });
  };

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
      <svg
        className="h-full w-full"
        viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
        preserveAspectRatio="xMidYMid meet"
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

            const dungeonTheme =
              location?.type === "dungeon"
                ? (location as Dungeon).theme
                : undefined;

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
              const midX = (fromCenter.x + toCenter.x) / 2;
              const midY = (fromCenter.y + toCenter.y) / 2;
              const dx = toCenter.x - fromCenter.x;
              const dy = toCenter.y - fromCenter.y;
              const len = Math.sqrt(dx * dx + dy * dy);
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
      </svg>
    </div>
  );
}
