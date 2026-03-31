"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { ChunkItem } from "@/components/bit-detail/chunk-item";
import { useChunkActions } from "@/hooks/use-chunk-actions";
import type { Chunk } from "@/types";

type ChunkTimelineProps = {
  chunks: Chunk[];
  bitDeadline: number | null;
  bitDeadlineAllDay: boolean;
};

export function ChunkTimeline({ chunks, bitDeadline, bitDeadlineAllDay }: ChunkTimelineProps) {
  const { updateChunk, deleteChunk } = useChunkActions();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const timedChunks = chunks
    .filter((chunk) => chunk.time !== null)
    .sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

  const orderedChunks = chunks
    .filter((chunk) => chunk.time === null)
    .sort((a, b) => a.order - b.order);

  const deadlineLabel = bitDeadline
    ? format(new Date(bitDeadline), bitDeadlineAllDay ? "MMM d" : "MMM d, h:mm a")
    : null;

  async function handleToggle(chunk: Chunk) {
    await updateChunk(chunk.id, {
      status: chunk.status === "complete" ? "incomplete" : "complete",
    });
  }

  async function handleEdit(chunkId: string, title: string) {
    await updateChunk(chunkId, { title });
  }

  async function handleDelete(chunkId: string) {
    await deleteChunk(chunkId);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = orderedChunks.map((chunk) => chunk.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedChunks, oldIndex, newIndex);
    await Promise.all(reordered.map((chunk, index) => updateChunk(chunk.id, { order: index })));
  }

  return (
    <>
      {timedChunks.map((chunk) => (
        <ChunkItem
          key={chunk.id}
          chunk={chunk}
          isDraggable={false}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedChunks.map((chunk) => chunk.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedChunks.map((chunk) => (
            <ChunkItem
              key={chunk.id}
              chunk={chunk}
              isDraggable={true}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {deadlineLabel ? (
        <div className="relative flex items-center gap-3 pt-1">
          <Clock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{deadlineLabel}</span>
        </div>
      ) : null}
    </>
  );
}
