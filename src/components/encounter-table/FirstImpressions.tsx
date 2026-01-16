import { Eye, Ear, Wind } from "lucide-react";

interface FirstImpressionsProps {
  sight: string;
  sound: string;
  smell: string;
  terrainLabel?: string;
}

export function FirstImpressions({
  sight,
  sound,
  smell,
  terrainLabel,
}: FirstImpressionsProps) {
  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3">
      {terrainLabel && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          {terrainLabel} Hex
        </h3>
      )}
      <ul className="space-y-1.5 text-sm">
        <li className="flex items-start gap-2 text-stone-300">
          <Eye size={14} className="mt-0.5 shrink-0 text-amber-400" />
          <span>{sight}</span>
        </li>
        <li className="flex items-start gap-2 text-stone-300">
          <Ear size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <span>{sound}</span>
        </li>
        <li className="flex items-start gap-2 text-stone-300">
          <Wind size={14} className="mt-0.5 shrink-0 text-green-400" />
          <span>{smell}</span>
        </li>
      </ul>
    </div>
  );
}
