import { useMemo, useState, useCallback } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import type { EncounterOverrides, EncounterType, Reaction, Ruleset, TerrainType } from "~/models";
import {
  generateImprovedEncounter,
  type ImprovedEncounterResult,
} from "~/generators/EncounterGenerator";
import {
  MASTER_TABLE,
  REACTION_TABLE,
  SIGN_TABLE,
  ENVIRONMENT_TABLE,
  AREA_EFFECT_TABLE,
  getLossTableForTerrain,
} from "~/data/encounters/tables";
import { getCreaturesForTerrain } from "~/data/encounters/creatures";
import { FirstImpressions } from "./FirstImpressions";
import { QuickNames } from "./QuickNames";
import { NPCStatLine } from "~/components/npc/NPCStatLine";
import { getMonsterStatsBySlug, generateFallbackStats } from "~/lib/monster-stats";
import { MonsterCard } from "./MonsterCard";

interface ImprovedEncounterTableProps {
  seed: string;
  terrain: TerrainType;
  ruleset: Ruleset;
  overrides?: EncounterOverrides;
  onOverridesChange?: (overrides: EncounterOverrides) => void;
  onReroll?: () => void;
  lastEncounterTimestamp?: number;
}

export function ImprovedEncounterTable({
  seed,
  terrain,
  ruleset,
  overrides,
  onOverridesChange,
  onReroll,
  lastEncounterTimestamp,
}: ImprovedEncounterTableProps) {
  // Track local override state if no callback provided
  const [localOverrides, setLocalOverrides] = useState<EncounterOverrides>({});
  const effectiveOverrides = overrides ?? localOverrides;

  const setOverrides = useCallback(
    (newOverrides: EncounterOverrides) => {
      if (onOverridesChange) {
        onOverridesChange(newOverrides);
      } else {
        setLocalOverrides(newOverrides);
      }
    },
    [onOverridesChange]
  );

  // Generate encounter result
  const result = useMemo(() => {
    return generateImprovedEncounter({
      seed,
      terrain,
      overrides: effectiveOverrides,
    });
  }, [seed, terrain, effectiveOverrides]);

  // Get creature list for terrain
  const creatures = useMemo(() => getCreaturesForTerrain(terrain), [terrain]);

  // Handlers for selection
  const handleMasterSelect = (index: number) => {
    setOverrides({ ...effectiveOverrides, masterIndex: index });
  };

  const handleCreatureSelect = (index: number) => {
    setOverrides({ ...effectiveOverrides, creatureIndex: index });
  };

  const handleReactionSelect = (index: number) => {
    setOverrides({ ...effectiveOverrides, reactionIndex: index });
  };

  const handleRerollAll = () => {
    setOverrides({});
    onReroll?.();
  };

  const handleRerollMaster = () => {
    const newOverrides = { ...effectiveOverrides };
    delete newOverrides.masterIndex;
    delete newOverrides.creatureIndex;
    delete newOverrides.reactionIndex;
    delete newOverrides.subTableIndex;
    setOverrides(newOverrides);
  };

  const handleRerollCreature = () => {
    // Pick a new random creature index, different from current
    const currentIndex = effectiveOverrides.creatureIndex ?? 0;
    let newIndex = Math.floor(Math.random() * creatures.length);
    while (newIndex === currentIndex && creatures.length > 1) {
      newIndex = Math.floor(Math.random() * creatures.length);
    }
    setOverrides({ ...effectiveOverrides, creatureIndex: newIndex });
  };

  const handleRerollReaction = () => {
    // Pick a new random reaction index (0-4), different from current
    const currentIndex = result.reactionIndex ?? 0;
    let newIndex = Math.floor(Math.random() * 5);
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * 5);
    }
    setOverrides({ ...effectiveOverrides, reactionIndex: newIndex });
  };

  const handleRerollSubTable = () => {
    // Get table length based on encounter type
    let tableLength = 8;
    switch (result.encounterType) {
      case "sign": tableLength = SIGN_TABLE.length; break;
      case "environment": tableLength = ENVIRONMENT_TABLE.length; break;
      case "loss": tableLength = getLossTableForTerrain(terrain).length; break;
      case "area-effect": tableLength = AREA_EFFECT_TABLE.length; break;
    }

    // Pick a new random index, different from current
    const currentIndex = effectiveOverrides.subTableIndex ?? 0;
    let newIndex = Math.floor(Math.random() * tableLength);
    while (newIndex === currentIndex && tableLength > 1) {
      newIndex = Math.floor(Math.random() * tableLength);
    }
    setOverrides({ ...effectiveOverrides, subTableIndex: newIndex });
  };

  // Build summary text
  const summaryText = buildSummaryText(result);

  return (
    <div className="space-y-4">
      {/* First Impressions */}
      <FirstImpressions
        sight={result.impressions.sight}
        sound={result.impressions.sound}
        smell={result.impressions.smell}
        terrainLabel={terrain.charAt(0).toUpperCase() + terrain.slice(1)}
      />

      {/* Main content grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        {/* Left column: Tables */}
        <div className="space-y-3">
          {/* Summary Banner */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="font-medium text-amber-200">{summaryText}</span>
                {result.hasOverrides && (
                  <span className="text-xs text-stone-500">(GM override)</span>
                )}
              </div>
              <button
                onClick={handleRerollAll}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-stone-400 hover:bg-stone-700 hover:text-stone-200"
                title="Re-roll everything"
              >
                <RefreshCw size={12} />
                Re-roll All
              </button>
            </div>
            {lastEncounterTimestamp && (
              <p className="mt-1 text-xs text-stone-500">
                Last rolled: {formatTimestamp(lastEncounterTimestamp)}
              </p>
            )}
          </div>

          {/* Master Table (1d6) */}
          <TableSection
            title="Master Table"
            diceLabel="1d6"
            onReroll={handleRerollMaster}
          >
            {MASTER_TABLE.map((entry, index) => {
              const isRolled = index === result.masterRoll - 1;
              const isSelected = index === result.masterIndex;

              return (
                <TableRow
                  key={entry.roll}
                  label={`${entry.roll}. ${entry.label}`}
                  isRolled={isRolled}
                  isSelected={isSelected}
                  onClick={() => handleMasterSelect(index)}
                />
              );
            })}
          </TableSection>

          {/* Creature Table (conditional) */}
          {result.encounterType === "creature" && (
            <TableSection
              title={`Creature: ${terrain.charAt(0).toUpperCase() + terrain.slice(1)}`}
              diceLabel="weighted"
              onReroll={handleRerollCreature}
            >
              {creatures.map((creature, index) => {
                const isSelected =
                  result.creature?.entry.name === creature.name;

                return (
                  <TableRow
                    key={creature.slug}
                    label={creature.name}
                    sublabel={`Lv${creature.level}`}
                    isRolled={false}
                    isSelected={isSelected}
                    onClick={() => handleCreatureSelect(index)}
                  />
                );
              })}
            </TableSection>
          )}

          {/* Reaction Table (for creature/npc) */}
          {(result.encounterType === "creature" ||
            result.encounterType === "npc") && (
            <TableSection
              title="Reaction"
              diceLabel="1d10"
              onReroll={handleRerollReaction}
            >
              {REACTION_TABLE.map((entry, index) => {
                const isSelected = index === result.reactionIndex;
                const rollRange =
                  entry.minRoll === entry.maxRoll
                    ? `${entry.minRoll}`
                    : `${entry.minRoll}-${entry.maxRoll}`;

                return (
                  <TableRow
                    key={entry.reaction}
                    label={`${rollRange}: ${entry.label}`}
                    isRolled={false}
                    isSelected={isSelected}
                    onClick={() => handleReactionSelect(index)}
                  />
                );
              })}
            </TableSection>
          )}

          {/* Result Detail */}
          <ResultDetail result={result} ruleset={ruleset} onRerollSubTable={handleRerollSubTable} />
        </div>

        {/* Right column: Quick Names */}
        <div className="hidden lg:block">
          <QuickNames seed={seed} />
        </div>
      </div>

      {/* Mobile: Quick Names below */}
      <div className="lg:hidden">
        <QuickNames seed={seed} />
      </div>
    </div>
  );
}

// === Sub-components ===

interface TableSectionProps {
  title: string;
  diceLabel: string;
  onReroll: () => void;
  children: React.ReactNode;
}

function TableSection({
  title,
  diceLabel,
  onReroll,
  children,
}: TableSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-700">
      <div className="flex items-center justify-between border-b border-stone-700 bg-stone-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-200">{title}</span>
          <span className="rounded bg-stone-700 px-1.5 py-0.5 text-xs text-stone-400">
            {diceLabel}
          </span>
        </div>
        <button
          onClick={onReroll}
          className="rounded p-1 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
          title="Re-roll this table"
        >
          <RefreshCw size={12} />
        </button>
      </div>
      <div className="divide-y divide-stone-700/50">{children}</div>
    </div>
  );
}

interface TableRowProps {
  label: string;
  sublabel?: string;
  isRolled: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function TableRow({
  label,
  sublabel,
  isRolled,
  isSelected,
  onClick,
}: TableRowProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
        isSelected
          ? "bg-amber-500/20 text-amber-200"
          : "text-stone-300 hover:bg-stone-700/50"
      }`}
    >
      <span className="flex items-center gap-2">
        {label}
        {isRolled && !isSelected && (
          <span className="text-xs text-stone-500">(rolled)</span>
        )}
      </span>
      {sublabel && (
        <span className="text-xs text-stone-500">{sublabel}</span>
      )}
      {isSelected && (
        <span className="text-xs text-amber-400">←</span>
      )}
    </button>
  );
}

interface ResultDetailProps {
  result: ImprovedEncounterResult;
  ruleset: Ruleset;
  onRerollSubTable?: () => void;
}

function ResultDetail({ result, ruleset, onRerollSubTable }: ResultDetailProps) {
  const { encounterType } = result;

  // Sub-table types that can be re-rolled
  const canReroll = ["sign", "environment", "loss", "area-effect"].includes(encounterType);

  return (
    <div className="rounded-lg border border-stone-600 bg-stone-700/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded bg-amber-500/30 px-2 py-0.5 text-xs font-medium uppercase text-amber-300">
          {encounterType.replace("-", " ")}
        </span>
        {canReroll && onRerollSubTable && (
          <button
            onClick={onRerollSubTable}
            className="rounded p-1 text-stone-400 hover:bg-stone-600 hover:text-stone-200"
            title="Re-roll this result"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>

      {encounterType === "creature" && result.creature && (
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-stone-200">
              {result.creature.count}x {result.creature.entry.name}
            </p>
            <p className="text-stone-400">
              Level {result.creature.entry.level} • Reaction:{" "}
              <span className={getReactionColor(result.reaction)}>
                {result.reaction}
              </span>
            </p>
          </div>
          {(() => {
            const stats = getMonsterStatsBySlug(result.creature.entry.slug, ruleset)
              ?? generateFallbackStats(result.creature.entry.name, result.creature.entry.level, ruleset);
            return <MonsterCard stats={stats} count={result.creature.count} expanded />;
          })()}
        </div>
      )}

      {encounterType === "npc" && result.npc && (
        <div className="space-y-2 text-sm">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-stone-200">
                {result.npc.name}
                {result.npc.age && (
                  <span className="ml-1 text-xs text-stone-500">
                    ({result.npc.age} yrs)
                  </span>
                )}
              </h4>
              <p className="text-xs text-stone-500 capitalize">
                {result.npc.race} • {result.npc.gender} • {result.npc.archetype.replace("_", " ")}
              </p>
              <NPCStatLine archetype={result.npc.archetype} />
            </div>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${getReactionColor(result.reaction)} bg-stone-700/50`}>
              {result.reaction}
            </span>
          </div>
          <p className="text-stone-400">{result.npc.description}</p>
          {result.npc.flavorWant && (
            <p className="text-xs text-amber-400/80">
              <span className="font-medium">Wants:</span> {result.npc.flavorWant}
            </p>
          )}
        </div>
      )}

      {encounterType === "sign" && result.sign && (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-stone-200">{result.sign.text}</p>
          <p className="text-stone-400 italic">{result.sign.detail}</p>
        </div>
      )}

      {encounterType === "environment" && result.environment && (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-stone-200">
            {result.environment.text}
            {result.environment.magical && (
              <span className="ml-2 text-purple-400">✨ Magical</span>
            )}
          </p>
          <p className="text-stone-400 italic">{result.environment.effect}</p>
        </div>
      )}

      {encounterType === "loss" && result.loss && (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-stone-200">{result.loss.text}</p>
          <p className="text-stone-400 italic">{result.loss.effect}</p>
        </div>
      )}

      {encounterType === "area-effect" && result.areaEffect && (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-stone-200">
            {result.areaEffect.text}
            {result.areaEffect.magical && (
              <span className="ml-2 text-purple-400">✨ Magic Item</span>
            )}
          </p>
          <p className="text-stone-400 italic">{result.areaEffect.effect}</p>
        </div>
      )}
    </div>
  );
}

// === Helpers ===

function buildSummaryText(result: ImprovedEncounterResult): string {
  const { encounterType } = result;

  switch (encounterType) {
    case "creature":
      if (result.creature) {
        return `${result.creature.count}x ${result.creature.entry.name} - ${result.reaction}`;
      }
      return "Creature encounter";

    case "npc":
      if (result.npc) {
        return `${result.npc.name} (${result.npc.archetype}) - ${result.reaction}`;
      }
      return `NPC - ${result.reaction}`;

    case "sign":
      return result.sign?.text ?? "Sign/Omen";

    case "environment":
      return result.environment?.text ?? "Environment change";

    case "loss":
      return result.loss?.text ?? "Resource loss";

    case "area-effect":
      return result.areaEffect?.text ?? "Area effect";

    default:
      return "Encounter";
  }
}

function getReactionColor(reaction?: Reaction): string {
  switch (reaction) {
    case "hostile":
      return "text-red-400";
    case "wary":
      return "text-orange-400";
    case "curious":
      return "text-yellow-400";
    case "friendly":
      return "text-green-400";
    case "helpful":
      return "text-emerald-400";
    default:
      return "text-stone-400";
  }
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
