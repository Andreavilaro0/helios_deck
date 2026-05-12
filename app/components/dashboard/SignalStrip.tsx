import type { ReactNode } from "react";

export interface NavSignal {
  label: string;
  value: string;
  unit?: string;
  color: string;
}

export function SignalStrip({ signals }: { signals: NavSignal[] }): ReactNode {
  return (
    <div
      className="flex gap-4"
      style={{
        padding: "20px 36px",
        background: "#0d1b24",
        borderBottom: "1px solid rgba(249,243,250,0.08)",
      }}
    >
      {signals.map((sig) => (
        <div
          key={sig.label}
          className="flex-1 flex items-center gap-4"
          style={{
            padding: "22px 28px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
          }}
        >
          {/* Color bar */}
          <span
            className="shrink-0"
            style={{ width: "3px", height: "44px", background: sig.color, borderRadius: "2px" }}
          />

          {/* Label + value */}
          <div className="flex flex-col" style={{ gap: "6px" }}>
            <span
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              {sig.label}
            </span>
            <span
              className="font-mono font-bold leading-none"
              style={{ fontSize: "32px", color: "#ffffff" }}
            >
              {sig.value}
              {sig.unit && (
                <span
                  className="font-normal"
                  style={{ fontSize: "14px", color: "rgba(255,255,255,0.50)", marginLeft: "6px" }}
                >
                  {sig.unit}
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
