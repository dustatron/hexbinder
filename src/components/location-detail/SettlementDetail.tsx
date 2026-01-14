import { RefreshCw, Users, Shield, Coins, AlertTriangle, ScrollText, MessageSquare, Building2, User, Flag, Map as MapIcon } from "lucide-react";
import type { Settlement, NPC, Faction, DayEvent, SettlementSite, WorldData } from "~/models";
import { isSpatialSettlement, type SpatialSettlement } from "~/models";
import type { RegenerationType } from "~/lib/hex-regenerate";
import { EncounterTable } from "~/components/encounter-table/EncounterTable";
import { RegenerateButton } from "./RegenerateButton";
import { TownMap } from "~/components/town-map";
import { useState } from "react";

interface SettlementDetailProps {
  settlement: Settlement;
  npcs: NPC[];
  todayEvents: DayEvent[];
  factions: Faction[];
  worldId: string;
  onRegenerate: (type: RegenerationType) => void;
  onReroll: () => void;
  onUpdateWorld: (updater: (world: WorldData) => WorldData) => void;
  seed: string;
}

const SIZE_LABELS: Record<Settlement["size"], string> = {
  thorpe: "Thorpe",
  hamlet: "Hamlet",
  village: "Village",
  town: "Town",
  city: "City",
};

const SIZE_COLORS: Record<Settlement["size"], string> = {
  thorpe: "bg-stone-600",
  hamlet: "bg-stone-500",
  village: "bg-amber-600",
  town: "bg-amber-500",
  city: "bg-amber-400",
};

const SITE_ICONS: Record<SettlementSite["type"], string> = {
  tavern: "🍺",
  inn: "🛏️",
  temple: "⛪",
  blacksmith: "⚒️",
  general_store: "🏪",
  market: "🛒",
  guild_hall: "🏛️",
  noble_estate: "🏰",
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-stone-700 pb-2">
      <Icon size={16} className="text-stone-400" />
      <h3 className="text-sm font-semibold text-stone-200">{title}</h3>
    </div>
  );
}

export function SettlementDetail({
  settlement,
  npcs,
  todayEvents,
  factions,
  worldId,
  onRegenerate,
  onReroll,
  onUpdateWorld,
  seed,
}: SettlementDetailProps) {
  // State for ward selection (similar to dungeon room selection)
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  // Toggle rumor used state
  const handleToggleRumor = (rumorId: string) => {
    onUpdateWorld((world) => {
      const updatedLocations = world.locations.map((loc) => {
        if (loc.id === settlement.id && loc.type === "settlement") {
          const updatedSettlement = loc as Settlement;
          return {
            ...updatedSettlement,
            rumors: updatedSettlement.rumors.map((r) =>
              r.id === rumorId ? { ...r, used: !r.used } : r
            ),
          };
        }
        return loc;
      });
      return { ...world, locations: updatedLocations };
    });
  };

  // Toggle notice used state
  const handleNoticeToggle = (noticeId: string) => {
    onUpdateWorld((world) => {
      const updatedLocations = world.locations.map((loc) => {
        if (loc.id === settlement.id && loc.type === "settlement") {
          const updatedSettlement = loc as Settlement;
          return {
            ...updatedSettlement,
            notices: updatedSettlement.notices.map((n) =>
              n.id === noticeId ? { ...n, used: !n.used } : n
            ),
          };
        }
        return loc;
      });
      return { ...world, locations: updatedLocations };
    });
  };

  // Filter factions that have presence in this settlement
  const presentFactions = factions.filter(
    (f) =>
      f.territoryIds.includes(settlement.id) ||
      f.influenceIds.includes(settlement.id) ||
      f.headquartersId === settlement.id
  );

  // Build NPC to faction lookup
  const npcFactionMap = new Map<string, Faction>();
  for (const npc of npcs) {
    if (npc.factionId) {
      const faction = factions.find((f) => f.id === npc.factionId);
      if (faction) npcFactionMap.set(npc.id, faction);
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-stone-100">{settlement.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {settlement.isCapital && (
                <span className="rounded bg-yellow-500 px-2 py-0.5 text-xs font-bold text-yellow-950">
                  CAPITAL
                </span>
              )}
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium text-stone-100 ${SIZE_COLORS[settlement.size]}`}
              >
                {SIZE_LABELS[settlement.size]}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <Users size={12} />
                Pop. {settlement.population.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <Shield size={12} />
                {settlement.defenses}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReroll}
              className="rounded p-1.5 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
              title="Re-roll settlement"
            >
              <RefreshCw size={16} />
            </button>
            <RegenerateButton
              onRegenerate={onRegenerate}
              currentLocationType="settlement"
            />
          </div>
        </div>

        <p className="text-sm text-stone-300">{settlement.description}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 text-xs text-stone-400">
          <span>Govt: {settlement.governmentType}</span>
          {settlement.rulerNpcId && settlement.rulerTitle && (() => {
            const ruler = npcs.find((n) => n.id === settlement.rulerNpcId);
            const titleLabel = {
              king: "King",
              baron: "Baron",
              duke: "Duke",
              count: "Count",
            }[settlement.rulerTitle];
            return ruler ? (
              <span className="font-medium text-yellow-400">
                {titleLabel}: {ruler.name}
              </span>
            ) : null;
          })()}
          {!settlement.rulerNpcId && settlement.mayorNpcId && (() => {
            const mayor = npcs.find((n) => n.id === settlement.mayorNpcId);
            return mayor ? (
              <span className="text-stone-300">
                {settlement.governmentType === "elder" ? "Elder" : "Mayor"}: {mayor.name}
              </span>
            ) : null;
          })()}
          <span>Mood: {settlement.mood}</span>
          <span className="flex items-center gap-1">
            <Coins size={12} />
            {settlement.economyBase.join(", ")}
          </span>
        </div>

        {/* Trouble & Quirk */}
        {(settlement.trouble || settlement.quirk) && (
          <div className="mt-2 space-y-1 rounded bg-stone-800 p-2 text-xs">
            {settlement.trouble && (
              <p className="text-amber-400">
                <span className="font-medium">Trouble:</span> {settlement.trouble}
              </p>
            )}
            {settlement.quirk && (
              <p className="text-stone-400">
                <span className="font-medium">Quirk:</span> {settlement.quirk}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Today's Events - Priority section */}
      {todayEvents.length > 0 && (
        <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <SectionHeader icon={AlertTriangle} title="Today's Events" />
          <ul className="space-y-2">
            {todayEvents.map((event) => (
              <li
                key={event.id}
                className="rounded bg-stone-800/50 p-2 text-sm text-stone-200"
              >
                <span className="mr-2 rounded bg-amber-500/30 px-1.5 py-0.5 text-xs text-amber-300">
                  {event.type.replace("_", " ")}
                </span>
                {event.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Town Map */}
      {isSpatialSettlement(settlement) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-stone-400" />
            <h3 className="text-sm font-semibold text-stone-200">Town Map</h3>
          </div>
          <TownMap
            settlement={settlement as SpatialSettlement}
            selectedWardId={selectedWardId ?? undefined}
            onWardClick={(wardId: string) => setSelectedWardId(wardId)}
          />
          <p className="text-xs text-stone-500">
            Click a ward to see details. Pan and zoom with gestures.
          </p>
        </section>
      )}

      {/* Encounter Table */}
      <section>
        <EncounterTable seed={`${seed}-settlement`} onReroll={onReroll} />
      </section>

      {/* Key Locations (Sites) */}
      {settlement.sites.length > 0 && (
        <section>
          <SectionHeader icon={Building2} title="Key Locations" />
          <div className="grid gap-2">
            {settlement.sites.map((site) => {
              const owner = site.ownerId ? npcs.find((n) => n.id === site.ownerId) : undefined;
              const staff = site.staffIds?.map((id) => npcs.find((n) => n.id === id)).filter(Boolean) || [];
              // Check if this site's ward is selected
              const isWardSelected = isSpatialSettlement(settlement) && selectedWardId &&
                (settlement as SpatialSettlement).wards.some(w => w.siteId === site.id && w.id === selectedWardId);
              return (
                <div
                  key={site.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    isWardSelected
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-stone-700 bg-stone-800/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{SITE_ICONS[site.type] || "🏠"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-stone-200">{site.name}</h4>
                        <span className="rounded bg-stone-700 px-1.5 py-0.5 text-xs text-stone-400">
                          {site.type.replace("_", " ")}
                        </span>
                      </div>
                      {(owner || staff.length > 0) && (
                        <p className="mt-1 text-xs text-stone-400">
                          {owner && (
                            <a href={`#npc-${owner.id}`} className="text-amber-400 hover:underline">{owner.name}</a>
                          )}
                          {owner && staff.length > 0 && " · "}
                          {staff.length > 0 && (
                            <span className="text-stone-500">
                              Staff: {staff.map((s, i) => (
                                <span key={s!.id}>
                                  {i > 0 && ", "}
                                  <a href={`#npc-${s!.id}`} className="hover:underline">{s!.name}</a>
                                </span>
                              ))}
                            </span>
                          )}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-stone-400">{site.description}</p>
                      {site.quirk && (
                        <p className="mt-1 text-xs italic text-stone-500">
                          {site.quirk}
                        </p>
                      )}
                      {site.services.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {site.services.map((svc, i) => (
                            <span
                              key={i}
                              className="rounded bg-stone-700/50 px-1.5 py-0.5 text-xs text-stone-400"
                              title={svc.description}
                            >
                              {svc.name} ({svc.cost})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* NPCs */}
      {npcs.length > 0 && (
        <section>
          <SectionHeader icon={User} title="NPCs" />
          <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
            {[...npcs].sort((a, b) => a.name.localeCompare(b.name)).map((npc) => {
              const faction = npcFactionMap.get(npc.id);
              const relationships = npc.relationships || [];
              const familyRels = relationships.filter((r) =>
                ["parent", "child", "sibling", "spouse"].includes(r.type)
              );
              return (
                <div
                  key={npc.id}
                  id={`npc-${npc.id}`}
                  className="break-inside-avoid scroll-mt-4 rounded-lg border border-stone-700 bg-stone-800/50 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-stone-200">
                        {npc.name}
                        {npc.age && (
                          <span className="ml-1 text-xs text-stone-500">
                            ({npc.age} yrs)
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {npc.role && (
                          <span className="capitalize text-stone-400">
                            {npc.role.replace("_", " ")} &middot;{" "}
                          </span>
                        )}
                        {npc.archetype} (Threat {npc.threatLevel})
                      </p>
                    </div>
                    {faction && (
                      <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-300">
                        {faction.name}
                        {npc.factionRole && ` - ${npc.factionRole}`}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-400">{npc.description}</p>
                  {familyRels.length > 0 && (
                    <p className="mt-1 text-xs text-blue-400/80">
                      <span className="font-medium">Family:</span>{" "}
                      {familyRels.map((r) => {
                        const relNpc = npcs.find((n) => n.id === r.targetNpcId);
                        return relNpc ? `${r.type}: ${relNpc.name}` : null;
                      }).filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-amber-400/80">
                    <span className="font-medium">Wants:</span>{" "}
                    {npc.wants.length > 0 ? (
                      <span className="text-amber-300">
                        {npc.wants.map((w) => w.personalStakes).join(", ")}
                      </span>
                    ) : (
                      npc.flavorWant
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Rumors & Notices */}
      {(settlement.rumors.length > 0 || settlement.notices.length > 0) && (
        <section>
          <SectionHeader icon={MessageSquare} title="Rumors & Notices" />

          {settlement.rumors.length > 0 && (
            <div className="mb-3">
              {/* Header bar */}
              <div className="mb-2 rounded-t bg-stone-700 px-3 py-1.5">
                <h4 className="text-xs font-medium uppercase tracking-wide text-stone-200">
                  Rumors
                </h4>
              </div>
              {/* Rumors list with numbers */}
              <ul className="space-y-1">
                {settlement.rumors.map((rumor, index) => (
                  <li
                    key={rumor.id}
                    className="flex items-start gap-2 rounded bg-stone-800/50 p-2 text-sm"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={rumor.used ?? false}
                      onChange={() => handleToggleRumor(rumor.id)}
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-stone-600 bg-stone-700 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
                    />
                    {/* Row number */}
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded bg-stone-600 text-xs font-medium text-stone-200 ${rumor.used ? "opacity-50" : ""}`}>
                      {index + 1}
                    </div>
                    {/* Rumor content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className={`text-stone-300 ${rumor.used ? "opacity-50 line-through" : ""}`}>"{rumor.text}"</p>
                        {rumor.linkedHookId && (
                          <span className={`ml-2 shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300 ${rumor.used ? "opacity-50" : ""}`}>
                            Quest
                          </span>
                        )}
                      </div>
                      <p className={`text-xs text-stone-500 ${rumor.used ? "opacity-50 line-through" : ""}`}>
                        Source: {rumor.source}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {settlement.notices.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                Notice Board
              </h4>
              <ul className="space-y-2">
                {settlement.notices.map((notice) => {
                  const posterNpc = notice.posterId
                    ? npcs.find((n) => n.id === notice.posterId)
                    : undefined;
                  return (
                    <li
                      key={notice.id}
                      className="rounded border border-stone-700 bg-stone-800/50 p-2"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={notice.used ?? false}
                          onChange={() => handleNoticeToggle(notice.id)}
                          className="mt-1 h-4 w-4 cursor-pointer rounded border-stone-600 bg-stone-700 text-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-amber-600/80 px-1.5 py-0.5 text-xs font-medium text-stone-100">
                              {notice.noticeType.toUpperCase()}
                            </span>
                            <h5 className={`font-medium text-stone-200 ${notice.used ? "line-through opacity-50" : ""}`}>
                              {notice.title}
                            </h5>
                          </div>
                          <p className={`mt-1 text-sm text-stone-300 ${notice.used ? "line-through opacity-50" : ""}`}>
                            {notice.description}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-xs">
                            {posterNpc && (
                              <span className="text-stone-400">
                                <span className="font-medium text-stone-300">Contact:</span>{" "}
                                <a href={`#npc-${posterNpc.id}`} className="text-amber-400 hover:underline">
                                  {posterNpc.name}
                                </a>
                                {posterNpc.role && ` (${posterNpc.role.replace("_", " ")})`}
                              </span>
                            )}
                            {notice.reward && (
                              <span className="text-amber-400 font-medium">
                                Pays: {notice.reward}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Faction Presence */}
      {presentFactions.length > 0 && (
        <section>
          <SectionHeader icon={Flag} title="Faction Presence" />
          <div className="grid gap-2">
            {presentFactions.map((faction) => {
              const isHQ = faction.headquartersId === settlement.id;
              const isTerritory = faction.territoryIds.includes(settlement.id);
              return (
                <div
                  key={faction.id}
                  className="rounded-lg border border-stone-700 bg-stone-800/50 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-stone-200">{faction.name}</h4>
                      <p className="text-xs text-stone-500">
                        {faction.archetype} - {faction.factionType}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {isHQ && (
                        <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">
                          HQ
                        </span>
                      )}
                      {isTerritory && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                          Territory
                        </span>
                      )}
                      {!isHQ && !isTerritory && (
                        <span className="rounded bg-stone-600 px-1.5 py-0.5 text-xs text-stone-300">
                          Influence
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-stone-400">{faction.purpose}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    Status: {faction.status}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
