"use client";

import { CommandPalette } from "@/components/quick-capture/command-palette";
import { ScratchModal } from "@/components/quick-capture/scratch-modal";
import { useInbox } from "@/hooks/use-inbox";
import { useQuickCaptureStore } from "@/stores/quick-capture-store";

export function QuickCaptureOverlays() {
  const activeOverlay = useQuickCaptureStore((state) => state.activeOverlay);
  const closeAll = useQuickCaptureStore((state) => state.closeAll);
  const { inboxNodeId, createScratchBit } = useInbox();

  return (
    <>
      <CommandPalette />
      <ScratchModal
        open={activeOverlay === "scratch"}
        onClose={closeAll}
        onSubmit={createScratchBit}
        inboxNodeId={inboxNodeId}
      />
    </>
  );
}
