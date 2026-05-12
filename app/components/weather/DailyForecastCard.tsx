import type { WeatherData } from "~/types/weather";
import { wmoIcon, wmoLabel } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  daily: WeatherData["daily"];
}

const DAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

export function DailyForecastCard({ daily }: Props) {
  const todayIdx = new Date(daily[0].date + "T00:00:00Z").getUTCDay();

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-1.5 h-full overflow-hidden"
      style={{
        background: "rgba(8,20,60,0.60)",
        border: "1px solid rgba(59,130,246,0.20)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
      }}
    >
      <p
        className="text-[9px] font-mono uppercase tracking-widest"
        style={{
          color: "rgba(148,163,184,0.55)",
          letterSpacing: "0.18em",
        }}
      >
        Pronóstico 4 días
      </p>
      <div className="flex flex-col gap-1 flex-1">
        {daily.slice(1, 5).map((d, i) => {
          const dow = DAYS[(todayIdx + i + 1) % 7];
          const isNxt = i === 0;
          return (
            <div
              key={d.date}
              className="flex items-center gap-2 rounded-xl px-2 py-1 flex-1"
              style={{
                transition: "background 0.18s ease, border-color 0.18s ease",
                background: isNxt
                  ? "rgba(59,130,246,0.22)"
                  : "rgba(5,15,45,0.52)",
                border: isNxt
                  ? "1px solid rgba(59,130,246,0.50)"
                  : "1px solid rgba(59,130,246,0.14)",
                boxShadow: isNxt
                  ? "0 0 28px rgba(59,130,246,0.14) inset, 0 2px 12px rgba(0,0,0,0.40)"
                  : "0 2px 8px rgba(0,0,0,0.30)",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: isNxt
                    ? "#60a5fa"
                    : "rgba(148,163,184,0.70)",
                  minWidth: 34,
                }}
              >
                {dow}
              </span>
              <WeatherIcon
                type={wmoIcon(d.weatherCode)}
                size={22}
                color={isNxt ? "rgba(147,197,253,0.90)" : "rgba(148,163,184,0.85)"}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: isNxt ? "rgba(224,242,255,0.80)" : "rgba(148,163,184,0.65)",
                  flex: 1,
                }}
              >
                {wmoLabel(d.weatherCode)}
              </span>
              <div className="flex flex-col items-end gap-0.5">
                <span style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: 700, color: "#e2f0ff" }}>
                  {d.tempMax}°
                  <span style={{ color: "rgba(100,130,180,0.55)", marginLeft: 4 }}>{d.tempMin}°</span>
                </span>
                {d.precipProbMax > 0 && (
                  <div
                    className="flex items-center gap-1 rounded-full"
                    style={{
                      padding: "1px 6px 1px 5px",
                      background: "rgba(56,189,248,0.12)",
                      border: "1px solid rgba(56,189,248,0.30)",
                    }}
                  >
                    <svg width="6" height="8" viewBox="0 0 8 10" fill="#38bdf8">
                      <path d="M4 0 C4 0 0 5.5 0 7a4 4 0 008 0C8 5.5 4 0 4 0z" />
                    </svg>
                    <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#38bdf8", fontWeight: 600 }}>
                      {d.precipProbMax}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
