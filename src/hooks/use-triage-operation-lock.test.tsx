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
});
