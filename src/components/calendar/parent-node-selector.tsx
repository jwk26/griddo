"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useBreadcrumbChain } from "@/hooks/use-breadcrumb-chain";
import { DEFAULT_ICON, NODE_ICON_MAP } from "@/lib/constants/node-icons";
import type { Node } from "@/types";

type ParentNodeSelectorProps = {
  value: string | null;
  onChange: (id: string) => void;
  nodes: Node[];
  defaultParentId?: string | null;
};

export function ParentNodeSelector({
  value,
  onChange,
  nodes,
  defaultParentId = null,
}: ParentNodeSelectorProps) {
  const [browsePath, setBrowsePath] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(Boolean(value || defaultParentId));
  const currentParentId = browsePath.at(-1) ?? null;
  const currentNodes = nodes.filter(
    (node) => node.parentId === currentParentId && node.deletedAt === null,
  );
  const selectedNode = nodes.find((node) => node.id === value);
  const ancestorChain = useBreadcrumbChain(value ?? "");
  const pathString = ancestorChain
    .slice(0, -1)
    .map((node) => node.title)
    .join(" › ");
  const currentBrowseLabel =
    browsePath.length === 0
      ? "Browse root nodes"
      : (nodes.find((node) => node.id === currentParentId)?.title ?? "Browse root nodes");

  function handleSelect(id: string) {
    onChange(id);
    setIsConfirmed(true);
  }

  function handleDrill(id: string) {
    setBrowsePath((prev) => [...prev, id]);
  }

  function handleBack() {
    setBrowsePath((prev) => prev.slice(0, -1));
  }

  function handleChange() {
    setIsConfirmed(false);
    setBrowsePath([]);
  }

  const ConfirmedIcon = selectedNode
    ? (NODE_ICON_MAP[selectedNode.icon] ?? NODE_ICON_MAP[DEFAULT_ICON])
    : NODE_ICON_MAP[DEFAULT_ICON];

  return (
    <div className="space-y-3 border-b border-border pb-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Parent Node
        </label>
        {isConfirmed && value ? (
          <button
            type="button"
            className="text-xs font-medium text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            onClick={handleChange}
          >
            Change
          </button>
        ) : null}
      </div>

      {isConfirmed && value ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-accent/40 p-3">
          {selectedNode ? (
            <>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: selectedNode.color }}
              >
                <ConfirmedIcon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{selectedNode.title}</p>
                {pathString ? (
                  <p className="truncate text-[10px] text-muted-foreground">{pathString}</p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex h-6 items-center gap-2 px-1">
            {browsePath.length > 0 ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                onClick={handleBack}
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>
            ) : null}
            <div className="flex-1 truncate text-[11px] text-muted-foreground/60">
              {currentBrowseLabel}
            </div>
          </div>

          <div className="flex max-h-[240px] flex-col gap-1 overflow-y-auto pr-1">
            {currentNodes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                {browsePath.length === 0
                  ? "No nodes found. Create a Node in the sidebar first."
                  : "This node has no sub-nodes."}
              </div>
            ) : (
              currentNodes.map((node) => {
                const hasChildren = nodes.some(
                  (candidate) => candidate.parentId === node.id && candidate.deletedAt === null,
                );
                const RowIcon = NODE_ICON_MAP[node.icon] ?? NODE_ICON_MAP[DEFAULT_ICON];

                return (
                  <div key={node.id} className="group flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Select ${node.title}`}
                      className="flex flex-1 items-center gap-3 rounded-xl border border-transparent bg-background/60 px-3 py-2 text-left transition-colors hover:border-border hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      onClick={() => handleSelect(node.id)}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: node.color }}
                      >
                        <RowIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="truncate text-sm font-medium text-foreground">
                        {node.title}
                      </span>
                    </button>
                    {hasChildren ? (
                      <button
                        type="button"
                        aria-label={`Drill into ${node.title}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                        onClick={() => handleDrill(node.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {!value ? (
        <p className="text-[11px] italic text-muted-foreground">
          Select a parent node to enable creation.
        </p>
      ) : null}
    </div>
  );
}
