interface Props { precipProbability: number }

export function RainChanceCard({ precipProbability }: Props) {
  const pct   = Math.round(Math.min(100, Math.max(0, precipProbability)));
  const color = pct > 70 ? "#60a5fa" : pct > 40 ? "#93c5fd" : "#94a3b8";
  const label = pct > 70 ? "Likely" : pct > 40 ? "Possible" : "Unlikely";

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 h-full"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.11)" }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Rain Chance
      </p>

      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-baseline gap-0.5">
          <span style={{ fontSize: "40px", fontWeight: 700, fontFamily: "monospace", color, lineHeight: 1 }}>
            {pct}
          </span>
          <span style={{ fontSize: "18px", fontFamily: "monospace", color: "rgba(255,255,255,0.40)" }}>%</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 9999,
              transition: "width 0.4s ease" }} />
          </div>
          <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 600, color }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
