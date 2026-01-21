import { useState } from "react";
import { RefreshCw, Shuffle } from "lucide-react";
import { nanoid } from "nanoid";
import type { RegenerationType, RegenerateOptions } from "~/lib/hex-regenerate";
import type { DungeonSize } from "~/models";
import { Button } from "~/components/ui/button";

interface RegenerateButtonProps {
  onRegenerate: (type: RegenerationType, options?: RegenerateOptions) => void;
  currentLocationType?: "settlement" | "dungeon" | "wilderness" | null;
  /** The specific type to default the selector to (e.g., "town", "village", "tomb") */
  defaultType?: RegenerationType;
  /** Current size for dungeons */
  currentSize?: DungeonSize;
  /** Current seed */
  currentSeed?: string;
}

const REGENERATE_OPTIONS: {
  group: string;
  options: { value: RegenerationType; label: string }[];
}[] = [
  {
    group: "General",
    options: [
      { value: "random", label: "Random" },
      { value: "clear", label: "Clear (Empty Hex)" },
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
    group: "Settlements",
    options: [
      { value: "thorpe", label: "Thorpe" },
      { value: "hamlet", label: "Hamlet" },
      { value: "village", label: "Village" },
      { value: "town", label: "Town" },
      { value: "city", label: "City" },
    ],
  },
  {
    group: "Terrain (Wilderness)",
    options: [
      { value: "plains", label: "Plains" },
      { value: "forest", label: "Forest" },
      { value: "hills", label: "Hills" },
      { value: "mountains", label: "Mountains" },
      { value: "water", label: "Water" },
      { value: "swamp", label: "Swamp" },
    ],
  },
];

const SIZE_OPTIONS: { value: DungeonSize; label: string; description: string }[] = [
  { value: "lair", label: "Lair", description: "3-5 rooms" },
  { value: "small", label: "Small", description: "5-8 rooms" },
  { value: "medium", label: "Medium", description: "8-12 rooms" },
  { value: "large", label: "Large", description: "12-20 rooms" },
  { value: "megadungeon", label: "Mega", description: "20-30 rooms" },
];

// Types that support dungeon size selection
const DUNGEON_TYPES = [
  "tomb", "cave", "temple", "shrine", "mine", "fortress", "sewer", "crypt",
  "witch_hut", "bandit_hideout", "cultist_lair", "beast_den", "sea_cave", "floating_keep",
];

export function RegenerateButton({
  onRegenerate,
  currentLocationType,
  defaultType,
  currentSize = "small",
  currentSeed = "",
}: RegenerateButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<RegenerationType>(defaultType ?? "random");
  const [selectedSize, setSelectedSize] = useState<DungeonSize>(currentSize);
  const [customSeed, setCustomSeed] = useState(currentSeed);

  const isDungeonType = DUNGEON_TYPES.includes(selectedType);

  const handleOpenModal = () => {
    // Reset to current values when opening
    setSelectedType(defaultType ?? "random");
    setSelectedSize(currentSize);
    setCustomSeed(currentSeed || `seed-${nanoid(8)}`);
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    onRegenerate(selectedType, {
      dungeonSize: isDungeonType ? selectedSize : undefined,
      customSeed: customSeed || undefined,
    });
  };

  const handleRandomizeSeed = () => {
    setCustomSeed(`seed-${nanoid(8)}`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenModal}
        className="border-border bg-card text-foreground hover:bg-muted"
      >
        <RefreshCw size={14} className="mr-1.5" />
        Regenerate
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center gap-2">
              <RefreshCw size={18} className="text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Regenerate Location</h3>
            </div>

            {currentLocationType && (
              <p className="mb-4 text-sm text-amber-400/80">
                ⚠️ Current {currentLocationType} will be replaced
              </p>
            )}

            {/* Type selector */}
            <div className="mb-4 space-y-2">
              <label className="text-sm font-medium text-foreground">Location Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as RegenerationType)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-amber-600 focus:outline-none"
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
            </div>

            {/* Size selector (only for dungeon types) */}
            {isDungeonType && (
              <div className="mb-4 space-y-2">
                <label className="text-sm font-medium text-foreground">Dungeon Size</label>
                <div className="grid grid-cols-5 gap-1">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedSize(option.value)}
                      className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                        selectedSize === option.value
                          ? "border-amber-600 bg-amber-900/30 text-amber-700 dark:text-amber-200"
                          : "border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"
                      }`}
                      title={option.description}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {SIZE_OPTIONS.find(o => o.value === selectedSize)?.description}
                </p>
              </div>
            )}

            {/* Seed input */}
            <div className="mb-4 space-y-2">
              <label className="text-sm font-medium text-foreground">Generation Seed</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSeed}
                  onChange={(e) => setCustomSeed(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-amber-600 focus:outline-none"
                  placeholder="Enter custom seed..."
                />
                <button
                  onClick={handleRandomizeSeed}
                  className="rounded-md border border-border bg-card px-2 py-1.5 text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
                  title="Randomize seed"
                >
                  <Shuffle size={16} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Same seed + type = same result
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleConfirm}
                className={selectedType === "clear" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}
              >
                <RefreshCw size={14} className="mr-1.5" />
                {selectedType === "clear" ? "Clear Hex" : "Regenerate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
