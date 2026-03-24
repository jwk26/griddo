"use client";

import { X } from "lucide-react";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { getAgingSaturation, getAgingState } from "@/lib/utils/aging";
import { cn } from "@/lib/utils";
import type { Node } from "@/types";

export function NodeCard({
  node,
  onClick,
  isEditMode = false,
}: {
  node: Node;
  onClick: () => void;
  isEditMode?: boolean;
}) {
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;
  const saturation = getAgingSaturation(getAgingState(node.mtime));

  return (
    <div className="relative flex h-full items-center justify-center">
      <button
        type="button"
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isEditMode && "motion-safe:animate-jiggle",
        )}
        onClick={onClick}
        style={{ filter: `saturate(${saturation})` }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: node.color }}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
        <span className="max-w-[5rem] truncate text-xs font-medium text-foreground">
          {node.title}
        </span>
      </button>

      {isEditMode ? (
        <button
          type="button"
          aria-label={`Delete ${node.title}`}
          className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
