import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DataStore } from "@/lib/db/datastore";
import type { Node } from "@/lib/db/schema";
import { useInbox } from "./use-inbox";

const getDataStoreMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    systemRole: overrides.systemRole ?? null,
    hiddenFromGrid: overrides.hiddenFromGrid ?? false,
  };
}

describe("useInbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("finds the Inbox node and creates Scratch Bits with the 0,0 sentinel", async () => {
    const inbox = createNode({ id: crypto.randomUUID(), systemRole: "inbox" });
    const createBit = vi.fn().mockResolvedValue(undefined);
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([
        createNode({ id: crypto.randomUUID() }),
        inbox,
      ]),
      createBit,
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await waitFor(() => {
      expect(result.current.inboxNodeId).toBe(inbox.id);
    });

    await result.current.createScratchBit(" Fast idea ");

    expect(createBit).toHaveBeenCalledWith({
      parentId: inbox.id,
      title: " Fast idea ",
      description: "",
      icon: "sparkles",
      x: 0,
      y: 0,
      deadline: null,
      deadlineAllDay: false,
      priority: null,
    });
  });

  it("exposes inboxNodeId as undefined when no node has systemRole inbox", async () => {
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([
        createNode({ systemRole: null }),
        createNode({ systemRole: "archive_view" }),
      ]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await waitFor(() => {
      expect(dataStore.getAllActiveNodes).toHaveBeenCalled();
    });

    expect(result.current.inboxNodeId).toBeUndefined();
  });

  it("throws when creating a Scratch Bit before Inbox is available", async () => {
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await expect(result.current.createScratchBit("Idea")).rejects.toThrow(
      "Inbox not found",
    );
    expect(dataStore.createBit).not.toHaveBeenCalled();
  });

  it("retries Inbox lookup when system node seeding finishes after initial mount", async () => {
    vi.useFakeTimers();
    const inbox = createNode({ id: crypto.randomUUID(), systemRole: "inbox" });
    const dataStore = {
      getAllActiveNodes: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([inbox]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await actFlush();
    expect(result.current.inboxNodeId).toBeUndefined();

    await actFlush(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.inboxNodeId).toBe(inbox.id);
  });
});

async function actFlush(run?: () => void): Promise<void> {
  await act(async () => {
    run?.();
  });
}
