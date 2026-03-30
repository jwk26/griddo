"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckSquare, Folder, ListChecks, Search } from "lucide-react";
import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { searchOverlayVariants } from "@/lib/animations/layout";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";

function getResultIcon(type: "node" | "bit" | "chunk") {
  if (type === "node") {
    return Folder;
  }

  if (type === "bit") {
    return CheckSquare;
  }

  return ListChecks;
}

export function SearchOverlay() {
  const router = useRouter();
  const isOpen = useSearchStore((state) => state.isOpen);
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const open = useSearchStore((state) => state.open);
  const close = useSearchStore((state) => state.close);
  const normalizedQuery = query.trim();
  const { results } = useSearch(normalizedQuery);
  const [selection, setSelection] = useState({ query: "", index: -1 });
  const selectedIndex = selection.query === normalizedQuery && isOpen ? selection.index : -1;

  const handleGlobalKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
      return;
    }

    event.preventDefault();
    open();
  });

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate="visible"
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 pt-[20vh] backdrop-blur-sm"
          exit="exit"
          initial="hidden"
          onClick={close}
          variants={searchOverlayVariants}
        >
          <motion.div
            animate="visible"
            className="w-full max-w-search-overlay overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
            exit="exit"
            initial="hidden"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                close();
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelection({ query: normalizedQuery, index: results.length === 0 ? -1 : (selectedIndex + 1) % results.length });
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelection({ query: normalizedQuery, index: results.length === 0 ? -1 : selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1 });
                return;
              }
              if (event.key === "Enter" && selectedIndex >= 0) {
                const result = results[selectedIndex];
                if (!result) return;
                if (result.type === "node") {
                  router.push(`/grid/${result.id}`);
                  close();
                } else if (result.type === "bit" && result.parentNodeId) {
                  router.push(`/grid/${result.parentNodeId}?bit=${result.id}`);
                  close();
                } else if (result.type === "chunk" && result.grandparentNodeId && result.parentBitId) {
                  router.push(`/grid/${result.grandparentNodeId}?bit=${result.parentBitId}`);
                  close();
                }
              }
            }}
            variants={searchOverlayVariants}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                autoFocus
                aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                onChange={(event) => {
                  const value = event.target.value;
                  startTransition(() => {
                    setQuery(value);
                  });
                }}
                placeholder="Search nodes, bits, and chunks…"
                value={query}
              />
            </div>

            <div className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
              {normalizedQuery === "" ? (
                <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-muted-foreground">
                  <Search className="h-6 w-6" />
                  <p>Search nodes, bits, and chunks…</p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-6 py-14 text-center text-sm text-muted-foreground">
                  No results for &quot;{normalizedQuery}&quot;
                </div>
              ) : (
                results.map((result, index) => {
                  const Icon = getResultIcon(result.type);
                  const parentPath = result.parentPath.join(" › ");

                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      aria-selected={index === selectedIndex}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent",
                        index === selectedIndex && "bg-accent",
                      )}
                      id={`result-${index}`}
                      role="option"
                      onClick={() => {
                        if (result.type === "node") {
                          router.push(`/grid/${result.id}`);
                          close();
                          return;
                        }

                        if (result.type === "bit" && result.parentNodeId) {
                          router.push(`/grid/${result.parentNodeId}?bit=${result.id}`);
                          close();
                          return;
                        }

                        if (result.type === "chunk" && result.grandparentNodeId && result.parentBitId) {
                          router.push(`/grid/${result.grandparentNodeId}?bit=${result.parentBitId}`);
                          close();
                        }
                      }}
                      type="button"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {result.title}
                        </p>
                        {parentPath ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {parentPath}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
