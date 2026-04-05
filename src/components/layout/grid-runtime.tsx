"use client";

import { DndContext } from "@dnd-kit/core";
import { useParams } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreateBitDialog } from "@/components/grid/create-bit-dialog";
import { CreateItemChooser } from "@/components/grid/create-item-chooser";
import { CreateNodeDialog } from "@/components/grid/create-node-dialog";
import {
  DeleteConfirmDialog,
  type PendingDelete,
} from "@/components/grid/delete-confirm-dialog";
import { EditModeOverlay } from "@/components/grid/edit-mode-overlay";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Sidebar } from "@/components/layout/sidebar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDnd } from "@/hooks/use-dnd";
import { useGridActions } from "@/hooks/use-grid-actions";
import { useNode } from "@/hooks/use-node";
import { GRID_COLS } from "@/lib/constants";
import { gridCollisionDetection } from "@/lib/grid-dnd";
import { hexToHsl } from "@/lib/utils/color";
import { findNearestEmptyCell } from "@/lib/utils/bfs";
import { AddFlowProvider } from "./add-flow-context";

type PlacementContext = { mode: "auto" } | { mode: "cell"; x: number; y: number };
type OpenDialogType = "node" | "bit" | null;
type DeleteRequest = NonNullable<PendingDelete>;

type DeleteFlowContextValue = {
  requestDelete: (item: DeleteRequest) => void;
};

const DeleteFlowContext = createContext<DeleteFlowContextValue | null>(null);

export function useDeleteFlow(): DeleteFlowContextValue {
  const context = useContext(DeleteFlowContext);

  if (!context) {
    throw new Error("useDeleteFlow must be used within GridRuntime");
  }

  return context;
}

export function GridRuntime({ children }: { children: React.ReactNode }) {
  const params = useParams<{ nodeId?: string | string[] }>();
  const nodeId = typeof params.nodeId === "string" ? params.nodeId : null;
  const node = useNode(nodeId ?? "");
  const displayLevel = nodeId === null ? 0 : (node?.level ?? 0) + 1;
  const isLeafLevel = displayLevel >= 3;
  const {
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleNodeMoveCancel,
    handleNodeMoveConfirm,
    pendingNodeMove,
    sensors,
  } = useDnd();
  const {
    createBit,
    createNode,
    getGridOccupancy,
    softDeleteBit,
    softDeleteNode,
  } = useGridActions();
  const [placementContext, setPlacementContext] = useState<PlacementContext>({ mode: "auto" });
  const [openDialogType, setOpenDialogType] = useState<OpenDialogType>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  function openAdd(context: PlacementContext) {
    setPlacementContext(context);
    setError(undefined);

    if (isLeafLevel) {
      setOpenDialogType("bit");
      return;
    }

    if (nodeId === null) {
      setOpenDialogType("node");
      return;
    }

    setChooserOpen(true);
  }

  function handleDialogOpenChange(open: boolean, type: OpenDialogType) {
    if (!open) {
      setError(undefined);
      if (openDialogType === type) {
        setOpenDialogType(null);
      }
    }
  }

  async function handleNodeSubmit({
    title,
    icon,
    colorHex,
    description,
  }: {
    title: string;
    icon: string;
    colorHex: string;
    description: string;
  }) {
    if (nodeId !== null && !node) {
      setError("Unable to find parent node.");
      return;
    }

    setError(undefined);

    try {
      const occupied = await getGridOccupancy(nodeId);
      const originX = placementContext.mode === "auto" ? 2 : placementContext.x;
      const originY = placementContext.mode === "auto" ? 2 : placementContext.y;
      const cell = findNearestEmptyCell(occupied, originX, originY);

      if (cell === null) {
        if (nodeId === null) {
          setError("No empty cells available at this level.");
        } else {
          setOpenDialogType(null);
          toast.error("Grid is full. Reorganize or move items to make space.");
        }

        return;
      }

      await createNode({
        title: title.trim(),
        description,
        color: hexToHsl(colorHex),
        icon,
        deadline: null,
        deadlineAllDay: false,
        parentId: nodeId,
        level: nodeId === null ? 0 : displayLevel,
        x: cell.x,
        y: cell.y,
      });
      setOpenDialogType(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create node.",
      );
    }
  }

  async function handleBitSubmit({
    title,
    icon,
    deadline,
    deadlineAllDay,
    priority,
    description,
  }: {
    title: string;
    icon: string;
    deadline: number | null;
    deadlineAllDay: boolean;
    priority: "high" | "mid" | "low" | null;
    description: string;
  }) {
    if (!nodeId || !node) {
      setError("Unable to find parent node.");
      return;
    }

    setError(undefined);

    try {
      const occupied = await getGridOccupancy(nodeId);
      const originX = placementContext.mode === "auto" ? GRID_COLS - 3 : placementContext.x;
      const originY = placementContext.mode === "auto" ? 2 : placementContext.y;
      const cell = findNearestEmptyCell(occupied, originX, originY);

      if (cell === null) {
        setOpenDialogType(null);
        toast.error("Grid is full. Reorganize or move items to make space.");
        return;
      }

      await createBit({
        title: title.trim(),
        description,
        icon,
        deadline,
        deadlineAllDay,
        priority,
        parentId: nodeId,
        x: cell.x,
        y: cell.y,
      });
      setOpenDialogType(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create bit.",
      );
    }
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.type === "node") {
      await softDeleteNode(pendingDelete.id);
    } else {
      await softDeleteBit(pendingDelete.id);
    }

    setPendingDelete(null);
  }

  const deleteFlowValue = useMemo<DeleteFlowContextValue>(
    () => ({
      requestDelete: (item) => setPendingDelete(item),
    }),
    [],
  );

  return (
    <DeleteFlowContext.Provider value={deleteFlowValue}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar onAddClick={() => openAdd({ mode: "auto" })} />
        <main className="relative ml-12 flex flex-1 flex-col overflow-hidden" data-level={displayLevel} data-testid="display-level">
          <DndContext
            collisionDetection={gridCollisionDetection}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            <Breadcrumbs nodeId={nodeId} />
            <AddFlowProvider
              openAddAtCell={(x, y) => openAdd({ mode: "cell", x, y })}
            >
              <div className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-1">{children}</div>
            </AddFlowProvider>
          </DndContext>
          <EditModeOverlay />
          <CreateItemChooser
            onChooseBit={() => setOpenDialogType("bit")}
            onChooseNode={() => setOpenDialogType("node")}
            onOpenChange={(open) => {
              if (!open) {
                setError(undefined);
              }

              setChooserOpen(open);
            }}
            open={chooserOpen}
          />
          <CreateNodeDialog
            error={openDialogType === "node" ? error : undefined}
            onOpenChange={(open) => handleDialogOpenChange(open, "node")}
            onSubmit={handleNodeSubmit}
            open={openDialogType === "node"}
          />
          <CreateBitDialog
            error={openDialogType === "bit" ? error : undefined}
            onOpenChange={(open) => handleDialogOpenChange(open, "bit")}
            onSubmit={handleBitSubmit}
            open={openDialogType === "bit"}
          />
          <DeleteConfirmDialog
            onCancel={() => setPendingDelete(null)}
            onConfirm={handleDeleteConfirm}
            pendingDelete={pendingDelete}
          />
          <Dialog
            open={pendingNodeMove !== null}
            onOpenChange={(open) => {
              if (!open) {
                handleNodeMoveCancel();
              }
            }}
          >
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>
                  {pendingNodeMove
                    ? `Move into '${pendingNodeMove.targetNodeTitle}'?`
                    : "Move item?"}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {pendingNodeMove
                  ? `'${pendingNodeMove.itemTitle}' will be moved into this node.`
                  : ""}
              </p>
              <DialogFooter>
                <Button onClick={handleNodeMoveCancel} type="button" variant="outline">
                  Cancel
                </Button>
                <Button onClick={() => void handleNodeMoveConfirm()} type="button">
                  Move
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </DeleteFlowContext.Provider>
  );
}
