"use client";

import { Check, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useColorThemeStore, type ColorTheme } from "@/stores/theme-store";

const THEMES: Array<{
  id: ColorTheme;
  label: string;
  swatch: string;
}> = [
  { id: "griddo", label: "GridDO", swatch: "var(--color-theme-swatch-griddo)" },
  { id: "tiny-desk", label: "Tiny Desk", swatch: "var(--color-theme-swatch-tiny-desk)" },
  { id: "neumorphism", label: "New Morphism", swatch: "var(--color-theme-swatch-neumorphism)" },
  { id: "claymorphism", label: "3D Clay", swatch: "var(--color-theme-swatch-claymorphism)" },
  { id: "origami", label: "Origami", swatch: "var(--color-theme-swatch-origami)" },
  { id: "terminal", label: "Terminal", swatch: "var(--color-theme-swatch-terminal)" },
  { id: "retro-mac", label: "Retro Mac", swatch: "var(--color-theme-swatch-retro-mac)" },
  { id: "graphite", label: "Graphite", swatch: "var(--color-theme-swatch-graphite)" },
];

export function ColorThemeToggle({ className }: { className?: string }) {
  const colorTheme = useColorThemeStore((state) => state.colorTheme);
  const setColorTheme = useColorThemeStore((state) => state.setColorTheme);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change color theme"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            className,
          )}
        >
          <Palette className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="theme-surface w-56 p-1"
        side="right"
        sideOffset={12}
      >
        <div className="flex flex-col gap-0.5">
          {THEMES.map((theme) => {
            const isSelected = colorTheme === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected ? "bg-accent text-foreground" : "text-muted-foreground",
                )}
                onClick={() => setColorTheme(theme.id)}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ background: theme.swatch }}
                />
                <span className="min-w-0 flex-1 truncate">{theme.label}</span>
                {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
