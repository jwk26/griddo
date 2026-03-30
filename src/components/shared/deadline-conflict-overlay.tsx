"use client";

import { cn } from "@/lib/utils";

type DeadlineConflictOverlayProps = {
  /** When true, renders the "Modify timeline" overlay on the wrapped content */
  isConflicted: boolean;
  onModify: () => void;
  onDismiss: () => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * Renders a "Modify timeline" blur overlay on child items whose deadlines
 * exceed a newly-shortened parent deadline.
 * Consumed by BitDetailPopup (Task 21), EditNodeDialog (Task 25c), and Calendar tasks.
 */
export function DeadlineConflictOverlay({
  isConflicted,
  onModify,
  onDismiss,
  children,
  className,
}: DeadlineConflictOverlayProps) {
  if (!isConflicted) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[10px] bg-background/70 backdrop-blur-[2px]">
        <p className="text-xs font-medium text-foreground">Deadline conflict</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onModify}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Modify timeline
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
