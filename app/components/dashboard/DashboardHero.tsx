import type { ReactNode } from "react";

export type OverallStatus = "QUIET" | "ACTIVE" | "STORM";

export interface DashboardHeroProps {
  overallStatus: OverallStatus;
  /** Formatted label — e.g. "May 5 · 07:37 UTC" */
  timestamp: string;
  /** Formatted UTC age string — e.g. "6h 19m" */
  freshnessAge: string;
  /** Formatted UTC time — e.g. "07:37 AM UTC" */
  lastIngestedTime: string;
  /** Formatted UTC date — e.g. "05/05/2026" */
  lastIngestedDate: string;
}

interface HeroConfig {
  headlineLines: [string, string];
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  riskLabel: string;
  riskColor: string;
}

const STATUS_CONFIG: Record<OverallStatus, HeroConfig> = {
  QUIET: {
    headlineLines: ["QUIET", "CONDITIONS"],
    color: "#22d3ee",
    borderColor: "rgba(255,255,255,0.08)",
    bgColor: "rgba(255,255,255,0.03)",
    description:
      "Geomagnetic activity is at quiet levels. No space weather alerts in effect.",
    riskLabel: "LOW",
    riskColor: "#4ade80",
  },
  ACTIVE: {
    headlineLines: ["ACTIVE", "CONDITIONS"],
    color: "#fbbf24",
    borderColor: "rgba(245,158,11,0.2)",
    bgColor: "rgba(245,158,11,0.04)",
    description:
      "Elevated geomagnetic activity. Minor disruptions to HF radio possible.",
    riskLabel: "MODERATE",
    riskColor: "#fbbf24",
  },
  STORM: {
    headlineLines: ["GEOMAGNETIC", "STORM"],
    color: "#f87171",
    borderColor: "rgba(239,68,68,0.2)",
    bgColor: "rgba(239,68,68,0.04)",
    description:
      "Geomagnetic storm in progress. Significant satellite and grid impacts possible.",
    riskLabel: "HIGH",
    riskColor: "#f87171",
  },
};

function Planet({ color }: { color: string }): ReactNode {
  // Semi-transparent hex of the status color for the glow
  const glow = `${color}55`;
  const glowPeak = `${color}88`;

  return (
    <div className="shrink-0 relative" style={{ width: 76, height: 76 }}>
      {/* Outer atmosphere ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 48%, ${glow} 70%, transparent 100%)`,
          animation: "planetGlow 3.5s ease-in-out infinite",
          ["--planet-glow-base" as string]: `0 0 18px 4px ${glow}`,
          ["--planet-glow-peak" as string]: `0 0 32px 10px ${glowPeak}`,
        }}
      />
      {/* Planet sphere */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          inset: 8,
          background: `
            radial-gradient(circle at 35% 28%,
              rgba(255,255,255,0.18) 0%,
              ${color}cc 30%,
              ${color}66 60%,
              #020810 100%
            )
          `,
          boxShadow: `inset -6px -6px 14px rgba(0,0,0,0.7), inset 2px 2px 6px rgba(255,255,255,0.08)`,
          animation: "planetGlow 3.5s ease-in-out infinite",
          ["--planet-glow-base" as string]: `0 0 0px 0px transparent`,
          ["--planet-glow-peak" as string]: `0 0 0px 0px transparent`,
        }}
      >
        {/* Surface texture bands */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              repeating-linear-gradient(
                168deg,
                transparent 0px,
                transparent 6px,
                rgba(255,255,255,0.06) 6px,
                rgba(255,255,255,0.06) 7px
              )
            `,
          }}
        />
      </div>
      {/* Thin orbit arc */}
      <svg
        viewBox="0 0 76 76"
        width="76"
        height="76"
        className="absolute inset-0"
        style={{ opacity: 0.18 }}
        aria-hidden="true"
      >
        <ellipse
          cx="38" cy="38"
          rx="34" ry="10"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="4 3"
          transform="rotate(-20 38 38)"
        />
      </svg>
    </div>
  );
}

interface MiniCardProps {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}

function MiniCard({ label, value, sub, valueColor }: MiniCardProps): ReactNode {
  return (
    <div
      className="rounded-lg px-3 py-2 min-w-[90px]"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p
        className="text-[8px] font-mono tracking-[0.2em] uppercase mb-0.5"
        style={{ color: "rgba(255,255,255,0.30)" }}
      >
        {label}
      </p>
      <p
        className="text-[12px] font-mono font-bold leading-tight"
        style={{ color: valueColor ?? "#ffffff" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-[8px] font-mono mt-0.5"
          style={{ color: "rgba(255,255,255,0.30)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function DashboardHero({
  overallStatus,
  timestamp,
  freshnessAge,
  lastIngestedTime,
  lastIngestedDate,
}: DashboardHeroProps): ReactNode {
  const cfg = STATUS_CONFIG[overallStatus];

  return (
    <header
      className="rounded-2xl px-5 py-4 mb-4 flex flex-row items-center gap-5"
      style={{
        background: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Planet */}
      <Planet color={cfg.color} />

      {/* Left — status headline */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[9px] font-mono tracking-[0.25em] uppercase mb-1"
          style={{ color: "rgba(255,255,255,0.30)" }}
        >
          Space Weather Condition
        </p>
        <h1
          className="font-mono font-black leading-[1.05]"
          style={{
            fontSize: "26px",
            color: cfg.color,
            letterSpacing: "-0.02em",
          }}
        >
          {cfg.headlineLines[0]} {cfg.headlineLines[1]}
        </h1>
        <p
          className="text-[10px] font-mono mt-1"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          {timestamp}
        </p>
      </div>

      {/* Right — 4 mini stats in a row */}
      <div className="shrink-0 flex gap-2">
        <MiniCard label="Risk" value={cfg.riskLabel} valueColor={cfg.riskColor} />
        <MiniCard label="Freshness" value={freshnessAge} />
        <MiniCard label="Ingested" value={lastIngestedTime} sub={lastIngestedDate} />
        <MiniCard label="Source" value="NOAA SWPC" sub="Primary feed" />
      </div>
    </header>
  );
}
