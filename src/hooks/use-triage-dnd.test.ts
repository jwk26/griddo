import { act, fireEvent, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { invalidateTriageDragSource, useTriageDnd } from "./use-dnd";
import type { TriageOperationKind } from "./use-triage-operation-lock";

const addStagedCandidateMock = vi.hoisted(() => vi.fn());
const removeStagedCandidateMock = vi.hoisted(() => vi.fn());
const stageCandidateMock = vi.hoisted(() => vi.fn());
const reconcileStageCandidateMock = vi.hoisted(() => vi.fn());
const unstageCandidateMock = vi.hoisted(() => vi.fn());
const reconcileUnstageCandidateMock = vi.hoisted(() => vi.fn());
const focusUnstagedSourceMock = vi.hoisted(() => vi.fn());
const operationLockState = vi.hoisted(() => ({
  activeOperation: null as null | {
    kind: TriageOperationKind;
    operationId: string;
  },
  acquire: vi.fn(),
  isLocked: vi.fn(),
  release: vi.fn(),
}));
const getDataStoreMock = vi.hoisted(() => vi.fn());
const getGridOccupancyMock = vi.hoisted(() => vi.fn());
const createNodeMock = vi.hoisted(() => vi.fn());
const createBitMock = vi.hoisted(() => vi.fn());
const markScratchBreakdownConsumedMock = vi.hoisted(() => vi.fn());
const findNearestEmptyCellMock = vi.hoisted(() => vi.fn());
const useSensorMock = vi.hoisted(() =>
  vi.fn((sensor: unknown, options: unknown) => ({ sensor, options })),
);

vi.mock("@dnd-kit/core", () => ({
  useSensors: (...sensors: unknown[]) => sensors,
  useSensor: useSensorMock,
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
type TriageDndController = ReturnType<typeof useTriageDnd>;

function makeDragEndEvent(
  dragData: unknown,
  dropData: unknown | null,
): DragEndEvent {
  const normalizedDragData =
    typeof dragData === "object" &&
    dragData !== null &&
    "kind" in dragData &&
    (dragData.kind === "triage-breakdown" ||
      dragData.kind === "triage-staged-node" ||
      dragData.kind === "triage-staged-bit")
      ? {
          scratchId: "scratch-1",
          sourceBreakdownId:
            "sourceBreakdownId" in dragData
              ? dragData.sourceBreakdownId
              : "id" in dragData
                ? dragData.id
                : "row-1",
          sourceVersion: 1,
          sourceLifecycle: "active",
          ...(dragData.kind === "triage-breakdown"
            ? {}
            : {
                candidateVersion: 1,
                candidateLifecycle: "staged",
                resultType:
                  dragData.kind === "triage-staged-node" ? "node" : "bit",
              }),
          ...dragData,
        }
      : dragData;
  return {
    active: { id: "test-id", data: { current: normalizedDragData } },
    over:
      dropData !== null
        ? { id: "test-drop", data: { current: dropData } }
        : null,
  } as DragEndEvent;
}

function completeDrag(
  controller: TriageDndController,
  event: DragEndEvent,
): ReturnType<TriageDndController["handleDragEnd"]> {
  controller.handleDragStart(event);
  return controller.handleDragEnd(event);
}

function makeBreakdownDragData(overrides: Record<string, unknown> = {}) {
  return {
    kind: "triage-breakdown",
    id: "row-1",
    label: "My note",
    scratchId: "scratch-1",
    sourceBreakdownId: "row-1",
    sourceVersion: 1,
    sourceLifecycle: "active",
    ...overrides,
  };
}

function makeStagedDragData(overrides: Record<string, unknown> = {}) {
  return {
    kind: "triage-staged-node",
    id: "candidate-1",
    label: "Project",
    scratchId: "scratch-1",
    sourceBreakdownId: "breakdown-1",
    sourceVersion: 3,
    sourceLifecycle: "active",
    candidateVersion: 2,
    candidateLifecycle: "staged",
    resultType: "node",
    ...overrides,
  };
}

function installRenderedHierarchyTarget(dropData: Record<string, unknown>) {
  const target = document.createElement("div");
  target.dataset.triageHierarchyDrop = JSON.stringify(dropData);
  document.body.append(target);
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: vi.fn(() => [target]),
  });
  return target;
}

beforeEach(() => {
  vi.clearAllMocks();
  document
    .querySelectorAll("[data-triage-hierarchy-drop]")
    .forEach((element) => element.remove());
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: vi.fn(() => []),
  });
  operationLockState.activeOperation = null;
  operationLockState.isLocked.mockImplementation(
    () => operationLockState.activeOperation !== null,
  );
  operationLockState.acquire.mockImplementation((kind, operationId) => {
    if (operationLockState.activeOperation !== null) return false;
    operationLockState.activeOperation = { kind, operationId };
    return true;
  });
  operationLockState.release.mockImplementation((operationId) => {
    if (operationLockState.activeOperation?.operationId !== operationId) {
      return false;
    }
    operationLockState.activeOperation = null;
    return true;
  });
  stageCandidateMock.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    candidate: null,
    source: null,
    scratch: null,
  }));
  reconcileStageCandidateMock.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    candidate: null,
    source: null,
    scratch: null,
  }));
  unstageCandidateMock.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    candidate: null,
    source: null,
  }));
  reconcileUnstageCandidateMock.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    candidate: null,
    source: null,
  }));
  getGridOccupancyMock.mockResolvedValue(new Set<string>());
  getDataStoreMock.mockResolvedValue({
    getGridOccupancy: getGridOccupancyMock,
    createNode: createNodeMock,
    createBit: createBitMock,
    markScratchBreakdownConsumed: markScratchBreakdownConsumedMock,
  });
  findNearestEmptyCellMock.mockReturnValue({ x: 0, y: 0 });
});

function durableCandidateOptions() {
  return {
    operationLock: operationLockState,
    stageCandidate: stageCandidateMock,
    reconcileStageCandidate: reconcileStageCandidateMock,
    unstageCandidate: unstageCandidateMock,
    reconcileUnstageCandidate: reconcileUnstageCandidateMock,
    removeStagedCandidate: removeStagedCandidateMock,
    focusUnstagedSource: focusUnstagedSourceMock,
  };
}

describe("useTriageDnd — Task 145 durable Stage/Unstage adapters", () => {
  it("acquires Stage synchronously and dispatches the exact activation snapshot before terminal release", async () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );
    const drag = makeBreakdownDragData({ sourceVersion: 7 });

    await act(async () => {
      await completeDrag(
        result.current,
        makeDragEndEvent(drag, { kind: "triage-bit-zone-drop" }),
      );
    });

    expect(operationLockState.acquire).toHaveBeenCalledWith(
      "stage",
      expect.any(String),
    );
    expect(stageCandidateMock).toHaveBeenCalledWith({
      operationId: expect.any(String),
      candidateId: expect.any(String),
      scratchBitId: "scratch-1",
      sourceBreakdownId: "row-1",
      sourceExpectedVersion: 7,
      resultType: "bit",
    });
    const command = stageCandidateMock.mock.calls[0]?.[0];
    expect(operationLockState.acquire.mock.invocationCallOrder[0]).toBeLessThan(
      stageCandidateMock.mock.invocationCallOrder[0]!,
    );
    expect(operationLockState.release).toHaveBeenCalledWith(
      command.operationId,
      "applied",
    );
  });

  it("reconciles an unknown Stage with the same identity before terminal release", async () => {
    stageCandidateMock.mockImplementationOnce(async (command) => ({
      operationId: command.operationId,
      outcome: "unknown",
    }));
    reconcileStageCandidateMock.mockImplementationOnce(async (command) => ({
      operationId: command.operationId,
      status: "not_applied",
      candidate: null,
      source: null,
      scratch: null,
    }));
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    await act(async () => {
      await completeDrag(
        result.current,
        makeDragEndEvent(makeBreakdownDragData(), {
          kind: "triage-node-zone-drop",
        }),
      );
    });

    const command = stageCandidateMock.mock.calls[0]?.[0];
    expect(reconcileStageCandidateMock).toHaveBeenCalledWith(command);
    expect(operationLockState.release).toHaveBeenCalledWith(
      command.operationId,
      "not_applied",
    );
  });

  it("retains an unknown Unstage lock, blocks a competing drag, and queues no replay", async () => {
    unstageCandidateMock.mockImplementationOnce(async (command) => ({
      operationId: command.operationId,
      outcome: "unknown",
    }));
    reconcileUnstageCandidateMock.mockImplementationOnce(async (command) => ({
      operationId: command.operationId,
      outcome: "unknown",
    }));
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    await act(async () => {
      await completeDrag(
        result.current,
        makeDragEndEvent(makeStagedDragData(), {
          kind: "triage-remove-drop",
        }),
      );
    });

    expect(operationLockState.activeOperation?.kind).toBe("unstage");
    expect(operationLockState.release).not.toHaveBeenCalled();

    await act(async () => {
      await completeDrag(
        result.current,
        makeDragEndEvent(makeBreakdownDragData(), {
          kind: "triage-node-zone-drop",
        }),
      );
    });

    expect(stageCandidateMock).not.toHaveBeenCalled();
    expect(unstageCandidateMock).toHaveBeenCalledOnce();
    expect(reconcileUnstageCandidateMock).toHaveBeenCalledOnce();
  });

  it("dispatches exact Unstage CAS identity and restores source focus only after confirmed success", async () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    await act(async () => {
      await completeDrag(
        result.current,
        makeDragEndEvent(makeStagedDragData(), {
          kind: "triage-remove-drop",
        }),
      );
    });

    expect(unstageCandidateMock).toHaveBeenCalledWith({
      operationId: expect.any(String),
      candidateId: "candidate-1",
      candidateExpectedVersion: 2,
      sourceBreakdownId: "breakdown-1",
      sourceExpectedVersion: 3,
    });
    expect(focusUnstagedSourceMock).toHaveBeenCalledWith("breakdown-1");
  });

  it.each([
    ["stage", "applied"],
    ["stage", "already_applied"],
    ["stage", "not_applied"],
    ["stage", "rejected"],
    ["stage", "conflict"],
    ["unstage", "applied"],
    ["unstage", "already_applied"],
    ["unstage", "not_applied"],
    ["unstage", "rejected"],
    ["unstage", "conflict"],
  ] as const)(
    "releases the exact %s owner on terminal %s and focuses only confirmed Unstage",
    async (kind, status) => {
      if (kind === "stage") {
        stageCandidateMock.mockImplementationOnce(async (command) => ({
          operationId: command.operationId,
          status,
          candidate: null,
          source: null,
          scratch: null,
        }));
      } else {
        unstageCandidateMock.mockImplementationOnce(async (command) => ({
          operationId: command.operationId,
          status,
          candidate: null,
          source: null,
        }));
      }
      const { result } = renderHook(() =>
        useTriageDnd("scratch-1", durableCandidateOptions()),
      );

      await act(async () => {
        await completeDrag(
          result.current,
          makeDragEndEvent(
            kind === "stage" ? makeBreakdownDragData() : makeStagedDragData(),
            {
              kind:
                kind === "stage"
                  ? "triage-node-zone-drop"
                  : "triage-remove-drop",
            },
          ),
        );
      });

      const command =
        kind === "stage"
          ? stageCandidateMock.mock.calls[0]?.[0]
          : unstageCandidateMock.mock.calls[0]?.[0];
      expect(operationLockState.release).toHaveBeenCalledWith(
        command.operationId,
        status,
      );
      expect(focusUnstagedSourceMock).toHaveBeenCalledTimes(
        kind === "unstage" &&
          (status === "applied" || status === "already_applied")
          ? 1
          : 0,
      );
    },
  );
});

describe("useTriageDnd — pointer activation lifecycle", () => {
  it("uses only the exact Mouse and Touch activation constraints", () => {
    renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    expect(useSensorMock).toHaveBeenCalledTimes(2);
    expect(useSensorMock.mock.calls[0]?.[1]).toEqual({
      activationConstraint: { distance: 8 },
    });
    expect(useSensorMock.mock.calls[1]?.[1]).toEqual({
      activationConstraint: { delay: 250, tolerance: 5 },
    });
  });

  it("keeps the activation snapshot stable when draggable data changes", () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );
    const dragData = makeBreakdownDragData();
    const event = makeDragEndEvent(dragData, null);

    act(() => {
      result.current.handleDragStart(event);
      dragData.label = "Remote replacement";
      dragData.sourceVersion = 2;
    });

    expect(result.current.activeDragItem).toEqual(
      expect.objectContaining({
        integrity: "current",
        label: "My note",
        sourceVersion: 1,
      }),
    );
  });

  it("cancels a Breakdown drop when remote authority changes after activation", async () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    act(() => {
      result.current.handleDragStart(
        makeDragEndEvent(makeBreakdownDragData(), null),
      );
    });
    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          makeBreakdownDragData({ label: "Remote edit", sourceVersion: 2 }),
          { kind: "triage-node-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
    expect(getDataStoreMock).not.toHaveBeenCalled();
    expect(result.current.activeDragItem).toBeNull();
  });

  it("cancels a staged drop when candidate authority changes after activation", async () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    act(() => {
      result.current.handleDragStart(
        makeDragEndEvent(makeStagedDragData(), null),
      );
    });
    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(
          makeStagedDragData({ candidateVersion: 3 }),
          { kind: "triage-remove-drop" },
        ),
      );
    });

    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(getDataStoreMock).not.toHaveBeenCalled();
  });

  it("cancels when the active source unmounts even if drag-end data stays stale", async () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );
    const dragData = makeStagedDragData();
    installRenderedHierarchyTarget({
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:parent-1",
      parentNodeId: "parent-1",
      targetNodeLevel: 0,
      targetTitle: "Parent",
      targetParentPath: ["Home"],
    });

    act(() => {
      result.current.handleDragStart(makeDragEndEvent(dragData, null));
      fireEvent.mouseMove(document, { clientX: 30, clientY: 40 });
    });
    await waitFor(() =>
      expect(result.current.targetFeedback?.state).toBe("valid"),
    );
    act(() => invalidateTriageDragSource(dragData));

    expect(result.current.activeDragItem).toEqual(
      expect.objectContaining({
        id: "candidate-1",
        candidateVersion: 2,
        integrity: "invalidated",
      }),
    );
    expect(result.current.targetFeedback).toBeNull();

    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(dragData, { kind: "triage-remove-drop" }),
      );
    });

    expect(result.current.activeDragItem).toBeNull();
    expect(removeStagedCandidateMock).not.toHaveBeenCalled();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
  });

  it("does not retarget a drop from invalid activation data to valid release data", async () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    act(() => {
      result.current.handleDragStart(
        makeDragEndEvent(
          makeBreakdownDragData({ scratchId: "scratch-2" }),
          null,
        ),
      );
    });
    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(makeBreakdownDragData(), {
          kind: "triage-node-zone-drop",
        }),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
    expect(getDataStoreMock).not.toHaveBeenCalled();
  });

  it("cancels the active lifecycle on Escape and suppresses its later drop", async () => {
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );
    const dragData = makeBreakdownDragData();

    act(() => {
      result.current.handleDragStart(makeDragEndEvent(dragData, null));
      fireEvent.keyDown(document, { key: "Escape" });
    });
    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(dragData, { kind: "triage-node-zone-drop" }),
      );
    });

    expect(result.current.activeDragItem).toBeNull();
    expect(addStagedCandidateMock).not.toHaveBeenCalled();
    expect(getDataStoreMock).not.toHaveBeenCalled();
  });
});

describe("useTriageDnd — drop matrix", () => {
  it("uses the final rendered pointer-under hierarchy target instead of stale drag-over data", async () => {
    const releaseTarget = {
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:release-target",
      parentNodeId: "release-target",
      targetNodeLevel: 1,
      targetTitle: "Release Target",
      targetParentPath: ["Home", "Current"],
    };
    installRenderedHierarchyTarget(releaseTarget);
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );
    const dragData = makeStagedDragData();

    act(() => {
      result.current.handleDragStart(makeDragEndEvent(dragData, null));
      fireEvent.mouseMove(document, { clientX: 240, clientY: 180 });
    });
    await act(async () => {
      await result.current.handleDragEnd(
        makeDragEndEvent(dragData, {
          ...releaseTarget,
          dropId: "triage-hierarchy:stale-target",
          parentNodeId: "stale-target",
          targetTitle: "Stale Target",
        }),
      );
    });

    expect(result.current.pendingPlacement).toEqual(
      expect.objectContaining({
        dropId: "triage-hierarchy:release-target",
        parentNodeId: "release-target",
        targetTitle: "Release Target",
      }),
    );
  });

  it("continuously reports full rendered targets while preserving them for release", async () => {
    const target = {
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:full-target",
      parentNodeId: "full-target",
      targetNodeLevel: 0,
      targetTitle: "Full Target",
      targetParentPath: ["Home"],
    };
    installRenderedHierarchyTarget(target);
    findNearestEmptyCellMock.mockReturnValue(null);
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );
    const dragData = makeStagedDragData();

    act(() => {
      result.current.handleDragStart(makeDragEndEvent(dragData, null));
      fireEvent.touchMove(document, {
        touches: [{ clientX: 80, clientY: 120 }],
      });
    });

    await waitFor(() => {
      expect(result.current.targetFeedback).toEqual({
        dropId: target.dropId,
        state: "full",
      });
    });

    await act(async () => {
      await result.current.handleDragEnd(makeDragEndEvent(dragData, target));
    });
    expect(result.current.pendingPlacement).toEqual(
      expect.objectContaining({ dropId: target.dropId, isFull: true }),
    );
  });

  it("reports an invalid pointer-under target without querying occupancy and clears it on Escape", async () => {
    const target = {
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:home",
      parentNodeId: null,
      targetNodeLevel: null,
      targetTitle: "Home",
      targetParentPath: [],
    };
    installRenderedHierarchyTarget(target);
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    act(() => {
      result.current.handleDragStart(
        makeDragEndEvent(
          makeStagedDragData({
            kind: "triage-staged-bit",
            resultType: "bit",
          }),
          null,
        ),
      );
      fireEvent.mouseMove(document, { clientX: 20, clientY: 30 });
    });

    expect(result.current.targetFeedback).toEqual({
      dropId: target.dropId,
      state: "invalid",
    });
    expect(getGridOccupancyMock).not.toHaveBeenCalled();

    act(() => fireEvent.keyDown(document, { key: "Escape" }));
    expect(result.current.targetFeedback).toBeNull();
  });

  it("switches feedback to the latest rendered column and cancels it on pointer exit", async () => {
    const first = installRenderedHierarchyTarget({
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:first",
      parentNodeId: "first",
      targetNodeLevel: 0,
      targetTitle: "First",
      targetParentPath: ["Home"],
    });
    const second = document.createElement("div");
    second.dataset.triageHierarchyDrop = JSON.stringify({
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:second",
      parentNodeId: "second",
      targetNodeLevel: 1,
      targetTitle: "Second",
      targetParentPath: ["Home", "First"],
    });
    document.body.append(second);
    let pointerTarget: Element | null = first;
    vi.mocked(document.elementsFromPoint).mockImplementation(() =>
      pointerTarget === null ? [] : [pointerTarget],
    );
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    act(() => {
      result.current.handleDragStart(
        makeDragEndEvent(makeStagedDragData(), null),
      );
      fireEvent.mouseMove(document, { clientX: 20, clientY: 30 });
    });
    await waitFor(() =>
      expect(result.current.targetFeedback?.dropId).toBe(
        "triage-hierarchy:first",
      ),
    );

    pointerTarget = second;
    act(() => fireEvent.mouseMove(document, { clientX: 220, clientY: 30 }));
    await waitFor(() =>
      expect(result.current.targetFeedback?.dropId).toBe(
        "triage-hierarchy:second",
      ),
    );

    pointerTarget = null;
    act(() => fireEvent.mouseMove(document, { clientX: 900, clientY: 700 }));
    expect(result.current.targetFeedback).toBeNull();
    expect(result.current.overTargetId).toBeNull();
  });

  it("cancels target feedback when the pointer leaves the browser document", async () => {
    installRenderedHierarchyTarget({
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:parent-1",
      parentNodeId: "parent-1",
      targetNodeLevel: 0,
      targetTitle: "Parent",
      targetParentPath: ["Home"],
    });
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );

    act(() => {
      result.current.handleDragStart(
        makeDragEndEvent(makeStagedDragData(), null),
      );
      fireEvent.mouseMove(document, { clientX: 20, clientY: 30 });
    });
    await waitFor(() =>
      expect(result.current.targetFeedback?.state).toBe("valid"),
    );

    act(() => fireEvent.mouseLeave(document));
    expect(result.current.targetFeedback).toBeNull();
    expect(result.current.overTargetId).toBeNull();
  });

  it("cancels explicit DnD cancellation and suppresses a later drag end", async () => {
    const target = {
      kind: "triage-hierarchy-drop",
      dropId: "triage-hierarchy:parent-1",
      parentNodeId: "parent-1",
      targetNodeLevel: 0,
      targetTitle: "Parent",
      targetParentPath: ["Home"],
    };
    installRenderedHierarchyTarget(target);
    const { result } = renderHook(() =>
      useTriageDnd("scratch-1", durableCandidateOptions()),
    );
    const dragData = makeStagedDragData();

    act(() => {
      result.current.handleDragStart(makeDragEndEvent(dragData, null));
      fireEvent.mouseMove(document, { clientX: 30, clientY: 40 });
      result.current.handleDragCancel();
    });
    await act(async () => {
      await result.current.handleDragEnd(makeDragEndEvent(dragData, target));
    });

    expect(result.current.activeDragItem).toBeNull();
    expect(result.current.targetFeedback).toBeNull();
    expect(result.current.pendingPlacement).toBeNull();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
  });

  it("dispatches durable Node Stage when a breakdown row drops on the Node Zone", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My note" },
          { kind: "triage-node-zone-drop" },
        ),
      );
    });

    expect(stageCandidateMock).toHaveBeenCalledOnce();
    expect(stageCandidateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resultType: "node",
        sourceBreakdownId: "row-1",
        sourceExpectedVersion: 1,
      }),
    );
  });

  it("dispatches durable Bit Stage when a breakdown row drops on the Bit Zone", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-2", label: "Call Sam" },
          { kind: "triage-bit-zone-drop" },
        ),
      );
    });

    expect(stageCandidateMock).toHaveBeenCalledOnce();
    expect(stageCandidateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resultType: "bit",
        sourceBreakdownId: "row-2",
        sourceExpectedVersion: 1,
      }),
    );
  });

  it("is a noop when a staged-node drops on any zone (invalid cross-type drop)", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    act(() => {
      completeDrag(result.current,
        makeDragEndEvent(
          { kind: "triage-staged-node", id: "cand-1", label: "Project" },
          { kind: "triage-bit-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("is a noop when a staged-bit drops on any zone (invalid cross-type drop)", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    act(() => {
      completeDrag(result.current,
        makeDragEndEvent(
          { kind: "triage-staged-bit", id: "cand-2", label: "Todo" },
          { kind: "triage-node-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("is a noop when selectedScratchId is null", () => {
    const { result } = renderHook(() => useTriageDnd(null, durableCandidateOptions()));

    act(() => {
      completeDrag(result.current,
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My note" },
          { kind: "triage-node-zone-drop" },
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("is a noop when dropped outside any zone", () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    act(() => {
      completeDrag(result.current,
        makeDragEndEvent(
          { kind: "triage-breakdown", id: "row-1", label: "My note" },
          null,
        ),
      );
    });

    expect(addStagedCandidateMock).not.toHaveBeenCalled();
  });

  it("creates a pending placement when a staged Node drops on a hierarchy target", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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

    expect(unstageCandidateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: "candidate-2",
        sourceBreakdownId: "breakdown-2",
      }),
    );
    expect(getDataStoreMock).not.toHaveBeenCalled();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
    expect(result.current.pendingPlacement).toBeNull();
  });

  it("does not create a pending placement for a staged Bit dropped on Home", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd(null, durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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

    expect(unstageCandidateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: "candidate-1",
        sourceBreakdownId: "breakdown-1",
      }),
    );
    expect(getDataStoreMock).not.toHaveBeenCalled();
    expect(getGridOccupancyMock).not.toHaveBeenCalled();
    expect(createNodeMock).not.toHaveBeenCalled();
    expect(createBitMock).not.toHaveBeenCalled();
    expect(markScratchBreakdownConsumedMock).not.toHaveBeenCalled();
  });

  it("ignores a breakdown row dropped on the remove target", async () => {
    const { result } = renderHook(() => useTriageDnd("scratch-1", durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
    const { result } = renderHook(() => useTriageDnd(null, durableCandidateOptions()));

    await act(async () => {
      await completeDrag(result.current,
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
