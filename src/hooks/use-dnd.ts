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

export type DragActiveItem = {
  id: string;
  type: "node" | "bit" | "chunk";
} | null;

export function useDnd(): {
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  activeItem: DragActiveItem;
} {
  const [activeItem, setActiveItem] = useState<DragActiveItem>(null);

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

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveItem(null);
    // TODO Phase 3: grid cell reposition (edit mode)
    // TODO Phase 4: drag-into-Node (move item to nested node)
    // TODO Phase 5: calendar pool-to-day scheduling
    // TODO Phase 5: chunk timeline reorder
    // TODO Phase 4: drag-to-breadcrumb (move to ancestor)
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // TODO Phase 3+: handle drag previews and drop-target state
  };

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    activeItem,
  };
}
