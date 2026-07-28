import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DataStore } from "@/lib/db/datastore";
import type { Bit, Node } from "@/lib/db/schema";
import { useInbox } from "./use-inbox";

const getDataStoreMock = vi.hoisted(() => vi.fn());
const liveQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

vi.mock("dexie", () => ({
  liveQuery: liveQueryMock,
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
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "sparkles",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? crypto.randomUUID(),
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

describe("useInbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    liveQueryMock.mockImplementation((query: () => Promise<unknown>) => ({
      subscribe: (observer: {
        next: (value: unknown) => void;
        error: (error: unknown) => void;
      }) => {
        void query().then(observer.next).catch(observer.error);
        return { unsubscribe: vi.fn() };
      },
    }));
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
    let seeded = false;
    const dataStore = {
      getAllActiveNodes: vi.fn().mockImplementation(() => (
        Promise.resolve(seeded ? [inbox] : [])
      )),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await actFlush();
    expect(result.current.inboxNodeId).toBeUndefined();

    seeded = true;
    await actFlush(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.inboxNodeId).toBe(inbox.id);
  });

  it("exposes active system nodes regardless of hiddenFromGrid", async () => {
    const inbox = createNode({
      id: crypto.randomUUID(),
      systemRole: "inbox",
      hiddenFromGrid: true,
    });
    const archive = createNode({
      id: crypto.randomUUID(),
      systemRole: "archive_view",
      hiddenFromGrid: false,
    });
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([
        createNode({ systemRole: null }),
        inbox,
        archive,
        createNode({ systemRole: "inbox", deletedAt: 1 }),
        createNode({ systemRole: "archive_view", archivedAt: 1 }),
      ]),
      getAllActiveBits: vi.fn().mockResolvedValue([]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await waitFor(() => {
      expect(result.current.systemNodes).toEqual([inbox, archive]);
    });
  });

  it("counts only active Scratch Bits under the Inbox node", async () => {
    const inbox = createNode({ id: crypto.randomUUID(), systemRole: "inbox" });
    const otherParentId = crypto.randomUUID();
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([inbox]),
      getAllActiveBits: vi.fn().mockResolvedValue([
        createBit({ parentId: inbox.id, deletedAt: null, archivedAt: null }),
        createBit({ parentId: inbox.id, deletedAt: null, archivedAt: null }),
        createBit({ parentId: inbox.id, deletedAt: 1, archivedAt: null }),
        createBit({ parentId: inbox.id, deletedAt: null, archivedAt: 1 }),
        createBit({ parentId: otherParentId, deletedAt: null, archivedAt: null }),
      ]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await waitFor(() => {
      expect(result.current.scratchCount).toBe(2);
    });
  });

  it("exposes only active Scratch Bits under the Inbox node newest-first", async () => {
    const inbox = createNode({ id: crypto.randomUUID(), systemRole: "inbox" });
    const otherParentId = crypto.randomUUID();
    const newest = createBit({
      id: crypto.randomUUID(),
      title: "Newest",
      parentId: inbox.id,
      createdAt: 300,
      deletedAt: null,
      archivedAt: null,
    });
    const oldest = createBit({
      id: crypto.randomUUID(),
      title: "Oldest",
      parentId: inbox.id,
      createdAt: 100,
      deletedAt: null,
      archivedAt: null,
    });
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([inbox]),
      getAllActiveBits: vi.fn().mockResolvedValue([
        oldest,
        createBit({
          title: "Deleted",
          parentId: inbox.id,
          createdAt: 400,
          deletedAt: 1,
          archivedAt: null,
        }),
        newest,
        createBit({
          title: "Archived",
          parentId: inbox.id,
          createdAt: 500,
          deletedAt: null,
          archivedAt: 1,
        }),
        createBit({
          title: "Other parent",
          parentId: otherParentId,
          createdAt: 600,
          deletedAt: null,
          archivedAt: null,
        }),
      ]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await waitFor(() => {
      expect(result.current.activeScratchBits).toEqual([newest, oldest]);
    });
  });

  it("resets Scratch count to zero while Inbox is unavailable", async () => {
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([]),
      getAllActiveBits: vi.fn().mockResolvedValue([
        createBit({ parentId: crypto.randomUUID() }),
      ]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await waitFor(() => {
      expect(dataStore.getAllActiveNodes).toHaveBeenCalled();
    });
    expect(result.current.scratchCount).toBe(0);
  });

  it("returns an empty active Scratch list while Inbox is unavailable", async () => {
    const dataStore = {
      getAllActiveNodes: vi.fn().mockResolvedValue([]),
      getAllActiveBits: vi.fn().mockResolvedValue([
        createBit({ parentId: crypto.randomUUID() }),
      ]),
      createBit: vi.fn(),
    } as unknown as DataStore;
    getDataStoreMock.mockResolvedValue(dataStore);

    const { result } = renderHook(() => useInbox());

    await waitFor(() => {
      expect(dataStore.getAllActiveNodes).toHaveBeenCalled();
    });
    expect(result.current.activeScratchBits).toEqual([]);
    expect(dataStore.getAllActiveBits).not.toHaveBeenCalled();
  });
});

async function actFlush(run?: () => void): Promise<void> {
  await act(async () => {
    run?.();
  });
}
