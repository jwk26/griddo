"use client";

import { useRef, useState } from "react";
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
import { Plus } from "lucide-react";
import { indexedDBStore } from "@/lib/db/indexeddb";
import { ChunkItem } from "./chunk-item";
import type { Chunk } from "@/types";

type ChunkPoolProps = {
  chunks: Chunk[];
  bitId: string;
  onAddStep?: () => void;
};

export function ChunkPool({ chunks, bitId, onAddStep }: ChunkPoolProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const poolChunks = chunks
    .filter((c) => c.time === null)
    .sort((a, b) => a.order - b.order);

  async function handleAdd() {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setIsAdding(false);
      setNewTitle("");
      return;
    }
    await indexedDBStore.createChunk({
      title: trimmed,
      description: "",
      time: null,
      timeAllDay: false,
      order: chunks.length,
      parentId: bitId,
    });
    setNewTitle("");
    setIsAdding(false);
    onAddStep?.();
  }

  async function handleToggle(chunk: Chunk) {
    await indexedDBStore.updateChunk(chunk.id, {
      status: chunk.status === "complete" ? "incomplete" : "complete",
    });
  }

  async function handleEdit(chunkId: string, title: string) {
    await indexedDBStore.updateChunk(chunkId, { title });
  }

  async function handleDelete(chunkId: string) {
    await indexedDBStore.deleteChunk(chunkId);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = poolChunks.map((c) => c.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(poolChunks, oldIndex, newIndex);
    await Promise.all(reordered.map((c, i) => indexedDBStore.updateChunk(c.id, { order: i })));
  }

  return (
    <div className="flex flex-col gap-2">
      {poolChunks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={poolChunks.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative pl-8">
              <div className="absolute bottom-0 left-3.5 top-0 w-0.5 bg-border" />
              {poolChunks.map((chunk) => (
                <ChunkItem
                  key={chunk.id}
                  chunk={chunk}
                  isDraggable={true}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      {isAdding ? (
        <div className="flex items-center gap-2 pl-8">
          <div className="relative z-10 h-3 w-3 flex-shrink-0 rounded-full border-2 border-muted-foreground/30 bg-muted" />
          <input
            ref={inputRef}
            autoFocus
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            maxLength={200}
            onBlur={handleAdd}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAdd();
              if (e.key === "Escape") {
                setNewTitle("");
                setIsAdding(false);
              }
            }}
            placeholder="Step name..."
            type="text"
            value={newTitle}
          />
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => {
            setIsAdding(true);
            queueMicrotask(() => inputRef.current?.focus());
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add a step
        </button>
      )}
    </div>
  );
}
