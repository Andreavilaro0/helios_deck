import type { SignalRecord } from "~/types/signal";

interface Props {
  history: SignalRecord[];
  currentKp: number;
}

const W = 200, H = 80;
const THRESHOLD = 5;

export function SolarAuroraChart({ history, currentKp }: Props) {
  const isActive = currentKp >= THRESHOLD;
  const statusColor = isActive ? "#f87171" : "#4ade80";
  const statusLabel = isActive ? "ACTIVE" : "INACTIVE";

  const pts = history.slice(-24).filter((r) => typeof r.value === "number");
  const maxKp = Math.max(9, ...pts.map((r) => r.value as number));

  const points = pts.map((r, i) => {
    const x = pts.length < 2 ? W / 2 : (i / (pts.length - 1)) * W;
    const y = H - ((r.value as number) / maxKp) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const thresholdY = H - (THRESHOLD / maxKp) * H;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
          Solar Aurora
        </p>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: `0 0 5px ${statusColor}`, display: "inline-block" }} />
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: statusColor, fontWeight: 700, letterSpacing: "0.1em" }}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 80 }}>
        {pts.length > 1 ? (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
            <line x1="0" y1={thresholdY.toFixed(1)} x2={W} y2={thresholdY.toFixed(1)}
              stroke="rgba(248,113,113,0.35)" strokeWidth="1" strokeDasharray="4 3" />
            <linearGradient id="aurora-fill" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor={statusColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={statusColor} stopOpacity="0.02" />
            </linearGradient>
            <polygon points={`0,${H} ${points} ${W},${H}`} fill="url(#aurora-fill)" />
            <polyline points={points} fill="none" stroke={statusColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>No history</span>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>24h</span>
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>now</span>
      </div>
    </div>
  );
}
