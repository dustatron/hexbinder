import { useState, useMemo } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import { generateQuickNames } from "~/generators/EncounterGenerator";

interface QuickNamesProps {
  seed: string;
  onReroll?: () => void;
}

export function QuickNames({ seed, onReroll }: QuickNamesProps) {
  const [nameSeed, setNameSeed] = useState(seed);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const names = useMemo(() => {
    return generateQuickNames(nameSeed, 16);
  }, [nameSeed]);

  const handleReroll = () => {
    setNameSeed(`${seed}-${Date.now()}`);
    onReroll?.();
  };

  const handleCopyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 1500);
    } catch {
      // Clipboard API not available
    }
  };

  // Split into two columns (8 male, 8 female roughly)
  const leftColumn = names.slice(0, 8);
  const rightColumn = names.slice(8, 16);

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Names
        </h4>
        <button
          onClick={handleReroll}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Re-roll names"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-sm">
        {leftColumn.map((name, i) => (
          <NameButton
            key={`left-${i}`}
            name={name}
            isCopied={copiedName === name}
            onClick={() => handleCopyName(name)}
          />
        ))}
        {rightColumn.map((name, i) => (
          <NameButton
            key={`right-${i}`}
            name={name}
            isCopied={copiedName === name}
            onClick={() => handleCopyName(name)}
          />
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground italic">
        Click to copy
      </p>
    </div>
  );
}

interface NameButtonProps {
  name: string;
  isCopied: boolean;
  onClick: () => void;
}

function NameButton({ name, isCopied, onClick }: NameButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded px-1.5 py-0.5 text-left transition-colors ${
        isCopied
          ? "bg-green-500/20 text-green-600 dark:text-green-300"
          : "text-foreground hover:bg-muted"
      }`}
    >
      <span className="truncate">{name}</span>
      {isCopied && <Check size={10} className="shrink-0 text-green-400" />}
    </button>
  );
}
