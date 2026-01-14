import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { SeededRandom } from "~/generators/SeededRandom";
import { getRandomMonster, type Monster } from "~/lib/monsters";
import type { TerrainType } from "~/models";
import {
  ENCOUNTER_TABLE,
  NPC_TABLE,
  TREASURE_TABLE,
  OMEN_TABLE,
  type EncounterResultType,
  type TableEntry,
} from "./tables";
import { MonsterCard } from "./MonsterCard";

interface EncounterTableProps {
  seed: string;
  terrain?: TerrainType;
  onReroll?: () => void;
}

interface SubTableResult {
  type: EncounterResultType;
  entry?: TableEntry;
  monster?: Monster;
}

function rollSubTable(
  rng: SeededRandom,
  type: EncounterResultType,
  terrain?: TerrainType
): SubTableResult {
  switch (type) {
    case "monster": {
      const monster = getRandomMonster(rng);
      return { type, monster };
    }
    case "npc": {
      const entry = pickWeightedEntry(rng, NPC_TABLE);
      return { type, entry };
    }
    case "treasure": {
      const entry = pickWeightedEntry(rng, TREASURE_TABLE);
      return { type, entry };
    }
    case "omen": {
      const entry = pickWeightedEntry(rng, OMEN_TABLE);
      return { type, entry };
    }
    case "nothing":
    default:
      return { type };
  }
}

function pickWeightedEntry(rng: SeededRandom, table: TableEntry[]): TableEntry {
  const totalWeight = table.reduce((sum, e) => sum + (e.weight ?? 1), 0);
  let roll = rng.next() * totalWeight;

  for (const entry of table) {
    roll -= entry.weight ?? 1;
    if (roll <= 0) return entry;
  }

  return table[table.length - 1];
}

export function EncounterTable({ seed, terrain, onReroll }: EncounterTableProps) {
  // Initial seeded roll
  const initialRoll = useMemo(() => {
    const rng = new SeededRandom(seed);
    return rng.between(1, 6);
  }, [seed]);

  const [selectedRoll, setSelectedRoll] = useState(initialRoll);

  // Sub-table result based on selected roll
  const subTableResult = useMemo(() => {
    const entry = ENCOUNTER_TABLE.find((e) => e.roll === selectedRoll);
    if (!entry) return { type: "nothing" as EncounterResultType };

    const rng = new SeededRandom(`${seed}-subtable-${selectedRoll}`);
    return rollSubTable(rng, entry.type, terrain);
  }, [seed, selectedRoll, terrain]);

  const selectedEntry = ENCOUNTER_TABLE.find((e) => e.roll === selectedRoll);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-200">Encounter Table</h3>
        {onReroll && (
          <button
            onClick={onReroll}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-stone-400 hover:bg-stone-700 hover:text-stone-200"
          >
            <RefreshCw size={12} />
            Re-roll
          </button>
        )}
      </div>

      {/* 1d6 Table */}
      <div className="overflow-hidden rounded-lg border border-stone-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-700 bg-stone-800">
              <th className="px-3 py-2 text-left text-xs font-medium text-stone-400">
                d6
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-stone-400">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {ENCOUNTER_TABLE.map((entry) => {
              const isSelected = entry.roll === selectedRoll;
              const isRolled = entry.roll === initialRoll;

              return (
                <tr
                  key={entry.roll}
                  onClick={() => setSelectedRoll(entry.roll)}
                  className={`cursor-pointer border-b border-stone-700/50 last:border-0 transition-colors ${
                    isSelected
                      ? "bg-amber-500/20"
                      : "hover:bg-stone-700/50"
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-stone-300">
                    {entry.roll}
                    {isRolled && (
                      <span className="ml-1 text-amber-400">*</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-stone-200">{entry.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rolled Result Display */}
      {selectedEntry && (
        <div className="rounded-lg border border-stone-600 bg-stone-700/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-300">
              {selectedEntry.label}
            </span>
            {selectedRoll !== initialRoll && (
              <span className="text-xs text-stone-500">(GM override)</span>
            )}
          </div>

          {subTableResult.type === "nothing" && (
            <p className="text-sm text-stone-400 italic">
              The party travels without incident.
            </p>
          )}

          {subTableResult.entry && (
            <p className="text-sm text-stone-200">
              {subTableResult.entry.description}
            </p>
          )}

          {subTableResult.monster && (
            <MonsterCard monster={subTableResult.monster} />
          )}
        </div>
      )}
    </div>
  );
}
