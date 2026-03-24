import { describe, expect, it } from "vitest";
import {
  createBitSchema,
  createChunkSchema,
  createNodeSchema,
  nodeSchema,
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
      description: "",
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
        description: "",
        color: "hsl(210, 80%, 55%)",
        icon: "inbox",
        deadline: null,
        deadlineAllDay: false,
        mtime: Date.now(),
        createdAt: Date.now(),
        parentId: null,
        level: 0,
        x: 12,
        y: 0,
        deletedAt: null,
      }),
    ).toThrow();
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
});
