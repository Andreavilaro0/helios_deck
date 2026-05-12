interface Props { pressure: number }

const R = 36, CX = 52, CY = 52, SW = 7, START = 135, SPAN = 270;
const P_MIN = 970, P_MAX = 1040;

function pressMeta(hpa: number): { label: string; sublabel: string; color: string } {
  if (hpa > 1022) return { label: "HIGH",   sublabel: "High pressure",  color: "#60a5fa" };
  if (hpa < 1005) return { label: "LOW",    sublabel: "Low pressure",   color: "#f87171" };
  return               { label: "STEADY", sublabel: "Normal range",   color: "#4ade80" };
}

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

export function PressureCard({ pressure }: Props) {
  const clamped   = Math.min(P_MAX, Math.max(P_MIN, pressure));
  const { label, sublabel, color } = pressMeta(pressure);
  const fillFrac  = (clamped - P_MIN) / (P_MAX - P_MIN);
  const fillEnd   = START + fillFrac * SPAN;
  const needleRad = ((fillEnd - 90) * Math.PI) / 180;
  const tipX      = CX + 26 * Math.cos(needleRad);
  const tipY      = CY + 26 * Math.sin(needleRad);

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-1 h-full"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.11)" }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Pressure
      </p>
      <div className="flex flex-col items-center flex-1 justify-center gap-0">
        <svg width="104" height="104" viewBox="0 0 104 104">
          <path d={arc(START, START + SPAN)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} strokeLinecap="round" />
          <path d={arc(START, fillEnd)}      fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" opacity="0.9" />
          <line x1={CX} y1={CY} x2={tipX.toFixed(2)} y2={tipY.toFixed(2)} stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx={CX} cy={CY} r="4" fill={color} />
          <text x={CX} y={CY - 4}  textAnchor="middle" fill="#fff"  fontSize="15" fontFamily="monospace" fontWeight="700">{pressure}</text>
          <text x={CX} y={CY + 9}  textAnchor="middle" fill="rgba(255,255,255,0.40)" fontSize="8" fontFamily="monospace">hPa</text>
          <text x={CX} y={CY + 20} textAnchor="middle" fill={color} fontSize="8"  fontFamily="monospace" letterSpacing="0.5">{label}</text>
        </svg>
        <p style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)", textAlign: "center" }}>
          {sublabel}
        </p>
      </div>
    </div>
  );
}
