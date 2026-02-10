import { useState, useCallback } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Eye, EyeOff, Menu, Check, RefreshCw } from "lucide-react";
import { loadWorld, saveWorld } from "~/lib/storage";
import { regenerateHex, type RegenerationType, type RegenerateOptions } from "~/lib/hex-regenerate";
import { WildernessDetail } from "~/components/location-detail/WildernessDetail";
import { SettlementDetail, type LocationEvent } from "~/components/location-detail/SettlementDetail";
import { DungeonDetail } from "~/components/location-detail/DungeonDetail";
import { RegenerateModal } from "~/components/location-detail/RegenerateButton";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import type { EncounterOverrides, Settlement, Dungeon, WorldData } from "~/models";
import { isDungeon, isSettlement } from "~/models";

export const Route = createFileRoute("/world/$worldId_/hex/$q/$r")({
  loader: ({ params }) => {
    const world = loadWorld(params.worldId);
    if (!world) throw notFound();

    const q = parseInt(params.q, 10);
    const r = parseInt(params.r, 10);

    if (isNaN(q) || isNaN(r)) throw notFound();

    const hex = world.hexes.find((h) => h.coord.q === q && h.coord.r === r);
    if (!hex) throw notFound();

    // Find location at this hex (if any)
    const location = hex.locationId
      ? world.locations.find((loc) => loc.id === hex.locationId)
      : null;

    return { world, hex, location };
  },
  ssr: false,
  component: HexDetailPage,
});

function HexDetailPage() {
  const { world: initialWorld, hex: initialHex } = Route.useLoaderData();
  const [world, setWorld] = useState(initialWorld);

  // Re-derive hex and location from current world state
  const hex = world.hexes.find((h) => h.coord.q === initialHex.coord.q && h.coord.r === initialHex.coord.r)!;
  const location = hex.locationId
    ? world.locations.find((loc) => loc.id === hex.locationId)
    : null;

  // Stable seed - uses persisted reroll counter from hex
  const rerollCount = hex.encounterRerollCount ?? 0;
  const seed = `${world.seed}-hex-${hex.coord.q},${hex.coord.r}${rerollCount > 0 ? `-${rerollCount}` : ""}`;

  const handleRegenerate = useCallback((type: RegenerationType, options?: RegenerateOptions) => {
    const newWorld = regenerateHex(world, hex.coord, type, options);
    saveWorld(newWorld);
    setWorld(newWorld);
  }, [world, hex.coord]);

  const handleReroll = useCallback(() => {
    const newCount = (hex.encounterRerollCount ?? 0) + 1;
    const updated: WorldData = {
      ...world,
      hexes: world.hexes.map((h) =>
        h.coord.q === hex.coord.q && h.coord.r === hex.coord.r
          ? { ...h, encounterRerollCount: newCount, lastEncounterTimestamp: Date.now() }
          : h
      ),
    };
    saveWorld(updated);
    setWorld(updated);
  }, [world, hex]);

  const handleUpdateWorld = useCallback((updater: (world: WorldData) => WorldData) => {
    const updated = updater(world);
    saveWorld(updated);
    setWorld(updated);
  }, [world]);

  const handleOverridesChange = useCallback((overrides: EncounterOverrides) => {
    const updated: WorldData = {
      ...world,
      hexes: world.hexes.map((h) =>
        h.coord.q === hex.coord.q && h.coord.r === hex.coord.r
          ? { ...h, encounterOverrides: overrides, lastEncounterTimestamp: Date.now() }
          : h
      ),
    };
    saveWorld(updated);
    setWorld(updated);
  }, [world, hex.coord]);

  // Regenerate modal state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const currentLocationType = location
    ? isSettlement(location) ? "settlement" as const
    : isDungeon(location) ? "dungeon" as const
    : "wilderness" as const
    : "wilderness" as const;
  const defaultRegenerateType = location
    ? isSettlement(location) ? (location as Settlement).size
    : isDungeon(location) ? (location as Dungeon).theme
    : hex.terrain
    : hex.terrain;

  // Party location tracking
  const hexId = `${hex.coord.q},${hex.coord.r}`;
  const isCurrent = world.state.currentHexId === hexId;
  const isVisited = world.state.visitedHexIds.includes(hexId);

  const handleSetCurrent = useCallback(() => {
    const updated: WorldData = {
      ...world,
      state: {
        ...world.state,
        currentHexId: hexId,
        // Also add to visited if not already there
        visitedHexIds: world.state.visitedHexIds.includes(hexId)
          ? world.state.visitedHexIds
          : [...world.state.visitedHexIds, hexId],
      },
    };
    saveWorld(updated);
    setWorld(updated);
  }, [world, hexId]);

  const handleToggleVisited = useCallback(() => {
    const updated: WorldData = {
      ...world,
      state: {
        ...world.state,
        visitedHexIds: isVisited
          ? world.state.visitedHexIds.filter((id) => id !== hexId)
          : [...world.state.visitedHexIds, hexId],
      },
    };
    saveWorld(updated);
    setWorld(updated);
  }, [world, hexId, isVisited]);

  // Get today's events for settlements
  const todayRecord = world.state.calendar.find((r) => r.day === world.state.day);
  const todayEvents = (todayRecord?.events ?? []).filter(
    (e) => e.type !== "weather_change" && e.linkedLocationId === location?.id
  );

  // Get all events for this location across all days
  const locationEvents: LocationEvent[] = world.state.calendar.flatMap((record) =>
    record.events
      .filter((e) => e.linkedLocationId === location?.id)
      .map((e) => ({ ...e, day: record.day }))
  );

  // Filter NPCs at this location
  const npcs = location ? world.npcs.filter((n) => n.locationId === location.id) : [];

  // Find hook pointing to dungeon
  const hook = location?.type === "dungeon"
    ? world.hooks.find((h) => h.involvedLocationIds.includes(location.id))
    : undefined;

  // Find dwelling at this hex
  const dwelling = hex.dwellingId
    ? world.dwellings.find((d) => d.id === hex.dwellingId)
    : null;

  // Build page title
  const title = location?.name ?? `Hex (${hex.coord.q}, ${hex.coord.r})`;

  return (
    <div className="flex h-svh flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/world/$worldId"
              params={{ worldId: world.id }}
              className="text-stone-400 hover:text-stone-200"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold">{title}</h1>
            {isCurrent && (
              <span className="rounded-full bg-green-600/20 px-2 py-0.5 text-xs text-green-400">
                Current Location
              </span>
            )}
            {isVisited && !isCurrent && (
              <span className="rounded-full bg-purple-600/20 px-2 py-0.5 text-xs text-purple-400">
                Visited
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-100">
                <Menu size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem
                onClick={handleSetCurrent}
                disabled={isCurrent}
                className={isCurrent ? "opacity-50" : ""}
              >
                {isCurrent ? <Check size={14} /> : <MapPin size={14} />}
                {isCurrent ? "Current Location" : "Set as Current"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleVisited}>
                {isVisited ? <EyeOff size={14} /> : <Eye size={14} />}
                {isVisited ? "Unmark Visited" : "Mark as Visited"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowRegenerateModal(true)}>
                <RefreshCw size={14} />
                Regenerate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <RegenerateModal
            open={showRegenerateModal}
            onOpenChange={setShowRegenerateModal}
            onRegenerate={handleRegenerate}
            currentLocationType={currentLocationType}
            defaultType={defaultRegenerateType}
            currentSize={location && isDungeon(location) ? (location as Dungeon).size : undefined}
            currentSeed={seed}
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!location && (
          <WildernessDetail
            hex={hex}
            dwelling={dwelling}
            worldId={world.id}
            ruleset={world.ruleset}
            onReroll={handleReroll}
            onOverridesChange={handleOverridesChange}
            seed={seed}
          />
        )}

        {location?.type === "settlement" && (
          <SettlementDetail
            settlement={location as Settlement}
            npcs={npcs}
            todayEvents={todayEvents}
            locationEvents={locationEvents}
            currentDay={world.state.day}
            factions={world.factions}
            hooks={world.hooks}
            locations={world.locations}
            worldId={world.id}
            ruleset={world.ruleset}
            onReroll={handleReroll}
            onUpdateWorld={handleUpdateWorld}
            seed={seed}
          />
        )}

        {location?.type === "dungeon" && (
          <DungeonDetail
            dungeon={location as Dungeon}
            hook={hook}
            hooks={world.hooks.filter((h) => h.involvedLocationIds.includes(location.id))}
            npcs={world.npcs}
            factions={world.factions}
            worldId={world.id}
            ruleset={world.ruleset}
            onReroll={handleReroll}
            seed={seed}
          />
        )}
      </div>
    </div>
  );
}
