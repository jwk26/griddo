"use client";

import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { BitCard } from "@/components/grid/bit-card";
import { GridCell } from "@/components/grid/grid-cell";
import { NodeCard } from "@/components/grid/node-card";
import { useGridData } from "@/hooks/use-grid-data";
import { vignetteVariants } from "@/lib/animations/grid";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
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

export function GridView({
  parentId,
  level,
  parentColor = "hsl(221, 83%, 53%)",
  onAddAtCell,
}: {
  parentId: string | null;
  level: number;
  parentColor?: string;
  onAddAtCell?: (x: number, y: number) => void;
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

            return (
              <GridCell
                key={positionKey}
                x={x}
                y={y}
                isEditMode={isEditMode}
                isEmpty={item === undefined}
                borderOpacity={borderOpacity}
                onAddClick={onAddAtCell ? () => onAddAtCell(x, y) : undefined}
              >
                {item === undefined ? null : isNodeItem(item) ? (
                  <NodeCard
                    node={item}
                    isEditMode={isEditMode}
                    onClick={() => router.push(`/grid/${item.id}`)}
                  />
                ) : (
                  <BitCard
                    bit={item}
                    chunkStats={{ completed: 0, total: 0 }}
                    onClick={() => router.push(`${pathname}?bit=${item.id}`)}
                    parentColor={parentColor}
                  />
                )}
              </GridCell>
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
