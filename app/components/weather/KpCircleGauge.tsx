interface Props {
  kp: number;
}

const R = 38;
const CX = 56;
const CY = 56;
const SW = 8;
const START = 135;
const SPAN = 270;

function xy(deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function arc(a1: number, a2: number): string {
  const s = xy(a1);
  const e = xy(a2);
  const span = ((a2 - a1) + 360) % 360;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function KpCircleGauge({ kp }: Props) {
  const safe = Math.min(9, Math.max(0, kp));
  const color =
    safe >= 5 ? "#f87171" : safe >= 4 ? "#fbbf24" : "#818cf8";
  const label = safe >= 5 ? "Storm" : safe >= 4 ? "Active" : "Low Kp";
  const fillEnd = START + (safe / 9) * SPAN;

  const needleAngle = START + (safe / 9) * SPAN;
  const needleRad = ((needleAngle - 90) * Math.PI) / 180;
  const needleTipX = CX + 26 * Math.cos(needleRad);
  const needleTipY = CY + 26 * Math.sin(needleRad);

  return (
    <div
      className="rounded-2xl p-3 flex flex-col items-center gap-1"
      style={{
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.11)",
      }}
    >
      <p
        className="text-[9px] font-mono uppercase tracking-widest self-start"
        style={{ color: "rgba(255,255,255,0.28)" }}
      >
        Kp Index
      </p>
      <svg width="112" height="112" viewBox="0 0 112 112">
        <path
          d={arc(START, START + SPAN)}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={SW}
          strokeLinecap="round"
        />
        {safe > 0.01 && (
          <path
            d={arc(START, fillEnd)}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            opacity="0.9"
          />
        )}
        <line
          x1={CX}
          y1={CY}
          x2={needleTipX.toFixed(2)}
          y2={needleTipY.toFixed(2)}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r="4" fill={color} />
        <text
          x={CX}
          y={CY - 2}
          textAnchor="middle"
          fill="#fff"
          fontSize="22"
          fontFamily="monospace"
          fontWeight="700"
        >
          {safe.toFixed(1)}
        </text>
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          fill={color}
          fontSize="9"
          fontFamily="monospace"
          letterSpacing="1"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
