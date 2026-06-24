"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Archive,
  CheckCircle2,
  GripVertical,
  Inbox,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useArchiveScratch } from "@/hooks/use-archive-scratch";
import { useCanArchiveScratch } from "@/hooks/use-can-archive-scratch";
import { useInbox } from "@/hooks/use-inbox";
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
  const isConsumed = row.consumedAt !== null;
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
      data-testid={isConsumed ? "breakdown-row-consumed" : undefined}
      className={cn(
        "group flex items-start gap-2 border-b border-border/30 py-2 transition-[background-color,border-color,color,opacity] last:border-b-0",
        isStaged && !isDragging && "opacity-50 transition-opacity duration-200",
        isDragging &&
          "opacity-30 border border-dashed border-muted bg-transparent",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        aria-label="Drag breakdown"
        className={cn(
          "mt-0.5 flex h-7 w-7 flex-shrink-0 cursor-grab items-center justify-center rounded-md border border-transparent text-muted-foreground/60 hover:border-border hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
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
            isConsumed
              ? "line-through text-muted-foreground/40"
              : isMuted
                ? "text-muted-foreground"
                : "text-foreground",
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

function ArchiveScratchBar({ scratchId }: { scratchId: string }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const clearSelection = useTriageStore((state) => state.clearSelection);
  const [isArchiving, setIsArchiving] = useState(false);
  const isArchivingRef = useRef(false);
  const { archiveScratch } = useArchiveScratch();

  async function handleConfirmArchive(): Promise<void> {
    if (isArchivingRef.current) return;

    isArchivingRef.current = true;
    setIsArchiving(true);

    try {
      await archiveScratch(scratchId);
      setIsConfirmOpen(false);
      clearSelection();
    } finally {
      isArchivingRef.current = false;
      setIsArchiving(false);
    }
  }

  return (
    <>
      <div
        data-testid="archive-scratch-bar"
        className="mx-3 mb-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 shadow-sm"
      >
        <div className="flex min-w-0 items-center gap-2">
          <CheckCircle2
            aria-hidden="true"
            className="h-4 w-4 flex-shrink-0 text-primary/80"
          />
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            All items processed
          </span>
        </div>
        <Button
          className="focus-visible:ring-2 focus-visible:ring-ring"
          size="sm"
          variant="outline"
          onClick={() => setIsConfirmOpen(true)}
        >
          <Archive aria-hidden="true" className="h-4 w-4" />
          Archive Scratch
        </Button>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this Scratch?</AlertDialogTitle>
            <AlertDialogDescription>
              This Scratch and its processed breakdown rows will be moved to
              your archive. You can access, view, or restore them at any time
              from the Archive View.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isArchiving}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmArchive();
              }}
            >
              Archive Scratch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function BreakdownPanel() {
  const selectedScratchId = useTriageStore((state) => state.selectedScratchId);
  const stagedCandidates = useTriageStore((state) => state.stagedCandidates);
  const scratchPoolExpanded = useTriageStore(
    (state) => state.scratchPoolExpanded,
  );
  const scratchPoolManualExpandedForId = useTriageStore(
    (state) => state.scratchPoolManualExpandedForId,
  );
  const setScratchPoolExpanded = useTriageStore(
    (state) => state.setScratchPoolExpanded,
  );
  const { activeScratchBits } = useInbox();
  const { breakdowns, createBreakdown, deleteBreakdown } =
    useScratchBreakdowns(selectedScratchId);
  const canArchiveScratch = useCanArchiveScratch(
    selectedScratchId,
    breakdowns,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const isComposingRef = useRef(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const selectedScratch = useMemo(
    () => activeScratchBits.find((bit) => bit.id === selectedScratchId) ?? null,
    [activeScratchBits, selectedScratchId],
  );
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

  function collapsePoolIfArmed() {
    if (
      selectedScratchId !== null &&
      scratchPoolExpanded === true &&
      scratchPoolManualExpandedForId !== selectedScratchId
    ) {
      setScratchPoolExpanded(false);
    }
  }

  async function handleAdd({
    keepInputOpen = false,
  }: { keepInputOpen?: boolean } = {}): Promise<void> {
    if (isSubmittingRef.current) return;
    const trimmed = newContent.trim();
    if (!trimmed) {
      if (!keepInputOpen) {
        setIsAdding(false);
        setNewContent("");
      }
      return;
    }

    isSubmittingRef.current = true;
    try {
      await createBreakdown(trimmed);
      setNewContent("");
      if (keepInputOpen) {
        setIsAdding(true);
        inputRef.current?.focus();
      } else {
        setIsAdding(false);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      if (isComposingRef.current || event.nativeEvent.isComposing) return;
      event.preventDefault();
      void handleAdd({ keepInputOpen: true });
      return;
    }

    if (event.key === "Escape") {
      setIsAdding(false);
      setNewContent("");
      return;
    }

    // First-keystroke collapse: printable single characters only, no modifiers, not composing
    if (
      event.key.length === 1 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !isComposingRef.current &&
      !event.nativeEvent.isComposing
    ) {
      collapsePoolIfArmed();
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
        <div
          aria-label={`Selected Scratch: ${selectedScratch?.title ?? "Unknown Scratch"}`}
          className="mx-3 mt-2 flex min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5"
        >
          <Inbox
            aria-hidden="true"
            className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-foreground">
              {selectedScratch?.title ?? "Unknown Scratch"}
            </div>
            {selectedScratch !== null && (
              <div className="text-[10px] text-muted-foreground/70">
                {formatRelativeTime(selectedScratch.createdAt)}
              </div>
            )}
          </div>
        </div>

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

      {canArchiveScratch && selectedScratchId !== null && (
        <ArchiveScratchBar scratchId={selectedScratchId} />
      )}

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
