import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TriagePlacementCommand } from "@/hooks/use-triage-placement";
import type { TriageOperationLock } from "@/hooks/use-triage-operation-lock";
import type { PlacementUndoResult } from "@/lib/db/datastore";
import type { ScratchBreakdown, StagedCandidate } from "@/lib/db/schema";
import type { Bit, Node } from "@/types";
import {
  createTriagePlacementUndoCommand,
  useTriageNewlyPlaced,
  useTriageNewlyPlacedUndo,
} from "./use-triage-newly-placed";

function createNode(id: string, x: number, y: number): Node {
  return {
    id,
    title: id,
    color: "hsl(221, 83%, 53%)",
    icon: "Folder",
    deadline: null,
    deadlineAllDay: false,
    mtime: 1,
    createdAt: 1,
    parentId: null,
    level: 0,
    x,
    y,
    deletedAt: null,
    archivedAt: null,
    systemRole: null,
    hiddenFromGrid: false,
    version: 1,
    pastDeadlineDismissed: false,
  };
}

function createBit(id: string, x: number, y: number): Bit {
  return {
    id,
    title: id,
    description: "",
    icon: "ListTodo",
    deadline: null,
    deadlineAllDay: false,
    priority: null,
    status: "active",
    mtime: 1,
    createdAt: 1,
    parentId: "parent-1",
    x,
    y,
    deletedAt: null,
    archivedAt: null,
    version: 1,
    pastDeadlineDismissed: false,
  };
}

function command(
  resultId: string,
  resultType: "node" | "bit",
  sequence: number,
  staged = false,
): TriagePlacementCommand {
  const base = {
    operationId: `operation-${sequence}`,
    resultId,
    scratchBitId: "scratch-1",
    sourceBreakdownId: `source-${sequence}`,
    sourceExpectedVersion: sequence,
    resultType,
    title: resultId,
    targetParentId: resultType === "node" ? null : "parent-1",
    expectedAncestorIds: resultType === "node" ? [] : ["parent-1"],
    x: sequence * 10,
    y: sequence * 20,
  } as const;
  return staged
    ? {
        ...base,
        candidateId: `candidate-${sequence}`,
        candidateExpectedVersion: sequence + 10,
      }
    : base;
}

function source(sequence: number): ScratchBreakdown {
  return {
    id: `source-${sequence}`,
    scratchBitId: "scratch-1",
    content: `Source ${sequence}`,
    order: sequence,
    createdAt: sequence,
    consumedAt: null,
    version: sequence,
  };
}

function candidate(sequence: number): StagedCandidate {
  return {
    id: `candidate-${sequence}`,
    scratchBitId: "scratch-1",
    sourceBreakdownId: `source-${sequence}`,
    resultType: "bit",
    lifecycle: "staged",
    createdAt: sequence,
    updatedAt: sequence,
    version: sequence + 10,
  };
}

describe("useTriageNewlyPlaced", () => {
  it("retains exact direct and staged placement provenance", () => {
    const { result } = renderHook(() => useTriageNewlyPlaced());
    const node = createNode("node-1", 10, 20);
    const bit = createBit("bit-1", 20, 40);

    act(() => {
      expect(result.current.registerPlacement({
        result: node,
        command: command(node.id, "node", 1),
        sourceSnapshot: source(1),
        candidateSnapshot: null,
      })).toBe(true);
      expect(result.current.registerPlacement({
        result: bit,
        command: command(bit.id, "bit", 2, true),
        sourceSnapshot: source(2),
        candidateSnapshot: candidate(2),
      })).toBe(true);
    });

    expect(result.current.getProvenance("node", node.id)).toMatchObject({
      operationId: "operation-1",
      resultId: node.id,
      resultType: "node",
      resultVersion: 1,
      source: {
        scratchBitId: "scratch-1",
        breakdownId: "source-1",
        expectedVersion: 1,
        snapshot: source(1),
      },
      candidate: null,
      destination: { parentId: null, pathIds: [], x: 10, y: 20 },
    });
    expect(result.current.getProvenance("bit", bit.id)).toMatchObject({
      operationId: "operation-2",
      resultId: bit.id,
      resultType: "bit",
      resultVersion: 1,
      candidate: {
        id: "candidate-2",
        expectedVersion: 12,
        snapshot: candidate(2),
      },
      destination: { parentId: "parent-1", pathIds: ["parent-1"], x: 20, y: 40 },
    });
  });

  it("pins multiple local results newest-first within type without changing records or ordinary order", () => {
    const { result } = renderHook(() => useTriageNewlyPlaced());
    const ordinaryNode = createNode("ordinary-node", 1, 2);
    const firstNode = createNode("first-node", 10, 20);
    const secondNode = createNode("second-node", 30, 40);
    const ordinaryBit = createBit("ordinary-bit", 3, 4);
    const localBit = createBit("local-bit", 50, 60);

    act(() => {
      result.current.registerPlacement({ result: firstNode, command: command(firstNode.id, "node", 1), sourceSnapshot: source(1), candidateSnapshot: null });
      result.current.registerPlacement({ result: localBit, command: command(localBit.id, "bit", 2), sourceSnapshot: source(2), candidateSnapshot: null });
      result.current.registerPlacement({ result: secondNode, command: command(secondNode.id, "node", 3), sourceSnapshot: source(3), candidateSnapshot: null });
    });

    const projectedNodes = result.current.project("node", [ordinaryNode, firstNode, secondNode]);
    const projectedBits = result.current.project("bit", [ordinaryBit, localBit]);

    expect(projectedNodes.map(({ id }) => id)).toEqual([secondNode.id, firstNode.id, ordinaryNode.id]);
    expect(projectedBits.map(({ id }) => id)).toEqual([localBit.id, ordinaryBit.id]);
    expect(projectedNodes[0]).toBe(secondNode);
    expect(projectedBits[0]).toBe(localBit);
    expect(secondNode).toMatchObject({ x: 30, y: 40 });
    expect(localBit).toMatchObject({ x: 50, y: 60 });
  });

  it("ignores mismatched and duplicate results and clears page-session state on unmount", () => {
    const first = renderHook(() => useTriageNewlyPlaced());
    const node = createNode("node-1", 10, 20);

    act(() => {
      expect(first.result.current.registerPlacement({ result: node, command: command("other-id", "node", 1), sourceSnapshot: source(1), candidateSnapshot: null })).toBe(false);
      expect(first.result.current.registerPlacement({ result: node, command: command(node.id, "node", 2), sourceSnapshot: source(2), candidateSnapshot: null })).toBe(true);
      expect(first.result.current.registerPlacement({ result: node, command: command(node.id, "node", 2), sourceSnapshot: source(2), candidateSnapshot: null })).toBe(false);
    });
    expect(first.result.current.isNewlyPlaced("node", node.id)).toBe(true);

    first.unmount();
    const reloaded = renderHook(() => useTriageNewlyPlaced());
    expect(reloaded.result.current.isNewlyPlaced("node", node.id)).toBe(false);
    expect(reloaded.result.current.project("node", [node])).toEqual([node]);
  });

  it("builds staged and direct Undo commands from the exact immutable placement provenance", () => {
    const placedAt = 100;
    const directResult = createNode("node-direct", 10, 20);
    directResult.createdAt = placedAt;
    directResult.mtime = placedAt;
    const stagedResult = createBit("bit-staged", 20, 40);
    stagedResult.createdAt = placedAt;
    stagedResult.mtime = placedAt;
    const { result } = renderHook(() => useTriageNewlyPlaced());

    act(() => {
      result.current.registerPlacement({
        result: directResult,
        command: command(directResult.id, "node", 1),
        sourceSnapshot: source(1),
        candidateSnapshot: null,
      });
      result.current.registerPlacement({
        result: stagedResult,
        command: command(stagedResult.id, "bit", 2, true),
        sourceSnapshot: source(2),
        candidateSnapshot: candidate(2),
      });
    });

    const direct = createTriagePlacementUndoCommand(
      result.current.getProvenance("node", directResult.id)!,
      "undo-direct",
    );
    const staged = createTriagePlacementUndoCommand(
      result.current.getProvenance("bit", stagedResult.id)!,
      "undo-staged",
    );

    expect(direct).toEqual({
      operationId: "undo-direct",
      resultSnapshot: directResult,
      sourceSnapshot: {
        ...source(1),
        consumedAt: placedAt,
        version: 2,
      },
    });
    expect(direct).not.toHaveProperty("candidateSnapshot");
    expect(staged).toEqual({
      operationId: "undo-staged",
      resultSnapshot: stagedResult,
      sourceSnapshot: {
        ...source(2),
        consumedAt: placedAt,
        version: 3,
      },
      candidateSnapshot: candidate(2),
    });
  });

  it("acquires Undo synchronously, retains exact provenance through unknown reconciliation, and releases only terminally", async () => {
    const node = createNode("node-undo", 10, 20);
    node.createdAt = 100;
    node.mtime = 100;
    const placed = renderHook(() => useTriageNewlyPlaced());
    act(() => {
      placed.result.current.registerPlacement({
        result: node,
        command: command(node.id, "node", 1),
        sourceSnapshot: source(1),
        candidateSnapshot: null,
      });
    });
    const entry = placed.result.current.entries[0]!;
    let active: { kind: "undo"; operationId: string } | null = null;
    const acquire = vi.fn((_kind: "undo", operationId: string) => {
      if (active !== null) return false;
      active = { kind: "undo", operationId };
      return true;
    });
    const release = vi.fn((operationId: string, status: string) => {
      if (active?.operationId !== operationId || status !== "applied") return false;
      active = null;
      return true;
    });
    const lock = {
      activeOperation: null,
      acquire,
      isLocked: () => active !== null,
      release,
    } as TriageOperationLock;
    const dispatchUndo = vi.fn(async () => {
      throw new Error("ambiguous transport");
    });
    let finishReconcile!: (value: PlacementUndoResult) => void;
    const reconcileUndo = vi.fn(
      () => new Promise<PlacementUndoResult>((resolve) => {
        finishReconcile = resolve;
      }),
    );
    const observeTruth = vi.fn((_entries, publish) => {
      publish(new Map([["node:node-undo", {
        operationId: "truth-probe",
        status: "not_applied",
        result: node,
        source: { ...source(1), consumedAt: 100, version: 2 },
        candidate: null,
      }]]));
      return () => undefined;
    });
    const undo = renderHook(() => useTriageNewlyPlacedUndo({
      entries: [entry],
      operationLock: lock,
      placementOpen: false,
      hasDirtyEdit: () => false,
      createId: () => "undo-operation",
      observeTruth,
      dispatchUndo,
      reconcileUndo,
    }));

    await waitFor(() => {
      expect(undo.result.current.getState("node", node.id).reason).toBe("available");
    });
    await act(async () => {
      expect(await undo.result.current.activate("node", node.id)).toBe(false);
    });
    expect(acquire).toHaveBeenCalledWith("undo", "undo-operation");
    expect(acquire.mock.invocationCallOrder[0]).toBeLessThan(
      dispatchUndo.mock.invocationCallOrder[0]!,
    );
    expect(undo.result.current.getState("node", node.id)).toMatchObject({
      phase: "unknown",
      command: createTriagePlacementUndoCommand(entry, "undo-operation"),
    });
    expect(active).toEqual({ kind: "undo", operationId: "undo-operation" });
    expect(release).not.toHaveBeenCalled();
    await act(async () => {
      expect(await undo.result.current.activate("node", node.id)).toBe(false);
    });
    expect(dispatchUndo).toHaveBeenCalledTimes(1);
    await act(async () => {
      const pending = undo.result.current.reconcile("node", node.id);
      expect(undo.result.current.getState("node", node.id).phase).toBe("reconciling");
      expect(await undo.result.current.reconcile("node", node.id)).toBe(false);
      finishReconcile({
        operationId: "undo-operation",
        status: "applied",
        result: null,
        source: { ...source(1), consumedAt: null, version: 2 },
        candidate: null,
      });
      expect(await pending).toBe(true);
    });
    expect(release).toHaveBeenCalledWith("undo-operation", "applied");
    expect(active).toBeNull();
    expect(undo.result.current.getState("node", node.id).phase).toBe("success");
  });

  it("derives result/source/candidate/dependency blockers and re-enables after child-first truth", () => {
    const node = createNode("node-truth", 10, 20);
    node.createdAt = 100;
    node.mtime = 100;
    const placed = renderHook(() => useTriageNewlyPlaced());
    act(() => {
      placed.result.current.registerPlacement({
        result: node,
        command: command(node.id, "node", 1),
        sourceSnapshot: source(1),
        candidateSnapshot: null,
      });
    });
    const entry = placed.result.current.entries[0]!;
    let publish!: (truth: ReadonlyMap<string, PlacementUndoResult>) => void;
    const undo = renderHook(() => useTriageNewlyPlacedUndo({
      entries: [entry],
      operationLock: {
        activeOperation: null,
        acquire: vi.fn(() => true),
        isLocked: () => false,
        release: vi.fn(() => true),
      },
      placementOpen: false,
      hasDirtyEdit: () => false,
      observeTruth: (_entries, next) => {
        publish = next;
        return () => undefined;
      },
      dispatchUndo: vi.fn(),
      reconcileUndo: vi.fn(),
    }));
    const exactSource = {
      ...source(1),
      consumedAt: 100,
      version: 2,
    };
    const publishConflict = (overrides: Partial<PlacementUndoResult> = {}) => {
      act(() => {
        publish(new Map([["node:node-truth", {
          operationId: "truth-probe",
          status: "conflict",
          result: node,
          source: exactSource,
          candidate: null,
          ...overrides,
        }]]));
      });
    };

    publishConflict({ result: { ...node, version: 2 } });
    expect(undo.result.current.getState("node", node.id).reason).toBe("result-mutated");
    publishConflict({ source: { ...exactSource, consumedAt: 101 } });
    expect(undo.result.current.getState("node", node.id).reason).toBe("source-mutated");
    publishConflict({ candidate: candidate(1) });
    expect(undo.result.current.getState("node", node.id).reason).toBe("candidate-mutated");
    publishConflict();
    expect(undo.result.current.getState("node", node.id).reason).toBe("dependencies");
    act(() => {
      publish(new Map([["node:node-truth", {
        operationId: "truth-probe",
        status: "not_applied",
        result: node,
        source: exactSource,
        candidate: null,
      }]]));
    });
    expect(undo.result.current.getState("node", node.id)).toMatchObject({
      phase: "available",
      reason: "available",
    });
  });

  it.each([
    ["active owner", { locked: true, placementOpen: false, dirty: false }],
    ["open placement", { locked: false, placementOpen: true, dirty: false }],
    ["dirty Edit intent", { locked: false, placementOpen: false, dirty: true }],
  ] as const)("rejects %s before dispatch without queue or replay", async (_label, blocker) => {
    const node = createNode("node-blocked", 10, 20);
    node.createdAt = 100;
    node.mtime = 100;
    const placed = renderHook(() => useTriageNewlyPlaced());
    act(() => {
      placed.result.current.registerPlacement({
        result: node,
        command: command(node.id, "node", 1),
        sourceSnapshot: source(1),
        candidateSnapshot: null,
      });
    });
    const acquire = vi.fn(() => !blocker.locked);
    const dispatchUndo = vi.fn();
    const undo = renderHook(() => useTriageNewlyPlacedUndo({
      entries: placed.result.current.entries,
      operationLock: {
        activeOperation: blocker.locked ? { kind: "edit", operationId: "edit-1" } : null,
        acquire,
        isLocked: () => blocker.locked,
        release: vi.fn(),
      },
      placementOpen: blocker.placementOpen,
      hasDirtyEdit: () => blocker.dirty,
      createId: () => "blocked-undo",
      observeTruth: (_entries, publish) => {
        publish(new Map([["node:node-blocked", {
          operationId: "truth-probe",
          status: "not_applied",
          result: node,
          source: { ...source(1), consumedAt: 100, version: 2 },
          candidate: null,
        }]]));
        return () => undefined;
      },
      dispatchUndo,
      reconcileUndo: vi.fn(),
    }));

    await waitFor(() => expect(undo.result.current.getState("node", node.id).phase).toBe("blocked"));
    await act(async () => {
      expect(await undo.result.current.activate("node", node.id)).toBe(false);
    });
    expect(dispatchUndo).not.toHaveBeenCalled();
    expect(acquire).toHaveBeenCalledTimes(blocker.locked ? 0 : 0);
  });
});
