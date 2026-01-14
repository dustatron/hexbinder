import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Hex, Location, TerrainType } from "~/models";

interface LocationPanelProps {
  location: Location | null;
  hex: Hex | null;
  onClose: () => void;
}

const TERRAIN_LABELS: Record<TerrainType, string> = {
  plains: "Open Plains",
  forest: "Dense Forest",
  hills: "Rolling Hills",
  mountains: "Mountain Range",
  water: "Lake / River",
  swamp: "Murky Swamp",
};

export function LocationPanel({ location, hex, onClose }: LocationPanelProps) {
  const isOpen = hex !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 max-h-[60%] overflow-y-auto rounded-t-xl border-t border-stone-700 bg-stone-800 p-4 shadow-xl"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              {location ? (
                <>
                  <h2 className="text-xl font-bold text-stone-100">
                    {location.name}
                  </h2>
                  <p className="text-sm font-medium capitalize text-amber-400">
                    {location.type}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold capitalize text-stone-100">
                    {hex ? TERRAIN_LABELS[hex.terrain] : "Unknown"}
                  </h2>
                  <p className="text-sm text-stone-400">
                    Hex ({hex?.coord.q}, {hex?.coord.r})
                  </p>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
            >
              <X size={20} />
            </button>
          </div>

          {location && (
            <div className="space-y-4">
              <p className="text-stone-300">{location.description}</p>

              {location.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {location.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-stone-700 px-2 py-0.5 text-xs text-stone-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {!location && hex && (
            <p className="text-stone-400">
              No notable locations in this hex. The{" "}
              {hex.terrain.replace("_", " ")} stretches before you.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
