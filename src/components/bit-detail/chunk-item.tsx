"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { format } from "date-fns";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chunk } from "@/types";

type ChunkItemProps = {
  chunk: Chunk;
  isDraggable: boolean;
  onToggle: (chunk: Chunk) => void;
  onEdit: (chunkId: string, title: string) => Promise<void>;
  onDelete: (chunkId: string) => void;
};

export function ChunkItem({ chunk, isDraggable, onToggle, onEdit, onDelete }: ChunkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(chunk.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chunk.id, disabled: !isDraggable });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  const isComplete = chunk.status === "complete";
  const timeLabel = chunk.time
    ? format(new Date(chunk.time), chunk.timeAllDay ? "MMM d" : "MMM d, h:mm a")
    : null;

  async function handleBlur() {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditValue(chunk.title);
    } else if (trimmed !== chunk.title) {
      await onEdit(chunk.id, trimmed);
    }
    setIsEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex items-start gap-3 pb-6"
    >
      {isDraggable ? (
        <button
          type="button"
          aria-label="Drag to reorder"
          className="absolute -left-6 top-0.5 flex h-5 w-5 cursor-grab items-center justify-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      ) : null}

      <div
        className={cn(
          "relative z-10 mt-1.5 h-3 w-3 flex-shrink-0 cursor-pointer rounded-full border-2 border-background transition-colors",
          isComplete ? "bg-primary" : "bg-muted-foreground/30",
        )}
        role="checkbox"
        aria-checked={isComplete}
        aria-label={`Mark "${chunk.title}" as ${isComplete ? "incomplete" : "complete"}`}
        tabIndex={0}
        onClick={() => onToggle(chunk)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(chunk);
          }
        }}
      />

      <div className="flex-1 rounded-md border border-border bg-background px-3 py-2">
        {isEditing ? (
          <input
            autoFocus
            className="w-full bg-transparent text-sm text-foreground focus:outline-none"
            maxLength={200}
            onBlur={handleBlur}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setEditValue(chunk.title);
                setIsEditing(false);
              }
            }}
            value={editValue}
          />
        ) : (
          <p
            className={cn(
              "cursor-text text-sm",
              isComplete ? "line-through text-muted-foreground" : "text-foreground",
            )}
            onClick={() => {
              setEditValue(chunk.title);
              setIsEditing(true);
            }}
          >
            {chunk.title}
          </p>
        )}
        {timeLabel ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{timeLabel}</p>
        ) : null}
      </div>

      <button
        type="button"
        aria-label={`Delete "${chunk.title}"`}
        className="mt-2 flex-shrink-0 text-muted-foreground/50 transition-colors hover:text-destructive"
        onClick={() => onDelete(chunk.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
