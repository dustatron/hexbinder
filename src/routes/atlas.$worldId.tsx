import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Castle,
  Skull,
  Users,
  Calendar,
} from "lucide-react";
import { loadWorld, saveWorld } from "~/lib/storage";
import { advanceDay, goBackDay, extendForecast, needsForecastExtension } from "~/generators/WorldGenerator";
import type {
  WorldData,
  Settlement,
  Dungeon,
  WeatherCondition,
  MoonPhase,
} from "~/models";

export const Route = createFileRoute("/atlas/$worldId")({
  loader: ({ params }) => {
    const world = loadWorld(params.worldId);
    if (!world) throw notFound();
    return world;
  },
  ssr: false,
  component: AtlasPage,
});

const WEATHER_ICONS: Partial<Record<WeatherCondition, typeof Sun>> = {
  clear: Sun,
  cloudy: Cloud,
  overcast: Cloud,
  rain_light: CloudRain,
  rain_heavy: CloudRain,
  storm: CloudRain,
  thunderstorm: CloudRain,
  fog: Cloud,
  snow_light: Snowflake,
  snow_heavy: Snowflake,
  blizzard: Snowflake,
};

const MOON_LABELS: Record<MoonPhase, string> = {
  new: "New Moon",
  waxing: "Waxing",
  full: "Full Moon",
  waning: "Waning",
};

type TabId = "factions" | "events" | "settlements" | "dungeons";

function AtlasPage() {
  const initialWorld = Route.useLoaderData();
  const [world, setWorld] = useState<WorldData>(initialWorld);
  const [activeTab, setActiveTab] = useState<TabId>("events");

  const settlements = world.locations.filter(
    (loc): loc is Settlement => loc.type === "settlement"
  );
  const dungeons = world.locations.filter(
    (loc): loc is Dungeon => loc.type === "dungeon"
  );

  // Split calendar into today, upcoming (next 5), and past
  const currentDay = world.state.day;
  const todayRecord = world.state.calendar.find((r) => r.day === currentDay);
  const upcomingDays = world.state.calendar
    .filter((r) => r.day > currentDay && r.day <= currentDay + 5)
    .sort((a, b) => a.day - b.day);
  const pastDays = world.state.calendar
    .filter((r) => r.day < currentDay)
    .sort((a, b) => b.day - a.day);

  const canGoBack = world.state.day > 1;
  const canAdvance = world.state.day < world.state.forecastEndDay;
  const showExtendButton = needsForecastExtension(world);

  const handleNextDay = () => {
    const newWorld = advanceDay(world);
    if (newWorld) {
      saveWorld(newWorld);
      setWorld(newWorld);
    }
  };

  const handlePreviousDay = () => {
    const newWorld = goBackDay(world);
    if (newWorld) {
      saveWorld(newWorld);
      setWorld(newWorld);
    }
  };

  const handleExtendForecast = () => {
    const newWorld = extendForecast(world);
    saveWorld(newWorld);
    setWorld(newWorld);
  };

  const WeatherIcon = WEATHER_ICONS[world.state.weather.condition] || Sun;

  return (
    <div className="flex min-h-svh flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/world/$worldId"
            params={{ worldId: world.id }}
            className="text-stone-400 hover:text-stone-200"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">{world.name}</h1>
            <p className="text-xs text-stone-400">Seed: {world.seed}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-4 p-4">
        {/* Date & Weather Section - Always Visible */}
        <section className="rounded-lg border border-stone-700 bg-stone-800 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xl font-semibold">
                <Calendar size={20} className="text-stone-400" />
                Day {world.state.day}, Year {world.state.year}
              </div>
              <p className="mt-1 text-stone-400 capitalize">
                {world.state.season}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <WeatherIcon size={20} className="text-stone-400" />
                <span className="capitalize">
                  {world.state.weather.condition.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 flex items-center justify-end gap-2 text-sm text-stone-400">
                <Moon size={14} />
                {MOON_LABELS[world.state.moonPhase]}
              </p>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousDay}
              disabled={!canGoBack}
              className="flex items-center gap-1 rounded bg-stone-700 px-3 py-2 text-sm hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous Day
            </button>
            <button
              onClick={handleNextDay}
              disabled={!canAdvance}
              className="flex items-center gap-1 rounded bg-amber-700 px-3 py-2 text-sm hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next Day
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* Tab Bar */}
        <div className="flex gap-1 rounded-lg border border-stone-700 bg-stone-800 p-1">
          {([
            { id: "events", label: "Events", icon: Calendar, count: todayRecord?.events.length ?? 0 },
            { id: "factions", label: "Factions", icon: Users, count: world.factions.length },
            { id: "settlements", label: "Settlements", icon: Castle, count: settlements.length },
            { id: "dungeons", label: "Dungeons", icon: Skull, count: dungeons.length },
          ] as const).map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm transition-colors ${
                activeTab === id
                  ? "bg-stone-700 text-stone-100"
                  : "text-stone-400 hover:bg-stone-700/50 hover:text-stone-200"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
              <span className="rounded-full bg-stone-600 px-1.5 text-xs">{count}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "events" && (
        /* Events Timeline */
        <section className="rounded-lg border border-stone-700 bg-stone-800 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Calendar size={18} className="text-amber-500" />
            Events Timeline
          </h2>
          <div className="space-y-4">
            {/* Today */}
            {todayRecord && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-amber-400">
                  <span className="font-medium">Today (Day {todayRecord.day})</span>
                  <span className="rounded bg-amber-700 px-1.5 py-0.5 text-xs">Current</span>
                </div>
                {todayRecord.events.length === 0 ? (
                  <p className="text-sm text-stone-600 italic">No events</p>
                ) : (
                  <ul className="space-y-2">
                    {todayRecord.events.map((event) => (
                      <li key={event.id} className="rounded bg-stone-700/70 px-3 py-2 text-sm">
                        <span className="mr-2 rounded bg-stone-600 px-1.5 py-0.5 text-xs uppercase text-stone-300">
                          {event.type.replace("_", " ")}
                        </span>
                        {event.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Upcoming Days */}
            {upcomingDays.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium text-blue-400">Upcoming</div>
                <div className="space-y-3">
                  {upcomingDays.map((dayRecord) => (
                    <div key={dayRecord.day} className="border-l-2 border-blue-700 pl-3">
                      <div className="mb-1 text-sm text-blue-300">Day {dayRecord.day}</div>
                      {dayRecord.events.length === 0 ? (
                        <p className="text-sm text-stone-600 italic">No events</p>
                      ) : (
                        <ul className="space-y-1">
                          {dayRecord.events.map((event) => (
                            <li key={event.id} className="rounded bg-stone-700/30 px-3 py-2 text-sm text-stone-400">
                              <span className="mr-2 rounded bg-stone-600 px-1.5 py-0.5 text-xs uppercase text-stone-300">
                                {event.type.replace("_", " ")}
                              </span>
                              {event.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extend Forecast Button */}
            {showExtendButton && (
              <button
                onClick={handleExtendForecast}
                className="w-full rounded bg-blue-700 px-3 py-2 text-sm hover:bg-blue-600"
              >
                Generate Next 28 Days
              </button>
            )}

            {/* Past Days */}
            {pastDays.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium text-stone-500">Past Events</div>
                <div className="space-y-3">
                  {pastDays.map((dayRecord) => (
                    <div key={dayRecord.day} className="border-l-2 border-stone-700 pl-3">
                      <div className="mb-1 text-sm text-stone-500">Day {dayRecord.day}</div>
                      {dayRecord.events.length === 0 ? (
                        <p className="text-sm text-stone-600 italic">No events</p>
                      ) : (
                        <ul className="space-y-1">
                          {dayRecord.events.map((event) => (
                            <li key={event.id} className="rounded bg-stone-700/20 px-3 py-2 text-sm text-stone-500">
                              <span className="mr-2 rounded bg-stone-700 px-1.5 py-0.5 text-xs uppercase text-stone-400">
                                {event.type.replace("_", " ")}
                              </span>
                              {event.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {/* Factions */}
        {activeTab === "factions" && (
        <section className="rounded-lg border border-stone-700 bg-stone-800 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Users size={18} className="text-purple-400" />
            Factions ({world.factions.length})
          </h2>
          {world.factions.length === 0 ? (
            <p className="text-sm text-stone-500">No factions</p>
          ) : (
            <ul className="space-y-3">
              {world.factions.map((faction) => (
                <li key={faction.id} className="rounded bg-stone-700/50 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to="/world/$worldId/faction/$factionId"
                        params={{ worldId: world.id, factionId: faction.id }}
                        className="font-medium hover:text-amber-400"
                      >
                        {faction.name}
                      </Link>
                      <p className="text-sm text-stone-400">
                        {faction.factionType} &middot; {faction.purpose}
                      </p>
                    </div>
                    <span className="rounded bg-stone-600 px-2 py-0.5 text-xs capitalize">
                      {faction.status}
                    </span>
                  </div>
                  {faction.goals.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span>Goal Progress</span>
                        <span>{faction.goals[0].progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded bg-stone-600">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${faction.goals[0].progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        )}

        {/* Settlements */}
        {activeTab === "settlements" && (
        <section className="rounded-lg border border-stone-700 bg-stone-800 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Castle size={18} className="text-amber-400" />
            Settlements ({settlements.length})
          </h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-stone-500">No settlements</p>
          ) : (
            <ul className="space-y-2">
              {settlements.map((settlement) => (
                <li
                  key={settlement.id}
                  className="flex items-center justify-between rounded bg-stone-700/50 px-3 py-2"
                >
                  <div>
                    <Link
                      to="/world/$worldId/location/$locationId"
                      params={{ worldId: world.id, locationId: settlement.id }}
                      className="font-medium hover:text-amber-400"
                    >
                      {settlement.name}
                    </Link>
                    <p className="text-sm capitalize text-stone-400">
                      {settlement.settlementType} {settlement.size}
                    </p>
                  </div>
                  <span className="text-sm text-stone-400">
                    Pop. {settlement.population.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}

        {/* Dungeons */}
        {activeTab === "dungeons" && (
        <section className="rounded-lg border border-stone-700 bg-stone-800 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Skull size={18} className="text-red-400" />
            Dungeons ({dungeons.length})
          </h2>
          {dungeons.length === 0 ? (
            <p className="text-sm text-stone-500">No dungeons</p>
          ) : (
            <ul className="space-y-2">
              {dungeons.map((dungeon) => (
                <li
                  key={dungeon.id}
                  className="flex items-center justify-between rounded bg-stone-700/50 px-3 py-2"
                >
                  <div>
                    <Link
                      to="/world/$worldId/location/$locationId"
                      params={{ worldId: world.id, locationId: dungeon.id }}
                      className="font-medium hover:text-amber-400"
                    >
                      {dungeon.name}
                    </Link>
                    <p className="text-sm capitalize text-stone-400">
                      {dungeon.theme} &middot; {dungeon.size}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      dungeon.cleared
                        ? "bg-green-800 text-green-200"
                        : "bg-red-800 text-red-200"
                    }`}
                  >
                    {dungeon.cleared ? "Cleared" : "Active"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
      </main>
    </div>
  );
}
