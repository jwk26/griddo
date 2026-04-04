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
          className="text-muted-foreground/50 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          onClick={onAddClick}
        >
          <div className="m-auto flex aspect-square w-full max-w-[4rem] items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
        </button>
      ) : null}
    </div>
  );
}
