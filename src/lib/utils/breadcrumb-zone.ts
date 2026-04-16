export const BREADCRUMB_ZONE_COLS = 3;
export const BREADCRUMB_ZONE_ROWS = 2;

export type GridMetrics = {
  containerRect: DOMRect;
  clusterRect: DOMRect;
  cols: number;
  rows: number;
  gap: number;
};

export function rectToBlockedCells(metrics: GridMetrics): Set<string> {
  const { clusterRect, cols, containerRect, gap, rows } = metrics;

  if (
    cols <= 0 ||
    rows <= 0 ||
    containerRect.width <= 0 ||
    containerRect.height <= 0 ||
    clusterRect.width <= 0 ||
    clusterRect.height <= 0
  ) {
    return new Set();
  }

  const totalGapX = gap * (cols - 1);
  const totalGapY = gap * (rows - 1);
  const cellW = (containerRect.width - totalGapX) / cols;
  const cellH = (containerRect.height - totalGapY) / rows;

  if (cellW <= 0 || cellH <= 0) {
    return new Set();
  }

  const clusterLeft = clusterRect.left - containerRect.left;
  const clusterTop = clusterRect.top - containerRect.top;
  const clusterRight = clusterLeft + clusterRect.width;
  const clusterBottom = clusterTop + clusterRect.height;
  const blocked = new Set<string>();

  for (let y = 0; y < rows; y += 1) {
    const cellTop = y * (cellH + gap);
    const cellBottom = cellTop + cellH;

    for (let x = 0; x < cols; x += 1) {
      const cellLeft = x * (cellW + gap);
      const cellRight = cellLeft + cellW;

      if (
        clusterLeft < cellRight &&
        clusterRight > cellLeft &&
        clusterTop < cellBottom &&
        clusterBottom > cellTop
      ) {
        blocked.add(`${x},${y}`);
      }
    }
  }

  return blocked;
}

export function isCellBlocked(
  x: number,
  y: number,
  blocked: Set<string>,
): boolean {
  return blocked.has(`${x},${y}`);
}

export function getStaticBlockedCells(): Set<string> {
  const blocked = new Set<string>();

  for (let y = 0; y < BREADCRUMB_ZONE_ROWS; y += 1) {
    for (let x = 0; x < BREADCRUMB_ZONE_COLS; x += 1) {
      blocked.add(`${x},${y}`);
    }
  }

  return blocked;
}
