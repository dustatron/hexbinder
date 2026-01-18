import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Sparkles, Skull, Home, ChevronRight, MapPin, Eye, EyeOff, Menu, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import type { Hex, Location, TerrainType, Dwelling, DwellingType } from "~/models";
import { generateImprovedEncounter, type ImprovedEncounterResult } from "~/generators/EncounterGenerator";

interface LocationPanelProps {
  location: Location | null;
  hex: Hex | null;
  dwelling: Dwelling | null;
  worldId: string;
  worldSeed: string;
  currentHexId: string | null;
  visitedHexIds: string[];
  onClose: () => void;
  onSetCurrent: (hexId: string) => void;
  onToggleVisited: (hexId: string) => void;
}

const TERRAIN_LABELS: Record<TerrainType, string> = {
  plains: "Open Plains",
  forest: "Dense Forest",
  hills: "Rolling Hills",
  mountains: "Mountain Range",
  water: "Lake / River",
  swamp: "Murky Swamp",
};

const DWELLING_LABELS: Record<DwellingType, string> = {
  farmstead: "Farmstead",
  cottage: "Cottage",
  hermitage: "Hermitage",
  ranger_station: "Ranger Station",
  roadside_inn: "Roadside Inn",
};

export function LocationPanel({
  location,
  hex,
  dwelling,
  worldId,
  worldSeed,
  currentHexId,
  visitedHexIds,
  onClose,
  onSetCurrent,
  onToggleVisited,
}: LocationPanelProps) {
  const isOpen = hex !== null;

  // Party location state
  const hexId = hex ? `${hex.coord.q},${hex.coord.r}` : null;
  const isCurrent = hexId === currentHexId;
  const isVisited = hexId ? visitedHexIds.includes(hexId) : false;

  // Generate encounter result for wilderness hexes
  const encounterResult = useMemo(() => {
    if (!hex || location) return null;
    const rerollCount = hex.encounterRerollCount ?? 0;
    const seed = `${worldSeed}-hex-${hex.coord.q},${hex.coord.r}${rerollCount > 0 ? `-${rerollCount}` : ""}`;
    return generateImprovedEncounter({
      seed,
      terrain: hex.terrain,
      overrides: hex.encounterOverrides,
    });
  }, [hex, location, worldSeed]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 rounded-t-xl border-t border-stone-700 bg-stone-800 p-3 shadow-xl"
        >
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {location ? (
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-bold text-stone-100 truncate">
                    {location.name}
                  </h2>
                  <span className="text-sm font-medium capitalize text-amber-400 shrink-0">
                    {location.type}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-green-600/20 px-1.5 py-0.5 text-xs text-green-400 shrink-0">
                      Here
                    </span>
                  )}
                  {isVisited && !isCurrent && (
                    <span className="rounded-full bg-purple-600/20 px-1.5 py-0.5 text-xs text-purple-400 shrink-0">
                      Visited
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-bold capitalize text-stone-100">
                    {hex ? TERRAIN_LABELS[hex.terrain] : "Unknown"}
                  </h2>
                  <span className="text-sm text-stone-400">
                    ({hex?.coord.q}, {hex?.coord.r})
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-green-600/20 px-1.5 py-0.5 text-xs text-green-400 shrink-0">
                      Here
                    </span>
                  )}
                  {isVisited && !isCurrent && (
                    <span className="rounded-full bg-purple-600/20 px-1.5 py-0.5 text-xs text-purple-400 shrink-0">
                      Visited
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
            >
              <X size={20} />
            </button>
          </div>


          {location && (
            <div className="space-y-2">
              <p className="text-sm text-stone-300 line-clamp-2">{location.description}</p>

              {location.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {location.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-stone-700 px-2 py-0.5 text-xs text-stone-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {location.tags.length > 4 && (
                    <span className="text-xs text-stone-400">+{location.tags.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {!location && hex && (
            <div className="space-y-2">
              {/* Improved Encounter Result */}
              {encounterResult && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-400" />
                    <span className="whitespace-pre-line text-sm font-medium text-amber-200 line-clamp-2">
                      {buildEncounterSummary(encounterResult)}
                    </span>
                  </div>
                </div>
              )}

              {/* Feature */}
              {hex.feature && (
                <div className="rounded-lg border border-stone-600 bg-stone-700/50 p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-100">{hex.feature.name}</span>
                    {hex.feature.cleared && (
                      <span className="rounded bg-stone-600 px-1.5 py-0.5 text-xs text-stone-400">Cleared</span>
                    )}
                  </div>
                </div>
              )}

              {/* Encounter */}
              {hex.encounter && !hex.encounter.defeated && (
                <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-2">
                  <Skull size={14} className="shrink-0 text-red-400" />
                  <span className="text-sm text-red-200">
                    {hex.encounter.creature} (x{hex.encounter.count})
                  </span>
                </div>
              )}

              {/* Quest Object */}
              {hex.questObject && !hex.questObject.found && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-900/50 bg-amber-950/30 p-2">
                  <Sparkles size={14} className="shrink-0 text-amber-400" />
                  <span className="text-sm text-amber-200">{hex.questObject.name}</span>
                </div>
              )}

              {/* Dwelling */}
              {dwelling && (
                <div className="flex items-center gap-2 rounded-lg border border-stone-600 bg-stone-700/50 p-2">
                  <Home size={14} className="shrink-0 text-stone-300" />
                  <span className="text-sm text-stone-200">
                    {DWELLING_LABELS[dwelling.type]}: <span className="font-medium">{dwelling.name}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          {hex && (
            <div className="mt-3 flex gap-2">
              {/* Party location dropdown */}
              {hexId && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-lg bg-stone-700 px-3 py-2 text-stone-300 transition-colors hover:bg-stone-600">
                    <Menu size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[160px]">
                    <DropdownMenuItem
                      onClick={() => onSetCurrent(hexId)}
                      disabled={isCurrent}
                      className={isCurrent ? "opacity-50" : ""}
                    >
                      {isCurrent ? <Check size={14} /> : <MapPin size={14} />}
                      {isCurrent ? "Current" : "Set Current"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleVisited(hexId)}>
                      {isVisited ? <EyeOff size={14} /> : <Eye size={14} />}
                      {isVisited ? "Unmark" : "Mark Visited"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Link
                to="/world/$worldId/hex/$q/$r"
                params={{
                  worldId,
                  q: String(hex.coord.q),
                  r: String(hex.coord.r),
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 hover:bg-amber-500"
              >
                View Details
                <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === Helpers ===

function buildEncounterSummary(result: ImprovedEncounterResult): string {
  const { encounterType } = result;

  switch (encounterType) {
    case "creature":
      if (result.creature) {
        return `${result.creature.count}x ${result.creature.entry.name} - ${result.reaction}`;
      }
      return "Creature encounter";

    case "npc":
      if (result.npc) {
        const wantLine = result.npc.flavorWant ? `\nwants: ${result.npc.flavorWant}` : "";
        return `${result.npc.name} (${result.npc.archetype}) - ${result.reaction}${wantLine}`;
      }
      return `NPC - ${result.reaction}`;

    case "sign":
      return result.sign?.text ?? "Sign/Omen";

    case "environment":
      return result.environment?.text ?? "Environment change";

    case "loss":
      return result.loss?.text ?? "Resource loss";

    case "area-effect":
      return result.areaEffect?.text ?? "Discovery";

    default:
      return "Encounter";
  }
}

function formatTimestamp(timestamp: number): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
