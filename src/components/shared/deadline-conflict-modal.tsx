"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeadlineConflictModalProps = {
  open: boolean;
  /** The parent's deadline timestamp */
  parentDeadline: number;
  parentDeadlineAllDay?: boolean;
  /** Called when the user chooses to update the parent's deadline to match */
  onUpdateParent: () => void;
  /** Called when the user chooses to keep the child deadline (cancel the change) */
  onKeepChild: () => void;
};

/**
 * "Update parent's deadline too?" modal — surfaced when a child deadline
 * would exceed the parent (Hook 2 — Deadline hierarchy).
 * Consumed by BitDetailPopup (Task 21) and EditNodeDialog (Task 25c).
 */
export function DeadlineConflictModal({
  open,
  parentDeadline,
  parentDeadlineAllDay = false,
  onUpdateParent,
  onKeepChild,
}: DeadlineConflictModalProps) {
  const parentLabel = format(
    new Date(parentDeadline),
    parentDeadlineAllDay ? "MMM d, yyyy" : "MMM d, yyyy h:mm a",
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onKeepChild(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deadline conflict</DialogTitle>
          <DialogDescription>
            This deadline exceeds the parent&apos;s deadline of{" "}
            <strong>{parentLabel}</strong>.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Would you like to extend the parent&apos;s deadline to accommodate this change?
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onKeepChild}>
            Cancel change
          </Button>
          <Button type="button" onClick={onUpdateParent}>
            Update parent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
