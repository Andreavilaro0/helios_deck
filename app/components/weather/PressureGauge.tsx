interface Props {
  pressure: number;
}

const R = 38;
const CX = 56;
const CY = 56;
const SW = 8;
const MIN_P = 960;
const MAX_P = 1040;

function pressureArc(pressure: number): string {
  const START = 135;
  const SPAN = 270;
  const pct = Math.min(1, Math.max(0, (pressure - MIN_P) / (MAX_P - MIN_P)));
  const endDeg = START + pct * SPAN;
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  };
  const s = toXY(START);
  const e = toXY(endDeg);
  const span = pct * SPAN;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

function trackArc(): string {
  const START = 135;
  const SPAN = 270;
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  };
  const s = toXY(START);
  const e = toXY(START + SPAN);
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 1 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function PressureGauge({ pressure }: Props) {
  return (
    <div
      className="rounded-2xl p-3 flex flex-col items-center gap-1"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        className="text-[9px] font-mono uppercase tracking-widest self-start"
        style={{ color: "rgba(255,255,255,0.28)" }}
      >
        Pressure
      </p>
      <svg width="112" height="112" viewBox="0 0 112 112">
        <path
          d={trackArc()}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={SW}
          strokeLinecap="round"
        />
        <path
          d={pressureArc(pressure)}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={SW}
          strokeLinecap="round"
          opacity="0.9"
        />
        <text
          x={CX}
          y={CY - 2}
          textAnchor="middle"
          fill="#fff"
          fontSize="18"
          fontFamily="monospace"
          fontWeight="700"
        >
          {pressure}
        </text>
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          fill="#60a5fa"
          fontSize="9"
          fontFamily="monospace"
          letterSpacing="1"
        >
          hPa
        </text>
      </svg>
    </div>
  );
}
