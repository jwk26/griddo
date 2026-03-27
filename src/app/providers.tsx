"use client";

import { DndContext } from "@dnd-kit/core";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DndContext>{children}</DndContext>
    </ThemeProvider>
  );
}
