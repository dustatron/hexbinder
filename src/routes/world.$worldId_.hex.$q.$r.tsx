import { useState, useCallback } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { nanoid } from "nanoid";
import { loadWorld, saveWorld } from "~/lib/storage";
import { regenerateHex, type RegenerationType } from "~/lib/hex-regenerate";
import { WildernessDetail } from "~/components/location-detail/WildernessDetail";
import { SettlementDetail } from "~/components/location-detail/SettlementDetail";
import { DungeonDetail } from "~/components/location-detail/DungeonDetail";
import type { Settlement, Dungeon, WorldData } from "~/models";

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
  const [seed, setSeed] = useState(() => `${world.seed}-hex-${initialHex.coord.q},${initialHex.coord.r}-${nanoid(4)}`);

  // Re-derive hex and location from current world state
  const hex = world.hexes.find((h) => h.coord.q === initialHex.coord.q && h.coord.r === initialHex.coord.r)!;
  const location = hex.locationId
    ? world.locations.find((loc) => loc.id === hex.locationId)
    : null;

  const handleRegenerate = useCallback((type: RegenerationType) => {
    const newWorld = regenerateHex(world, hex.coord, type);
    saveWorld(newWorld);
    setWorld(newWorld);
    setSeed(`${newWorld.seed}-hex-${hex.coord.q},${hex.coord.r}-${nanoid(4)}`);
  }, [world, hex.coord]);

  const handleReroll = useCallback(() => {
    setSeed(`${world.seed}-hex-${hex.coord.q},${hex.coord.r}-${nanoid(4)}`);
  }, [world.seed, hex.coord]);

  const handleUpdateWorld = useCallback((updater: (world: WorldData) => WorldData) => {
    const updated = updater(world);
    saveWorld(updated);
    setWorld(updated);
  }, [world]);

  // Get today's events for settlements
  const todayRecord = world.state.calendar.find((r) => r.day === world.state.day);
  const todayEvents = (todayRecord?.events ?? []).filter(
    (e) => e.type !== "weather_change" && e.linkedLocationId === location?.id
  );

  // Filter NPCs at this location
  const npcs = location ? world.npcs.filter((n) => n.locationId === location.id) : [];

  // Find hook pointing to dungeon
  const hook = location?.type === "dungeon"
    ? world.hooks.find((h) => h.involvedLocationIds.includes(location.id))
    : undefined;

  // Build page title
  const title = location?.name ?? `Hex (${hex.coord.q}, ${hex.coord.r})`;

  return (
    <div className="flex h-svh flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/world/$worldId"
            params={{ worldId: world.id }}
            className="text-stone-400 hover:text-stone-200"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold">{title}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!location && (
          <WildernessDetail
            hex={hex}
            worldId={world.id}
            onRegenerate={handleRegenerate}
            onReroll={handleReroll}
            seed={seed}
          />
        )}

        {location?.type === "settlement" && (
          <SettlementDetail
            settlement={location as Settlement}
            npcs={npcs}
            todayEvents={todayEvents}
            factions={world.factions}
            worldId={world.id}
            onRegenerate={handleRegenerate}
            onReroll={handleReroll}
            onUpdateWorld={handleUpdateWorld}
            seed={seed}
          />
        )}

        {location?.type === "dungeon" && (
          <DungeonDetail
            dungeon={location as Dungeon}
            hook={hook}
            worldId={world.id}
            onRegenerate={handleRegenerate}
            onReroll={handleReroll}
            seed={seed}
          />
        )}
      </div>
    </div>
  );
}
