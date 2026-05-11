import type { MoonPhaseResult } from "~/utils/moon-phase";

interface Props { moon: MoonPhaseResult }

export function MoonPhaseWidget({ moon }: Props) {
  const pct = Math.round(moon.illumination * 100);

  // SVG crescent — phase 0=new, 0.5=full, 1=new again
  const isWaxing = moon.phase < 0.5;
  const moonFraction = isWaxing ? moon.phase * 2 : (1 - moon.phase) * 2;
  // Shadow circle x-offset: 0=full shadow (new), 1=no shadow (full)
  const shadowX = isWaxing ? 1 - moonFraction : moonFraction - 1;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Moon Phase
      </p>
      <div className="flex items-center gap-4">
        {/* SVG moon */}
        <svg width="52" height="52" viewBox="0 0 52 52">
          <defs>
            <mask id="moon-mask">
              <circle cx="26" cy="26" r="20" fill="white" />
              <circle cx={26 + shadowX * 20} cy="26" r="20" fill="black" />
            </mask>
          </defs>
          {/* Dark sphere base */}
          <circle cx="26" cy="26" r="20" fill="rgba(255,255,255,0.06)" />
          {/* Illuminated side */}
          <circle cx="26" cy="26" r="20" fill="#e2e8f0" mask="url(#moon-mask)" />
        </svg>
        <div className="flex flex-col gap-0.5">
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", fontFamily: "monospace" }}>
            {moon.name}
          </span>
          <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
            {pct}% illuminated
          </span>
        </div>
      </div>
    </div>
  );
}
