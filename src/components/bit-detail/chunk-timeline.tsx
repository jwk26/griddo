"use client";

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

  const timedChunks = chunks
    .filter((chunk) => chunk.time !== null)
    .sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

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
      {deadlineLabel ? (
        <div className="relative flex items-center gap-3 pt-1">
          <Clock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{deadlineLabel}</span>
        </div>
      ) : null}
    </>
  );
}
