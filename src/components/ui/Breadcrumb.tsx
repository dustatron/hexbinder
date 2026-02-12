import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-stone-500" />}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                params={item.params}
                className="text-stone-400 hover:text-amber-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-stone-100 font-medium">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
