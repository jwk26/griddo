"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LucideIcon } from "lucide-react";
import { Calendar, Home, Inbox, Layers, Pencil, Plus, Search, Trash2, X, Zap } from "lucide-react";
import { motion, type HTMLMotionProps, type MotionProps } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { ColorThemeToggle } from "@/components/layout/color-theme-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGlobalUrgency } from "@/hooks/use-global-urgency";
import type { DragActiveItem } from "@/hooks/use-dnd";
import {
  sidebarDragTargetActive,
  sidebarDragTargetRest,
  sidebarDragTargetTransition,
} from "@/lib/animations/layout";
import { getGridDeleteDropId } from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useEditModeStore } from "@/stores/edit-mode-store";
import { useSearchStore } from "@/stores/search-store";

type SidebarIconButtonProps = {
  className?: string;
  disabled?: boolean;
  icon: LucideIcon;
  title?: string | null;
  label: string;
  motionProps?: Pick<MotionProps, "animate" | "initial" | "transition">;
  onClick?: () => void;
  isActive?: boolean;
};

const SidebarIconButton = forwardRef<
  HTMLButtonElement,
  SidebarIconButtonProps & Omit<HTMLMotionProps<"button">, "children" | "title" | "onClick">
>(function SidebarIconButton(
  {
    className,
    disabled = false,
    icon: Icon,
    title,
    label,
    motionProps,
    onClick,
    isActive = false,
    ...rest
  },
  ref,
) {
  const buttonTitle = title === undefined ? label : title;

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      disabled={disabled}
      title={buttonTitle ?? undefined}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg border border-transparent p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
      initial={motionProps?.initial}
      animate={motionProps?.animate}
      onClick={onClick}
      transition={motionProps?.transition}
      {...rest}
    >
      <Icon className="h-5 w-5" />
    </motion.button>
  );
});

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
  onNodeCreate,
  onBitCreate,
}: {
  onAddClick?: () => void;
  dragActiveItem?: DragActiveItem;
  onNodeCreate?: () => void;
  onBitCreate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const globalUrgency = useGlobalUrgency();
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const toggleEditMode = useEditModeStore((state) => state.toggle);
  const isCalendarRoute = pathname.startsWith("/calendar/");
  const isTrashRoute = pathname === "/trash";
  const isGridItemDrag = dragActiveItem?.type === "node" || dragActiveItem?.type === "bit";
  const isPrototypeRoute = pathname.startsWith("/prototype/");

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-12 flex-col items-center gap-1 border-r border-border bg-background py-3">
      {isCalendarRoute || isPrototypeRoute ? (
        <SidebarIconButton
          className="active:scale-95"
          icon={Home}
          label="Home"
          onClick={() => router.push("/")}
        />
      ) : null}

      <Popover>
        <PopoverTrigger asChild>
          <SidebarIconButton
            icon={Inbox}
            label="Triage Prototypes"
            isActive={isPrototypeRoute}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex w-44 flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md"
          side="right"
          sideOffset={12}
        >
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Triage Themes
          </div>
          {[
            { id: "griddo", label: "GridDO" },
            { id: "tiny-desk", label: "Tiny Desk" },
            { id: "neumorphism", label: "Neumorphism" },
            { id: "origami", label: "Origami" },
            { id: "terminal", label: "Terminal" },
            { id: "retro-mac", label: "Retro Mac" },
            { id: "claymorphism", label: "3D Clay" },
            { id: "graphite", label: "Graphite" },
          ].map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                pathname === `/prototype/inbox-triage-${theme.id}` && "bg-accent text-foreground"
              )}
              onClick={() => {
                router.push(`/prototype/inbox-triage-${theme.id}`);
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {theme.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {isCalendarRoute ? (
        <Popover open={isChooserOpen} onOpenChange={setIsChooserOpen}>
          <PopoverTrigger asChild>
            <SidebarIconButton icon={Plus} label="Add item" onClick={noop} />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex w-32 flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md"
            onCloseAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={() => { (document.activeElement as HTMLElement)?.blur(); }}
            side="right"
            sideOffset={12}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              onClick={() => {
                setIsChooserOpen(false);
                onNodeCreate?.();
              }}
            >
              <Layers className="h-4 w-4" />
              Node
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              onClick={() => {
                setIsChooserOpen(false);
                onBitCreate?.();
              }}
            >
              <Zap className="h-4 w-4" />
              Bit
            </button>
          </PopoverContent>
        </Popover>
      ) : (
        <div className={cn(!onAddClick && "pointer-events-none opacity-40")}>
          <SidebarIconButton icon={Plus} label="Add item" onClick={onAddClick ?? noop} />
        </div>
      )}
      {isCalendarRoute ? (
        <div className="cursor-not-allowed" title="Editing restricted in Calendar view">
          <SidebarIconButton
            className="opacity-40 pointer-events-none"
            disabled={true}
            icon={Pencil}
            isActive={false}
            label="Toggle edit mode"
            onClick={toggleEditMode}
            title={null}
          />
        </div>
      ) : (
        <SidebarIconButton
          className={cn(isGridItemDrag && "border-primary/60")}
          icon={Pencil}
          label="Toggle edit mode"
          motionProps={{
            initial: false,
            animate: isGridItemDrag ? sidebarDragTargetActive : sidebarDragTargetRest,
            transition: sidebarDragTargetTransition,
          }}
          onClick={toggleEditMode}
          isActive={isEditMode}
        />
      )}
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
        <div className={cn(dragActiveItem && "opacity-40 saturate-50 transition-all duration-150")}>
          <ColorThemeToggle className="hover:bg-accent hover:text-foreground" />
        </div>
      </div>
    </aside>
  );
}
