import { useState, useRef, useEffect, useCallback, type ElementType } from "react";
import { cn } from "~/lib/utils";

interface InlineEditTextProps {
  value: string;
  onSave: (value: string) => void;
  as?: ElementType;
  multiline?: boolean;
  type?: "text" | "number";
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

export function InlineEditText({
  value,
  onSave,
  as: Tag = "span",
  multiline = false,
  type = "text",
  className,
  inputClassName,
  placeholder,
}: InlineEditTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  // Focus and select on edit start
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(type === "number" ? String(Number(trimmed) || 0) : trimmed);
    }
  }, [draft, value, onSave, type]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      } else if (e.key === "Enter") {
        if (multiline && !e.ctrlKey && !e.metaKey) return; // Allow newlines in multiline
        e.preventDefault();
        save();
      }
    },
    [save, cancel, multiline],
  );

  if (editing) {
    const shared = {
      ref: inputRef as any,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: save,
      onKeyDown: handleKeyDown,
      className: cn(
        "w-full rounded border border-stone-600 bg-stone-800 px-2 py-1.5 text-stone-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 min-h-[44px]",
        inputClassName,
        className,
      ),
      placeholder,
    };

    if (multiline) {
      return <textarea {...shared} rows={3} />;
    }
    return <input {...shared} type={type} />;
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      className={cn(
        "cursor-pointer rounded px-0.5 -mx-0.5 transition-all hover:ring-1 hover:ring-stone-600",
        className,
      )}
      title="Click to edit"
    >
      {value || <span className="italic text-stone-600">{placeholder || "Click to edit"}</span>}
    </Tag>
  );
}
