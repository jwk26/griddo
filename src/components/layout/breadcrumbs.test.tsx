import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { indexedDBStore } from "@/lib/db/indexeddb";
import type { Node } from "@/types";
import { Breadcrumbs } from "./breadcrumbs";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/db/indexeddb", () => ({
  indexedDBStore: {
    getNode: vi.fn(),
  },
}));

function createNode(overrides: Partial<Node>): Node {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Node",
    description: overrides.description ?? "",
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
  it("loads the ancestor chain and routes each segment", async () => {
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
      description: "Current sprint focus",
      parentId: child.id,
      level: 2,
    });
    const getNodeMock = vi.mocked(indexedDBStore.getNode);

    getNodeMock
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce(child)
      .mockResolvedValueOnce(root);

    render(<Breadcrumbs nodeId={current.id} />);

    await waitFor(() => {
      expect(screen.getByText("Roadmap")).toBeInTheDocument();
    });

    const homeButton = screen.getByRole("button", { name: "Home" });
    const rootButton = screen.getByRole("button", { name: "Projects" });
    const childButton = screen.getByRole("button", { name: "Q2" });

    expect(screen.getByText("Current sprint focus")).toBeInTheDocument();
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
    expect(getNodeMock).toHaveBeenNthCalledWith(1, current.id);
    expect(getNodeMock).toHaveBeenNthCalledWith(2, child.id);
    expect(getNodeMock).toHaveBeenNthCalledWith(3, root.id);
  });
});
