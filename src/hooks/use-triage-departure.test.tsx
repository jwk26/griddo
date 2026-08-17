import "@testing-library/jest-dom/vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TRIAGE_OPERATION_KINDS,
  useTriageOperationLock,
} from "./use-triage-operation-lock";
import {
  captureTriageRouteFocus,
  registerActiveTriageDeparture,
  requestActiveTriageDeparture,
  useTriageRouteFocusHandoff,
  useTriageDeparture,
} from "./use-triage-departure";

function renderDeparture() {
  return renderHook(() => {
    const operationLock = useTriageOperationLock();
    const departure = useTriageDeparture(operationLock);
    return { departure, operationLock };
  });
}

afterEach(() => {
  cleanup();
  document.querySelectorAll("main").forEach((main) => main.remove());
});

describe("useTriageDeparture", () => {
  it("performs an internal destination immediately when the Add draft is empty", () => {
    const perform = vi.fn();
    const focus = vi.fn();
    const { result } = renderDeparture();

    act(() => {
      expect(
        result.current.departure.requestDeparture({
          id: "scratch-2",
          focus,
          kind: "scratch",
          perform,
        }),
      ).toBe("performed");
    });

    expect(perform).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
    expect(result.current.departure.pendingDestination).toBeNull();
  });

  it("replaces a pending destination and discards only the Add draft before moving once", () => {
    const stalePerform = vi.fn();
    const latestPerform = vi.fn();
    const latestFocus = vi.fn();
    const clearDraft = vi.fn();
    const { result } = renderDeparture();

    act(() => {
      result.current.departure.registerAddDraftOwner({
        clearDraft,
        focusDraft: vi.fn(),
      });
      result.current.departure.setAddDraft("Keep this draft");
      expect(
        result.current.departure.requestDeparture({
          id: "/grid/old",
          kind: "path",
          perform: stalePerform,
        }),
      ).toBe("decision-required");
      expect(
        result.current.departure.requestDeparture({
          id: "/calendar/weekly",
          focus: latestFocus,
          kind: "route",
          perform: latestPerform,
        }),
      ).toBe("decision-required");
    });

    expect(result.current.departure.pendingDestination).toEqual({
      id: "/calendar/weekly",
      kind: "route",
    });

    act(() => {
      expect(result.current.departure.discardAndMove()).toBe(true);
      expect(result.current.departure.discardAndMove()).toBe(false);
    });

    expect(clearDraft).toHaveBeenCalledOnce();
    expect(stalePerform).not.toHaveBeenCalled();
    expect(latestPerform).toHaveBeenCalledOnce();
    expect(latestFocus).toHaveBeenCalledOnce();
    expect(result.current.departure.hasAddDraft()).toBe(false);
    expect(result.current.departure.pendingDestination).toBeNull();
  });

  it("continues writing with the intact draft and its logical focus intent", () => {
    const perform = vi.fn();
    const clearDraft = vi.fn();
    const focusDraft = vi.fn();
    const { result } = renderDeparture();

    act(() => {
      result.current.departure.registerAddDraftOwner({
        clearDraft,
        focusDraft,
      });
      result.current.departure.setAddDraft("Continue here");
      result.current.departure.requestDeparture({
        id: "scratch-2",
        kind: "scratch",
        perform,
      });
      expect(result.current.departure.continueWriting()).toBe(true);
    });

    expect(clearDraft).not.toHaveBeenCalled();
    expect(perform).not.toHaveBeenCalled();
    expect(focusDraft).toHaveBeenCalledOnce();
    expect(result.current.departure.hasAddDraft()).toBe(true);
    expect(result.current.departure.pendingDestination).toBeNull();
  });

  it.each(TRIAGE_OPERATION_KINDS)(
    "blocks internal and native exit for %s without queueing or replaying",
    (kind) => {
      const perform = vi.fn();
      const clearDraft = vi.fn();
      const { result } = renderDeparture();
      let unregister = () => {};

      act(() => {
        result.current.departure.registerAddDraftOwner({
          clearDraft,
          focusDraft: vi.fn(),
        });
        result.current.departure.setAddDraft("Protected Add draft");
        unregister = registerActiveTriageDeparture(result.current.departure);
        expect(result.current.operationLock.acquire(kind, `${kind}-1`)).toBe(true);
        expect(
          requestActiveTriageDeparture({
            id: "/outside",
            kind: "route",
            perform,
          }),
        ).toBe("blocked");
      });

      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(result.current.departure.pendingDestination).toBeNull();

      act(() => {
        expect(
          result.current.operationLock.release(`${kind}-1`, "not_applied"),
        ).toBe(true);
      });

      expect(perform).not.toHaveBeenCalled();
      expect(clearDraft).not.toHaveBeenCalled();
      expect(result.current.departure.hasAddDraft()).toBe(true);
      expect(result.current.departure.pendingDestination).toBeNull();
      unregister();
    },
  );

  it("uses native unload only while draft or lock state blocks exit", () => {
    const { result } = renderDeparture();

    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    act(() => {
      result.current.departure.setAddDraft("Unsaved Add draft");
    });
    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    act(() => {
      result.current.departure.setAddDraft("");
    });
    const clearedEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(clearedEvent);
    expect(clearedEvent.defaultPrevented).toBe(false);
  });

  it("treats whitespace text as a non-empty Add draft", () => {
    const perform = vi.fn();
    const { result } = renderDeparture();

    act(() => {
      result.current.departure.setAddDraft("   ");
      expect(
        result.current.departure.requestDeparture({
          id: "/outside",
          kind: "route",
          perform,
        }),
      ).toBe("decision-required");
    });

    expect(perform).not.toHaveBeenCalled();
    expect(result.current.departure.hasAddDraft()).toBe(true);
  });

  it("routes an external owner through the active mounted controller", () => {
    const perform = vi.fn();
    const focus = vi.fn();
    const { result } = renderDeparture();
    let unregister = () => {};

    act(() => {
      result.current.departure.setAddDraft("Protected Add draft");
      unregister = registerActiveTriageDeparture(result.current.departure);
      expect(
        requestActiveTriageDeparture({
          id: "/trash",
          focus,
          kind: "route",
          perform,
        }),
      ).toBe("decision-required");
    });

    expect(perform).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
    expect(result.current.departure.pendingDestination).toEqual({
      id: "/trash",
      kind: "route",
    });

    act(() => {
      expect(result.current.departure.discardAndMove()).toBe(true);
      unregister();
    });
    expect(perform).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
  });

  it("performs directly when no mounted controller is active", () => {
    const perform = vi.fn();
    const focus = vi.fn();

    expect(
      requestActiveTriageDeparture({
        id: "/calendar/weekly",
        focus,
        kind: "route",
        perform,
      }),
    ).toBe("performed");
    expect(perform).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
  });

  it("hands same-path query focus to the destination main landmark", () => {
    const main = document.createElement("main");
    document.body.append(main);
    const focus = captureTriageRouteFocus("/grid/inbox?bit=bit-1");
    const { rerender } = renderHook(
      ({ routeKey }) => useTriageRouteFocusHandoff(routeKey),
      { initialProps: { routeKey: "/grid/inbox" } },
    );

    act(() => focus());
    expect(main).not.toHaveFocus();

    rerender({ routeKey: "/grid/inbox?bit=bit-1" });
    expect(main).toHaveFocus();
    expect(main).toHaveAttribute("tabindex", "-1");

    main.blur();
    expect(main).not.toHaveAttribute("tabindex");
    main.remove();
  });

  it("drops a route focus intent when navigation settles elsewhere", () => {
    const main = document.createElement("main");
    document.body.append(main);
    const focus = captureTriageRouteFocus("/grid/expected");
    const { rerender } = renderHook(
      ({ routeKey }) => useTriageRouteFocusHandoff(routeKey),
      { initialProps: { routeKey: "/grid/inbox" } },
    );

    act(() => focus());
    rerender({ routeKey: "/trash" });
    rerender({ routeKey: "/grid/expected" });

    expect(main).not.toHaveFocus();
    main.remove();
  });
});
