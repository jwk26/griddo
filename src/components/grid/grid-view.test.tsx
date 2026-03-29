import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEditModeStore } from "@/stores/edit-mode-store";
import type { Bit } from "@/types";
import { GridView } from "./grid-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/grid/parent-node",
  useRouter: () => ({ push }),
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      animate,
      children,
      ...props
    }: {
      animate?: string;
      children?: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
    }) => (
      <div data-motion-animate={animate} {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock("@/hooks/use-grid-data", () => ({
  useGridData: vi.fn(),
}));

const { useGridData } = await import("@/hooks/use-grid-data");

function createBit(overrides: Partial<Bit>): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Bit",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "Folder",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? Date.now(),
    createdAt: overrides.createdAt ?? Date.now(),
    parentId: overrides.parentId ?? "parent-node",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useEditModeStore.setState({ isEditMode: false });
});

describe("GridView", () => {
  it("renders bits as clickable bit cards and applies the level vignette", () => {
    vi.mocked(useGridData).mockReturnValue({
      nodes: [],
      bits: [
        createBit({
          id: "bit-1",
          title: "Ship Phase 4",
          deadline: new Date("2027-01-01T00:00:00.000Z").getTime(),
        }),
      ],
      isLoading: false,
    });
    const { container } = render(
      <GridView
        level={2}
        onAddAtCell={vi.fn()}
        parentColor="hsl(12, 78%, 55%)"
        parentId="parent-node"
      />,
    );

    fireEvent.click(screen.getByText("Ship Phase 4").closest('[role="button"]')!);

    expect(push).toHaveBeenCalledWith("/grid/parent-node?bit=bit-1");
    expect(container.querySelector('[data-motion-animate="l2"]')).not.toBeNull();
  });
});
