/** Normalizes an array to [0, 1]. Handles flat arrays (range = 0). */
export function normalize(data: number[]): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v) => (v - min) / range);
}

/** Applies log10 scale — useful for X-ray flux (spans many orders of magnitude). */
export function toLogScale(data: number[]): number[] {
  return data.map((v) => (v > 0 ? Math.log10(v) : -10));
}

/** Converts normalized values to SVG [x, y] points within a viewBox. */
export function toPoints(
  norm: number[],
  w: number,
  h: number,
  padX = 4,
  padY = 6
): [number, number][] {
  const n = norm.length;
  return norm.map((v, i) => [
    padX + (i / Math.max(n - 1, 1)) * (w - 2 * padX),
    padY + (1 - v) * (h - 2 * padY),
  ]);
}

/** Builds a smooth cubic-bezier SVG path string from points. */
export function smoothLinePath(pts: [number, number][]): string {
  return pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
    const [px, py] = pts[i - 1];
    const c1x = (px + (x - px) / 3).toFixed(1);
    const c2x = (px + (2 * (x - px)) / 3).toFixed(1);
    return `${acc} C${c1x},${py.toFixed(1)} ${c2x},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, "");
}

/** Closes a line path into a filled area by adding bottom corners. */
export function closedAreaPath(
  linePath: string,
  pts: [number, number][],
  bottom: number
): string {
  if (!linePath || pts.length < 2) return "";
  const [lastX] = pts[pts.length - 1];
  const [firstX] = pts[0];
  return `${linePath} L${lastX.toFixed(1)},${bottom} L${firstX.toFixed(1)},${bottom} Z`;
}
