"use client";

import { DndContext, closestCorners } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { ItemsPool } from "@/components/calendar/items-pool";
import { NodePool } from "@/components/calendar/node-pool";
import { Sidebar } from "@/components/layout/sidebar";
import { DeadlineConflictModal } from "@/components/shared/deadline-conflict-modal";
import { useDnd } from "@/hooks/use-dnd";
import { cn } from "@/lib/utils";

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
            <aside className="flex w-[var(--calendar-pool-width)] flex-col border-r border-border bg-card">
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
            </aside>

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
