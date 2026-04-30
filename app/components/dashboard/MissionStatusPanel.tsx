const PIPELINE_STEPS = [
  "NOAA SWPC",
  "HELIOS_DECK",
  "SQLite",
  "SSR",
] as const;

interface Props {
  source: string;
  recordCount: number;
  maxKp: number;
  minKp: number;
  avgKp: number;
}

export function MissionStatusPanel({
  source,
  recordCount,
  maxKp,
  minKp,
  avgKp,
}: Props) {
  return (
    <div className="bg-[#070d1a] border border-cyan-900/30 rounded-sm p-4 space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 border-b border-cyan-900/20 pb-2">
        Data Pipeline
      </div>

      <div className="space-y-1.5">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2 text-[11px] font-mono">
            <span className="size-1 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
            <span className="text-slate-400">{step}</span>
            {i < PIPELINE_STEPS.length - 1 && (
              <span className="text-slate-700 text-[9px]">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-cyan-900/20 pt-3 space-y-1.5 text-[10px] font-mono">
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
      <span className="text-slate-700">{label}</span>
      <span className="text-slate-400 tabular-nums">{value}</span>
    </div>
  );
}
