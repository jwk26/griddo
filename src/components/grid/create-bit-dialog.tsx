"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_ICON,
  NODE_ICON_MAP,
  NODE_ICON_NAMES,
} from "@/lib/constants/node-icons";
import { cn } from "@/lib/utils";
import type { Bit } from "@/types";

type Priority = Bit["priority"];
const PRIORITY_OPTIONS: Priority[] = ["high", "mid", "low", null];
const PRIORITY_LABELS: Record<string, string> = { high: "High", mid: "Mid", low: "Low" };

type CreateBitDialogValues = {
  title: string;
  icon: string;
  deadline: number | null;
  deadlineAllDay: boolean;
  priority: Priority;
};

type CreateBitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateBitDialogValues) => Promise<void>;
  error?: string;
};

export function CreateBitDialog({
  open,
  onOpenChange,
  onSubmit,
  error,
}: CreateBitDialogProps) {
  const titleId = useId();
  const titleErrorId = useId();
  const iconId = useId();
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [priority, setPriority] = useState<Priority>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    if (open) return;
    setTitle("");
    setIcon(DEFAULT_ICON);
    setDateStr("");
    setTimeStr("");
    setAllDay(false);
    setPriority(null);
    setIsSubmitting(false);
    setTitleError(false);
  }, [open]);

  function buildDeadline(): { deadline: number | null; deadlineAllDay: boolean } {
    if (!dateStr) return { deadline: null, deadlineAllDay: false };
    const time = allDay ? "00:00" : (timeStr || "00:00");
    return {
      deadline: new Date(`${dateStr}T${time}`).getTime(),
      deadlineAllDay: allDay,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length === 0) { setTitleError(true); return; }
    if (isSubmitting) return;
    setTitleError(false);
    setIsSubmitting(true);
    try {
      const { deadline, deadlineAllDay } = buildDeadline();
      await onSubmit({ title, icon, deadline, deadlineAllDay, priority });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Bit</DialogTitle>
          <DialogDescription>
            Add a new bit and place it in the nearest available cell.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={titleId}>
              Title
            </label>
            <Input
              autoFocus
              aria-describedby={titleErrorId}
              aria-invalid={titleError}
              id={titleId}
              maxLength={100}
              onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
              type="text"
              value={title}
            />
            <p id={titleErrorId} className="min-h-[1rem] text-sm text-destructive">
              {titleError ? "Title is required." : ""}
            </p>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground" id={iconId}>
              Icon
            </div>
            <div
              aria-labelledby={iconId}
              className="grid grid-cols-5 gap-2 sm:grid-cols-6"
              role="radiogroup"
            >
              {NODE_ICON_NAMES.map((iconName) => {
                const Icon = NODE_ICON_MAP[iconName];
                const isSelected = iconName === icon;
                return (
                  <button
                    key={iconName}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${iconName} icon`}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2"
                        : "border-input hover:border-primary/50 hover:text-foreground",
                    )}
                    onClick={() => setIcon(iconName)}
                    title={iconName}
                    type="button"
                  >
                    <Icon aria-hidden={true} className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Priority</div>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={String(p)}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "inline-flex items-center rounded-full px-[10px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.05em] transition-colors",
                    p === "high" && priority === "high" && "bg-priority-high-bg text-priority-high ring-2 ring-priority-high",
                    p === "high" && priority !== "high" && "bg-priority-high-bg/40 text-priority-high/70 hover:bg-priority-high-bg",
                    p === "mid" && priority === "mid" && "bg-priority-mid-bg text-priority-mid ring-2 ring-priority-mid",
                    p === "mid" && priority !== "mid" && "bg-priority-mid-bg/40 text-priority-mid/70 hover:bg-priority-mid-bg",
                    p === "low" && priority === "low" && "bg-priority-low-bg text-priority-low ring-2 ring-priority-low",
                    p === "low" && priority !== "low" && "bg-priority-low-bg/40 text-priority-low/70 hover:bg-priority-low-bg",
                    p === null && priority === null && "bg-secondary text-foreground ring-2 ring-ring",
                    p === null && priority !== null && "bg-secondary/60 text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {p ? PRIORITY_LABELS[p] : "None"}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Deadline</div>
            <div className="flex items-center gap-2">
              <Input
                className="w-[150px]"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
              />
              {!allDay && (
                <Input
                  className="w-[110px]"
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                />
              )}
              <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                All day
              </label>
            </div>
          </div>

          <p role="alert" className="min-h-[1.25rem] text-sm text-destructive">
            {error ?? ""}
          </p>

          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              Create Bit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
