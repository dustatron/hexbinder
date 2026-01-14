import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Cloud, Sun, CloudRain, Settings, ChevronRight } from "lucide-react";
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
  const [world, setWorld] = useState<WorldData>(initialWorld);
  const [selectedCoord, setSelectedCoord] = useState<HexCoord | null>(null);

  const handleAdvanceDay = () => {
    const newWorld = advanceDay(world);
    if (newWorld) {
      saveWorld(newWorld);
      setWorld(newWorld);
    }
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
    <div className="relative flex h-svh flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back + World Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-stone-400 hover:text-stone-200">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold">{world.name}</h1>
          </div>

          {/* Center: Today's Events */}
          <div className="flex flex-1 justify-center gap-2 overflow-x-auto px-4 text-xs">
            {todayEvents.slice(0, 3).map((event) => (
              <span
                key={event.id}
                className="whitespace-nowrap rounded bg-stone-700 px-2 py-1 text-stone-300"
              >
                {event.description}
              </span>
            ))}
            {todayEvents.length > 3 && (
              <span className="whitespace-nowrap rounded bg-stone-700/50 px-2 py-1 text-stone-400">
                +{todayEvents.length - 3} more
              </span>
            )}
          </div>

          {/* Right: Season + Day + Weather + Settings */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400 capitalize">{world.state.season}</span>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-stone-400">Day {world.state.day}</span>
              <button
                onClick={handleAdvanceDay}
                className="rounded bg-stone-700 p-1 hover:bg-stone-600"
                title="Advance to next day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <WeatherIcon size={18} />
              <span className="capitalize">
                {world.state.weather.condition.replace("_", " ")}
              </span>
            </div>
            <Link
              to="/atlas/$worldId"
              params={{ worldId: world.id }}
              className="text-stone-400 hover:text-stone-200"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hex Map */}
      <div className="relative flex-1 overflow-hidden">
        <HexMap
          hexes={world.hexes}
          edges={world.edges}
          locations={world.locations}
          selectedCoord={selectedCoord}
          onHexClick={setSelectedCoord}
        />

        {/* Location Panel */}
        <LocationPanel
          location={selectedLocation || null}
          hex={selectedHex || null}
          dwelling={selectedDwelling || null}
          worldId={world.id}
          onClose={() => setSelectedCoord(null)}
        />
      </div>
    </div>
  );
}
