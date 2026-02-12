import { useState, useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
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
  Gem,
  Target,
  Shield,
  AlertTriangle,
  Crown,
  Sword,
  BookOpen,
  Key,
  MapPin,
  Footprints,
} from "lucide-react";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { loadWorld, saveWorld } from "~/lib/storage";
import { advanceDay, goBackDay, extendForecast, needsForecastExtension } from "~/generators/WorldGenerator";
import type {
  WorldData,
  Settlement,
  Dungeon,
  WeatherCondition,
  MoonPhase,
  SignificantItem,
  Faction,
} from "~/models";

type TabId = "factions" | "events" | "settlements" | "dungeons" | "travel";

export const Route = createFileRoute("/atlas/$worldId")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as TabId) || "events",
  }),
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

import type { Location } from "~/models";

// Setting Seeds item icons and colors
const ITEM_TYPE_ICONS: Record<string, typeof Gem> = {
  crown: Crown,
  weapon: Sword,
  tome: BookOpen,
  key: Key,
  relic: Gem,
  vessel: Gem,
  regalia: Crown,
  focus: Gem,
};

const ITEM_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  possessed: { bg: "bg-purple-700", text: "text-purple-200" },
  hidden: { bg: "bg-amber-700", text: "text-amber-200" },
  lost: { bg: "bg-stone-600", text: "text-stone-300" },
  contested: { bg: "bg-red-700", text: "text-red-200" },
};

const FACTION_TYPE_COLORS: Record<string, string> = {
  cult: "bg-purple-700",
  militia: "bg-red-700",
  syndicate: "bg-amber-700",
  guild: "bg-blue-700",
  tribe: "bg-green-700",
};

function getItemHolder(item: SignificantItem, factions: Faction[]): string | null {
  if (item.status === "possessed" && item.currentHolderId) {
    const faction = factions.find((f) => f.id === item.currentHolderId);
    return faction?.name ?? "Unknown";
  }
  return null;
}

function getItemSeekers(item: SignificantItem, factions: Faction[]): string[] {
  return item.desiredByFactionIds
    .map((id) => factions.find((f) => f.id === id)?.name)
    .filter((name): name is string => !!name);
}

// Parse description and replace faction/location names with linked badges
function linkifyDescription(
  description: string,
  worldId: string,
  factions: Faction[],
  locations: Location[]
): React.ReactNode {
  // Build a map of names to their link info
  const linkMap: Array<{ name: string; type: "faction" | "settlement" | "dungeon"; id: string }> = [];

  for (const faction of factions) {
    linkMap.push({ name: faction.name, type: "faction", id: faction.id });
  }
  for (const location of locations) {
    const locType = location.type === "dungeon" ? "dungeon" : "settlement";
    linkMap.push({ name: location.name, type: locType, id: location.id });
  }

  // Sort by name length descending to match longer names first
  linkMap.sort((a, b) => b.name.length - a.name.length);

  // Find all matches and their positions
  const matches: Array<{ start: number; end: number; name: string; type: "faction" | "settlement" | "dungeon"; id: string }> = [];

  for (const item of linkMap) {
    let searchStart = 0;
    while (true) {
      const idx = description.indexOf(item.name, searchStart);
      if (idx === -1) break;
      // Check if this position overlaps with existing match
      const overlaps = matches.some(m =>
        (idx >= m.start && idx < m.end) || (idx + item.name.length > m.start && idx + item.name.length <= m.end)
      );
      if (!overlaps) {
        matches.push({ start: idx, end: idx + item.name.length, ...item });
      }
      searchStart = idx + 1;
    }
  }

  if (matches.length === 0) {
    return description;
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Build result with links
  const result: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const match of matches) {
    if (match.start > lastEnd) {
      result.push(description.slice(lastEnd, match.start));
    }
    if (match.type === "faction") {
      result.push(
        <Link
          key={`${match.id}-${match.start}`}
          to="/world/$worldId/faction/$factionId"
          params={{ worldId, factionId: match.id }}
          className="rounded bg-purple-500/20 px-1 py-0.5 text-purple-300 hover:bg-purple-500/30"
        >
          {match.name}
        </Link>
      );
    } else if (match.type === "dungeon") {
      result.push(
        <Link
          key={`${match.id}-${match.start}`}
          to="/world/$worldId/location/$locationId"
          params={{ worldId, locationId: match.id }}
          className="rounded bg-red-500/20 px-1 py-0.5 text-red-300 hover:bg-red-500/30"
        >
          {match.name}
        </Link>
      );
    } else {
      result.push(
        <Link
          key={`${match.id}-${match.start}`}
          to="/world/$worldId/location/$locationId"
          params={{ worldId, locationId: match.id }}
          className="rounded bg-amber-500/20 px-1 py-0.5 text-amber-300 hover:bg-amber-500/30"
        >
          {match.name}
        </Link>
      );
    }
    lastEnd = match.end;
  }

  if (lastEnd < description.length) {
    result.push(description.slice(lastEnd));
  }

  return result;
}

// Extract weather condition from description like "The weather shifts to light rain"
function getWeatherFromDescription(desc: string): string {
  const match = desc.match(/shifts to (.+)$/);
  return match ? match[1] : desc;
}

// Get weather icon for a condition string
function getWeatherIcon(condition: string) {
  if (condition.includes("snow") || condition.includes("blizzard")) return Snowflake;
  if (condition.includes("rain") || condition.includes("storm") || condition.includes("thunder")) return CloudRain;
  if (condition.includes("cloud") || condition.includes("overcast") || condition.includes("fog")) return Cloud;
  return Sun;
}

function AtlasPage() {
  const initialWorld = Route.useLoaderData();
  const { tab } = Route.useSearch();
  const [world, setWorld] = useState<WorldData>(initialWorld);
  const [activeTab, setActiveTab] = useState<TabId>(tab);
  const [weekOffset, setWeekOffset] = useState(0);

  // Sync state when navigating back
  useEffect(() => {
    setWorld(initialWorld);
  }, [initialWorld]);

  // Sync tab when search param changes (sidebar nav)
  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const settlements = world.locations.filter(
    (loc): loc is Settlement => loc.type === "settlement"
  );
  const dungeons = world.locations.filter(
    (loc): loc is Dungeon => loc.type === "dungeon"
  );

  // Paginated events by week (7 days per page)
  const currentDay = world.state.day;
  const weekStartDay = currentDay + (weekOffset * 7);
  const weekEndDay = weekStartDay + 6;
  const weekDays = world.state.calendar
    .filter((r) => r.day >= weekStartDay && r.day <= weekEndDay)
    .sort((a, b) => a.day - b.day);

  // For tab badge - count today's events
  const todayRecord = world.state.calendar.find((r) => r.day === currentDay);

  // Pagination bounds
  const minDay = Math.min(...world.state.calendar.map((r) => r.day));
  const maxDay = Math.max(...world.state.calendar.map((r) => r.day));
  const canGoPrevWeek = weekStartDay > minDay;
  const canGoNextWeek = weekEndDay < maxDay;

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
    <div className="flex h-full flex-col overflow-auto bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 text-stone-400 hover:text-stone-200" />
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
              <p className="mt-1 text-sm text-stone-300">
                {world.state.weather.tempLow}° / {world.state.weather.tempHigh}°F
              </p>
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
            { id: "travel", label: "Travel", icon: Footprints, count: world.state.visitedHexIds.length },
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
          {/* Week Pagination Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              disabled={!canGoPrevWeek}
              className="flex items-center gap-1 rounded bg-stone-700 px-2 py-1 text-sm hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <div className="text-center">
              <div className="text-sm font-medium">
                Days {weekStartDay} - {weekEndDay}
              </div>
              {weekOffset === 0 && (
                <span className="text-xs text-amber-500">Current Week</span>
              )}
              {weekOffset < 0 && (
                <span className="text-xs text-stone-500">Past</span>
              )}
              {weekOffset > 0 && (
                <span className="text-xs text-blue-400">Future</span>
              )}
            </div>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={!canGoNextWeek}
              className="flex items-center gap-1 rounded bg-stone-700 px-2 py-1 text-sm hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Week Days */}
          <div className="space-y-3">
            {weekDays.map((dayRecord) => {
              const isToday = dayRecord.day === currentDay;
              const isPast = dayRecord.day < currentDay;
              return (
                <div
                  key={dayRecord.day}
                  className={`border-l-2 pl-3 ${
                    isToday ? "border-amber-500" : isPast ? "border-stone-700" : "border-blue-700"
                  }`}
                >
                  <div className={`mb-1 flex items-center gap-2 text-sm ${
                    isToday ? "text-amber-400" : isPast ? "text-stone-500" : "text-blue-300"
                  }`}>
                    <span className="font-medium">Day {dayRecord.day}</span>
                    {isToday && (
                      <span className="rounded bg-amber-700 px-1.5 py-0.5 text-xs">Today</span>
                    )}
                    <span className="text-stone-400">
                      {dayRecord.weather.tempLow}°/{dayRecord.weather.tempHigh}°
                    </span>
                  </div>
                  {dayRecord.events.length === 0 ? (
                    <p className="text-sm text-stone-600 italic">No events</p>
                  ) : (
                    <ul className="space-y-1">
                      {dayRecord.events.map((event) => {
                        if (event.type === "weather_change") {
                          const condition = getWeatherFromDescription(event.description);
                          const DayWeatherIcon = getWeatherIcon(condition);
                          return (
                            <li key={event.id} className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                              isToday ? "bg-stone-700/70" : isPast ? "bg-stone-700/20 text-stone-500" : "bg-stone-700/30 text-stone-400"
                            }`}>
                              <DayWeatherIcon size={16} className={isPast ? "text-stone-600" : "text-stone-400"} />
                              <span className="capitalize">{condition}</span>
                            </li>
                          );
                        }
                        if (event.type === "faction_activity") {
                          return (
                            <li key={event.id} className={`rounded px-3 py-2 text-sm ${
                              isToday ? "bg-stone-700/70" : isPast ? "bg-stone-700/20 text-stone-500" : "bg-stone-700/30 text-stone-400"
                            }`}>
                              <span className={`mr-2 rounded px-1.5 py-0.5 text-xs uppercase ${
                                isPast ? "bg-purple-900/50 text-purple-400/60" : "bg-purple-900/50 text-purple-300"
                              }`}>
                                faction
                              </span>
                              {linkifyDescription(event.description, world.id, world.factions, world.locations)}
                            </li>
                          );
                        }
                        if (event.type === "world_event") {
                          return (
                            <li key={event.id} className={`rounded px-3 py-2 text-sm ${
                              isToday ? "bg-stone-700/70" : isPast ? "bg-stone-700/20 text-stone-500" : "bg-stone-700/30 text-stone-400"
                            }`}>
                              <span className={`mr-2 rounded px-1.5 py-0.5 text-xs uppercase ${
                                isPast ? "bg-red-900/50 text-red-400/60" : "bg-red-900/50 text-red-300"
                              }`}>
                                world
                              </span>
                              {linkifyDescription(event.description, world.id, world.factions, world.locations)}
                            </li>
                          );
                        }
                        if (event.type === "clock_tick" && event.linkedClockId) {
                          const clock = world.clocks.find((c) => c.id === event.linkedClockId);
                          if (clock) {
                            return (
                              <li key={event.id} className={`rounded px-3 py-2 text-sm ${
                                isToday ? "bg-stone-700/70" : isPast ? "bg-stone-700/20 text-stone-500" : "bg-stone-700/30 text-stone-400"
                              }`}>
                                <div className="flex items-center justify-between gap-2">
                                  <span>{linkifyDescription(event.description, world.id, world.factions, world.locations)}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs text-stone-400">{clock.name}</span>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: clock.segments }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={`h-2 w-3 rounded-sm ${
                                          i < clock.filled
                                            ? "bg-purple-500"
                                            : "bg-stone-600"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-stone-500">
                                    {clock.filled}/{clock.segments}
                                  </span>
                                </div>
                              </li>
                            );
                          }
                        }
                        return (
                          <li key={event.id} className={`rounded px-3 py-2 text-sm ${
                            isToday ? "bg-stone-700/70" : isPast ? "bg-stone-700/20 text-stone-500" : "bg-stone-700/30 text-stone-400"
                          }`}>
                            <span className={`mr-2 rounded px-1.5 py-0.5 text-xs uppercase ${
                              isPast ? "bg-stone-700 text-stone-400" : "bg-stone-600 text-stone-300"
                            }`}>
                              {event.type.replace("_", " ")}
                            </span>
                            {linkifyDescription(event.description, world.id, world.factions, world.locations)}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Week Pagination Footer */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              disabled={!canGoPrevWeek}
              className="flex items-center gap-1 rounded bg-stone-700 px-2 py-1 text-sm hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <div className="text-center">
              <div className="text-sm font-medium">
                Days {weekStartDay} - {weekEndDay}
              </div>
            </div>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={!canGoNextWeek}
              className="flex items-center gap-1 rounded bg-stone-700 px-2 py-1 text-sm hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Extend Forecast Button */}
          {showExtendButton && weekOffset >= 0 && (
            <button
              onClick={handleExtendForecast}
              className="mt-4 w-full rounded bg-blue-700 px-3 py-2 text-sm hover:bg-blue-600"
            >
              Generate Next 28 Days
            </button>
          )}
        </section>
        )}

        {/* Travel Log */}
        {activeTab === "travel" && (
          <section className="rounded-lg border border-stone-700 bg-stone-800 p-4">
            {/* Current Location */}
            <div className="mb-4">
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-green-400">
                <MapPin size={18} />
                Current Location
              </h2>
              {world.state.currentHexId ? (
                (() => {
                  const [q, r] = world.state.currentHexId.split(",").map(Number);
                  const hex = world.hexes.find((h) => h.coord.q === q && h.coord.r === r);
                  const location = hex?.locationId
                    ? world.locations.find((l) => l.id === hex.locationId)
                    : null;
                  return (
                    <Link
                      to="/world/$worldId/hex/$q/$r"
                      params={{ worldId: world.id, q: String(q), r: String(r) }}
                      className="block rounded bg-green-700/20 p-3 hover:bg-green-700/30"
                    >
                      <div className="font-medium text-green-300">
                        {location?.name ?? `Hex (${q}, ${r})`}
                      </div>
                      {location && (
                        <p className="text-sm capitalize text-stone-400">{location.type}</p>
                      )}
                      {!location && hex && (
                        <p className="text-sm capitalize text-stone-400">{hex.terrain}</p>
                      )}
                    </Link>
                  );
                })()
              ) : (
                <p className="text-sm text-stone-500">No current location set</p>
              )}
            </div>

            {/* Visited Locations */}
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-purple-400">
              <Footprints size={18} />
              Visited Hexes ({world.state.visitedHexIds.length})
            </h2>
            {world.state.visitedHexIds.length === 0 ? (
              <p className="text-sm text-stone-500">No locations visited yet</p>
            ) : (
              <ul className="space-y-2">
                {world.state.visitedHexIds.map((hexId) => {
                  const [q, r] = hexId.split(",").map(Number);
                  const hex = world.hexes.find((h) => h.coord.q === q && h.coord.r === r);
                  const location = hex?.locationId
                    ? world.locations.find((l) => l.id === hex.locationId)
                    : null;
                  const isCurrent = hexId === world.state.currentHexId;

                  return (
                    <li key={hexId}>
                      <Link
                        to="/world/$worldId/hex/$q/$r"
                        params={{ worldId: world.id, q: String(q), r: String(r) }}
                        className={`flex items-center justify-between rounded px-3 py-2 ${
                          isCurrent
                            ? "bg-green-700/20 hover:bg-green-700/30"
                            : "bg-stone-700/50 hover:bg-stone-700"
                        }`}
                      >
                        <div>
                          <span className="font-medium">
                            {location?.name ?? `Hex (${q}, ${r})`}
                          </span>
                          {location && (
                            <span className="ml-2 text-sm capitalize text-stone-400">
                              {location.type}
                            </span>
                          )}
                          {!location && hex && (
                            <span className="ml-2 text-sm capitalize text-stone-400">
                              {hex.terrain}
                            </span>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="rounded-full bg-green-600/20 px-2 py-0.5 text-xs text-green-400">
                            Current
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* Factions */}
        {activeTab === "factions" && (
          <>
          {/* Significant Items (Setting Seeds) */}
          {world.significantItems && world.significantItems.length > 0 && (
            <section className="rounded-lg border border-amber-700/50 bg-stone-800 p-4">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-amber-400">
                <Gem size={18} />
                Significant Items ({world.significantItems.length})
              </h2>
              <p className="mb-4 text-xs text-stone-400">
                Narrative artifacts that drive faction conflict and dungeon purpose
              </p>
              <ul className="space-y-4">
                {world.significantItems.map((item) => {
                  const ItemIcon = ITEM_TYPE_ICONS[item.type] || Gem;
                  const statusColors = ITEM_STATUS_COLORS[item.status] || ITEM_STATUS_COLORS.lost;
                  const holder = getItemHolder(item, world.factions);
                  const seekers = getItemSeekers(item, world.factions);
                  const dungeon = item.locationId
                    ? dungeons.find((d) => d.id === item.locationId)
                    : null;

                  return (
                    <li key={item.id} className="rounded border border-stone-600 bg-stone-700/50 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <ItemIcon size={16} className="text-amber-400" />
                          <span className="font-medium text-amber-200">{item.name}</span>
                        </div>
                        <span className={`rounded px-2 py-0.5 text-xs capitalize ${statusColors.bg} ${statusColors.text}`}>
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-stone-300">{item.effect}</p>

                      {item.significance && (
                        <p className="mt-1 text-xs italic text-stone-400">{item.significance}</p>
                      )}

                      <div className="mt-3 space-y-1 text-xs">
                        {holder && (
                          <div className="flex items-center gap-2 text-purple-300">
                            <Shield size={12} />
                            <span>Held by: {holder}</span>
                          </div>
                        )}

                        {dungeon && (
                          <div className="flex items-center gap-2 text-amber-300">
                            <Skull size={12} />
                            <span>
                              Hidden in:{" "}
                              <Link
                                to="/world/$worldId/location/$locationId"
                                params={{ worldId: world.id, locationId: dungeon.id }}
                                className="underline hover:text-amber-200"
                              >
                                {dungeon.name}
                              </Link>
                            </span>
                          </div>
                        )}

                        {seekers.length > 0 && (
                          <div className="flex items-center gap-2 text-red-300">
                            <Target size={12} />
                            <span>Sought by: {seekers.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        <section className="rounded-lg border border-stone-700 bg-stone-800 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Users size={18} className="text-purple-400" />
            Factions ({world.factions.length})
          </h2>
          {world.factions.length === 0 ? (
            <p className="text-sm text-stone-500">No factions</p>
          ) : (
            <ul className="space-y-4">
              {world.factions.map((faction) => {
                const currentGoal = faction.agenda?.find((g) => g.status === "in_progress");
                const completedGoals = faction.agenda?.filter((g) => g.status === "completed").length ?? 0;
                const totalGoals = faction.agenda?.length ?? 0;

                return (
                  <li key={faction.id} className="rounded border border-stone-600 bg-stone-700/50 p-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to="/world/$worldId/faction/$factionId"
                            params={{ worldId: world.id, factionId: faction.id }}
                            className="font-medium hover:text-amber-400"
                          >
                            {faction.name}
                          </Link>
                          <span className={`rounded px-1.5 py-0.5 text-xs uppercase ${FACTION_TYPE_COLORS[faction.factionType] || "bg-stone-600"}`}>
                            {faction.displayType || faction.factionType}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-stone-400">
                          {faction.archetype} · {faction.scale}
                        </p>
                      </div>
                      <span className="rounded bg-stone-600 px-2 py-0.5 text-xs capitalize">
                        {faction.status}
                      </span>
                    </div>

                    {/* Advantages */}
                    {faction.advantages && faction.advantages.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-green-400">
                          <Shield size={12} />
                          Advantages
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {faction.advantages.map((adv, i) => (
                            <span key={i} className="rounded bg-green-900/50 px-2 py-0.5 text-xs text-green-300">
                              {adv.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current Goal */}
                    {currentGoal && (
                      <div className="mt-3">
                        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-400">
                          <Target size={12} />
                          Current Goal ({completedGoals}/{totalGoals})
                        </div>
                        <p className="text-sm text-stone-300">{currentGoal.description}</p>
                      </div>
                    )}

                    {/* Obstacle */}
                    {faction.obstacle && (
                      <div className="mt-3">
                        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-red-400">
                          <AlertTriangle size={12} />
                          Obstacle
                        </div>
                        <p className="text-sm text-stone-400">{faction.obstacle.description}</p>
                      </div>
                    )}

                    {/* Agenda Progress */}
                    {totalGoals > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span>Agenda Progress</span>
                          <span>{Math.round((completedGoals / totalGoals) * 100)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded bg-stone-600">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${(completedGoals / totalGoals) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        </>
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
