import type { CSSProperties, ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type GridCellProps = {
  x: number;
  y: number;
  isEditMode: boolean;
  isEmpty: boolean;
  borderOpacity?: string;
  onAddClick?: () => void;
  children?: ReactNode;
};

export function GridCell({
  x,
  y,
  isEditMode,
  isEmpty,
  borderOpacity = "0.15",
  onAddClick,
  children,
}: GridCellProps) {
  const borderStyle: CSSProperties = {
    borderColor: `hsl(var(--border) / ${borderOpacity})`,
  };

  return (
    <div
      className={cn(
        "relative rounded-md transition-all",
        isEditMode
          ? "border-2 border-dashed border-muted-foreground/30"
          : "border border-dashed",
        isEmpty && isEditMode && "flex min-h-[5rem] items-center justify-center",
      )}
      data-position={`${x},${y}`}
      style={isEditMode ? undefined : borderStyle}
    >
      {children}
      {isEmpty && isEditMode && onAddClick ? (
        <button
          type="button"
          aria-label="Add item"
          className="flex items-center justify-center text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          onClick={onAddClick}
        >
          <Plus className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
