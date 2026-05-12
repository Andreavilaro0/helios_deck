import type { MoonPhaseResult } from "~/utils/moon-phase";

interface Props { moon: MoonPhaseResult }

export function MoonPhaseWidget({ moon }: Props) {
  const pct = Math.round(moon.illumination * 100);
  const isWaxing = moon.phase < 0.5;
  const moonFraction = isWaxing ? moon.phase * 2 : (1 - moon.phase) * 2;
  const shadowX = isWaxing ? 1 - moonFraction : moonFraction - 1;

  return (
    <div
      className="rounded-2xl px-3 py-3 flex flex-col justify-between h-full"
      style={{ background: "rgba(8,20,60,0.68)", border: "1px solid rgba(59,130,246,0.28)", boxShadow: "0 8px 40px rgba(0,0,0,0.60)" }}
    >
      <p className="text-[9px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.55)", letterSpacing: "0.18em" }}>
        Luna
      </p>
      <div className="flex items-center gap-2 flex-1">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <defs>
            <mask id="moon-mask-c">
              <circle cx="20" cy="20" r="15" fill="white" />
              <circle cx={20 + shadowX * 15} cy="20" r="15" fill="black" />
            </mask>
          </defs>
          <circle cx="20" cy="20" r="15" fill="rgba(255,255,255,0.05)" />
          <circle cx="20" cy="20" r="15" fill="#e2e8f0" mask="url(#moon-mask-c)" />
        </svg>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#e2f0ff", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {moon.name}
          </span>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(100,130,180,0.60)" }}>
            {pct}% iluminado
          </span>
        </div>
      </div>
    </div>
  );
}
