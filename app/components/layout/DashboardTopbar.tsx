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

const STATUS_LABEL: Record<string, string> = {
  QUIET:  "CALMA",
  ACTIVE: "ACTIVO",
  STORM:  "TORMENTA",
};

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
  title = "Panel",
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
        height: "68px",
        paddingLeft: "24px",
        paddingRight: "24px",
        gap: "14px",
        background: "linear-gradient(180deg, rgba(5,12,26,0.92) 0%, rgba(3,9,19,0.96) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 24px rgba(0,0,0,0.18)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex flex-col shrink-0" style={{ gap: 3 }}>
        {subtitle && (
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.22em", textTransform: "uppercase", lineHeight: 1 }}>
            {subtitle}
          </p>
        )}
        <h1
          className="font-semibold"
          style={{ fontSize: "21px", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1 }}
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
          padding: "6px 14px",
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: "20px",
        }}
      >
        <span
          className="rounded-full shrink-0"
          style={{
            width: "7px",
            height: "7px",
            background: dot,
            boxShadow: overallStatus !== "QUIET" ? `0 0 8px 2px ${dot}` : "none",
          }}
        />
        <span className="font-mono leading-none" style={{ fontSize: "10px", color: "#ffffff", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          {STATUS_LABEL[overallStatus] ?? overallStatus}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 shrink-0">
        {freshnessAge && (
          <div
            style={{
              padding: "6px 12px",
              background: "linear-gradient(180deg, rgba(8,17,34,0.54) 0%, rgba(4,9,20,0.66) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
            }}
          >
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.50)" }}>
              hace {freshnessAge}
            </span>
          </div>
        )}

        <div
          style={{
            padding: "6px 14px",
            background: "linear-gradient(180deg, rgba(8,17,34,0.54) 0%, rgba(4,9,20,0.66) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
          }}
        >
          <UtcClock />
        </div>

        <div
          style={{
            padding: "6px 14px",
            background: "linear-gradient(180deg, rgba(8,17,34,0.54) 0%, rgba(4,9,20,0.66) 100%)",
            border: "1px solid rgba(77,153,255,0.32)",
            borderRadius: "16px",
          }}
        >
          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.90)", letterSpacing: "0.16em" }}>
            NOAA SWPC
          </span>
        </div>
      </div>
    </header>
  );
}
