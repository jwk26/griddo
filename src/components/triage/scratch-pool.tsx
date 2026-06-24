"use client";

import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInbox } from "@/hooks/use-inbox";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import { useTriageStore } from "@/stores/triage-store";
import type { Bit } from "@/types";

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground/25" aria-hidden="true" />
      <div className="mt-2 text-xs font-medium text-muted-foreground">
        No active scratches
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground/50">
        Captured items will appear here.
      </div>
    </div>
  );
}

function ScratchRow({
  bit,
  isSelected,
  reducedMotion,
  onSelect,
}: {
  bit: Bit;
  isSelected: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      aria-label={bit.title}
      className={cn(
        "group relative h-[52px] w-full border-b border-border/30 px-3 py-2 text-left last:border-b-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isSelected ? "bg-primary/10" : "bg-transparent hover:bg-accent/60",
        reducedMotion
          ? "transition-none"
          : isSelected
            ? "transition-all duration-100 ease-out"
            : "transition-colors duration-150 ease-out",
      )}
      type="button"
      onClick={() => onSelect(bit.id)}
    >
      {isSelected ? (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 w-1 bg-primary"
        />
      ) : null}
      <div
        className={cn(
          "truncate text-xs font-medium",
          isSelected ? "text-primary" : "text-foreground",
        )}
      >
        {bit.title}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[10px] font-normal",
          isSelected
            ? "text-primary/70"
            : "text-muted-foreground/70 group-hover:text-muted-foreground",
        )}
      >
        {formatRelativeTime(bit.createdAt)}
      </div>
    </button>
  );
}

export function ScratchPool() {
  const { activeScratchBits } = useInbox();
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const selectScratch = useTriageStore((state) => state.selectScratch);
  const scratchPoolExpanded = useTriageStore(
    (state) => state.scratchPoolExpanded,
  );
  const setScratchPoolExpanded = useTriageStore(
    (state) => state.setScratchPoolExpanded,
  );
  const setScratchPoolManualExpandedForId = useTriageStore(
    (state) => state.setScratchPoolManualExpandedForId,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const count = activeScratchBits.length;

  const sortedFilteredBits = useMemo(() => {
    const filtered = searchQuery
      ? activeScratchBits.filter((bit) =>
          bit.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : activeScratchBits;

    return filtered.toSorted((left, right) =>
      sortAsc
        ? left.createdAt - right.createdAt
        : right.createdAt - left.createdAt,
    );
  }, [activeScratchBits, searchQuery, sortAsc]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(query.matches);

    handleChange();
    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    setScratchPoolManualExpandedForId(null);
  }, [selectedScratchId, setScratchPoolManualExpandedForId]);

  const handleToggle = useCallback(() => {
    if (!scratchPoolExpanded) {
      setScratchPoolExpanded(true);
      setScratchPoolManualExpandedForId(selectedScratchId);
    } else {
      setScratchPoolExpanded(false);
    }
  }, [
    scratchPoolExpanded,
    selectedScratchId,
    setScratchPoolExpanded,
    setScratchPoolManualExpandedForId,
  ]);

  const handleSelect = useCallback(
    (id: string) => {
      selectScratch(id);
    },
    [selectScratch],
  );

  const handleSortToggle = useCallback(() => setSortAsc((prev) => !prev), []);
  const handleSearchClear = useCallback(() => setSearchQuery(""), []);

  if (scratchPoolExpanded) {
    return (
      <aside
        data-testid="scratch-pool"
        className={cn(
          "flex h-full min-w-0 flex-col border-r border-border bg-muted/10 w-72",
          reducedMotion
            ? "transition-none"
            : "transition-[width] duration-200 ease-in-out",
        )}
      >
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <Inbox
              className="h-3.5 w-3.5 text-muted-foreground/80"
              aria-hidden="true"
            />
            <span
              aria-label={`${count} scratch${count === 1 ? "" : "es"}`}
              className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/80 px-1 text-[9px] font-semibold text-primary-foreground"
            >
              {count}
            </span>
          </div>
          <button
            type="button"
            aria-label="Collapse Scratch Pool"
            title="Collapse Scratch Pool"
            onClick={handleToggle}
            className={cn(
              "rounded-md p-0.5 text-muted-foreground/80 hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              reducedMotion
                ? "transition-none"
                : "transition-colors duration-150 ease-out",
            )}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex h-8 shrink-0 items-center gap-1 border-b border-border/50 px-2">
          <div className="relative flex flex-1 items-center">
            <Search
              className="absolute left-1.5 h-3 w-3 text-muted-foreground/50"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search scratches"
              className="h-6 w-full rounded-sm bg-muted/40 pl-5 pr-1 text-[10px] text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={handleSearchClear}
                className={cn(
                  "absolute right-1 text-muted-foreground/50 hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                )}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label={
              sortAsc
                ? "Sort: oldest first — click for newest first"
                : "Sort: newest first — click for oldest first"
            }
            title={sortAsc ? "Sort: oldest first" : "Sort: newest first"}
            onClick={handleSortToggle}
            className={cn(
              "shrink-0 rounded-md p-1 text-muted-foreground/70 hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              reducedMotion
                ? "transition-none"
                : "transition-colors duration-150 ease-out",
            )}
          >
            <ArrowDownUp className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-hidden",
            reducedMotion
              ? "transition-none"
              : "transition-opacity duration-150 ease-in-out",
          )}
        >
          <div className="h-full overflow-y-auto">
            {activeScratchBits.length === 0 ? (
              <EmptyState />
            ) : sortedFilteredBits.length === 0 ? (
              <div className="px-3 py-4 text-center text-[10px] text-muted-foreground/60">
                No matches
              </div>
            ) : (
              sortedFilteredBits.map((bit) => (
                <ScratchRow
                  key={bit.id}
                  bit={bit}
                  isSelected={bit.id === selectedScratchId}
                  reducedMotion={reducedMotion}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      data-testid="scratch-pool"
      className={cn(
        "flex h-full min-w-0 flex-col border-r border-border bg-muted/10 w-12",
        reducedMotion
          ? "transition-none"
          : "transition-[width] duration-200 ease-in-out",
      )}
    >
      <div className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-muted/30">
        <button
          type="button"
          aria-label="Expand Scratch Pool"
          title="Expand Scratch Pool"
          onClick={handleToggle}
          className={cn(
            "rounded-md p-0.5 text-muted-foreground/80 hover:bg-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            reducedMotion
              ? "transition-none"
              : "transition-colors duration-150 ease-out",
          )}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto py-2">
        <div className="relative">
          <Inbox
            className={cn(
              "h-4 w-4",
              count > 0 ? "text-foreground" : "text-muted-foreground/40",
            )}
            aria-hidden="true"
          />
          {count > 0 && (
            <span
              aria-label={`${count} scratch${count === 1 ? "" : "es"}`}
              className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-semibold text-primary-foreground"
            >
              {count}
            </span>
          )}
        </div>

        {activeScratchBits.length > 0 && (
          <div
            className="flex flex-col items-center gap-1.5"
            role="group"
            aria-label="Switch scratch"
          >
            {activeScratchBits
              .toSorted((left, right) => right.createdAt - left.createdAt)
              .map((bit) => {
                const isSelected = bit.id === selectedScratchId;
                return (
                  <button
                    key={bit.id}
                    type="button"
                    aria-label={bit.title}
                    title={bit.title}
                    onClick={() => handleSelect(bit.id)}
                    className={cn(
                      "w-2 rounded-full",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      reducedMotion
                        ? "transition-none"
                        : "transition-all duration-150 ease-out",
                      isSelected
                        ? "h-8 bg-primary"
                        : "h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    )}
                  />
                );
              })}
          </div>
        )}
      </div>
    </aside>
  );
}
