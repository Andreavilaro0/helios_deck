import type { SignalRecord } from "~/types/signal";

interface Props {
  kp: number;
  kpHistory: SignalRecord[];
}

function auroraChance(kp: number): number {
  if (kp >= 8) return 95;
  if (kp >= 7) return 85;
  if (kp >= 6) return 70;
  if (kp >= 5) return 55;
  if (kp >= 4) return 35;
  if (kp >= 3) return 20;
  if (kp >= 2) return 10;
  return 5;
}

function kpCondition(kp: number): string {
  if (kp >= 7) return "Severe storm";
  if (kp >= 6) return "Strong storm";
  if (kp >= 5) return "Moderate storm";
  if (kp >= 4) return "Active";
  if (kp >= 3) return "Unsettled";
  if (kp >= 1) return "Quiet conditions";
  return "Very quiet";
}

function overallLevel(kp: number): { label: string; color: string } {
  if (kp >= 5) return { label: "HIGH",     color: "#f87171" };
  if (kp >= 3) return { label: "MODERATE", color: "#fbbf24" };
  return             { label: "LOW",       color: "#4ade80" };
}

export function SpaceWeatherImpactCard({ kp, kpHistory }: Props) {
  const { label, color } = overallLevel(kp);
  const chance    = auroraChance(kp);
  const condition = kpCondition(kp);

  // Build mini sparkline from recent kpHistory
  const pts = kpHistory.slice(-24).map((r) =>
    typeof r.value === "number" ? r.value : 0
  );
  const maxPt = Math.max(9, ...pts);

  const CHART_W = 130, CHART_H = 28;
  const sparkPoints = pts.map((v, i) => {
    const x = (i / (pts.length - 1 || 1)) * CHART_W;
    const y = CHART_H - (v / maxPt) * CHART_H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-2 h-full"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.11)" }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Space Weather
      </p>

      {/* Mini aurora sparkline */}
      {pts.length > 1 && (
        <div style={{ height: CHART_H, position: "relative", overflow: "hidden" }}>
          <svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="aurora-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
              </linearGradient>
            </defs>
            {pts.length > 1 && (
              <>
                <polygon
                  points={`0,${CHART_H} ${sparkPoints} ${CHART_W},${CHART_H}`}
                  fill="url(#aurora-grad)"
                />
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
              </>
            )}
          </svg>
        </div>
      )}

      {/* Status */}
      <div className="flex flex-col gap-0.5 flex-1 justify-end">
        <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color, lineHeight: 1 }}>
          {label}
        </span>
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.40)" }}>
          Aurora chance: {chance}%
        </span>
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)" }}>
          Kp {kp.toFixed(1)} · {condition}
        </span>
      </div>
    </div>
  );
}
