"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TriageOperationLock } from "./use-triage-operation-lock";

export type TriageDepartureKind = "scratch" | "path" | "route";

export type TriageDepartureDestination = Readonly<{
  id: string;
  focus?: () => void;
  kind: TriageDepartureKind;
  perform: () => void;
}>;

export type PendingTriageDestination = Readonly<
  Pick<TriageDepartureDestination, "id" | "kind">
>;

export type TriageDepartureRequestResult =
  | "blocked"
  | "decision-required"
  | "performed";

type AddDraftOwner = Readonly<{
  clearDraft: () => void;
  focusDraft: () => void;
}>;

export type TriageDepartureController = Readonly<{
  pendingDestination: PendingTriageDestination | null;
  continueWriting: () => boolean;
  discardAndMove: () => boolean;
  hasAddDraft: () => boolean;
  isExitBlocked: () => boolean;
  registerAddDraftOwner: (owner: AddDraftOwner) => () => void;
  requestDeparture: (
    destination: TriageDepartureDestination,
  ) => TriageDepartureRequestResult;
  setAddDraft: (draft: string) => void;
}>;

export const TriageDepartureContext =
  createContext<TriageDepartureController | null>(null);

let activeTriageDeparture: TriageDepartureController | null = null;
let activeRouteFocusKey: string | null = null;
let pendingRouteFocusKey: string | null = null;

function getRouteKey(href: string): string {
  return href.split("#", 1)[0] || "/";
}

function focusRouteMain(): void {
  const main = document.querySelector<HTMLElement>("main");
  if (main === null) return;
  const priorTabIndex = main.getAttribute("tabindex");
  main.tabIndex = -1;
  main.focus();
  main.addEventListener(
    "blur",
    () => {
      if (priorTabIndex === null) main.removeAttribute("tabindex");
      else main.setAttribute("tabindex", priorTabIndex);
    },
    { once: true },
  );
}

export function captureTriageRouteFocus(href: string): () => void {
  const routeKey = getRouteKey(href);
  return () => {
    pendingRouteFocusKey = routeKey;
    if (activeRouteFocusKey === routeKey) {
      pendingRouteFocusKey = null;
      focusRouteMain();
    }
  };
}

export function useTriageRouteFocusHandoff(routeKey: string): void {
  useEffect(() => {
    const routeChanged =
      activeRouteFocusKey !== null && activeRouteFocusKey !== routeKey;
    activeRouteFocusKey = routeKey;
    if (pendingRouteFocusKey === routeKey) {
      pendingRouteFocusKey = null;
      focusRouteMain();
    } else if (routeChanged) {
      pendingRouteFocusKey = null;
    }
  }, [routeKey]);
}

export function registerActiveTriageDeparture(
  controller: TriageDepartureController,
): () => void {
  activeTriageDeparture = controller;
  return () => {
    if (activeTriageDeparture === controller) {
      activeTriageDeparture = null;
    }
  };
}

export function requestActiveTriageDeparture(
  destination: TriageDepartureDestination,
): TriageDepartureRequestResult {
  if (activeTriageDeparture !== null) {
    return activeTriageDeparture.requestDeparture(destination);
  }

  destination.perform();
  destination.focus?.();
  return "performed";
}

function isNonEmptyDraft(draft: string): boolean {
  return draft.length > 0;
}

export function useTriageDeparture(
  operationLock: TriageOperationLock,
): TriageDepartureController {
  const addDraftRef = useRef("");
  const addDraftOwnerRef = useRef<AddDraftOwner | null>(null);
  const pendingDestinationRef =
    useRef<TriageDepartureDestination | null>(null);
  const [pendingDestination, setPendingDestination] =
    useState<PendingTriageDestination | null>(null);

  const clearPendingDestination = useCallback(() => {
    pendingDestinationRef.current = null;
    setPendingDestination(null);
  }, []);

  const hasAddDraft = useCallback(
    () => isNonEmptyDraft(addDraftRef.current),
    [],
  );

  const isExitBlocked = useCallback(
    () => operationLock.isLocked() || hasAddDraft(),
    [hasAddDraft, operationLock],
  );

  const registerAddDraftOwner = useCallback((owner: AddDraftOwner) => {
    addDraftOwnerRef.current = owner;
    return () => {
      if (addDraftOwnerRef.current === owner) {
        addDraftOwnerRef.current = null;
      }
    };
  }, []);

  const setAddDraft = useCallback(
    (draft: string) => {
      addDraftRef.current = draft;
      if (!isNonEmptyDraft(draft)) {
        clearPendingDestination();
      }
    },
    [clearPendingDestination],
  );

  const requestDeparture = useCallback(
    (
      destination: TriageDepartureDestination,
    ): TriageDepartureRequestResult => {
      if (operationLock.isLocked()) return "blocked";
      if (!hasAddDraft()) {
        destination.perform();
        destination.focus?.();
        return "performed";
      }

      pendingDestinationRef.current = destination;
      setPendingDestination({ id: destination.id, kind: destination.kind });
      return "decision-required";
    },
    [hasAddDraft, operationLock],
  );

  const continueWriting = useCallback(() => {
    if (pendingDestinationRef.current === null) return false;

    clearPendingDestination();
    addDraftOwnerRef.current?.focusDraft();
    return true;
  }, [clearPendingDestination]);

  const discardAndMove = useCallback(() => {
    const destination = pendingDestinationRef.current;
    if (destination === null || operationLock.isLocked()) return false;

    clearPendingDestination();
    addDraftRef.current = "";
    addDraftOwnerRef.current?.clearDraft();
    destination.perform();
    destination.focus?.();
    return true;
  }, [clearPendingDestination, operationLock]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isExitBlocked()) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isExitBlocked]);

  return useMemo(
    () => ({
      pendingDestination,
      continueWriting,
      discardAndMove,
      hasAddDraft,
      isExitBlocked,
      registerAddDraftOwner,
      requestDeparture,
      setAddDraft,
    }),
    [
      continueWriting,
      discardAndMove,
      hasAddDraft,
      isExitBlocked,
      pendingDestination,
      registerAddDraftOwner,
      requestDeparture,
      setAddDraft,
    ],
  );
}

export function useTriageDepartureContext(): TriageDepartureController {
  const controller = useContext(TriageDepartureContext);
  if (controller === null) {
    throw new Error(
      "useTriageDepartureContext must be used inside TriageWorkspace",
    );
  }
  return controller;
}
