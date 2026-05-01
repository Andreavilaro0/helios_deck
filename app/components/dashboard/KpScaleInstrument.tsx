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

function kpBadgeClasses(kp: number): string {
  if (kp >= STORM_THRESHOLD) return "bg-red-50 text-red-500";
  if (kp >= ACTIVE_THRESHOLD) return "bg-amber-50 text-amber-500";
  return "bg-sky-50 text-sky-500";
}

export function KpScaleInstrument({ currentKp }: Props) {
  const clampedKp = Math.min(KP_MAX, Math.max(0, currentKp));
  const positionPct = (clampedKp / KP_MAX) * 100;
  const stormPct = (STORM_THRESHOLD / KP_MAX) * 100;
  const activePct = (ACTIVE_THRESHOLD / KP_MAX) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Geomagnetic Scale</span>
        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${kpBadgeClasses(currentKp)}`}>
          {kpZoneLabel(currentKp)}
        </span>
      </div>

      {/* Current Kp */}
      <div className="text-3xl font-bold tabular-nums text-slate-900">
        {currentKp.toFixed(2)}
        <span className="text-sm font-normal text-slate-400 ml-1">/ {KP_MAX}</span>
      </div>

      {/* Zone track */}
      <div className="relative h-4 rounded-full overflow-hidden bg-slate-100">
        <div className="absolute inset-y-0 left-0 bg-sky-200" style={{ width: `${activePct}%` }} aria-hidden="true" />
        <div className="absolute inset-y-0 bg-amber-200" style={{ left: `${activePct}%`, width: `${stormPct - activePct}%` }} aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 bg-red-200" style={{ left: `${stormPct}%` }} aria-hidden="true" />
        <div className="absolute inset-y-0 w-px bg-amber-400/60" style={{ left: `${activePct}%` }} aria-hidden="true" />
        <div className="absolute inset-y-0 w-px bg-red-400/60" style={{ left: `${stormPct}%` }} aria-hidden="true" />
        <div
          className="absolute inset-y-0 w-1 bg-slate-700 rounded-full"
          style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
          aria-label={`Current Kp: ${currentKp.toFixed(2)}`}
        />
      </div>

      {/* Tick labels */}
      <div className="flex justify-between text-[9px] font-mono text-slate-400">
        {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>

      {/* Zone key */}
      <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center border-t border-slate-100 pt-3">
        <div><div className="text-sky-500 font-semibold">QUIET</div><div className="text-slate-400">Kp 0–3</div></div>
        <div><div className="text-amber-500 font-semibold">ACTIVE</div><div className="text-slate-400">Kp 4</div></div>
        <div><div className="text-red-500 font-semibold">STORM</div><div className="text-slate-400">Kp 5–9</div></div>
      </div>

      {/* Status rows */}
      <div className="border-t border-slate-100 pt-3 space-y-1 text-[10px] font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">CURRENT STATUS</span>
          <span className={`font-semibold ${kpBadgeClasses(currentKp).split(" ")[1]}`}>{kpZoneLabel(currentKp)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>G1 STORM THRESHOLD</span>
          <span>Kp ≥ {STORM_THRESHOLD}</span>
        </div>
      </div>
    </div>
  );
}
