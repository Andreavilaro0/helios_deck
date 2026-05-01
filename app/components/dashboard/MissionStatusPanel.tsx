const PIPELINE_STEPS = ["NOAA SWPC", "HELIOS_DECK", "SQLite", "SSR"] as const;

interface Props {
  source: string;
  recordCount: number;
  maxKp: number;
  minKp: number;
  avgKp: number;
}

export function MissionStatusPanel({ source, recordCount, maxKp, minKp, avgKp }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <span className="text-sm font-semibold text-slate-900">Data Pipeline</span>

      <div className="flex items-center gap-1 flex-wrap text-[10px] font-mono text-slate-500">
        {PIPELINE_STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-1">
            <span className="size-1 rounded-full bg-emerald-500" aria-hidden="true" />
            {step}
            {i < PIPELINE_STEPS.length - 1 && <span className="text-slate-300">→</span>}
          </span>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-1.5 text-[10px] font-mono">
        <Row label="SOURCE" value={source} />
        <Row label="READINGS" value={String(recordCount)} />
        <Row label="MAX KP" value={maxKp.toFixed(2)} />
        <Row label="MIN KP" value={minKp.toFixed(2)} />
        <Row label="AVG KP" value={avgKp.toFixed(2)} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 tabular-nums">{value}</span>
    </div>
  );
}
