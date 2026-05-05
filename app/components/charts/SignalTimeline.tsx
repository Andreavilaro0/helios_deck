import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {
  normalize,
  toLogScale,
  toPoints,
  smoothLinePath,
  closedAreaPath,
} from "./chartUtils";

export interface TimelineSignal {
  data: number[];
  color: string;
  label: string;
  unit: string;
  logScale?: boolean;
  gradientId: string;
}

interface SignalTimelineProps {
  signals: TimelineSignal[];
}

const VB_W = 1000;
const VB_H = 160;
const PAD_X = 4;
const PAD_T = 16;
const PAD_B = 28;
const CHART_H = VB_H - PAD_T - PAD_B;

function prepareSignal(sig: TimelineSignal) {
  if (sig.data.length < 2) return null;
  const scaled = sig.logScale ? toLogScale(sig.data) : sig.data;
  const norm = normalize(scaled);
  const pts = toPoints(norm, VB_W, VB_H - PAD_B, PAD_X, PAD_T);
  const line = smoothLinePath(pts);
  const area = closedAreaPath(line, pts, VB_H - PAD_B);
  return { pts, line, area };
}

export function SignalTimeline({ signals }: SignalTimelineProps): ReactNode {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const maxLen = Math.max(...signals.map((s) => s.data.length), 0);
  if (maxLen < 2) return null;

  const prepared = useMemo(() => signals.map(prepareSignal), [signals]);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (maxLen - 1));
    setHoverIdx(Math.max(0, Math.min(maxLen - 1, idx)));
  }

  const hoverX =
    hoverIdx !== null
      ? PAD_X + (hoverIdx / Math.max(maxLen - 1, 1)) * (VB_W - 2 * PAD_X)
      : null;

  // X-axis tick positions: start, 25%, 50%, 75%, end
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    x: PAD_X + t * (VB_W - 2 * PAD_X),
    label: t === 1 ? "now" : `${Math.round((1 - t) * maxLen)}pts ago`,
  }));

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: "var(--dash-card-bg)",
        borderColor: "var(--dash-card-border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase">
          Signal History
        </p>
        {/* Legend */}
        <div className="flex items-center gap-4">
          {signals.map((sig) => (
            <div key={sig.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: sig.color }}
              />
              <span className="text-xs font-mono text-white/40">{sig.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: "140px", display: "block", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          {signals.map((sig) => (
            <linearGradient
              key={sig.gradientId}
              id={sig.gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={sig.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={sig.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = PAD_T + (1 - t) * CHART_H;
          return (
            <line
              key={t}
              x1={PAD_X}
              y1={y}
              x2={VB_W - PAD_X}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fills */}
        {signals.map((sig, i) => {
          const p = prepared[i];
          if (!p) return null;
          return (
            <path
              key={`area-${sig.label}`}
              d={p.area}
              fill={`url(#${sig.gradientId})`}
            />
          );
        })}

        {/* Lines */}
        {signals.map((sig, i) => {
          const p = prepared[i];
          if (!p) return null;
          return (
            <path
              key={`line-${sig.label}`}
              d={p.line}
              fill="none"
              stroke={sig.color}
              strokeWidth="1.5"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="0"
              style={{ animation: `drawLine 1.4s ease both`, strokeLinecap: "round" }}
            />
          );
        })}

        {/* Hover crosshair */}
        {hoverX !== null && (
          <>
            <line
              x1={hoverX}
              y1={PAD_T}
              x2={hoverX}
              y2={VB_H - PAD_B}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            {signals.map((sig, i) => {
              const p = prepared[i];
              if (!p || hoverIdx === null) return null;
              const normIdx = Math.min(hoverIdx, p.pts.length - 1);
              const [cx, cy] = p.pts[normIdx];
              return (
                <circle
                  key={`dot-${sig.label}`}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill={sig.color}
                  stroke="rgba(8,12,20,0.9)"
                  strokeWidth="1.5"
                  style={{ filter: `drop-shadow(0 0 5px ${sig.color})` }}
                />
              );
            })}

            {/* Tooltip box */}
            {hoverIdx !== null && (
              <g>
                {(() => {
                  const boxX = Math.min(hoverX + 8, VB_W - 180);
                  const boxY = PAD_T;
                  const lineH = 16;
                  const boxH = signals.length * lineH + 12;
                  return (
                    <>
                      <rect
                        x={boxX}
                        y={boxY}
                        width="175"
                        height={boxH}
                        rx="6"
                        fill="rgba(8,12,20,0.92)"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />
                      {signals.map((sig, i) => {
                        const rawVal = sig.data[Math.min(hoverIdx, sig.data.length - 1)];
                        const display =
                          sig.logScale
                            ? rawVal?.toExponential(2) ?? "—"
                            : typeof rawVal === "number"
                            ? rawVal.toFixed(2)
                            : "—";
                        return (
                          <text
                            key={sig.label}
                            x={boxX + 10}
                            y={boxY + 10 + i * lineH + 8}
                            fill={sig.color}
                            fontSize="11"
                            fontFamily="monospace"
                          >
                            {sig.label}: {display} {sig.unit}
                          </text>
                        );
                      })}
                    </>
                  );
                })()}
              </g>
            )}
          </>
        )}

        {/* X-axis labels */}
        {ticks.map((tick) => (
          <text
            key={tick.x}
            x={tick.x}
            y={VB_H - 6}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)"
            fontSize="9"
            fontFamily="monospace"
          >
            {tick.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
