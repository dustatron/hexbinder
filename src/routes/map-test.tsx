import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import { generateStreetFirstTown, type StreetFirstOutput, type PlacedBuilding } from "~/generators/StreetFirstTownGenerator";
import { SeededRandom } from "~/generators/SeededRandom";
import type { SettlementSize } from "~/models";

export const Route = createFileRoute("/map-test")({
  component: MapTest,
});

// === Colors ===
const PARCHMENT_BG = "#f5f0e1";
const STREET_COLOR = "#c9bc9c";
const BUILDING_FILL = "#e8e0d0";
const BUILDING_STROKE = "#6b5c4a";
const BUILDING_HOVER = "#d8d0c0";
const LANDMARK_FILL = "#d0c8b8";
const LANDMARK_STROKE = "#4a3c2a";
const PLAZA_FILL = "#d4c8a8";
const SELECTED_STROKE = "#c9a050";

const SCALE = 2;

function MapTest() {
  const [seed, setSeed] = useState(() => `seed-${Date.now()}`);
  const [size, setSize] = useState<SettlementSize>("village");
  const [selectedBuilding, setSelectedBuilding] = useState<PlacedBuilding | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const town = useMemo(() => {
    const rng = new SeededRandom(seed);
    return generateStreetFirstTown(size, rng);
  }, [seed, size]);

  const regenerate = useCallback(() => {
    setSeed(`seed-${Date.now()}`);
    setSelectedBuilding(null);
  }, []);

  const changeSize = useCallback((newSize: SettlementSize) => {
    setSize(newSize);
    setSeed(`seed-${Date.now()}`);
    setSelectedBuilding(null);
  }, []);

  const handleBuildingClick = useCallback((building: PlacedBuilding) => {
    setSelectedBuilding(building);
    console.log("Clicked building:", building);
    // In a real app, this would navigate to the location detail page:
    // navigate({ to: `/location/${building.locationId}` })
  }, []);

  // Calculate viewBox
  const padding = town.radius * 0.25;
  const viewBox = {
    minX: (-town.radius - padding) * SCALE,
    minY: (-town.radius - padding) * SCALE,
    width: (town.radius * 2 + padding * 2) * SCALE,
    height: (town.radius * 2 + padding * 2) * SCALE,
  };

  // Calculate label positions (center of building)
  const getLabelPosition = (vertices: { x: number; y: number }[]) => {
    const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    return { x: cx * SCALE, y: cy * SCALE };
  };

  return (
    <div className="min-h-screen bg-stone-900 p-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-100">🗺️ Town Map</h1>
          <div className="flex gap-2">
            {(["thorpe", "hamlet", "village", "town", "city"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => changeSize(s)}
                  className={`rounded px-3 py-1 text-sm capitalize ${
                    size === s
                      ? "bg-amber-600 text-white"
                      : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                  }`}
                >
                  {s}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-stone-400">
          <span>Streets: {town.streets.length}</span>
          <span>|</span>
          <span>Buildings: {town.buildings.length}</span>
          <span>|</span>
          <span>Landmarks: {town.landmarks.length}</span>
          <button
            onClick={regenerate}
            className="ml-4 rounded bg-amber-600 px-3 py-1 font-medium text-white hover:bg-amber-500"
          >
            🎲 Regenerate
          </button>
        </div>

        <div className="flex gap-4">
          {/* Map container */}
          <div
            className="flex-1 h-[650px] rounded-lg border border-stone-600 overflow-hidden"
            style={{ backgroundColor: PARCHMENT_BG }}
          >
            <svg
              className="h-full w-full"
              viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background */}
              <rect
                x={viewBox.minX}
                y={viewBox.minY}
                width={viewBox.width}
                height={viewBox.height}
                fill={PARCHMENT_BG}
              />

              {/* Streets */}
              {town.streets.map((street) => (
                <polyline
                  key={street.id}
                  points={street.waypoints
                    .map((p) => `${p.x * SCALE},${p.y * SCALE}`)
                    .join(" ")}
                  stroke={STREET_COLOR}
                  strokeWidth={street.width === "main" ? 10 : street.width === "side" ? 6 : 4}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Plaza */}
              {town.plaza && (
                <polygon
                  points={town.plaza.vertices
                    .map((v) => `${v.x * SCALE},${v.y * SCALE}`)
                    .join(" ")}
                  fill={PLAZA_FILL}
                  stroke={BUILDING_STROKE}
                  strokeWidth={1.5}
                />
              )}

              {/* Buildings */}
              {town.buildings.map((building) => {
                const isHovered = hoveredId === building.id;
                const isSelected = selectedBuilding?.id === building.id;

                return (
                  <polygon
                    key={building.id}
                    points={building.vertices
                      .map((v) => `${v.x * SCALE},${v.y * SCALE}`)
                      .join(" ")}
                    fill={isHovered ? BUILDING_HOVER : BUILDING_FILL}
                    stroke={isSelected ? SELECTED_STROKE : BUILDING_STROKE}
                    strokeWidth={isSelected ? 2 : 0.8}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredId(building.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleBuildingClick(building)}
                  />
                );
              })}

              {/* Landmarks */}
              {town.landmarks.map((landmark) => {
                const isHovered = hoveredId === landmark.id;
                const isSelected = selectedBuilding?.id === landmark.id;
                const labelPos = getLabelPosition(landmark.vertices);

                return (
                  <g key={landmark.id}>
                    {/* Building shape */}
                    <polygon
                      points={landmark.vertices
                        .map((v) => `${v.x * SCALE},${v.y * SCALE}`)
                        .join(" ")}
                      fill={isHovered ? BUILDING_HOVER : LANDMARK_FILL}
                      stroke={isSelected ? SELECTED_STROKE : LANDMARK_STROKE}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredId(landmark.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => handleBuildingClick(landmark)}
                    />
                    {/* Icon */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      style={{ pointerEvents: "none" }}
                    >
                      {landmark.icon}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>

          {/* Detail Panel */}
          <div className="w-64 rounded-lg bg-stone-800 p-4">
            <h2 className="text-lg font-bold text-stone-100 mb-4">Location Details</h2>

            {selectedBuilding ? (
              <div className="space-y-3">
                <div className="text-3xl text-center">{selectedBuilding.icon || "🏠"}</div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-stone-100">
                    {selectedBuilding.name || "House"}
                  </div>
                  <div className="text-sm text-stone-400">
                    {selectedBuilding.type === "landmark" ? "Key Location" : "Residence"}
                  </div>
                </div>

                {selectedBuilding.locationId && (
                  <button
                    className="w-full mt-4 rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500"
                    onClick={() => {
                      // In real app: navigate to location detail
                      console.log("Navigate to:", selectedBuilding.locationId);
                      alert(`Would navigate to location: ${selectedBuilding.locationId}`);
                    }}
                  >
                    View Details →
                  </button>
                )}

                <div className="text-xs text-stone-500 mt-4">
                  ID: {selectedBuilding.id.slice(0, 8)}...
                </div>
              </div>
            ) : (
              <div className="text-center text-stone-500">
                <div className="text-4xl mb-2">👆</div>
                <p>Click a building to see details</p>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-stone-700">
              <h3 className="text-sm font-semibold text-stone-300 mb-2">Landmarks</h3>
              <div className="space-y-1 text-sm">
                {town.landmarks.map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                      selectedBuilding?.id === l.id
                        ? "bg-amber-600/20 text-amber-400"
                        : "text-stone-400 hover:bg-stone-700"
                    }`}
                    onClick={() => handleBuildingClick(l)}
                  >
                    <span>{l.icon}</span>
                    <span>{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
