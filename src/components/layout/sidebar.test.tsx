import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.hoisted(() => vi.fn());
const usePathnameMock = vi.hoisted(() => vi.fn());
const toggleEditModeMock = vi.hoisted(() => vi.fn());
const openSearchMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ isOver: false, setNodeRef: vi.fn() }),
}));

vi.mock("motion/react", async () => {
  const React = await import("react");

  const MotionButton = React.forwardRef<
    HTMLButtonElement,
    ComponentProps<"button"> & {
      animate?: unknown;
      initial?: unknown;
      transition?: unknown;
    }
  >(function MotionButton({ animate, initial, transition, ...props }, ref) {
    return (
      <button
        ref={ref}
        data-motion-animate={JSON.stringify(animate)}
        data-motion-initial={JSON.stringify(initial)}
        data-motion-transition={JSON.stringify(transition)}
        {...props}
      />
    );
  });

  return {
    motion: {
      button: MotionButton,
    },
  };
});

vi.mock("@/components/layout/theme-toggle", () => ({
  ThemeToggle: ({ className }: { className?: string }) => (
    <button className={className} type="button">
      Theme
    </button>
  ),
}));

vi.mock("@/components/ui/popover", async () => {
  const React = await import("react");

  const PopoverContext = React.createContext<{
    onOpenChange: (open: boolean) => void;
    open: boolean;
  } | null>(null);

  function Popover({
    children,
    open = false,
    onOpenChange = () => {},
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) {
    return (
      <PopoverContext.Provider value={{ open, onOpenChange }}>
        {children}
      </PopoverContext.Provider>
    );
  }

  function PopoverTrigger({
    children,
  }: {
    children: React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
  }) {
    const context = React.useContext(PopoverContext);

    if (!context) {
      return children;
    }

    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event);
        context.onOpenChange(!context.open);
      },
    });
  }

  function PopoverContent(props: React.ComponentProps<"div">) {
    const context = React.useContext(PopoverContext);

    if (!context?.open) {
      return null;
    }

    return <div {...props} />;
  }

  return { Popover, PopoverContent, PopoverTrigger };
});

vi.mock("@/hooks/use-global-urgency", () => ({
  useGlobalUrgency: () => null,
}));

vi.mock("@/stores/edit-mode-store", () => ({
  useEditModeStore: (
    selector: (state: { isEditMode: boolean; toggle: typeof toggleEditModeMock }) => unknown,
  ) => selector({ isEditMode: false, toggle: toggleEditModeMock }),
}));

vi.mock("@/stores/search-store", () => ({
  useSearchStore: {
    getState: () => ({ open: openSearchMock }),
  },
}));

const { Sidebar } = await import("@/components/layout/sidebar");

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  usePathnameMock.mockReturnValue("/");
});

describe("Sidebar", () => {
  it("shows a home button and calendar creation chooser on calendar routes", () => {
    usePathnameMock.mockReturnValue("/calendar/weekly");

    render(<Sidebar />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(pushMock).toHaveBeenCalledWith("/");

    fireEvent.click(screen.getByRole("button", { name: "Add item" }));

    expect(screen.getByRole("button", { name: "Node" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bit" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Node" }));

    expect(screen.queryByRole("button", { name: "Node" })).not.toBeInTheDocument();
  });

  it("calls onNodeCreate and closes chooser when Node option is clicked", () => {
    usePathnameMock.mockReturnValue("/calendar/weekly");
    const onNodeCreate = vi.fn();

    render(<Sidebar onNodeCreate={onNodeCreate} />);

    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    fireEvent.click(screen.getByRole("button", { name: "Node" }));

    expect(onNodeCreate).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Node" })).not.toBeInTheDocument();
  });

  it("calls onBitCreate and closes chooser when Bit option is clicked", () => {
    usePathnameMock.mockReturnValue("/calendar/weekly");
    const onBitCreate = vi.fn();

    render(<Sidebar onBitCreate={onBitCreate} />);

    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    fireEvent.click(screen.getByRole("button", { name: "Bit" }));

    expect(onBitCreate).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Bit" })).not.toBeInTheDocument();
  });

  it("marks the grid add button active when requested", () => {
    render(<Sidebar isAddActive={true} onAddClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Add item" })).toHaveClass(
      "bg-accent",
      "text-foreground",
    );
  });

  it("closes chooser without error when Node clicked and onNodeCreate is absent", () => {
    usePathnameMock.mockReturnValue("/calendar/weekly");

    render(<Sidebar />);

    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    fireEvent.click(screen.getByRole("button", { name: "Node" }));

    expect(screen.queryByRole("button", { name: "Node" })).not.toBeInTheDocument();
  });

  it("disables edit mode in calendar view and keeps the tooltip on the wrapper", () => {
    usePathnameMock.mockReturnValue("/calendar/monthly");

    render(<Sidebar />);

    const editButton = screen.getByRole("button", { name: "Toggle edit mode" });

    expect(editButton).toBeDisabled();
    expect(editButton).toHaveClass("opacity-40");
    expect(editButton).not.toHaveAttribute("title");
    expect(editButton.parentElement).toHaveAttribute("title", "Editing restricted in Calendar view");

    fireEvent.click(editButton);

    expect(toggleEditModeMock).not.toHaveBeenCalled();
  });

  it("expands the pencil target while a grid item is being dragged", () => {
    render(
      <Sidebar
        dragActiveItem={{ id: "node-1", title: "Node", type: "node" }}
      />,
    );

    const editButton = screen.getByRole("button", { name: "Toggle edit mode" });

    expect(editButton).toHaveAttribute("data-motion-animate", expect.stringContaining('"scale":1.2'));
    expect(editButton).toHaveAttribute("data-motion-animate", expect.stringContaining('"boxShadow":"0 0 20px hsl(var(--primary) / 0.45)"'));
    expect(editButton).not.toHaveAttribute("data-motion-animate", expect.stringContaining("borderColor"));
    expect(editButton).toHaveClass("border-primary/60");
  });
});
