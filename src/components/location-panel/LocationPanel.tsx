import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  X, ChevronRight, MapPin, Eye, EyeOff, Menu, Check,
  Swords, Skull, Compass, Scroll, Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import type {
  Hex, Location, TerrainType, Dwelling, DwellingType,
  Settlement, Dungeon, GovernmentType, SettlementMood, SettlementSize,
} from "~/models";
import { generateImprovedEncounter } from "~/generators/EncounterGenerator";
import { FirstImpressions } from "~/components/encounter-table/FirstImpressions";

interface LocationPanelProps {
  location: Location | null;
  hex: Hex | null;
  dwelling: Dwelling | null;
  worldId: string;
  worldSeed: string;
  currentHexId: string | null;
  visitedHexIds: string[];
  themeId?: string;
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
  desert: "Desert",
};

const DWELLING_LABELS: Record<DwellingType, string> = {
  farmstead: "Farmstead",
  cottage: "Cottage",
  hermitage: "Hermitage",
  ranger_station: "Ranger Station",
  roadside_inn: "Roadside Inn",
};

const SIZE_LABELS: Record<SettlementSize, string> = {
  thorpe: "Thorpe",
  hamlet: "Hamlet",
  village: "Village",
  town: "Town",
  city: "City",
};

const GOVT_LABELS: Record<GovernmentType, string> = {
  council: "Council",
  mayor: "Mayor",
  lord: "Lord",
  elder: "Elder",
  guild: "Guild",
  theocracy: "Theocracy",
};

const MOOD_COLORS: Record<SettlementMood, string> = {
  prosperous: "text-green-400",
  welcoming: "text-emerald-400",
  struggling: "text-orange-400",
  fearful: "text-purple-400",
  hostile: "text-red-400",
  secretive: "text-yellow-400",
};

const BEHAVIOR_LABELS: Record<string, { label: string; color: string }> = {
  hostile: { label: "Hostile", color: "text-red-400" },
  neutral: { label: "Neutral", color: "text-yellow-400" },
  fleeing: { label: "Fleeing", color: "text-blue-400" },
};

function isSettlement(loc: Location): loc is Settlement {
  return loc.type === "settlement";
}

function isDungeon(loc: Location): loc is Dungeon {
  return loc.type === "dungeon";
}

export function LocationPanel({
  location,
  hex,
  dwelling,
  worldId,
  worldSeed,
  currentHexId,
  visitedHexIds,
  themeId,
  onClose,
  onSetCurrent,
  onToggleVisited,
}: LocationPanelProps) {
  const isOpen = hex !== null;

  // Party location state
  const hexId = hex ? `${hex.coord.q},${hex.coord.r}` : null;
  const isCurrent = hexId === currentHexId;
  const isVisited = hexId ? visitedHexIds.includes(hexId) : false;

  return (
    <AnimatePresence>
      {isOpen && hex && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 max-h-[60vh] overflow-y-auto rounded-t-xl border-t border-stone-700 bg-stone-800 px-4 pb-4 pt-2 shadow-xl"
        >
          {/* Drag handle */}
          <div className="mb-2 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-stone-600" />
          </div>

          {/* Header row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <h2 className="font-bold text-stone-100 truncate text-lg">
                {location ? location.name : TERRAIN_LABELS[hex.terrain]}
              </h2>
              {/* Settlement size badge */}
              {location && isSettlement(location) && (
                <span className="rounded bg-amber-600/20 px-1.5 py-0.5 text-xs font-medium text-amber-400 shrink-0">
                  {SIZE_LABELS[location.size]}
                </span>
              )}
              {/* Dungeon theme badge */}
              {location && isDungeon(location) && (
                <span className="rounded bg-red-600/20 px-1.5 py-0.5 text-xs font-medium capitalize text-red-400 shrink-0">
                  {location.theme}
                </span>
              )}
              {/* Non-settlement location type badge */}
              {location && !isSettlement(location) && !isDungeon(location) && (
                <span className="text-xs font-medium capitalize text-amber-400 shrink-0">
                  {location.type}
                </span>
              )}
              {/* Wilderness coords */}
              {!location && (
                <span className="text-xs text-stone-500 shrink-0">
                  {hex.coord.q},{hex.coord.r}
                </span>
              )}
              {isCurrent && (
                <span className="rounded bg-green-600/30 px-1.5 py-0.5 text-xs text-green-400 shrink-0">Here</span>
              )}
              {isVisited && !isCurrent && (
                <span className="rounded bg-purple-600/30 px-1.5 py-0.5 text-xs text-purple-400 shrink-0">Visited</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-stone-400 hover:bg-stone-700 hover:text-stone-200 shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Settlement details */}
          {location && isSettlement(location) && (
            <SettlementSummary location={location} />
          )}

          {/* Dungeon description */}
          {location && isDungeon(location) && (
            <p className="mt-1.5 text-sm text-stone-300 line-clamp-3">{location.description}</p>
          )}

          {/* Landmark / other location description */}
          {location && !isSettlement(location) && !isDungeon(location) && (
            <p className="mt-1.5 text-sm text-stone-300 line-clamp-3">{location.description}</p>
          )}

          {/* Wilderness hex details */}
          {!location && (
            <WildernessDetails
              hex={hex}
              dwelling={dwelling}
              worldSeed={worldSeed}
              themeId={themeId}
            />
          )}

          {/* Action Bar */}
          <div className="mt-3 flex gap-2">
            {hexId && (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-lg bg-stone-700 px-2.5 py-1.5 text-stone-300 transition-colors hover:bg-stone-600">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Settlement summary: sensory impressions + govt/mood */
function SettlementSummary({ location }: { location: Settlement }) {
  const impressions = location.sensoryImpressions;
  const moodColor = MOOD_COLORS[location.mood] ?? "text-stone-400";

  return (
    <div className="mt-2 space-y-2">
      {/* Sensory impressions */}
      {impressions && impressions.length > 0 && (
        <ul className="space-y-1 text-sm text-stone-300">
          {impressions.map((imp, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 shrink-0 text-stone-600">&bull;</span>
              <span>{imp}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Govt & Mood row */}
      <div className="flex items-center gap-3 text-xs text-stone-400">
        <span>Govt: <span className="text-stone-300">{GOVT_LABELS[location.governmentType]}</span></span>
        <span className="text-stone-600">&middot;</span>
        <span>Mood: <span className={`capitalize ${moodColor}`}>{location.mood}</span></span>
        <span className="text-stone-600">&middot;</span>
        <span>Pop: <span className="text-stone-300">{location.population}</span></span>
      </div>
    </div>
  );
}

/** Wilderness hex: first impressions + encounter/feature/quest/dwelling cards */
function WildernessDetails({
  hex,
  dwelling,
  worldSeed,
  themeId,
}: {
  hex: Hex;
  dwelling: Dwelling | null;
  worldSeed: string;
  themeId?: string;
}) {
  // Generate first impressions (deterministic from seed)
  const rerollCount = hex.encounterRerollCount ?? 0;
  const seed = `${worldSeed}-hex-${hex.coord.q},${hex.coord.r}${rerollCount > 0 ? `-${rerollCount}` : ""}`;
  const impressions = useMemo(() => {
    const result = generateImprovedEncounter({
      seed,
      terrain: hex.terrain,
      themeId,
    });
    return result.impressions;
  }, [seed, hex.terrain, themeId]);

  const hasEncounter = hex.encounter && !hex.encounter.defeated;
  const hasFeature = !!hex.feature;
  const hasQuest = hex.questObject && !hex.questObject.found;
  const hasDwelling = !!dwelling;

  return (
    <div className="mt-2 space-y-2">
      {/* First impressions (sight/sound/smell) */}
      <FirstImpressions
        sight={impressions.sight}
        sound={impressions.sound}
        smell={impressions.smell}
        terrainLabel={TERRAIN_LABELS[hex.terrain]}
      />

      {/* Detail cards */}
      {(hasEncounter || hex.encounter?.defeated || hasFeature || hasQuest || hasDwelling) && (
        <div className="flex flex-col gap-1.5">
          {/* Encounter */}
          {hasEncounter && hex.encounter && (
            <div className="flex items-start gap-2 rounded-lg bg-stone-900/50 px-3 py-2">
              <Swords size={14} className="mt-0.5 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-200">
                    {hex.encounter.creature} &times;{hex.encounter.count}
                  </span>
                  <span className={`text-xs ${BEHAVIOR_LABELS[hex.encounter.behavior]?.color ?? "text-stone-400"}`}>
                    {BEHAVIOR_LABELS[hex.encounter.behavior]?.label ?? hex.encounter.behavior}
                  </span>
                </div>
                {hex.encounter.rumor && (
                  <p className="mt-0.5 text-xs text-stone-400 italic truncate">{hex.encounter.rumor}</p>
                )}
              </div>
            </div>
          )}

          {/* Defeated encounter */}
          {hex.encounter?.defeated && (
            <div className="flex items-center gap-2 rounded-lg bg-stone-900/50 px-3 py-2">
              <Skull size={14} className="shrink-0 text-stone-500" />
              <span className="text-sm text-stone-500 line-through">
                {hex.encounter.creature} &times;{hex.encounter.count}
              </span>
              <span className="text-xs text-stone-600">Defeated</span>
            </div>
          )}

          {/* Feature */}
          {hasFeature && hex.feature && (
            <div className="flex items-start gap-2 rounded-lg bg-stone-900/50 px-3 py-2">
              <Compass size={14} className={`mt-0.5 shrink-0 ${hex.feature.cleared ? "text-stone-500" : "text-amber-400"}`} />
              <div className="min-w-0 flex-1">
                <span className={`text-sm font-medium ${hex.feature.cleared ? "text-stone-500 line-through" : "text-stone-200"}`}>
                  {hex.feature.name}
                </span>
                {hex.feature.cleared && <span className="ml-1.5 text-xs text-stone-600">Cleared</span>}
                <p className="mt-0.5 text-xs text-stone-400 line-clamp-1">{hex.feature.description}</p>
              </div>
            </div>
          )}

          {/* Quest Object */}
          {hasQuest && hex.questObject && (
            <div className="flex items-start gap-2 rounded-lg bg-stone-900/50 px-3 py-2">
              <Scroll size={14} className="mt-0.5 shrink-0 text-purple-400" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-stone-200">{hex.questObject.name}</span>
                <p className="mt-0.5 text-xs text-stone-400 line-clamp-1">{hex.questObject.description}</p>
              </div>
            </div>
          )}

          {/* Dwelling */}
          {hasDwelling && dwelling && (
            <div className="flex items-start gap-2 rounded-lg bg-stone-900/50 px-3 py-2">
              <Home size={14} className="mt-0.5 shrink-0 text-emerald-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-200">{dwelling.name}</span>
                  <span className="text-xs text-stone-500">{DWELLING_LABELS[dwelling.type]}</span>
                </div>
                {dwelling.description && (
                  <p className="mt-0.5 text-xs text-stone-400 line-clamp-1">{dwelling.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
