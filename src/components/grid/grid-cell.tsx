import type { CSSProperties, ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type GridCellProps = {
  x: number;
  y: number;
  isEditMode: boolean;
  isEmpty: boolean;
  isDragOver?: boolean;
  borderOpacity?: string;
  onAddClick?: () => void;
  children?: ReactNode;
};

export function GridCell({
  x,
  y,
  isEditMode,
  isEmpty,
  isDragOver = false,
  borderOpacity = "0.15",
  onAddClick,
  children,
}: GridCellProps) {
  const borderStyle: CSSProperties = {
    borderColor: `hsl(var(--border) / ${borderOpacity})`,
  };
  const showEditModeAddButton = isEmpty && isEditMode && onAddClick;
  const showDragOverIndicator = isEmpty && isDragOver && !isEditMode;
  const showEmptyAffordance = showEditModeAddButton || showDragOverIndicator;

  return (
    <div
      className={cn(
        "relative rounded-md transition-all",
        isEditMode
          ? "border-2 border-dashed border-muted-foreground/30"
          : "border border-dashed",
        showEmptyAffordance && "flex h-full min-h-[5rem] items-center justify-center",
      )}
      data-position={`${x},${y}`}
      style={isEditMode ? undefined : borderStyle}
    >
      {children}
      {showEditModeAddButton ? (
        <button
          type="button"
          aria-label="Add item"
          className="group flex h-full w-full items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          onClick={onAddClick}
        >
          <span className="flex aspect-square w-full max-w-[4rem] items-center justify-center text-muted-foreground/50 transition-colors group-hover:text-muted-foreground">
            <Plus className="h-5 w-5" />
          </span>
        </button>
      ) : null}
      {showDragOverIndicator ? (
        <div aria-hidden={true} className="pointer-events-none flex h-full w-full items-center justify-center rounded-md bg-primary/5">
          <div className="flex aspect-square w-full max-w-[4rem] items-center justify-center text-muted-foreground/50">
            <Plus className="h-5 w-5" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
