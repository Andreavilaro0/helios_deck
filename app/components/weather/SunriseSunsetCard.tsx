interface Props {
  sunrise: string;
  sunset: string;
  minutesToSunset: number | null;
  daylightMinutes: number;
}

function to12h(hhmm: string): string {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12  = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function SunriseSunsetCard({ sunrise, sunset, daylightMinutes }: Props) {
  const dh = Math.floor(daylightMinutes / 60);
  const dm = daylightMinutes % 60;

  return (
    <div
      className="rounded-2xl px-3 py-3 flex flex-col justify-between h-full"
      style={{ background: "rgba(8,20,60,0.68)", border: "1px solid rgba(59,130,246,0.28)", boxShadow: "0 8px 40px rgba(0,0,0,0.60)" }}
    >
      <p className="text-[9px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.55)", letterSpacing: "0.18em" }}>
        Sol
      </p>
      <div className="flex flex-col gap-1 flex-1 justify-center">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#fbbf24" }}>▲ Amanecer</span>
          <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700, color: "#fbbf24" }}>{to12h(sunrise)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#f97316" }}>▼ Atardecer</span>
          <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700, color: "#f97316" }}>{to12h(sunset)}</span>
        </div>
        <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(59,130,246,0.12)", paddingTop: 3 }}>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(148,163,184,0.55)" }}>Luz del día</span>
          <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>{dh}h {String(dm).padStart(2,"0")}m</span>
        </div>
      </div>
    </div>
  );
}
