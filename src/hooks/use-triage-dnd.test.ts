import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTriageDnd } from "./use-dnd";

const addStagedCandidateMock = vi.hoisted(() => vi.fn());
const removeStagedCandidateMock = vi.hoisted(() => vi.fn());
const getDataStoreMock = vi.hoisted(() => vi.fn());
const getGridOccupancyMock = vi.hoisted(() => vi.fn());
const createNodeMock = vi.hoisted(() => vi.fn());
const createBitMock = vi.hoisted(() => vi.fn());
const markScratchBreakdownConsumedMock = vi.hoisted(() => vi.fn());
const findNearestEmptyCellMock = vi.hoisted(() => vi.fn());

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: (
    selector: (state: {
      addStagedCandidate: typeof addStagedCandidateMock;
      removeStagedCandidate: typeof removeStagedCandidateMock;
    }) => unknown,
  ) =>
    selector({
      addStagedCandidate: addStagedCandidateMock,
      removeStagedCandidate: removeStagedCandidateMock,
    }),
}));

vi.mock("@dnd-kit/core", () => ({
  useSensors: (...sensors: unknown[]) => sensors,
  useSensor: () => ({}),
  MouseSensor: class {},
  TouchSensor: class {},
}));

vi.mock("@/lib/grid-dnd", () => ({
  isTriageDropData: (value: unknown) => {
    if (typeof value !== "object" || value === null || !("kind" in value))
      return false;
    const k = (value as { kind: unknown }).kind;
    return (
      k === "triage-node-zone-drop" ||
      k === "triage-bit-zone-drop" ||
      k === "triage-remove-drop" ||
      k === "triage-hierarchy-drop"
    );
  },
}));

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

vi.mock("@/lib/utils/bfs", () => ({
  findNearestEmptyCell: findNearestEmptyCellMock,
}));

vi.mock("@/lib/utils/breadcrumb-zone", () => ({
  getStaticBlockedCells: () => new Set<string>(),
  isCellBlocked: vi.fn(() => false),
}));

type DragEndEvent = Parameters<
  ReturnType<typeof useTriageDnd>["handleDragEnd"]
>[0];

function makeDragEndEvent(
  dragData: unknown,
  dropData: unknown | null,
): DragEndEvent {
  return {
    active: { id: "test-id", data: { current: dragData } },
    over:
      dropData !== null
        ? { id: "test-drop", data: { current: dropData } }
        : null,
  } as DragEndEvent;
}

beforeEach(() => {
  vi.clearAllMocks();
  getGridOccupancyMock.mockResolvedValue(new Set<string>());
  getDataStoreMock.mockResolvedValue({
    getGridOccupancy: getGridOccupancyMock,
    createNode: createNodeMock,
    createBit: createBitMock,
    markScratchBreakdownConsumed: markScratchBreakdownConsumedMock,
  });
  findNearestEmptyCellMock.mockReturnValue({ x: 0, y: 0 });
});

describe("useTriageDnd — drop matrix", () => {
  it("creates a Node candidate when a breakdown row drops on the Node Zone", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    act(() => {
      result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My note" },
          { kind: "triage-node-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).toHaveBeenCalledOnce();
    expect(addStagedCandidateMock).toHaveBeenCalledWith(
      "scratch-1",
      expect.objectContaining({
        type: "node",
        sourceBreakdownId: "row-1",
        label: "My note",
      }),
    );
  });

  it("creates a Bit candidate when a breakdown row drops on the Bit Zone", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    act(() => {
      result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-2", label: "Call Sam" },
          { kind: "triage-bit-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).toHaveBeenCalledOnce();
    expect(addStagedCandidateMock).toHaveBeenCalledWith(
      "scratch-1",
      expect.objectContaining({
        type: "bit",
        sourceBreakdownId: "row-2",
        label: "Call Sam",
      }),
    );
  });

  it("is a noop when a staged-node drops on any zone (invalid cross-type drop)", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    act(() => {
      result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-staged-node", id: "cand-1", label: "Project" },
          { kind: "triage-bit-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("is a noop when a staged-bit drops on any zone (invalid cross-type drop)", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    act(() => {
      result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-staged-bit", id: "cand-2", label: "Todo" },
          { kind: "triage-node-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("is a noop when selectedScratchId is null", () => {
    const { result } = renderHook(() => useTriageDnd(null));

    act(() => {
      result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My note" },
          { kind: "triage-node-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("is a noop when dropped outside any zone", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    act(() => {
      result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My note" },
          null,
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("creates a pending placement when a staged Node drops on a hierarchy target", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-node",
            id: "candidate-1",
            label: "Project",
            sourceBreakdownId: "breakdown-1",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    expect(result.current.pendingPlacement).toEqual({
      candidateId: "candidate-1",
      candidateType: "node",
      candidateLabel: "Project",
      sourceBreakdownId: "breakdown-1",
      dropId: "triage-hierarchy:parent-1",
      parentNodeId: "parent-1",
      targetNodeLevel: 0,
      targetTitle: "Parent",
      targetParentPath: ["Home"],
      isFull: false,
      isDirectBreakdown: false,
    });
  });

  it("creates pending placement from a section body drop with the section's parentNodeId and targetNodeLevel", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-node",
            id: "candidate-1",
            label: "Project",
            sourceBreakdownId: "breakdown-1",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:body-l1",
            parentNodeId: "root-node-1",
            targetNodeLevel: 0,
            targetTitle: "Root Node",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    expect(result.current.pendingPlacement).toEqual(
      expect.objectContaining({
        dropId: "triage-hierarchy:body-l1",
        parentNodeId: "root-node-1",
        targetNodeLevel: 0,
        candidateType: "node",
      }),
    );
  });

  it("creates a pending placement with unknown type when a breakdown row drops directly on a hierarchy target", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-breakdown",
            id: "breakdown-1",
            label: "Project",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toEqual({
      candidateId: "breakdown-1",
      candidateType: null,
      candidateLabel: "Project",
      sourceBreakdownId: "breakdown-1",
      dropId: "triage-hierarchy:parent-1",
      parentNodeId: "parent-1",
      targetNodeLevel: 0,
      targetTitle: "Parent",
      targetParentPath: ["Home"],
      isFull: false,
      isDirectBreakdown: true,
    });
  });

  it("confirms a pending Node placement by creating it, consuming the source, and removing the candidate", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-node",
            id: "candidate-1",
            label: "Project",
            sourceBreakdownId: "breakdown-1",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    await act(async () => {
      await result.current.handlePlacementConfirm("scratch-1");
    });

    expect(createNodeMock).toHaveBeenCalledWith({
      title: "Project",
      parentId: "parent-1",
      level: 1,
      x: 0,
      y: 0,
      color: "hsl(210, 80%, 55%)",
      icon: "Folder",
      deadline: null,
      deadlineAllDay: false,
    });
    expect(markScratchBreakdownConsumedMock).toHaveBeenCalledWith(
      "breakdown-1",
    );
    expect(removeStagedCandidateMock).toHaveBeenCalledWith(
      "scratch-1",
      "candidate-1",
    );
    expect(result.current.pendingPlacement).toBeNull();
  });

  it("confirms a direct breakdown placement with the selected Node type without removing a staged candidate", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-breakdown",
            id: "breakdown-1",
            label: "Project",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    await act(async () => {
      await result.current.handlePlacementConfirm("scratch-1", "node");
    });

    expect(createNodeMock).toHaveBeenCalledWith({
      title: "Project",
      parentId: "parent-1",
      level: 1,
      x: 0,
      y: 0,
      color: "hsl(210, 80%, 55%)",
      icon: "Folder",
      deadline: null,
      deadlineAllDay: false,
    });
    expect(markScratchBreakdownConsumedMock).toHaveBeenCalledWith(
      "breakdown-1",
    );
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toBeNull();
  });

  it("keeps a direct breakdown placement open when confirmation has no selected type", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-breakdown",
            id: "breakdown-1",
            label: "Project",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    const placement = result.current.pendingPlacement;

    await act(async () => {
      await result.current.handlePlacementConfirm("scratch-1");
    });

    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toEqual(placement);
  });

  it("cancels a pending placement without datastore writes or candidate removal", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-bit",
            id: "candidate-2",
            label: "Todo",
            sourceBreakdownId: "breakdown-2",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
      result.current.handlePlacementCancel();
    });

    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toBeNull();
  });

  it("removes a staged candidate when dropped on the remove-from-staging target without datastore writes", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-bit",
            id: "candidate-2",
            label: "Todo",
            sourceBreakdownId: "breakdown-2",
          },
          { kind: "triage-remove-drop" },
        ),
      );
    });

    expect(removeStagedCandidateMock).toHaveBeenCalledWith(
      "scratch-1",
      "candidate-2",
    );
    expect(getDataStoreMock).not.toHaveBeenCalled();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toBeNull();
  });

  it("does not create a pending placement for a staged Bit dropped on Home", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-bit",
            id: "candidate-2",
            label: "Todo",
            sourceBreakdownId: "breakdown-2",
          },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:root",
            parentNodeId: null,
            targetNodeLevel: null,
            targetTitle: "Home",
            targetParentPath: [],
          },
        ),
      );
    });

    expect(result.current.pendingPlacement).toBeNull();
    expect(getGridOccupancyMock).not.toHaveBeenCalled();
  });
});

describe("useTriageDnd — T84 direct breakdown → hierarchy path", () => {
  it("does not create pendingPlacement when selectedScratchId is null", async () => {
    const { result } = renderHook(() => useTriageDnd(null));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My idea" },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    expect(result.current.pendingPlacement).toBeNull();
  });

  it("confirms a direct breakdown placement as a Bit without removing a staged candidate", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My idea" },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    await act(async () => {
      await result.current.handlePlacementConfirm("scratch-1", "bit");
    });

    expect(createBitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "My idea",
        parentId: "parent-1",
      }),
    );
    expect(markScratchBreakdownConsumedMock).toHaveBeenCalledWith("row-1");
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toBeNull();
  });

  it("cancels a direct breakdown placement without datastore writes or candidate removal", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My idea" },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:parent-1",
            parentNodeId: "parent-1",
            targetNodeLevel: 0,
            targetTitle: "Parent",
            targetParentPath: ["Home"],
          },
        ),
      );
    });

    act(() => {
      result.current.handlePlacementCancel();
    });

    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toBeNull();
  });

  it("opens pendingPlacement for a direct breakdown drop on Home", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My idea" },
          {
            kind: "triage-hierarchy-drop",
            dropId: "triage-hierarchy:root",
            parentNodeId: null,
            targetNodeLevel: null,
            targetTitle: "Home",
            targetParentPath: [],
          },
        ),
      );
    });

    expect(result.current.pendingPlacement).toEqual(
      expect.objectContaining({
        candidateType: null,
        parentNodeId: null,
        isDirectBreakdown: true,
      }),
    );
  });
});

describe("useTriageDnd — T85 remove-from-staging drop", () => {
  it("removes a staged Node candidate dropped on the remove target without datastore writes", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-node",
            id: "candidate-1",
            label: "Project",
            sourceBreakdownId: "breakdown-1",
          },
          { kind: "triage-remove-drop" },
        ),
      );
    });

    expect(removeStagedCandidateMock).toHaveBeenCalledWith(
      "scratch-1",
      "candidate-1",
    );
    expect(getDataStoreMock).not.toHaveBeenCalled();
    expect(getGridOccupancyMock).not.toHaveBeenCalled();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
  });

  it("ignores a breakdown row dropped on the remove target", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1"));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "breakdown-1", label: "Project" },
          { kind: "triage-remove-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(getDataStoreMock).not.toHaveBeenCalled();
    expect(getGridOccupancyMock).not.toHaveBeenCalled();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
  });

  it("ignores a staged Node dropped on the remove target when no scratch is selected", async () => {
    const { result } = renderHook(() => useTriageDnd(null));

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          {
            kind: "triage-staged-node",
            id: "candidate-1",
            label: "Project",
            sourceBreakdownId: "breakdown-1",
          },
          { kind: "triage-remove-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(getDataStoreMock).not.toHaveBeenCalled();
    expect(getGridOccupancyMock).not.toHaveBeenCalled();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
  });
});
