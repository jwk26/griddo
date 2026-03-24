"use client";

import { useEffect, useState } from "react";
import { CreateNodeDialog } from "@/components/grid/create-node-dialog";
import { EditModeOverlay } from "@/components/grid/edit-mode-overlay";
import { GridView } from "@/components/grid/grid-view";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Sidebar } from "@/components/layout/sidebar";
import { indexedDBStore } from "@/lib/db/indexeddb";
import { findNearestEmptyCell } from "@/lib/utils/bfs";
import type { Node } from "@/types";

type PlacementContext = { mode: "auto" } | { mode: "cell"; x: number; y: number };

function hexToHsl(hex: string): string {
  const normalized = hex.trim().replace("#", "");
  const expandedHex = normalized.length === 3
    ? normalized.split("").map((c) => `${c}${c}`).join("")
    : normalized;
  if (!/^[0-9a-f]{6}$/i.test(expandedHex)) throw new Error("Invalid color value.");
  const r = parseInt(expandedHex.slice(0, 2), 16) / 255;
  const g = parseInt(expandedHex.slice(2, 4), 16) / 255;
  const b = parseInt(expandedHex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function NodeGridShell({ nodeId }: { nodeId: string }) {
  const [node, setNode] = useState<Node | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [placementContext, setPlacementContext] = useState<PlacementContext>({ mode: "auto" });
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isCancelled = false;

    void indexedDBStore.getNode(nodeId).then((value) => {
      if (!isCancelled) {
        setNode(value ?? null);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [nodeId]);

  const displayLevel = (node?.level ?? 0) + 1;
  const isLeafLevel = displayLevel >= 3;

  function handleSidebarAdd() {
    setPlacementContext({ mode: "auto" });
    setError(undefined);
    setDialogOpen(true);
  }

  function handleCellAdd(x: number, y: number) {
    setPlacementContext({ mode: "cell", x, y });
    setError(undefined);
    setDialogOpen(true);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setError(undefined);
    }

    setDialogOpen(open);
  }

  async function handleSubmit({
    title,
    icon,
    colorHex,
  }: {
    title: string;
    icon: string;
    colorHex: string;
  }) {
    setError(undefined);

    if (!node) {
      setError("Unable to find parent node.");
      return;
    }

    if (isLeafLevel) {
      setError("No empty cells available at this level.");
      return;
    }

    try {
      const occupied = await indexedDBStore.getGridOccupancy(nodeId);
      const cell = findNearestEmptyCell(
        occupied,
        placementContext.mode === "auto" ? 0 : placementContext.x,
        placementContext.mode === "auto" ? 0 : placementContext.y,
      );

      if (cell === null) {
        setError("No empty cells available at this level.");
        return;
      }

      await indexedDBStore.createNode({
        title: title.trim(),
        description: "",
        color: hexToHsl(colorHex),
        icon,
        deadline: null,
        deadlineAllDay: false,
        parentId: nodeId,
        level: displayLevel,
        x: cell.x,
        y: cell.y,
      });
      setDialogOpen(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create node.",
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        level={node?.level ?? 0}
        onAddClick={!isLeafLevel ? handleSidebarAdd : undefined}
      />
      <main className="relative ml-[14rem] flex flex-1 flex-col overflow-hidden">
        <Breadcrumbs nodeId={nodeId} />
        <div className="relative flex-1 overflow-auto p-4">
          <GridView
            level={displayLevel}
            onAddAtCell={!isLeafLevel ? handleCellAdd : undefined}
            parentColor={node?.color}
            parentId={nodeId}
          />
        </div>
        <EditModeOverlay />
        {!isLeafLevel ? (
          <CreateNodeDialog
            error={error}
            onOpenChange={handleOpenChange}
            onSubmit={handleSubmit}
            open={dialogOpen}
          />
        ) : null}
      </main>
    </div>
  );
}
