"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LucideIcon } from "lucide-react";
import { Calendar, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useGlobalUrgency } from "@/hooks/use-global-urgency";
import type { DragActiveItem } from "@/hooks/use-dnd";
import { getGridDeleteDropId } from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useEditModeStore } from "@/stores/edit-mode-store";
import { useSearchStore } from "@/stores/search-store";

type SidebarIconButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
};

function SidebarIconButton({
  icon: Icon,
  label,
  onClick,
  isActive = false,
}: SidebarIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function DeleteDropTarget() {
  const { isOver, setNodeRef } = useDroppable({
    id: getGridDeleteDropId(),
    data: { kind: "grid-delete-drop" },
  });

  return (
    <div
      ref={setNodeRef}
      aria-label="Drop here to delete"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg text-destructive motion-safe:animate-jiggle",
        isOver && "bg-destructive/10",
      )}
    >
      <X className="h-5 w-5" />
    </div>
  );
}

const noop = () => {};

export function Sidebar({
  onAddClick,
  dragActiveItem,
}: {
  onAddClick?: () => void;
  dragActiveItem?: DragActiveItem;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const globalUrgency = useGlobalUrgency();
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const toggleEditMode = useEditModeStore((state) => state.toggle);
  const isCalendarRoute = pathname.startsWith("/calendar/");
  const isTrashRoute = pathname === "/trash";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-12 flex-col items-center gap-1 border-r border-border bg-background py-3">
      <div className={cn(!onAddClick && "pointer-events-none opacity-40")}>
        <SidebarIconButton icon={Plus} label="Add item" onClick={onAddClick ?? noop} />
      </div>
      <SidebarIconButton
        icon={Pencil}
        label="Toggle edit mode"
        onClick={toggleEditMode}
        isActive={isEditMode}
      />
      {dragActiveItem?.type === "node" || dragActiveItem?.type === "bit" ? (
        <DeleteDropTarget />
      ) : (
        <>
          <div className={cn(dragActiveItem && "opacity-40 saturate-50 transition-all duration-150")}>
            <SidebarIconButton
              icon={Search}
              label="Search"
              onClick={() => useSearchStore.getState().open()}
            />
          </div>
          <div className={cn("relative", dragActiveItem && "opacity-40 saturate-50 transition-all duration-150")}>
            <SidebarIconButton
              icon={Calendar}
              label="Calendar"
              onClick={() => router.push("/calendar/weekly")}
              isActive={isCalendarRoute}
            />
            {globalUrgency ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                  globalUrgency === 1 && "bg-urgency-1",
                  globalUrgency === 2 && "bg-urgency-2",
                  globalUrgency === 3 && "bg-urgency-3",
                )}
              />
            ) : null}
          </div>
        </>
      )}
      <div className="mt-auto flex flex-col items-center gap-1">
        <div className={cn(dragActiveItem && "opacity-40 saturate-50 transition-all duration-150")}>
          <SidebarIconButton
            icon={Trash2}
            label="Trash"
            onClick={() => router.push("/trash")}
            isActive={isTrashRoute}
          />
        </div>
        <div className={cn(dragActiveItem && "opacity-40 saturate-50 transition-all duration-150")}>
          <ThemeToggle className="hover:bg-accent hover:text-foreground" />
        </div>
      </div>
    </aside>
  );
}
