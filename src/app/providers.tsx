"use client";

import { DndContext } from "@dnd-kit/core";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { BitDetailPopup } from "@/components/bit-detail/bit-detail-popup";

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
      <DndContext>
        {children}
        <Suspense>
          <BitDetailPopup />
        </Suspense>
        <Toaster richColors position="bottom-right" />
      </DndContext>
    </ThemeProvider>
  );
}
