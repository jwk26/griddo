"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateBitDialog } from "@/components/grid/create-bit-dialog";
import { CreateItemChooser } from "@/components/grid/create-item-chooser";
import { CreateNodeDialog } from "@/components/grid/create-node-dialog";
import { EditModeOverlay } from "@/components/grid/edit-mode-overlay";
import { EditNodeDialog } from "@/components/grid/edit-node-dialog";
import { GridView } from "@/components/grid/grid-view";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Sidebar } from "@/components/layout/sidebar";
import { useGridActions } from "@/hooks/use-grid-actions";
import { GRID_COLS } from "@/lib/constants";
import { getDataStore } from "@/lib/db/datastore";
import { findNearestEmptyCell } from "@/lib/utils/bfs";
import type { Node } from "@/types";

type PlacementContext = { mode: "auto" } | { mode: "cell"; x: number; y: number };
type OpenDialogType = "node" | "bit" | null;

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
  const { getGridOccupancy, createNode, createBit } = useGridActions();
  const [node, setNode] = useState<Node | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [openDialogType, setOpenDialogType] = useState<OpenDialogType>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [placementContext, setPlacementContext] = useState<PlacementContext>({ mode: "auto" });
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      return dataStore.getNode(nodeId);
    }).subscribe({
      next: (value) => setNode(value ?? null),
      error: (err) => console.error(err),
    });
    return () => subscription.unsubscribe();
  }, [nodeId]);

  const displayLevel = (node?.level ?? 0) + 1;
  const isLeafLevel = displayLevel >= 3;

  function openAdd(context: PlacementContext) {
    setPlacementContext(context);
    setError(undefined);
    if (isLeafLevel) {
      setOpenDialogType("bit");
    } else {
      setChooserOpen(true);
    }
  }

  function handleSidebarAdd() {
    openAdd({ mode: "auto" });
  }

  function handleCellAdd(x: number, y: number) {
    openAdd({ mode: "cell", x, y });
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      setError(undefined);
      setOpenDialogType(null);
    }
  }

  async function handleNodeSubmit({
    title,
    icon,
    colorHex,
  }: {
    title: string;
    icon: string;
    colorHex: string;
  }) {
    setError(undefined);
    if (!node) { setError("Unable to find parent node."); return; }

    try {
      const occupied = await getGridOccupancy(nodeId);
      const originX = placementContext.mode === "auto" ? 0 : placementContext.x;
      const originY = placementContext.mode === "auto" ? 0 : placementContext.y;
      const cell = findNearestEmptyCell(occupied, originX, originY);

      if (cell === null) {
        setOpenDialogType(null);
        toast.error("Grid is full. Reorganize or move items to make space.");
        return;
      }

      await createNode({
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
      setOpenDialogType(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create node.");
    }
  }

  async function handleBitSubmit({
    title,
    icon,
    deadline,
    deadlineAllDay,
    priority,
  }: {
    title: string;
    icon: string;
    deadline: number | null;
    deadlineAllDay: boolean;
    priority: "high" | "mid" | "low" | null;
  }) {
    setError(undefined);
    if (!node) { setError("Unable to find parent node."); return; }

    try {
      const occupied = await getGridOccupancy(nodeId);
      // Bits auto-place from top-right; cell-click uses clicked position
      const originX = placementContext.mode === "auto" ? GRID_COLS - 1 : placementContext.x;
      const originY = placementContext.mode === "auto" ? 0 : placementContext.y;
      const cell = findNearestEmptyCell(occupied, originX, originY);

      if (cell === null) {
        setOpenDialogType(null);
        toast.error("Grid is full. Reorganize or move items to make space.");
        return;
      }

      await createBit({
        title: title.trim(),
        description: "",
        icon,
        deadline,
        deadlineAllDay,
        priority,
        parentId: nodeId,
        x: cell.x,
        y: cell.y,
      });
      setOpenDialogType(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create bit.");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        level={node?.level ?? 0}
        onAddClick={handleSidebarAdd}
      />
      <main className="relative ml-[14rem] flex flex-1 flex-col overflow-hidden">
        <h1 className="sr-only">{node?.title ?? "Grid"}</h1>
        <Breadcrumbs nodeId={nodeId} />
        <div className="relative flex-1 overflow-auto p-4">
          <GridView
            level={displayLevel}
            onAddAtCell={handleCellAdd}
            onNodeEditClick={setEditingNode}
            parentColor={node?.color}
            parentId={nodeId}
          />
        </div>
        <EditModeOverlay />

        <CreateItemChooser
          open={chooserOpen}
          onOpenChange={setChooserOpen}
          onChooseNode={() => setOpenDialogType("node")}
          onChooseBit={() => setOpenDialogType("bit")}
        />

        <CreateNodeDialog
          error={openDialogType === "node" ? error : undefined}
          onOpenChange={handleDialogOpenChange}
          onSubmit={handleNodeSubmit}
          open={openDialogType === "node"}
        />

        <CreateBitDialog
          error={openDialogType === "bit" ? error : undefined}
          onOpenChange={handleDialogOpenChange}
          onSubmit={handleBitSubmit}
          open={openDialogType === "bit"}
        />

        <EditNodeDialog
          node={editingNode}
          open={editingNode !== null}
          onOpenChange={(open) => { if (!open) setEditingNode(null); }}
        />
      </main>
    </div>
  );
}
