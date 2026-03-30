"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BitCard } from "@/components/grid/bit-card";
import { GridCell } from "@/components/grid/grid-cell";
import { NodeCard } from "@/components/grid/node-card";
import { sinkingVariants, vignetteVariants } from "@/lib/animations/grid";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import { getGridCellDropId, getGridNodeDropId } from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import { useGridData } from "@/hooks/use-grid-data";
import { useEditModeStore } from "@/stores/edit-mode-store";
import type { Bit, Node } from "@/types";

type GridItem = Node | Bit;

const levelOpacityMap: Record<number, string> = {
  0: "0.15",
  1: "0.12",
  2: "0.08",
  3: "0.05",
};

function isNodeItem(item: GridItem): item is Node {
  return "level" in item;
}

function toTranslateStyle(transform: { x: number; y: number } | null | undefined) {
  if (!transform) {
    return undefined;
  }

  return { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` };
}

function EditableGridDropCell({
  borderOpacity,
  children,
  isEmpty,
  onAddClick,
  parentId,
  x,
  y,
}: {
  borderOpacity: string;
  children: ReactNode;
  isEmpty: boolean;
  onAddClick?: () => void;
  parentId: string | null;
  x: number;
  y: number;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: getGridCellDropId(parentId, x, y),
    data: { kind: "grid-cell", parentId, x, y },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full rounded-md",
        isOver && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
      )}
    >
      <GridCell
        borderOpacity={borderOpacity}
        isEditMode={true}
        isEmpty={isEmpty}
        onAddClick={onAddClick}
        x={x}
        y={y}
      >
        {children}
      </GridCell>
    </div>
  );
}

function StaticGridCell({
  borderOpacity,
  children,
  isEditMode,
  isEmpty,
  onAddClick,
  x,
  y,
}: {
  borderOpacity: string;
  children: ReactNode;
  isEditMode: boolean;
  isEmpty: boolean;
  onAddClick?: () => void;
  x: number;
  y: number;
}) {
  return (
    <GridCell
      borderOpacity={borderOpacity}
      isEditMode={isEditMode}
      isEmpty={isEmpty}
      onAddClick={onAddClick}
      x={x}
      y={y}
    >
      {children}
    </GridCell>
  );
}

function DraggableNodeCard({
  isEditMode,
  node,
  onClick,
}: {
  isEditMode: boolean;
  node: Node;
  onClick: () => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef: setDragNodeRef, transform } = useDraggable({
    id: `draggable-${node.id}`,
    data: { id: node.id, type: "node", parentId: node.parentId ?? undefined },
    disabled: !isEditMode,
  });
  const { isOver, setNodeRef: setDropNodeRef } = useDroppable({
    id: getGridNodeDropId(node.id),
    data: { kind: "grid-node-drop", targetNodeId: node.id },
    disabled: !isEditMode,
  });

  const setNodeRef = (element: HTMLDivElement | null) => {
    setDragNodeRef(element);
    setDropNodeRef(element);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full rounded-xl",
        isDragging && "opacity-50",
        isOver && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
      )}
      style={toTranslateStyle(transform)}
      {...attributes}
      {...listeners}
    >
      <NodeCard isEditMode={isEditMode} node={node} onClick={onClick} />
    </div>
  );
}

function DraggableBitCard({
  bit,
  onClick,
  parentColor,
}: {
  bit: Bit;
  onClick: () => void;
  parentColor: string;
}) {
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${bit.id}`,
    data: { id: bit.id, type: "bit", parentId: bit.parentId ?? undefined },
    disabled: !isEditMode,
  });

  return (
    <motion.div
      animate="visible"
      className={cn("h-full", isDragging && "opacity-50")}
      exit="exit"
      initial="visible"
      variants={sinkingVariants}
    >
      <div
        ref={setNodeRef}
        className="flex h-full items-center"
        style={toTranslateStyle(transform)}
        {...attributes}
        {...listeners}
      >
        <BitCard
          bit={bit}
          chunkStats={{ completed: 0, total: 0 }}
          onClick={onClick}
          parentColor={parentColor}
        />
      </div>
    </motion.div>
  );
}

export function GridView({
  parentId,
  level,
  parentColor = "hsl(221, 83%, 53%)",
  onAddAtCell,
  onNodeEditClick,
}: {
  parentId: string | null;
  level: number;
  parentColor?: string;
  onAddAtCell?: (x: number, y: number) => void;
  onNodeEditClick?: (node: Node) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { nodes, bits } = useGridData(parentId);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const itemsByPosition = new Map<string, GridItem>();
  const borderOpacity = levelOpacityMap[level] ?? levelOpacityMap[3];

  for (const item of nodes) {
    itemsByPosition.set(`${item.x},${item.y}`, item);
  }

  for (const item of bits) {
    itemsByPosition.set(`${item.x},${item.y}`, item);
  }

  return (
    <div className="relative h-full w-full">
      <div
        className="grid h-full w-full grid-cols-12 gap-[var(--grid-gap)]"
        data-level={level}
        style={{ gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_ROWS }, (_, y) =>
          Array.from({ length: GRID_COLS }, (_, x) => {
            const positionKey = `${x},${y}`;
            const item = itemsByPosition.get(positionKey);
            const content = (
              <>
                {item !== undefined && isNodeItem(item) ? (
                  <DraggableNodeCard
                    isEditMode={isEditMode}
                    node={item}
                    onClick={
                      isEditMode && onNodeEditClick
                        ? () => onNodeEditClick(item)
                        : () => router.push(`/grid/${item.id}`)
                    }
                  />
                ) : null}
                <AnimatePresence initial={false}>
                  {item !== undefined && !isNodeItem(item) ? (
                    <DraggableBitCard
                      key={item.id}
                      bit={item}
                      onClick={() => router.push(`${pathname}?bit=${item.id}`)}
                      parentColor={parentColor}
                    />
                  ) : null}
                </AnimatePresence>
              </>
            );

            if (isEditMode) {
              return (
                <EditableGridDropCell
                  key={positionKey}
                  borderOpacity={borderOpacity}
                  isEmpty={item === undefined}
                  onAddClick={onAddAtCell ? () => onAddAtCell(x, y) : undefined}
                  parentId={parentId}
                  x={x}
                  y={y}
                >
                  {content}
                </EditableGridDropCell>
              );
            }

            return (
              <StaticGridCell
                key={positionKey}
                borderOpacity={borderOpacity}
                isEditMode={false}
                isEmpty={item === undefined}
                onAddClick={onAddAtCell ? () => onAddAtCell(x, y) : undefined}
                x={x}
                y={y}
              >
                {content}
              </StaticGridCell>
            );
          }),
        )}
      </div>
      <motion.div
        animate={`l${level}`}
        className="pointer-events-none absolute inset-0"
        initial={false}
        style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,1)" }}
        variants={vignetteVariants}
      />
    </div>
  );
}
