import type { SignalRecord } from "~/types/signal";

interface Props {
  signal: SignalRecord;
  solarWind: SignalRecord | null;
}

function kpStatus(kp: number): { label: string; color: string } {
  if (kp >= 5) return { label: "STORM", color: "text-red-500" };
  if (kp >= 4) return { label: "ACTIVE", color: "text-amber-500" };
  return { label: "QUIET", color: "text-sky-500" };
}

export function CenterMetricsBar({ signal, solarWind }: Props) {
  const kp = typeof signal.value === "number" ? signal.value : 0;
  const windSpeed = solarWind && typeof solarWind.value === "number" ? solarWind.value : null;
  const { label, color } = kpStatus(kp);

  return (
    <div className="bg-white rounded-2xl shadow-sm px-5 py-3 flex items-center gap-5 flex-wrap">
      <Metric
        icon="⇌"
        label="Solar Wind"
        value={windSpeed !== null ? `${windSpeed.toFixed(1)} km/s` : "—"}
      />
      <Divider />
      <Metric icon="⚡" label="Kp Index" value={kp.toFixed(2)} />
      <Divider />
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">Status</span>
        <span className={`text-sm font-bold font-mono ${color}`}>{label}</span>
      </div>
      <Divider />
      <Metric icon="📡" label="Source" value={signal.source} />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base" aria-hidden="true">{icon}</span>
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-slate-900 font-mono">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-slate-200 shrink-0" aria-hidden="true" />;
}
