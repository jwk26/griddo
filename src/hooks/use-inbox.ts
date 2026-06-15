"use client";

import { useCallback, useEffect, useState } from "react";
import { getDataStore } from "@/lib/db/datastore";

const INBOX_LOOKUP_RETRY_MS = 100;

export function useInbox(): {
  inboxNodeId: string | undefined;
  createScratchBit: (title: string) => Promise<void>;
} {
  const [inboxNodeId, setInboxNodeId] = useState<string | undefined>();

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

  return { inboxNodeId, createScratchBit };
}
