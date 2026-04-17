"use client";

import { DndContext, closestCorners } from "@dnd-kit/core";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { ItemsPool } from "@/components/calendar/items-pool";
import { NodePool } from "@/components/calendar/node-pool";
import { Sidebar } from "@/components/layout/sidebar";
import { DeadlineConflictModal } from "@/components/shared/deadline-conflict-modal";
import { useDnd } from "@/hooks/use-dnd";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/stores/calendar-store";

export default function CalendarLayout({
  children,
}: {
  children: ReactNode;
}) {
  const {
    conflictState,
    handleConflictKeepChild,
    handleConflictUpdateParent,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    overTargetId,
    sensors,
  } = useDnd(() => new Set<string>());
  const isPoolCollapsed = useCalendarStore((state) => state.isPoolCollapsed);
  const togglePool = useCalendarStore((state) => state.togglePool);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="ml-12 flex min-w-0 flex-1 flex-col overflow-hidden">
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <div className="flex min-h-0 flex-1">
            <motion.aside
              initial={{ width: "18rem" }}
              animate={{ width: isPoolCollapsed ? "3rem" : "18rem" }}
              transition={{ type: "tween", ease: "circOut", duration: 0.25 }}
              className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-card"
            >
              <div
                className={cn(
                  "flex h-12 shrink-0 items-center border-b border-border px-2",
                  isPoolCollapsed ? "justify-center" : "justify-between",
                )}
              >
                {!isPoolCollapsed && (
                  <span className="text-sm font-semibold text-foreground">Pool</span>
                )}
                <button
                  type="button"
                  aria-label={isPoolCollapsed ? "Expand pool" : "Collapse pool"}
                  aria-expanded={!isPoolCollapsed}
                  aria-controls={isPoolCollapsed ? undefined : "calendar-pool-content"}
                  className="flex h-8 w-8 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  onClick={togglePool}
                >
                  {isPoolCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {!isPoolCollapsed && (
                  <div
                    id="calendar-pool-content"
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div
                      className={cn(
                        "min-h-0 border-b border-border transition-colors",
                        overTargetId === "calendar-unschedule:nodes" && "bg-accent/60",
                      )}
                      style={{
                        flex: "0 0 calc(var(--calendar-node-pool-ratio) * 100%)",
                      }}
                    >
                      <NodePool />
                    </div>
                    <div
                      className={cn(
                        "min-h-0 flex-1 transition-colors",
                        overTargetId === "calendar-unschedule:items" && "bg-accent/60",
                      )}
                    >
                      <ItemsPool />
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {isPoolCollapsed && (
                <div className="flex flex-1 items-start justify-center pt-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    POOL
                  </span>
                </div>
              )}
            </motion.aside>

            <section className="min-w-0 flex-1 overflow-hidden">{children}</section>
          </div>
        </DndContext>

        <DeadlineConflictModal
          open={conflictState.open}
          parentDeadline={conflictState.parentDeadline}
          parentDeadlineAllDay={conflictState.parentDeadlineAllDay}
          onKeepChild={handleConflictKeepChild}
          onUpdateParent={handleConflictUpdateParent}
        />
      </main>
    </div>
  );
}
