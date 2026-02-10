import { RefreshCw, Users, Shield, Coins, AlertTriangle, ScrollText, MessageSquare, Building2, User, Flag, Map as MapIcon, ClipboardList, Calendar, BookOpen, Lock, ChevronDown, ChevronRight } from "lucide-react";
import type { Settlement, NPC, Faction, DayEvent, SettlementSite, WorldData, Hook, Dungeon, Location, Ruleset } from "~/models";
import { isSpatialSettlement, isDungeon, isSettlement, type SpatialSettlement } from "~/models";

import { EncounterTable } from "~/components/encounter-table/EncounterTable";
import { QuickNames } from "~/components/encounter-table/QuickNames";

import { TownMap } from "~/components/town-map";
import { NPCStatLine } from "~/components/npc/NPCStatLine";
import { useState, useMemo, type ReactNode } from "react";
import { generateRumors, generateNotices } from "~/generators/RumorGenerator";
import { nanoid } from "nanoid";
import { Link } from "@tanstack/react-router";

// Entity types for linked text
type EntityMatch = {
  name: string;
  type: "faction" | "location" | "npc";
  id: string;
  start: number;
  end: number;
};

// Parse text and replace entity names with linked badges
function LinkedText({
  text,
  factions,
  locations,
  npcs,
  worldId,
  className,
}: {
  text: string;
  factions: Faction[];
  locations: Location[];
  npcs?: NPC[];
  worldId: string;
  className?: string;
}) {
  const parts = useMemo(() => {
    // Safety check for empty/undefined arrays
    const safeFactions = factions ?? [];
    const safeLocations = locations ?? [];
    const safeNpcs = npcs ?? [];

    // Find all entity matches in text
    const matches: EntityMatch[] = [];

    // Check for faction names
    for (const faction of safeFactions) {
      let idx = 0;
      while ((idx = text.indexOf(faction.name, idx)) !== -1) {
        matches.push({
          name: faction.name,
          type: "faction",
          id: faction.id,
          start: idx,
          end: idx + faction.name.length,
        });
        idx += faction.name.length;
      }
    }

    // Check for location names (dungeons and settlements)
    for (const location of safeLocations) {
      let idx = 0;
      while ((idx = text.indexOf(location.name, idx)) !== -1) {
        // Avoid duplicate matches at same position
        if (!matches.some((m) => m.start === idx)) {
          matches.push({
            name: location.name,
            type: "location",
            id: location.id,
            start: idx,
            end: idx + location.name.length,
          });
        }
        idx += location.name.length;
      }
    }

    // Check for NPC names
    for (const npc of safeNpcs) {
      let idx = 0;
      while ((idx = text.indexOf(npc.name, idx)) !== -1) {
        // Avoid duplicate matches at same position
        if (!matches.some((m) => m.start === idx)) {
          matches.push({
            name: npc.name,
            type: "npc",
            id: npc.id,
            start: idx,
            end: idx + npc.name.length,
          });
        }
        idx += npc.name.length;
      }
    }

    // Sort by position
    matches.sort((a, b) => a.start - b.start);

    // Build parts array
    const result: ReactNode[] = [];
    let lastEnd = 0;

    for (const match of matches) {
      // Add text before match
      if (match.start > lastEnd) {
        result.push(text.slice(lastEnd, match.start));
      }

      // Add linked badge
      if (match.type === "faction") {
        result.push(
          <Link
            key={`${match.type}-${match.id}-${match.start}`}
            to="/world/$worldId/faction/$factionId"
            params={{ worldId: worldId, factionId: match.id }}
            className="mx-0.5 inline-flex items-center rounded bg-purple-500/30 px-1.5 py-0.5 text-xs font-medium text-purple-300 hover:bg-purple-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            {match.name}
          </Link>
        );
      } else if (match.type === "npc") {
        result.push(
          <a
            key={`${match.type}-${match.id}-${match.start}`}
            href={`#npc-${match.id}`}
            className="mx-0.5 inline-flex items-center rounded bg-cyan-500/30 px-1.5 py-0.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            {match.name}
          </a>
        );
      } else {
        result.push(
          <Link
            key={`${match.type}-${match.id}-${match.start}`}
            to="/world/$worldId/location/$locationId"
            params={{ worldId: worldId, locationId: match.id }}
            className="mx-0.5 inline-flex items-center rounded bg-amber-500/30 px-1.5 py-0.5 text-xs font-medium text-amber-300 hover:bg-amber-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            {match.name}
          </Link>
        );
      }

      lastEnd = match.end;
    }

    // Add remaining text
    if (lastEnd < text.length) {
      result.push(text.slice(lastEnd));
    }

    return result.length > 0 ? result : [text];
  }, [text, factions, locations, npcs, worldId]);

  return <span className={className}>{parts}</span>;
}

// Event with day number for display
export type LocationEvent = DayEvent & { day: number };

interface SettlementDetailProps {
  settlement: Settlement;
  npcs: NPC[];
  todayEvents: DayEvent[];
  locationEvents: LocationEvent[]; // All events at this location across all days
  currentDay: number;
  factions: Faction[];
  hooks: Hook[];
  locations: Location[];
  worldId: string;
  ruleset: Ruleset;
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

// Icons match those used in StreetFirstTownGenerator landmarks
const SITE_ICONS: Record<SettlementSite["type"], string> = {
  tavern: "🍺",
  inn: "🛏️",
  temple: "⛪",
  blacksmith: "⚒️",
  general_store: "🏪",
  market: "🏪",        // Same icon as map landmarks
  guild_hall: "🏛️",   // Town Hall on map
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
  locationEvents,
  currentDay,
  factions,
  hooks,
  locations,
  worldId,
  ruleset,
  onReroll,
  onUpdateWorld,
  seed,
}: SettlementDetailProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<"locations" | "rumors" | "notices" | "encounters">("locations");

  // State for ward, building, site, and NPC selection
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  // Handle building click - scroll to linked site if present
  const handleBuildingClick = (buildingId: string) => {
    setSelectedBuildingId(buildingId);

    // Find building to get its siteId
    if (isSpatialSettlement(settlement)) {
      const building = (settlement as SpatialSettlement).wards
        .flatMap((w) => w.buildings)
        .find((b) => b.id === buildingId);

      if (building?.siteId) {
        // Scroll to site card
        const siteElement = document.getElementById(`site-${building.siteId}`);
        if (siteElement) {
          siteElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  // Handle site card click - highlight building on map and related NPCs
  const handleSiteClick = (siteId: string) => {
    setSelectedSiteId(siteId);
    setSelectedNpcId(null); // Clear NPC selection when clicking site

    if (isSpatialSettlement(settlement)) {
      // Find building with this siteId
      const building = (settlement as SpatialSettlement).wards
        .flatMap((w) => w.buildings)
        .find((b) => b.siteId === siteId);

      if (building) {
        setSelectedBuildingId(building.id);
      }
    }
  };

  // Handle NPC card click - highlight their site/building if they have one
  const handleNpcClick = (npc: NPC) => {
    setSelectedNpcId(npc.id);

    if (npc.siteId) {
      // NPC has a site - highlight it
      setSelectedSiteId(npc.siteId);

      // Scroll to site card
      const siteElement = document.getElementById(`site-${npc.siteId}`);
      if (siteElement) {
        siteElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Highlight building on map
      if (isSpatialSettlement(settlement)) {
        const building = (settlement as SpatialSettlement).wards
          .flatMap((w) => w.buildings)
          .find((b) => b.siteId === npc.siteId);

        if (building) {
          setSelectedBuildingId(building.id);
        }
      }
    } else {
      // NPC has no site - clear site/building selection
      setSelectedSiteId(null);
      setSelectedBuildingId(null);
    }
  };

  // Get NPC IDs that should be highlighted (owner + staff of selected site)
  const highlightedNpcIds = new Set<string>();
  if (selectedSiteId) {
    const site = settlement.sites.find((s) => s.id === selectedSiteId);
    if (site) {
      if (site.ownerId) highlightedNpcIds.add(site.ownerId);
      site.staffIds?.forEach((id) => highlightedNpcIds.add(id));
    }
  }

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

  // Regenerate all rumors with world-connected content
  const handleRegenerateRumors = () => {
    onUpdateWorld((world) => {
      const dungeons = world.locations.filter(isDungeon) as Dungeon[];
      const settlements = world.locations.filter(isSettlement) as Settlement[];

      const newRumors = generateRumors({
        seed: `${seed}-rumors-${nanoid(4)}`,
        count: 8,
        hooks: world.hooks,
        dungeons,
        npcs: world.npcs,
        settlements,
        factions: world.factions,
        hexes: world.hexes,
        currentSettlement: settlement,
      });

      const updatedLocations = world.locations.map((loc) => {
        if (loc.id === settlement.id && loc.type === "settlement") {
          return { ...loc, rumors: newRumors };
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
        </div>

        <p className="text-sm text-stone-300">{settlement.description}</p>

        {/* Sensory Impressions - Quick scene-setting bullets */}
        {settlement.sensoryImpressions && settlement.sensoryImpressions.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-sm italic text-stone-400">
            {settlement.sensoryImpressions.map((impression, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500/60">•</span>
                {impression}
              </li>
            ))}
          </ul>
        )}

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

      </div>

      {/* Settlement Lore Section */}
      {(settlement.lore || settlement.trouble || settlement.quirk) && (
        <details className="group rounded-lg border border-stone-700 bg-stone-800/50">
          <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-semibold text-stone-200 hover:bg-stone-700/50">
            <BookOpen size={16} className="text-amber-400" />
            <span>Settlement Lore</span>
            <ChevronRight size={16} className="ml-auto text-stone-400 transition-transform group-open:rotate-90" />
          </summary>
          <div className="border-t border-stone-700 p-3 space-y-3">
            {/* Trouble & Quirk - now inside lore */}
            {(settlement.trouble || settlement.quirk) && (
              <div className="space-y-1 rounded bg-stone-900/50 p-2 text-sm">
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

            {settlement.lore && (
              <>
                {/* Founding Story */}
                <p className="text-sm italic text-stone-300">
                  "{settlement.lore.history.founding}"
                </p>

                {/* Age and Founder Type */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-stone-700 px-2 py-1 text-stone-300">
                    <span className="text-stone-500">Founded by:</span>{" "}
                    {settlement.lore.history.founderType.replace("_", " ")}
                  </span>
                  <span className="rounded bg-stone-700 px-2 py-1 text-stone-300">
                    <span className="text-stone-500">Age:</span>{" "}
                    {settlement.lore.history.age}
                  </span>
                  {settlement.lore.history.formerName && (
                    <span className="rounded bg-stone-700 px-2 py-1 text-stone-300">
                      <span className="text-stone-500">Formerly:</span>{" "}
                      {settlement.lore.history.formerName}
                    </span>
                  )}
                </div>

                {/* Major Events */}
                {settlement.lore.history.majorEvents.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-xs font-medium uppercase text-stone-500">Major Events</h4>
                    <ul className="space-y-1">
                      {settlement.lore.history.majorEvents.map((event, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-400">
                          <span className="text-stone-600">•</span>
                          {event}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cultural Note */}
                {settlement.lore.history.culturalNote && (
                  <p className="text-sm text-stone-400">
                    <span className="font-medium text-stone-300">Cultural note:</span>{" "}
                    {settlement.lore.history.culturalNote}
                  </p>
                )}
              </>
            )}
          </div>
        </details>
      )}

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

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-lg border border-stone-700 bg-stone-800 p-1">
        <button
          onClick={() => setActiveTab("locations")}
          title="Locations & NPCs"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${
            activeTab === "locations"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-400 hover:bg-stone-700/50 hover:text-stone-200"
          }`}
        >
          <Building2 size={18} />
          <span className="rounded-full bg-stone-600 px-1.5 text-xs">{settlement.sites.length + npcs.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("rumors")}
          title="Rumors"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${
            activeTab === "rumors"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-400 hover:bg-stone-700/50 hover:text-stone-200"
          }`}
        >
          <MessageSquare size={18} />
          <span className="rounded-full bg-stone-600 px-1.5 text-xs">{settlement.rumors.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("notices")}
          title="Notice Board"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${
            activeTab === "notices"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-400 hover:bg-stone-700/50 hover:text-stone-200"
          }`}
        >
          <ClipboardList size={18} />
          <span className="rounded-full bg-stone-600 px-1.5 text-xs">{settlement.notices.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("encounters")}
          title="Events & Encounters"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${
            activeTab === "encounters"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-400 hover:bg-stone-700/50 hover:text-stone-200"
          }`}
        >
          <Calendar size={18} />
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "locations" && (
        <>
          {/* Two-column layout: Map (left) + Locations (right) on desktop */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left column: Town Map */}
            {isSpatialSettlement(settlement) && (
              <section className="space-y-3 lg:sticky lg:top-4 lg:self-start">
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4 text-stone-400" />
                  <h3 className="text-sm font-semibold text-stone-200">Town Map</h3>
                </div>
                <TownMap
                  settlement={settlement as SpatialSettlement}
                  selectedBuildingId={selectedBuildingId ?? undefined}
                  selectedWardId={selectedWardId ?? undefined}
                  onBuildingClick={handleBuildingClick}
                  onWardClick={(wardId: string) => setSelectedWardId(wardId)}
                />
                <p className="text-xs text-stone-500">
                  Click a ward to see details. Pan and zoom with gestures or +/- buttons.
                </p>
              </section>
            )}

            {/* Right column: Key Locations */}
            <div className="space-y-6">
              {/* Consolidated Services - What can I buy here? */}
              {(() => {
                const allServices = settlement.sites.flatMap((site) =>
                  site.services.map((svc) => ({
                    ...svc,
                    siteName: site.name,
                    siteId: site.id,
                  }))
                );
                if (allServices.length === 0) return null;
                return (
                  <details className="group rounded-lg border border-stone-700 bg-stone-800/50">
                    <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-semibold text-stone-200 hover:bg-stone-700/50">
                      <Coins size={16} className="text-amber-400" />
                      <span>Available Services ({allServices.length})</span>
                      <ChevronRight size={16} className="ml-auto text-stone-400 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="border-t border-stone-700 p-3">
                      <div className="grid gap-1.5">
                        {allServices.map((svc, i) => (
                          <div
                            key={`${svc.siteId}-${i}`}
                            className="flex items-center justify-between rounded bg-stone-900/50 px-2 py-1.5 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-stone-200">{svc.name}</span>
                              <span className="text-xs text-stone-500">@ {svc.siteName}</span>
                            </div>
                            <span className="font-medium text-amber-400">{svc.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })()}

              {/* Key Locations (Sites) */}
              {settlement.sites.length > 0 && (
                <section>
                  <SectionHeader icon={Building2} title="Key Locations" />
                  <div className="grid gap-2">
                    {settlement.sites.map((site) => {
                      const owner = site.ownerId ? npcs.find((n) => n.id === site.ownerId) : undefined;
                      const staff = site.staffIds?.map((id) => npcs.find((n) => n.id === id)).filter(Boolean) || [];
                      // Check if this site's building is selected on the map
                      const isLinkedBuildingSelected = isSpatialSettlement(settlement) && selectedBuildingId &&
                        (settlement as SpatialSettlement).wards
                          .flatMap((w) => w.buildings)
                          .some((b) => b.siteId === site.id && b.id === selectedBuildingId);
                      const isHighlighted = isLinkedBuildingSelected;
                  return (
                    <div
                      id={`site-${site.id}`}
                      key={site.id}
                      onClick={() => handleSiteClick(site.id)}
                      className={`cursor-pointer scroll-mt-4 rounded-lg border p-3 transition-all duration-300 hover:border-stone-500 ${
                        isHighlighted
                          ? "border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20"
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
                            {site.secret && (
                              <span title="Has secret">
                                <Lock size={12} className="text-amber-500" />
                              </span>
                            )}
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
                          {site.secret && (
                            <details
                              className="mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <summary className="cursor-pointer text-xs text-amber-500 hover:text-amber-400">
                                <Lock size={10} className="mr-1 inline" />
                                Secret (GM only)
                              </summary>
                              <p className="mt-1 rounded bg-amber-500/10 p-2 text-xs text-amber-300">
                                {site.secret}
                              </p>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                  </div>
                </section>
              )}
            </div>
          </div>

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
                  const isNpcHighlighted = highlightedNpcIds.has(npc.id);
                  const isNpcSelected = selectedNpcId === npc.id;
                  const hasSite = Boolean(npc.siteId);

                  // Determine highlight style:
                  // - Selected with site: amber
                  // - Selected without site: cyan (wanderer)
                  // - Highlighted via site selection: amber
                  // - Default: stone
                  let cardClass = "border-stone-700 bg-stone-800/50 hover:border-stone-500";
                  if (isNpcSelected && hasSite) {
                    cardClass = "border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20";
                  } else if (isNpcSelected && !hasSite) {
                    cardClass = "border-cyan-500 bg-cyan-500/20 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20";
                  } else if (isNpcHighlighted) {
                    cardClass = "border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20";
                  }

                  return (
                    <div
                      key={npc.id}
                      id={`npc-${npc.id}`}
                      onClick={() => handleNpcClick(npc)}
                      className={`cursor-pointer break-inside-avoid scroll-mt-4 rounded-lg border p-3 transition-all duration-300 ${cardClass}`}
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
                          <p className="text-xs text-stone-500 capitalize">
                            {npc.race} - {npc.role ? npc.role.replace("_", " ") : npc.archetype}
                          </p>
                          {npc.siteId && (() => {
                            const site = settlement.sites.find((s) => s.id === npc.siteId);
                            return site ? (
                              <p className="text-xs text-amber-500/70">
                                📍 {site.name}
                              </p>
                            ) : null;
                          })()}
                          <NPCStatLine archetype={npc.archetype} ruleset={ruleset} />
                        </div>
                        {faction && (
                          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-300">
                            {faction.name}
                            {npc.factionRole && ` - ${npc.factionRole}`}
                          </span>
                        )}
                      </div>
                      {npc.distinguishingFeature && (
                        <p className="mt-1 text-sm font-medium text-amber-400/90">
                          ✦ {npc.distinguishingFeature}
                        </p>
                      )}
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

        </>
      )}

      {activeTab === "rumors" && (
        <section>
          {/* Header bar */}
          <div className="mb-3 flex items-center justify-between rounded bg-stone-700 px-3 py-2">
            <h3 className="text-sm font-semibold text-stone-200">
              Rumors ({settlement.rumors.length})
            </h3>
            <button
              onClick={handleRegenerateRumors}
              className="flex items-center gap-1 rounded px-2 py-1 text-sm text-stone-400 hover:bg-stone-600 hover:text-stone-200"
              title="Generate new rumors"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>

          {settlement.rumors.length > 0 ? (
            <ul className="space-y-2">
              {settlement.rumors.map((rumor, index) => (
                <li
                  key={rumor.id}
                  className="flex items-start gap-3 rounded-lg border border-stone-700 bg-stone-800/50 p-3"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={rumor.used ?? false}
                    onChange={() => handleToggleRumor(rumor.id)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-stone-600 bg-stone-700 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  {/* Row number */}
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded bg-stone-600 text-xs font-medium text-stone-200 ${rumor.used ? "opacity-50" : ""}`}>
                    {index + 1}
                  </div>
                  {/* Rumor content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-stone-300 ${rumor.used ? "opacity-50 line-through" : ""}`}>
                        "<LinkedText
                          text={rumor.text}
                          factions={factions}
                          locations={locations}
                          npcs={npcs}
                          worldId={worldId}
                        />"
                      </p>
                      {rumor.linkedHookId && (
                        <span className={`shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300 ${rumor.used ? "opacity-50" : ""}`}>
                          Quest
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-xs text-stone-500 ${rumor.used ? "opacity-50" : ""}`}>
                      Source: {rumor.source}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-6 text-center">
              <p className="text-sm text-stone-400">No rumors available</p>
              <button
                onClick={handleRegenerateRumors}
                className="mt-2 rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-stone-100 hover:bg-amber-500"
              >
                Generate Rumors
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "notices" && (
        <section>
          <div className="mb-3 flex items-center justify-between rounded bg-stone-700 px-3 py-2">
            <h3 className="text-sm font-semibold text-stone-200">
              Notice Board ({settlement.notices.length})
            </h3>
            <button
              onClick={() => {
                onUpdateWorld((world) => {
                  const newNotices = generateNotices({
                    seed: `${seed}-notices-${nanoid(4)}`,
                    count: 8,
                    settlementSize: settlement.size,
                    factions,
                    npcs,
                  });
                  // Cap at 12
                  const cappedNotices = newNotices.slice(0, 12);
                  const updatedLocations = world.locations.map((loc) => {
                    if (loc.id === settlement.id && loc.type === "settlement") {
                      return { ...loc, notices: cappedNotices };
                    }
                    return loc;
                  });
                  return { ...world, locations: updatedLocations };
                });
              }}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-stone-400 hover:bg-stone-600 hover:text-stone-200"
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
          </div>

          {settlement.notices.length > 0 ? (
            <ul className="space-y-3">
              {settlement.notices.map((notice) => {
                const posterNpc = notice.posterId
                  ? npcs.find((n) => n.id === notice.posterId)
                  : undefined;
                return (
                  <li
                    key={notice.id}
                    className="rounded-lg border border-stone-700 bg-stone-800/50 p-3"
                  >
                    <div className="flex items-start gap-3">
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
                          <h4 className={`font-medium text-stone-200 ${notice.used ? "line-through opacity-50" : ""}`}>
                            {notice.title}
                          </h4>
                        </div>
                        <p className={`mt-2 text-sm text-stone-300 ${notice.used ? "line-through opacity-50" : ""}`}>
                          <LinkedText
                            text={notice.description}
                            factions={factions}
                            locations={locations}
                            npcs={npcs}
                            worldId={worldId}
                          />
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs">
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
                              Reward: {notice.reward}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-6 text-center">
              <p className="text-sm text-stone-400">No notices posted</p>
            </div>
          )}
        </section>
      )}

      {activeTab === "encounters" && (
        <section className="space-y-6">
          {/* Location Events */}
          {locationEvents.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between rounded bg-stone-700 px-3 py-2">
                <h3 className="text-sm font-semibold text-stone-200">
                  Location Events ({locationEvents.length})
                </h3>
              </div>
              <ul className="space-y-2">
                {locationEvents
                  .sort((a, b) => a.day - b.day)
                  .map((event) => {
                    const isToday = event.day === currentDay;
                    const isPast = event.day < currentDay;
                    const isFuture = event.day > currentDay;
                    return (
                      <li
                        key={event.id}
                        className={`rounded-lg border p-3 ${
                          isToday
                            ? "border-amber-500/50 bg-amber-500/10"
                            : isPast
                            ? "border-stone-700 bg-stone-800/30 opacity-60"
                            : "border-stone-700 bg-stone-800/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 shrink-0 items-center justify-center rounded px-2 text-xs font-bold ${
                            isToday
                              ? "bg-amber-500 text-stone-900"
                              : isPast
                              ? "bg-stone-600 text-stone-400"
                              : "bg-stone-600 text-stone-200"
                          }`}>
                            Day {event.day}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                event.type === "encounter" ? "bg-red-500/20 text-red-300" :
                                event.type === "arrival" ? "bg-blue-500/20 text-blue-300" :
                                event.type === "clock_tick" ? "bg-purple-500/20 text-purple-300" :
                                event.type === "rumor" ? "bg-amber-500/20 text-amber-300" :
                                "bg-stone-600 text-stone-300"
                              }`}>
                                {event.type.replace("_", " ")}
                              </span>
                              {isToday && (
                                <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-xs font-medium text-amber-300">
                                  Today
                                </span>
                              )}
                              {isFuture && (
                                <span className="text-xs text-stone-500">
                                  in {event.day - currentDay} day{event.day - currentDay !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            <p className={`mt-1 text-sm ${isToday ? "text-stone-200" : "text-stone-400"}`}>
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Town Secrets */}
          {settlement.lore && settlement.lore.secrets.length > 0 && (
            <details className="group rounded-lg border border-stone-700 bg-stone-800/50">
              <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-semibold text-stone-200 hover:bg-stone-700/50">
                <Lock size={16} className="text-amber-500" />
                <span>Town Secrets ({settlement.lore.secrets.length})</span>
                <ChevronRight size={16} className="ml-auto text-stone-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-stone-700 p-3 space-y-3">
                {settlement.lore.secrets.map((secret) => {
                  const severityColors = {
                    minor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    major: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                    catastrophic: "bg-red-500/20 text-red-300 border-red-500/30",
                  };
                  const involvedNpcs = secret.involvedNpcIds
                    ?.map((id) => npcs.find((n) => n.id === id))
                    .filter(Boolean) ?? [];
                  const involvedFactions = secret.involvedFactionIds
                    ?.map((id) => factions.find((f) => f.id === id))
                    .filter(Boolean) ?? [];
                  const involvedSites = secret.involvedSiteIds
                    ?.map((id) => settlement.sites.find((s) => s.id === id))
                    .filter(Boolean) ?? [];

                  return (
                    <div
                      key={secret.id}
                      className={`rounded-lg border p-3 ${severityColors[secret.severity]}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => {
                            onUpdateWorld((world) => {
                              const updatedLocations = world.locations.map((loc) => {
                                if (loc.id === settlement.id && loc.type === "settlement") {
                                  const s = loc as Settlement;
                                  if (!s.lore) return loc;
                                  return {
                                    ...s,
                                    lore: {
                                      ...s.lore,
                                      secrets: s.lore.secrets.map((sec) =>
                                        sec.id === secret.id
                                          ? { ...sec, discovered: !sec.discovered }
                                          : sec
                                      ),
                                    },
                                  };
                                }
                                return loc;
                              });
                              return { ...world, locations: updatedLocations };
                            });
                          }}
                          className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${
                            secret.discovered
                              ? "border-green-500 bg-green-500"
                              : "border-stone-500 bg-transparent"
                          }`}
                          title={secret.discovered ? "Mark as undiscovered" : "Mark as discovered"}
                        >
                          {secret.discovered && (
                            <svg className="h-4 w-4 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase ${severityColors[secret.severity]}`}>
                              {secret.severity}
                            </span>
                          </div>
                          <p className={`mt-1 text-sm ${secret.discovered ? "line-through opacity-60" : ""}`}>
                            {secret.text}
                          </p>
                          {(involvedNpcs.length > 0 || involvedFactions.length > 0 || involvedSites.length > 0) && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {involvedNpcs.map((npc) => (
                                <Link
                                  key={npc!.id}
                                  to="/world/$worldId/location/$locationId"
                                  params={{ worldId, locationId: settlement.id }}
                                  hash={`npc-${npc!.id}`}
                                  className="rounded bg-stone-700 px-1.5 py-0.5 text-xs text-stone-300 hover:bg-stone-600"
                                >
                                  {npc!.name}
                                </Link>
                              ))}
                              {involvedFactions.map((faction) => (
                                <Link
                                  key={faction!.id}
                                  to="/world/$worldId/faction/$factionId"
                                  params={{ worldId, factionId: faction!.id }}
                                  className="rounded bg-purple-500/30 px-1.5 py-0.5 text-xs text-purple-300 hover:bg-purple-500/50"
                                >
                                  {faction!.name}
                                </Link>
                              ))}
                              {involvedSites.map((site) => (
                                <a
                                  key={site!.id}
                                  href={`#site-${site!.id}`}
                                  className="rounded bg-amber-500/30 px-1.5 py-0.5 text-xs text-amber-300 hover:bg-amber-500/50"
                                  onClick={() => setActiveTab("locations")}
                                >
                                  {site!.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {/* Encounter Table */}
          <EncounterTable seed={`${seed}-settlement`} ruleset={ruleset} onReroll={onReroll} />

          {/* Quick Names */}
          <QuickNames seed={`${seed}-names`} onReroll={onReroll} />
        </section>
      )}
    </div>
  );
}
