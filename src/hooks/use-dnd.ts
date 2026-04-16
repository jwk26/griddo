"use client";

import { useState } from "react";
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { isCalendarDropData } from "@/lib/calendar-dnd";
import { getDataStore } from "@/lib/db/datastore";
import { isGridDropData } from "@/lib/grid-dnd";
import { findNearestEmptyCell } from "@/lib/utils/bfs";
import {
  getStaticBlockedCells,
  isCellBlocked,
} from "@/lib/utils/breadcrumb-zone";
import { useBreadcrumbZoneStore } from "@/stores/breadcrumb-zone-store";

export type DragActiveItem = {
  id: string;
  type: "node" | "bit" | "chunk";
  parentId?: string;
  title: string;
} | null;

type PendingNodeMove = {
  itemId: string;
  itemType: "node" | "bit";
  itemTitle: string;
  targetNodeId: string;
  targetNodeTitle: string;
} | null;

type PendingAncestorMove = {
  itemId: string;
  itemType: "node" | "bit";
  itemTitle: string;
  targetNodeId: string | null;
  targetNodeTitle: string;
} | null;

type ConflictState = {
  open: boolean;
  parentBitId: string | null;
  parentDeadline: number;
  parentDeadlineAllDay: boolean;
  pendingChunkId: string | null;
  pendingTimestamp: number | null;
};

const CLOSED_CONFLICT_STATE: ConflictState = {
  open: false,
  parentBitId: null,
  parentDeadline: Date.now(),
  parentDeadlineAllDay: false,
  pendingChunkId: null,
  pendingTimestamp: null,
};

export function useDnd(): {
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<{ id: string; type: "node" | "bit"; title: string } | undefined>;
  handleDragOver: (event: DragOverEvent) => void;
  handleConflictUpdateParent: () => Promise<void>;
  handleConflictKeepChild: () => void;
  handleNodeMoveConfirm: () => Promise<void>;
  handleNodeMoveCancel: () => void;
  handleAncestorMoveConfirm: () => Promise<void>;
  handleAncestorMoveCancel: () => void;
  activeItem: DragActiveItem;
  overTargetId: string | null;
  conflictState: ConflictState;
  pendingNodeMove: PendingNodeMove;
  pendingAncestorMove: PendingAncestorMove;
} {
  const [activeItem, setActiveItem] = useState<DragActiveItem>(null);
  const [overTargetId, setOverTargetId] = useState<string | null>(null);
  const [conflictState, setConflictState] = useState<ConflictState>(CLOSED_CONFLICT_STATE);
  const [pendingNodeMove, setPendingNodeMove] = useState<PendingNodeMove>(null);
  const [pendingAncestorMove, setPendingAncestorMove] = useState<PendingAncestorMove>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const current = event.active.data.current as Partial<NonNullable<DragActiveItem>> | null;

    if (!current || !current.id || !current.type) {
      setActiveItem(null);
      return;
    }

    setActiveItem({
      id: current.id,
      type: current.type,
      parentId: current.parentId,
      title: current.title ?? "",
    });
  };

  async function moveGridItemToParent(
    item: NonNullable<DragActiveItem>,
    parentId: string | null,
    originX: number,
    originY: number,
  ) {
    const dataStore = await getDataStore();
    const occupancy = await dataStore.getGridOccupancy(parentId);
    const position = findNearestEmptyCell(
      occupancy,
      originX,
      originY,
      getStaticBlockedCells(),
    );

    if (!position) {
      toast.error("Target grid is full.");
      return;
    }

    if (item.type === "node") {
      await dataStore.updateNode(item.id, {
        parentId,
        x: position.x,
        y: position.y,
        mtime: Date.now(),
      });
    }

    if (item.type === "bit") {
      if (parentId === null) {
        return;
      }

      await dataStore.updateBit(item.id, {
        parentId,
        x: position.x,
        y: position.y,
        mtime: Date.now(),
      });
    }
  }

  async function wouldCreateNodeCycle(dragNodeId: string, targetNodeId: string): Promise<boolean> {
    const dataStore = await getDataStore();
    let current = await dataStore.getNode(targetNodeId);

    while (current) {
      if (current.id === dragNodeId) {
        return true;
      }

      current = current.parentId ? await dataStore.getNode(current.parentId) : undefined;
    }

    return false;
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const dragItem = (event.active.data.current as DragActiveItem) ?? activeItem;
    const dropData = event.over?.data.current;

    setOverTargetId(null);
    setActiveItem(null);

    if (!dragItem || !dropData) {
      return;
    }

    const dataStore = await getDataStore();

    if (isGridDropData(dropData)) {
      if (dropData.kind === "grid-cell") {
        const blockedCells = useBreadcrumbZoneStore.getState().blockedCells;

        if (isCellBlocked(dropData.x, dropData.y, blockedCells)) {
          toast("Cell reserved by breadcrumb");
          return;
        }

        if ((dragItem.parentId ?? null) !== dropData.parentId) {
          return;
        }

        if (dragItem.type === "node") {
          await dataStore.updateNode(dragItem.id, {
            x: dropData.x,
            y: dropData.y,
            mtime: Date.now(),
          });
        }

        if (dragItem.type === "bit") {
          await dataStore.updateBit(dragItem.id, {
            x: dropData.x,
            y: dropData.y,
            mtime: Date.now(),
          });
        }

        return;
      }

      if (dropData.kind === "grid-node-drop") {
        if (dragItem.type === "node" && dragItem.id === dropData.targetNodeId) {
          return;
        }

        if (dragItem.type === "node") {
          const createsCycle = await wouldCreateNodeCycle(
            dragItem.id,
            dropData.targetNodeId,
          );

          if (createsCycle) {
            toast.error("Cannot move a node into its own descendant.");
            return;
          }
        }

        if (dragItem.type !== "node" && dragItem.type !== "bit") {
          return;
        }

        setPendingNodeMove({
          itemId: dragItem.id,
          itemType: dragItem.type,
          itemTitle: dragItem.title,
          targetNodeId: dropData.targetNodeId,
          targetNodeTitle: dropData.targetNodeTitle ?? "",
        });

        return;
      }

      if (dropData.kind === "grid-delete-drop") {
        if (!dragItem) return undefined;
        if (dragItem.type === "node" || dragItem.type === "bit") {
          return { id: dragItem.id, type: dragItem.type, title: dragItem.title };
        }
        return undefined;
      }

      if (dropData.kind === "grid-breadcrumb-drop") {
        if (dragItem.type !== "node" && dragItem.type !== "bit") return;
        setPendingAncestorMove({
          itemId: dragItem.id,
          itemType: dragItem.type,
          itemTitle: dragItem.title,
          targetNodeId: dropData.targetNodeId,
          targetNodeTitle:
            dropData.targetNodeTitle ?? (dropData.targetNodeId === null ? "Home" : ""),
        });
        return;
      }

      await moveGridItemToParent(dragItem, dropData.targetNodeId, 0, 0);

      return;
    }

    if (!isCalendarDropData(dropData)) {
      return;
    }

    if (dropData.kind === "calendar-unschedule") {
      if (dragItem.type === "node") {
        await dataStore.updateNode(dragItem.id, {
          deadline: null,
          deadlineAllDay: false,
          mtime: Date.now(),
        });
      }

      if (dragItem.type === "bit") {
        await dataStore.updateBit(dragItem.id, {
          deadline: null,
          deadlineAllDay: false,
          mtime: Date.now(),
        });
      }

      if (dragItem.type === "chunk") {
        await dataStore.updateChunk(dragItem.id, { time: null });
      }

      return;
    }

    if (dragItem.type === "node") {
      await dataStore.updateNode(dragItem.id, {
        deadline: dropData.timestamp,
        mtime: Date.now(),
      });
      return;
    }

    if (dragItem.type === "bit") {
      await dataStore.updateBit(dragItem.id, {
        deadline: dropData.timestamp,
        mtime: Date.now(),
      });
      return;
    }

    if (!dragItem.parentId) {
      return;
    }

    const parentBit = await dataStore.getBit(dragItem.parentId);
    if (!parentBit) {
      return;
    }

    if (
      parentBit.deadline !== null &&
      dropData.timestamp > parentBit.deadline
    ) {
      setConflictState({
        open: true,
        parentBitId: parentBit.id,
        parentDeadline: parentBit.deadline,
        parentDeadlineAllDay: parentBit.deadlineAllDay,
        pendingChunkId: dragItem.id,
        pendingTimestamp: dropData.timestamp,
      });
      return;
    }

    await dataStore.updateChunk(dragItem.id, {
      time: dropData.timestamp,
    });
  };

  const handleConflictUpdateParent = async () => {
    if (
      !conflictState.parentBitId ||
      !conflictState.pendingChunkId ||
      conflictState.pendingTimestamp === null
    ) {
      setConflictState(CLOSED_CONFLICT_STATE);
      return;
    }

    const dataStore = await getDataStore();
    await dataStore.updateBit(conflictState.parentBitId, {
      deadline: conflictState.pendingTimestamp,
      mtime: Date.now(),
    });
    await dataStore.updateChunk(conflictState.pendingChunkId, {
      time: conflictState.pendingTimestamp,
    });
    setConflictState(CLOSED_CONFLICT_STATE);
  };

  const handleConflictKeepChild = () => {
    setConflictState(CLOSED_CONFLICT_STATE);
  };

  const handleNodeMoveConfirm = async () => {
    if (!pendingNodeMove) {
      return;
    }

    const item: NonNullable<DragActiveItem> = {
      id: pendingNodeMove.itemId,
      type: pendingNodeMove.itemType,
      title: pendingNodeMove.itemTitle,
    };

    try {
      await moveGridItemToParent(item, pendingNodeMove.targetNodeId, 0, 0);
    } finally {
      setPendingNodeMove(null);
    }
  };

  const handleNodeMoveCancel = () => {
    setPendingNodeMove(null);
  };

  const handleAncestorMoveConfirm = async () => {
    if (!pendingAncestorMove) return;
    const item: NonNullable<DragActiveItem> = {
      id: pendingAncestorMove.itemId,
      type: pendingAncestorMove.itemType,
      title: pendingAncestorMove.itemTitle,
    };
    try {
      await moveGridItemToParent(item, pendingAncestorMove.targetNodeId, 0, 0);
    } finally {
      setPendingAncestorMove(null);
    }
  };

  const handleAncestorMoveCancel = () => {
    setPendingAncestorMove(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverTargetId(event.over?.id ? String(event.over.id) : null);
  };

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleConflictUpdateParent,
    handleConflictKeepChild,
    handleNodeMoveConfirm,
    handleNodeMoveCancel,
    handleAncestorMoveConfirm,
    handleAncestorMoveCancel,
    activeItem,
    overTargetId,
    conflictState,
    pendingNodeMove,
    pendingAncestorMove,
  };
}
