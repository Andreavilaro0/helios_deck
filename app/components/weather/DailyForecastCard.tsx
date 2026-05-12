import type { WeatherData } from "~/types/weather";
import { wmoIcon, wmoLabel } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  daily: WeatherData["daily"];
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function DailyForecastCard({ daily }: Props) {
  const todayIdx = new Date(daily[0].date + "T00:00:00Z").getUTCDay();

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2 h-full"
      style={{
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.11)",
      }}
    >
      <p
        className="text-[9px] font-mono uppercase tracking-widest"
        style={{
          color: "rgba(255,255,255,0.28)",
        }}
      >
        5-Day Forecast
      </p>
      <div className="flex flex-col gap-2 flex-1">
        {daily.slice(1, 6).map((d, i) => {
          const dow = DAYS[(todayIdx + i + 1) % 7];
          const isNxt = i === 0;
          return (
            <div
              key={d.date}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 flex-1"
              style={{
                background: isNxt
                  ? "rgba(59,130,246,0.10)"
                  : "rgba(255,255,255,0.03)",
                border: isNxt
                  ? "1px solid rgba(59,130,246,0.25)"
                  : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: isNxt
                    ? "#93c5fd"
                    : "rgba(255,255,255,0.45)",
                  minWidth: 30,
                }}
              >
                {dow}
              </span>
              <WeatherIcon
                type={wmoIcon(d.weatherCode)}
                size={22}
                color="rgba(148,163,184,0.8)"
              />
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  flex: 1,
                }}
              >
                {wmoLabel(d.weatherCode)}
              </span>
              <div className="flex flex-col items-end gap-0.5">
                <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
                  {d.tempMax}°
                  <span style={{ color: "rgba(255,255,255,0.30)", marginLeft: 4 }}>{d.tempMin}°</span>
                </span>
                {d.precipProbMax > 0 && (
                  <div className="flex items-center gap-1">
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="#60a5fa">
                      <path d="M4 0 C4 0 0 5.5 0 7a4 4 0 008 0C8 5.5 4 0 4 0z" />
                    </svg>
                    <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#60a5fa" }}>
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
