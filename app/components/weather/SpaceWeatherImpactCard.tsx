import type { SpaceWeatherImpact, ImpactLevel } from "~/utils/space-impact";

interface Props { impact: SpaceWeatherImpact }

const BADGE_STYLE: Record<ImpactLevel, { bg: string; color: string }> = {
  LOW:      { bg: "rgba(74,222,128,0.12)",  color: "#4ade80" },
  MODERATE: { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  HIGH:     { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  SEVERE:   { bg: "rgba(239,68,68,0.20)",   color: "#ef4444" },
};

function ImpactRow({ label, level }: { label: string; level: ImpactLevel }) {
  const s = BADGE_STYLE[level];
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.06em",
        color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 99 }}>
        {level}
      </span>
    </div>
  );
}

export function SpaceWeatherImpactCard({ impact }: Props) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 h-full"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.11)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Space Weather Impact
      </p>
      <div className="flex flex-col">
        <ImpactRow label="Radio Blackout"    level={impact.radioBlackout} />
        <ImpactRow label="Solar Radiation"   level={impact.solarRadiation} />
        <ImpactRow label="Geomagnetic Storm" level={impact.geomagneticStorm} />
      </div>
      <p style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.20)", marginTop: "auto" }}>
        Data Source: NOAA SWPC · HELIOS DB
      </p>
    </div>
  );
}
