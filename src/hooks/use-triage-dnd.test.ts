import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTriageDnd } from "./use-dnd";

const addStagedCandidateMock = vi.hoisted(() => vi.fn());

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: (
    selector: (state: {
      addStagedCandidate: typeof addStagedCandidateMock;
    }) => unknown,
  ) => selector({ addStagedCandidate: addStagedCandidateMock }),
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
    return k === "triage-node-zone-drop" || k === "triage-bit-zone-drop";
  },
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
  addStagedCandidateMock.mockClear();
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
});
