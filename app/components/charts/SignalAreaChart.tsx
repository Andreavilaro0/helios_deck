import type { ReactNode } from "react";
import {
  normalize,
  toLogScale,
  toPoints,
  smoothLinePath,
  closedAreaPath,
} from "./chartUtils";

interface SignalAreaChartProps {
  data: number[];
  color: string;
  /** Use log10 scale — recommended for X-ray flux */
  logScale?: boolean;
  height?: number;
  gradientId: string;
}

const VB_W = 400;

export function SignalAreaChart({
  data,
  color,
  logScale,
  height = 56,
  gradientId,
}: SignalAreaChartProps): ReactNode {
  if (data.length < 2) return null;

  const scaled = logScale ? toLogScale(data) : data;
  const norm = normalize(scaled);
  const pts = toPoints(norm, VB_W, height, 2, 4);
  const line = smoothLinePath(pts);
  const area = closedAreaPath(line, pts, height - 4);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={area} fill={`url(#${gradientId})`} />

      {/* Line stroke */}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="0"
        style={{
          animation: "drawLine 1.2s ease both",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      />

      {/* Latest value dot */}
      {pts.length > 0 && (
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="3"
          fill={color}
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      )}
    </svg>
  );
}
