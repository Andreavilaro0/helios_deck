interface Props {
  kp: number;
  sunset: string;
  sunrise: string;
  minutesToSunset: number | null;
}

export function AuroraSunsetCard({ kp, sunset, sunrise, minutesToSunset }: Props) {
  const auroraThreshold = 5;
  const canSeek = kp >= auroraThreshold;
  const kpColor = canSeek ? "#f87171" : "#4ade80";

  const hours   = minutesToSunset != null ? Math.floor(minutesToSunset / 60) : null;
  const minutes = minutesToSunset != null ? minutesToSunset % 60 : null;
  const countdown = hours != null && minutes != null
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : "—";

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 h-full"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.11)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Aurora &amp; Sunset
      </p>

      <div className="flex flex-col gap-1">
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
          AURORA Kp
        </span>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#fff" }}>
            {kp.toFixed(1)}
          </span>
          <div className="flex flex-col">
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
              Min: {auroraThreshold}.0
            </span>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: kpColor, fontWeight: 600 }}>
              {canSeek ? "VISIBLE" : "NOT VISIBLE"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <div className="flex flex-col gap-1">
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
          SUNSET
        </span>
        <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#fff" }}>
          {sunset}
        </span>
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
          {minutesToSunset != null ? `in ${countdown}` : "has passed"}
        </span>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <div className="flex items-center justify-between">
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>Sunrise</span>
        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.60)", fontWeight: 600 }}>{sunrise}</span>
      </div>
    </div>
  );
}
