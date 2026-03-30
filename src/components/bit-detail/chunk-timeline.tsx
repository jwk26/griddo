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
import { useChunkActions } from "@/hooks/use-chunk-actions";
import { ChunkItem } from "./chunk-item";
import type { Chunk } from "@/types";

const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
    .filter((c) => c.time !== null)
    .sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

  const orderedChunks = chunks
    .filter((c) => c.time === null)
    .sort((a, b) => a.order - b.order);

  const completedCount = chunks.filter((c) => c.status === "complete").length;
  const totalCount = chunks.length;
  const ringRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringRatio);

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

    const ids = orderedChunks.map((c) => c.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedChunks, oldIndex, newIndex);
    await Promise.all(reordered.map((c, i) => updateChunk(c.id, { order: i })));
  }

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg
          aria-label={`${completedCount} of ${totalCount} steps complete`}
          className="-rotate-90"
          height={36}
          width={36}
          viewBox="0 0 40 40"
        >
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount} steps
        </span>
      </div>

      <div className="relative pl-8">
        <div className="absolute bottom-0 left-3.5 top-0 w-0.5 bg-border" />

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
            items={orderedChunks.map((c) => c.id)}
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
          <div className="relative flex items-center gap-3 pb-2">
            <div className="relative z-10 flex h-3 w-3 flex-shrink-0 items-center justify-center">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">{deadlineLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
