import { useState, useCallback } from "react";
import {
  Users, Shield, Coins, AlertTriangle, Building2, User,
  Flag, ChevronDown, ChevronRight, Crown, Map as MapIcon,
  ScrollText, Plus,
} from "lucide-react";
import type {
  Settlement, NPC, Faction, DayEvent, Hook, Location,
  WorldData, Ruleset, District, DistrictType,
} from "~/models";
import { isCityWithDistricts } from "~/models";
import { InlineEditText, InlineEditSelect } from "~/components/ui/inline-edit";
import { DistrictNodeMap } from "~/components/district-map/DistrictNodeMap";
import { Button } from "~/components/ui/button";
import { Link } from "@tanstack/react-router";
import { nanoid } from "nanoid";

interface CityDetailProps {
  settlement: Settlement;
  npcs: NPC[];
  todayEvents: DayEvent[];
  currentDay: number;
  factions: Faction[];
  hooks: Hook[];
  locations: Location[];
  worldId: string;
  ruleset: Ruleset;
  onUpdateWorld: (updater: (world: WorldData) => WorldData) => void;
  seed: string;
}

const DEFENSE_LABELS: Record<string, string> = {
  none: "Undefended",
  militia: "Militia",
  guards: "City Guard",
  walls: "Walled",
  fortified: "Fortified",
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-stone-700 pb-2">
      <Icon size={16} className="text-stone-400" />
      <h3 className="text-sm font-semibold text-stone-200">{title}</h3>
    </div>
  );
}

export function CityDetail({
  settlement,
  npcs,
  todayEvents,
  currentDay,
  factions,
  hooks,
  locations,
  worldId,
  ruleset,
  onUpdateWorld,
  seed,
}: CityDetailProps) {
  const [showLore, setShowLore] = useState(false);

  const districts = settlement.districts ?? [];
  const cityIdentity = settlement.cityIdentity;

  const updateSettlement = useCallback(
    <K extends keyof Settlement>(field: K, value: Settlement[K]) => {
      onUpdateWorld((world) => ({
        ...world,
        locations: world.locations.map((loc) =>
          loc.id === settlement.id ? { ...loc, [field]: value } : loc,
        ),
      }));
    },
    [onUpdateWorld, settlement.id],
  );

  const handleAddDistrict = useCallback(() => {
    const id = `district-${nanoid(8)}`;
    const newDistrict: District = {
      id,
      name: "New District",
      type: "residential",
      description: "A newly established district",
      mood: "quiet",
      trouble: "The district is still finding its identity",
      flavor: "Fresh paint and new construction dominate the streets",
      economy: "Mixed local economy",
      faceNpcId: "",
      siteIds: [],
      npcIds: [],
      rumors: [],
      notices: [],
      adjacencies: [],
      position: {
        x: 200 + Math.round(Math.random() * 100 - 50),
        y: 200 + Math.round(Math.random() * 100 - 50),
      },
    };

    onUpdateWorld((world) => ({
      ...world,
      locations: world.locations.map((loc) => {
        if (loc.id !== settlement.id) return loc;
        const s = loc as Settlement;
        return {
          ...s,
          districts: [...(s.districts ?? []), newDistrict],
        };
      }),
    }));
  }, [onUpdateWorld, settlement.id]);

  // Find key NPCs
  const mayor = npcs.find(n => n.id === settlement.mayorNpcId);
  const ruler = npcs.find(n => n.id === settlement.rulerNpcId);

  // Faction presence in this city
  const cityFactions = factions.filter(f =>
    f.status === "active" &&
    (f.territoryIds.includes(settlement.id) ||
     f.influenceIds.includes(settlement.id) ||
     f.headquartersId === settlement.id)
  );

  // Faction colors
  const factionColors = ["bg-purple-500/30", "bg-blue-500/30", "bg-red-500/30", "bg-green-500/30", "bg-orange-500/30", "bg-cyan-500/30"];

  return (
    <div className="space-y-6 p-4">
      {/* Header: City name + epithet */}
      <div>
        <div className="flex items-center gap-3">
          <InlineEditText
            value={settlement.name}
            onSave={(v) => updateSettlement("name", v)}
            as="h2"
            className="text-2xl font-bold text-stone-100"
          />
          <span className="rounded bg-amber-400/20 px-2 py-0.5 text-xs font-medium text-amber-300">
            City
          </span>
          <span className="text-xs text-stone-400">
            Pop. {settlement.population.toLocaleString()}
          </span>
        </div>
        {cityIdentity && (
          <p className="mt-1 text-sm italic text-amber-400/80">
            {settlement.name}, {cityIdentity.cityEpithet}
          </p>
        )}
      </div>

      {/* City Identity */}
      {cityIdentity && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
          <SectionHeader icon={Crown} title="City Identity" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-stone-400">Economy: </span>
              <span className="text-stone-200 capitalize">
                {cityIdentity.primaryEconomy}
                {cityIdentity.secondaryEconomy && ` / ${cityIdentity.secondaryEconomy}`}
              </span>
            </div>
            <div>
              <span className="text-stone-400">Culture: </span>
              <span className="text-stone-200">{cityIdentity.culturalFlavor}</span>
            </div>
            <div>
              <span className="text-stone-400">Defense: </span>
              <span className="text-stone-200">
                {DEFENSE_LABELS[settlement.defenses] ?? settlement.defenses}
              </span>
            </div>
            <div>
              <span className="text-stone-400">Government: </span>
              <span className="text-stone-200 capitalize">{settlement.governmentType}</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaders */}
      {(ruler || mayor) && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
          <SectionHeader icon={User} title="Leadership" />
          <div className="flex flex-wrap gap-3">
            {ruler && (
              <div className="flex items-center gap-2 rounded bg-stone-700/50 px-3 py-2">
                <Crown size={14} className="text-amber-400" />
                <div>
                  <div className="text-sm font-medium text-stone-200">{ruler.name}</div>
                  <div className="text-xs capitalize text-stone-400">
                    {settlement.rulerTitle ?? "Ruler"}
                  </div>
                </div>
              </div>
            )}
            {mayor && mayor.id !== ruler?.id && (
              <div className="flex items-center gap-2 rounded bg-stone-700/50 px-3 py-2">
                <User size={14} className="text-stone-400" />
                <div>
                  <div className="text-sm font-medium text-stone-200">{mayor.name}</div>
                  <div className="text-xs capitalize text-stone-400">
                    {settlement.governmentType === "theocracy" ? "High Priest" : "Mayor"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* City Problems */}
      <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
        <SectionHeader icon={AlertTriangle} title="City Problems" />
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-stone-400">Trouble: </span>
            <InlineEditText
              value={settlement.trouble}
              onSave={(v) => updateSettlement("trouble", v)}
              className="text-stone-200"
            />
          </div>
          <div>
            <span className="text-stone-400">Quirk: </span>
            <InlineEditText
              value={settlement.quirk}
              onSave={(v) => updateSettlement("quirk", v)}
              className="text-stone-200"
            />
          </div>
        </div>
      </div>

      {/* Faction Overview */}
      {cityFactions.length > 0 && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
          <SectionHeader icon={Flag} title="Faction Presence" />
          <div className="space-y-2">
            {cityFactions.map((faction, i) => {
              const controlledDistricts = districts.filter(
                d => d.controllingFactionId === faction.id
              );
              const contestedDistricts = districts.filter(
                d => d.contestedByFactionIds?.includes(faction.id)
              );

              return (
                <div key={faction.id} className="flex items-start gap-2 text-sm">
                  <Link
                    to="/world/$worldId/faction/$factionId"
                    params={{ worldId, factionId: faction.id }}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${factionColors[i % factionColors.length]} hover:opacity-80`}
                  >
                    {faction.name}
                  </Link>
                  <div className="text-stone-400">
                    {controlledDistricts.length > 0 && (
                      <span>Controls: {controlledDistricts.map(d => d.name).join(", ")}</span>
                    )}
                    {contestedDistricts.length > 0 && (
                      <span className="ml-2 text-amber-400">
                        Contesting: {contestedDistricts.map(d => d.name).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* District Node Map */}
      {districts.length > 0 && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
          <SectionHeader icon={MapIcon} title={`Districts (${districts.length})`} />
          <DistrictNodeMap
            districts={districts}
            factions={factions}
            worldId={worldId}
            locationId={settlement.id}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Click a district to view details
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddDistrict}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              <Plus size={14} className="mr-1" />
              Add District
            </Button>
          </div>
        </div>
      )}

      {/* Add District (when no districts exist yet) */}
      {districts.length === 0 && (
        <div className="rounded-lg border border-dashed border-stone-600 bg-stone-800/30 p-4 text-center">
          <p className="text-sm text-stone-400 mb-2">No districts have been created yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDistrict}
            className="text-stone-300"
          >
            <Plus size={14} className="mr-1" />
            Add First District
          </Button>
        </div>
      )}

      {/* Lore */}
      {settlement.lore && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
          <button
            className="flex w-full items-center gap-2 text-left"
            onClick={() => setShowLore(!showLore)}
          >
            {showLore ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <ScrollText size={16} className="text-stone-400" />
            <h3 className="text-sm font-semibold text-stone-200">History & Lore</h3>
          </button>
          {showLore && (
            <div className="mt-3 space-y-2 text-sm text-stone-300">
              <p>{settlement.lore.history.founding}</p>
              {settlement.lore.history.culturalNote && (
                <p className="italic text-stone-400">{settlement.lore.history.culturalNote}</p>
              )}
              {settlement.lore.history.majorEvents.length > 0 && (
                <div>
                  <span className="text-stone-400">Major Events:</span>
                  <ul className="ml-4 list-disc text-stone-300">
                    {settlement.lore.history.majorEvents.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* City-wide Rumors (unassigned to districts) */}
      {settlement.rumors.length > 0 && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
          <SectionHeader icon={ScrollText} title="City Rumors" />
          <ul className="space-y-1 text-sm text-stone-300">
            {settlement.rumors.slice(0, 6).map(rumor => (
              <li key={rumor.id} className="flex items-start gap-2">
                <span className={rumor.isTrue ? "text-green-400" : "text-red-400"}>
                  {rumor.isTrue ? "T" : "F"}
                </span>
                <span className={rumor.used ? "line-through text-stone-500" : ""}>
                  {rumor.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
