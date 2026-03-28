"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { useCalendarStore } from "@/stores/calendar-store";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import type { Node } from "@/types";

function DraggableNodeIcon({
  node,
  onClick,
}: {
  node: Node;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: { id: node.id, type: "node" },
  });
  const Icon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP.Box;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={setNodeRef}
          type="button"
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl transition-transform hover:scale-105",
            isDragging && "opacity-50",
          )}
          onClick={onClick}
          style={{
            backgroundColor: node.color,
            transform: transform
              ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
              : undefined,
          }}
          {...attributes}
          {...listeners}
        >
          <Icon className="h-6 w-6 text-white" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{node.title}</TooltipContent>
    </Tooltip>
  );
}

function DraggableRow({
  title,
  subtitle,
  color,
  iconName,
  dragType,
  dragId,
  onClick,
  trailing,
}: {
  title: string;
  subtitle?: string;
  color?: string;
  iconName: string;
  dragType: "node" | "bit";
  dragId: string;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: dragId,
    data: { id: dragId, type: dragType },
  });
  const Icon = NODE_ICON_MAP[iconName] ?? NODE_ICON_MAP.Box;

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-transparent bg-background/60 px-3 py-2 text-left transition-colors hover:border-border hover:bg-accent/60",
        isDragging && "opacity-50",
      )}
      onClick={onClick}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      <GripVertical
        className="h-4 w-4 flex-shrink-0 text-muted-foreground"
        {...attributes}
        {...listeners}
      />
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: color ?? "hsl(var(--secondary))" }}
      >
        <Icon className={cn("h-4 w-4", color ? "text-white" : "text-muted-foreground")} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {trailing}
    </button>
  );
}

export function NodePool() {
  const [query, setQuery] = useState("");
  const { bits, isLoading, nodes, nodeMap } = useCalendarData();
  const drillDownPath = useCalendarStore((state) => state.drillDownPath);
  const popDrillDown = useCalendarStore((state) => state.popDrillDown);
  const pushDrillDown = useCalendarStore((state) => state.pushDrillDown);
  const currentNodeId = drillDownPath.at(-1) ?? null;
  const currentNode = currentNodeId ? nodeMap.get(currentNodeId) : undefined;
  const { isOver, setNodeRef } = useDroppable({
    id: "calendar-unschedule:nodes",
    data: { kind: "calendar-unschedule" },
  });
  const normalizedQuery = query.trim().toLowerCase();

  const childNodes = useMemo(
    () =>
      nodes.filter(
        (node) =>
          node.parentId === currentNodeId &&
          node.title.toLowerCase().includes(normalizedQuery),
      ),
    [currentNodeId, nodes, normalizedQuery],
  );
  const childBits = useMemo(
    () =>
      currentNodeId
        ? bits.filter(
            (bit) =>
              bit.parentId === currentNodeId &&
              bit.title.toLowerCase().includes(normalizedQuery),
          )
        : [],
    [bits, currentNodeId, normalizedQuery],
  );

  return (
    <TooltipProvider>
      <section
        ref={setNodeRef}
        className={cn("flex h-full flex-col gap-3 p-4", isOver && "bg-accent/60")}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Node pool</h2>
            {currentNode ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={popDrillDown}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentNode
              ? `Inside ${currentNode.title}`
              : "Drag root nodes or drill into a node to schedule its contents."}
          </p>
        </div>
        <Input
          aria-label="Search nodes"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={currentNode ? "Search inside node" : "Search nodes"}
          value={query}
        />

        {!currentNode ? (
          <div className="grid min-h-0 flex-1 grid-cols-4 content-start gap-3 overflow-y-auto pr-1">
            {!isLoading && childNodes.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No nodes yet
              </div>
            ) : null}
            {childNodes.map((node) => (
              <DraggableNodeIcon
                key={node.id}
                node={node}
                onClick={() => pushDrillDown(node.id)}
              />
            ))}
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {!isLoading && childNodes.length === 0 && childBits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No items
              </div>
            ) : null}
            {childNodes.map((node) => (
              <DraggableRow
                key={node.id}
                color={node.color}
                dragId={node.id}
                dragType="node"
                iconName={node.icon}
                onClick={() => pushDrillDown(node.id)}
                title={node.title}
                trailing={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
              />
            ))}
            {childBits.map((bit) => (
              <DraggableRow
                key={bit.id}
                color={currentNode.color}
                dragId={bit.id}
                dragType="bit"
                iconName={bit.icon}
                subtitle={bit.deadline ? "Scheduled" : "Unscheduled"}
                title={bit.title}
              />
            ))}
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
