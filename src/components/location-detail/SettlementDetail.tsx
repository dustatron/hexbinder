import { RefreshCw, Users, Shield, Coins, AlertTriangle, ScrollText, MessageSquare, Building2, User, Flag } from "lucide-react";
import type { Settlement, NPC, Faction, DayEvent, SettlementSite } from "~/models";
import type { RegenerationType } from "~/lib/hex-regenerate";
import { EncounterTable } from "~/components/encounter-table/EncounterTable";
import { RegenerateButton } from "./RegenerateButton";

interface SettlementDetailProps {
  settlement: Settlement;
  npcs: NPC[];
  todayEvents: DayEvent[];
  factions: Faction[];
  worldId: string;
  onRegenerate: (type: RegenerationType) => void;
  onReroll: () => void;
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
  seed,
}: SettlementDetailProps) {
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

      {/* Map Placeholder */}
      <section className="flex h-40 items-center justify-center rounded-lg border border-dashed border-stone-600 bg-stone-800/50">
        <div className="text-center">
          <p className="text-sm text-stone-500">Map coming soon</p>
          <p className="text-xs text-stone-600">{settlement.name}</p>
        </div>
      </section>

      {/* Encounter Table */}
      <section>
        <EncounterTable seed={`${seed}-settlement`} onReroll={onReroll} />
      </section>

      {/* Key Locations (Sites) */}
      {settlement.sites.length > 0 && (
        <section>
          <SectionHeader icon={Building2} title="Key Locations" />
          <div className="grid gap-2">
            {settlement.sites.map((site) => (
              <div
                key={site.id}
                className="rounded-lg border border-stone-700 bg-stone-800/50 p-3"
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
            ))}
          </div>
        </section>
      )}

      {/* NPCs */}
      {npcs.length > 0 && (
        <section>
          <SectionHeader icon={User} title="NPCs" />
          <div className="grid gap-2">
            {npcs.map((npc) => {
              const faction = npcFactionMap.get(npc.id);
              return (
                <div
                  key={npc.id}
                  className="rounded-lg border border-stone-700 bg-stone-800/50 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-stone-200">{npc.name}</h4>
                      <p className="text-xs text-stone-500">
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
                  <p className="mt-1 text-xs text-amber-400/80">
                    <span className="font-medium">Wants:</span> {npc.wants}
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
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                Rumors
              </h4>
              <ul className="space-y-1">
                {settlement.rumors.map((rumor) => (
                  <li
                    key={rumor.id}
                    className="flex items-start gap-2 rounded bg-stone-800/50 p-2 text-sm"
                  >
                    <ScrollText size={14} className="mt-0.5 shrink-0 text-stone-500" />
                    <div>
                      <p className="text-stone-300">"{rumor.text}"</p>
                      <p className="text-xs text-stone-500">
                        Source: {rumor.source}
                        {!rumor.isTrue && (
                          <span className="ml-2 text-red-400">(false)</span>
                        )}
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
              <ul className="space-y-1">
                {settlement.notices.map((notice) => (
                  <li
                    key={notice.id}
                    className="rounded border border-stone-700 bg-stone-800/50 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-stone-600 px-1.5 py-0.5 text-xs text-stone-300">
                        {notice.noticeType}
                      </span>
                      <h5 className="font-medium text-stone-200">{notice.title}</h5>
                    </div>
                    <p className="mt-1 text-sm text-stone-400">{notice.description}</p>
                    {notice.reward && (
                      <p className="mt-1 text-xs text-amber-400">
                        Reward: {notice.reward}
                      </p>
                    )}
                  </li>
                ))}
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
