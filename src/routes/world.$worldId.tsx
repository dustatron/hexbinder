import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Cloud, Sun, CloudRain } from "lucide-react";
import { HexMap } from "~/components/hex-map";
import { LocationPanel } from "~/components/location-panel";
import { loadWorld } from "~/lib/storage";
import type { HexCoord, WeatherCondition } from "~/models";

export const Route = createFileRoute("/world/$worldId")({
  loader: ({ params }) => {
    const world = loadWorld(params.worldId);
    if (!world) throw notFound();
    return world;
  },
  component: WorldPage,
});

const WEATHER_ICONS: Partial<Record<WeatherCondition, typeof Sun>> = {
  clear: Sun,
  cloudy: Cloud,
  rain_light: CloudRain,
  rain_heavy: CloudRain,
};

function WorldPage() {
  const world = Route.useLoaderData();
  const [selectedCoord, setSelectedCoord] = useState<HexCoord | null>(null);

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

  const WeatherIcon = WEATHER_ICONS[world.state.weather.condition] || Sun;

  return (
    <div className="relative flex h-svh flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-stone-400 hover:text-stone-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-semibold">{world.name}</h1>
            <p className="text-xs text-stone-400">
              Day {world.state.day} &middot; {world.state.season}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <WeatherIcon size={18} />
          <span className="capitalize">
            {world.state.weather.condition.replace("_", " ")}
          </span>
        </div>
      </header>

      {/* Hex Map */}
      <div className="relative flex-1 overflow-hidden">
        <HexMap
          hexes={world.hexes}
          locations={world.locations}
          selectedCoord={selectedCoord}
          onHexClick={setSelectedCoord}
        />

        {/* Location Panel */}
        <LocationPanel
          location={selectedLocation || null}
          hex={selectedHex || null}
          onClose={() => setSelectedCoord(null)}
        />
      </div>
    </div>
  );
}
