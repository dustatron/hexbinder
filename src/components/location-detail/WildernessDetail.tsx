import { MapPin, Sparkles, Home } from "lucide-react";
import type { Dwelling, DwellingType, EncounterOverrides, Hex, TerrainType, Ruleset } from "~/models";
import type { RegenerationType } from "~/lib/hex-regenerate";
import { ImprovedEncounterTable } from "~/components/encounter-table/ImprovedEncounterTable";
import { RegenerateButton } from "./RegenerateButton";

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
  const { coord, terrain, feature, questObject, encounterOverrides, lastEncounterTimestamp } = hex;

  return (
    <div className="space-y-6 bg-background p-4 text-foreground">
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
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <MapPin size={14} />
            Feature
          </h3>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{feature.name}</span>
              {feature.cleared && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Cleared
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            {feature.treasure && feature.treasure.length > 0 && (
              <div className="mt-2 border-t border-border pt-2">
                <span className="text-xs text-muted-foreground">Treasure:</span>
                <ul className="mt-1 space-y-1">
                  {feature.treasure.map((t) => (
                    <li
                      key={t.id}
                      className={`text-sm ${t.looted ? "text-muted-foreground line-through" : "text-amber-600 dark:text-amber-400"}`}
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

      {/* Quest Object */}
      {questObject && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles size={14} />
            Quest Object
          </h3>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {questObject.name}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                {questObject.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {questObject.description}
            </p>
            {questObject.found && (
              <span className="mt-2 inline-block rounded bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs text-green-700 dark:text-green-300">
                Found
              </span>
            )}
          </div>
        </section>
      )}

      {/* Dwelling */}
      {dwelling && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Home size={14} />
            Dwelling
          </h3>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {dwelling.name}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {DWELLING_LABELS[dwelling.type]}
              </span>
            </div>
            {dwelling.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {dwelling.description}
              </p>
            )}
            {dwelling.hasQuest && (
              <span className="mt-2 inline-block rounded bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                Has Quest
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
