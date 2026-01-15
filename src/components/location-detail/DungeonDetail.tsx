import { useState, useMemo, useRef } from "react";
import { RefreshCw, CheckCircle2, Skull, Gem, MapPin, User, Map as MapIcon, ScrollText } from "lucide-react";
import type { Dungeon, Hook, DungeonTheme, NPC, SpatialDungeon } from "~/models";
import { isSpatialDungeon } from "~/models";
import type { RegenerationType } from "~/lib/hex-regenerate";
import { EncounterTable } from "~/components/encounter-table/EncounterTable";
import { RegenerateButton } from "./RegenerateButton";
import { RoomCard } from "./RoomCard";
import { DungeonMap } from "~/components/dungeon-map";

interface DungeonDetailProps {
  dungeon: Dungeon | SpatialDungeon;
  hook?: Hook;
  hooks?: Hook[]; // All hooks targeting this dungeon
  npcs?: NPC[]; // All NPCs for lookup
  worldId: string;
  onRegenerate: (type: RegenerationType) => void;
  onReroll: () => void;
  seed: string;
}

const THEME_BADGES: Record<DungeonTheme, { label: string; color: string }> = {
  tomb: { label: "Tomb", color: "bg-stone-600" },
  cave: { label: "Cave", color: "bg-stone-700" },
  temple: { label: "Temple", color: "bg-purple-700" },
  mine: { label: "Mine", color: "bg-amber-800" },
  fortress: { label: "Fortress", color: "bg-slate-700" },
  sewer: { label: "Sewer", color: "bg-green-900" },
  crypt: { label: "Crypt", color: "bg-stone-800" },
  lair: { label: "Lair", color: "bg-red-900" },
  bandit_hideout: { label: "Bandit Hideout", color: "bg-amber-900" },
  cultist_lair: { label: "Cultist Lair", color: "bg-violet-900" },
  witch_hut: { label: "Witch Hut", color: "bg-emerald-900" },
  sea_cave: { label: "Sea Cave", color: "bg-cyan-900" },
  beast_den: { label: "Beast Den", color: "bg-orange-900" },
  floating_keep: { label: "Floating Keep", color: "bg-sky-800" },
};

export function DungeonDetail({
  dungeon,
  hook,
  hooks = [],
  npcs = [],
  worldId,
  onRegenerate,
  onReroll,
  seed,
}: DungeonDetailProps) {
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(() => new Set([0]));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "map">("overview");
  const roomCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to selected room when clicking on map
  const handleRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId);
    // Find room index and expand it
    const roomIndex = sortedRooms.findIndex((r) => r.id === roomId);
    if (roomIndex >= 0) {
      setExpandedRooms((prev) => new Set(prev).add(roomIndex));
      // Scroll to the room card
      setTimeout(() => {
        const element = roomCardRefs.current.get(roomId);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  // Check if dungeon has spatial layout
  const hasSpatialLayout = isSpatialDungeon(dungeon);

  // Find NPCs linked to this dungeon via hooks
  const linkedNPCs = useMemo(() => {
    const dungeonHooks = hooks.filter((h) => h.targetLocationId === dungeon.id);
    const npcIds = new Set<string>();

    for (const h of dungeonHooks) {
      if (h.sourceNpcId) npcIds.add(h.sourceNpcId);
      if (h.missingNpcId) npcIds.add(h.missingNpcId);
    }

    return Array.from(npcIds).map((id) => {
      const npc = npcs.find((n) => n.id === id);
      const relatedHook = dungeonHooks.find(
        (h) => h.sourceNpcId === id || h.missingNpcId === id
      );
      const isSource = relatedHook?.sourceNpcId === id;
      return npc ? { npc, hook: relatedHook, isSource } : null;
    }).filter(Boolean) as Array<{ npc: NPC; hook?: Hook; isSource: boolean }>;
  }, [hooks, dungeon.id, npcs]);

  const toggleRoom = (index: number) => {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Sort rooms: entrance first, then by depth
  const sortedRooms = useMemo(() => {
    const entranceRoom = dungeon.rooms.find((r) => r.id === dungeon.entranceRoomId);
    const otherRooms = dungeon.rooms
      .filter((r) => r.id !== dungeon.entranceRoomId)
      .sort((a, b) => a.depth - b.depth);

    return entranceRoom ? [entranceRoom, ...otherRooms] : otherRooms;
  }, [dungeon.rooms, dungeon.entranceRoomId]);

  // Stats
  const stats = useMemo(() => {
    let monstersRemaining = 0;
    let treasureRemaining = 0;

    for (const room of dungeon.rooms) {
      monstersRemaining += room.encounters.filter((e) => !e.defeated).length;
      treasureRemaining += room.treasure.filter((t) => !t.looted).length;
    }

    return {
      totalRooms: dungeon.rooms.length,
      monstersRemaining,
      treasureRemaining,
    };
  }, [dungeon.rooms]);

  const themeBadge = THEME_BADGES[dungeon.theme] ?? { label: dungeon.theme, color: "bg-stone-600" };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-stone-100">{dungeon.name}</h2>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${themeBadge.color} text-stone-200`}>
                {themeBadge.label}
              </span>
              <span className="rounded bg-stone-700 px-2 py-0.5 text-xs font-medium text-stone-300">
                Depth {dungeon.depth}
              </span>
              <span className="rounded bg-stone-700 px-2 py-0.5 text-xs font-medium text-stone-300 capitalize">
                {dungeon.size}
              </span>
              {dungeon.cleared && (
                <span className="flex items-center gap-1 rounded bg-green-900 px-2 py-0.5 text-xs font-medium text-green-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Cleared
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReroll}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-stone-400 hover:bg-stone-700 hover:text-stone-200"
              title="Re-roll dungeon"
            >
              <RefreshCw size={14} />
            </button>
            <RegenerateButton
              onRegenerate={onRegenerate}
              currentLocationType="dungeon"
              defaultType={dungeon.theme}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-400">{dungeon.description}</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-lg border border-stone-700 bg-stone-800 p-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
            activeTab === "overview"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-400 hover:bg-stone-700/50 hover:text-stone-200"
          }`}
        >
          <ScrollText size={16} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
            activeTab === "map"
              ? "bg-stone-700 text-stone-100"
              : "text-stone-400 hover:bg-stone-700/50 hover:text-stone-200"
          }`}
        >
          <MapIcon size={16} />
          Map & Rooms
          <span className="rounded-full bg-stone-600 px-1.5 text-xs">{stats.totalRooms}</span>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
      <>
      {/* Linked NPCs */}
      {linkedNPCs.length > 0 && (
        <div className="rounded-lg border border-blue-700/50 bg-blue-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-300">Linked NPCs</h3>
          </div>
          <ul className="space-y-2">
            {linkedNPCs.map(({ npc, hook: npcHook, isSource }) => (
              <li key={npc.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-200">{npc.name}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs ${
                    isSource
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-red-500/20 text-red-300"
                  }`}>
                    {isSource ? "Quest Giver" : "Missing/Captured"}
                  </span>
                </div>
                {npcHook && (
                  <p className="mt-1 text-xs text-stone-400">
                    {isSource ? npcHook.rumor : `${npc.name} is ${npc.status} here`}
                  </p>
                )}
                {npcHook?.reward && isSource && (
                  <p className="text-xs text-amber-400">Reward: {npcHook.reward}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hook Section */}
      {hook && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-300">Active Hook</h3>
            <span className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${
              hook.status === "active" ? "bg-amber-700 text-amber-100" :
              hook.status === "completed" ? "bg-green-800 text-green-200" :
              hook.status === "failed" ? "bg-red-800 text-red-200" :
              "bg-stone-700 text-stone-300"
            }`}>
              {hook.status}
            </span>
          </div>
          <p className="text-sm text-stone-300 italic">"{hook.rumor}"</p>
          <details className="text-xs">
            <summary className="cursor-pointer text-stone-500 hover:text-stone-400">
              Truth (GM only)
            </summary>
            <p className="mt-1 text-stone-400">{hook.truth}</p>
          </details>
          {hook.reward && (
            <p className="text-xs text-emerald-500">Reward: {hook.reward}</p>
          )}
          {hook.danger && (
            <p className="text-xs text-red-500">Danger: {hook.danger}</p>
          )}
        </div>
      )}

      {/* Encounter Table */}
      <EncounterTable seed={`${seed}-encounter`} onReroll={onReroll} />

      {/* Summary Stats */}
      <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Summary
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-stone-200">
              {stats.totalRooms}
            </div>
            <div className="text-xs text-stone-500">Total Rooms</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-400">
              <Skull className="h-5 w-5" />
              {stats.monstersRemaining}
            </div>
            <div className="text-xs text-stone-500">Monsters Left</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-400">
              <Gem className="h-5 w-5" />
              {stats.treasureRemaining}
            </div>
            <div className="text-xs text-stone-500">Treasure Left</div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Map Tab - Two-column layout: Map (left) + Rooms (right) on desktop */}
      {activeTab === "map" && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Dungeon Map */}
        {hasSpatialLayout && (
          <section className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <div className="flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-stone-400" />
              <h3 className="text-sm font-semibold text-stone-200">Dungeon Map</h3>
            </div>
            <DungeonMap
              dungeon={dungeon as SpatialDungeon}
              selectedRoomId={selectedRoomId}
              onRoomClick={handleRoomClick}
            />
            <p className="text-xs text-stone-500">
              Click a room to see details. Pan and zoom with gestures.
            </p>
          </section>
        )}

        {/* Right column: Room Layout */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-stone-200">Room Layout</h3>
          <div className="space-y-2">
            {sortedRooms.map((room, index) => (
              <div
                key={room.id}
                ref={(el) => {
                  if (el) roomCardRefs.current.set(room.id, el);
                }}
                onClick={() => setSelectedRoomId(room.id)}
              >
                <RoomCard
                  room={room}
                  roomNumber={index + 1}
                  expanded={expandedRooms.has(index)}
                  onToggle={() => toggleRoom(index)}
                  selected={room.id === selectedRoomId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
