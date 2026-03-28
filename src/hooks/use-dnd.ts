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
import { isCalendarDropData } from "@/lib/calendar-dnd";
import { getDataStore } from "@/lib/db/datastore";

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

    if (!dragItem || !dropData || !isCalendarDropData(dropData)) {
      return;
    }

    const dataStore = await getDataStore();

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
