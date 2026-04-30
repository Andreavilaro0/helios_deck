const KP_MAX = 9;
const STORM_THRESHOLD = 5;
const ACTIVE_THRESHOLD = 4;

interface Props {
  currentKp: number;
}

function kpZoneLabel(kp: number): string {
  if (kp >= STORM_THRESHOLD) return "STORM";
  if (kp >= ACTIVE_THRESHOLD) return "ACTIVE";
  return "QUIET";
}

function kpZoneColor(kp: number): string {
  if (kp >= STORM_THRESHOLD) return "text-red-400";
  if (kp >= ACTIVE_THRESHOLD) return "text-yellow-400";
  return "text-sky-400";
}

export function KpScaleInstrument({ currentKp }: Props) {
  const clampedKp = Math.min(KP_MAX, Math.max(0, currentKp));
  const positionPct = (clampedKp / KP_MAX) * 100;
  const stormPct = (STORM_THRESHOLD / KP_MAX) * 100;
  const activePct = (ACTIVE_THRESHOLD / KP_MAX) * 100;

  return (
    <div className="bg-[#070d1a] border border-cyan-900/30 rounded-sm p-4 space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 border-b border-cyan-900/20 pb-2">
        Geomagnetic Scale / NOAA
      </div>

      <div className="space-y-3">
        {/* Zone track */}
        <div className="relative h-3 rounded-sm overflow-hidden bg-slate-900">
          {/* Quiet zone */}
          <div
            className="absolute inset-y-0 left-0 bg-sky-900/60"
            style={{ width: `${activePct}%` }}
            aria-hidden="true"
          />
          {/* Active zone */}
          <div
            className="absolute inset-y-0 bg-yellow-900/60"
            style={{ left: `${activePct}%`, width: `${stormPct - activePct}%` }}
            aria-hidden="true"
          />
          {/* Storm zone */}
          <div
            className="absolute inset-y-0 right-0 bg-red-900/40"
            style={{ left: `${stormPct}%` }}
            aria-hidden="true"
          />
          {/* Threshold lines */}
          <div
            className="absolute inset-y-0 w-px bg-yellow-500/50"
            style={{ left: `${activePct}%` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 w-px bg-red-500/50"
            style={{ left: `${stormPct}%` }}
            aria-hidden="true"
          />
          {/* Current position marker */}
          <div
            className="absolute inset-y-0 w-0.5 bg-white"
            style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
            aria-label={`Current Kp: ${currentKp.toFixed(2)}`}
          />
        </div>

        {/* Scale tick labels */}
        <div className="flex justify-between text-[9px] font-mono text-slate-600 px-0">
          {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>

      {/* Zone key */}
      <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center">
        <div className="space-y-0.5">
          <div className="text-sky-400 font-semibold">QUIET</div>
          <div className="text-slate-700">Kp 0 – 3</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-yellow-400 font-semibold">ACTIVE</div>
          <div className="text-slate-700">Kp 4</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-red-400 font-semibold">STORM</div>
          <div className="text-slate-700">Kp 5 – 9</div>
        </div>
      </div>

      {/* Current status callout */}
      <div className="border-t border-cyan-900/20 pt-3 text-[10px] font-mono space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-700">CURRENT STATUS</span>
          <span className={`font-semibold ${kpZoneColor(currentKp)}`}>
            {kpZoneLabel(currentKp)}
          </span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>G1 STORM THRESHOLD</span>
          <span>Kp ≥ {STORM_THRESHOLD}</span>
        </div>
      </div>
    </div>
  );
}
