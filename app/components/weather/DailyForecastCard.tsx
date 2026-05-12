import type { WeatherData } from "~/services/fetchers/open-meteo.server";
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
        4-Day Forecast
      </p>
      <div className="flex flex-col gap-2 flex-1">
        {daily.slice(1, 5).map((d, i) => {
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
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                {d.tempMax}°
                <span
                  style={{
                    color: "rgba(255,255,255,0.30)",
                    marginLeft: 4,
                  }}
                >
                  {d.tempMin}°
                </span>
              </span>
              <div style={{ opacity: 0.45, transform: "rotate(15deg)" }}>
                <WeatherIcon
                  type={wmoIcon(d.weatherCode)}
                  size={18}
                  color="rgba(148,163,184,0.8)"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
