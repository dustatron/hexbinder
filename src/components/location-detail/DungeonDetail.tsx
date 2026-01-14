import { useState, useMemo } from "react";
import { RefreshCw, CheckCircle2, Skull, Gem, MapPin } from "lucide-react";
import type { Dungeon, Hook, DungeonTheme } from "~/models";
import type { RegenerationType } from "~/lib/hex-regenerate";
import { EncounterTable } from "~/components/encounter-table/EncounterTable";
import { RegenerateButton } from "./RegenerateButton";
import { RoomCard } from "./RoomCard";

interface DungeonDetailProps {
  dungeon: Dungeon;
  hook?: Hook;
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
  worldId,
  onRegenerate,
  onReroll,
  seed,
}: DungeonDetailProps) {
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(() => new Set([0]));

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
    <div className="space-y-6">
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
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-400">{dungeon.description}</p>
      </div>

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

      {/* Room Layout */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-200">Room Layout</h3>
        <div className="space-y-2">
          {sortedRooms.map((room, index) => (
            <RoomCard
              key={room.id}
              room={room}
              roomNumber={index + 1}
              expanded={expandedRooms.has(index)}
              onToggle={() => toggleRoom(index)}
            />
          ))}
        </div>
      </div>

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
    </div>
  );
}
