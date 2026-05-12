interface Props { precipProbability: number }

export function RainChanceCard({ precipProbability }: Props) {
  const pct   = Math.round(Math.min(100, Math.max(0, precipProbability)));
  const color = pct > 70 ? "#60a5fa" : pct > 40 ? "#93c5fd" : "#94a3b8";
  const label = pct > 70 ? "Probable" : pct > 40 ? "Posible" : "Improbable";

  return (
    <div
      className="rounded-2xl px-3 py-3 flex flex-col justify-between h-full"
      style={{ background: "rgba(8,20,60,0.68)", border: "1px solid rgba(59,130,246,0.28)", boxShadow: "0 8px 40px rgba(0,0,0,0.60)" }}
    >
      <p className="text-[9px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.55)", letterSpacing: "0.18em" }}>
        Lluvia
      </p>
      <div className="flex items-center gap-2 flex-1">
        <span style={{ fontSize: "32px", fontWeight: 800, fontFamily: "monospace", color, lineHeight: 1 }}>{pct}</span>
        <div className="flex flex-col gap-1">
          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.40)" }}>%</span>
          <span style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 700, color }}>{label}</span>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 9999, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}
