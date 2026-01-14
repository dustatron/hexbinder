import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Plus, Download, Upload, Trash2, Map } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import {
  listWorlds,
  deleteWorld,
  loadWorld,
  exportWorld,
  importWorld,
  saveWorld,
} from "~/lib/storage";
import { createMockWorld } from "~/data/mock-world";
import type { WorldSummary } from "~/models";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<WorldSummary[]>(() => listWorlds());
  const [showNewForm, setShowNewForm] = useState(false);
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldSeed, setNewWorldSeed] = useState("");

  const refreshWorlds = () => setWorlds(listWorlds());

  const handleCreateWorld = () => {
    const world = createMockWorld(
      newWorldName || undefined,
      newWorldSeed || undefined
    );
    saveWorld(world);
    setShowNewForm(false);
    setNewWorldName("");
    setNewWorldSeed("");
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
    <div className="min-h-svh bg-stone-900 p-4 text-stone-100">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hexbinder</h1>
            <p className="text-sm text-stone-400">
              Procedural sandbox generator
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New World
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
            <div className="flex gap-2">
              <Button onClick={handleCreateWorld}>Create</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewWorldName("");
                  setNewWorldSeed("");
                }}
              >
                Cancel
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
                  className="flex cursor-pointer items-center gap-3"
                  onClick={() =>
                    navigate({
                      to: "/world/$worldId",
                      params: { worldId: world.id },
                    })
                  }
                >
                  <Map className="text-amber-500" size={24} />
                  <div>
                    <h3 className="font-semibold">{world.name}</h3>
                    <p className="text-sm text-stone-400">
                      {formatDistanceToNow(world.updatedAt, { addSuffix: true })}
                    </p>
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
