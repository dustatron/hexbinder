import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Cloud, Sun, CloudRain, Settings, ChevronRight, Tag } from "lucide-react";
import { HexMap } from "~/components/hex-map";
import { LocationPanel } from "~/components/location-panel";
import { loadWorld, saveWorld } from "~/lib/storage";
import { advanceDay } from "~/generators/WorldGenerator";
import type { HexCoord, WeatherCondition, WorldData } from "~/models";

export const Route = createFileRoute("/world/$worldId")({
  loader: ({ params }) => {
    const world = loadWorld(params.worldId);
    if (!world) throw notFound();
    return world;
  },
  // Only load on client - localStorage doesn't exist on server
  ssr: false,
  // Always reload to get fresh data from localStorage
  shouldReload: true,
  component: WorldPage,
});

const WEATHER_ICONS: Partial<Record<WeatherCondition, typeof Sun>> = {
  clear: Sun,
  cloudy: Cloud,
  rain_light: CloudRain,
  rain_heavy: CloudRain,
};

function WorldPage() {
  const initialWorld = Route.useLoaderData();
  const navigate = useNavigate();
  const [world, setWorld] = useState<WorldData>(initialWorld);
  const [selectedCoord, setSelectedCoord] = useState<HexCoord | null>(null);
  const [showLabels, setShowLabels] = useState(false);

  const handleHexDoubleClick = useCallback((coord: HexCoord) => {
    navigate({
      to: "/world/$worldId/hex/$q/$r",
      params: { worldId: world.id, q: String(coord.q), r: String(coord.r) },
    });
  }, [navigate, world.id]);

  // Sync state when navigating back (loader runs again with fresh localStorage data)
  useEffect(() => {
    setWorld(initialWorld);
  }, [initialWorld]);

  const handleAdvanceDay = () => {
    const newWorld = advanceDay(world);
    if (newWorld) {
      saveWorld(newWorld);
      setWorld(newWorld);
    }
  };

  const handleSetCurrent = (hexId: string) => {
    const updated: WorldData = {
      ...world,
      state: {
        ...world.state,
        currentHexId: hexId,
        visitedHexIds: world.state.visitedHexIds.includes(hexId)
          ? world.state.visitedHexIds
          : [...world.state.visitedHexIds, hexId],
      },
    };
    saveWorld(updated);
    setWorld(updated);
  };

  const handleToggleVisited = (hexId: string) => {
    const isCurrentlyVisited = world.state.visitedHexIds.includes(hexId);
    const updated: WorldData = {
      ...world,
      state: {
        ...world.state,
        visitedHexIds: isCurrentlyVisited
          ? world.state.visitedHexIds.filter((id) => id !== hexId)
          : [...world.state.visitedHexIds, hexId],
      },
    };
    saveWorld(updated);
    setWorld(updated);
  };

  const selectedLocation = selectedCoord
    ? world.locations.find(
        (loc) =>
          loc.hexCoord.q === selectedCoord.q &&
          loc.hexCoord.r === selectedCoord.r
      )
    : null;

  const selectedHex = selectedCoord
    ? world.hexes.find(
        (hex) =>
          hex.coord.q === selectedCoord.q && hex.coord.r === selectedCoord.r
      )
    : null;

  const selectedDwelling =
    selectedHex?.dwellingId
      ? world.dwellings.find((d) => d.id === selectedHex.dwellingId)
      : null;

  const WeatherIcon = WEATHER_ICONS[world.state.weather.condition] || Sun;

  // Get today's events from calendar (exclude weather - already shown in header)
  const todayRecord = world.state.calendar.find((r) => r.day === world.state.day);
  const todayEvents = (todayRecord?.events ?? []).filter(e => e.type !== "weather_change");

  return (
    <div className="relative flex h-svh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="z-10 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back + World Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold">{world.name}</h1>
          </div>

          {/* Center: Today's Events (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center gap-2 overflow-x-auto px-4 text-xs">
            {todayEvents.slice(0, 3).map((event) => (
              <span
                key={event.id}
                className="whitespace-nowrap rounded bg-stone-700 px-2 py-1 text-stone-300"
              >
                {event.description}
              </span>
            ))}
            {todayEvents.length > 3 && (
              <span className="whitespace-nowrap rounded bg-stone-700/50 px-2 py-1 text-muted-foreground">
                +{todayEvents.length - 3} more
              </span>
            )}
          </div>

          {/* Right: Season + Day + Weather + Settings */}
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden md:inline text-sm text-muted-foreground capitalize">{world.state.season}</span>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Day {world.state.day}</span>
              <button
                onClick={handleAdvanceDay}
                className="rounded bg-stone-700 p-1 hover:bg-stone-600"
                title="Advance to next day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-sm text-muted-foreground">
              <WeatherIcon size={18} />
              <span className="hidden md:inline capitalize">
                {world.state.weather.condition.replace("_", " ")}
              </span>
              <span className="hidden md:inline text-stone-300">
                {world.state.weather.tempLow}°/{world.state.weather.tempHigh}°
              </span>
            </div>
            <Link
              to="/atlas/$worldId"
              params={{ worldId: world.id }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hex Map */}
      <div className="relative flex-1 overflow-hidden">
        {/* Map Controls */}
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded border transition-colors ${
              showLabels
                ? "bg-amber-600 border-amber-500 text-white"
                : "bg-stone-800/90 border-stone-600 text-stone-300 hover:bg-stone-700"
            }`}
            title={showLabels ? "Hide location labels" : "Show location labels"}
          >
            <Tag size={16} />
          </button>
        </div>

        <HexMap
          hexes={world.hexes}
          edges={world.edges}
          locations={world.locations}
          selectedCoord={selectedCoord}
          currentHexId={world.state.currentHexId}
          visitedHexIds={world.state.visitedHexIds}
          onHexClick={setSelectedCoord}
          onHexDoubleClick={handleHexDoubleClick}
          showLabels={showLabels}
        />

        {/* Location Panel */}
        <LocationPanel
          location={selectedLocation || null}
          hex={selectedHex || null}
          dwelling={selectedDwelling || null}
          worldId={world.id}
          worldSeed={world.seed}
          currentHexId={world.state.currentHexId}
          visitedHexIds={world.state.visitedHexIds}
          onClose={() => setSelectedCoord(null)}
          onSetCurrent={handleSetCurrent}
          onToggleVisited={handleToggleVisited}
        />
      </div>
    </div>
  );
}
