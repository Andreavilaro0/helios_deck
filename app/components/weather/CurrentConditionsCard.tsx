import { useEffect, useState } from "react";
import type { WeatherData } from "~/services/fetchers/open-meteo.server";
import { wmoLabel, wmoIcon } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  weather: WeatherData;
  city: string;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        style={{
          fontSize: "10px",
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.33)",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "11px",
          fontFamily: "monospace",
          fontWeight: 600,
          color: "rgba(255,255,255,0.72)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function CurrentConditionsCard({ weather, city }: Props) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, "0");
      const m = String(d.getUTCMinutes()).padStart(2, "0");
      const ampm = d.getUTCHours() < 12 ? "AM" : "PM";
      const h12 = d.getUTCHours() % 12 || 12;
      setClock(`${String(h12).padStart(2, "0")}:${m} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { current } = weather;
  const icon = wmoIcon(current.weatherCode);
  const label = wmoLabel(current.weatherCode);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.11)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Current Conditions
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>
            {city}
          </p>
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.30)" }}>
            Capital Region
          </p>
        </div>
        <span
          style={{
            fontSize: "9px",
            fontFamily: "monospace",
            color: "#4ade80",
            background: "rgba(74,222,128,0.12)",
            border: "1px solid rgba(74,222,128,0.25)",
            padding: "3px 8px",
            borderRadius: 99,
            letterSpacing: "0.08em",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          LIVE
        </span>
      </div>

      {/* Main 2-column: left = icon+temp | right = stats */}
      <div className="flex gap-3 flex-1">
        {/* Left: icon + temperature + condition */}
        <div className="flex flex-col justify-center gap-1 shrink-0">
          <div className="flex items-center gap-2">
            <WeatherIcon type={icon} size={72} color="rgba(148,163,184,0.90)" />
            <div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                {current.temperature}°
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 2,
                }}
              >
                {label}
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: "8px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.22)",
              marginTop: 2,
            }}
          >
            Updated 1 min ago
          </p>
        </div>

        {/* Vertical divider */}
        <div
          className="self-stretch shrink-0"
          style={{ width: 1, background: "rgba(255,255,255,0.08)" }}
        />

        {/* Right: stat rows */}
        <div className="flex flex-col gap-1.5 flex-1 justify-center">
          <StatRow label="Local Time" value={clock} />
          <StatRow label="Humidity" value={`${current.humidity}%`} />
          <StatRow label="Wind" value={`${current.windSpeed} km/h`} />
          <StatRow label="Pressure" value={`${current.pressure} hPa`} />
          <StatRow label="UV Index" value={String(current.uvIndex)} />
        </div>
      </div>
    </div>
  );
}
