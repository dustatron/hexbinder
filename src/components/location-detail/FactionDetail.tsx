import type { Faction, Clock, NPC, Location, Hook, SignificantItem } from "~/models";

interface FactionDetailProps {
  faction: Faction;
  clocks: Clock[];
  npcs: NPC[];
  locations: Location[];
  hooks?: Hook[];
  significantItems?: SignificantItem[];
}

const FACTION_TYPE_COLORS: Record<Faction["factionType"], string> = {
  cult: "bg-purple-700",
  militia: "bg-red-700",
  syndicate: "bg-amber-700",
  guild: "bg-blue-700",
  tribe: "bg-green-700",
};

const ADVANTAGE_TYPE_COLORS: Record<string, string> = {
  wealth: "bg-yellow-700/50 text-yellow-200",
  military: "bg-red-700/50 text-red-200",
  influence: "bg-purple-700/50 text-purple-200",
  knowledge: "bg-blue-700/50 text-blue-200",
  magic: "bg-violet-700/50 text-violet-200",
  territory: "bg-green-700/50 text-green-200",
  alliance: "bg-cyan-700/50 text-cyan-200",
  artifact: "bg-amber-700/50 text-amber-200",
};

const GOAL_STATUS_STYLES: Record<string, { bg: string; dot: string }> = {
  completed: { bg: "bg-green-900/30", dot: "bg-green-500" },
  in_progress: { bg: "bg-blue-900/30", dot: "bg-blue-500" },
  pending: { bg: "bg-stone-800", dot: "bg-stone-500" },
  failed: { bg: "bg-red-900/30", dot: "bg-red-500" },
};

export function FactionDetail({
  faction,
  clocks,
  npcs,
  locations,
  hooks = [],
  significantItems = [],
}: FactionDetailProps) {
  // Filter clocks owned by this faction
  const factionClocks = clocks.filter(
    (c) => c.ownerId === faction.id && c.ownerType === "faction"
  );

  // Filter NPCs belonging to this faction
  const factionNpcs = npcs.filter((n) => n.factionId === faction.id);

  // Filter locations this faction controls or influences
  const controlledLocations = locations.filter((loc) =>
    faction.territoryIds.includes(loc.id)
  );
  const influencedLocations = locations.filter((loc) =>
    faction.influenceIds.includes(loc.id)
  );

  // Filter hooks involving this faction
  const factionHooks = hooks.filter((h) =>
    h.involvedFactionIds.includes(faction.id)
  );

  // Get recruitment hooks
  const recruitmentHooks = hooks.filter((h) =>
    faction.recruitmentHookIds?.includes(h.id)
  );

  // Get items this faction possesses or desires
  const possessedItems = significantItems.filter(
    (item) => item.currentHolderId === faction.id && item.holderType === "faction"
  );
  const desiredItems = significantItems.filter(
    (item) => item.desiredByFactionIds.includes(faction.id)
  );

  // Get seneschal NPC if assigned
  const seneschal = faction.seneschalId
    ? npcs.find((n) => n.id === faction.seneschalId)
    : null;

  return (
    <div className="space-y-6 bg-stone-900 p-4 text-stone-100">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{faction.name}</h2>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${FACTION_TYPE_COLORS[faction.factionType]}`}
          >
            {faction.factionType}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <span className="capitalize">{faction.archetype}</span>
          <span>·</span>
          <span className="capitalize">{faction.scale}</span>
          <span>·</span>
          <span className="capitalize">{faction.status}</span>
        </div>
      </header>

      {/* Description */}
      <section className="space-y-2">
        <p className="text-stone-300">{faction.description}</p>
        {faction.purpose && (
          <p className="text-sm text-stone-400">
            <span className="font-medium text-stone-300">Purpose:</span>{" "}
            {faction.purpose}
          </p>
        )}
      </section>

      {/* Advantages (Cairn-inspired) */}
      {faction.advantages && faction.advantages.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-green-400">
            Advantages
          </h3>
          <ul className="space-y-2">
            {faction.advantages.map((adv, i) => (
              <li
                key={i}
                className={`rounded px-3 py-2 ${ADVANTAGE_TYPE_COLORS[adv.type] || "bg-stone-800 text-stone-300"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{adv.name}</span>
                  <span className="text-xs uppercase opacity-70">{adv.type}</span>
                </div>
                {adv.description && (
                  <p className="mt-1 text-xs opacity-80">{adv.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Obstacle (Cairn-inspired) */}
      {faction.obstacle && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-red-400">
            Obstacle
          </h3>
          <div className="rounded border border-red-500/30 bg-red-900/20 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-200">{faction.obstacle.description}</span>
              <span className="text-xs uppercase text-red-400/70">
                {faction.obstacle.type.replace("_", " ")}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Agenda (Cairn-inspired progressive goals) */}
      {faction.agenda && faction.agenda.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-400">
            Agenda
          </h3>
          <p className="text-xs text-stone-500">Progressive goals building toward their objective</p>
          <ol className="space-y-2">
            {faction.agenda
              .sort((a, b) => a.order - b.order)
              .map((goal) => {
                const styles = GOAL_STATUS_STYLES[goal.status] || GOAL_STATUS_STYLES.pending;
                return (
                  <li
                    key={goal.id}
                    className={`rounded px-3 py-2 ${styles.bg}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-200">
                            {goal.order}. {goal.description}
                          </span>
                          <span className="text-xs capitalize text-stone-400">
                            {goal.status.replace("_", " ")}
                          </span>
                        </div>
                        {goal.addressesObstacle && (
                          <span className="mt-1 inline-block rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">
                            Addresses Obstacle
                          </span>
                        )}
                        {goal.targetType === "item" && (
                          <span className="mt-1 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                            Artifact Goal
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ol>
        </section>
      )}

      {/* Item Possessions & Desires */}
      {(possessedItems.length > 0 || desiredItems.length > 0) && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-400">
            Significant Items
          </h3>

          {possessedItems.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-stone-500">Possessed</span>
              <ul className="space-y-2">
                {possessedItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded border border-purple-500/30 bg-purple-900/20 px-3 py-2"
                  >
                    <div className="font-medium text-purple-200">{item.name}</div>
                    <p className="mt-1 text-xs text-stone-400">{item.effect}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {desiredItems.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-stone-500">Desires</span>
              <ul className="space-y-2">
                {desiredItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded border border-amber-500/30 bg-amber-900/20 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-200">{item.name}</span>
                      <span className="text-xs capitalize text-amber-400/70">{item.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-stone-400">{item.effect}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Methods */}
      {faction.methods.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Methods
          </h3>
          <ul className="flex flex-wrap gap-2">
            {faction.methods.map((method, i) => (
              <li
                key={i}
                className="rounded bg-stone-800 px-2 py-1 text-xs text-stone-300"
              >
                {method}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Clocks */}
      {factionClocks.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Clocks
          </h3>
          <div className="space-y-2">
            {factionClocks.map((clock) => (
              <div key={clock.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-200">{clock.name}</span>
                  <span className="text-xs text-stone-500">
                    {clock.filled}/{clock.segments}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-stone-800">
                  <div
                    className="h-full bg-amber-600 transition-all"
                    style={{
                      width: `${(clock.filled / clock.segments) * 100}%`,
                    }}
                  />
                </div>
                {clock.description && (
                  <p className="text-xs text-stone-500">{clock.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Territory */}
      {(controlledLocations.length > 0 || influencedLocations.length > 0) && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Territory
          </h3>
          {controlledLocations.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-stone-500">Controlled</span>
              <ul className="space-y-1">
                {controlledLocations.map((loc) => (
                  <li
                    key={loc.id}
                    className="flex items-center gap-2 text-sm text-stone-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {loc.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {influencedLocations.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-stone-500">Influenced</span>
              <ul className="space-y-1">
                {influencedLocations.map((loc) => (
                  <li
                    key={loc.id}
                    className="flex items-center gap-2 text-sm text-stone-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {loc.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Members */}
      {factionNpcs.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Members
          </h3>
          <ul className="space-y-2">
            {factionNpcs.map((npc) => (
              <li key={npc.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-stone-200">{npc.name}</span>
                  {npc.factionRole && (
                    <span className="rounded bg-stone-800 px-1.5 py-0.5 text-xs capitalize text-stone-400">
                      {npc.factionRole}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 capitalize">{npc.race} - {npc.role ? npc.role.replace("_", " ") : npc.archetype}</p>
                <NPCStatLine archetype={npc.archetype} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recruitment Hooks */}
      {recruitmentHooks.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Join {faction.name}
          </h3>
          <ul className="space-y-2">
            {recruitmentHooks.map((hook) => (
              <li key={hook.id} className="rounded border border-purple-500/30 bg-purple-500/10 p-2">
                <p className="text-sm text-stone-300">{hook.rumor}</p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="rounded bg-purple-500/20 px-1.5 py-0.5 capitalize text-purple-300">
                    {hook.type.replace("_", " ")}
                  </span>
                  {hook.reward && (
                    <span className="text-stone-500">Reward: {hook.reward}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Other Hooks */}
      {factionHooks.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Related Hooks
          </h3>
          <ul className="space-y-2">
            {factionHooks.filter((h) => !faction.recruitmentHookIds?.includes(h.id)).map((hook) => (
              <li key={hook.id} className="space-y-1">
                <p className="text-sm text-stone-300">{hook.rumor}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-stone-800 px-1.5 py-0.5 text-xs capitalize text-stone-400">
                    {hook.type.replace("_", " ")}
                  </span>
                  <span
                    className={`text-xs ${
                      hook.status === "active"
                        ? "text-green-500"
                        : hook.status === "completed"
                          ? "text-stone-500"
                          : "text-amber-500"
                    }`}
                  >
                    {hook.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
