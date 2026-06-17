import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@/types";
import { TriageWorkspace } from "./triage-workspace";

vi.mock("@/components/triage/scratch-pool", () => ({
  ScratchPool: () => <div data-testid="scratch-pool" />,
}));

vi.mock("@/components/triage/breakdown-panel", () => ({
  BreakdownPanel: () => <div data-testid="breakdown-panel" />,
}));

vi.mock("@/components/triage/staging-zone", () => ({
  StagingZone: ({ type }: { type: string }) => (
    <div data-testid={`${type}-staging-zone`} />
  ),
}));

function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Inbox",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "inbox",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    systemRole: overrides.systemRole ?? "inbox",
    hiddenFromGrid: overrides.hiddenFromGrid ?? false,
  };
}

afterEach(() => {
  cleanup();
});

describe("TriageWorkspace", () => {
  it("renders ScratchPool in the left panel and wires in BreakdownPanel", () => {
    render(<TriageWorkspace node={createNode()} />);

    const workspace = screen.getByTestId("triage-workspace");

    expect(within(workspace).getByTestId("scratch-pool")).toBeInTheDocument();
    expect(within(workspace).getByTestId("breakdown-panel")).toBeInTheDocument();
  });

  it("keeps staging zones and the hierarchy explorer visible", () => {
    render(<TriageWorkspace node={createNode()} />);

    expect(screen.getByText("Staging: Nodes")).toBeInTheDocument();
    expect(screen.getByText("Staging: Bits")).toBeInTheDocument();
    expect(screen.getByText("Hierarchy Explorer")).toBeInTheDocument();
    expect(screen.getByTestId("hierarchy-explorer")).toBeInTheDocument();
    expect(screen.getByTestId("node-staging-zone")).toBeInTheDocument();
    expect(screen.getByTestId("bit-staging-zone")).toBeInTheDocument();
  });
});
