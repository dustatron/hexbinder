import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, ChevronRight, MapPin, Eye, EyeOff, Menu, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import type { Hex, Location, TerrainType, Dwelling, DwellingType } from "~/models";

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
  plains: "Plains",
  forest: "Forest",
  hills: "Hills",
  mountains: "Mountains",
  water: "Water",
  swamp: "Swamp",
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

  // Build a single highlight line for wilderness hexes
  const highlight = !location && hex ? getHexHighlight(hex, dwelling) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 rounded-t-xl border-t border-border bg-card px-3 pb-3 pt-2 shadow-xl"
        >
          {/* Header row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <h2 className="font-bold text-foreground truncate">
                {location ? location.name : (hex ? TERRAIN_LABELS[hex.terrain] : "Unknown")}
              </h2>
              {location && (
                <span className="text-xs font-medium capitalize text-amber-400 shrink-0">
                  {location.type}
                </span>
              )}
              {!location && hex && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {hex.coord.q},{hex.coord.r}
                </span>
              )}
              {isCurrent && (
                <span className="rounded bg-green-600/30 px-1 text-xs text-green-400 shrink-0">Here</span>
              )}
              {isVisited && !isCurrent && (
                <span className="rounded bg-purple-600/30 px-1 text-xs text-purple-400 shrink-0">Visited</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Single line highlight for wilderness */}
          {highlight && (
            <p className="mt-1 text-sm text-muted-foreground truncate">{highlight}</p>
          )}

          {/* Single line description for locations */}
          {location && (
            <p className="mt-1 text-sm text-muted-foreground truncate">{location.description}</p>
          )}

          {/* Action Bar */}
          {hex && (
            <div className="mt-2 flex gap-2">
              {hexId && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-lg bg-muted px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent">
                    <Menu size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[140px]">
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
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-stone-900 hover:bg-amber-500"
              >
                View Details
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Get a single-line highlight for a wilderness hex.
 * Priority: dwelling > feature > encounter > quest object
 */
function getHexHighlight(hex: Hex, dwelling: Dwelling | null): string | null {
  if (dwelling) {
    return `${DWELLING_LABELS[dwelling.type]}: ${dwelling.name}`;
  }
  if (hex.feature) {
    return hex.feature.name + (hex.feature.cleared ? " (cleared)" : "");
  }
  if (hex.encounter && !hex.encounter.defeated) {
    return `${hex.encounter.creature} x${hex.encounter.count}`;
  }
  if (hex.questObject && !hex.questObject.found) {
    return hex.questObject.name;
  }
  return null;
}
