import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "~/lib/utils";

type Option<T extends string> = { value: T; label: string };

interface InlineEditSelectProps<T extends string> {
  value: T;
  options: readonly T[] | Option<T>[];
  onSave: (value: T) => void;
  className?: string;
  formatLabel?: (value: T) => string;
}

function normalizeOptions<T extends string>(
  options: readonly T[] | Option<T>[],
  formatLabel?: (value: T) => string,
): Option<T>[] {
  if (options.length === 0) return [];
  if (typeof options[0] === "string") {
    return (options as readonly T[]).map((v) => ({
      value: v,
      label: formatLabel ? formatLabel(v) : v.charAt(0).toUpperCase() + v.slice(1),
    }));
  }
  return options as Option<T>[];
}

export function InlineEditSelect<T extends string>({
  value,
  options,
  onSave,
  className,
  formatLabel,
}: InlineEditSelectProps<T>) {
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const normalized = normalizeOptions(options, formatLabel);

  const currentLabel =
    normalized.find((o) => o.value === value)?.label ??
    (formatLabel ? formatLabel(value) : value);

  useEffect(() => {
    if (editing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editing]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value as T;
      setEditing(false);
      if (newValue !== value) {
        onSave(newValue);
      }
    },
    [value, onSave],
  );

  const handleBlur = useCallback(() => {
    setEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setEditing(false);
    }
  }, []);

  if (editing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "rounded border border-stone-600 bg-stone-800 px-2 py-1 text-stone-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 min-h-[44px] text-xs",
          className,
        )}
      >
        {normalized.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={cn(
        "cursor-pointer rounded transition-all hover:ring-1 hover:ring-stone-600",
        className,
      )}
      title="Click to edit"
    >
      {currentLabel}
    </span>
  );
}
