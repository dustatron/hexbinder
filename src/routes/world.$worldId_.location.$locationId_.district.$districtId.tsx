import { useState, useCallback } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Menu, RefreshCw } from "lucide-react";
import { DistrictDetail } from "~/components/location-detail/DistrictDetail";
import { loadWorld, saveWorld } from "~/lib/storage";
import { isSettlement, type Settlement, type WorldData } from "~/models";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute(
  "/world/$worldId_/location/$locationId_/district/$districtId"
)({
  loader: ({ params }) => {
    const world = loadWorld(params.worldId);
    if (!world) throw notFound();

    const location = world.locations.find((loc) => loc.id === params.locationId);
    if (!location || !isSettlement(location)) throw notFound();

    const settlement = location as Settlement;
    const district = settlement.districts?.find((d) => d.id === params.districtId);
    if (!district) throw notFound();

    return { world, settlement, district };
  },
  ssr: false,
  component: DistrictPage,
});

function DistrictPage() {
  const { world: initialWorld, settlement: initialSettlement, district: initialDistrict } =
    Route.useLoaderData();
  const [world, setWorld] = useState(initialWorld);

  // Re-derive settlement and district from current world state
  const settlement = world.locations.find(
    (loc) => loc.id === initialSettlement.id
  ) as Settlement | undefined;
  const district = settlement?.districts?.find(
    (d) => d.id === initialDistrict.id
  );

  const handleUpdateWorld = useCallback(
    (updater: (world: WorldData) => WorldData) => {
      const updated = updater(world);
      saveWorld(updated);
      setWorld(updated);
    },
    [world]
  );

  if (!settlement || !district) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-stone-900 text-stone-100">
        <p className="text-stone-400">District not found</p>
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

  // Get NPCs for this location
  const npcs = world.npcs.filter((npc) => npc.locationId === settlement.id);

  return (
    <div className="flex h-svh flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/world/$worldId/location/$locationId"
              params={{ worldId: world.id, locationId: settlement.id }}
              className="text-stone-400 hover:text-stone-200"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold">{district.name}</h1>
            <span className="rounded bg-stone-700 px-2 py-0.5 text-xs capitalize text-stone-400">
              {district.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <DistrictDetail
          settlement={settlement}
          district={district}
          npcs={npcs}
          factions={world.factions}
          hooks={world.hooks}
          locations={world.locations}
          worldId={world.id}
          ruleset={world.ruleset}
          onUpdateWorld={handleUpdateWorld}
        />
      </div>
    </div>
  );
}
