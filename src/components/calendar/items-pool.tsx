"use client";

import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { getDataStore } from "@/lib/db/datastore";
import { cn } from "@/lib/utils";
import { CompactBitItem } from "./compact-bit-item";

export function ItemsPool() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { poolItems, colorMap, isLoading } = useCalendarData();
  const { isOver, setNodeRef } = useDroppable({
    id: "calendar-unschedule:items",
    data: { kind: "calendar-unschedule" },
  });
  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = poolItems.filter((item) =>
    item.title.toLowerCase().includes(normalizedQuery),
  );

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full flex-col gap-3 p-4",
        isOver && "bg-accent/60",
      )}
    >
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Items pool</h2>
        <p className="text-xs text-muted-foreground">
          Drag Bits and steps into the calendar, or drop scheduled work here to unschedule it.
        </p>
      </div>
      <Input
        aria-label="Search scheduled items"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search bits and steps"
        value={query}
      />
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {!isLoading && visibleItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No unscheduled items
          </div>
        ) : null}
        {visibleItems.map((item) => (
          <CompactBitItem
            key={item.id}
            item={item}
            onClick={() => {
              const bitId = "deadline" in item ? item.id : item.parentId;
              router.push(`?bit=${bitId}`);
            }}
            onUnschedule={
              "deadline" in item
                ? async () => {
                    const ds = await getDataStore();
                    await ds.updateBit(item.id, { deadline: null, deadlineAllDay: false });
                  }
                : async () => {
                    const ds = await getDataStore();
                    await ds.updateChunk(item.id, { time: null });
                  }
            }
            parentColor={colorMap.get(item.id) ?? "hsl(var(--border))"}
          />
        ))}
      </div>
    </section>
  );
}
