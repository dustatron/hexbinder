import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FactionDetail } from "~/components/location-detail/FactionDetail";
import { loadWorld } from "~/lib/storage";
import { SidebarTrigger } from "~/components/ui/sidebar";

export const Route = createFileRoute("/world/$worldId_/faction/$factionId")({
  loader: ({ params }) => {
    const world = loadWorld(params.worldId);
    if (!world) throw notFound();

    const faction = world.factions.find((f) => f.id === params.factionId);
    if (!faction) throw notFound();

    return { world, faction };
  },
  ssr: false,
  component: FactionPage,
});

function FactionPage() {
  const { world, faction } = Route.useLoaderData();

  // Filter clocks owned by this faction
  const clocks = world.clocks.filter(
    (c) => c.ownerId === faction.id && c.ownerType === "faction"
  );

  // Filter NPCs belonging to this faction
  const npcs = world.npcs.filter((n) => n.factionId === faction.id);

  // Filter hooks involving this faction
  const hooks = world.hooks.filter((h) =>
    h.involvedFactionIds.includes(faction.id)
  );

  return (
    <div className="flex h-full flex-col bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="z-10 border-b border-stone-700 bg-stone-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 text-stone-400 hover:text-stone-200" />
          <h1 className="font-semibold">{faction.name}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <FactionDetail
          faction={faction}
          clocks={clocks}
          npcs={npcs}
          locations={world.locations}
          hooks={hooks}
          significantItems={world.significantItems}
          worldId={world.id}
          ruleset={world.ruleset}
        />
      </div>
    </div>
  );
}
