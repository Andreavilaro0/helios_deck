import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const STATUS_BADGES = [
  { label: "NOAA LIVE",    dot: true,  color: "#4ade80", bg: "rgba(74,222,128,0.08)",   border: "rgba(74,222,128,0.38)",  glow: "rgba(74,222,128,0.12)" },
  { label: "Open-Meteo",  dot: false, color: "#38bdf8", bg: "rgba(56,189,248,0.08)",   border: "rgba(56,189,248,0.32)",  glow: "rgba(56,189,248,0.08)" },
  { label: "SQLite",       dot: false, color: "#60a5fa", bg: "rgba(59,130,246,0.09)",   border: "rgba(59,130,246,0.30)",  glow: "rgba(59,130,246,0.08)" },
  { label: "SSR Ready",   dot: false, color: "#a78bfa", bg: "rgba(167,139,250,0.08)",  border: "rgba(167,139,250,0.28)", glow: "rgba(167,139,250,0.08)" },
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
          fontSize: "9px",
          fontFamily: "monospace",
          color: "rgba(147,197,253,0.50)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        UTC
      </span>
      <span
        className="font-mono tabular-nums"
        style={{ fontSize: "13px", color: "rgba(224,242,255,0.80)", fontWeight: 700, letterSpacing: "0.04em" }}
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
        height: "68px",
        paddingLeft: "24px",
        paddingRight: "24px",
        gap: "20px",
        background: "linear-gradient(180deg, rgba(5,12,26,0.92) 0%, rgba(3,9,19,0.96) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 24px rgba(0,0,0,0.18)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Left: 3-line title block */}
      <div className="flex flex-col shrink-0" style={{ gap: 2 }}>
        <h1
          className="font-bold"
          style={{ fontSize: "20px", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1, fontWeight: 800 }}
        >
          HELIOS Observatory
        </h1>
        <p style={{ fontSize: "10px", color: "rgba(148,163,184,0.70)", lineHeight: 1 }}>
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
              padding: "5px 12px",
              background: "linear-gradient(180deg, rgba(8,17,34,0.54) 0%, rgba(4,9,20,0.66) 100%)",
              border: `1px solid ${b.border}`,
              borderRadius: "16px",
              backdropFilter: "blur(16px)",
              boxShadow: `0 0 12px ${b.glow}`,
            }}
          >
            {b.dot && (
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: b.color,
                  display: "inline-block",
                  boxShadow: `0 0 6px ${b.color}`,
                }}
              />
            )}
            <span
              style={{
                fontSize: "10px",
                fontFamily: "monospace",
                color: b.color,
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
