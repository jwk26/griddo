"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useScratchBreakdowns } from "@/hooks/use-scratch-breakdowns";
import type { ScratchBreakdown } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import { useTriageStore } from "@/stores/triage-store";

function BreakdownRow({
  row,
  isStaged,
  onDelete,
}: {
  row: ScratchBreakdown;
  isStaged: boolean;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
  } = useDraggable({
    id: `triage-breakdown:${row.id}`,
    data: { kind: "triage-breakdown", id: row.id, label: row.content },
  });
  const isMuted = isStaged || isDragging;
  const gripColorClass =
    isStaged && !isDragging
      ? "text-muted-foreground/20"
      : isMuted
        ? "text-muted-foreground"
        : "text-muted-foreground/45";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-start gap-2 border-b border-border/30 py-2 transition-[background-color,border-color,color,opacity] last:border-b-0",
        isStaged && "opacity-50 transition-opacity duration-200",
        isDragging &&
          "opacity-30 border border-dashed border-muted bg-transparent",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        aria-label="Drag breakdown"
        className={cn(
          "mt-0.5 flex h-4 w-4 flex-shrink-0 cursor-grab items-center justify-center active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVertical
          aria-hidden="true"
          className={cn("h-4 w-4 transition-colors", gripColorClass)}
          data-testid="breakdown-grip"
        />
      </button>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "whitespace-pre-wrap break-words text-sm leading-5 transition-colors",
            isMuted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {row.content}
        </div>
        <div
          className={cn(
            "mt-1 text-[10px] transition-colors",
            isMuted ? "text-muted-foreground/40" : "text-muted-foreground/70",
          )}
        >
          {formatRelativeTime(row.createdAt)}
        </div>
      </div>
      <button
        aria-label="Delete breakdown"
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "text-muted-foreground",
        )}
        title="Delete breakdown"
        type="button"
        onClick={() => onDelete(row.id)}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function BreakdownPanel() {
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const stagedCandidates = useTriageStore((state) => state.stagedCandidates);
  const { breakdowns, createBreakdown, deleteBreakdown } =
    useScratchBreakdowns(selectedScratchId);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const isComposingRef = useRef(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const stagedSourceBreakdownIds = useMemo(
    () =>
      new Set(
        (stagedCandidates[selectedScratchId ?? ""] ?? []).map(
          (candidate) => candidate.sourceBreakdownId,
        ),
      ),
    [selectedScratchId, stagedCandidates],
  );

  useEffect(() => {
    if (!isAdding) return;
    inputRef.current?.focus();
  }, [isAdding]);

  useEffect(() => {
    setPendingDeleteId(null);
  }, [selectedScratchId]);

  async function handleAdd(): Promise<void> {
    if (isSubmittingRef.current) return;
    const trimmed = newContent.trim();
    if (!trimmed) {
      setIsAdding(false);
      setNewContent("");
      return;
    }

    isSubmittingRef.current = true;
    try {
      await createBreakdown(trimmed);
      setIsAdding(false);
      setNewContent("");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      if (isComposingRef.current || event.nativeEvent.isComposing) return;
      event.preventDefault();
      void handleAdd();
      return;
    }

    if (event.key === "Escape") {
      setIsAdding(false);
      setNewContent("");
    }
  }

  function handlePlaceholderKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setIsAdding(true);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (pendingDeleteId === null) return;
    await deleteBreakdown(pendingDeleteId);
    setPendingDeleteId(null);
  }

  if (selectedScratchId === null) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
          Select a Scratch to view breakdowns
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {breakdowns.map((row) => {
          const isStaged = stagedSourceBreakdownIds.has(row.id);

          return (
            <BreakdownRow
              key={row.id}
              isStaged={isStaged}
              row={row}
              onDelete={setPendingDeleteId}
            />
          );
        })}
      </div>

      <div className="border-t border-border px-3 py-2">
        {isAdding ? (
          <input
            ref={inputRef}
            className="block h-8 w-full appearance-none rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            maxLength={500}
            onBlur={() => void handleAdd()}
            onChange={(event) => setNewContent(event.target.value)}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Add a note..."
            type="text"
            value={newContent}
          />
        ) : (
          <div
            className="flex h-8 cursor-text items-center rounded-md px-2 text-sm text-muted-foreground hover:bg-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            role="button"
            tabIndex={0}
            onClick={() => setIsAdding(true)}
            onKeyDown={handlePlaceholderKeyDown}
          >
            Add a note...
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete breakdown?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be removed from the selected Scratch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
