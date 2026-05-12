import { useEffect, useState } from "react";
import type { WeatherData } from "~/services/fetchers/open-meteo.server";
import { wmoLabel, wmoIcon } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  weather: WeatherData;
  city: string;
}

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        style={{
          fontSize: "10px",
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "11px",
          fontFamily: "monospace",
          fontWeight: 600,
          color: "rgba(255,255,255,0.70)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function CurrentConditionsCard({
  weather,
  city,
}: Props) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { current } = weather;
  const icon = wmoIcon(current.weatherCode);
  const label = wmoLabel(current.weatherCode);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.11)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Current Conditions
          </p>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#e2e8f0",
              marginTop: 2,
            }}
          >
            {city}
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "#4ade80",
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.25)",
              padding: "2px 8px",
              borderRadius: 99,
              letterSpacing: "0.1em",
            }}
          >
            LIVE
          </span>
          <span
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.04em",
            }}
          >
            {clock}
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-1">
        <div className="flex flex-col items-center justify-center gap-1">
          <WeatherIcon
            type={icon}
            size={80}
            color="rgba(148,163,184,0.90)"
          />
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "monospace",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {current.temperature}°
          </div>
          <div
            style={{
              fontSize: "10px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.45)",
              textAlign: "center",
            }}
          >
            {label}
          </div>
        </div>

        <div
          className="self-stretch shrink-0"
          style={{ width: 1, background: "rgba(255,255,255,0.08)" }}
        />

        <div className="flex flex-col gap-1.5 flex-1 justify-center">
          <StatItem label="Wind" value={`${current.windSpeed} km/h`} />
          <StatItem label="Pressure" value={`${current.pressure} hPa`} />
          <StatItem label="Humidity" value={`${current.humidity}%`} />
          <StatItem label="UV Index" value={String(current.uvIndex)} />
        </div>
      </div>
    </div>
  );
}
