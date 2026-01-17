import type { MonsterStats } from "~/lib/monster-stats";

interface MonsterCardProps {
  stats: MonsterStats;
  expanded?: boolean;
  count?: number;
}

export function MonsterCard({ stats, expanded = false, count }: MonsterCardProps) {
  // Parse attacks string to get primary attack for compact view
  const primaryAttack = stats.attack.split(",")[0]?.trim() ?? stats.attack;

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800 p-3 text-stone-100">
      {/* Header: Name + Level/Count */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">
          {count && count > 1 ? `${count}x ` : ""}{stats.name}
        </span>
        <div className="flex items-center gap-2">
          {stats.shadowdark && (
            <span className="rounded bg-stone-700 px-2 py-0.5 text-xs font-medium">
              LV {stats.shadowdark.level}
            </span>
          )}
          <span className="rounded bg-purple-700/50 px-2 py-0.5 text-xs font-medium capitalize text-purple-200">
            {stats.ruleset}
          </span>
        </div>
      </div>

      {/* Compact stats */}
      <div className="mt-1 text-sm text-stone-300">
        <span>{stats.defenseLabel} {stats.defense}</span>
        <span className="mx-2">|</span>
        <span>HP {stats.hp}</span>
      </div>

      {/* Primary attack (always shown) */}
      <div className="mt-1 text-sm text-stone-400">{primaryAttack}</div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 border-t border-stone-700 pt-3">
          {/* Full attack line */}
          <div className="mb-2">
            <span className="text-xs font-medium uppercase text-stone-500">
              Attacks
            </span>
            <div className="text-sm text-stone-300">{stats.attack}</div>
          </div>

          {/* Shadowdark-specific fields */}
          {stats.shadowdark && (
            <>
              {/* Movement */}
              <div className="mb-2">
                <span className="text-xs font-medium uppercase text-stone-500">
                  Movement
                </span>
                <div className="text-sm text-stone-300">{stats.shadowdark.movement}</div>
              </div>

              {/* Ability Modifiers */}
              <div className="mb-2">
                <span className="text-xs font-medium uppercase text-stone-500">
                  Abilities
                </span>
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  {Object.entries(stats.shadowdark.abilities).map(([ability, mod]) => (
                    <span key={ability} className="rounded bg-stone-700 px-2 py-0.5">
                      {ability} {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div className="mb-2">
                <span className="text-xs font-medium uppercase text-stone-500">
                  Alignment
                </span>
                <div className="text-sm text-stone-300">{stats.shadowdark.alignment}</div>
              </div>

              {/* Traits */}
              {stats.shadowdark.traits.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium uppercase text-stone-500">
                    Traits
                  </span>
                  <div className="space-y-1">
                    {stats.shadowdark.traits.map((trait) => (
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
            </>
          )}

          {/* Cairn-specific fields */}
          {stats.cairn && (
            <>
              {/* Ability Scores (Cairn uses full scores, not modifiers) */}
              <div className="mb-2">
                <span className="text-xs font-medium uppercase text-stone-500">
                  Abilities
                </span>
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  <span className="rounded bg-stone-700 px-2 py-0.5">
                    STR {stats.cairn.abilities.STR}
                  </span>
                  <span className="rounded bg-stone-700 px-2 py-0.5">
                    DEX {stats.cairn.abilities.DEX}
                  </span>
                  <span className="rounded bg-stone-700 px-2 py-0.5">
                    WIL {stats.cairn.abilities.WIL}
                  </span>
                </div>
              </div>

              {/* Details (special abilities, behaviors) */}
              {stats.cairn.details.length > 1 && (
                <div className="mb-2">
                  <span className="text-xs font-medium uppercase text-stone-500">
                    Special
                  </span>
                  <div className="space-y-1">
                    {stats.cairn.details.slice(1).map((detail, i) => (
                      <p key={i} className="text-sm text-stone-400">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Environments */}
              {stats.cairn.environments.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium uppercase text-stone-500">
                    Found In
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1 text-xs">
                    {stats.cairn.environments.map((env) => (
                      <span key={env} className="rounded bg-green-900/50 px-2 py-0.5 text-green-300">
                        {env}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Description (shown for both systems) */}
          {stats.description && (
            <div>
              <span className="text-xs font-medium uppercase text-stone-500">
                Description
              </span>
              <p className="text-sm italic text-stone-400">
                {stats.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
