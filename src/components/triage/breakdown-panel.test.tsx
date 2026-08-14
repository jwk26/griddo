import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConditionalEditorSnapshot } from "@/hooks/use-scratch-breakdowns";
import type { ScratchBreakdown } from "@/lib/db/schema";
import type { Bit } from "@/types";
import { useTriagePreferencesStore } from "@/stores/triage-preferences-store";
import { BreakdownPanel } from "./breakdown-panel";

const hookState = vi.hoisted(() => ({
  breakdownsByScratch: {} as Record<string, unknown[]>,
  createBreakdown: vi.fn(),
  deleteBreakdown: vi.fn(),
}));
const operationLockState = vi.hoisted(() => ({
  activeOperation: null as null | { kind: "add" | "delete"; operationId: string },
  acquire: vi.fn(),
  release: vi.fn(),
}));
const clearSelectionMock = vi.hoisted(() => vi.fn());
const triageStoreState = vi.hoisted(() => ({
  selectedScratchId: null as string | null,
  stagedCandidates: {} as Record<
    string,
    Array<{
      id: string;
      type: "node" | "bit";
      sourceBreakdownId: string;
      label: string;
    }>
  >,
  clearSelection: clearSelectionMock,
  scratchPoolExpanded: true as boolean,
  scratchPoolManualExpandedForId: null as string | null,
  setScratchPoolExpanded: vi.fn() as ReturnType<typeof vi.fn>,
}));
const useScratchBreakdownsMock = vi.hoisted(() => vi.fn());
const editorState = vi.hoisted(() => ({
  snapshot: null as ConditionalEditorSnapshot,
  titleBlocker: null,
  focusIntent: null as null | "field-end" | "field" | "edit-trigger" | "active-scratch-fallback" | "pending-action",
  openScratchTitle: vi.fn(),
  openBreakdown: vi.fn(),
  changeDraft: vi.fn(),
  save: vi.fn(),
  reconcile: vi.fn(),
  useMine: vi.fn(),
  useLatest: vi.fn(),
  cancel: vi.fn(),
  invalidate: vi.fn(),
  stayHere: vi.fn(),
}));
const useStagedCandidatesMock = vi.hoisted(() => vi.fn());
const useTriageStoreMock = vi.hoisted(() => vi.fn());
const getDataStoreMock = vi.hoisted(() => vi.fn());
const archiveBitMock = vi.hoisted(() => vi.fn());
const useInboxMock = vi.hoisted(() => vi.fn());
const currentTime = new Date(2026, 5, 17, 12, 0, 0).getTime();

vi.mock("@/hooks/use-scratch-breakdowns", () => ({
  useScratchBreakdowns: useScratchBreakdownsMock,
  useScratchTitleBlockerContext: () => ({
    getSnapshot: () => null,
    setSnapshot: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-inbox", () => ({
  useInbox: useInboxMock,
}));

vi.mock("@/hooks/use-staged-candidates", () => ({
  useStagedCandidates: useStagedCandidatesMock,
}));

vi.mock("@/hooks/use-triage-operation-lock", () => ({
  useTriageOperationLockContext: () => ({
    ...operationLockState,
    isLocked: () => operationLockState.activeOperation !== null,
  }),
}));

vi.mock("@/stores/triage-store", () => ({
  useTriageStore: useTriageStoreMock,
}));

vi.mock("@/lib/db/datastore", () => ({
  getDataStore: getDataStoreMock,
}));

function createScratchBreakdown(
  overrides: Partial<ScratchBreakdown> = {},
): ScratchBreakdown {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    scratchBitId: overrides.scratchBitId ?? "scratch-1",
    content: overrides.content ?? "breakdown content",
    order: overrides.order ?? 0,
    createdAt:
      overrides.createdAt ?? new Date(2026, 5, 17, 11, 15, 0).getTime(),
    consumedAt: overrides.consumedAt ?? null,
    version: overrides.version ?? 1,
  };
}

function createBit(overrides: Partial<Bit> = {}): Bit {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Scratch",
    description: overrides.description ?? "",
    icon: overrides.icon ?? "sparkles",
    deadline: overrides.deadline ?? null,
    deadlineAllDay: overrides.deadlineAllDay ?? false,
    priority: overrides.priority ?? null,
    status: overrides.status ?? "active",
    mtime: overrides.mtime ?? currentTime,
    createdAt: overrides.createdAt ?? currentTime,
    parentId: overrides.parentId ?? "inbox-node",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    deletedAt: overrides.deletedAt ?? null,
    archivedAt: overrides.archivedAt ?? null,
    version: overrides.version ?? 1,
    pastDeadlineDismissed: overrides.pastDeadlineDismissed ?? false,
  };
}

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(currentTime);
  hookState.breakdownsByScratch = {};
  hookState.createBreakdown.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    breakdown: null,
    scratch: null,
  }));
  hookState.deleteBreakdown.mockImplementation(async (command) => ({
    operationId: command.operationId,
    status: "applied",
    breakdown: null,
    candidate: null,
    scratch: null,
  }));
  operationLockState.activeOperation = null;
  operationLockState.acquire.mockReset();
  operationLockState.acquire.mockImplementation((kind, operationId) => {
    if (operationLockState.activeOperation !== null) return false;
    operationLockState.activeOperation = { kind, operationId };
    return true;
  });
  operationLockState.release.mockReset();
  operationLockState.release.mockImplementation((operationId) => {
    if (operationLockState.activeOperation?.operationId !== operationId) return false;
    operationLockState.activeOperation = null;
    return true;
  });
  triageStoreState.selectedScratchId = null;
  editorState.snapshot = null;
  editorState.focusIntent = null;
  editorState.openScratchTitle.mockReset();
  editorState.openScratchTitle.mockReturnValue(true);
  editorState.openBreakdown.mockReset();
  editorState.openBreakdown.mockReturnValue(true);
  editorState.invalidate.mockReset();
  triageStoreState.stagedCandidates = {};
  triageStoreState.scratchPoolExpanded = true;
  triageStoreState.scratchPoolManualExpandedForId = null;
  triageStoreState.setScratchPoolExpanded.mockReset();
  useInboxMock.mockReturnValue({
    activeScratchBits: [createBit({ id: "scratch-1" })],
  });
  useTriageStoreMock.mockImplementation(
    (selector: (state: typeof triageStoreState) => unknown) =>
      selector(triageStoreState),
  );
  useScratchBreakdownsMock.mockImplementation((scratchBitId: string | null) => {
    const rows =
      scratchBitId === null
        ? []
        : ((hookState.breakdownsByScratch[scratchBitId] ?? []) as ScratchBreakdown[]);
    const activeRows = rows.filter((row) => row.consumedAt === null);
    const consumedRows = rows.filter((row) => row.consumedAt !== null);
    const stagedCount =
      scratchBitId === null
        ? 0
        : (triageStoreState.stagedCandidates[scratchBitId] ?? []).length;
    return {
      breakdowns: activeRows,
      consumedBreakdownCount: consumedRows.length,
      hasObservedBreakdownHistory: rows.length > 0,
      isArchiveEligible:
        consumedRows.length > 0 && activeRows.length === 0 && stagedCount === 0,
      operations: [],
      editor: editorState,
      addBreakdown: hookState.createBreakdown,
      reconcileAddBreakdown: vi.fn(),
      deleteBreakdown: hookState.deleteBreakdown,
      reconcileDeleteBreakdown: vi.fn(),
    };
  });
  useStagedCandidatesMock.mockImplementation((scratchBitId: string | null) => {
    const candidates =
      scratchBitId === null
        ? []
        : (triageStoreState.stagedCandidates[scratchBitId] ?? []);
    return {
      candidates,
      counts: { authoritative: candidates.length },
      eligibility: {
        stagedSourceIds: new Set(
          candidates.map((candidate) => candidate.sourceBreakdownId),
        ),
      },
    };
  });
  useTriagePreferencesStore.setState({ breakdownCreatedAtSort: "DESC" });
  getDataStoreMock.mockResolvedValue({
    archiveBit: archiveBitMock,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("BreakdownPanel", () => {
  it("renders the empty state when no Scratch is selected", () => {
    render(<BreakdownPanel />);

    expect(
      screen.getByText("Select a Scratch to view breakdowns"),
    ).toBeInTheDocument();
  });

  it("renders breakdown content without row time labels", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "First note",
        createdAt: new Date(2026, 5, 17, 11, 15, 0).getTime(),
      }),
      createScratchBreakdown({
        id: "row-2",
        content: "Older note",
        createdAt: new Date(2026, 5, 17, 10, 0, 0).getTime(),
      }),
    ];

    render(<BreakdownPanel />);

    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("Older note")).toBeInTheDocument();
    expect(screen.queryByText("45m ago")).not.toBeInTheDocument();
    expect(screen.queryByText("2h ago")).not.toBeInTheDocument();
  });

  it("opens both DP-VQ04 editors from their exact source surfaces", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    const row = createScratchBreakdown({ id: "row-1", content: "Editable" });
    hookState.breakdownsByScratch["scratch-1"] = [row];

    render(<BreakdownPanel />);

    const [contextEdit, rowEdit] = screen.getAllByRole("button", { name: "Edit" });
    expect(contextEdit).toBeEnabled();
    expect(rowEdit).toBeEnabled();

    fireEvent.click(contextEdit);
    expect(editorState.openScratchTitle).toHaveBeenCalledWith(
      expect.objectContaining({ id: "scratch-1" }),
    );
    fireEvent.click(rowEdit);
    expect(editorState.openBreakdown).toHaveBeenCalledWith(row, false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the Scratch-title editor in the Context title slot", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    editorState.snapshot = {
      target: { kind: "scratch-title", id: "scratch-1" },
      phase: "dirty",
      base: { value: "Scratch", version: 1 },
      draft: "Protected title draft",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field-end",
      command: null,
    };

    render(<BreakdownPanel />);

    const surface = screen
      .getByRole("textbox", { name: "Scratch title" })
      .closest('[data-triage-editor-surface="scratch-title"]');
    expect(surface).toHaveAttribute("data-triage-role", "context-inline-editor");
    expect(surface).toHaveAttribute("data-triage-editor-state", "dirty");
    expect(within(surface as HTMLElement).getByText("Unsaved changes.")).toHaveAttribute(
      "data-triage-role",
      "inline-editor-status",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the Breakdown editor inside its exact source row", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Authoritative row" }),
    ];
    editorState.snapshot = {
      target: { kind: "breakdown", id: "row-1" },
      phase: "validation",
      base: { value: "Authoritative row", version: 1, order: 0 },
      draft: "",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field",
      command: null,
    };

    render(<BreakdownPanel />);

    const row = screen.getByTestId("breakdown-row");
    const surface = within(row)
      .getByRole("textbox", { name: "Breakdown content" })
      .closest('[data-triage-editor-surface="breakdown-content"]');
    expect(surface).toHaveAttribute("data-triage-role", "breakdown-inline-editor");
    expect(surface).toHaveAttribute("data-triage-editor-state", "validation");
    expect(within(surface as HTMLElement).getByText("Enter breakdown content.")).toBeVisible();
  });

  it("announces an applied Save once and returns focus to the surviving Edit", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    editorState.snapshot = {
      target: { kind: "scratch-title", id: "scratch-1" },
      phase: "dirty",
      base: { value: "Scratch", version: 1 },
      draft: "Saved title",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field",
      command: null,
    };
    const view = render(<BreakdownPanel />);
    editorState.save.mockResolvedValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(editorState.save).toHaveBeenCalledTimes(1));

    editorState.snapshot = null;
    editorState.focusIntent = "edit-trigger";
    view.rerender(<BreakdownPanel />);

    expect(screen.getByText("Saved.")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button", { name: "Edit" })).toHaveFocus();
  });

  it("keeps an invalidated draft in the former Breakdown row position", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Removed row" }),
      createScratchBreakdown({ id: "row-2", content: "Survivor", order: 1 }),
    ];
    const view = render(<BreakdownPanel />);
    fireEvent.click(
      within(screen.getAllByTestId("breakdown-row")[0]).getByRole("button", {
        name: "Edit",
      }),
    );
    editorState.snapshot = {
      target: { kind: "breakdown", id: "row-1" },
      phase: "dirty",
      base: { value: "Removed row", version: 1, order: 0 },
      draft: "Draft to recover",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field",
      command: null,
    };
    view.rerender(<BreakdownPanel />);

    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-2", content: "Survivor", order: 1 }),
    ];
    editorState.snapshot = {
      ...editorState.snapshot,
      phase: "invalidated",
      copyableDraft: "Draft to recover",
      focusIntent: "active-scratch-fallback",
    };
    view.rerender(<BreakdownPanel />);

    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("Draft to recover")).toBeVisible();
    expect(rows[0].querySelector("strong")).toHaveTextContent("Draft not saved");
    expect(within(rows[1]).getByText("Survivor")).toBeVisible();
  });

  it.each([
    ["scratch-title", "pristine", "No changes."],
    ["scratch-title", "dirty", "Unsaved changes."],
    ["scratch-title", "validation", "Enter a Scratch title."],
    ["scratch-title", "saving", "Saving…"],
    ["scratch-title", "offline", "Offline. Your draft is still here."],
    ["scratch-title", "not_applied", "Not saved. Your draft is still here."],
    ["scratch-title", "reconciling", "Checking whether your changes were saved…"],
    ["scratch-title", "conflict", "This changed elsewhere."],
    ["scratch-title", "invalidated", "Draft not saved"],
    ["breakdown", "pristine", "No changes."],
    ["breakdown", "dirty", "Unsaved changes."],
    ["breakdown", "validation", "Enter breakdown content."],
    ["breakdown", "saving", "Saving…"],
    ["breakdown", "offline", "Offline. Your draft is still here."],
    ["breakdown", "not_applied", "Not saved. Your draft is still here."],
    ["breakdown", "reconciling", "Checking whether your changes were saved…"],
    ["breakdown", "conflict", "This changed elsewhere."],
    ["breakdown", "invalidated", "Draft not saved"],
  ] as const)(
    "renders %s %s with the approved status and shared state binding",
    (targetKind, phase, expectedStatus) => {
      triageStoreState.selectedScratchId = "scratch-1";
      if (targetKind === "breakdown") {
        hookState.breakdownsByScratch["scratch-1"] = [
          createScratchBreakdown({ id: "row-1", content: "Current row" }),
        ];
      }
      editorState.snapshot = {
        target:
          targetKind === "scratch-title"
            ? { kind: "scratch-title", id: "scratch-1" }
            : { kind: "breakdown", id: "row-1" },
        phase,
        base: {
          value: targetKind === "scratch-title" ? "Scratch" : "Current row",
          version: 1,
          ...(targetKind === "breakdown" ? { order: 0 } : {}),
        },
        draft: phase === "validation" ? "" : "Protected draft",
        latest:
          phase === "conflict"
            ? { value: "Latest authority", version: 2, ...(targetKind === "breakdown" ? { order: 0 } : {}) }
            : null,
        copyableDraft: phase === "invalidated" ? "Protected draft" : null,
        pendingIntent: false,
        focusIntent: phase === "invalidated" ? "active-scratch-fallback" : "field",
        command: null,
      };

      render(<BreakdownPanel />);

      const surfaceName =
        targetKind === "scratch-title" ? "scratch-title" : "breakdown-content";
      const surface = document.querySelector(
        `[data-triage-editor-surface="${surfaceName}"]`,
      );
      expect(surface).toHaveAttribute(
        "data-triage-editor-state",
        phase.replace("_", "-"),
      );
      expect(within(surface as HTMLElement).getAllByText(expectedStatus).length).toBeGreaterThan(0);
      if (phase === "saving" || phase === "reconciling") {
        expect(within(surface as HTMLElement).getByRole("textbox")).toHaveAttribute(
          "readonly",
        );
      }
      if (phase === "validation") {
        expect(within(surface as HTMLElement).getByRole("textbox")).toHaveAttribute(
          "aria-invalid",
          "true",
        );
        expect(within(surface as HTMLElement).getByRole("button", { name: "Save" })).toBeDisabled();
      }
    },
  );

  it("preserves IME input, explicit theme activation, blur Save, and Escape Cancel boundaries", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    editorState.snapshot = {
      target: { kind: "scratch-title", id: "scratch-1" },
      phase: "dirty",
      base: { value: "Scratch", version: 1 },
      draft: "Protected draft",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field-end",
      command: null,
    };
    render(<BreakdownPanel />);
    const field = screen.getByRole("textbox", { name: "Scratch title" });
    expect(field).toHaveFocus();
    expect((field as HTMLInputElement).selectionStart).toBe("Protected draft".length);

    fireEvent.change(field, { target: { value: "Composed draft" } });
    expect(editorState.changeDraft).toHaveBeenCalledWith("Composed draft");
    fireEvent.compositionStart(field);
    fireEvent.keyDown(field, { key: "Escape", isComposing: true });
    expect(editorState.cancel).not.toHaveBeenCalled();
    fireEvent.compositionEnd(field);

    const themeToggle = document.createElement("button");
    themeToggle.setAttribute("aria-label", "Toggle theme");
    document.body.append(themeToggle);
    fireEvent.blur(field, { relatedTarget: themeToggle });
    expect(editorState.save).not.toHaveBeenCalled();
    themeToggle.remove();

    fireEvent.blur(field, { relatedTarget: null });
    expect(editorState.save).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(field, { key: "Escape" });
    expect(editorState.cancel).toHaveBeenCalledTimes(1);
  });

  it("renders conflict comparison and dispatches only the approved resolver actions", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    editorState.snapshot = {
      target: { kind: "scratch-title", id: "scratch-1" },
      phase: "conflict",
      base: { value: "Base", version: 1 },
      draft: "Your protected draft",
      latest: { value: "Latest authority", version: 2 },
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field",
      command: null,
    };
    render(<BreakdownPanel />);

    expect(screen.getByText("Latest authority").parentElement).toHaveAttribute(
      "data-triage-role",
      "inline-editor-latest",
    );
    expect(screen.getByText("Your protected draft", { selector: "p" }).parentElement).toHaveAttribute(
      "data-triage-role",
      "inline-editor-draft",
    );
    fireEvent.click(screen.getByRole("button", { name: "Use mine" }));
    fireEvent.click(screen.getByRole("button", { name: "Use latest" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy draft" }));

    expect(editorState.useMine).toHaveBeenCalledTimes(1);
    expect(editorState.useLatest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Your protected draft"));
    expect(screen.getByText(/Copied\./)).toHaveAttribute(
      "data-triage-role",
      "inline-editor-copy-status",
    );
  });

  it("renders pending-intent copy without adding Task 143 reconciliation actions", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    editorState.snapshot = {
      target: { kind: "scratch-title", id: "scratch-1" },
      phase: "saving",
      base: { value: "Base", version: 1 },
      draft: "Draft",
      latest: null,
      copyableDraft: null,
      pendingIntent: true,
      focusIntent: "field",
      command: null,
    };
    render(<BreakdownPanel />);

    expect(screen.getAllByText("Saving before continuing…").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Stay here" }));
    expect(editorState.stayHere).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Check again" })).not.toBeInTheDocument();
  });

  it("enables Retry save only after the browser reconnects", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    let online = false;
    vi.spyOn(navigator, "onLine", "get").mockImplementation(() => online);
    editorState.snapshot = {
      target: { kind: "scratch-title", id: "scratch-1" },
      phase: "offline",
      base: { value: "Base", version: 1 },
      draft: "Offline draft",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field",
      command: null,
    };
    render(<BreakdownPanel />);
    const retry = screen.getByRole("button", { name: "Retry save" });
    expect(retry).toBeDisabled();

    online = true;
    fireEvent(window, new Event("online"));

    expect(retry).toBeEnabled();
    fireEvent.click(retry);
    expect(editorState.save).toHaveBeenCalledTimes(1);
  });

  it("keeps the same editor semantics across light/dark and all eight color themes", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    editorState.snapshot = {
      target: { kind: "scratch-title", id: "scratch-1" },
      phase: "dirty",
      base: { value: "Base", version: 1 },
      draft: "Theme-stable draft",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field",
      command: null,
    };
    const themes = [
      "griddo",
      "tiny-desk",
      "neumorphism",
      "claymorphism",
      "origami",
      "terminal",
      "retro-mac",
      "graphite",
    ];
    const view = render(<BreakdownPanel />);

    for (const theme of themes) {
      for (const mode of ["light", "dark"] as const) {
        document.documentElement.dataset.colorTheme = theme;
        document.documentElement.classList.toggle("dark", mode === "dark");
        view.rerender(<BreakdownPanel />);
        const surface = screen
          .getByRole("textbox", { name: "Scratch title" })
          .closest('[data-triage-editor-surface="scratch-title"]');
        expect(surface).toHaveAttribute("data-triage-editor-state", "dirty");
        expect(within(surface as HTMLElement).getByText("Unsaved changes.")).toBeVisible();
      }
    }
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.colorTheme;
  });

  it("blocks both Edit entries while another shared operation is active", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Locked" }),
    ];
    operationLockState.activeOperation = { kind: "add", operationId: "add-1" };

    render(<BreakdownPanel />);

    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
    for (const edit of screen.getAllByRole("button", { name: "Edit" })) {
      expect(edit).toBeDisabled();
    }
    expect(editorState.openScratchTitle).not.toHaveBeenCalled();
    expect(editorState.openBreakdown).not.toHaveBeenCalled();
  });

  it("invalidates an open row editor when authoritative staging makes the row unsaveable", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-1",
          label: "Staged",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Staged" }),
    ];
    editorState.snapshot = {
      target: { kind: "breakdown", id: "row-1" },
      phase: "dirty",
      base: { value: "Staged", version: 1, order: 0 },
      draft: "Protected draft",
      latest: null,
      copyableDraft: null,
      pendingIntent: false,
      focusIntent: "field",
      command: null,
    };

    render(<BreakdownPanel />);

    expect(editorState.invalidate).toHaveBeenCalledTimes(1);
  });

  it("activates the input when clicking the add-note placeholder", () => {
    triageStoreState.selectedScratchId = "scratch-1";

    render(<BreakdownPanel />);

    const addEntry = screen.getByRole("button", { name: "Add a note..." });
    expect(addEntry).toHaveAttribute("data-triage-role", "breakdown-add-field");
    expect(screen.getByRole("button", { name: "Add" })).toHaveAttribute(
      "data-triage-role",
      "breakdown-add-control",
    );
    fireEvent.click(addEntry);

    expect(screen.getByPlaceholderText("Add a note...")).toHaveFocus();
    expect(screen.getByPlaceholderText("Add a note...")).toHaveAttribute(
      "data-triage-role",
      "breakdown-add-field",
    );
  });

  it("creates a trimmed breakdown when pressing Enter", async () => {
    triageStoreState.selectedScratchId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.change(input, { target: { value: "  Follow up  " } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(hookState.createBreakdown).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Follow up",
          scratchBitId: "scratch-1",
          scratchExpectedVersion: 1,
        }),
      );
    });
  });

  it("dispatches one Add for duplicate Enter/click and releases only its terminal identity", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    let resolveAdd!: (value: {
      operationId: string;
      status: "applied";
      breakdown: null;
      scratch: null;
    }) => void;
    hookState.createBreakdown.mockImplementation(
      (command) =>
        new Promise((resolve) => {
          resolveAdd = resolve;
        }).then(() => ({
          operationId: command.operationId,
          status: "applied" as const,
          breakdown: null,
          scratch: null,
        })),
    );

    render(<BreakdownPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.change(input, { target: { value: "Only once" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(hookState.createBreakdown).toHaveBeenCalledTimes(1);
    const command = hookState.createBreakdown.mock.calls[0][0];
    resolveAdd({
      operationId: command.operationId,
      status: "applied",
      breakdown: null,
      scratch: null,
    });
    await waitFor(() => {
      expect(operationLockState.release).toHaveBeenCalledWith(
        command.operationId,
        "applied",
      );
    });
  });

  it("retains an unknown Add draft and denies Escape without releasing the lock", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.createBreakdown.mockImplementation(async (command) => ({
      operationId: command.operationId,
      outcome: "unknown",
    }));

    render(<BreakdownPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.change(input, { target: { value: "Protected draft" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(hookState.createBreakdown).toHaveBeenCalledOnce());
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.getByPlaceholderText("Add a note...")).toHaveValue(
      "Protected draft",
    );
    expect(operationLockState.activeOperation?.kind).toBe("add");
    expect(operationLockState.release).not.toHaveBeenCalled();
  });

  it("retains an Add draft but releases the lock on terminal not_applied", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.createBreakdown.mockImplementation(async (command) => ({
      operationId: command.operationId,
      status: "not_applied",
      breakdown: null,
      scratch: null,
    }));

    render(<BreakdownPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.change(input, { target: { value: "Try later" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(operationLockState.release).toHaveBeenCalledWith(
        expect.any(String),
        "not_applied",
      );
    });
    expect(input).toHaveValue("Try later");
    expect(operationLockState.activeOperation).toBeNull();
  });

  it("scrolls the confirmed Add row into view under the active sort", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    const view = render(<BreakdownPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.change(input, { target: { value: "New confirmed row" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(hookState.createBreakdown).toHaveBeenCalledOnce());

    const command = hookState.createBreakdown.mock.calls[0][0];
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: command.breakdownId,
        content: "New confirmed row",
      }),
    ];
    view.rerender(<BreakdownPanel />);

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    });
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it("shows consumed completion without exposing the later Archive action", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "Processed note",
        consumedAt: currentTime,
      }),
    ];

    render(<BreakdownPanel />);

    expect(screen.getByText("All items processed")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Archive Scratch" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add a note..." }),
    ).toBeInTheDocument();
  });

  it("keeps the add-note bar when consumed breakdowns still have staged candidates", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-1",
          label: "Processed note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "Processed note",
        consumedAt: currentTime,
      }),
    ];

    render(<BreakdownPanel />);

    expect(screen.getByTestId("breakdown-empty-state")).toHaveAttribute(
      "data-triage-state",
      "ordinary",
    );
    expect(screen.queryByText("All items processed")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add a note..." }),
    ).toBeInTheDocument();
  });

  it("does not create a breakdown for empty blur or Escape cancels", () => {
    triageStoreState.selectedScratchId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.blur(input);
    fireEvent.keyDown(input, {
      key: "Escape",
    });

    expect(hookState.createBreakdown).not.toHaveBeenCalled();
  });

  it("opens a confirmation dialog when the delete button is clicked", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Delete me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
  });

  it("deletes the selected row when confirming the dialog", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Delete me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(hookState.deleteBreakdown).toHaveBeenCalledWith(
        expect.objectContaining({
          breakdownId: "row-1",
          expectedVersion: 1,
          scratchBitId: "scratch-1",
          scratchExpectedVersion: 1,
        }),
      );
    });
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("retains an unknown Delete row and denies Cancel/Escape without replay", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Still here" }),
    ];
    hookState.deleteBreakdown.mockImplementation(async (command) => ({
      operationId: command.operationId,
      outcome: "unknown",
    }));

    const view = render(<BreakdownPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(hookState.deleteBreakdown).toHaveBeenCalledOnce());
    view.rerender(<BreakdownPanel />);
    expect(screen.getByText("Still here")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(hookState.deleteBreakdown).toHaveBeenCalledTimes(1);
    expect(operationLockState.release).not.toHaveBeenCalled();
  });

  it("focuses the next visible row after confirmed Delete", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Delete first" }),
      createScratchBreakdown({ id: "row-2", content: "Focus next" }),
    ];

    const view = render(<BreakdownPanel />);
    const firstRow = screen.getByText("Delete first").closest("[role=listitem]");
    fireEvent.click(within(firstRow as HTMLElement).getByRole("button", { name: "Delete" }));
    fireEvent.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );
    await waitFor(() => expect(hookState.deleteBreakdown).toHaveBeenCalledOnce());

    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-2", content: "Focus next" }),
    ];
    view.rerender(<BreakdownPanel />);

    const nextRow = screen.getByText("Focus next").closest("[role=listitem]");
    await waitFor(() => {
      expect(
        within(nextRow as HTMLElement).getByRole("button", { name: "Delete" }),
      ).toHaveFocus();
    });
  });

  it("focuses the previous visible row when confirmed Delete has no next row", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Focus previous" }),
      createScratchBreakdown({ id: "row-2", content: "Delete last" }),
    ];

    const view = render(<BreakdownPanel />);
    const lastRow = screen.getByText("Delete last").closest("[role=listitem]");
    fireEvent.click(within(lastRow as HTMLElement).getByRole("button", { name: "Delete" }));
    fireEvent.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );
    await waitFor(() => expect(hookState.deleteBreakdown).toHaveBeenCalledOnce());

    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Focus previous" }),
    ];
    view.rerender(<BreakdownPanel />);

    const previousRow = screen
      .getByText("Focus previous")
      .closest("[role=listitem]");
    await waitFor(() => {
      expect(
        within(previousRow as HTMLElement).getByRole("button", {
          name: "Delete",
        }),
      ).toHaveFocus();
    });
  });

  it("focuses Add after confirmed Delete leaves an ordinary empty state", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Delete only" }),
    ];

    const view = render(<BreakdownPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );
    await waitFor(() => expect(hookState.deleteBreakdown).toHaveBeenCalledOnce());

    hookState.breakdownsByScratch["scratch-1"] = [];
    view.rerender(<BreakdownPanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add a note..." })).toHaveFocus();
    });
  });

  it("focuses Context after confirmed Delete creates consumed completion", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Delete final active" }),
    ];

    const view = render(<BreakdownPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );
    await waitFor(() => expect(hookState.deleteBreakdown).toHaveBeenCalledOnce());

    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "consumed-row",
        content: "Already processed",
        consumedAt: currentTime,
      }),
    ];
    view.rerender(<BreakdownPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("selected-scratch-context")).toHaveFocus();
    });
  });

  it("does not delete when cancelling the confirmation dialog", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Keep me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("updates the breakdown list when the selected Scratch changes", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Scratch one note" }),
    ];
    hookState.breakdownsByScratch["scratch-2"] = [
      createScratchBreakdown({
        id: "row-2",
        scratchBitId: "scratch-2",
        content: "Scratch two note",
      }),
    ];

    const { rerender } = render(<BreakdownPanel />);

    expect(screen.getByText("Scratch one note")).toBeInTheDocument();

    triageStoreState.selectedScratchId = "scratch-2";
    rerender(<BreakdownPanel />);

    expect(screen.queryByText("Scratch one note")).not.toBeInTheDocument();
    expect(screen.getByText("Scratch two note")).toBeInTheDocument();
  });

  it("renders the grip as a visual-only non-draggable handle", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Has grip" }),
    ];

    render(<BreakdownPanel />);

    const grip = screen.getByTestId("breakdown-grip");
    expect(grip).toHaveAttribute("aria-hidden", "true");
    expect(grip).not.toHaveAttribute("draggable");
    expect(grip).not.toHaveAttribute("ondragstart");
    expect(grip).not.toHaveAttribute("ondragend");
    expect(grip).not.toHaveAttribute("data-dnd-kit");
  });

  it("de-emphasises a breakdown row whose id matches a staged candidate sourceBreakdownId", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-1",
          label: "Staged note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Staged note" }),
    ];

    render(<BreakdownPanel />);

    const text = screen.getByText("Staged note");
    const row = text.closest(".group");
    const grip = within(row as HTMLElement).getByTestId("breakdown-grip");

    expect(row).toHaveClass("opacity-50", "transition-opacity", "duration-200");
    expect(text).toHaveClass("text-muted-foreground");
    expect(grip).toHaveClass("text-muted-foreground/20");
  });

  it("does not retain a consumed row in the active Breakdown list", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({
        id: "row-1",
        content: "Consumed note",
        consumedAt: currentTime,
      }),
    ];

    render(<BreakdownPanel />);

    expect(screen.queryByText("Consumed note")).not.toBeInTheDocument();
    expect(screen.getByTestId("breakdown-empty-state")).toHaveAttribute(
      "data-triage-state",
      "consumed-completion",
    );
  });

  it("does not add line-through styling to a staged row", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "bit",
          sourceBreakdownId: "row-1",
          label: "Staged note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Staged note" }),
    ];

    render(<BreakdownPanel />);

    const text = screen.getByText("Staged note");
    const row = text.closest(".group");

    expect(row).not.toHaveClass("line-through");
    expect(text).not.toHaveClass("line-through");
  });

  it("does not de-emphasise a non-staged row", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-2",
          label: "Other staged note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Active note" }),
    ];

    render(<BreakdownPanel />);

    const text = screen.getByText("Active note");
    const row = text.closest(".group");
    const grip = within(row as HTMLElement).getByTestId("breakdown-grip");

    expect(row).not.toHaveClass("opacity-50");
    expect(text).toHaveClass("text-foreground");
    expect(text).not.toHaveClass("text-muted-foreground");
    expect(grip).toHaveClass("text-muted-foreground/45");
  });

  it("clears the confirmation dialog on Escape without deleting", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Keep me" }),
    ];

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
  });

  it("closes the confirmation dialog without deleting when the selected Scratch changes", async () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Keep me" }),
    ];

    const { rerender } = render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();

    triageStoreState.selectedScratchId = "scratch-2";
    rerender(<BreakdownPanel />);

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(hookState.deleteBreakdown).not.toHaveBeenCalled();
  });

  it("renders the selected Scratch Context with title and full time", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({
          id: "scratch-1",
          title: "Inbox planning note",
          createdAt: new Date(2026, 5, 17, 11, 15, 0).getTime(),
        }),
      ],
    });

    render(<BreakdownPanel />);

    const strip = screen.getByLabelText("Selected Scratch: Inbox planning note");
    expect(strip).toBeInTheDocument();
    const title = within(strip).getByText("Inbox planning note");
    expect(title).toHaveClass("break-words", "whitespace-pre-wrap");
    expect(title).not.toHaveClass("truncate");
    expect(within(strip).getByText(/Jun 17, 2026, 11:15 AM/)).toBeInTheDocument();
  });

  it("clicking the add-note placeholder does not collapse the Scratch Pool", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.scratchPoolExpanded = true;
    triageStoreState.scratchPoolManualExpandedForId = null;

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));

    expect(triageStoreState.setScratchPoolExpanded).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Add a note...")).toHaveFocus();
  });

  it("focusing the add-note input does not collapse the Scratch Pool", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.scratchPoolExpanded = true;

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    fireEvent.focus(screen.getByPlaceholderText("Add a note..."));

    expect(triageStoreState.setScratchPoolExpanded).not.toHaveBeenCalled();
  });

  it("pressing a printable key in the add-note input collapses the Scratch Pool when conditions are met", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.scratchPoolExpanded = true;
    triageStoreState.scratchPoolManualExpandedForId = null;

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.keyDown(input, { key: "A" });

    expect(triageStoreState.setScratchPoolExpanded).toHaveBeenCalledWith(false);
  });

  it("pressing a modifier shortcut (metaKey+k) in the input does not collapse the Scratch Pool", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.scratchPoolExpanded = true;
    triageStoreState.scratchPoolManualExpandedForId = null;

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.keyDown(input, { key: "k", metaKey: true });

    expect(triageStoreState.setScratchPoolExpanded).not.toHaveBeenCalled();
  });

  it("pressing Enter submits the breakdown and keeps the add-note input focused", async () => {
    triageStoreState.selectedScratchId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.change(input, { target: { value: "Follow up" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(hookState.createBreakdown).toHaveBeenCalledWith(
        expect.objectContaining({ content: "Follow up" }),
      );
    });
    expect(screen.getByPlaceholderText("Add a note...")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Add a note...")).toHaveFocus();
    });
    expect(screen.getByPlaceholderText("Add a note...")).toHaveValue("");
  });

  it("typing does not collapse pool if the current Scratch was manually re-expanded", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.scratchPoolExpanded = true;
    triageStoreState.scratchPoolManualExpandedForId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.keyDown(input, { key: "A" });

    expect(triageStoreState.setScratchPoolExpanded).not.toHaveBeenCalled();
  });

  it("typing collapses pool when selected Scratch changed and manual expand was for a different Scratch", () => {
    triageStoreState.selectedScratchId = "scratch-2";
    triageStoreState.scratchPoolExpanded = true;
    triageStoreState.scratchPoolManualExpandedForId = "scratch-1";

    render(<BreakdownPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a note..." }));
    const input = screen.getByPlaceholderText("Add a note...");
    fireEvent.keyDown(input, { key: "A" });

    expect(triageStoreState.setScratchPoolExpanded).toHaveBeenCalledWith(false);
  });

  it("the drag grip button has the larger h-7 w-7 hit target and is the only drag activator", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Has grip" }),
    ];

    render(<BreakdownPanel />);

    const gripButton = screen.getByRole("button", { name: "Drag breakdown" });
    expect(gripButton).toHaveClass("h-7");
    expect(gripButton).toHaveClass("w-7");
    expect(gripButton).toHaveClass("rounded-md");
    expect(gripButton).toHaveClass("focus-visible:ring-2");

    const rowContainer = gripButton.closest(".group");
    expect(rowContainer).not.toHaveAttribute("aria-label", "Drag breakdown");
  });

  it("renders a standalone Context with full created time, Edit, and Breakdown sort", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    useInboxMock.mockReturnValue({
      activeScratchBits: [
        createBit({
          id: "scratch-1",
          title: "Inbox planning note",
          createdAt: new Date(2026, 5, 17, 11, 15, 0).getTime(),
        }),
      ],
    });

    render(<BreakdownPanel />);

    const context = screen.getByTestId("selected-scratch-context");
    expect(context).toHaveAttribute(
      "data-triage-role",
      "context-signature-plate",
    );
    expect(context).toHaveClass("min-h-[104px]");
    expect(within(context).getByText("Selected Scratch")).toHaveAttribute(
      "data-triage-role",
      "context-eyebrow-meta",
    );
    expect(within(context).getByText("Inbox planning note")).toHaveAttribute(
      "data-triage-role",
      "context-title",
    );
    expect(within(context).getByText(/Jun 17, 2026/)).toBeVisible();
    expect(within(context).getByText(/11:15/)).toBeVisible();
    const contextEdit = within(context).getByRole("button", { name: "Edit" });
    expect(contextEdit).toBeVisible();
    expect(contextEdit).not.toHaveAttribute(
      "data-triage-role",
      "breakdown-row-action",
    );
    expect(
      within(context).getByRole("button", { name: "Sort: newest first" }),
    ).toBeVisible();
  });

  it("toggles stable Breakdown created-at ordering without row time labels", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "older", content: "Older", createdAt: 10 }),
      createScratchBreakdown({ id: "newer", content: "Newer", createdAt: 20 }),
    ];
    useScratchBreakdownsMock.mockImplementation(
      (_scratchBitId: string | null, sort: "ASC" | "DESC") => ({
        breakdowns: (hookState.breakdownsByScratch["scratch-1"] as ScratchBreakdown[])
          .toSorted((left, right) =>
            sort === "ASC"
              ? left.createdAt - right.createdAt
              : right.createdAt - left.createdAt,
          ),
        consumedBreakdownCount: 0,
        hasObservedBreakdownHistory: true,
        isArchiveEligible: false,
        operations: [],
        editor: editorState,
        addBreakdown: hookState.createBreakdown,
        reconcileAddBreakdown: vi.fn(),
        deleteBreakdown: hookState.deleteBreakdown,
        reconcileDeleteBreakdown: vi.fn(),
      }),
    );

    render(<BreakdownPanel />);

    expect(screen.getAllByTestId("breakdown-row").map((row) => row.textContent)).toEqual([
      "Newer",
      "Older",
    ]);
    expect(screen.queryByText("45m ago")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sort: newest first" }));

    expect(screen.getAllByTestId("breakdown-row").map((row) => row.textContent)).toEqual([
      "Older",
      "Newer",
    ]);
  });

  it("keeps staged rows visible, non-struck, and interaction-disabled from Task 131 truth", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    triageStoreState.stagedCandidates = {
      "scratch-1": [
        {
          id: "candidate-1",
          type: "node",
          sourceBreakdownId: "row-1",
          label: "Staged note",
        },
      ],
    };
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "row-1", content: "Staged note" }),
    ];

    render(<BreakdownPanel />);

    const row = screen.getByTestId("breakdown-row");
    expect(row).toHaveAttribute("data-triage-state", "staged");
    expect(within(row).getByText("Staged note")).not.toHaveClass("line-through");
    expect(within(row).getByRole("button", { name: "Drag breakdown" })).toBeDisabled();
    expect(within(row).getByRole("button", { name: "Edit" })).toBeDisabled();
    expect(within(row).getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("removes consumed rows and shows completion only with consumed history and no staged candidate", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    hookState.breakdownsByScratch["scratch-1"] = [
      createScratchBreakdown({ id: "consumed", content: "Done", consumedAt: 30 }),
    ];

    render(<BreakdownPanel />);

    expect(screen.queryByText("Done")).not.toBeInTheDocument();
    expect(screen.getByTestId("breakdown-empty-state")).toHaveAttribute(
      "data-triage-state",
      "consumed-completion",
    );
    expect(screen.getByText("All items processed")).toBeVisible();
  });

  it("does not imply completion for never-used or observed all-deleted empty states", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    useScratchBreakdownsMock.mockReturnValue({
      breakdowns: [],
      consumedBreakdownCount: 0,
      hasObservedBreakdownHistory: false,
      isArchiveEligible: false,
      operations: [],
      editor: editorState,
      addBreakdown: hookState.createBreakdown,
      reconcileAddBreakdown: vi.fn(),
      deleteBreakdown: hookState.deleteBreakdown,
      reconcileDeleteBreakdown: vi.fn(),
    });
    const { rerender } = render(<BreakdownPanel />);

    expect(screen.getByTestId("breakdown-empty-state")).toHaveAttribute(
      "data-triage-state",
      "never-used",
    );
    expect(screen.queryByText("All items processed")).not.toBeInTheDocument();

    useScratchBreakdownsMock.mockReturnValue({
      breakdowns: [],
      consumedBreakdownCount: 0,
      hasObservedBreakdownHistory: true,
      isArchiveEligible: false,
      operations: [],
      editor: editorState,
      addBreakdown: hookState.createBreakdown,
      reconcileAddBreakdown: vi.fn(),
      deleteBreakdown: hookState.deleteBreakdown,
      reconcileDeleteBreakdown: vi.fn(),
    });
    rerender(<BreakdownPanel />);

    expect(screen.getByTestId("breakdown-empty-state")).toHaveAttribute(
      "data-triage-state",
      "all-deleted",
    );
    expect(screen.queryByText("All items processed")).not.toBeInTheDocument();
  });

  it("fails completion closed for a missing selected Scratch or delayed eligibility", () => {
    triageStoreState.selectedScratchId = "scratch-1";
    useInboxMock.mockReturnValue({ activeScratchBits: [] });
    useScratchBreakdownsMock.mockReturnValue({
      breakdowns: [],
      consumedBreakdownCount: 1,
      hasObservedBreakdownHistory: true,
      isArchiveEligible: true,
      operations: [],
      editor: editorState,
      addBreakdown: hookState.createBreakdown,
      reconcileAddBreakdown: vi.fn(),
      deleteBreakdown: hookState.deleteBreakdown,
      reconcileDeleteBreakdown: vi.fn(),
    });

    const { rerender } = render(<BreakdownPanel />);
    expect(screen.queryByText("All items processed")).not.toBeInTheDocument();

    useInboxMock.mockReturnValue({
      activeScratchBits: [createBit({ id: "scratch-1" })],
    });
    useScratchBreakdownsMock.mockReturnValue({
      breakdowns: [],
      consumedBreakdownCount: 1,
      hasObservedBreakdownHistory: true,
      isArchiveEligible: false,
      operations: [],
      editor: editorState,
      addBreakdown: hookState.createBreakdown,
      reconcileAddBreakdown: vi.fn(),
      deleteBreakdown: hookState.deleteBreakdown,
      reconcileDeleteBreakdown: vi.fn(),
    });
    rerender(<BreakdownPanel />);

    expect(screen.getByTestId("breakdown-empty-state")).toHaveAttribute(
      "data-triage-state",
      "ordinary",
    );
    expect(screen.queryByText("All items processed")).not.toBeInTheDocument();
  });
});
