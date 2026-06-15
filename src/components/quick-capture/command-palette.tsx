"use client";

import { Search, Zap } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import {
  motionDuration,
  motionScale,
  motionSpring,
} from "@/lib/animations/motion-language";
import { cn } from "@/lib/utils";
import { useQuickCaptureStore } from "@/stores/quick-capture-store";
import { useSearchStore } from "@/stores/search-store";

const rowTransitionStyle = {
  transitionDuration: `${motionDuration.affordance}s`,
};

const keyFeedbackTransition = {
  duration: 0.08,
};

const shortcutClassName =
  "inline-flex min-w-[16px] h-4 items-center justify-center rounded border border-border bg-secondary px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm select-none";

export function CommandPalette() {
  const activeOverlay = useQuickCaptureStore((state) => state.activeOverlay);
  const setActiveOverlay = useQuickCaptureStore((state) => state.setActiveOverlay);
  const closeAll = useQuickCaptureStore((state) => state.closeAll);
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const firstCommandRef = useRef<HTMLButtonElement>(null);
  const secondCommandRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isOpen = activeOverlay === "palette";

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: motionDuration.modalEnter, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: motionDuration.modalExit, ease: "easeIn" },
    },
  };

  const panelVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : motionScale.overlayInitial,
      y: shouldReduceMotion ? 0 : -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: motionDuration.modalEnter, ease: "easeOut" }
        : {
            opacity: { duration: motionDuration.modalEnter, ease: "easeOut" },
            scale: motionSpring.scale,
            y: { duration: motionDuration.modalEnter, ease: "easeOut" },
          },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : motionScale.overlayInitial,
      y: shouldReduceMotion ? 0 : -20,
      transition: { duration: motionDuration.modalExit, ease: "easeIn" },
    },
  };

  const rememberFocusedElement = useCallback(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, []);

  const restorePreviousFocus = useCallback(() => {
    const previousFocus = previousFocusRef.current;
    previousFocusRef.current = null;

    if (previousFocus && document.contains(previousFocus)) {
      previousFocus.focus();
    }
  }, []);

  const openPalette = useCallback(() => {
    rememberFocusedElement();
    useSearchStore.getState().close();
    setActiveOverlay("palette");
  }, [rememberFocusedElement, setActiveOverlay]);

  const closePalette = useCallback(() => {
    closeAll();
    restorePreviousFocus();
  }, [closeAll, restorePreviousFocus]);

  const openScratchCapture = useCallback(() => {
    setActiveOverlay("scratch");
  }, [setActiveOverlay]);

  const openSearchOverlay = useCallback(() => {
    closeAll();
    useSearchStore.getState().open();
  }, [closeAll]);

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
        return;
      }

      if (activeOverlay !== "palette") {
        return;
      }

      if (event.key === "Escape") {
        event.stopPropagation();
        event.preventDefault();
        closePalette();
        return;
      }

      if (event.key === "1") {
        event.preventDefault();
        openScratchCapture();
        return;
      }

      if (event.key === "2") {
        event.preventDefault();
        openSearchOverlay();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, { capture: true });
  }, [activeOverlay, closePalette, openPalette, openScratchCapture, openSearchOverlay]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            animate="visible"
            aria-hidden="true"
            className="absolute inset-0 bg-background/20 backdrop-blur-md"
            exit="exit"
            initial="hidden"
            onClick={closePalette}
            variants={backdropVariants}
          />
          <motion.div
            animate="visible"
            aria-label="Command palette"
            aria-modal="true"
            className="relative w-full max-w-search-overlay overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-2xl"
            exit="exit"
            initial="hidden"
            role="dialog"
            variants={panelVariants}
          >
            <div
              className="mb-2 flex items-center gap-3 border-b border-border px-3 py-3 transition-[border-color] focus-within:border-b-primary/60"
              style={rowTransitionStyle}
            >
              <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                autoFocus
                className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    firstCommandRef.current?.focus();
                  }
                }}
                placeholder="What would you like to do? (e.g., 1 to Scratch)…"
                type="text"
              />
              <span className="inline-flex select-none items-center rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
                Fixed Menu
              </span>
            </div>

            <div className="space-y-1" role="menu">
              <motion.button
                ref={firstCommandRef}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-foreground transition-[background-color,color,box-shadow] ease-in-out hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground focus:outline-none"
                onClick={openScratchCapture}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    inputRef.current?.focus();
                    return;
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    secondCommandRef.current?.focus();
                  }
                }}
                role="menuitem"
                style={rowTransitionStyle}
                transition={keyFeedbackTransition}
                type="button"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Zap className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="truncate text-sm font-medium">
                    Open Scratch Capture
                  </span>
                </span>
                <kbd
                  className={cn(
                    shortcutClassName,
                    "group-hover:border-primary-foreground/30 group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground group-focus:border-primary-foreground/30 group-focus:bg-primary-foreground/15 group-focus:text-primary-foreground",
                  )}
                >
                  1
                </kbd>
              </motion.button>

              <motion.button
                ref={secondCommandRef}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-foreground transition-[background-color,color,box-shadow] ease-in-out hover:bg-accent focus:bg-accent focus:outline-none"
                onClick={openSearchOverlay}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    firstCommandRef.current?.focus();
                  }
                }}
                role="menuitem"
                style={rowTransitionStyle}
                transition={keyFeedbackTransition}
                type="button"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="rounded-md bg-secondary p-1.5 text-muted-foreground group-hover:bg-background group-focus:bg-background">
                    <Search className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="truncate text-sm font-medium">Search</span>
                </span>
                <kbd className={shortcutClassName}>2</kbd>
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
