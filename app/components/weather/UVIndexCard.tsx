interface Props { uvIndex: number }

const R = 36, CX = 52, CY = 52, SW = 7, START = 135, SPAN = 270;

function uvMeta(uv: number): { label: string; color: string } {
  if (uv < 3)  return { label: "Low",       color: "#4ade80" };
  if (uv < 6)  return { label: "Moderate",  color: "#fbbf24" };
  if (uv < 8)  return { label: "High",      color: "#fb923c" };
  if (uv < 11) return { label: "Very High", color: "#f87171" };
  return               { label: "Extreme",  color: "#a855f7" };
}

function uvDesc(uv: number): string {
  if (uv < 3)  return "Low risk. Wear sunglasses.";
  if (uv < 6)  return "Moderate risk. Wear SPF 30+.";
  if (uv < 8)  return "High risk. Limit midday sun.";
  if (uv < 11) return "Very high. Extra protection.";
  return               "Extreme. Stay indoors.";
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

export function UVIndexCard({ uvIndex }: Props) {
  const safe = Math.min(11, Math.max(0, uvIndex));
  const { label, color } = uvMeta(safe);
  const fillEnd   = START + (safe / 11) * SPAN;
  const needleRad = ((fillEnd - 90) * Math.PI) / 180;
  const tipX      = CX + 26 * Math.cos(needleRad);
  const tipY      = CY + 26 * Math.sin(needleRad);

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-1 h-full"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.11)" }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        UV Index
      </p>
      <div className="flex flex-col items-center flex-1 justify-center gap-0">
        <svg width="104" height="104" viewBox="0 0 104 104">
          <path d={arc(START, START + SPAN)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} strokeLinecap="round" />
          {safe > 0.01 && (
            <path d={arc(START, fillEnd)} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" opacity="0.9" />
          )}
          <line x1={CX} y1={CY} x2={tipX.toFixed(2)} y2={tipY.toFixed(2)} stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx={CX} cy={CY} r="4" fill={color} />
          <text x={CX} y={CY - 2}  textAnchor="middle" fill="#fff"   fontSize="20" fontFamily="monospace" fontWeight="700">{safe}</text>
          <text x={CX} y={CY + 13} textAnchor="middle" fill={color}  fontSize="8"  fontFamily="monospace" letterSpacing="0.5">{label}</text>
        </svg>
        <p style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)", textAlign: "center", lineHeight: 1.4 }}>
          {uvDesc(safe)}
        </p>
      </div>
    </div>
  );
}
