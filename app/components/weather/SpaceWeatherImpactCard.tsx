import type { SignalRecord } from "~/types/signal";

interface Props {
  kp: number;
  kpHistory: SignalRecord[];
}

function auroraChance(kp: number): number {
  if (kp >= 8) return 95;
  if (kp >= 7) return 85;
  if (kp >= 6) return 70;
  if (kp >= 5) return 55;
  if (kp >= 4) return 35;
  if (kp >= 3) return 20;
  if (kp >= 2) return 10;
  return 5;
}

function overallLevel(kp: number): { label: string; color: string } {
  if (kp >= 5) return { label: "ALTO",     color: "#f87171" };
  if (kp >= 3) return { label: "MODERADO", color: "#fbbf24" };
  return             { label: "BAJO",      color: "#4ade80" };
}

export function SpaceWeatherImpactCard({ kp }: Props) {
  const { label, color } = overallLevel(kp);
  const chance = auroraChance(kp);
  const barPct = Math.round((kp / 9) * 100);

  return (
    <div
      className="rounded-2xl px-3 py-3 flex flex-col justify-between h-full"
      style={{ background: "rgba(8,20,60,0.68)", border: "1px solid rgba(59,130,246,0.28)", boxShadow: "0 8px 40px rgba(0,0,0,0.60)" }}
    >
      <p className="text-[9px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.55)", letterSpacing: "0.18em" }}>
        Clima Espacial
      </p>
      <div className="flex items-center gap-2 flex-1">
        <span style={{ fontSize: "32px", fontWeight: 800, fontFamily: "monospace", color, lineHeight: 1 }}>
          {kp.toFixed(1)}
        </span>
        <div className="flex flex-col gap-1">
          <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700, color }}>{label}</span>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(100,130,180,0.65)" }}>
            Aurora: {chance}%
          </span>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${barPct}%`, background: color, borderRadius: 9999, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}
