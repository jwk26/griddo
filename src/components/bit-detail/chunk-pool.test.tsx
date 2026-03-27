import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChunkPool } from "./chunk-pool";

const createChunkMock = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("@/lib/db/indexeddb", () => ({
  indexedDBStore: {
    createChunk: createChunkMock,
    updateChunk: vi.fn(),
    deleteChunk: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ChunkPool", () => {
  it("creates only one chunk when Enter is followed by blur", async () => {
    render(<ChunkPool chunks={[]} bitId="bit-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Add a step" }));

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
});
