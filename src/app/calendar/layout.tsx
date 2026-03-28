"use client";

import Link from "next/link";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ItemsPool } from "@/components/calendar/items-pool";
import { NodePool } from "@/components/calendar/node-pool";
import { Sidebar } from "@/components/layout/sidebar";
import { DeadlineConflictModal } from "@/components/shared/deadline-conflict-modal";
import { Button } from "@/components/ui/button";
import { useDnd } from "@/hooks/use-dnd";
import { cn } from "@/lib/utils";

const CALENDAR_VIEWS = [
  { href: "/calendar/weekly", label: "Weekly" },
  { href: "/calendar/monthly", label: "Monthly" },
] as const;

export default function CalendarLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const {
    conflictState,
    handleConflictKeepChild,
    handleConflictUpdateParent,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    overTargetId,
    sensors,
  } = useDnd();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar level={0} />
      <main className="ml-[14rem] flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Calendar
            </p>
            <h1 className="text-xl font-semibold text-foreground">Schedule</h1>
          </div>
          <nav className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
            {CALENDAR_VIEWS.map((view) => {
              const isActive = pathname === view.href;

              return (
                <Button
                  key={view.href}
                  asChild
                  size="sm"
                  variant={isActive ? "default" : "ghost"}
                >
                  <Link href={view.href}>{view.label}</Link>
                </Button>
              );
            })}
          </nav>
        </header>

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
