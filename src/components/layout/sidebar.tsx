"use client";

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useGlobalUrgency } from "@/hooks/use-global-urgency";
import { cn } from "@/lib/utils";
import { useEditModeStore } from "@/stores/edit-mode-store";
import { useSidebarStore } from "@/stores/sidebar-store";

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
        "flex h-10 w-10 items-center justify-center rounded-lg p-2.5 transition-colors",
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

const noop = () => {};

export function Sidebar({
  level = 0,
  onAddClick,
}: {
  level?: number;
  onAddClick?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const globalUrgency = useGlobalUrgency();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const toggleEditMode = useEditModeStore((state) => state.toggle);
  const isCalendarRoute = pathname.startsWith("/calendar/");
  const foldButton = (
    <SidebarIconButton
      icon={isOpen ? ChevronLeft : ChevronRight}
      label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      onClick={toggleSidebar}
    />
  );

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col items-center gap-1 overflow-hidden border-r border-border bg-background py-4 transition-all",
          isOpen ? "w-sidebar px-2" : "w-sidebar-collapsed px-0",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-1 flex-col items-center gap-1 transition-opacity",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <SidebarIconButton icon={Plus} label="Add item" onClick={onAddClick ?? noop} />
          <SidebarIconButton
            icon={Pencil}
            label="Toggle edit mode"
            onClick={toggleEditMode}
            isActive={isEditMode}
          />
          <SidebarIconButton icon={Search} label="Search" onClick={noop} />
          <ThemeToggle />
          <div className="relative">
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
          {level === 0 ? (
            <SidebarIconButton icon={Trash} label="Trash" onClick={noop} />
          ) : null}
        </div>
        <div className="mt-auto">{foldButton}</div>
      </aside>

      {isOpen ? null : (
        <div className="fixed bottom-4 left-2 z-40">{foldButton}</div>
      )}
    </>
  );
}
