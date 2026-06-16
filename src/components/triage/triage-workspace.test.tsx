import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@/types";
import { TriageWorkspace } from "./triage-workspace";

vi.mock("@/components/triage/scratch-pool", () => ({
  ScratchPool: () => <div data-testid="scratch-pool" />,
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
  it("renders ScratchPool in the left panel and keeps Batch 1 placeholders", () => {
    render(<TriageWorkspace node={createNode()} />);

    const workspace = screen.getByTestId("triage-workspace");

    expect(within(workspace).getByTestId("scratch-pool")).toBeInTheDocument();
    expect(screen.getByText("Breakdown")).toBeInTheDocument();
    expect(screen.getAllByText("STAGING ZONE")).toHaveLength(2);
    expect(screen.getByText("HIERARCHY EXPLORER")).toBeInTheDocument();
  });
});
