"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { useState } from "react";
import { CreateNodeDialog } from "@/components/grid/create-node-dialog";
import { EditModeOverlay } from "@/components/grid/edit-mode-overlay";
import { GridView } from "@/components/grid/grid-view";
import { OnboardingHints } from "@/components/grid/onboarding-hints";
import { Sidebar } from "@/components/layout/sidebar";
import { useDnd } from "@/hooks/use-dnd";
import { useGridActions } from "@/hooks/use-grid-actions";
import { findNearestEmptyCell } from "@/lib/utils/bfs";

type PlacementContext = { mode: "auto" } | { mode: "cell"; x: number; y: number };

function hexToHsl(hex: string): string {
  const normalized = hex.trim().replace("#", "");
  const expandedHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expandedHex)) {
    throw new Error("Invalid color value.");
  }

  const red = Number.parseInt(expandedHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(expandedHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;

    if (hue < 0) {
      hue += 360;
    }
  }

  return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
}

export function Level0Shell() {
  const { handleDragEnd, handleDragOver, handleDragStart, sensors } = useDnd();
  const { getGridOccupancy, createNode } = useGridActions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [placementContext, setPlacementContext] = useState<PlacementContext>({
    mode: "auto",
  });
  const [error, setError] = useState<string | undefined>(undefined);

  function handleSidebarAdd() {
    setPlacementContext({ mode: "auto" });
    setError(undefined);
    setDialogOpen(true);
  }

  function handleCellAdd(x: number, y: number) {
    setPlacementContext({ mode: "cell", x, y });
    setError(undefined);
    setDialogOpen(true);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setError(undefined);
    }

    setDialogOpen(open);
  }

  async function handleSubmit({
    title,
    icon,
    colorHex,
  }: {
    title: string;
    icon: string;
    colorHex: string;
  }) {
    setError(undefined);

    try {
      const occupied = await getGridOccupancy(null);
      const cell = findNearestEmptyCell(
        occupied,
        placementContext.mode === "auto" ? 0 : placementContext.x,
        placementContext.mode === "auto" ? 0 : placementContext.y,
      );

      if (cell === null) {
        setError("No empty cells available at this level.");
        return;
      }

      const payload = {
        title: title.trim(),
        description: "",
        color: hexToHsl(colorHex),
        icon,
        deadline: null,
        deadlineAllDay: false,
        parentId: null,
        level: 0,
        x: cell.x,
        y: cell.y,
      };

      await createNode(payload);
      setDialogOpen(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create node.",
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar level={0} onAddClick={handleSidebarAdd} />
      <main className="relative ml-[14rem] flex-1 overflow-auto p-4">
        <h1 className="sr-only">GridDO</h1>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <GridView level={0} onAddAtCell={handleCellAdd} parentId={null} />
        </DndContext>
        <OnboardingHints />
        <EditModeOverlay />
        <CreateNodeDialog
          error={error}
          onOpenChange={handleOpenChange}
          onSubmit={handleSubmit}
          open={dialogOpen}
        />
      </main>
    </div>
  );
}
