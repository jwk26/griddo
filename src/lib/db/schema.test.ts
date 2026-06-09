import { describe, expect, it } from "vitest";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import {
  createBitSchema,
  createChunkSchema,
  createNodeSchema,
  createScratchBreakdownSchema,
  nodeSchema,
  scratchBreakdownSchema,
} from "@/lib/db/schema";

describe("schema", () => {
  it("applies defaults for node creation payloads", () => {
    const parsed = createNodeSchema.parse({
      title: "Inbox",
      color: "hsl(210, 80%, 55%)",
      icon: "inbox",
      parentId: null,
      level: 0,
      x: 2,
      y: 3,
    });

    expect(parsed).toEqual({
      title: "Inbox",
      color: "hsl(210, 80%, 55%)",
      icon: "inbox",
      deadline: null,
      deadlineAllDay: false,
      parentId: null,
      level: 0,
      x: 2,
      y: 3,
    });
  });

  it("rejects invalid node color and out-of-range coordinates", () => {
    expect(() =>
      createNodeSchema.parse({
        title: "Inbox",
        color: "#ffffff",
        icon: "inbox",
        parentId: null,
        level: 0,
        x: 0,
        y: 0,
      }),
    ).toThrow();

    expect(() =>
      nodeSchema.parse({
        id: crypto.randomUUID(),
        title: "Inbox",
        color: "hsl(210, 80%, 55%)",
        icon: "inbox",
        deadline: null,
        deadlineAllDay: false,
        mtime: Date.now(),
        createdAt: Date.now(),
        parentId: null,
        level: 0,
        x: GRID_COLS,
        y: 0,
        deletedAt: null,
      }),
    ).toThrow();
  });

  it("applies lifecycle defaults for stored nodes", () => {
    const timestamp = Date.now();
    const parsed = nodeSchema.parse({
      id: crypto.randomUUID(),
      title: "Inbox",
      color: "hsl(210, 80%, 55%)",
      icon: "inbox",
      deadline: null,
      deadlineAllDay: false,
      mtime: timestamp,
      createdAt: timestamp,
      parentId: null,
      level: 0,
      x: 2,
      y: 3,
      deletedAt: null,
    });

    expect(parsed.archivedAt).toBeNull();
    expect(parsed.systemRole).toBeNull();
    expect(parsed.hiddenFromGrid).toBe(false);
  });

  it("strips system-managed node lifecycle fields from creation payloads", () => {
    const parsed = createNodeSchema.parse({
      title: "Inbox",
      color: "hsl(210, 80%, 55%)",
      icon: "inbox",
      parentId: null,
      level: 0,
      x: 2,
      y: 3,
      systemRole: "inbox",
      hiddenFromGrid: true,
      archivedAt: 123,
    });

    expect(parsed).not.toHaveProperty("systemRole");
    expect(parsed).not.toHaveProperty("hiddenFromGrid");
    expect(parsed).not.toHaveProperty("archivedAt");
  });

  it("applies defaults for bit and chunk creation payloads", () => {
    const parentId = crypto.randomUUID();
    const bit = createBitSchema.parse({
      title: "Write tests",
      icon: "pen",
      parentId,
      x: 1,
      y: 4,
    });
    const chunk = createChunkSchema.parse({
      title: "Cover the happy path",
      parentId: crypto.randomUUID(),
      order: 0,
    });

    expect(bit).toEqual({
      title: "Write tests",
      description: "",
      icon: "pen",
      deadline: null,
      deadlineAllDay: false,
      priority: null,
      parentId,
      x: 1,
      y: 4,
    });
    expect(chunk).toEqual({
      title: "Cover the happy path",
      description: "",
      time: null,
      timeAllDay: false,
      order: 0,
      parentId: expect.any(String),
    });
  });

  it("strips system-managed bit lifecycle fields from creation payloads", () => {
    const parsed = createBitSchema.parse({
      title: "Write tests",
      icon: "pen",
      parentId: crypto.randomUUID(),
      x: 1,
      y: 4,
      archivedAt: 123,
    });

    expect(parsed).not.toHaveProperty("archivedAt");
  });

  it("accepts node and bit coordinates up to the configured grid bounds", () => {
    const parentId = crypto.randomUUID();

    expect(() =>
      createNodeSchema.parse({
        title: "Inbox",
        color: "hsl(210, 80%, 55%)",
        icon: "inbox",
        parentId: null,
        level: 0,
        x: GRID_COLS - 1,
        y: GRID_ROWS - 1,
      }),
    ).not.toThrow();

    expect(() =>
      createBitSchema.parse({
        title: "Write tests",
        icon: "pen",
        parentId,
        x: GRID_COLS - 1,
        y: GRID_ROWS - 1,
      }),
    ).not.toThrow();
  });

  it("validates scratch breakdown creation payloads and defaults consumedAt", () => {
    const scratchBitId = crypto.randomUUID();

    expect(() =>
      createScratchBreakdownSchema.parse({
        scratchBitId,
        content: "",
        order: 0,
      }),
    ).toThrow();

    expect(() =>
      createScratchBreakdownSchema.parse({
        scratchBitId,
        content: "a".repeat(1001),
        order: 0,
      }),
    ).toThrow();

    expect(() =>
      createScratchBreakdownSchema.parse({
        scratchBitId,
        content: "Plan first pass",
        order: -1,
      }),
    ).toThrow();

    expect(
      createScratchBreakdownSchema.parse({
        scratchBitId,
        content: "Plan first pass",
        order: 0,
      }),
    ).toEqual({
      scratchBitId,
      content: "Plan first pass",
      order: 0,
    });

    expect(
      scratchBreakdownSchema.parse({
        id: crypto.randomUUID(),
        scratchBitId,
        content: "Plan first pass",
        order: 0,
        createdAt: Date.now(),
      }).consumedAt,
    ).toBeNull();
  });
});
