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
  boxShadow: string;
  description: string;
  riskLabel: string;
  riskColor: string;
}

const STATUS_CONFIG: Record<OverallStatus, HeroConfig> = {
  QUIET: {
    headlineLines: ["CONDICIONES", "TRANQUILAS"],
    color: "#f9f3fa",
    borderColor: "rgba(249,243,250,0.14)",
    bgColor: "rgba(249,243,250,0.05)",
    boxShadow: "0 0 48px rgba(249,243,250,0.04), inset 0 1px 0 rgba(255,255,255,0.09)",
    description:
      "La actividad geomagnética está en niveles tranquilos. Sin alertas de clima espacial activas.",
    riskLabel: "BAJO",
    riskColor: "rgba(249,243,250,0.45)",
  },
  ACTIVE: {
    headlineLines: ["CONDICIONES", "ACTIVAS"],
    color: "#8aa4d9",
    borderColor: "rgba(138,164,217,0.28)",
    bgColor: "rgba(138,164,217,0.07)",
    boxShadow: "0 0 48px rgba(138,164,217,0.16), inset 0 1px 0 rgba(255,255,255,0.09)",
    description:
      "Actividad geomagnética elevada. Posibles disrupciones menores en radio HF.",
    riskLabel: "MODERADO",
    riskColor: "#8aa4d9",
  },
  STORM: {
    headlineLines: ["TORMENTA", "GEOMAGNÉTICA"],
    color: "#6289ce",
    borderColor: "rgba(98,137,206,0.38)",
    bgColor: "rgba(98,137,206,0.09)",
    boxShadow: "0 0 56px rgba(98,137,206,0.22), inset 0 1px 0 rgba(255,255,255,0.10)",
    description:
      "Tormenta geomagnética en curso. Impactos significativos en satélites y redes eléctricas posibles.",
    riskLabel: "ALTO",
    riskColor: "#6289ce",
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
      className="relative rounded-2xl px-5 py-4 mb-4 flex flex-row items-center gap-5 overflow-hidden"
      style={{
        background: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
        backdropFilter: "blur(12px)",
        boxShadow: cfg.boxShadow,
        ["--card-accent" as string]: cfg.color,
      }}
    >
      {/* Nebula blob orbs — organic depth behind the header */}
      <div
        className="blob-orb absolute -top-10 -left-10 w-44 h-44 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${cfg.color}50 0%, transparent 70%)`,
          filter: "blur(36px)",
          mixBlendMode: "screen",
          opacity: 0.45,
        }}
      />
      <div
        className="blob-orb blob-delay-4 absolute -bottom-12 right-1/4 w-52 h-52 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
          filter: "blur(44px)",
          mixBlendMode: "screen",
          opacity: 0.30,
        }}
      />

      {/* Planet */}
      <Planet color={cfg.color} />

      {/* Left — status headline */}
      <div className="relative z-[1] flex-1 min-w-0">
        <p
          className="label-dot text-[9px] font-mono tracking-[0.25em] uppercase mb-1"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Condición del Clima Espacial
        </p>
        <h1
          className="font-mono font-black leading-[1.05]"
          style={{
            fontSize: "26px",
            letterSpacing: "-0.02em",
            background: `linear-gradient(148deg, rgba(255,255,255,0.96) 0%, ${cfg.color} 55%, oklch(0.75 0.15 264) 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
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
      <div className="relative z-[1] shrink-0 flex gap-2">
        <MiniCard label="Riesgo" value={cfg.riskLabel} valueColor={cfg.riskColor} />
        <MiniCard label="Actualización" value={freshnessAge} />
        <MiniCard label="Ingerido" value={lastIngestedTime} sub={lastIngestedDate} />
        <MiniCard label="Fuente" value="NOAA SWPC" sub="Fuente principal" />
      </div>
    </header>
  );
}
