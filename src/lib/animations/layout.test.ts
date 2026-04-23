import { describe, expect, it } from "vitest";
import * as layoutAnimations from "./layout";

describe("layout animations", () => {
  it("does not expose obsolete sidebar width variants", () => {
    expect(layoutAnimations).not.toHaveProperty("sidebarVariants");
  });

  it("keeps sidebar drag target color out of Motion interpolation", () => {
    expect(layoutAnimations.sidebarDragTargetActive).toEqual({
      scale: 1.2,
      boxShadow: "0 0 20px hsl(var(--primary) / 0.45)",
    });
    expect(layoutAnimations.sidebarDragTargetRest).toEqual({
      scale: 1,
      boxShadow: "0 0 0px hsl(var(--primary) / 0)",
    });
  });
});
