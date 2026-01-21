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
    <div className={`rounded-lg border p-3 text-foreground ${
      stats.isEstimate
        ? "border-amber-600/50 bg-amber-900/20"
        : "border-border bg-card"
    }`}>
      {/* Estimate warning */}
      {stats.isEstimate && (
        <div className="mb-2 rounded bg-amber-600/30 px-2 py-1 text-xs text-amber-200">
          ⚠️ Stats not found — using level-based estimates
        </div>
      )}

      {/* Header: Name + Level/Count */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">
          {count && count > 1 ? `${count}x ` : ""}{stats.name}
        </span>
        <div className="flex items-center gap-2">
          {stats.shadowdark && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
              LV {stats.shadowdark.level}
            </span>
          )}
          <span className="rounded bg-purple-700/50 px-2 py-0.5 text-xs font-medium capitalize text-purple-200">
            {stats.ruleset}
          </span>
        </div>
      </div>

      {/* Compact stats */}
      <div className="mt-1 text-sm text-muted-foreground">
        <span>{stats.defenseLabel} {stats.defense}</span>
        <span className="mx-2">|</span>
        <span>HP {stats.hp}</span>
      </div>

      {/* Primary attack (always shown) */}
      <div className="mt-1 text-sm text-muted-foreground">{primaryAttack}</div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 border-t border-border pt-3">
          {/* Full attack line */}
          <div className="mb-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Attacks
            </span>
            <div className="text-sm text-foreground">{stats.attack}</div>
          </div>

          {/* Shadowdark-specific fields */}
          {stats.shadowdark && (
            <>
              {/* Movement */}
              <div className="mb-2">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Movement
                </span>
                <div className="text-sm text-foreground">{stats.shadowdark.movement}</div>
              </div>

              {/* Ability Modifiers */}
              <div className="mb-2">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Abilities
                </span>
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  {Object.entries(stats.shadowdark.abilities).map(([ability, mod]) => (
                    <span key={ability} className="rounded bg-muted px-2 py-0.5">
                      {ability} {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div className="mb-2">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Alignment
                </span>
                <div className="text-sm text-foreground">{stats.shadowdark.alignment}</div>
              </div>

              {/* Traits */}
              {stats.shadowdark.traits.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Traits
                  </span>
                  <div className="space-y-1">
                    {stats.shadowdark.traits.map((trait) => (
                      <div key={trait.name} className="text-sm">
                        <span className="font-medium text-foreground">
                          {trait.name}.
                        </span>{" "}
                        <span className="text-muted-foreground">{trait.description}</span>
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
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Abilities
                </span>
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  <span className="rounded bg-muted px-2 py-0.5">
                    STR {stats.cairn.abilities.STR}
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5">
                    DEX {stats.cairn.abilities.DEX}
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5">
                    WIL {stats.cairn.abilities.WIL}
                  </span>
                </div>
              </div>

              {/* Details (special abilities, behaviors) */}
              {stats.cairn.details.length > 1 && (
                <div className="mb-2">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Special
                  </span>
                  <div className="space-y-1">
                    {stats.cairn.details.slice(1).map((detail, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

          {/* Description (shown for both systems) */}
          {stats.description && (
            <div>
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Description
              </span>
              <p className="text-sm italic text-muted-foreground">
                {stats.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
