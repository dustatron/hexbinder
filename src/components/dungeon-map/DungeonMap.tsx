import { useRef, useMemo } from "react";
import { useGesture } from "@use-gesture/react";
import { motion, useMotionValue } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { SpatialDungeon } from "~/models";
import { RoomRect } from "./RoomRect";
import { PassagePath } from "./PassagePath";
import { CELL_SIZE } from "./theme-colors";

interface DungeonMapProps {
  dungeon: SpatialDungeon;
  selectedRoomId: string | null;
  onRoomClick: (roomId: string) => void;
  roomNumberMap: Map<string, number>;
}

export function DungeonMap({
  dungeon,
  selectedRoomId,
  onRoomClick,
  roomNumberMap,
}: DungeonMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for pan and zoom
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Calculate tight viewBox from actual room positions
  const viewBox = useMemo(() => {
    if (dungeon.rooms.length === 0) {
      return { minX: 0, minY: 0, width: 400, height: 400 };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    // Include room bounds
    for (const room of dungeon.rooms) {
      const { x: rx, y: ry, width, height } = room.bounds;
      minX = Math.min(minX, rx);
      minY = Math.min(minY, ry);
      maxX = Math.max(maxX, rx + width);
      maxY = Math.max(maxY, ry + height);
    }

    // Include passage waypoints
    for (const passage of dungeon.passages) {
      for (const wp of passage.waypoints) {
        minX = Math.min(minX, wp.x);
        minY = Math.min(minY, wp.y);
        maxX = Math.max(maxX, wp.x + 1);
        maxY = Math.max(maxY, wp.y + 1);
      }
    }

    // Convert to pixels and add padding
    const padding = CELL_SIZE * 2;
    return {
      minX: minX * CELL_SIZE - padding,
      minY: minY * CELL_SIZE - padding,
      width: (maxX - minX) * CELL_SIZE + padding * 2,
      height: (maxY - minY) * CELL_SIZE + padding * 2,
    };
  }, [dungeon.rooms, dungeon.passages]);

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

  // Zoom control handlers
  const handleZoomIn = () => {
    const currentScale = scale.get();
    scale.set(Math.min(currentScale + 0.25, 3));
  };

  const handleZoomOut = () => {
    const currentScale = scale.get();
    scale.set(Math.max(currentScale - 0.25, 0.5));
  };

  const handleReset = () => {
    scale.set(1);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[32rem] w-full overflow-hidden touch-none rounded-lg bg-stone-900 border border-stone-700"
      {...bind()}
    >
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded bg-stone-800/90 hover:bg-stone-700 border border-stone-600 text-stone-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded bg-stone-800/90 hover:bg-stone-700 border border-stone-600 text-stone-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
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
        {/* Grid background pattern (optional) */}
        <defs>
          <pattern
            id="dungeon-grid"
            width={CELL_SIZE}
            height={CELL_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={0.5}
            />
          </pattern>
        </defs>
        <rect
          x={viewBox.minX}
          y={viewBox.minY}
          width={viewBox.width}
          height={viewBox.height}
          fill="url(#dungeon-grid)"
        />

        {/* Passages layer (render first, under rooms) */}
        <g className="passages">
          {dungeon.passages.map((passage) => (
            <PassagePath
              key={passage.id}
              passage={passage}
              theme={dungeon.theme}
            />
          ))}
        </g>

        {/* Rooms layer */}
        <g className="rooms">
          {dungeon.rooms.map((room) => (
            <RoomRect
              key={room.id}
              room={room}
              theme={dungeon.theme}
              selected={room.id === selectedRoomId}
              onClick={() => onRoomClick(room.id)}
              roomNumber={roomNumberMap.get(room.id) ?? 0}
            />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}
