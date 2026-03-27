"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowUpCircle, Calendar, CheckCircle2, Circle, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NODE_ICON_MAP, NODE_ICON_NAMES } from "@/lib/constants/node-icons";
import { indexedDBStore } from "@/lib/db/indexeddb";
import { useBitDetail } from "@/hooks/use-bit-detail";
import { bitDetailPopupVariants } from "@/lib/animations/grid";
import { cn } from "@/lib/utils";
import { ChunkPool } from "./chunk-pool";
import { ChunkTimeline } from "./chunk-timeline";
import type { Bit } from "@/types";

type Priority = Bit["priority"];
const PRIORITY_CYCLE: Priority[] = ["high", "mid", "low", null];
const PRIORITY_LABELS: Record<NonNullable<Priority>, string> = {
  high: "High",
  mid: "Mid",
  low: "Low",
};

function nextPriority(current: Priority): Priority {
  const idx = PRIORITY_CYCLE.indexOf(current);
  return PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
}

function toDateStr(ts: number | null): string {
  return ts ? format(new Date(ts), "yyyy-MM-dd") : "";
}

function toTimeStr(ts: number | null): string {
  return ts ? format(new Date(ts), "HH:mm") : "";
}

export function BitDetailPopup() {
  const { bit, chunks, parentNode, isOpen, close } = useBitDetail();
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Sync local fields when bit identity changes
  useEffect(() => {
    if (!bit) return;
    setLocalTitle(bit.title);
    setLocalDescription(bit.description);
  }, [bit?.id]);

  // ESC closes popup; if icon picker is open, let Radix close it first
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !iconPickerOpen) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, iconPickerOpen]);

  if (!isOpen) return null;

  // --- Save handlers (blur strategy) ---

  async function handleTitleBlur() {
    if (!bit) return;
    const trimmed = localTitle.trim();
    if (!trimmed) { setLocalTitle(bit.title); return; }
    if (trimmed !== bit.title) await indexedDBStore.updateBit(bit.id, { title: trimmed });
  }

  async function handleDescriptionBlur() {
    if (!bit) return;
    if (localDescription !== bit.description) {
      await indexedDBStore.updateBit(bit.id, { description: localDescription });
    }
  }

  async function handlePriorityToggle() {
    if (!bit) return;
    await indexedDBStore.updateBit(bit.id, { priority: nextPriority(bit.priority) });
  }

  async function handleIconSelect(iconName: string) {
    if (!bit) return;
    setIconPickerOpen(false);
    if (iconName !== bit.icon) await indexedDBStore.updateBit(bit.id, { icon: iconName });
  }

  async function handleDateChange(dateStr: string) {
    if (!bit) return;
    if (!dateStr) {
      await indexedDBStore.updateBit(bit.id, { deadline: null, deadlineAllDay: false });
      return;
    }
    const timeStr = bit.deadlineAllDay ? "00:00" : (toTimeStr(bit.deadline) || "00:00");
    await indexedDBStore.updateBit(bit.id, { deadline: new Date(`${dateStr}T${timeStr}`).getTime() });
  }

  async function handleTimeChange(timeStr: string) {
    if (!bit) return;
    const dateStr = toDateStr(bit.deadline) || format(new Date(), "yyyy-MM-dd");
    await indexedDBStore.updateBit(bit.id, { deadline: new Date(`${dateStr}T${timeStr}`).getTime() });
  }

  async function handleAllDayToggle() {
    if (!bit) return;
    await indexedDBStore.updateBit(bit.id, { deadlineAllDay: !bit.deadlineAllDay });
  }

  async function handleMoveToTrash() {
    if (!bit) return;
    await indexedDBStore.softDeleteBit(bit.id);
    close();
  }

  async function handleStatusToggle() {
    if (!bit) return;
    await indexedDBStore.updateBit(bit.id, { status: bit.status === "complete" ? "active" : "complete" });
  }

  async function handlePromoteToNode() {
    if (!bit) return;
    await indexedDBStore.promoteBitToNode(bit.id);
    close();
  }

  const Icon = bit ? (NODE_ICON_MAP[bit.icon] ?? NODE_ICON_MAP.Box) : null;
  const hasChunks = chunks.length > 0;
  const canPromote = hasChunks && (parentNode === null || parentNode.level < 2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        />

        {/* Popup */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={bit?.title ?? "Bit detail"}
          className="relative z-10 flex w-full max-w-bit-detail flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
          style={{ maxHeight: "85vh" }}
          variants={bitDetailPopupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {bit ? (
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-5">

                {/* Header row: icon | title | priority | more */}
                <div className="flex items-start gap-3">
                  {/* Icon picker */}
                  <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Change icon"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <div className="grid grid-cols-5 gap-1.5">
                        {NODE_ICON_NAMES.map((name) => {
                          const I = NODE_ICON_MAP[name];
                          return (
                            <button
                              key={name}
                              type="button"
                              aria-label={name}
                              title={name}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
                                bit.icon === name && "border-transparent ring-2 ring-primary ring-offset-1",
                              )}
                              onClick={() => handleIconSelect(name)}
                            >
                              <I className="h-4 w-4" />
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Title */}
                  <input
                    aria-label="Bit title"
                    className="min-w-0 flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                    maxLength={200}
                    onBlur={handleTitleBlur}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                    placeholder="Untitled"
                    type="text"
                    value={localTitle}
                  />

                  {/* Priority toggle */}
                  <button
                    type="button"
                    aria-label={`Priority: ${bit.priority ?? "none"}. Click to cycle.`}
                    onClick={handlePriorityToggle}
                    className={cn(
                      "inline-flex flex-shrink-0 items-center rounded-full px-[7px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.05em] transition-colors",
                      bit.priority === "high" && "bg-priority-high-bg text-priority-high",
                      bit.priority === "mid" && "bg-priority-mid-bg text-priority-mid",
                      bit.priority === "low" && "bg-priority-low-bg text-priority-low",
                      !bit.priority && "bg-secondary text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {bit.priority ? PRIORITY_LABELS[bit.priority] : "—"}
                  </button>

                  {/* Status toggle */}
                  <button
                    type="button"
                    aria-label={bit.status === "complete" ? "Mark as active" : "Mark as complete"}
                    onClick={handleStatusToggle}
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors",
                      bit.status === "complete"
                        ? "text-primary hover:bg-accent"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {bit.status === "complete" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>

                  {/* More menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="More options"
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canPromote && (
                        <>
                          <DropdownMenuItem onClick={handlePromoteToNode}>
                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                            Promote to Node
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={handleMoveToTrash}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Move to trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Deadline row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  <input
                    aria-label="Deadline date"
                    className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    onChange={(e) => handleDateChange(e.target.value)}
                    type="date"
                    value={toDateStr(bit.deadline)}
                  />
                  {bit.deadline && !bit.deadlineAllDay ? (
                    <input
                      aria-label="Deadline time"
                      className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      onChange={(e) => handleTimeChange(e.target.value)}
                      type="time"
                      value={toTimeStr(bit.deadline)}
                    />
                  ) : null}
                  {bit.deadline ? (
                    <button
                      type="button"
                      onClick={handleAllDayToggle}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                        bit.deadlineAllDay
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-accent",
                      )}
                    >
                      All day
                    </button>
                  ) : null}
                </div>

                {/* Description */}
                <textarea
                  aria-label="Description"
                  className="min-h-[80px] w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  onBlur={handleDescriptionBlur}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  placeholder="Add a description…"
                  rows={3}
                  value={localDescription}
                />

                {/* mtime */}
                <p className="text-xs text-muted-foreground">
                  Last updated:{" "}
                  {formatDistanceToNow(new Date(bit.mtime), { addSuffix: true })}
                </p>

                <div className="border-t border-border" />

                {/* Chunk pool (unscheduled steps) */}
                <ChunkPool chunks={chunks} bitId={bit.id} />

                {/* Timeline (scheduled / timed steps) */}
                {chunks.some((c) => c.time !== null) ? (
                  <ChunkTimeline
                    chunks={chunks}
                    bitDeadline={bit.deadline}
                    bitDeadlineAllDay={bit.deadlineAllDay}
                  />
                ) : null}

                {/* Empty state visual — shown when no chunks exist yet */}
                {!hasChunks ? (
                  <div className="flex flex-col items-center gap-1 py-2">
                    <div className="h-8 w-0.5 bg-border" />
                    <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30 bg-muted" />
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
