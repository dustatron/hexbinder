import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { District, Faction } from "~/models";

const DISTRICT_TYPE_ICONS: Record<string, string> = {
  market: "🏪",
  temple: "⛪",
  noble: "👑",
  slums: "🏚️",
  docks: "⚓",
  warehouse: "📦",
  artisan: "🔨",
  military: "⚔️",
  academic: "📜",
  foreign: "🌍",
  residential: "🏠",
  ruins: "💀",
  cannery: "🐟",
  smelter: "🔥",
  lumber_yard: "🪵",
  caravan: "🐪",
  arcane_academy: "✨",
  arena: "🏟️",
  foundry: "⚙️",
};

const MOOD_COLORS: Record<string, string> = {
  bustling: "#22c55e",
  quiet: "#6b7280",
  dangerous: "#ef4444",
  decaying: "#78716c",
  prosperous: "#eab308",
  oppressed: "#9333ea",
  festive: "#f97316",
  tense: "#f59e0b",
};

const CONNECTION_STYLES: Record<string, { dash: string; label: string }> = {
  street: { dash: "", label: "" },
  bridge: { dash: "8,4", label: "bridge" },
  gate: { dash: "4,4", label: "gate" },
  tunnel: { dash: "2,6", label: "tunnel" },
};

interface DistrictNodeMapProps {
  districts: District[];
  factions: Faction[];
  worldId: string;
  locationId: string;
}

export function DistrictNodeMap({ districts, factions, worldId, locationId }: DistrictNodeMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (districts.length === 0) return null;

  // Calculate SVG bounds
  const padding = 60;
  const nodeW = 140;
  const nodeH = 50;
  const positions = districts.map(d => d.position);
  const minX = Math.min(...positions.map(p => p.x)) - padding;
  const maxX = Math.max(...positions.map(p => p.x)) + nodeW + padding;
  const minY = Math.min(...positions.map(p => p.y)) - padding;
  const maxY = Math.max(...positions.map(p => p.y)) + nodeH + padding;
  const width = maxX - minX;
  const height = maxY - minY;

  // Build edge set (avoid drawing duplicates)
  const drawnEdges = new Set<string>();

  const factionMap = new Map(factions.map(f => [f.id, f]));

  const getFactionColor = (factionId?: string): string => {
    if (!factionId) return "#44403c"; // stone-700
    const idx = factions.findIndex(f => f.id === factionId);
    const colors = ["#a855f7", "#3b82f6", "#ef4444", "#22c55e", "#f97316", "#06b6d4"];
    return colors[idx % colors.length];
  };

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: 400 }}
    >
      {/* Edges */}
      {districts.map(district =>
        district.adjacencies.map(adj => {
          const edgeKey = [district.id, adj.districtId].sort().join("-");
          if (drawnEdges.has(edgeKey)) return null;
          drawnEdges.add(edgeKey);

          const target = districts.find(d => d.id === adj.districtId);
          if (!target) return null;

          const style = CONNECTION_STYLES[adj.connectionType] ?? CONNECTION_STYLES.street;
          const x1 = district.position.x + nodeW / 2;
          const y1 = district.position.y + nodeH / 2;
          const x2 = target.position.x + nodeW / 2;
          const y2 = target.position.y + nodeH / 2;

          return (
            <g key={edgeKey}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#57534e"
                strokeWidth={2}
                strokeDasharray={style.dash || undefined}
              />
              {style.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 4}
                  textAnchor="middle"
                  className="fill-stone-500 text-[8px]"
                >
                  {style.label}
                </text>
              )}
            </g>
          );
        })
      )}

      {/* Nodes */}
      {districts.map(district => {
        const { x, y } = district.position;
        const isHovered = hoveredId === district.id;
        const isRuins = district.type === "ruins";
        const borderColor = getFactionColor(district.controllingFactionId);
        const isContested = district.contestedByFactionIds && district.contestedByFactionIds.length > 0;
        const moodColor = MOOD_COLORS[district.mood] ?? "#6b7280";
        const icon = DISTRICT_TYPE_ICONS[district.type] ?? "🏘️";

        return (
          <Link
            key={district.id}
            to="/world/$worldId/location/$locationId/district/$districtId"
            params={{ worldId, locationId, districtId: district.id }}
          >
            <g
              onMouseEnter={() => setHoveredId(district.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              {/* Node background */}
              <rect
                x={x} y={y}
                width={nodeW} height={nodeH}
                rx={8}
                fill={isHovered ? "#44403c" : "#292524"}
                stroke={borderColor}
                strokeWidth={isContested ? 3 : 2}
                strokeDasharray={isRuins ? "4,3" : isContested ? "6,3" : undefined}
                opacity={isRuins ? 0.7 : 1}
              />

              {/* Mood dot */}
              <circle
                cx={x + 12} cy={y + 14}
                r={4}
                fill={moodColor}
              />

              {/* Icon */}
              <text x={x + 24} y={y + 18} className="text-[12px]">
                {icon}
              </text>

              {/* District name */}
              <text
                x={x + 40} y={y + 18}
                className="fill-stone-200 text-[11px] font-medium"
              >
                {district.name.length > 14
                  ? district.name.slice(0, 14) + "..."
                  : district.name}
              </text>

              {/* Type label */}
              <text
                x={x + 12} y={y + 36}
                className="fill-stone-400 text-[9px]"
              >
                {district.type.replace(/_/g, " ")}
              </text>

              {/* Faction indicator */}
              {district.controllingFactionId && (
                <text
                  x={x + nodeW - 12} y={y + 36}
                  textAnchor="end"
                  className="text-[9px]"
                  fill={borderColor}
                >
                  {factionMap.get(district.controllingFactionId)?.name.split(" ").pop() ?? ""}
                </text>
              )}

              {/* Hover tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 10} y={y + nodeH + 4}
                    width={nodeW + 20} height={36}
                    rx={4}
                    fill="#1c1917"
                    stroke="#57534e"
                    strokeWidth={1}
                  />
                  <text
                    x={x + nodeW / 2} y={y + nodeH + 18}
                    textAnchor="middle"
                    className="fill-stone-300 text-[9px]"
                  >
                    {district.trouble.length > 40
                      ? district.trouble.slice(0, 40) + "..."
                      : district.trouble}
                  </text>
                  <text
                    x={x + nodeW / 2} y={y + nodeH + 30}
                    textAnchor="middle"
                    className="fill-amber-400 text-[9px]"
                  >
                    Face: {districts.length > 0 ? "click to view" : ""}
                  </text>
                </g>
              )}
            </g>
          </Link>
        );
      })}
    </svg>
  );
}
