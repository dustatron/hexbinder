import {
  DoorOpen,
  LogOut,
  ArrowRight,
  Square,
  Sparkles,
  Gem,
  Lock,
  Skull,
  AlertTriangle,
  Swords,
  Coins,
} from "lucide-react";
import type { SpatialRoom, DungeonTheme, RoomType } from "~/models";
import { THEME_COLORS, CELL_SIZE, SPECIAL_ROOM_COLORS } from "./theme-colors";

interface RoomRectProps {
  room: SpatialRoom;
  theme: DungeonTheme;
  selected: boolean;
  onClick: () => void;
  roomNumber: number;
}

const ROOM_ICONS: Record<RoomType, React.ComponentType<{ size?: number; className?: string }>> = {
  entrance: DoorOpen,
  exit: LogOut,
  corridor: ArrowRight,
  chamber: Square,
  shrine: Sparkles,
  treasury: Gem,
  prison: Lock,
  lair: Skull,
  trap_room: AlertTriangle,
};

export function RoomRect({ room, theme, selected, onClick, roomNumber }: RoomRectProps) {
  // Use special colors for entrance/exit rooms
  const isEntrance = room.type === "entrance";
  const isExit = room.type === "exit";
  const themeColors = THEME_COLORS[theme] ?? THEME_COLORS.cave; // Fallback to cave colors
  const colors = (isEntrance || isExit)
    ? { ...themeColors, ...SPECIAL_ROOM_COLORS.entrance }
    : themeColors;

  const { x, y, width, height } = room.bounds;

  // Convert grid coordinates to pixels
  const pixelX = x * CELL_SIZE;
  const pixelY = y * CELL_SIZE;
  const pixelWidth = width * CELL_SIZE;
  const pixelHeight = height * CELL_SIZE;

  // Center point for icon
  const centerX = pixelX + pixelWidth / 2;
  const centerY = pixelY + pixelHeight / 2;

  // Check for active content
  const hasMonsters = room.encounters.some((e) => !e.defeated);
  const hasTreasure = room.treasure.some((t) => !t.looted);
  const hasActiveTraps = room.hazards.some((h) => !h.disarmed);

  const Icon = ROOM_ICONS[room.type] ?? Square;

  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      className="room-rect"
    >
      {/* Room rectangle */}
      <rect
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
        fill={colors.fill}
        stroke={selected ? "#f59e0b" : colors.stroke}
        strokeWidth={selected ? 3 : 1.5}
        rx={2}
        ry={2}
      />

      {/* Room type icon centered */}
      <foreignObject
        x={centerX - 8}
        y={centerY - 8}
        width={16}
        height={16}
      >
        <div className="flex items-center justify-center w-full h-full">
          <Icon size={12} className="text-white/80" />
        </div>
      </foreignObject>

      {/* Status indicators in top corners */}
      {hasMonsters && (
        <foreignObject
          x={pixelX + 2}
          y={pixelY + 2}
          width={12}
          height={12}
        >
          <div className="flex items-center justify-center w-full h-full">
            <Swords size={10} className="text-red-400" />
          </div>
        </foreignObject>
      )}

      {hasTreasure && (
        <foreignObject
          x={pixelX + pixelWidth - 14}
          y={pixelY + 2}
          width={12}
          height={12}
        >
          <div className="flex items-center justify-center w-full h-full">
            <Coins size={10} className="text-yellow-400" />
          </div>
        </foreignObject>
      )}

      {/* Trap indicator in bottom left */}
      {hasActiveTraps && (
        <foreignObject
          x={pixelX + 2}
          y={pixelY + pixelHeight - 14}
          width={12}
          height={12}
        >
          <div className="flex items-center justify-center w-full h-full">
            <AlertTriangle size={10} className="text-orange-400" />
          </div>
        </foreignObject>
      )}

      {/* Explored state overlay */}
      {room.explored && (
        <rect
          x={pixelX}
          y={pixelY}
          width={pixelWidth}
          height={pixelHeight}
          fill="rgba(255, 255, 255, 0.1)"
          stroke="none"
          pointerEvents="none"
        />
      )}

      {/* Room number in bottom right */}
      <text
        x={pixelX + pixelWidth - 4}
        y={pixelY + pixelHeight - 4}
        textAnchor="end"
        fontSize={10}
        fontWeight="bold"
        fill="rgba(255, 255, 255, 0.9)"
        pointerEvents="none"
      >
        {roomNumber}
      </text>
    </g>
  );
}
