import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBreadcrumbChain } from "@/hooks/use-breadcrumb-chain";
import type { Node } from "@/types";

vi.mock("@/hooks/use-breadcrumb-chain", () => ({
  useBreadcrumbChain: vi.fn().mockReturnValue([]),
}));

const useBreadcrumbChainMock = vi.mocked(useBreadcrumbChain);

function createNode(overrides: Partial<Node>): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    color: overrides.color ?? "hsl(221, 83%, 53%)",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    mtime: overrides.mtime ?? 1,
    createdAt: overrides.createdAt ?? 1,
    parentId: overrides.parentId ?? null,
    level: overrides.level ?? 0,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

const rootNodes = [
  createNode({ id: "n1", title: "Alpha", color: "hsl(0, 0%, 67%)", icon: "circle" }),
  createNode({ id: "n2", title: "Beta", color: "hsl(0, 0%, 73%)", icon: "square" }),
];

const childNodes = [
  createNode({
    id: "n3",
    title: "Child",
    color: "hsl(0, 0%, 80%)",
    icon: "triangle",
    parentId: "n1",
    level: 1,
  }),
];

const allNodes = [...rootNodes, ...childNodes];

const { ParentNodeSelector } = await import("@/components/calendar/parent-node-selector");

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useBreadcrumbChainMock.mockReturnValue([]);
});

describe("ParentNodeSelector", () => {
  it("shows Browse root nodes when value is null and no browse path is active", () => {
    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value={null} />);

    expect(screen.getByText("Browse root nodes")).toBeInTheDocument();
  });

  it("renders root-level node titles", () => {
    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value={null} />);

    expect(screen.getByRole("button", { name: "Select Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Beta" })).toBeInTheDocument();
  });

  it("calls onChange with the selected node id", () => {
    const onChange = vi.fn();

    render(<ParentNodeSelector onChange={onChange} nodes={allNodes} value={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Select Alpha" }));

    expect(onChange).toHaveBeenCalledWith("n1");
  });

  it("only shows drill buttons for nodes with children", () => {
    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value={null} />);

    expect(screen.getByRole("button", { name: "Drill into Alpha" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Drill into Beta" })).not.toBeInTheDocument();
  });

  it("shows child nodes and updates the breadcrumb label after drilling in", () => {
    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Drill into Alpha" }));

    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Child" })).toBeInTheDocument();
  });

  it("returns to the parent level when Back is clicked", () => {
    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Drill into Alpha" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByText("Browse root nodes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Beta" })).toBeInTheDocument();
  });

  it("renders the confirmed card immediately when value is provided", () => {
    useBreadcrumbChainMock.mockReturnValue([
      createNode({ id: "n1", title: "Alpha" }),
      createNode({ id: "n3", title: "Child", parentId: "n1", level: 1 }),
    ]);

    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value="n3" />);

    expect(screen.getByText("Child")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
    expect(screen.queryByText("Browse root nodes")).not.toBeInTheDocument();
  });

  it("resets to browsing view when Change is clicked", () => {
    useBreadcrumbChainMock.mockReturnValue([
      createNode({ id: "n1", title: "Alpha" }),
      createNode({ id: "n3", title: "Child", parentId: "n1", level: 1 }),
    ]);

    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value="n3" />);

    fireEvent.click(screen.getByRole("button", { name: "Change" }));

    expect(screen.getByText("Browse root nodes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Alpha" })).toBeInTheDocument();
  });

  it("shows the root empty state when there are no nodes", () => {
    render(<ParentNodeSelector onChange={vi.fn()} nodes={[]} value={null} />);

    expect(
      screen.getByText("No nodes found. Create a Node in the sidebar first."),
    ).toBeInTheDocument();
  });

  it("shows the drilled empty state when the current node has no sub-nodes", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ParentNodeSelector onChange={onChange} nodes={allNodes} value={null} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Drill into Alpha" }));

    rerender(<ParentNodeSelector onChange={onChange} nodes={rootNodes} value={null} />);

    expect(screen.getByText("This node has no sub-nodes.")).toBeInTheDocument();
  });

  it("shows helper text when no parent is selected", () => {
    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value={null} />);

    expect(screen.getByText("Select a parent node to enable creation.")).toBeInTheDocument();
  });

  it("hides helper text when a parent is selected", () => {
    useBreadcrumbChainMock.mockReturnValue([
      createNode({ id: "n1", title: "Alpha" }),
      createNode({ id: "n3", title: "Child", parentId: "n1", level: 1 }),
    ]);

    render(<ParentNodeSelector onChange={vi.fn()} nodes={allNodes} value="n3" />);

    expect(
      screen.queryByText("Select a parent node to enable creation."),
    ).not.toBeInTheDocument();
  });

  it("renders the confirmed path without repeating the selected node title", () => {
    useBreadcrumbChainMock.mockReturnValue([
      createNode({ id: "root", title: "Root" }),
      createNode({ id: "mid", title: "Mid", parentId: "root", level: 1 }),
      createNode({ id: "selected", title: "Selected", parentId: "mid", level: 2 }),
    ]);

    render(
      <ParentNodeSelector
        onChange={vi.fn()}
        nodes={[
          ...allNodes,
          createNode({ id: "selected", title: "Selected", parentId: "mid", level: 2 }),
        ]}
        value="selected"
      />,
    );

    expect(screen.getByText("Root › Mid")).toBeInTheDocument();
    expect(screen.queryByText("Root › Mid › Selected")).not.toBeInTheDocument();
  });
});
