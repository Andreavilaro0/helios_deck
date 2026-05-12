import { useEffect, useState } from "react";
import type { WeatherData } from "~/types/weather";
import type { ApiStatus } from "~/hooks/useEarthWeather";
import { wmoLabel, wmoIcon } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  weather: WeatherData;
  city: string;
  apiStatus: ApiStatus;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        style={{
          fontSize: "10px",
          fontFamily: "monospace",
          color: "rgba(100,130,180,0.60)",
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
          color: "rgba(224,242,255,0.85)",
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function CurrentConditionsCard({ weather, city, apiStatus }: Props) {
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
        background: "rgba(5,15,52,0.78)",
        border: "1px solid rgba(59,130,246,0.40)",
        boxShadow: "0 0 70px rgba(59,130,246,0.14) inset, 0 8px 50px rgba(0,0,0,0.70), 0 1px 0 rgba(99,102,241,0.20) inset",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "rgba(148,163,184,0.55)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Condiciones Actuales
          </p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#f0f8ff", marginTop: 2, letterSpacing: "-0.01em", textShadow: "0 0 24px rgba(59,130,246,0.30)" }}>
            {city}
          </p>
        </div>
        {apiStatus === "live" && (
          <span
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "#4ade80",
              background: "rgba(74,222,128,0.10)",
              border: "1px solid rgba(74,222,128,0.35)",
              padding: "4px 10px",
              borderRadius: 99,
              letterSpacing: "0.12em",
              display: "flex",
              alignItems: "center",
              gap: 5,
              boxShadow: "0 0 14px rgba(74,222,128,0.12)",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.40)" }} />
            EN VIVO
          </span>
        )}
        {apiStatus === "demo" && (
          <span
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "#fbbf24",
              background: "rgba(251,191,36,0.09)",
              border: "1px solid rgba(251,191,36,0.32)",
              padding: "4px 10px",
              borderRadius: 99,
              letterSpacing: "0.12em",
            }}
          >
            DEMO
          </span>
        )}
      </div>

      {/* Main 2-column: left = icon+temp | right = stats */}
      <div className="flex gap-2 flex-1">
        {/* Left: icon + temperature + condition */}
        <div className="flex flex-col justify-center gap-1 shrink-0" style={{ minWidth: 0 }}>
          <div className="flex items-center gap-1.5">
            <WeatherIcon type={icon} size={64} color="rgba(148,163,184,0.90)" />
            <div>
              <div
                style={{
                  fontSize: 58,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  color: "rgba(224,242,255,0.92)",
                  lineHeight: 1,
                  textShadow: "0 0 20px rgba(147,197,253,0.18)",
                }}
              >
                {current.temperature}°
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "rgba(148,163,184,0.75)",
                  marginTop: 2,
                }}
              >
                {label}
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: "9px",
              fontFamily: "monospace",
              color: "rgba(100,130,180,0.45)",
              marginTop: 2,
            }}
          >
            A las {current.time.slice(11, 16)} hora local
          </p>
        </div>

        {/* Vertical divider */}
        <div
          className="self-stretch shrink-0"
          style={{ width: 1, background: "rgba(59,130,246,0.15)", margin: "0 4px" }}
        />

        {/* Right: stat rows */}
        <div className="flex flex-col gap-1.5 flex-1 justify-center min-w-0">
          <StatRow label="Hora Local"   value={clock || "—"} />
          <StatRow label="Sensación"    value={`${current.feelsLike}°C`} />
          <StatRow label="Humedad"      value={`${current.humidity}%`} />
          <StatRow label="Viento"       value={`${current.windSpeed} km/h ${current.windDirection}`} />
          <StatRow label="Precip."      value={`${current.precipitation} mm`} />
          <StatRow label="Visibilidad"  value={`${current.visibility} km`} />
        </div>
      </div>
    </div>
  );
}
