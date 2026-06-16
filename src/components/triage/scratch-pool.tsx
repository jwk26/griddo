"use client";

import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInbox } from "@/hooks/use-inbox";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import { useTriageStore } from "@/stores/triage-store";
import type { Bit } from "@/types";

const AUTO_COLLAPSE_DELAY_MS = 150;

function ScratchPoolHeader({
  isExpanded,
  reducedMotion,
  onToggle,
}: {
  isExpanded: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "flex h-8 items-center justify-between border-b border-border bg-muted/30 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80",
        isExpanded ? "px-3" : "px-0",
      )}
    >
      {isExpanded ? <span>Scratch Pool</span> : null}
      <button
        aria-label={isExpanded ? "Collapse Scratch Pool" : "Expand Scratch Pool"}
        className={cn(
          "rounded-md p-0.5 text-muted-foreground/80 hover:bg-muted hover:text-foreground",
          isExpanded ? "" : "mx-auto",
          reducedMotion
            ? "transition-none"
            : "transition-colors duration-150 ease-out",
        )}
        title={isExpanded ? "Collapse Scratch Pool" : "Expand Scratch Pool"}
        type="button"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedScratchBits = useMemo(
    () => activeScratchBits.toSorted((left, right) => right.createdAt - left.createdAt),
    [activeScratchBits],
  );

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
    return () => {
      if (collapseTimerRef.current !== null) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const handleToggle = useCallback(() => {
    setIsExpanded((current) => !current);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      selectScratch(id);

      if (collapseTimerRef.current !== null) {
        clearTimeout(collapseTimerRef.current);
      }

      collapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
        collapseTimerRef.current = null;
      }, AUTO_COLLAPSE_DELAY_MS);
    },
    [selectScratch],
  );

  return (
    <aside
      className={cn(
        "flex h-full min-w-0 flex-col border-r border-border bg-muted/10",
        isExpanded ? "w-72" : "w-12",
        reducedMotion
          ? "transition-none"
          : "transition-[width] duration-200 ease-in-out",
      )}
      data-testid="scratch-pool"
    >
      {isExpanded ? (
        <>
          <ScratchPoolHeader
            isExpanded={isExpanded}
            reducedMotion={reducedMotion}
            onToggle={handleToggle}
          />
          <div
            className={cn(
              "min-h-0 flex-1 overflow-hidden opacity-100",
              reducedMotion
                ? "transition-none"
                : "transition-opacity duration-150 ease-in-out",
            )}
          >
            <div className="h-full overflow-y-auto">
              {sortedScratchBits.length === 0 ? (
                <EmptyState />
              ) : (
                sortedScratchBits.map((bit) => (
                  <ScratchRow
                    bit={bit}
                    isSelected={bit.id === selectedScratchId}
                    key={bit.id}
                    reducedMotion={reducedMotion}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <button
          aria-label="Expand Scratch Pool"
          className={cn(
            "relative flex h-full w-full flex-col items-center hover:bg-accent/40",
            reducedMotion
              ? "transition-none"
              : "transition-colors duration-150 ease-out",
          )}
          title="Expand Scratch Pool"
          type="button"
          onClick={() => setIsExpanded(true)}
        >
          <span className="flex h-8 w-full items-center justify-center border-b border-border bg-muted/30">
            <ChevronRight
              className="h-4 w-4 text-muted-foreground/80"
              aria-hidden="true"
            />
          </span>
          <span className="relative flex min-h-0 flex-1 items-center justify-center">
            <Inbox
              className={cn(
                "h-4 w-4",
                sortedScratchBits.length > 0
                  ? "text-foreground"
                  : "text-muted-foreground/40",
              )}
              aria-hidden="true"
            />
          </span>
          {sortedScratchBits.length > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold text-primary-foreground">
              {sortedScratchBits.length}
            </span>
          ) : null}
        </button>
      )}
    </aside>
  );
}
