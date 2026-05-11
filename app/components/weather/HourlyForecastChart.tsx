import type { WeatherData } from "~/services/fetchers/open-meteo.server";
import { wmoIcon } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  hourly: WeatherData["hourly"];
}

const CHART_H = 50;
const CHART_W = 280;

export function HourlyForecastChart({ hourly }: Props) {
  const temps = hourly.map((h) => h.temperature);
  const minT = Math.min(...temps) - 2;
  const maxT = Math.max(...temps) + 2;
  const range = maxT - minT || 1;

  const toY = (t: number) =>
    CHART_H - ((t - minT) / range) * CHART_H;
  const toX = (i: number) =>
    hourly.length < 2
      ? CHART_W / 2
      : (i / (hourly.length - 1)) * CHART_W;

  const points = hourly
    .map((h, i) =>
      `${toX(i).toFixed(1)},${toY(h.temperature).toFixed(1)}`
    )
    .join(" ");
  const areaPoints = `0,${CHART_H} ${points} ${CHART_W},${CHART_H}`;

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        className="text-[9px] font-mono uppercase tracking-widest"
        style={{
          color: "rgba(255,255,255,0.28)",
        }}
      >
        Hourly Forecast
      </p>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        width="100%"
        height={CHART_H}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="hourly-fill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#60a5fa"
              stopOpacity="0.20"
            />
            <stop
              offset="100%"
              stopColor="#60a5fa"
              stopOpacity="0.01"
            />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#hourly-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hourly.map((h, i) => (
          <circle
            key={i}
            cx={toX(i).toFixed(1)}
            cy={toY(h.temperature).toFixed(1)}
            r="2.5"
            fill="#60a5fa"
            opacity="0.8"
          />
        ))}
      </svg>

      <div className="flex gap-1 overflow-x-auto">
        {hourly.map((h, i) => {
          const hour = new Date(h.time).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            }
          );
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1 shrink-0 px-2 py-1 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                minWidth: 48,
              }}
            >
              <span
                style={{
                  fontSize: "8px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.30)",
                }}
              >
                {hour}
              </span>
              <WeatherIcon
                type={wmoIcon(h.weatherCode)}
                size={18}
                color="rgba(148,163,184,0.8)"
              />
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                {h.temperature}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
