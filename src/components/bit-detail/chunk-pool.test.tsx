import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Chunk } from "@/types";
import { ChunkPool, type ChunkPoolHandle } from "./chunk-pool";

const createChunkMock = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("@/hooks/use-chunk-actions", () => ({
  useChunkActions: () => ({
    createChunk: createChunkMock,
    updateChunk: vi.fn(),
    deleteChunk: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function createChunk(overrides: Partial<Chunk> = {}): Chunk {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Chunk",
    description: overrides.description ?? "",
    time: overrides.time ?? null,
    timeAllDay: overrides.timeAllDay ?? false,
    status: overrides.status ?? "incomplete",
    order: overrides.order ?? 0,
    parentId: overrides.parentId ?? "bit-1",
  };
}

describe("ChunkPool", () => {
  it("creates only one chunk when Enter is followed by blur", async () => {
    const ref = createRef<ChunkPoolHandle>();

    render(<ChunkPool ref={ref} chunks={[]} bitId="bit-1" />);

    act(() => {
      ref.current?.startAdding();
    });

    expect(screen.queryByRole("button", { name: "Add a step" })).not.toBeInTheDocument();

    const input = screen.getByPlaceholderText("Step name...");
    fireEvent.change(input, { target: { value: "한글 단계" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(createChunkMock).toHaveBeenCalledTimes(1);
    });
    expect(createChunkMock).toHaveBeenCalledWith({
      title: "한글 단계",
      description: "",
      time: null,
      timeAllDay: false,
      order: 0,
      parentId: "bit-1",
    });
  });

  it("renders timed and untimed chunks together in order", () => {
    render(
      <ChunkPool
        chunks={[
          createChunk({
            id: "timed-step",
            title: "Timed step",
            time: new Date(2026, 3, 10, 9, 0).getTime(),
            order: 1,
          }),
          createChunk({
            id: "untimed-step",
            title: "Untimed step",
            time: null,
            order: 0,
          }),
        ]}
        bitId="bit-1"
      />,
    );

    expect(screen.getAllByText("Untimed step")).toHaveLength(1);
    expect(screen.getAllByText("Timed step")).toHaveLength(1);
  });
});
