import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DragActiveItem } from "@/hooks/use-dnd";
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

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    const homeButton = screen.getByRole("button", { name: "Home" });

    expect(nav).toHaveClass(
      "flex",
      "h-8",
      "items-center",
      "gap-0.5",
      "rounded-lg",
      "border",
      "border-border/40",
      "bg-background/80",
      "pl-2",
      "pr-3",
      "shadow-sm",
      "backdrop-blur-md",
      "max-w-[calc(100%-2rem)]",
      "overflow-x-auto",
    );
    expect(homeButton).toHaveClass(
      "rounded-md",
      "px-1.5",
      "py-0.5",
      "text-xs",
      "font-medium",
      "text-muted-foreground",
      "hover:bg-accent/40",
    );
    expect(homeButton).toHaveAttribute("data-drop-zone", "breadcrumb-root");
    expect(screen.queryByText("...")).not.toBeInTheDocument();
    expect(useBreadcrumbChainMock).toHaveBeenCalledWith("");
  });

  it("adds the active drag treatment when a draggable item is active", () => {
    useBreadcrumbChainMock.mockReturnValue([]);

    render(
      <Breadcrumbs
        dragActiveItem={{ id: "node-1", title: "Projects", type: "node" } satisfies NonNullable<DragActiveItem>}
        nodeId={null}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveClass(
      "bg-background/95",
      "ring-2",
      "ring-primary/20",
    );
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
    const currentPage = screen.getByText("Roadmap");

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveClass("gap-0.5");
    expect(homeButton).toHaveAttribute("data-drop-zone", "breadcrumb-root");
    expect(rootButton).toHaveAttribute("data-drop-zone", "breadcrumb-node");
    expect(rootButton).toHaveAttribute("data-node-id", root.id);
    expect(childButton).toHaveAttribute("data-drop-zone", "breadcrumb-node");
    expect(childButton).toHaveAttribute("data-node-id", child.id);
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage).toHaveClass("text-xs", "font-semibold", "text-foreground", "px-1.5");

    fireEvent.click(homeButton);
    fireEvent.click(rootButton);
    fireEvent.click(childButton);

    expect(push).toHaveBeenNthCalledWith(1, "/");
    expect(push).toHaveBeenNthCalledWith(2, `/grid/${root.id}`);
    expect(push).toHaveBeenNthCalledWith(3, `/grid/${child.id}`);
    expect(useBreadcrumbChainMock).toHaveBeenCalledWith(current.id);
  });
});
