interface Props { currentKp: number }

function kpColor(kp: number) {
  if (kp >= 5) return "#f87171";
  if (kp >= 4) return "#fbbf24";
  return "#818cf8";
}

function kpLabel(kp: number) {
  if (kp >= 5) return "TORMENTA";
  if (kp >= 4) return "ACTIVO";
  return "CALMA";
}

export function KpScaleInstrument({ currentKp }: Props) {
  const kp      = Math.min(9, Math.max(0, currentKp));
  const pct     = (kp / 9) * 100;
  const color   = kpColor(kp);
  const label   = kpLabel(kp);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between h-full"
      style={{ background: "rgba(249,243,250,0.03)", border: "1px solid rgba(249,243,250,0.09)" }}
    >
      {/* Header */}
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Escala Geomagnética
      </p>

      {/* Value + label */}
      <div className="flex flex-col gap-1">
        <span style={{ fontSize: 52, fontWeight: 700, fontFamily: "monospace", color: "#fff", lineHeight: 1 }}>
          {kp.toFixed(1)}
        </span>
        <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.18em", color }}>
          {label}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col gap-2">
        {/* Bar */}
        <div className="relative w-full" style={{ height: 10, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,0.07)" }}>
          {/* Zone backgrounds */}
          <div style={{ position: "absolute", left: 0, width: "44.4%", height: "100%", background: "#818cf8", opacity: 0.20 }} />
          <div style={{ position: "absolute", left: "44.4%", width: "11.1%", height: "100%", background: "#fbbf24", opacity: 0.30 }} />
          <div style={{ position: "absolute", left: "55.5%", width: "44.5%", height: "100%", background: "#f87171", opacity: 0.20 }} />
          {/* Fill */}
          <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
        </div>

        {/* Marker line (sits outside overflow:hidden bar) */}
        <div className="relative w-full" style={{ height: 0 }}>
          <div style={{
            position: "absolute",
            left: `${pct}%`,
            top: -14,
            transform: "translateX(-50%)",
            width: 2,
            height: 14,
            background: "#fff",
            opacity: 0.7,
            borderRadius: 1,
          }} />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between" style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>
          <span>0</span>
          <span style={{ color: "rgba(129,140,248,0.6)" }}>CALMA</span>
          <span style={{ color: "rgba(251,191,36,0.7)" }}>ACT.</span>
          <span style={{ color: "rgba(248,113,113,0.6)" }}>TORM.</span>
          <span>9</span>
        </div>
      </div>
    </div>
  );
}
