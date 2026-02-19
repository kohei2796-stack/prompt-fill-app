"use client";

import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  selected: string | null;
  counts: Record<string, number>;
  onSelect: (category: string | null) => void;
};

export function Sidebar({ selected, counts, onSelect }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <aside className="w-56 shrink-0">
      <div className="sticky top-16">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          カテゴリ
        </h2>
        <nav className="space-y-0.5">
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              selected === null
                ? "bg-primary/10 font-semibold text-primary"
                : "text-foreground hover:bg-muted",
            )}
          >
            <span>すべて</span>
            <span className="text-xs text-muted-foreground">{total}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = counts[cat.value] ?? 0;
            return (
              <button
                key={cat.value}
                onClick={() => onSelect(cat.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  selected === cat.value
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span>{cat.label}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
