"use client";

import { getDataStore } from "@/lib/db/datastore";
import type { Bit, Node } from "@/types";

export function useTrashActions() {
  async function restoreNode(nodeId: string): Promise<void> {
    const dataStore = await getDataStore();
    await dataStore.restoreNode(nodeId);
  }

  async function hardDeleteNode(nodeId: string): Promise<void> {
    const dataStore = await getDataStore();
    await dataStore.hardDeleteNode(nodeId);
  }

  async function restoreBit(bitId: string): Promise<void> {
    const dataStore = await getDataStore();
    await dataStore.restoreBit(bitId);
  }

  async function hardDeleteBit(bitId: string): Promise<void> {
    const dataStore = await getDataStore();
    await dataStore.hardDeleteBit(bitId);
  }

  async function emptyTrash(topLevelNodes: Node[], standaloneBits: Bit[]): Promise<void> {
    const dataStore = await getDataStore();

    for (const node of topLevelNodes) {
      try {
        await dataStore.hardDeleteNode(node.id);
      } catch (error) {
        if (!(error instanceof Error && error.message.startsWith("Node not found:"))) {
          throw error;
        }
      }
    }

    for (const bit of standaloneBits) {
      await dataStore.hardDeleteBit(bit.id);
    }
  }

  return { restoreNode, hardDeleteNode, restoreBit, hardDeleteBit, emptyTrash };
}
