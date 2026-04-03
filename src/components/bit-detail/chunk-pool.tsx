"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
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
import { ChunkItem } from "@/components/bit-detail/chunk-item";
import { useChunkActions } from "@/hooks/use-chunk-actions";
import type { Chunk } from "@/types";

type ChunkPoolProps = {
  chunks: Chunk[];
  bitId: string;
};

export type ChunkPoolHandle = {
  startAdding: () => void;
};

export const ChunkPool = forwardRef<ChunkPoolHandle, ChunkPoolProps>(function ChunkPool(
  { chunks, bitId },
  ref,
) {
  const { createChunk, updateChunk, deleteChunk } = useChunkActions();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const isComposingRef = useRef(false);

  const allChunks = chunks.slice().sort((a, b) => a.order - b.order);

  function startAdding() {
    if (isAdding) return;
    setIsAdding(true);
    queueMicrotask(() => inputRef.current?.focus());
  }

  useImperativeHandle(
    ref,
    () => ({
      startAdding,
    }),
    [isAdding],
  );

  async function handleAdd() {
    if (isSubmittingRef.current) return;
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setIsAdding(false);
      setNewTitle("");
      return;
    }
    isSubmittingRef.current = true;
    try {
      await createChunk({
        title: trimmed,
        description: "",
        time: null,
        timeAllDay: false,
        order: chunks.length,
        parentId: bitId,
      });
      setNewTitle("");
      setIsAdding(false);
    } finally {
      isSubmittingRef.current = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      if (isComposingRef.current || event.nativeEvent.isComposing) return;
      void handleAdd();
      return;
    }

    if (event.key === "Escape") {
      setNewTitle("");
      setIsAdding(false);
    }
  }

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

    const ids = allChunks.map((chunk) => chunk.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(allChunks, oldIndex, newIndex);
    await Promise.all(reordered.map((chunk, index) => updateChunk(chunk.id, { order: index })));
  }

  return (
    <div className="flex flex-col gap-2">
      {allChunks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={allChunks.map((chunk) => chunk.id)}
            strategy={verticalListSortingStrategy}
          >
            {allChunks.map((chunk, index) => (
              <ChunkItem
                key={chunk.id}
                chunk={chunk}
                isDraggable={true}
                showConnector={index < allChunks.length - 1}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : null}

      {isAdding ? (
        <div className="flex items-center gap-3 pb-5">
          <div className="mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-muted-foreground/30 bg-transparent" />
          <input
            ref={inputRef}
            autoFocus
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            maxLength={200}
            onBlur={() => void handleAdd()}
            onChange={(event) => setNewTitle(event.target.value)}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Step name..."
            type="text"
            value={newTitle}
          />
        </div>
      ) : null}
    </div>
  );
});

ChunkPool.displayName = "ChunkPool";
