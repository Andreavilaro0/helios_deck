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

export function SunriseSunsetCard({ sunrise, sunset, minutesToSunset, daylightMinutes }: Props) {
  const dh = Math.floor(daylightMinutes / 60);
  const dm = daylightMinutes % 60;

  const hours   = minutesToSunset != null ? Math.floor(minutesToSunset / 60) : null;
  const mins    = minutesToSunset != null ? minutesToSunset % 60 : null;
  const countdown = hours != null && mins != null
    ? `${hours}h ${String(mins).padStart(2, "0")}m until sunset`
    : "Sunset passed";

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-2 h-full"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.11)" }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Sunrise &amp; Sunset
      </p>

      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Sunrise icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="8" r="3" fill="#fbbf24" />
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.42 1.42M9.65 9.65l1.42 1.42M2.93 11.07l1.42-1.42M9.65 4.35l1.42-1.42" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
              <path d="M2 12h10" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
              <path d="M4 10.5C4 9.12 5.12 8 7 8s3 1.12 3 2.5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" fill="none" />
            </svg>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>Sunrise</span>
          </div>
          <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 700, color: "#fbbf24" }}>
            {to12h(sunrise)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Sunset icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="6" r="3" fill="#f97316" opacity="0.7" />
              <path d="M7 1v2M1 7h2M11 7h2M2.93 2.93l1.42 1.42M9.65 4.35l1.42-1.42" stroke="#f97316" strokeWidth="1" strokeLinecap="round" />
              <path d="M2 12h10" stroke="#f97316" strokeWidth="1" strokeLinecap="round" />
              <path d="M4 10C4 8.62 5.12 8 7 8s3 .62 3 2" stroke="#f97316" strokeWidth="1" strokeLinecap="round" fill="none" />
            </svg>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>Sunset</span>
          </div>
          <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 700, color: "#f97316" }}>
            {to12h(sunset)}
          </span>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

        <div className="flex items-center justify-between">
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)" }}>Daylight</span>
          <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
            {dh}h {String(dm).padStart(2, "0")}m
          </span>
        </div>

        <p style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.22)", lineHeight: 1.3 }}>
          {countdown}
        </p>
      </div>
    </div>
  );
}
