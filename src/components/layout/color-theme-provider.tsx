"use client";

import { useEffect } from "react";
import { useColorThemeStore } from "@/stores/theme-store";

export function ColorThemeProvider() {
  const colorTheme = useColorThemeStore((state) => state.colorTheme);

  useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
  }, [colorTheme]);

  return null;
}
