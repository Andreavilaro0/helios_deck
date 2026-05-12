import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const STATUS_BADGES = [
  { label: "NOAA LIVE", dot: true },
  { label: "SQLite Synced", dot: false },
  { label: "SSR Ready", dot: false },
  { label: "Operational", dot: false },
];

function UtcDateTime() {
  const [utc, setUtc] = useState("");

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      const yyyy = d.getUTCFullYear();
      const time = d.toISOString().slice(11, 19);
      return `${mm}/${dd}/${yyyy}, ${time}`;
    };
    setUtc(fmt());
    const id = setInterval(() => setUtc(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <span
        style={{
          fontSize: "8px",
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        UTC
      </span>
      <span
        className="font-mono tabular-nums"
        style={{ fontSize: "11px", color: "rgba(255,255,255,0.70)", fontWeight: 600 }}
      >
        {utc}
      </span>
    </div>
  );
}

export function EarthWeatherHeader(): ReactNode {
  return (
    <header
      className="sticky top-0 z-40 flex items-center"
      style={{
        height: "70px",
        paddingLeft: "28px",
        paddingRight: "28px",
        gap: "20px",
        background: "linear-gradient(180deg, rgba(98,137,206,0.07) 0%, #0d1b24 100%)",
        borderBottom: "1px solid rgba(98,137,206,0.22)",
        boxShadow: "0 1px 24px rgba(98,137,206,0.10)",
      }}
    >
      {/* Left: 3-line title block */}
      <div className="flex flex-col shrink-0" style={{ gap: 2 }}>
        <h1
          className="font-bold"
          style={{ fontSize: "19px", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          HELIOS Observatory
        </h1>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.50)", lineHeight: 1 }}>
          Earth Weather Explorer
        </p>
        <p
          style={{
            fontSize: "8px",
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.25)",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          Search weather by location. Real-time conditions and forecasts.
        </p>
      </div>

      <div className="flex-1" />

      {/* Center: UTC date + time */}
      <UtcDateTime />

      <div className="flex-1" />

      {/* Right: status badges */}
      <div className="flex items-center gap-2 shrink-0">
        {STATUS_BADGES.map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-1.5"
            style={{
              padding: "5px 10px",
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.22)",
              borderRadius: "8px",
            }}
          >
            {b.dot && (
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                  boxShadow: "0 0 5px #4ade80",
                }}
              />
            )}
            <span
              style={{
                fontSize: "10px",
                fontFamily: "monospace",
                color: "#4ade80",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}
