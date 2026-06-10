"use client";

import { Layers, Zap } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useRef } from "react";
import {
  motionDuration,
  motionSpring,
} from "@/lib/animations/motion-language";

type EntrySurfaceProps = {
  open: boolean;
  canCreateNode: boolean;
  onClose: () => void;
  onScratch: () => void;
  onCreateNode: () => void;
  onCreateBit: () => void;
};

export function EntrySurface({
  open,
  canCreateNode,
  onClose,
  onScratch,
  onCreateNode,
  onCreateBit,
}: EntrySurfaceProps) {
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  const panelVariants: Variants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: shouldReduceMotion
        ? { duration: motionDuration.modalEnter, ease: "easeOut" }
        : {
            x: motionSpring.sidebarSlide,
            opacity: { duration: motionDuration.modalEnter, ease: "easeOut" },
          },
    },
    exit: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -20,
      transition: { duration: motionDuration.modalExit, ease: "easeIn" },
    },
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleMouseDown(event: MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed left-[60px] top-[56px] z-[100] w-56 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden p-1.5"
          ref={panelRef}
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Scratch
          </div>
          <button
            type="button"
            onClick={onScratch}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Zap className="w-4 h-4 fill-primary" />
              </div>
              <span className="text-sm font-medium">New Scratch</span>
            </div>
          </button>

          <div className="h-px bg-border my-1.5 mx-2" />

          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Create
          </div>

          {canCreateNode && (
            <button
              type="button"
              onClick={onCreateNode}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:bg-accent"
            >
              <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">New Node</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateBit}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:bg-accent"
          >
            <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">New Bit</span>
          </button>

          <div className="h-px bg-border my-1.5 mx-2" />
          <div
            aria-hidden="true"
            className="flex items-center justify-between px-3 py-1 text-[10px] text-muted-foreground/60 select-none"
          >
            <span>Command palette</span>
            <kbd className="font-sans bg-muted text-muted-foreground/80 px-1.5 py-0.5 rounded border border-border/50">
              ⌘K
            </kbd>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
