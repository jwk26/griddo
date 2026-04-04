import { describe, expect, it, vi } from "vitest";
import { gridCollisionDetection } from "./grid-dnd";

const closestCenterMock = vi.hoisted(() => vi.fn());

vi.mock("@dnd-kit/core", () => ({
  closestCenter: closestCenterMock,
}));

describe("gridCollisionDetection", () => {
  it("drops grid cells when a node-drop target is present", () => {
    const args = { collisionRect: null } as never;
    const nodeTarget = { id: "grid-node-drop:target-node" };
    const cellTarget = { id: "grid-cell:root:1:1" };

    closestCenterMock.mockReturnValue([cellTarget, nodeTarget]);

    expect(gridCollisionDetection(args)).toEqual([nodeTarget]);
  });

  it("keeps cell targets when there is no node-drop target", () => {
    const args = { collisionRect: null } as never;
    const cellTarget = { id: "grid-cell:root:1:1" };

    closestCenterMock.mockReturnValue([cellTarget]);

    expect(gridCollisionDetection(args)).toEqual([cellTarget]);
  });
});
