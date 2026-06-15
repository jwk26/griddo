"use client";

import { liveQuery } from "dexie";
import { useCallback, useEffect, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";
import type { Node } from "@/types";

const INBOX_LOOKUP_RETRY_MS = 100;
const SYSTEM_NODE_ORDER: Record<NonNullable<Node["systemRole"]>, number> = {
  inbox: 0,
  archive_view: 1,
};

export function useInbox(): {
  inboxNodeId: string | undefined;
  createScratchBit: (title: string) => Promise<void>;
  scratchCount: number;
  systemNodes: Node[];
} {
  const [inboxNodeId, setInboxNodeId] = useState<string | undefined>();
  const [scratchCount, setScratchCount] = useState(0);
  const [systemNodes, setSystemNodes] = useState<Node[]>([]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadInbox() {
      const dataStore = await getDataStore();
      const nodes = await dataStore.getAllActiveNodes();
      const inboxNode = nodes.find((node) => node.systemRole === "inbox");

      if (cancelled) {
        return;
      }

      if (inboxNode) {
        setInboxNodeId(inboxNode.id);
        return;
      }

      retryTimer = setTimeout(() => {
        void loadInbox();
      }, INBOX_LOOKUP_RETRY_MS);
    }

    void loadInbox();

    return () => {
      cancelled = true;
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      const nodes = await dataStore.getAllActiveNodes();
      return nodes
        .filter(
          (node) =>
            node.systemRole !== null &&
            node.deletedAt === null &&
            node.archivedAt === null,
        )
        .sort((left, right) => {
          if (left.systemRole === null || right.systemRole === null) {
            return 0;
          }

          return SYSTEM_NODE_ORDER[left.systemRole] - SYSTEM_NODE_ORDER[right.systemRole];
        });
    }).subscribe({
      next: (value) => setSystemNodes(value),
      error: (err) => console.error("systemNodes liveQuery error:", err),
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (inboxNodeId === undefined) {
      return;
    }

    const subscription = liveQuery(async () => {
      const dataStore = await getDataStore();
      const bits = await dataStore.getAllActiveBits();
      return bits.filter(
        (bit) =>
          bit.parentId === inboxNodeId &&
          bit.deletedAt === null &&
          bit.archivedAt === null,
      ).length;
    }).subscribe({
      next: (value) => setScratchCount(value),
      error: (err) => console.error("scratchCount liveQuery error:", err),
    });

    return () => subscription.unsubscribe();
  }, [inboxNodeId]);

  const createScratchBit = useCallback(
    async (title: string) => {
      if (inboxNodeId === undefined) {
        throw new Error("Inbox not found");
      }

      const dataStore = await getDataStore();
      await dataStore.createBit({
        parentId: inboxNodeId,
        title,
        description: "",
        icon: "sparkles",
        x: 0,
        y: 0,
        deadline: null,
        deadlineAllDay: false,
        priority: null,
      });
    },
    [inboxNodeId],
  );

  return {
    inboxNodeId,
    createScratchBit,
    scratchCount: inboxNodeId === undefined ? 0 : scratchCount,
    systemNodes,
  };
}
