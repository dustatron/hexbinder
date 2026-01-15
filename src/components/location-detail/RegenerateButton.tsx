import { useState } from "react";
import type { RegenerationType } from "~/lib/hex-regenerate";
import { Button } from "~/components/ui/button";

interface RegenerateButtonProps {
  onRegenerate: (type: RegenerationType) => void;
  currentLocationType?: "settlement" | "dungeon" | "wilderness" | null;
  /** The specific type to default the selector to (e.g., "town", "village", "tomb") */
  defaultType?: RegenerationType;
}

const REGENERATE_OPTIONS: {
  group: string;
  options: { value: RegenerationType; label: string }[];
}[] = [
  {
    group: "General",
    options: [
      { value: "random", label: "Random" },
      { value: "clear", label: "Clear" },
    ],
  },
  {
    group: "Terrain (Keep Wilderness)",
    options: [
      { value: "plains", label: "Plains" },
      { value: "forest", label: "Forest" },
      { value: "hills", label: "Hills" },
      { value: "mountains", label: "Mountains" },
      { value: "water", label: "Water" },
      { value: "swamp", label: "Swamp" },
    ],
  },
  {
    group: "Wilderness Lairs",
    options: [
      { value: "witch_hut", label: "Witch Hut" },
      { value: "bandit_hideout", label: "Bandit Hideout" },
      { value: "cultist_lair", label: "Cultist Lair" },
      { value: "beast_den", label: "Beast Den" },
      { value: "sea_cave", label: "Sea Cave" },
      { value: "floating_keep", label: "Floating Keep" },
    ],
  },
  {
    group: "Dungeons",
    options: [
      { value: "tomb", label: "Tomb" },
      { value: "cave", label: "Cave" },
      { value: "temple", label: "Temple" },
      { value: "shrine", label: "Shrine" },
      { value: "mine", label: "Mine" },
      { value: "fortress", label: "Fortress" },
      { value: "sewer", label: "Sewer" },
      { value: "crypt", label: "Crypt" },
    ],
  },
  {
    group: "Settlements",
    options: [
      { value: "thorpe", label: "Thorpe" },
      { value: "hamlet", label: "Hamlet" },
      { value: "village", label: "Village" },
      { value: "town", label: "Town" },
      { value: "city", label: "City" },
    ],
  },
];

export function RegenerateButton({
  onRegenerate,
  currentLocationType,
  defaultType,
}: RegenerateButtonProps) {
  const [selected, setSelected] = useState<RegenerationType>(defaultType ?? "random");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegenerate = () => {
    if (currentLocationType) {
      setShowConfirm(true);
    } else {
      onRegenerate(selected);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onRegenerate(selected);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as RegenerationType)}
        className="h-8 rounded-md border border-stone-700 bg-stone-800 px-2 text-sm text-stone-200 focus:border-stone-500 focus:outline-none"
      >
        {REGENERATE_OPTIONS.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerate}
        className="border-stone-600 bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-stone-100"
      >
        Regenerate
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border border-stone-700 bg-stone-900 p-4 shadow-lg">
            <p className="mb-4 text-sm text-stone-200">
              Regenerate this hex? Current location will be replaced.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
