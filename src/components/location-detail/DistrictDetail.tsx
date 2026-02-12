import { useState, useCallback } from "react";
import {
  Users, AlertTriangle, Building2, User, Flag,
  ScrollText, MessageSquare, Map as MapIcon, ChevronDown, ChevronRight,
} from "lucide-react";
import type {
  Settlement, NPC, Faction, Hook, Location,
  WorldData, Ruleset, District, SettlementSite,
} from "~/models";
import { Breadcrumb } from "~/components/ui/Breadcrumb";
import { InlineEditText } from "~/components/ui/inline-edit";
import { Link } from "@tanstack/react-router";

interface DistrictDetailProps {
  settlement: Settlement;
  district: District;
  npcs: NPC[];
  factions: Faction[];
  hooks: Hook[];
  locations: Location[];
  worldId: string;
  ruleset: Ruleset;
  onUpdateWorld: (updater: (world: WorldData) => WorldData) => void;
}

const MOOD_BADGES: Record<string, { bg: string; text: string }> = {
  bustling: { bg: "bg-green-500/20", text: "text-green-400" },
  quiet: { bg: "bg-stone-500/20", text: "text-stone-400" },
  dangerous: { bg: "bg-red-500/20", text: "text-red-400" },
  decaying: { bg: "bg-stone-600/20", text: "text-stone-500" },
  prosperous: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  oppressed: { bg: "bg-purple-500/20", text: "text-purple-400" },
  festive: { bg: "bg-orange-500/20", text: "text-orange-400" },
  tense: { bg: "bg-amber-500/20", text: "text-amber-400" },
};

const DISTRICT_TYPE_ICONS: Record<string, string> = {
  market: "🏪", temple: "⛪", noble: "👑", slums: "🏚️",
  docks: "⚓", warehouse: "📦", artisan: "🔨", military: "⚔️",
  academic: "📜", foreign: "🌍", residential: "🏠", ruins: "💀",
  cannery: "🐟", smelter: "🔥", lumber_yard: "🪵", caravan: "🐪",
  arcane_academy: "✨", arena: "🏟️", foundry: "⚙️",
};

const SITE_ICONS: Record<string, string> = {
  tavern: "🍺", inn: "🛏️", temple: "⛪", blacksmith: "⚒️",
  general_store: "🏪", market: "🏪", guild_hall: "🏛️", noble_estate: "🏰",
  dock: "⚓", warehouse: "📦", arena: "🏟️", library: "📚",
  bathhouse: "🛁", gambling_hall: "🎲", embassy: "🏛️", barracks: "⚔️",
  ruins_entrance: "🚪",
};

function SectionHeader({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-stone-700 pb-2">
      <Icon size={16} className="text-stone-400" />
      <h3 className="text-sm font-semibold text-stone-200">{title}</h3>
      {count !== undefined && (
        <span className="rounded-full bg-stone-700 px-2 py-0.5 text-xs text-stone-400">{count}</span>
      )}
    </div>
  );
}

export function DistrictDetail({
  settlement,
  district,
  npcs,
  factions,
  hooks,
  locations,
  worldId,
  ruleset,
  onUpdateWorld,
}: DistrictDetailProps) {
  const [activeTab, setActiveTab] = useState<"sites" | "npcs" | "hooks">("sites");

  const moodStyle = MOOD_BADGES[district.mood] ?? MOOD_BADGES.quiet;
  const icon = DISTRICT_TYPE_ICONS[district.type] ?? "🏘️";

  // Get district's sites, NPCs, face NPC
  const districtSites = settlement.sites.filter(s => s.districtId === district.id);
  const districtNPCs = npcs.filter(n => n.districtId === district.id);
  const faceNPC = npcs.find(n => n.id === district.faceNpcId);
  const controllingFaction = factions.find(f => f.id === district.controllingFactionId);
  const contestingFactions = factions.filter(f =>
    district.contestedByFactionIds?.includes(f.id)
  );

  const updateDistrict = useCallback(
    <K extends keyof District>(field: K, value: District[K]) => {
      onUpdateWorld((world) => ({
        ...world,
        locations: world.locations.map((loc) => {
          if (loc.id !== settlement.id) return loc;
          const s = loc as Settlement;
          return {
            ...s,
            districts: s.districts?.map(d =>
              d.id === district.id ? { ...d, [field]: value } : d
            ),
          };
        }),
      }));
    },
    [onUpdateWorld, settlement.id, district.id],
  );

  const tabCounts = {
    sites: districtSites.length,
    npcs: districtNPCs.length,
    hooks: district.rumors.length + district.notices.length,
  };

  return (
    <div className="space-y-4 p-4">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        {
          label: settlement.name,
          to: "/world/$worldId/location/$locationId",
          params: { worldId, locationId: settlement.id },
        },
        { label: district.name },
      ]} />

      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <InlineEditText
              value={district.name}
              onSave={(v) => updateDistrict("name", v)}
              as="h2"
              className="text-xl font-bold text-stone-100"
            />
            <span className="rounded bg-stone-700 px-2 py-0.5 text-xs capitalize text-stone-400">
              {district.type.replace(/_/g, " ")}
            </span>
            <span className={`rounded px-2 py-0.5 text-xs capitalize ${moodStyle.bg} ${moodStyle.text}`}>
              {district.mood}
            </span>
          </div>
          {/* Faction badges */}
          <div className="mt-1 flex items-center gap-2">
            {controllingFaction && (
              <Link
                to="/world/$worldId/faction/$factionId"
                params={{ worldId, factionId: controllingFaction.id }}
                className="rounded bg-purple-500/30 px-2 py-0.5 text-xs text-purple-300 hover:bg-purple-500/50"
              >
                {controllingFaction.name}
              </Link>
            )}
            {contestingFactions.map(f => (
              <Link
                key={f.id}
                to="/world/$worldId/faction/$factionId"
                params={{ worldId, factionId: f.id }}
                className="rounded bg-amber-500/30 px-2 py-0.5 text-xs text-amber-300 hover:bg-amber-500/50"
              >
                {f.name} (contesting)
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Face NPC */}
      {faceNPC && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 text-sm">
            <User size={14} className="text-amber-400" />
            <span className="font-medium text-amber-300">
              {faceNPC.name}
            </span>
            <span className="text-stone-400 capitalize">
              — {faceNPC.role?.replace(/_/g, " ") ?? faceNPC.archetype}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            {faceNPC.description}
            {faceNPC.distinguishingFeature && ` — ${faceNPC.distinguishingFeature}`}
          </p>
        </div>
      )}

      {/* Flavor & Trouble */}
      <div className="space-y-2 rounded-lg border border-stone-700 bg-stone-800/50 p-3 text-sm">
        <p className="italic text-stone-300">{district.flavor}</p>
        <div>
          <span className="text-stone-400">Trouble: </span>
          <InlineEditText
            value={district.trouble}
            onSave={(v) => updateDistrict("trouble", v)}
            className="text-red-400"
          />
        </div>
        <div>
          <span className="text-stone-400">Economy: </span>
          <span className="text-stone-300">{district.economy}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-700">
        {(["sites", "npcs", "hooks"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-amber-400 text-amber-400"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span className="ml-1 rounded-full bg-stone-700 px-1.5 py-0.5 text-xs">
                {tabCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "sites" && (
        <div className="space-y-3">
          {districtSites.length === 0 ? (
            <p className="text-sm text-stone-500">No sites in this district</p>
          ) : (
            districtSites.map(site => (
              <SiteCard
                key={site.id}
                site={site}
                npcs={npcs}
                worldId={worldId}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "npcs" && (
        <div className="space-y-3">
          {districtNPCs.length === 0 ? (
            <p className="text-sm text-stone-500">No NPCs in this district</p>
          ) : (
            districtNPCs.map(npc => (
              <NPCCard key={npc.id} npc={npc} factions={factions} worldId={worldId} />
            ))
          )}
        </div>
      )}

      {activeTab === "hooks" && (
        <div className="space-y-4">
          {district.rumors.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-stone-300">Rumors</h4>
              <ul className="space-y-1 text-sm">
                {district.rumors.map(rumor => (
                  <li key={rumor.id} className="flex items-start gap-2 text-stone-300">
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
          {district.notices.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-stone-300">Notices</h4>
              <ul className="space-y-2 text-sm">
                {district.notices.map(notice => (
                  <li key={notice.id} className="rounded bg-stone-700/50 p-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-stone-600 px-1.5 py-0.5 text-xs capitalize text-stone-300">
                        {notice.noticeType}
                      </span>
                      <span className="font-medium text-stone-200">{notice.title}</span>
                    </div>
                    <p className="mt-1 text-stone-400">{notice.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {district.rumors.length === 0 && district.notices.length === 0 && (
            <p className="text-sm text-stone-500">No hooks in this district yet</p>
          )}
        </div>
      )}

      {/* Adjacencies */}
      {district.adjacencies.length > 0 && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
          <SectionHeader icon={MapIcon} title="Connected Districts" />
          <div className="flex flex-wrap gap-2">
            {district.adjacencies.map(adj => {
              const target = settlement.districts?.find(d => d.id === adj.districtId);
              if (!target) return null;
              return (
                <Link
                  key={adj.districtId}
                  to="/world/$worldId/location/$locationId/district/$districtId"
                  params={{ worldId, locationId: settlement.id, districtId: adj.districtId }}
                  className="flex items-center gap-1 rounded bg-stone-700/50 px-2 py-1 text-sm text-stone-300 hover:bg-stone-700"
                >
                  <span>{DISTRICT_TYPE_ICONS[target.type] ?? "🏘️"}</span>
                  <span>{target.name}</span>
                  {adj.connectionType !== "street" && (
                    <span className="text-xs text-stone-500">({adj.connectionType})</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// === Sub-components ===

function SiteCard({ site, npcs, worldId }: { site: SettlementSite; npcs: NPC[]; worldId: string }) {
  const [showSecret, setShowSecret] = useState(false);
  const icon = SITE_ICONS[site.type] ?? "🏪";
  const owner = npcs.find(n => n.id === site.ownerId);

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="font-medium text-stone-200">{site.name}</span>
        <span className="rounded bg-stone-700 px-1.5 py-0.5 text-xs capitalize text-stone-400">
          {site.type.replace(/_/g, " ")}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-400">{site.description}</p>

      {owner && (
        <div className="mt-2 flex items-center gap-1 text-xs text-stone-400">
          <User size={12} />
          <span className="text-stone-300">{owner.name}</span>
          <span className="capitalize">({owner.role?.replace(/_/g, " ") ?? "owner"})</span>
        </div>
      )}

      {site.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {site.services.map((s, i) => (
            <span key={i} className="rounded bg-stone-700/50 px-1.5 py-0.5 text-xs text-stone-400">
              {s.name}: {s.cost}
            </span>
          ))}
        </div>
      )}

      {site.quirk && <p className="mt-1 text-xs italic text-stone-500">{site.quirk}</p>}

      {site.secret && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-red-400/70 hover:text-red-400">
            GM Secret
          </summary>
          <p className="mt-1 text-xs text-red-300">{site.secret}</p>
        </details>
      )}
    </div>
  );
}

function NPCCard({ npc, factions, worldId }: { npc: NPC; factions: Faction[]; worldId: string }) {
  const faction = factions.find(f => f.id === npc.factionId);

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
      <div className="flex items-center gap-2">
        <User size={14} className="text-stone-400" />
        <span className="font-medium text-stone-200">{npc.name}</span>
        {npc.role && (
          <span className="rounded bg-stone-700 px-1.5 py-0.5 text-xs capitalize text-stone-400">
            {npc.role.replace(/_/g, " ")}
          </span>
        )}
        {faction && (
          <Link
            to="/world/$worldId/faction/$factionId"
            params={{ worldId, factionId: faction.id }}
            className="rounded bg-purple-500/30 px-1.5 py-0.5 text-xs text-purple-300"
          >
            {faction.name}
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-stone-400">
        {npc.description}
        {npc.distinguishingFeature && ` — ${npc.distinguishingFeature}`}
      </p>
      {npc.flavorWant && (
        <p className="mt-1 text-xs text-amber-400/70">Wants: {npc.flavorWant}</p>
      )}
      {npc.secret && (
        <details className="mt-1">
          <summary className="cursor-pointer text-xs text-red-400/70">GM Secret</summary>
          <p className="mt-1 text-xs text-red-300">{npc.secret}</p>
        </details>
      )}
    </div>
  );
}
