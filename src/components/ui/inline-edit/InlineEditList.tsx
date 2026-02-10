import { InlineEditText } from "./InlineEditText";
import { cn } from "~/lib/utils";

interface InlineEditListProps {
  values: string[];
  onSave: (values: string[]) => void;
  bulletClassName?: string;
  itemClassName?: string;
}

export function InlineEditList({
  values,
  onSave,
  bulletClassName = "text-amber-500/60",
  itemClassName,
}: InlineEditListProps) {
  const handleItemSave = (index: number, newValue: string) => {
    const updated = [...values];
    updated[index] = newValue;
    onSave(updated);
  };

  return (
    <ul className="space-y-0.5">
      {values.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className={bulletClassName}>•</span>
          <InlineEditText
            value={item}
            onSave={(v) => handleItemSave(i, v)}
            as="span"
            className={cn("text-sm italic text-stone-400", itemClassName)}
          />
        </li>
      ))}
    </ul>
  );
}
