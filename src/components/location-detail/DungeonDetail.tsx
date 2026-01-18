import { useState, useMemo, useRef } from "react";
import {
  CheckCircle2, Skull, Gem, MapPin, User, Map as MapIcon, ScrollText,
  BookOpen, Users, Ghost, AlertTriangle, Footprints, Key, DoorOpen
} from "lucide-react";
import type { Dungeon, Hook, DungeonTheme, NPC, SpatialDungeon, DungeonNPC, KeyLockPair, Faction, ExitPoint, Ruleset } from "~/models";
import { isSpatialDungeon } from "~/models";
import type { RegenerationType, RegenerateOptions } from "~/lib/hex-regenerate";
import { EncounterTable } from "~/components/encounter-table/EncounterTable";
import { RegenerateButton } from "./RegenerateButton";
import { RoomCard } from "./RoomCard";
import { DungeonMap } from "~/components/dungeon-map";
import { NPCStatLine } from "~/components/npc/NPCStatLine";
import { getMonsterStats } from "~/lib/monster-stats";

interface DungeonDetailProps {
  dungeon: Dungeon | SpatialDungeon;
  hook?: Hook;
  hooks?: Hook[]; // All hooks targeting this dungeon
  npcs?: NPC[]; // All NPCs for lookup
  factions?: Faction[]; // All factions for lookup
  worldId: string;
  ruleset: Ruleset;
  onRegenerate: (type: RegenerationType, options?: RegenerateOptions) => void;
  onReroll?: () => void;
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
  shrine: { label: "Shrine", color: "bg-yellow-800" },
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
  factions = [],
  worldId,
  ruleset,
  onRegenerate,
  onReroll,
  seed,
}: DungeonDetailProps) {
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(() => new Set([0]));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "map">("map");
  const roomCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Find controlling faction if any
  const controllingFaction = dungeon.controllingFactionId
    ? factions.find((f) => f.id === dungeon.controllingFactionId)
    : undefined;

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

  // Map room IDs to display numbers (1-indexed)
  const roomNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedRooms.forEach((room, index) => {
      map.set(room.id, index + 1);
    });
    return map;
  }, [sortedRooms]);

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
            <RegenerateButton
              onRegenerate={onRegenerate}
              currentLocationType="dungeon"
              defaultType={dungeon.theme}
              currentSize={dungeon.size}
              currentSeed={seed}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-400">{dungeon.description}</p>
      </div>

      {/* Dungeon Lore - Above tabs */}
      {hasSpatialLayout && (dungeon as SpatialDungeon).ecology && (
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-stone-400" />
            <h3 className="text-sm font-semibold text-stone-200">Dungeon Lore</h3>
          </div>
          <p className="text-sm text-stone-300 italic">
            {(dungeon as SpatialDungeon).ecology?.history}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-500">Built by:</span>
              <span className="ml-2 text-stone-300 capitalize">
                {(dungeon as SpatialDungeon).ecology?.builderCulture}
              </span>
            </div>
            <div>
              <span className="text-stone-500">Inhabitants:</span>
              <span className="ml-2 text-stone-300 capitalize">
                {(dungeon as SpatialDungeon).ecology?.currentInhabitants}
              </span>
            </div>
          </div>
          {/* History Layers */}
          {(dungeon as SpatialDungeon).ecology?.historyLayers && (dungeon as SpatialDungeon).ecology!.historyLayers!.length > 0 && (
            <div className="mt-3 border-t border-stone-700 pt-3">
              <h4 className="text-xs font-semibold text-stone-400 mb-2">History Layers</h4>
              <div className="space-y-2">
                {(dungeon as SpatialDungeon).ecology!.historyLayers!.map((layer, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-300 capitalize">{layer.builders}</span>
                      <span className="text-stone-500">({layer.era})</span>
                    </div>
                    <p className="text-stone-400 italic pl-2">{layer.fate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-lg border border-stone-700 bg-stone-800 p-1">
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
                <NPCStatLine archetype={npc.archetype} ruleset={ruleset} />
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
      <EncounterTable seed={`${seed}-encounter`} ruleset={ruleset} onReroll={onReroll} />

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

      {/* Controlling Faction */}
      {controllingFaction && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-300">Faction Lair</h3>
          </div>
          <div className="flex items-center justify-between">
            <a
              href={`/world/${worldId}/faction/${controllingFaction.id}`}
              className="text-sm font-medium text-amber-200 hover:text-amber-100 hover:underline"
            >
              {controllingFaction.name}
            </a>
            <span className="text-xs text-amber-400/70 capitalize">
              {controllingFaction.factionType}
            </span>
          </div>
          <p className="text-xs text-stone-400 italic">
            {controllingFaction.purpose}
          </p>
        </div>
      )}

      {/* Dungeon NPCs */}
      {hasSpatialLayout && (dungeon as SpatialDungeon).dungeonNPCs && (dungeon as SpatialDungeon).dungeonNPCs!.length > 0 && (
        <div className="rounded-lg border border-purple-900/50 bg-purple-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-purple-300">Dungeon Denizens</h3>
          </div>
          <div className="space-y-2">
            {(dungeon as SpatialDungeon).dungeonNPCs?.map((npc: DungeonNPC) => (
              <DungeonNPCCard key={npc.npcId} npc={npc} roomNumberMap={roomNumberMap} />
            ))}
          </div>
        </div>
      )}

      {/* Key-Lock Pairs */}
      {hasSpatialLayout && (dungeon as SpatialDungeon).keyLockPairs && (dungeon as SpatialDungeon).keyLockPairs!.length > 0 && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-300">Keys & Locks</h3>
          </div>
          <div className="space-y-2">
            {(dungeon as SpatialDungeon).keyLockPairs?.map((pair: KeyLockPair) => (
              <KeyLockCard key={pair.keyId} pair={pair} roomNumberMap={roomNumberMap} passages={(dungeon as SpatialDungeon).passages} />
            ))}
          </div>
        </div>
      )}

      {/* Traps Overview */}
      {hasSpatialLayout && (() => {
        const spatial = dungeon as SpatialDungeon;
        const passageTraps = spatial.passages?.filter(p => p.trap && !p.trap.disarmed) ?? [];
        const roomTraps = spatial.rooms?.flatMap(r =>
          r.hazards.filter(h => !h.disarmed).map(h => ({ ...h, roomId: r.id }))
        ) ?? [];
        const totalTraps = passageTraps.length + roomTraps.length;

        if (totalTraps === 0) return null;

        return (
          <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-300">
                Traps & Hazards ({totalTraps})
              </h3>
            </div>

            {/* Passage Traps */}
            {passageTraps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-stone-400">Passage Traps</h4>
                {passageTraps.map(passage => {
                  const fromRoom = roomNumberMap.get(passage.fromRoomId);
                  const toRoom = roomNumberMap.get(passage.toRoomId);
                  const trap = passage.trap!;
                  return (
                    <div key={passage.id} className="rounded bg-stone-800 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span className="text-sm font-medium text-stone-200">{trap.name}</span>
                        {trap.targetAttribute && (
                          <span className="text-xs px-1 py-0.5 rounded bg-red-900/50 text-red-300">
                            {trap.targetAttribute}
                          </span>
                        )}
                        <span className="text-xs text-stone-500 ml-auto">
                          Room {fromRoom} → {toRoom}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{trap.description}</p>
                      {trap.trigger && (
                        <p className="text-xs">
                          <span className="text-red-500">⚡ Trigger:</span>{" "}
                          <span className="text-stone-400">{trap.trigger}</span>
                        </p>
                      )}
                      {trap.passiveHint && (
                        <p className="text-xs">
                          <span className="text-yellow-500">👂 Passive:</span>{" "}
                          <span className="text-stone-400">{trap.passiveHint}</span>
                        </p>
                      )}
                      {trap.activeHint && (
                        <p className="text-xs">
                          <span className="text-cyan-500">🔍 Active:</span>{" "}
                          <span className="text-stone-400">{trap.activeHint}</span>
                        </p>
                      )}
                      <div className="flex gap-3 text-xs">
                        {trap.damage && <span className="text-red-400">Dmg: {trap.damage}</span>}
                        {trap.save && <span className="text-amber-400">Save: {trap.save}</span>}
                      </div>
                      {trap.disarmMethods && trap.disarmMethods.length > 0 && (
                        <div className="border-t border-stone-700 pt-2">
                          <p className="text-xs text-emerald-500 mb-1">✓ Disarm Methods</p>
                          <ul className="ml-4 space-y-0.5 text-xs text-stone-400">
                            {trap.disarmMethods.map((method, j) => (
                              <li key={j} className="list-disc">{method}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {trap.consequence && (
                        <p className="text-xs text-orange-400">
                          <span className="text-stone-500">Consequence:</span> {trap.consequence}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Room Traps Summary */}
            {roomTraps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-stone-400">Room Traps</h4>
                <div className="text-xs text-stone-400">
                  {roomTraps.map((trap, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 border-b border-stone-700/50 last:border-0">
                      <span className="text-amber-400">{trap.name}</span>
                      <span className="text-stone-500">in Room {roomNumberMap.get(trap.roomId)}</span>
                      {trap.targetAttribute && (
                        <span className="text-red-300 text-xs">({trap.targetAttribute})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Exit Points */}
      {hasSpatialLayout && (dungeon as SpatialDungeon).exitPoints && (dungeon as SpatialDungeon).exitPoints!.length > 0 && (
        <div className="rounded-lg border border-cyan-900/50 bg-cyan-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-cyan-300">Exit Points</h3>
          </div>
          <p className="text-xs text-stone-400">
            Secret exits connecting to neighboring hexes
          </p>
          <div className="space-y-2">
            {(dungeon as SpatialDungeon).exitPoints?.map((exit: ExitPoint) => (
              <ExitPointCard key={exit.id} exit={exit} roomNumberMap={roomNumberMap} />
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* Map Tab - Two-column layout: Map (left) + Rooms (right) on desktop */}
      {activeTab === "map" && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Dungeon Map + Wandering Monsters (desktop) */}
        {hasSpatialLayout && (
          <section className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-stone-400" />
                <h3 className="text-sm font-semibold text-stone-200">Dungeon Map</h3>
              </div>
              <DungeonMap
                dungeon={dungeon as SpatialDungeon}
                selectedRoomId={selectedRoomId}
                onRoomClick={handleRoomClick}
                roomNumberMap={roomNumberMap}
              />
              <p className="text-xs text-stone-500">
                Click a room to see details. Pan and zoom with gestures.
              </p>
            </div>

            {/* Wandering Monsters - Desktop only (under map) */}
            {(dungeon as SpatialDungeon).wanderingMonsters && (
              <div className="hidden lg:block">
                <WanderingMonstersSection dungeon={dungeon as SpatialDungeon} ruleset={ruleset} />
              </div>
            )}
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
                  ruleset={ruleset}
                  expanded={expandedRooms.has(index)}
                  onToggle={() => toggleRoom(index)}
                  selected={room.id === selectedRoomId}
                />
              </div>
            ))}
          </div>

          {/* Wandering Monsters - Mobile only (under rooms) */}
          {hasSpatialLayout && (dungeon as SpatialDungeon).wanderingMonsters && (
            <div className="lg:hidden">
              <WanderingMonstersSection dungeon={dungeon as SpatialDungeon} ruleset={ruleset} />
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

// NPC category display config
const NPC_CATEGORY_CONFIG: Record<string, { icon: typeof User; color: string; label: string }> = {
  rival_party: { icon: Users, color: "text-amber-400", label: "Rival Adventurers" },
  prisoner: { icon: User, color: "text-blue-400", label: "Prisoner" },
  hermit: { icon: User, color: "text-green-400", label: "Hermit" },
  ghost: { icon: Ghost, color: "text-purple-400", label: "Ghost" },
  refugee: { icon: User, color: "text-cyan-400", label: "Refugee" },
  faction_leader: { icon: Skull, color: "text-red-400", label: "Faction Leader" },
  faction_lieutenant: { icon: Users, color: "text-orange-400", label: "Faction Lieutenant" },
  faction_member: { icon: User, color: "text-orange-300", label: "Faction Member" },
  rival_scout: { icon: AlertTriangle, color: "text-yellow-400", label: "Rival Scout" },
};

interface DungeonNPCCardProps {
  npc: DungeonNPC;
  roomNumberMap: Map<string, number>;
}

function DungeonNPCCard({ npc, roomNumberMap }: DungeonNPCCardProps) {
  const config = NPC_CATEGORY_CONFIG[npc.category] ?? { icon: User, color: "text-stone-400", label: npc.category };
  const Icon = config.icon;
  const roomNum = roomNumberMap.get(npc.roomId);

  const dispositionColors: Record<string, string> = {
    friendly: "bg-green-900/50 text-green-300",
    neutral: "bg-stone-700 text-stone-300",
    wary: "bg-yellow-900/50 text-yellow-300",
    hostile: "bg-red-900/50 text-red-300",
  };

  return (
    <div className={`rounded border p-2 space-y-1 ${
      npc.isBoss
        ? "border-red-600 bg-red-950/30"
        : "border-stone-700 bg-stone-800/50"
    }`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className="text-sm font-medium text-stone-200">{config.label}</span>
        {npc.isBoss && (
          <span className="rounded bg-red-900 px-1.5 py-0.5 text-xs font-bold text-red-200">
            BOSS
          </span>
        )}
        {roomNum && (
          <span className="text-xs text-stone-500">Room #{roomNum}</span>
        )}
        <span className={`ml-auto rounded px-1.5 py-0.5 text-xs capitalize ${dispositionColors[npc.disposition]}`}>
          {npc.disposition}
        </span>
      </div>
      {npc.hasInfo && (
        <p className="text-xs text-stone-400">{npc.hasInfo}</p>
      )}
      {npc.wantsRescue && (
        <span className="inline-flex items-center gap-1 rounded bg-blue-900/50 px-1.5 py-0.5 text-xs text-blue-300">
          <AlertTriangle className="h-3 w-3" />
          Needs rescue
        </span>
      )}
      {npc.scoutingFor && (
        <span className="inline-flex items-center gap-1 rounded bg-yellow-900/50 px-1.5 py-0.5 text-xs text-yellow-300">
          <AlertTriangle className="h-3 w-3" />
          Spying for rival faction
        </span>
      )}
      {npc.wants && npc.wants.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-xs text-stone-500">Wants:</span>
          <div className="flex flex-wrap gap-1">
            {npc.wants.map((want) => (
              <span
                key={want}
                className="rounded bg-stone-700/50 px-1.5 py-0.5 text-xs text-stone-300 capitalize"
              >
                {want}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface KeyLockCardProps {
  pair: KeyLockPair;
  roomNumberMap: Map<string, number>;
  passages: SpatialDungeon["passages"];
}

function KeyLockCard({ pair, roomNumberMap, passages }: KeyLockCardProps) {
  const keyRoomNum = roomNumberMap.get(pair.keyRoomId);

  // Find which rooms the locked passage connects
  const lockedPassage = passages.find(p => p.id === pair.lockedPassageId);
  const toRoomNum = lockedPassage ? roomNumberMap.get(lockedPassage.toRoomId) : null;

  return (
    <div className="rounded border border-amber-800/50 bg-stone-800/50 p-2 space-y-1">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-200">{pair.keyName}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-stone-400">
          Found in: <span className="text-stone-300">Room #{keyRoomNum ?? "?"}</span>
        </span>
        <span className="text-stone-500">→</span>
        <span className="text-stone-400">
          Opens door to: <span className="text-stone-300">Room #{toRoomNum ?? "?"}</span>
        </span>
      </div>
    </div>
  );
}

interface ExitPointCardProps {
  exit: ExitPoint;
  roomNumberMap: Map<string, number>;
}

function ExitPointCard({ exit, roomNumberMap }: ExitPointCardProps) {
  const roomNum = roomNumberMap.get(exit.roomId);

  return (
    <div className={`rounded border p-2 space-y-1 ${
      exit.discovered
        ? "border-cyan-700/50 bg-cyan-950/30"
        : "border-stone-700 bg-stone-800/50"
    }`}>
      <div className="flex items-center gap-2">
        <DoorOpen className={`h-4 w-4 ${exit.discovered ? "text-cyan-400" : "text-stone-500"}`} />
        <span className="text-sm font-medium text-stone-200">
          Exit to Hex ({exit.destinationCoord.q}, {exit.destinationCoord.r})
        </span>
        {exit.discovered ? (
          <span className="ml-auto rounded bg-cyan-900/50 px-1.5 py-0.5 text-xs text-cyan-300">
            Discovered
          </span>
        ) : (
          <span className="ml-auto rounded bg-stone-700 px-1.5 py-0.5 text-xs text-stone-400">
            Hidden
          </span>
        )}
      </div>
      <p className="text-xs text-stone-400 italic">{exit.description}</p>
      {roomNum && (
        <p className="text-xs text-stone-500">
          Located in: <span className="text-stone-400">Room #{roomNum}</span>
        </p>
      )}
    </div>
  );
}

interface WanderingMonstersSectionProps {
  dungeon: SpatialDungeon;
  ruleset: Ruleset;
}

function WanderingMonstersSection({ dungeon, ruleset }: WanderingMonstersSectionProps) {
  if (!dungeon.wanderingMonsters) return null;

  const entries = dungeon.wanderingMonsters.entries;
  const dieSize = entries.length;

  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Footprints className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-semibold text-red-300">Wandering Monsters</h3>
        </div>
        <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-300">
          1d{dieSize}
        </span>
      </div>
      <p className="text-xs text-stone-400">
        Check: {dungeon.wanderingMonsters.checkFrequency}
      </p>
      <div className="overflow-hidden rounded border border-stone-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-700 bg-stone-800/50 text-xs text-stone-400">
              <th className="px-2 py-1 text-left w-8">#</th>
              <th className="px-2 py-1 text-left">Creature</th>
              <th className="px-2 py-1 text-center w-10">Lv</th>
              <th className="px-2 py-1 text-center w-10">AC</th>
              <th className="px-2 py-1 text-center w-10">HP</th>
              <th className="px-2 py-1 text-left">Atk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-700/50">
            {entries.map((entry, i) => {
              const stats = getMonsterStats(entry.creatureType, ruleset);
              return (
                <tr key={i} className="text-stone-300">
                  <td className="px-2 py-1.5 text-stone-500">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <div className="font-medium text-stone-200">
                      {entry.count} {entry.creatureType}
                    </div>
                    <div className="text-xs text-stone-500 italic">{entry.activity}</div>
                  </td>
                  <td className="px-2 py-1.5 text-center text-xs">{stats?.shadowdark?.level ?? "—"}</td>
                  <td className="px-2 py-1.5 text-center text-xs">{stats?.defense ?? "?"}</td>
                  <td className="px-2 py-1.5 text-center text-xs">{stats?.hp ?? "?"}</td>
                  <td className="px-2 py-1.5 text-xs text-stone-400">{stats?.attack ?? "?"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
