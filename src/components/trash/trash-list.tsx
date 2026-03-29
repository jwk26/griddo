"use client";

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getDataStore } from "@/lib/db/datastore";
import { TrashGroup } from "@/components/trash/trash-group";
import type { Bit, Node } from "@/types";

type TrashItems = { nodes: Node[]; bits: Bit[] };

function isAlreadyDeletedError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Node not found:");
}

export function TrashList({ items }: { items: TrashItems }) {
  const nodeMap = new Map(items.nodes.map((node) => [node.id, node]));
  const groupedBits = new Map<string, Bit[]>();
  const standaloneBits: Bit[] = [];

  for (const bit of items.bits) {
    if (nodeMap.has(bit.parentId)) {
      const nodeBits = groupedBits.get(bit.parentId) ?? [];
      nodeBits.push(bit);
      groupedBits.set(bit.parentId, nodeBits);
      continue;
    }

    standaloneBits.push(bit);
  }

  const sortedNodes = items.nodes.toSorted(
    (left, right) => (right.deletedAt ?? 0) - (left.deletedAt ?? 0),
  );
  const sortedStandaloneBits = standaloneBits.toSorted(
    (left, right) => (right.deletedAt ?? 0) - (left.deletedAt ?? 0),
  );

  async function handleEmptyTrash() {
    try {
      const dataStore = await getDataStore();

      for (const node of sortedNodes) {
        try {
          await dataStore.hardDeleteNode(node.id);
        } catch (error) {
          if (!isAlreadyDeletedError(error)) {
            throw error;
          }
        }
      }

      for (const bit of sortedStandaloneBits) {
        await dataStore.hardDeleteBit(bit.id);
      }

      toast.success("Trash emptied.");
    } catch {
      toast.error("Unable to empty trash.");
    }
  }

  if (sortedNodes.length === 0 && sortedStandaloneBits.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50">
        <p className="text-sm text-muted-foreground">Trash is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Empty trash</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently delete all items?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => void handleEmptyTrash()}>
                Delete all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-3">
        {sortedNodes.map((node) => (
          <TrashGroup
            key={node.id}
            childBits={(groupedBits.get(node.id) ?? []).toSorted(
              (left, right) => (right.deletedAt ?? 0) - (left.deletedAt ?? 0),
            )}
            kind="node"
            node={node}
          />
        ))}
        {sortedStandaloneBits.map((bit) => (
          <TrashGroup key={bit.id} bit={bit} kind="bit" />
        ))}
      </div>
    </div>
  );
}
