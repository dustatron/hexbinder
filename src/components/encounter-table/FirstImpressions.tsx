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
    <div className="rounded-lg border border-border bg-card/50 p-3">
      {terrainLabel && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {terrainLabel} Hex
        </h3>
      )}
      <ul className="space-y-1.5 text-sm">
        <li className="flex items-start gap-2 text-foreground">
          <Eye size={14} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
          <span>{sight}</span>
        </li>
        <li className="flex items-start gap-2 text-foreground">
          <Ear size={14} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
          <span>{sound}</span>
        </li>
        <li className="flex items-start gap-2 text-foreground">
          <Wind size={14} className="mt-0.5 shrink-0 text-green-500 dark:text-green-400" />
          <span>{smell}</span>
        </li>
      </ul>
    </div>
  );
}
