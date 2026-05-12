import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface DashboardTopbarProps {
  title?: string;
  subtitle?: string;
  freshnessAge?: string;
  overallStatus?: "QUIET" | "ACTIVE" | "STORM";
}

function UtcClock() {
  const [utc, setUtc] = useState("");

  useEffect(() => {
    const fmt = () => new Date().toISOString().slice(11, 19) + " UTC";
    setUtc(fmt());
    const id = setInterval(() => setUtc(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono tabular-nums" style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600 }}>
      {utc}
    </span>
  );
}

const STATUS_DOT: Record<string, string> = {
  QUIET:  "rgba(249,243,250,0.55)",
  ACTIVE: "#8aa4d9",
  STORM:  "#6289ce",
};
const STATUS_BG: Record<string, string> = {
  QUIET:  "rgba(249,243,250,0.05)",
  ACTIVE: "rgba(138,164,217,0.14)",
  STORM:  "rgba(98,137,206,0.16)",
};
const STATUS_BORDER: Record<string, string> = {
  QUIET:  "rgba(249,243,250,0.12)",
  ACTIVE: "rgba(138,164,217,0.30)",
  STORM:  "rgba(98,137,206,0.36)",
};

export function DashboardTopbar({
  title = "Dashboard",
  subtitle,
  freshnessAge,
  overallStatus = "QUIET",
}: DashboardTopbarProps): ReactNode {
  const dot    = STATUS_DOT[overallStatus]    ?? STATUS_DOT.QUIET;
  const bg     = STATUS_BG[overallStatus]     ?? STATUS_BG.QUIET;
  const border = STATUS_BORDER[overallStatus] ?? STATUS_BORDER.QUIET;

  return (
    <header
      className="sticky top-0 z-40 flex items-center"
      style={{
        height: "70px",
        paddingLeft: "28px",
        paddingRight: "28px",
        gap: "14px",
        background: "linear-gradient(180deg, rgba(98,137,206,0.07) 0%, #0d1b24 100%)",
        borderBottom: "1px solid rgba(98,137,206,0.22)",
        boxShadow: "0 1px 24px rgba(98,137,206,0.10)",
      }}
    >
      <div className="flex flex-col shrink-0" style={{ gap: 2 }}>
        {subtitle && (
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1 }}>
            {subtitle}
          </p>
        )}
        <h1
          className="font-bold"
          style={{ fontSize: "22px", color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          {title}
        </h1>
      </div>

      <div className="self-stretch py-4 shrink-0">
        <div className="h-full w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>

      <div
        className="flex items-center gap-2 shrink-0"
        style={{
          padding: "8px 14px",
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: "10px",
        }}
      >
        <span
          className="rounded-full shrink-0"
          style={{
            width: "8px",
            height: "8px",
            background: dot,
            boxShadow: overallStatus !== "QUIET" ? `0 0 8px 2px ${dot}` : "none",
            animation: overallStatus !== "QUIET" ? "glowPulse 2s ease-in-out infinite" : undefined,
          }}
        />
        <span className="font-bold leading-none" style={{ fontSize: "12px", color: "#ffffff", letterSpacing: "0.07em" }}>
          {overallStatus}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 shrink-0">
        {freshnessAge && (
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
            {freshnessAge} ago
          </span>
        )}

        <div
          style={{
            padding: "8px 14px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "10px",
          }}
        >
          <UtcClock />
        </div>

        <div
          style={{
            padding: "8px 14px",
            background: "rgba(98,137,206,0.10)",
            border: "1px solid rgba(98,137,206,0.24)",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "12px", color: "#ffffff", letterSpacing: "0.06em", fontWeight: 700 }}>
            NOAA SWPC
          </span>
        </div>
      </div>
    </header>
  );
}
