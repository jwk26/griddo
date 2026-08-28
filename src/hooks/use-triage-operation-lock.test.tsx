import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  TRIAGE_OPERATION_KINDS,
  useTriageOperationLock,
} from "./use-triage-operation-lock";

describe("useTriageOperationLock", () => {
  it.each(TRIAGE_OPERATION_KINDS)(
    "makes every %s acquisition mutually exclusive with every operation kind",
    (ownerKind) => {
      for (const competingKind of TRIAGE_OPERATION_KINDS) {
        const { result, unmount } = renderHook(() => useTriageOperationLock());

        act(() => {
          expect(result.current.acquire(ownerKind, `owner-${ownerKind}`)).toBe(true);
          expect(
            result.current.acquire(competingKind, `next-${competingKind}`),
          ).toBe(false);
        });

        expect(result.current.activeOperation).toEqual({
          kind: ownerKind,
          operationId: `owner-${ownerKind}`,
        });
        unmount();
      }
    },
  );

  it("rejects duplicate acquisition without queueing or replaying it", () => {
    const { result } = renderHook(() => useTriageOperationLock());

    act(() => {
      expect(result.current.acquire("add", "operation-1")).toBe(true);
      expect(result.current.acquire("add", "operation-1")).toBe(false);
      expect(result.current.acquire("delete", "operation-2")).toBe(false);
    });

    act(() => {
      expect(result.current.release("operation-1", "applied")).toBe(true);
    });
    expect(result.current.activeOperation).toBeNull();

    act(() => {
      expect(result.current.release("operation-2", "not_applied")).toBe(false);
    });
    expect(result.current.activeOperation).toBeNull();
  });

  it.each([
    "applied",
    "already_applied",
    "not_applied",
    "rejected",
    "conflict",
  ] as const)("releases the matching owner exactly once on terminal %s", (status) => {
    const { result } = renderHook(() => useTriageOperationLock());

    act(() => {
      expect(result.current.acquire("delete", `delete-${status}`)).toBe(true);
    });
    act(() => {
      expect(result.current.release(`delete-${status}`, status)).toBe(true);
      expect(result.current.release(`delete-${status}`, status)).toBe(false);
    });

    expect(result.current.activeOperation).toBeNull();
  });

  it("does not release a different operation identity", () => {
    const { result } = renderHook(() => useTriageOperationLock());

    act(() => {
      expect(result.current.acquire("archive", "archive-1")).toBe(true);
      expect(result.current.release("archive-2", "conflict")).toBe(false);
    });

    expect(result.current.activeOperation).toEqual({
      kind: "archive",
      operationId: "archive-1",
    });
  });

  it("retains an Edit owner across pending and reconciliation until its terminal result", () => {
    const { result } = renderHook(() => useTriageOperationLock());

    act(() => {
      expect(result.current.acquire("edit", "edit-1")).toBe(true);
      expect(result.current.isLocked()).toBe(true);
      expect(result.current.acquire("delete", "delete-1")).toBe(false);
    });
    expect(result.current.activeOperation).toEqual({
      kind: "edit",
      operationId: "edit-1",
    });

    act(() => {
      expect(result.current.release("edit-1", "conflict")).toBe(true);
    });
    expect(result.current.isLocked()).toBe(false);
    expect(result.current.activeOperation).toBeNull();
  });

  it.each(["stage", "unstage"] as const)(
    "retains the %s owner while every competing intent is rejected, then releases only its matching terminal identity",
    (kind) => {
      const { result } = renderHook(() => useTriageOperationLock());
      const operationId = `${kind}-operation`;

      act(() => {
        expect(result.current.acquire(kind, operationId)).toBe(true);
        for (const competingKind of TRIAGE_OPERATION_KINDS) {
          expect(
            result.current.acquire(
              competingKind,
              `${competingKind}-competing`,
            ),
          ).toBe(false);
        }
        expect(result.current.release(`${operationId}-stale`, "applied")).toBe(
          false,
        );
      });
      expect(result.current.activeOperation).toEqual({ kind, operationId });

      act(() => {
        expect(result.current.release(operationId, "conflict")).toBe(true);
      });
      expect(result.current.activeOperation).toBeNull();
    },
  );

  it("retains the placement owner through pending/unknown/reconciling and rejects the complete competing matrix without replay", () => {
    const { result } = renderHook(() => useTriageOperationLock());

    act(() => {
      expect(result.current.acquire("placement", "placement-1")).toBe(true);
      for (const kind of TRIAGE_OPERATION_KINDS) {
        expect(result.current.acquire(kind, `${kind}-competing`)).toBe(false);
      }
      expect(result.current.release("placement-1", "pending" as never)).toBe(false);
      expect(result.current.release("placement-1", "unknown" as never)).toBe(false);
      expect(result.current.release("placement-1", "reconciling" as never)).toBe(false);
    });
    expect(result.current.activeOperation).toEqual({
      kind: "placement",
      operationId: "placement-1",
    });

    act(() => {
      expect(result.current.release("placement-1", "not_applied")).toBe(true);
    });
    expect(result.current.activeOperation).toBeNull();
    expect(result.current.acquire).toBeDefined();
  });

  it("retains the Undo owner through pending/unknown/reconciling and releases only on a terminal result", () => {
    const { result } = renderHook(() => useTriageOperationLock());

    act(() => {
      expect(result.current.acquire("undo", "undo-1")).toBe(true);
      for (const kind of TRIAGE_OPERATION_KINDS) {
        expect(result.current.acquire(kind, `${kind}-competing`)).toBe(false);
      }
      expect(result.current.release("undo-1", "pending" as never)).toBe(false);
      expect(result.current.release("undo-1", "unknown" as never)).toBe(false);
      expect(result.current.release("undo-1", "reconciling" as never)).toBe(false);
    });
    expect(result.current.activeOperation).toEqual({
      kind: "undo",
      operationId: "undo-1",
    });

    act(() => {
      expect(result.current.release("undo-1", "conflict")).toBe(true);
    });
    expect(result.current.activeOperation).toBeNull();
  });

  it.each(TRIAGE_OPERATION_KINDS)(
    "exposes the active %s owner synchronously to shared exit blockers",
    (kind) => {
      const { result } = renderHook(() => useTriageOperationLock());

      act(() => {
        expect(result.current.acquire(kind, `${kind}-exit`)).toBe(true);
        expect(result.current.isLocked()).toBe(true);
      });
      expect(result.current.activeOperation).toEqual({
        kind,
        operationId: `${kind}-exit`,
      });

      act(() => {
        expect(result.current.release(`${kind}-exit`, "not_applied")).toBe(true);
      });
      expect(result.current.isLocked()).toBe(false);
    },
  );
});
