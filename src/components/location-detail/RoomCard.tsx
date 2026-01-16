import { ChevronDown, ChevronRight, Eye, EyeOff, Skull, AlertTriangle, Gem, Lock, ScrollText, History } from "lucide-react";
import type { DungeonRoom, SpatialRoom, RoomSize, Discovery } from "~/models";
import { getMonster, type Monster } from "~/lib/monsters";

interface RoomCardProps {
  room: DungeonRoom | SpatialRoom;
  roomNumber: number;
  expanded?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}

const SIZE_BADGES: Record<RoomSize, { label: string; color: string }> = {
  cramped: { label: "Cramped", color: "bg-stone-700" },
  small: { label: "Small", color: "bg-stone-600" },
  medium: { label: "Medium", color: "bg-stone-500" },
  large: { label: "Large", color: "bg-amber-700" },
  vast: { label: "Vast", color: "bg-amber-600" },
};

function MonsterDisplay({ monster, count }: { monster: Monster; count: number }) {
  return (
    <div className="rounded bg-stone-800 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className="h-4 w-4 text-red-500" />
          <span className="font-medium text-stone-100">
            {count > 1 ? `${count}x ` : ""}{monster.name}
          </span>
        </div>
        <span className="text-xs text-stone-500">LV {monster.level}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-stone-400">
        <div>AC {monster.armor_class}</div>
        <div>HP {monster.hit_points}</div>
        <div className="col-span-2">{monster.attacks}</div>
      </div>
      {monster.traits.length > 0 && (
        <div className="text-xs text-stone-500 space-y-1">
          {monster.traits.map((trait, i) => (
            <div key={i}>
              <span className="text-stone-400">{trait.name}:</span> {trait.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RoomCard({ room, roomNumber, expanded = false, selected = false, onToggle }: RoomCardProps) {
  const sizeBadge = SIZE_BADGES[room.size];
  const hasMonsters = room.encounters.some(e => !e.defeated);
  const hasHazards = room.hazards.some(h => !h.disarmed);
  const hasTreasure = room.treasure.some(t => !t.looted);
  const hasSecrets = room.secrets.some(s => !s.discovered);
  const hasDiscoveries = (room.discoveries ?? []).some(d => !d.found);
  const hasHistoricalClues = (room.historicalClues ?? []).length > 0;

  return (
    <div className={`rounded-lg border bg-stone-900 overflow-hidden ${
      selected ? "border-amber-500 ring-1 ring-amber-500/30" : "border-stone-700"
    }`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-stone-800 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-stone-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-stone-500 flex-shrink-0" />
        )}

        {/* Room number */}
        <span className="flex items-center justify-center h-6 w-6 rounded bg-stone-700 text-xs font-bold text-stone-200">
          {roomNumber}
        </span>

        {/* Room type */}
        <span className="font-medium text-stone-100 capitalize flex-1">
          {room.type.replace("_", " ")}
        </span>

        {/* Status indicators */}
        <div className="flex items-center gap-1">
          {hasMonsters && <Skull className="h-4 w-4 text-red-500" />}
          {hasHazards && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {hasTreasure && <Gem className="h-4 w-4 text-emerald-500" />}
          {hasSecrets && <Lock className="h-4 w-4 text-purple-500" />}
          {hasDiscoveries && <ScrollText className="h-4 w-4 text-blue-500" />}
          {hasHistoricalClues && <History className="h-4 w-4 text-stone-400" />}
        </div>

        {/* Size badge */}
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${sizeBadge.color} text-stone-200`}>
          {sizeBadge.label}
        </span>

        {/* Explored checkbox */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-stone-500"
        >
          {room.explored ? (
            <Eye className="h-4 w-4 text-green-500" />
          ) : (
            <EyeOff className="h-4 w-4 text-stone-600" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-stone-700 p-4 pl-12 space-y-4">
          {/* Description */}
          <p className="text-stone-300 text-sm">{room.description}</p>

          {/* Features */}
          {room.features.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Features
              </h4>
              <ul className="space-y-1">
                {room.features.map((feature, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-stone-200">{feature.name}</span>
                    {feature.description && (
                      <span className="text-stone-500"> — {feature.description}</span>
                    )}
                    {feature.interactive && (
                      <span className="ml-1 text-xs text-amber-500">(interactive)</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Monsters */}
          {room.encounters.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Monsters
              </h4>
              <div className="space-y-2">
                {room.encounters.map((encounter) => {
                  const monster = getMonster(encounter.creatureType);
                  if (!monster) {
                    return (
                      <div
                        key={encounter.id}
                        className={`rounded bg-stone-800 p-2 text-sm ${encounter.defeated ? "opacity-50 line-through" : ""}`}
                      >
                        {encounter.count}x {encounter.creatureType}
                        <span className="ml-2 text-xs text-stone-500 capitalize">
                          ({encounter.behavior})
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={encounter.id}
                      className={encounter.defeated ? "opacity-50" : ""}
                    >
                      <MonsterDisplay monster={monster} count={encounter.count} />
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className={`capitalize ${
                          encounter.behavior === "hostile" ? "text-red-500" :
                          encounter.behavior === "fleeing" ? "text-amber-500" :
                          "text-stone-500"
                        }`}>
                          {encounter.behavior}
                        </span>
                        {encounter.defeated && (
                          <span className="text-stone-600">(defeated)</span>
                        )}
                        {encounter.notes && (
                          <span className="text-stone-500">— {encounter.notes}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Treasure */}
          {room.treasure.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Treasure
              </h4>
              <ul className="space-y-1">
                {room.treasure.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 text-sm ${item.looted ? "opacity-50 line-through" : ""}`}
                  >
                    <Gem className={`h-3 w-3 ${
                      item.type === "magic_item" ? "text-purple-500" :
                      item.type === "gems" ? "text-cyan-500" :
                      item.type === "art" ? "text-pink-500" :
                      "text-amber-500"
                    }`} />
                    <span className="text-stone-200">{item.name}</span>
                    {item.value && (
                      <span className="text-xs text-stone-500">{item.value}</span>
                    )}
                    {item.description && (
                      <span className="text-xs text-stone-600">— {item.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Hazards */}
          {room.hazards.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Hazards
              </h4>
              <ul className="space-y-2">
                {room.hazards.map((hazard, i) => (
                  <li
                    key={i}
                    className={`rounded bg-stone-800 p-2 text-sm ${hazard.disarmed ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${hazard.disarmed ? "text-stone-600" : "text-amber-500"}`} />
                      <span className="text-stone-200">{hazard.name}</span>
                      {hazard.disarmed && (
                        <span className="text-xs text-stone-600">(disarmed)</span>
                      )}
                    </div>
                    <p className="mt-1 text-stone-400">{hazard.description}</p>
                    <div className="mt-1 flex gap-3 text-xs text-stone-500">
                      {hazard.save && <span>Save: {hazard.save}</span>}
                      {hazard.damage && <span>Damage: {hazard.damage}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Secrets */}
          {room.secrets.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Secrets
              </h4>
              <ul className="space-y-2">
                {room.secrets.map((secret, i) => (
                  <li
                    key={i}
                    className={`rounded bg-stone-800 p-2 text-sm ${secret.discovered ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Lock className={`h-4 w-4 ${secret.discovered ? "text-stone-600" : "text-purple-500"}`} />
                      <span className="text-stone-200">{secret.description}</span>
                      {secret.discovered && (
                        <span className="text-xs text-stone-600">(found)</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      <span className="text-stone-400">Trigger:</span> {secret.trigger}
                    </p>
                    {secret.reward && (
                      <p className="text-xs text-emerald-600">
                        <span className="text-stone-400">Reward:</span> {secret.reward}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Discoveries */}
          {(room.discoveries ?? []).length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Discoveries
              </h4>
              <ul className="space-y-2">
                {(room.discoveries ?? []).map((discovery) => (
                  <li
                    key={discovery.id}
                    className={`rounded bg-stone-800 p-2 text-sm ${discovery.found ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <ScrollText className={`h-4 w-4 ${
                        discovery.type === "document" ? "text-blue-500" :
                        discovery.type === "evidence" ? "text-red-400" :
                        discovery.type === "clue" ? "text-amber-500" :
                        "text-purple-400"
                      }`} />
                      <span className="text-stone-300 capitalize">{discovery.type}</span>
                      {discovery.found && (
                        <span className="text-xs text-stone-600">(found)</span>
                      )}
                    </div>
                    <p className="mt-1 text-stone-200">{discovery.description}</p>
                    {discovery.content && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-stone-500 hover:text-stone-400">
                          Read content (GM)
                        </summary>
                        <p className="mt-1 p-2 rounded bg-stone-900 text-xs text-stone-400 whitespace-pre-wrap">
                          {discovery.content}
                        </p>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Historical Clues */}
          {(room.historicalClues ?? []).length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Historical Clues
              </h4>
              <ul className="space-y-1">
                {(room.historicalClues ?? []).map((clue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <History className="h-4 w-4 text-stone-500 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-400 italic">{clue}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
