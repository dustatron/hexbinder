import { useState, useCallback } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { Menu, RefreshCw } from "lucide-react";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SettlementDetail, type LocationEvent } from "~/components/location-detail/SettlementDetail";
import { DungeonDetail } from "~/components/location-detail/DungeonDetail";
import { LandmarkDetail } from "~/components/location-detail/LandmarkDetail";
import { RegenerateModal } from "~/components/location-detail/RegenerateButton";
import { loadWorld, saveWorld } from "~/lib/storage";
import { regenerateHex, type RegenerationType, type RegenerateOptions } from "~/lib/hex-regenerate";
import { isSettlement, isDungeon, type Settlement, type Dungeon, type NPC, type DayEvent, type Hook, type WorldData } from "~/models";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

export const Route = createFileRoute("/world/$worldId_/location/$locationId")({
  loader: ({ params }) => {
    const world = loadWorld(params.worldId);
    if (!world) throw notFound();

    const location = world.locations.find((loc) => loc.id === params.locationId);
    if (!location) throw notFound();

    // Find hex for this location
    const hex = world.hexes.find(
      (h) => h.coord.q === location.hexCoord.q && h.coord.r === location.hexCoord.r
    );

    return { world, location, hex };
  },
  ssr: false,
  component: LocationPage,
});

function LocationPage() {
  const router = useRouter();
  const { world: initialWorld, location: initialLocation, hex } = Route.useLoaderData();
  const [world, setWorld] = useState(initialWorld);
  const [seed, setSeed] = useState(`${world.seed}-${initialLocation.id}`);

  // Find current location (may change after regeneration)
  const location = world.locations.find((loc) => loc.id === initialLocation.id);

  // Get NPCs for this location
  const npcs: NPC[] = world.npcs.filter((npc) => npc.locationId === location?.id);

  // Get today's events for this location
  const todayRecord = world.state.calendar.find((r) => r.day === world.state.day);
  const todayEvents: DayEvent[] = (todayRecord?.events ?? []).filter(
    (e) => e.linkedLocationId === location?.id
  );

  // Get all events for this location across all days
  const locationEvents = world.state.calendar.flatMap((record) =>
    record.events
      .filter((e) => e.linkedLocationId === location?.id)
      .map((e) => ({ ...e, day: record.day }))
  );

  // Get hooks for this location
  const hooks: Hook[] = world.hooks.filter((h) =>
    h.involvedLocationIds.includes(location?.id ?? "")
  );

  const handleRegenerate = useCallback(
    (type: RegenerationType, options?: RegenerateOptions) => {
      if (!hex) return;
      const updated = regenerateHex(world, hex.coord, type, options);
      saveWorld(updated);
      setWorld(updated);

      // Find new location at this hex (if any)
      const newLocation = updated.locations.find(
        (loc) => loc.hexCoord.q === hex.coord.q && loc.hexCoord.r === hex.coord.r
      );

      if (newLocation) {
        // Navigate to new location
        router.navigate({
          to: "/world/$worldId/location/$locationId",
          params: { worldId: world.id, locationId: newLocation.id },
          replace: true,
        });
      } else {
        // Location cleared - go back to world
        router.navigate({
          to: "/world/$worldId",
          params: { worldId: world.id },
        });
      }
    },
    [world, hex, router]
  );

  const handleUpdateWorld = useCallback((updater: (world: WorldData) => WorldData) => {
    const updated = updater(world);
    saveWorld(updated);
    setWorld(updated);
  }, [world]);

  const handleReroll = useCallback(() => {
    setSeed(`${world.seed}-${initialLocation.id}-${Date.now()}`);
  }, [world.seed, initialLocation.id]);

  // Regenerate modal state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  // Location not found (shouldn't happen in normal flow)
  if (!location) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-stone-900 text-stone-100">
        <p className="text-stone-400">Location not found</p>
        <Link
          to="/world/$worldId"
          params={{ worldId: world.id }}
          className="mt-4 text-amber-400 hover:underline"
        >
          Back to world
        </Link>
      </div>
    );
  }

  const currentLocationType = isSettlement(location)
    ? "settlement" as const
    : isDungeon(location)
    ? "dungeon" as const
    : "wilderness" as const;
  const defaultRegenerateType = isSettlement(location)
    ? (location as Settlement).size
    : isDungeon(location)
    ? (location as Dungeon).theme
    : undefined;

  return (
    <div className="flex h-full flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-stone-400 hover:text-stone-200" />
            <h1 className="font-semibold">{location.name}</h1>
            <span className="rounded bg-stone-700 px-2 py-0.5 text-xs capitalize text-stone-400">
              {location.type}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-100">
                <Menu size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
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
            currentSize={isDungeon(location) ? (location as Dungeon).size : undefined}
            currentSeed={seed}
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isSettlement(location) && (
          <SettlementDetail
            settlement={location as Settlement}
            npcs={npcs}
            todayEvents={todayEvents}
            locationEvents={locationEvents}
            currentDay={world.state.day}
            factions={world.factions}
            hooks={hooks}
            locations={world.locations}
            worldId={world.id}
            ruleset={world.ruleset}
            onReroll={handleReroll}
            onUpdateWorld={handleUpdateWorld}
            seed={seed}
          />
        )}

        {isDungeon(location) && (
          <DungeonDetail
            dungeon={location as Dungeon}
            hook={hooks.find((h) => h.status === "active")}
            hooks={hooks}
            npcs={world.npcs}
            factions={world.factions}
            worldId={world.id}
            ruleset={world.ruleset}
            onReroll={handleReroll}
            seed={seed}
          />
        )}

        {/* Landmark */}
        {location.type === "landmark" && hex && (
          <LandmarkDetail
            landmark={location}
            hex={hex}
            npcs={world.npcs}
            factions={world.factions}
            worldId={world.id}
            ruleset={world.ruleset}
          />
        )}
      </div>
    </div>
  );
}
