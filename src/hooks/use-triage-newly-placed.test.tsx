import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TriagePlacementCommand } from "@/hooks/use-triage-placement";
import type { ScratchBreakdown, StagedCandidate } from "@/lib/db/schema";
import type { Bit, Node } from "@/types";
import { useTriageNewlyPlaced } from "./use-triage-newly-placed";

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
});
