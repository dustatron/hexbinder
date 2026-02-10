import { useCallback } from "react";
import { MapPin, Sparkles, Home } from "lucide-react";
import type { Dwelling, DwellingType, EncounterOverrides, Hex, HexFeature, QuestObject, TerrainType, Ruleset, WorldData } from "~/models";
import { ImprovedEncounterTable } from "~/components/encounter-table/ImprovedEncounterTable";
import { InlineEditText } from "~/components/ui/inline-edit";

interface WildernessDetailProps {
  hex: Hex;
  dwelling?: Dwelling | null;
  worldId: string;
  ruleset: Ruleset;
  onReroll: () => void;
  onOverridesChange?: (overrides: EncounterOverrides) => void;
  onUpdateWorld?: (updater: (world: WorldData) => WorldData) => void;
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
  desert: "bg-amber-700",
};

export function WildernessDetail({
  hex,
  dwelling,
  worldId,
  ruleset,
  onReroll,
  onOverridesChange,
  onUpdateWorld,
  seed,
}: WildernessDetailProps) {
  const { coord, terrain, feature, questObject, encounterOverrides, lastEncounterTimestamp } = hex;

  const updateHex = useCallback(
    <K extends keyof Hex>(field: K, value: Hex[K]) => {
      onUpdateWorld?.((world) => ({
        ...world,
        hexes: world.hexes.map((h) =>
          h.coord.q === coord.q && h.coord.r === coord.r
            ? { ...h, [field]: value }
            : h,
        ),
      }));
    },
    [onUpdateWorld, coord.q, coord.r],
  );

  const updateFeature = useCallback(
    (field: keyof HexFeature, value: string) => {
      if (!feature) return;
      updateHex("feature", { ...feature, [field]: value });
    },
    [feature, updateHex],
  );

  const updateQuestObject = useCallback(
    (field: keyof QuestObject, value: string) => {
      if (!questObject) return;
      updateHex("questObject", { ...questObject, [field]: value });
    },
    [questObject, updateHex],
  );

  const updateDwelling = useCallback(
    (field: keyof Dwelling, value: string) => {
      if (!dwelling) return;
      onUpdateWorld?.((world) => ({
        ...world,
        dwellings: world.dwellings.map((d) =>
          d.id === dwelling.id ? { ...d, [field]: value } : d,
        ),
      }));
    },
    [dwelling, onUpdateWorld],
  );

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
              <InlineEditText
                value={feature.name}
                onSave={(v) => updateFeature("name", v)}
                className="font-medium text-stone-200"
              />
              {feature.cleared && (
                <span className="rounded bg-stone-700 px-2 py-0.5 text-xs text-stone-400">
                  Cleared
                </span>
              )}
            </div>
            <InlineEditText
              value={feature.description}
              onSave={(v) => updateFeature("description", v)}
              as="p"
              multiline
              className="mt-1 text-sm text-stone-400"
            />
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

      {/* Quest Object */}
      {questObject && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            <Sparkles size={14} />
            Quest Object
          </h3>
          <div className="rounded-lg border border-stone-700 bg-stone-800 p-3">
            <div className="flex items-center justify-between">
              <InlineEditText
                value={questObject.name}
                onSave={(v) => updateQuestObject("name", v)}
                className="font-medium text-stone-200"
              />
              <span className="rounded bg-stone-700 px-2 py-0.5 text-xs capitalize text-stone-400">
                {questObject.type}
              </span>
            </div>
            <InlineEditText
              value={questObject.description}
              onSave={(v) => updateQuestObject("description", v)}
              as="p"
              multiline
              className="mt-1 text-sm text-stone-400"
            />
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
              <InlineEditText
                value={dwelling.name}
                onSave={(v) => updateDwelling("name", v)}
                className="font-medium text-stone-200"
              />
              <span className="rounded bg-stone-700 px-2 py-0.5 text-xs text-stone-400">
                {DWELLING_LABELS[dwelling.type]}
              </span>
            </div>
            {dwelling.description && (
              <InlineEditText
                value={dwelling.description}
                onSave={(v) => updateDwelling("description", v)}
                as="p"
                multiline
                className="mt-1 text-sm text-stone-400"
              />
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
