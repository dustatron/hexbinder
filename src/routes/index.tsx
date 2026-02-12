import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Plus, Download, Upload, Trash2, Map, Globe } from "lucide-react";

import { Button } from "~/components/ui/button";
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  listWorlds,
  deleteWorld,
  loadWorld,
  exportWorld,
  importWorld,
  importDefaultWorld,
  saveWorld,
} from "~/lib/storage";
import { generateWorld, type MapSize, type StartPosition } from "~/generators";
import type { WorldSummary, SettlementSize, Ruleset } from "~/models";

// Fantasy world name generation
const WORLD_PREFIXES = [
  "The", "Lost", "Ancient", "Forgotten", "Cursed", "Sunken", "Shadowed",
  "Hidden", "Twilight", "Storm", "Dark", "Iron", "Silver", "Golden",
];
const WORLD_ADJECTIVES = [
  "Borderlands", "Reaches", "Wilds", "Marches", "Expanse", "Wastes",
  "Kingdoms", "Realms", "Dominions", "Territories", "Frontier", "Barrens",
];
const WORLD_NOUNS = [
  "Thornwood", "Ravenmoor", "Blackhollow", "Grimholt", "Ashfall", "Dragonspine",
  "Ironhold", "Stormvale", "Frostpeak", "Shadowfen", "Moonshire", "Sunreach",
  "Duskwater", "Wyrmrest", "Bleakstone", "Mistral", "Valeholm", "Dreadmire",
];

function generateWorldName(): string {
  const type = Math.random();
  if (type < 0.5) {
    // "The [Adjective]" format
    const prefix = WORLD_PREFIXES[Math.floor(Math.random() * WORLD_PREFIXES.length)];
    const adj = WORLD_ADJECTIVES[Math.floor(Math.random() * WORLD_ADJECTIVES.length)];
    return `${prefix} ${adj}`;
  } else {
    // Single fantasy noun
    return WORLD_NOUNS[Math.floor(Math.random() * WORLD_NOUNS.length)];
  }
}

function generateSeed(): string {
  // Simple 6-digit number
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const Route = createFileRoute("/")({
  component: HomePage,
  // Only load on client - localStorage doesn't exist on server
  ssr: false,
});

function HomePage() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<WorldSummary[]>(() => listWorlds());
  const [showNewForm, setShowNewForm] = useState(false);
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldSeed, setNewWorldSeed] = useState("");
  const [mapSize, setMapSize] = useState<MapSize>("medium");
  const [startPosition, setStartPosition] = useState<StartPosition>("center");
  const [settlementSize, setSettlementSize] = useState<SettlementSize>("village");
  const [ruleset, setRuleset] = useState<Ruleset>(() => {
    if (typeof window === "undefined") return "shadowdark";
    return (localStorage.getItem("hexbinder:ruleset") as Ruleset) ?? "shadowdark";
  });
  const [settlementCount, setSettlementCount] = useState<number | "">("");
  const [dungeonCount, setDungeonCount] = useState<number | "">("");
  const [lairCount, setLairCount] = useState<number | "">("");
  const [factionCount, setFactionCount] = useState<number | "">("");
  const [loadingDefault, setLoadingDefault] = useState(false);

  // Default counts by map size
  const defaultCounts = {
    small: { settlements: 8, dungeons: 4, lairs: 6, factions: 3 },
    medium: { settlements: 12, dungeons: 8, lairs: 10, factions: 5 },
    large: { settlements: 20, dungeons: 12, lairs: 16, factions: 8 },
  };

  const refreshWorlds = () => setWorlds(listWorlds());

  const handleCreateWorld = () => {
    const { world } = generateWorld({
      name: newWorldName || "The Borderlands",
      seed: newWorldSeed || undefined,
      ruleset,
      mapSize,
      startPosition,
      startingSettlementSize: settlementSize,
      settlementCount: settlementCount || undefined,
      dungeonCount: dungeonCount || undefined,
      wildernessLairCount: lairCount || undefined,
      factionCount: factionCount || undefined,
    });
    saveWorld(world);
    setShowNewForm(false);
    setNewWorldName("");
    setNewWorldSeed("");
    setMapSize("medium");
    setStartPosition("center");
    setSettlementSize("village");
    setSettlementCount("");
    setDungeonCount("");
    setLairCount("");
    setFactionCount("");
    navigate({ to: "/world/$worldId", params: { worldId: world.id } });
  };

  const handleExport = (id: string) => {
    const world = loadWorld(id);
    if (world) exportWorld(world);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this world? This cannot be undone.")) {
      deleteWorld(id);
      refreshWorlds();
    }
  };

  const handleLoadDefault = async () => {
    setLoadingDefault(true);
    try {
      const world = await importDefaultWorld("/worlds/obojima.hexbinder.json");
      refreshWorlds();
      navigate({ to: "/atlas/$worldId", params: { worldId: world.id } });
    } catch {
      alert("Failed to load default world.");
    } finally {
      setLoadingDefault(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const world = await importWorld(file);
        refreshWorlds();
        navigate({ to: "/world/$worldId", params: { worldId: world.id } });
      } catch {
        alert("Failed to import world. Invalid file format.");
      }
    }
    e.target.value = "";
  };

  return (
    <div className="h-full overflow-auto bg-stone-900 p-4 text-stone-100">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-stone-400 hover:text-stone-200" />
            <div>
              <h1 className="text-2xl font-bold">Hexbinder</h1>
              <p className="text-sm text-stone-400">
                Procedural sandbox generator
              </p>
            </div>
          </div>
        </header>

        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => {
              setNewWorldName(generateWorldName());
              setNewWorldSeed(generateSeed());
              setShowNewForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New World
          </Button>
          <Button
            onClick={handleLoadDefault}
            disabled={loadingDefault}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Globe size={18} />
            {loadingDefault ? "Loading..." : "Obojima"}
          </Button>
          <label className="cursor-pointer">
            <span className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-600 bg-stone-800 px-3 text-sm font-medium hover:bg-stone-700">
              <Upload size={18} />
              Import
            </span>
            <input
              type="file"
              accept=".json,.hexbinder.json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {showNewForm && (
          <div className="mb-6 rounded-lg border border-stone-700 bg-stone-800 p-4">
            <h2 className="mb-4 text-lg font-semibold">Create New World</h2>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-stone-400">
                Rule System
              </label>
              <select
                value={ruleset}
                onChange={(e) => {
                  const value = e.target.value as Ruleset;
                  setRuleset(value);
                  localStorage.setItem("hexbinder:ruleset", value);
                }}
                className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100"
              >
                <option value="shadowdark">Shadowdark</option>
                <option value="cairn">Cairn</option>
              </select>
              <p className="mt-1 text-xs text-stone-500">
                Determines monster stat block format
              </p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-stone-400">
                World Name
              </label>
              <input
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="The Borderlands"
                className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 placeholder:text-stone-500"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-stone-400">
                Seed (optional)
              </label>
              <input
                type="text"
                value={newWorldSeed}
                onChange={(e) => setNewWorldSeed(e.target.value)}
                placeholder="Auto-generated if blank"
                className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 placeholder:text-stone-500"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-stone-400">
                Map Size
              </label>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setMapSize(size)}
                    className={`flex-1 rounded border px-3 py-2 text-sm capitalize ${
                      mapSize === size
                        ? "border-amber-500 bg-amber-500/20 text-amber-400"
                        : "border-stone-600 bg-stone-700 text-stone-300 hover:bg-stone-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {mapSize === "small" && "~37 hexes"}
                {mapSize === "medium" && "~91 hexes"}
                {mapSize === "large" && "~217 hexes"}
              </p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-stone-400">
                Starting Position
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right"] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setStartPosition(pos)}
                    className={`flex-1 rounded border px-3 py-2 text-sm capitalize ${
                      startPosition === pos
                        ? "border-amber-500 bg-amber-500/20 text-amber-400"
                        : "border-stone-600 bg-stone-700 text-stone-300 hover:bg-stone-600"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-stone-400">
                Starting Settlement
              </label>
              <select
                value={settlementSize}
                onChange={(e) => setSettlementSize(e.target.value as SettlementSize)}
                className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100"
              >
                <option value="thorpe">Thorpe (10-50 people)</option>
                <option value="hamlet">Hamlet (50-200 people)</option>
                <option value="village">Village (200-1000 people)</option>
                <option value="town">Town (1000-5000 people)</option>
                <option value="city">City (5000+ people)</option>
              </select>
            </div>
            {/* Content Counts */}
            <div className="mb-4 grid grid-cols-4 gap-3">
              <div>
                <label className="mb-1 block text-sm text-stone-400">
                  Settlements
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settlementCount === "" ? defaultCounts[mapSize].settlements : settlementCount}
                  onChange={(e) => setSettlementCount(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone-400">
                  Dungeons
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={dungeonCount === "" ? defaultCounts[mapSize].dungeons : dungeonCount}
                  onChange={(e) => setDungeonCount(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone-400">
                  Wild Lairs
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={lairCount === "" ? defaultCounts[mapSize].lairs : lairCount}
                  onChange={(e) => setLairCount(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone-400">
                  Factions
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={factionCount === "" ? defaultCounts[mapSize].factions : factionCount}
                  onChange={(e) => setFactionCount(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewWorldName("");
                  setNewWorldSeed("");
                  setMapSize("medium");
                  setStartPosition("center");
                  setSettlementSize("village");
                  setSettlementCount("");
                  setDungeonCount("");
                  setLairCount("");
                  setFactionCount("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWorld}
                className="bg-green-600 hover:bg-green-500"
              >
                Create
              </Button>
            </div>
          </div>
        )}

        {worlds.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-700 p-8 text-center text-stone-500">
            No worlds yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {worlds.map((world) => (
              <div
                key={world.id}
                className="flex items-center justify-between rounded-lg border border-stone-700 bg-stone-800 p-4"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/world/$worldId",
                      params: { worldId: world.id },
                    })
                  }
                >
                  <div className="flex items-center gap-3">
                    <Map className="text-amber-500" size={24} />
                    <div>
                      <h3 className="font-semibold">{world.name}</h3>
                      <p className="text-sm text-stone-400">
                        {formatDistanceToNow(world.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-blue-700/50 px-2 py-0.5 text-blue-300 capitalize">
                      {world.ruleset ?? "shadowdark"}
                    </span>
                    <span className="rounded bg-stone-700 px-2 py-0.5 text-stone-300">
                      Day {world.day}
                    </span>
                    <span className="rounded bg-stone-700 px-2 py-0.5 text-stone-300 capitalize">
                      {world.mapSize}
                    </span>
                    <span className="rounded bg-amber-700/50 px-2 py-0.5 text-amber-300">
                      {world.settlementCount} settlements
                    </span>
                    <span className="rounded bg-red-700/50 px-2 py-0.5 text-red-300">
                      {world.dungeonCount} dungeons
                    </span>
                    <span className="rounded bg-purple-700/50 px-2 py-0.5 text-purple-300">
                      {world.factionCount} factions
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(world.id)}
                    title="Export"
                  >
                    <Download size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(world.id)}
                    title="Delete"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
