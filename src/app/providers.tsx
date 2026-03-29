"use client";

import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { BitDetailPopup } from "@/components/bit-detail/bit-detail-popup";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { useTrashAutoCleanup } from "@/hooks/use-trash-auto-cleanup";

function TrashAutoCleanup() {
  useTrashAutoCleanup();
  return null;
}

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
      <TrashAutoCleanup />
      {children}
      <Suspense>
        <SearchOverlay />
      </Suspense>
      <Suspense>
        <BitDetailPopup />
      </Suspense>
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  );
}
