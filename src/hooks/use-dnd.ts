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

export type DragActiveItem = {
  id: string;
  type: "node" | "bit" | "chunk";
  parentId?: string;
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
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleConflictUpdateParent: () => Promise<void>;
  handleConflictKeepChild: () => void;
  activeItem: DragActiveItem;
  overTargetId: string | null;
  conflictState: ConflictState;
} {
  const [activeItem, setActiveItem] = useState<DragActiveItem>(null);
  const [overTargetId, setOverTargetId] = useState<string | null>(null);
  const [conflictState, setConflictState] = useState<ConflictState>(CLOSED_CONFLICT_STATE);

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
    setActiveItem((event.active.data.current as DragActiveItem) ?? null);
  };

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

        const occupancy = await dataStore.getGridOccupancy(dropData.targetNodeId);
        const position = findNearestEmptyCell(occupancy, 0, 0);

        if (!position) {
          toast.error("Target grid is full.");
          return;
        }

        if (dragItem.type === "node") {
          await dataStore.updateNode(dragItem.id, {
            parentId: dropData.targetNodeId,
            x: position.x,
            y: position.y,
            mtime: Date.now(),
          });
        }

        if (dragItem.type === "bit") {
          await dataStore.updateBit(dragItem.id, {
            parentId: dropData.targetNodeId,
            x: position.x,
            y: position.y,
            mtime: Date.now(),
          });
        }

        return;
      }

      const parentId = dropData.targetNodeId;
      const occupancy = await dataStore.getGridOccupancy(parentId);
      const position = findNearestEmptyCell(occupancy, 0, 0);

      if (!position) {
        toast.error("Target grid is full.");
        return;
      }

      if (dragItem.type === "node") {
        await dataStore.updateNode(dragItem.id, {
          parentId,
          x: position.x,
          y: position.y,
          mtime: Date.now(),
        });
      }

      if (dragItem.type === "bit") {
        if (parentId === null) {
          return;
        }

        await dataStore.updateBit(dragItem.id, {
          parentId,
          x: position.x,
          y: position.y,
          mtime: Date.now(),
        });
      }

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
    activeItem,
    overTargetId,
    conflictState,
  };
}
