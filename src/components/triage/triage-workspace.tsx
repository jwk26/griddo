"use client";

import { BreakdownPanel } from "@/components/triage/breakdown-panel";
import { ScratchPool } from "@/components/triage/scratch-pool";
import type { Node } from "@/types";

function PanelHeader({ title }: { title: string }) {
  return (
    <div className="flex h-8 items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
      <span>{title}</span>
    </div>
  );
}

function Placeholder({
  heading,
  subtext = "[BATCH 1 PLACEHOLDER]",
}: {
  heading: string;
  subtext?: string;
}) {
  return (
    <div className="mx-auto my-auto max-w-xs self-center rounded-md border border-dashed border-border/80 p-6 text-center">
      <div className="font-mono text-xs font-bold tracking-widest text-muted-foreground">
        {heading}
      </div>
      <div className="mt-1 font-mono text-[10px] text-muted-foreground/60">
        {subtext}
      </div>
    </div>
  );
}

export function TriageWorkspace({ node }: { node: Node }) {
  return (
    <section
      aria-label={`${node.title} triage workspace`}
      className="flex h-full min-h-0 w-full overflow-hidden bg-background"
      data-testid="triage-workspace"
    >
      <ScratchPool />

      <div className="flex h-full min-w-0 flex-1 flex-col bg-background">
        <div className="flex min-h-0 basis-3/5 border-b border-border">
          <div className="flex min-w-0 basis-3/5 flex-col border-r border-border bg-card">
            <PanelHeader title="Breakdown / Scribble" />
            <div className="min-h-0 flex-1 overflow-hidden">
              <BreakdownPanel />
            </div>
          </div>

          <div className="flex min-w-0 basis-2/5 bg-card">
            <div className="flex min-w-0 basis-[35%] flex-col">
              <PanelHeader title="Staging: Nodes" />
              <div className="flex min-h-0 flex-1 overflow-y-auto p-3">
                <Placeholder heading="STAGING ZONE" />
              </div>
            </div>

            <div className="flex min-w-0 basis-[65%] flex-col border-l border-dashed border-border/80">
              <PanelHeader title="Staging: Bits" />
              <div className="flex min-h-0 flex-1 overflow-y-auto p-3">
                <Placeholder heading="STAGING ZONE" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 basis-2/5 flex-col bg-background">
          <PanelHeader title="Hierarchy Explorer" />
          <div className="flex min-h-0 flex-1 overflow-auto p-3">
            <Placeholder heading="HIERARCHY EXPLORER" />
          </div>
        </div>
      </div>
    </section>
  );
}
