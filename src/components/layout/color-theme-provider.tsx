"use client";

import { useEffect } from "react";
import { useColorThemeStore } from "@/stores/color-theme-store";

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const colorTheme = useColorThemeStore((state) => state.colorTheme);

  useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
  }, [colorTheme]);

  return <>{children}</>;
}
