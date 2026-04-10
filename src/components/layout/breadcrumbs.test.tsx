import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@/types";
import { Breadcrumbs } from "./breadcrumbs";

const useBreadcrumbChainMock = vi.hoisted(() => vi.fn());
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/hooks/use-breadcrumb-chain", () => ({
  useBreadcrumbChain: useBreadcrumbChainMock,
}));

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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Breadcrumbs", () => {
  it("renders Home only when nodeId is null", () => {
    useBreadcrumbChainMock.mockReturnValue([]);

    render(<Breadcrumbs nodeId={null} />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveClass("items-center");
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.queryByText("...")).not.toBeInTheDocument();
    expect(useBreadcrumbChainMock).toHaveBeenCalledWith("");
  });

  it("renders the ancestor chain and routes each segment", () => {
    const root = createNode({ id: "root-node", title: "Projects" });
    const child = createNode({
      id: "child-node",
      title: "Q2",
      parentId: root.id,
      level: 1,
    });
    const current = createNode({
      id: "current-node",
      title: "Roadmap",
      parentId: child.id,
      level: 2,
    });
    useBreadcrumbChainMock.mockReturnValue([root, child, current]);

    render(<Breadcrumbs nodeId={current.id} />);

    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.queryByText("Current sprint focus")).not.toBeInTheDocument();

    const homeButton = screen.getByRole("button", { name: "Home" });
    const rootButton = screen.getByRole("button", { name: "Projects" });
    const childButton = screen.getByRole("button", { name: "Q2" });

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveClass("items-center");
    expect(rootButton).toHaveAttribute("data-drop-zone", "breadcrumb-node");
    expect(rootButton).toHaveAttribute("data-node-id", root.id);
    expect(childButton).toHaveAttribute("data-drop-zone", "breadcrumb-node");
    expect(childButton).toHaveAttribute("data-node-id", child.id);

    fireEvent.click(homeButton);
    fireEvent.click(rootButton);
    fireEvent.click(childButton);

    expect(push).toHaveBeenNthCalledWith(1, "/");
    expect(push).toHaveBeenNthCalledWith(2, `/grid/${root.id}`);
    expect(push).toHaveBeenNthCalledWith(3, `/grid/${child.id}`);
    expect(useBreadcrumbChainMock).toHaveBeenCalledWith(current.id);
  });
});
