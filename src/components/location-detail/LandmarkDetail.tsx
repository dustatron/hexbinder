import { Link } from "@tanstack/react-router";
import { MapPin, Compass, Users, Swords } from "lucide-react";
import type { Location, NPC, Faction, Hex, Ruleset } from "~/models";

interface LandmarkDetailProps {
  landmark: Location;
  hex: Hex;
  npcs: NPC[];
  factions: Faction[];
  worldId: string;
  ruleset: Ruleset;
}

export function LandmarkDetail({
  landmark,
  hex,
  npcs,
  factions,
  worldId,
}: LandmarkDetailProps) {
  const faction = landmark.factionId
    ? factions.find((f) => f.id === landmark.factionId)
    : null;

  const landmarkNpcs = (landmark.npcIds ?? [])
    .map((id) => npcs.find((n) => n.id === id))
    .filter(Boolean) as NPC[];

  return (
    <div className="space-y-6 p-4">
      {/* Description */}
      <section>
        <p className="text-stone-300 leading-relaxed">{landmark.description}</p>
      </section>

      {/* Location info */}
      <section className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 rounded bg-stone-800 px-2 py-1 text-stone-400">
          <MapPin size={12} />
          Hex ({hex.coord.q}, {hex.coord.r})
        </span>
        <span className="rounded bg-stone-800 px-2 py-1 capitalize text-stone-400">
          {hex.terrain}
        </span>
        {landmark.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-stone-700 px-2 py-1 text-stone-300"
          >
            {tag}
          </span>
        ))}
      </section>

      {/* Controlling Faction */}
      {faction && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-400">
            <Users size={14} />
            Associated Faction
          </h3>
          <Link
            to="/world/$worldId/faction/$factionId"
            params={{ worldId, factionId: faction.id }}
            className="block rounded bg-stone-800 px-3 py-2 text-sm text-cyan-300 hover:bg-stone-700"
          >
            {faction.name}
            <span className="ml-2 text-xs capitalize text-stone-500">{faction.factionType}</span>
          </Link>
        </section>
      )}

      {/* Encounters / Points of Interest */}
      {landmark.encounters && landmark.encounters.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-400">
            <Compass size={14} />
            Points of Interest
          </h3>
          <ul className="space-y-2">
            {landmark.encounters.map((enc, i) => (
              <li
                key={i}
                className="rounded border border-stone-700 bg-stone-800/50 px-3 py-2 text-sm text-stone-300"
              >
                <Swords size={12} className="mr-2 inline text-amber-500" />
                {enc}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Associated NPCs */}
      {landmarkNpcs.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            <Users size={14} />
            Notable Figures
          </h3>
          <ul className="space-y-2">
            {landmarkNpcs.map((npc) => (
              <li key={npc.id} className="rounded bg-stone-800 px-3 py-2">
                <span className="text-sm font-medium text-stone-200">{npc.name}</span>
                <p className="text-xs capitalize text-stone-500">
                  {npc.race} {npc.role ? npc.role.replace("_", " ") : npc.archetype}
                </p>
                {npc.flavorWant && (
                  <p className="mt-1 text-xs italic text-stone-400">"{npc.flavorWant}"</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Hex Feature (if present alongside landmark) */}
      {hex.feature && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Hex Feature
          </h3>
          <div className="rounded bg-stone-800 px-3 py-2">
            <span className="text-sm capitalize text-stone-300">
              {hex.feature.type.replace(/_/g, " ")}
            </span>
            {hex.feature.description && (
              <p className="mt-1 text-xs text-stone-500">{hex.feature.description}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
