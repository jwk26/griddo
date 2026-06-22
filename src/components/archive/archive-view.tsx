"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Archive, Search } from "lucide-react";
import { ArchiveGroup } from "@/components/archive/archive-group";
import { useArchive, type ArchiveViewNode } from "@/hooks/use-archive";
import { motionDuration, motionSpring } from "@/lib/animations/motion-language";

function formatItemCount(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export function ArchiveView({ node }: { node: ArchiveViewNode }) {
  const {
    filteredCount,
    filteredGroups,
    isEmpty,
    restoringIds,
    searchQuery,
    setSearchQuery,
    totalCount,
    unarchive,
  } = useArchive();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label={node.title}
      className="min-h-full bg-page-bg"
      data-testid="archive-view"
    >
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Archive View
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">
              {node.title}
            </h1>
          </div>
          <p className="font-mono text-xs text-muted-foreground/80">
            {formatItemCount(totalCount)}
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-6 mb-8 bg-background/80 px-6 py-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25 motion-reduce:transition-none">
              <Search
                aria-hidden="true"
                className="h-4 w-4 flex-shrink-0 text-muted-foreground/60"
              />
              <input
                aria-label="Search archived items"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search archived items…"
                type="search"
                value={searchQuery}
              />
            </label>
            <span className="font-mono text-xs text-muted-foreground/80">
              {formatItemCount(filteredCount)}
            </span>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center">
            <Archive
              aria-hidden="true"
              className="h-12 w-12 text-muted-foreground/30"
            />
            <h2 className="mt-4 text-base font-semibold text-foreground">
              Archive is Empty
            </h2>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Archived nodes and bits will appear here.
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
            No archived items matching &apos;{searchQuery}&apos;
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <AnimatePresence initial={false}>
              {filteredGroups.map((group) => (
                <motion.div
                  key={group.parentNodeId ?? "__root__"}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          scale: 0.95,
                          transition: {
                            duration: motionDuration.affordance,
                            ease: "easeOut",
                          },
                        }
                  }
                  initial={false}
                  layout={shouldReduceMotion ? false : "position"}
                  transition={shouldReduceMotion ? undefined : motionSpring.gridSnap}
                >
                  <ArchiveGroup
                    group={group}
                    onUnarchive={unarchive}
                    restoringIds={restoringIds}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
