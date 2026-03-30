"use client";

import { useEffect } from "react";
import { useEditModeStore } from "@/stores/edit-mode-store";

export function EditModeOverlay() {
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const disable = useEditModeStore((state) => state.disable);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        disable();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [disable, isEditMode]);

  if (!isEditMode) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-30 ring-2 ring-inset ring-primary/40"
    >
      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
        Edit Mode — Press ESC to exit
      </div>
    </div>
  );
}
