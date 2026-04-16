import { describe, expect, it } from "vitest";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";
import {
  BREADCRUMB_ZONE_COLS,
  BREADCRUMB_ZONE_ROWS,
  getStaticBlockedCells,
  isCellBlocked,
  rectToBlockedCells,
} from "@/lib/utils/breadcrumb-zone";

function createGridMetrics(
  clusterRect: DOMRect,
  containerRect = new DOMRect(0, 0, 1936, 964),
) {
  return {
    containerRect,
    clusterRect,
    cols: GRID_COLS,
    rows: GRID_ROWS,
    gap: 8,
  };
}

describe("rectToBlockedCells", () => {
  it("blocks only the first cell when the cluster stays inside the first column and row", () => {
    const blocked = rectToBlockedCells(createGridMetrics(new DOMRect(0, 0, 90, 50)));

    expect(blocked).toEqual(new Set(["0,0"]));
  });

  it("maps the cluster relative to the container inset instead of viewport coordinates", () => {
    const containerRect = new DOMRect(50, 100, 1936, 964);
    const clusterRect = new DOMRect(62, 112, 90, 50);

    const blocked = rectToBlockedCells(createGridMetrics(clusterRect, containerRect));

    expect(blocked).toEqual(new Set(["0,0"]));
  });

  it("blocks both columns when the cluster width extends into the second column", () => {
    const containerRect = new DOMRect(50, 100, 1936, 964);
    const clusterRect = new DOMRect(62, 112, 130, 50);

    const blocked = rectToBlockedCells(createGridMetrics(clusterRect, containerRect));

    expect(blocked).toEqual(new Set(["0,0", "1,0"]));
  });

  it("returns no blocked cells for an empty cluster", () => {
    const blocked = rectToBlockedCells(createGridMetrics(new DOMRect(0, 0, 0, 0)));

    expect(blocked).toEqual(new Set());
  });
});

describe("isCellBlocked", () => {
  it("returns true only for blocked keys", () => {
    const blocked = new Set(["0,0", "1,0"]);

    expect(isCellBlocked(0, 0, blocked)).toBe(true);
    expect(isCellBlocked(2, 2, blocked)).toBe(false);
  });
});

describe("getStaticBlockedCells", () => {
  it("returns the conservative top-left breadcrumb zone and stays within grid bounds", () => {
    const blocked = getStaticBlockedCells();

    expect(blocked.size).toBe(BREADCRUMB_ZONE_COLS * BREADCRUMB_ZONE_ROWS);

    for (const key of blocked) {
      const [x, y] = key.split(",").map(Number);

      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(GRID_COLS);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(GRID_ROWS);
    }

    expect(blocked).toContain("0,0");
    expect(blocked).toContain("2,1");
    expect(blocked).not.toContain("3,0");
    expect(blocked).not.toContain("0,2");
  });
});
