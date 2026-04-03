"use client";

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import {
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ChunkPool, type ChunkPoolHandle } from "@/components/bit-detail/chunk-pool";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBitDetailActions } from "@/hooks/use-bit-detail-actions";
import { useBitDetail } from "@/hooks/use-bit-detail";
import { bitDetailPopupVariants } from "@/lib/animations/layout";
import { NODE_ICON_MAP, NODE_ICON_NAMES } from "@/lib/constants/node-icons";
import { cn } from "@/lib/utils";
import type { Bit } from "@/types";

type Priority = Bit["priority"];
const PRIORITY_CYCLE: Priority[] = ["high", "mid", "low", null];
const PRIORITY_LABELS: Record<NonNullable<Priority>, string> = {
  high: "High",
  mid: "Mid",
  low: "Low",
};
const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
  const { updateBit, softDeleteBit, promoteBitToNode } = useBitDetailActions();
  const { bit, chunks, parentNode, isOpen, close } = useBitDetail();
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [isDeadlineEditing, setIsDeadlineEditing] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const chunkPoolRef = useRef<ChunkPoolHandle>(null);

  useEffect(() => {
    if (!bit) return;
    setLocalTitle(bit.title);
    setLocalDescription(bit.description);
    setIsDescriptionOpen(!!bit.description);
    setIsDeadlineEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bit?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !iconPickerOpen) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, iconPickerOpen]);

  if (!isOpen) return null;

  async function handleTitleBlur() {
    if (!bit) return;
    const trimmed = localTitle.trim();
    if (!trimmed) {
      setLocalTitle(bit.title);
      return;
    }
    if (trimmed !== bit.title) {
      await updateBit(bit.id, { title: trimmed });
    }
  }

  async function handleDescriptionBlur() {
    if (!bit) return;
    if (localDescription !== bit.description) {
      await updateBit(bit.id, { description: localDescription });
    }
    if (!localDescription.trim()) {
      setIsDescriptionOpen(false);
    }
  }

  async function handlePriorityToggle() {
    if (!bit) return;
    await updateBit(bit.id, { priority: nextPriority(bit.priority) });
  }

  async function handleIconSelect(iconName: string) {
    if (!bit) return;
    setIconPickerOpen(false);
    if (iconName !== bit.icon) {
      await updateBit(bit.id, { icon: iconName });
    }
  }

  async function handleDateChange(dateStr: string) {
    if (!bit) return;
    if (!dateStr) {
      await updateBit(bit.id, { deadline: null, deadlineAllDay: false });
      return;
    }
    const timeStr = bit.deadlineAllDay ? "00:00" : (toTimeStr(bit.deadline) || "00:00");
    await updateBit(bit.id, { deadline: new Date(`${dateStr}T${timeStr}`).getTime() });
  }

  async function handleTimeChange(timeStr: string) {
    if (!bit) return;
    const dateStr = toDateStr(bit.deadline) || format(new Date(), "yyyy-MM-dd");
    await updateBit(bit.id, { deadline: new Date(`${dateStr}T${timeStr}`).getTime() });
  }

  async function handleAllDayToggle() {
    if (!bit) return;
    await updateBit(bit.id, { deadlineAllDay: !bit.deadlineAllDay });
  }

  async function handleMoveToTrash() {
    if (!bit) return;
    await softDeleteBit(bit.id);
    close();
  }

  async function handleStatusToggle() {
    if (!bit) return;
    await updateBit(bit.id, { status: bit.status === "complete" ? "active" : "complete" });
  }

  async function handlePromoteToNode() {
    if (!bit) return;
    await promoteBitToNode(bit.id);
    close();
  }

  function handleDeadlineEditorBlur(event: FocusEvent<HTMLDivElement>) {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
      setIsDeadlineEditing(false);
    }
  }

  function handleDeadlineEditorKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    setIsDeadlineEditing(false);
  }

  const Icon = bit ? (NODE_ICON_MAP[bit.icon] ?? NODE_ICON_MAP.Box) : null;
  const hasChunks = chunks.length > 0;
  const canPromote = hasChunks && (parentNode === null || parentNode.level < 2);
  const completedCount = chunks.filter((chunk) => chunk.status === "complete").length;
  const totalCount = chunks.length;
  const ringRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringRatio);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        />
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
              <div className="flex flex-col">
                <div className="flex items-center gap-3 px-5 pt-5 pb-0">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Change icon"
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        >
                          {Icon ? <Icon className="h-5 w-5" /> : null}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <div className="grid grid-cols-5 gap-1.5">
                          {NODE_ICON_NAMES.map((name) => {
                            const PickerIcon = NODE_ICON_MAP[name];
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
                                <PickerIcon className="h-4 w-4" />
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <input
                      aria-label="Bit title"
                      className="min-w-0 flex-1 truncate bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                      maxLength={200}
                      onBlur={handleTitleBlur}
                      onChange={(event) => setLocalTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                      placeholder="Untitled"
                      type="text"
                      value={localTitle}
                    />
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
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
                        {canPromote ? (
                          <>
                            <DropdownMenuItem onClick={handlePromoteToNode}>
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Promote to Node
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        ) : null}
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
                </div>

                <div className="flex flex-wrap items-center gap-2 px-5 pt-3 pb-0">
                  <button
                    type="button"
                    aria-label={`Priority: ${bit.priority ?? "none"}. Click to cycle.`}
                    onClick={handlePriorityToggle}
                    className={cn(
                      "rounded-full px-[7px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.05em] transition-colors",
                      bit.priority === "high" && "bg-priority-high-bg text-priority-high",
                      bit.priority === "mid" && "bg-priority-mid-bg text-priority-mid",
                      bit.priority === "low" && "bg-priority-low-bg text-priority-low",
                      !bit.priority && "bg-secondary text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {bit.priority ? PRIORITY_LABELS[bit.priority] : "—"}
                  </button>

                  {isDeadlineEditing ? (
                    <div
                      className="flex items-center gap-2"
                      onBlur={handleDeadlineEditorBlur}
                      onKeyDown={handleDeadlineEditorKeyDown}
                    >
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      <input
                        aria-label="Deadline date"
                        className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        onChange={(event) => void handleDateChange(event.target.value)}
                        type="date"
                        value={toDateStr(bit.deadline)}
                      />
                      {!bit.deadlineAllDay ? (
                        <input
                          aria-label="Deadline time"
                          className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          onChange={(event) => void handleTimeChange(event.target.value)}
                          type="time"
                          value={toTimeStr(bit.deadline)}
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleAllDayToggle()}
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                          bit.deadlineAllDay
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-accent",
                        )}
                      >
                        All day
                      </button>
                    </div>
                  ) : bit.deadline ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Edit deadline date"
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        onClick={() => setIsDeadlineEditing(true)}
                      >
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        {format(new Date(bit.deadline), "MMM d")}
                      </button>
                      <button
                        type="button"
                        aria-label="Clear deadline"
                        className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
                        onClick={() => void handleDateChange("")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {!bit.deadlineAllDay ? (
                        <button
                          type="button"
                          aria-label="Edit deadline time"
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          onClick={() => setIsDeadlineEditing(true)}
                        >
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          {format(new Date(bit.deadline), "h:mm a")}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        aria-label={bit.deadlineAllDay ? "All day on" : "All day off"}
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                          bit.deadlineAllDay
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-accent",
                        )}
                        onClick={() => void handleAllDayToggle()}
                      >
                        ALL
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setIsDeadlineEditing(true)}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Add date
                    </button>
                  )}
                </div>

                <div className="px-5 pt-3">
                  {isDescriptionOpen ? (
                    <textarea
                      aria-label="Description"
                      className="min-h-[60px] w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      onBlur={() => void handleDescriptionBlur()}
                      onChange={(event) => setLocalDescription(event.target.value)}
                      placeholder="Add a description…"
                      rows={3}
                      value={localDescription}
                    />
                  ) : (
                    <button
                      type="button"
                      className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setIsDescriptionOpen(true)}
                    >
                      Add description
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between px-5 pt-3 pb-0">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => chunkPoolRef.current?.startAdding()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add a step
                  </button>
                  {totalCount > 0 ? (
                    <div
                      aria-label={`${completedCount} of ${totalCount} steps complete`}
                      className="relative h-10 w-10 flex-shrink-0"
                      role="img"
                    >
                      <svg
                        aria-hidden="true"
                        className="-rotate-90 h-full w-full"
                        viewBox="0 0 40 40"
                      >
                        <circle
                          cx="20"
                          cy="20"
                          r={RING_RADIUS}
                          fill="none"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="3"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r={RING_RADIUS}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={RING_CIRCUMFERENCE}
                          strokeDashoffset={ringOffset}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] leading-none font-medium text-muted-foreground">
                          {Math.round(ringRatio * 100)}%
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="px-5 pt-3">
                  <div className="relative">
                    {chunks.length > 0 ? (
                      <div
                        className={cn(
                          "absolute left-[7px] w-0.5 bg-border",
                          bit.deadline ? "top-2 bottom-0" : "top-2 bottom-2",
                        )}
                      />
                    ) : null}
                    <ChunkPool ref={chunkPoolRef} chunks={chunks} bitId={bit.id} />
                    {chunks.length === 0 ? (
                      <div className="flex flex-col items-start gap-1 py-2">
                        <div className="h-8 w-0.5 bg-border" />
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 bg-popover" />
                      </div>
                    ) : null}
                    {bit.deadline ? (
                      <div className="flex items-center gap-3 pb-5 pt-1">
                        <Clock className="relative z-10 h-4 w-4 flex-shrink-0 bg-popover text-destructive" />
                        <span className="text-sm text-destructive">
                          {format(
                            new Date(bit.deadline),
                            bit.deadlineAllDay ? "MMM d, yyyy" : "MMM d, yyyy h:mm a",
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="pb-5" />
                    )}
                  </div>
                </div>
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
