import { RefreshCw, MapPin, Skull, Sparkles, Home } from "lucide-react";
import type { Dwelling, DwellingType, EncounterOverrides, Hex, TerrainType, Ruleset } from "~/models";
import type { RegenerationType } from "~/lib/hex-regenerate";
import { ImprovedEncounterTable } from "~/components/encounter-table/ImprovedEncounterTable";
import { RegenerateButton } from "./RegenerateButton";
import { getMonsterStats } from "~/lib/monster-stats";
import { MonsterCard } from "~/components/encounter-table/MonsterCard";

interface WildernessDetailProps {
  hex: Hex;
  dwelling?: Dwelling | null;
  worldId: string;
  ruleset: Ruleset;
  onRegenerate: (type: RegenerationType) => void;
  onReroll: () => void;
  onOverridesChange?: (overrides: EncounterOverrides) => void;
  seed: string;
}

const DWELLING_LABELS: Record<DwellingType, string> = {
  farmstead: "Farmstead",
  cottage: "Cottage",
  hermitage: "Hermitage",
  ranger_station: "Ranger Station",
  roadside_inn: "Roadside Inn",
};

const TERRAIN_COLORS: Record<TerrainType, string> = {
  plains: "bg-amber-600",
  forest: "bg-green-700",
  hills: "bg-orange-700",
  mountains: "bg-stone-600",
  water: "bg-blue-700",
  swamp: "bg-emerald-800",
};

const TERRAIN_DESCRIPTIONS: Record<TerrainType, string> = {
  plains:
    "Rolling grasslands stretch to the horizon. Wind ripples through tall grasses, hiding game trails and ancient stone markers.",
  forest:
    "Dense woodland blocks the sun. Ancient trees creak overhead, their canopy hiding whatever lurks in the shadows below.",
  hills:
    "Rugged slopes and rocky outcrops break the landscape. Hidden valleys and caves pockmark the terrain.",
  mountains:
    "Jagged peaks pierce the sky. Treacherous paths wind between sheer cliffs and snow-capped summits.",
  water:
    "Dark waters stretch before you. Reeds and mist obscure what lies beneath the surface.",
  swamp:
    "Murky wetlands choke the land. Stagnant pools, twisted trees, and the buzz of insects fill this fetid place.",
};

export function WildernessDetail({
  hex,
  dwelling,
  worldId,
  ruleset,
  onRegenerate,
  onReroll,
  onOverridesChange,
  seed,
}: WildernessDetailProps) {
  const { coord, terrain, feature, encounter, questObject, description, encounterOverrides, lastEncounterTimestamp } = hex;

  return (
    <div className="space-y-6 bg-stone-900 p-4 text-stone-100">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              Hex ({coord.q}, {coord.r})
            </h2>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${TERRAIN_COLORS[terrain]}`}
            >
              {terrain}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReroll}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-stone-400 hover:bg-stone-700 hover:text-stone-200"
              title="Re-roll hex content"
            >
              <RefreshCw size={14} />
            </button>
            <RegenerateButton
              onRegenerate={onRegenerate}
              currentLocationType="wilderness"
              defaultType={terrain}
            />
          </div>
        </div>
      </header>

      {/* Improved Encounter Table (includes First Impressions + Quick Names) */}
      <section className="space-y-3">
        <ImprovedEncounterTable
          seed={seed}
          terrain={terrain}
          ruleset={ruleset}
          overrides={encounterOverrides}
          onOverridesChange={onOverridesChange}
          onReroll={onReroll}
          lastEncounterTimestamp={lastEncounterTimestamp}
        />
      </section>

      {/* Feature */}
      {feature && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            <MapPin size={14} />
            Feature
          </h3>
          <div className="rounded-lg border border-stone-700 bg-stone-800 p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-200">{feature.name}</span>
              {feature.cleared && (
                <span className="rounded bg-stone-700 px-2 py-0.5 text-xs text-stone-400">
                  Cleared
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-stone-400">{feature.description}</p>
            {feature.treasure && feature.treasure.length > 0 && (
              <div className="mt-2 border-t border-stone-700 pt-2">
                <span className="text-xs text-stone-500">Treasure:</span>
                <ul className="mt-1 space-y-1">
                  {feature.treasure.map((t) => (
                    <li
                      key={t.id}
                      className={`text-sm ${t.looted ? "text-stone-500 line-through" : "text-amber-400"}`}
                    >
                      {t.name}
                      {t.value && ` (${t.value})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Encounter */}
      {encounter && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            <Skull size={14} />
            Encounter
          </h3>
          <div className="rounded-lg border border-stone-700 bg-stone-800 p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-200">
                {encounter.count}x {encounter.creature}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  encounter.behavior === "hostile"
                    ? "bg-red-900 text-red-300"
                    : encounter.behavior === "neutral"
                      ? "bg-stone-700 text-stone-300"
                      : "bg-amber-900 text-amber-300"
                }`}
              >
                {encounter.behavior}
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              {encounter.probability}% chance when entering
            </p>
            {encounter.rumor && (
              <p className="mt-2 text-sm italic text-stone-400">
                "{encounter.rumor}"
              </p>
            )}
            {encounter.defeated && (
              <span className="mt-2 inline-block rounded bg-stone-700 px-2 py-0.5 text-xs text-stone-400">
                Defeated
              </span>
            )}
          </div>
          {/* Monster Stats */}
          {(() => {
            const stats = getMonsterStats(encounter.creature, ruleset);
            return stats ? (
              <MonsterCard stats={stats} expanded />
            ) : null;
          })()}
        </section>
      )}

      {/* Quest Object */}
      {questObject && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            <Sparkles size={14} />
            Quest Object
          </h3>
          <div className="rounded-lg border border-stone-700 bg-stone-800 p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-200">
                {questObject.name}
              </span>
              <span className="rounded bg-stone-700 px-2 py-0.5 text-xs capitalize text-stone-400">
                {questObject.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-400">
              {questObject.description}
            </p>
            {questObject.found && (
              <span className="mt-2 inline-block rounded bg-green-900 px-2 py-0.5 text-xs text-green-300">
                Found
              </span>
            )}
          </div>
        </section>
      )}

      {/* Dwelling */}
      {dwelling && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            <Home size={14} />
            Dwelling
          </h3>
          <div className="rounded-lg border border-stone-700 bg-stone-800 p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-200">
                {dwelling.name}
              </span>
              <span className="rounded bg-stone-700 px-2 py-0.5 text-xs text-stone-400">
                {DWELLING_LABELS[dwelling.type]}
              </span>
            </div>
            {dwelling.description && (
              <p className="mt-1 text-sm text-stone-400">
                {dwelling.description}
              </p>
            )}
            {dwelling.hasQuest && (
              <span className="mt-2 inline-block rounded bg-amber-900 px-2 py-0.5 text-xs text-amber-300">
                Has Quest
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
