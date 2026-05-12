interface Props { uvIndex: number }

const R = 22, CX = 32, CY = 32, START = 135, SPAN = 270;

function uvMeta(uv: number): { label: string; color: string } {
  if (uv < 3)  return { label: "Bajo",      color: "#4ade80" };
  if (uv < 6)  return { label: "Moderado",  color: "#fbbf24" };
  if (uv < 8)  return { label: "Alto",      color: "#fb923c" };
  if (uv < 11) return { label: "Muy Alto",  color: "#f87171" };
  return               { label: "Extremo",  color: "#a855f7" };
}

function xy(deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function arc(a1: number, a2: number): string {
  const s = xy(a1); const e = xy(a2);
  const span = ((a2 - a1) + 360) % 360;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function UVIndexCard({ uvIndex }: Props) {
  const safe = Math.min(11, Math.max(0, uvIndex));
  const { label, color } = uvMeta(safe);
  const fillEnd   = START + (safe / 11) * SPAN;
  const needleRad = ((fillEnd - 90) * Math.PI) / 180;
  const tipX      = CX + 16 * Math.cos(needleRad);
  const tipY      = CY + 16 * Math.sin(needleRad);

  return (
    <div
      className="rounded-2xl px-3 py-2 flex flex-col justify-between h-full"
      style={{ background: "rgba(8,20,60,0.68)", border: "1px solid rgba(59,130,246,0.28)", boxShadow: "0 8px 40px rgba(0,0,0,0.60)" }}
    >
      <p className="text-[9px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.55)", letterSpacing: "0.18em" }}>
        Índice UV
      </p>
      <div className="flex items-center gap-2 flex-1 justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <path d={arc(START, START + SPAN)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} strokeLinecap="round" />
          {safe > 0.01 && (
            <path d={arc(START, fillEnd)} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
          )}
          <line x1={CX} y1={CY} x2={tipX.toFixed(2)} y2={tipY.toFixed(2)} stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx={CX} cy={CY} r="3.5" fill={color} />
          <text x={CX} y={CY + 5} textAnchor="middle" fill="#ffffff" fontSize="14" fontFamily="monospace" fontWeight="800">{safe}</text>
        </svg>
        <div className="flex flex-col gap-0.5">
          <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "monospace", color }}>{label}</span>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(148,163,184,0.55)" }}>Índice UV</span>
        </div>
      </div>
    </div>
  );
}
