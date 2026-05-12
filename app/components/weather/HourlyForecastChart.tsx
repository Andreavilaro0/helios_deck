import type { WeatherData } from "~/types/weather";
import { wmoIcon } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  hourly: WeatherData["hourly"];
}

const CHART_H = 70;
const CHART_W = 280;

function tempColor(t: number, min: number, max: number): string {
  const ratio = max > min ? Math.max(0, Math.min(1, (t - min) / (max - min))) : 0.5;
  const r = Math.round(96  + ratio * (251 - 96));
  const g = Math.round(165 + ratio * (146 - 165));
  const b = Math.round(250 + ratio * (60  - 250));
  return `rgb(${r},${g},${b})`;
}

export function HourlyForecastChart({ hourly }: Props) {
  const temps = hourly.map((h) => h.temperature);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const minTChart = minT - 2;
  const maxTChart = maxT + 2;
  const range = maxTChart - minTChart || 1;

  const toY = (t: number) =>
    CHART_H - ((t - minTChart) / range) * CHART_H;
  const toX = (i: number) =>
    hourly.length < 2
      ? CHART_W / 2
      : (i / (hourly.length - 1)) * CHART_W;

  const points = hourly
    .map((h, i) => `${toX(i).toFixed(1)},${toY(h.temperature).toFixed(1)}`)
    .join(" ");
  const areaPoints = `0,${CHART_H} ${points} ${CHART_W},${CHART_H}`;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 h-full overflow-hidden"
      style={{
        background: "rgba(8,20,60,0.60)",
        border: "1px solid rgba(34,211,238,0.18)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
      }}
    >
      <p
        className="text-[9px] font-mono uppercase tracking-widest shrink-0"
        style={{ color: "rgba(148,163,184,0.55)", letterSpacing: "0.18em" }}
      >
        Pronóstico por Hora
      </p>

      {/* Chips row — ABOVE the chart, matching reference */}
      <div className="flex gap-1 shrink-0">
        {hourly.map((h, i) => {
          const hour = h.time.slice(11, 16);
          const isCurrent = i === 0;
          const dotColor = tempColor(h.temperature, minT, maxT);
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl"
              style={{
                background: isCurrent ? "rgba(34,211,238,0.12)" : "rgba(8,25,70,0.55)",
                border: isCurrent ? "1px solid rgba(34,211,238,0.45)" : "1px solid rgba(59,130,246,0.14)",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: isCurrent ? "#22d3ee" : "rgba(148,163,184,0.65)",
                  fontWeight: isCurrent ? 700 : 500,
                  letterSpacing: "0.03em",
                }}
              >
                {isCurrent ? "AHORA" : hour}
              </span>
              <WeatherIcon
                type={wmoIcon(h.weatherCode)}
                size={18}
                color={isCurrent ? "rgba(34,211,238,0.95)" : "rgba(148,163,184,0.80)"}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: dotColor,
                }}
              >
                {h.temperature}°
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart fills remaining space — BELOW chips */}
      <div className="flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="hourly-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.50" />
              <stop offset="60%"  stopColor="#06b6d4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#hourly-fill)" />
          <polyline
            points={points}
            fill="none"
            stroke="rgba(34,211,238,0.65)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {hourly.map((h, i) => (
            <circle
              key={i}
              cx={toX(i).toFixed(1)}
              cy={toY(h.temperature).toFixed(1)}
              r="4.5"
              fill={tempColor(h.temperature, minT, maxT)}
              opacity="0.90"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
