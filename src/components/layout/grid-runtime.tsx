"use client";

import { DndContext } from "@dnd-kit/core";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDnd } from "@/hooks/use-dnd";
import { useGridActions } from "@/hooks/use-grid-actions";
import { useNode } from "@/hooks/use-node";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import { getDataStore } from "@/lib/db/datastore";
import { gridCollisionDetection } from "@/lib/grid-dnd";
import { cn } from "@/lib/utils";
import {
  isCellBlocked,
  rectToBlockedCells,
} from "@/lib/utils/breadcrumb-zone";
import { hexToHsl } from "@/lib/utils/color";
import { findNearestEmptyCell } from "@/lib/utils/bfs";
import { isDeadlineAfter } from "@/lib/utils/deadline";
import { useBreadcrumbZoneStore } from "@/stores/breadcrumb-zone-store";
import { AddFlowProvider } from "./add-flow-context";

type PlacementContext =
  | { mode: "auto" }
  | { mode: "cell"; x: number; y: number };
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
    activeItem,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleNodeMoveCancel,
    handleNodeMoveConfirm,
    handleAncestorMoveConfirm,
    handleAncestorMoveCancel,
    pendingNodeMove,
    pendingAncestorMove,
    sensors,
  } = useDnd();
  const {
    createBit,
    createNode,
    getGridOccupancy,
    softDeleteBit,
    softDeleteNode,
  } = useGridActions();
  const [placementContext, setPlacementContext] = useState<PlacementContext>({
    mode: "auto",
  });
  const [openDialogType, setOpenDialogType] = useState<OpenDialogType>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const clusterRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const migrationSessionRef = useRef<Set<string>>(new Set());
  const setBlockedCells = useBreadcrumbZoneStore((state) => state.setBlockedCells);
  const blockedCells = useBreadcrumbZoneStore((state) => state.blockedCells);

  useEffect(() => {
    const cluster = clusterRef.current;
    const container = gridContainerRef.current;

    if (!cluster || !container) {
      return;
    }

    const clusterElement = cluster;
    const containerElement = container;

    function updateZone() {
      const clusterRect = clusterElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      const cells = rectToBlockedCells({
        containerRect,
        clusterRect,
        cols: GRID_COLS,
        rows: GRID_ROWS,
        gap: 8 /* --grid-gap: 0.5rem */,
      });

      setBlockedCells(cells);

      const sessionKey = nodeId ?? "__root__";
      if (cells.size > 0 && !migrationSessionRef.current.has(sessionKey)) {
        migrationSessionRef.current.add(sessionKey);
        void getDataStore().then((store) =>
          store.runBreadcrumbZoneMigration(nodeId, cells),
        );
      }
    }

    const ro = new ResizeObserver(updateZone);
    ro.observe(clusterElement);
    ro.observe(containerElement);
    updateZone();

    return () => {
      ro.disconnect();
      setBlockedCells(new Set());
      // clear on unmount — prevents stale state when leaving the grid layout entirely
      // (intra-grid navigations re-trigger ResizeObserver; cleanup only fires on full layout exit)
    };
  }, [setBlockedCells, nodeId]);

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
    deadline,
    deadlineAllDay,
  }: {
    title: string;
    icon: string;
    colorHex: string;
    deadline: number | null;
    deadlineAllDay: boolean;
  }) {
    if (nodeId !== null && !node) {
      setError("Unable to find parent node.");
      return;
    }

    setError(undefined);

    try {
      if (
        deadline !== null &&
        node !== null &&
        node.deadline !== null &&
        isDeadlineAfter(deadline, deadlineAllDay, node.deadline, node.deadlineAllDay)
      ) {
        setError("Node deadline cannot exceed parent deadline.");
        return;
      }

      const occupied = await getGridOccupancy(nodeId);
      const originX = placementContext.mode === "auto" ? 2 : placementContext.x;
      const originY = placementContext.mode === "auto" ? 2 : placementContext.y;
      const cell = findNearestEmptyCell(occupied, originX, originY, blockedCells);

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
        color: hexToHsl(colorHex),
        icon,
        deadline,
        deadlineAllDay,
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
      const originX =
        placementContext.mode === "auto" ? GRID_COLS - 3 : placementContext.x;
      const originY = placementContext.mode === "auto" ? 2 : placementContext.y;
      const cell = findNearestEmptyCell(occupied, originX, originY, blockedCells);

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
      <DndContext
        collisionDetection={gridCollisionDetection}
        onDragEnd={async (event) => {
          const deleteRequest = await handleDragEnd(event);
          if (deleteRequest) {
            setPendingDelete(deleteRequest);
          }
        }}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        autoScroll={false}
      >
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar onAddClick={() => openAdd({ mode: "auto" })} dragActiveItem={activeItem} />
          <main
            className="relative ml-12 flex-1 overflow-hidden"
            data-level={displayLevel}
            data-testid="display-level"
          >
            <div className="pointer-events-none absolute top-3 left-3 right-3 z-30 flex flex-col items-start gap-1.5">
              <div className="pointer-events-none w-full">
                <Breadcrumbs ref={clusterRef} nodeId={nodeId} dragActiveItem={activeItem} />
              </div>
            </div>
            <AddFlowProvider
              openAddAtCell={(x, y) => {
                if (!isCellBlocked(x, y, blockedCells)) {
                  openAdd({ mode: "cell", x, y });
                }
              }}
            >
              <div
                ref={gridContainerRef}
                className={cn(
                  "h-full overflow-x-hidden",
                  activeItem ? "overflow-hidden" : "overflow-y-auto",
                )}
                data-dragging={activeItem ? "true" : undefined}
              >
                {children}
              </div>
            </AddFlowProvider>
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
              level={displayLevel}
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
                  <Button
                    onClick={handleNodeMoveCancel}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleNodeMoveConfirm()}
                    type="button"
                  >
                    Move
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog
              open={pendingAncestorMove !== null}
              onOpenChange={(open) => {
                if (!open) {
                  handleAncestorMoveCancel();
                }
              }}
            >
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>
                    {pendingAncestorMove
                      ? `Move to '${pendingAncestorMove.targetNodeTitle}'?`
                      : "Move item?"}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  {pendingAncestorMove
                    ? `'${pendingAncestorMove.itemTitle}' will be moved to this location.`
                    : ""}
                </p>
                <DialogFooter>
                  <Button
                    onClick={handleAncestorMoveCancel}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleAncestorMoveConfirm()}
                    type="button"
                  >
                    Move
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </main>
      </div>
      </DndContext>
    </DeleteFlowContext.Provider>
  );
}
