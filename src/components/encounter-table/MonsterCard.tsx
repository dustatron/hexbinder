import type { Monster } from "~/lib/monsters";

interface MonsterCardProps {
  monster: Monster;
  expanded?: boolean;
}

export function MonsterCard({ monster, expanded = false }: MonsterCardProps) {
  // Parse attacks string to get primary attack for compact view
  // Format: "1 bite (+5) 1d8" or "2 claws (+3) 1d6, 1 bite (+5) 1d10"
  const primaryAttack = monster.attacks.split(",")[0]?.trim() ?? monster.attacks;

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800 p-3 text-stone-100">
      {/* Header: Name + Level */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">{monster.name}</span>
        <span className="rounded bg-stone-700 px-2 py-0.5 text-xs font-medium">
          LV {monster.level}
        </span>
      </div>

      {/* Compact stats */}
      <div className="mt-1 text-sm text-stone-300">
        <span>AC {monster.armor_class}</span>
        <span className="mx-2">|</span>
        <span>HP {monster.hit_points}</span>
      </div>

      {/* Primary attack (always shown) */}
      <div className="mt-1 text-sm text-stone-400">{primaryAttack}</div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 border-t border-stone-700 pt-3">
          {/* All attacks */}
          <div className="mb-2">
            <span className="text-xs font-medium uppercase text-stone-500">
              Attacks
            </span>
            <div className="text-sm text-stone-300">{monster.attacks}</div>
          </div>

          {/* Movement */}
          <div className="mb-2">
            <span className="text-xs font-medium uppercase text-stone-500">
              Movement
            </span>
            <div className="text-sm text-stone-300">{monster.movement}</div>
          </div>

          {/* Traits */}
          {monster.traits.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium uppercase text-stone-500">
                Traits
              </span>
              <div className="space-y-1">
                {monster.traits.map((trait) => (
                  <div key={trait.name} className="text-sm">
                    <span className="font-medium text-stone-200">
                      {trait.name}.
                    </span>{" "}
                    <span className="text-stone-400">{trait.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {monster.description && (
            <div>
              <span className="text-xs font-medium uppercase text-stone-500">
                Description
              </span>
              <p className="text-sm italic text-stone-400">
                {monster.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
