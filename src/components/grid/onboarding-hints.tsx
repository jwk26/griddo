"use client";

import { useGridData } from "@/hooks/use-grid-data";

const hints = ["Work", "Personal", "Hobbies"];

export function OnboardingHints() {
  const { nodes, isLoading } = useGridData(null);

  if (nodes.length > 0 || isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-16">
      {hints.map((label) => (
        <div
          key={label}
          className="flex h-[4.5rem] w-14 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-muted-foreground/30 p-2"
        >
          <span className="text-xs text-muted-foreground/50">{label}</span>
        </div>
      ))}
    </div>
  );
}
