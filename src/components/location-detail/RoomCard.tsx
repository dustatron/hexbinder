import { ChevronDown, ChevronRight, Eye, EyeOff, Skull, AlertTriangle, Gem, Lock, ScrollText, History, BookOpen } from "lucide-react";
import type { DungeonRoom, SpatialRoom, RoomSize, Discovery, Ruleset } from "~/models";
import { getMonsterStats } from "~/lib/monster-stats";
import { MonsterCard } from "~/components/encounter-table/MonsterCard";

interface RoomCardProps {
  room: DungeonRoom | SpatialRoom;
  roomNumber: number;
  ruleset: Ruleset;
  expanded?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}

const SIZE_BADGES: Record<RoomSize, { label: string; color: string; textColor: string }> = {
  cramped: { label: "Cramped", color: "bg-muted", textColor: "text-foreground" },
  small: { label: "Small", color: "bg-stone-600", textColor: "text-white" },
  medium: { label: "Medium", color: "bg-stone-500", textColor: "text-white" },
  large: { label: "Large", color: "bg-amber-700", textColor: "text-white" },
  vast: { label: "Vast", color: "bg-amber-600", textColor: "text-white" },
};

export function RoomCard({ room, roomNumber, ruleset, expanded = false, selected = false, onToggle }: RoomCardProps) {
  const sizeBadge = SIZE_BADGES[room.size];
  const hasMonsters = room.encounters.some(e => !e.defeated);
  const hasHazards = room.hazards.some(h => !h.disarmed);
  const hasTreasure = room.treasure.some(t => !t.looted);
  const hasSecrets = room.secrets.some(s => !s.discovered);
  const hasDiscoveries = (room.discoveries ?? []).some(d => !d.found);
  const hasHistoricalClues = (room.historicalClues ?? []).length > 0;

  return (
    <div className={`rounded-lg border bg-card overflow-hidden ${
      selected ? "border-amber-500 ring-1 ring-amber-500/30" : "border-border"
    }`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}

        {/* Room number */}
        <span className="flex items-center justify-center h-6 w-6 rounded bg-muted text-xs font-bold text-foreground">
          {roomNumber}
        </span>

        {/* Room type */}
        <span className="font-medium text-foreground capitalize flex-1">
          {room.type.replace("_", " ")}
        </span>

        {/* Status indicators */}
        <div className="flex items-center gap-1">
          {hasMonsters && <Skull className="h-4 w-4 text-red-500" />}
          {hasHazards && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {hasTreasure && <Gem className="h-4 w-4 text-emerald-500" />}
          {hasSecrets && <Lock className="h-4 w-4 text-purple-500" />}
          {hasDiscoveries && <ScrollText className="h-4 w-4 text-blue-500" />}
          {hasHistoricalClues && <History className="h-4 w-4 text-muted-foreground" />}
        </div>

        {/* Size badge */}
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${sizeBadge.color} ${sizeBadge.textColor}`}>
          {sizeBadge.label}
        </span>

        {/* Explored checkbox */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          {room.explored ? (
            <Eye className="h-4 w-4 text-green-500" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border p-4 pl-12 space-y-4">
          {/* Description */}
          <p className="text-foreground text-sm">{room.description}</p>

          {/* Features */}
          {room.features.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Features
              </h4>
              <ul className="space-y-1">
                {room.features.map((feature, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-foreground">{feature.name}</span>
                    {feature.description && (
                      <span className="text-muted-foreground"> — {feature.description}</span>
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
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Monsters
              </h4>
              <div className="space-y-2">
                {room.encounters.map((encounter) => {
                  const stats = getMonsterStats(encounter.creatureType, ruleset);
                  if (!stats) {
                    return (
                      <div
                        key={encounter.id}
                        className={`rounded bg-card p-2 text-sm ${encounter.defeated ? "opacity-50 line-through" : ""}`}
                      >
                        {encounter.count}x {encounter.creatureType}
                        <span className="ml-2 text-xs text-muted-foreground capitalize">
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
                      <MonsterCard stats={stats} count={encounter.count} />
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className={`capitalize ${
                          encounter.behavior === "hostile" ? "text-red-500" :
                          encounter.behavior === "fleeing" ? "text-amber-500" :
                          "text-muted-foreground"
                        }`}>
                          {encounter.behavior}
                        </span>
                        {encounter.defeated && (
                          <span className="text-muted-foreground">(defeated)</span>
                        )}
                        {encounter.notes && (
                          <span className="text-muted-foreground">— {encounter.notes}</span>
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
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Treasure
              </h4>
              <ul className="space-y-2">
                {room.treasure.map((item) => (
                  <li
                    key={item.id}
                    className={`rounded bg-card p-2 text-sm ${item.looted ? "opacity-50" : ""}`}
                  >
                    <div className={`flex items-center gap-2 ${item.looted ? "line-through" : ""}`}>
                      <Gem className={`h-4 w-4 flex-shrink-0 ${
                        item.type === "magic_item" ? "text-purple-500" :
                        item.type === "gems" ? "text-cyan-500" :
                        item.type === "art" ? "text-pink-500" :
                        "text-amber-500"
                      }`} />
                      <span className="text-foreground">{item.name}</span>
                      {item.value && (
                        <span className="text-xs text-muted-foreground">{item.value}</span>
                      )}
                      {item.looted && (
                        <span className="text-xs text-muted-foreground">(looted)</span>
                      )}
                    </div>
                    {item.description && !item.backstory && (
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    )}
                    {item.backstory && (
                      <div className="mt-2 flex items-start gap-2">
                        <BookOpen className="h-3 w-3 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground italic">{item.backstory}</p>
                      </div>
                    )}
                    {item.originalOwner && !item.backstory && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="text-muted-foreground">Originally owned by:</span> {item.originalOwner}
                      </p>
                    )}
                    {item.complication && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-red-400 hover:text-red-300">
                          Complication (GM)
                        </summary>
                        <p className="mt-1 p-2 rounded bg-background text-xs text-red-300">
                          {item.complication}
                        </p>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Hazards/Traps (Cairn-style) */}
          {room.hazards.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Traps & Hazards
              </h4>
              <ul className="space-y-3">
                {room.hazards.map((hazard, i) => (
                  <li
                    key={i}
                    className={`rounded bg-card p-3 text-sm ${hazard.disarmed ? "opacity-50" : ""}`}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${hazard.disarmed ? "text-muted-foreground" : "text-amber-500"}`} />
                      <span className="font-medium text-foreground">{hazard.name}</span>
                      {hazard.targetAttribute && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/50 text-red-300">
                          {hazard.targetAttribute}
                        </span>
                      )}
                      {hazard.disarmed && (
                        <span className="text-xs text-muted-foreground">(disarmed)</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-muted-foreground">{hazard.description}</p>

                    {/* Mechanics */}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {hazard.damage && (
                        <span className="text-red-400">
                          <span className="text-muted-foreground">Damage:</span> {hazard.damage}
                        </span>
                      )}
                      {hazard.save && (
                        <span className="text-amber-400">
                          <span className="text-muted-foreground">Save:</span> {hazard.save}
                        </span>
                      )}
                    </div>

                    {/* Cairn-style: Trigger */}
                    {hazard.trigger && (
                      <p className="mt-2 text-xs">
                        <span className="text-red-500">⚡ Trigger:</span>{" "}
                        <span className="text-muted-foreground">{hazard.trigger}</span>
                      </p>
                    )}

                    {/* Cairn-style: Hints (passive and active) */}
                    {(hazard.passiveHint || hazard.activeHint) && (
                      <div className="mt-2 space-y-1 border-t border-border pt-2">
                        {hazard.passiveHint && (
                          <p className="text-xs">
                            <span className="text-yellow-500">👂 Passive:</span>{" "}
                            <span className="text-muted-foreground">{hazard.passiveHint}</span>
                          </p>
                        )}
                        {hazard.activeHint && (
                          <p className="text-xs">
                            <span className="text-cyan-500">🔍 Active:</span>{" "}
                            <span className="text-muted-foreground">{hazard.activeHint}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Cairn-style: Disarm Methods (expanded by default) */}
                    {hazard.disarmMethods && hazard.disarmMethods.length > 0 && (
                      <div className="mt-2 border-t border-border pt-2">
                        <p className="text-xs text-emerald-500 mb-1">
                          ✓ Disarm Methods
                        </p>
                        <ul className="ml-4 space-y-1 text-xs text-muted-foreground">
                          {hazard.disarmMethods.map((method, j) => (
                            <li key={j} className="list-disc">{method}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cairn-style: Consequence */}
                    {hazard.consequence && (
                      <p className="mt-2 text-xs text-orange-400">
                        <span className="text-muted-foreground">Consequence:</span> {hazard.consequence}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Secrets */}
          {room.secrets.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Secrets
              </h4>
              <ul className="space-y-2">
                {room.secrets.map((secret, i) => (
                  <li
                    key={i}
                    className={`rounded bg-card p-2 text-sm ${secret.discovered ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Lock className={`h-4 w-4 ${secret.discovered ? "text-muted-foreground" : "text-purple-500"}`} />
                      <span className="text-foreground">{secret.description}</span>
                      {secret.discovered && (
                        <span className="text-xs text-muted-foreground">(found)</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="text-muted-foreground">Trigger:</span> {secret.trigger}
                    </p>
                    {secret.reward && (
                      <p className="text-xs text-emerald-600">
                        <span className="text-muted-foreground">Reward:</span> {secret.reward}
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
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Discoveries
              </h4>
              <ul className="space-y-2">
                {(room.discoveries ?? []).map((discovery) => (
                  <li
                    key={discovery.id}
                    className={`rounded bg-card p-2 text-sm ${discovery.found ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <ScrollText className={`h-4 w-4 ${
                        discovery.type === "document" ? "text-blue-500" :
                        discovery.type === "evidence" ? "text-red-400" :
                        discovery.type === "clue" ? "text-amber-500" :
                        "text-purple-400"
                      }`} />
                      <span className="text-foreground capitalize">{discovery.type}</span>
                      {discovery.found && (
                        <span className="text-xs text-muted-foreground">(found)</span>
                      )}
                    </div>
                    <p className="mt-1 text-foreground">{discovery.description}</p>
                    {discovery.content && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-muted-foreground">
                          Read content (GM)
                        </summary>
                        <p className="mt-1 p-2 rounded bg-background text-xs text-muted-foreground whitespace-pre-wrap">
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
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Historical Clues
              </h4>
              <ul className="space-y-1">
                {(room.historicalClues ?? []).map((clue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <History className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground italic">{clue}</span>
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
