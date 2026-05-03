import { Database, Globe, Monitor, RefreshCw } from "lucide-react";
import type { SignalRecord } from "~/types/signal";
import { getSignalFreshness } from "~/utils/signal-freshness";

interface Props {
  kpSignal: SignalRecord | null;
}

function formatLastObserved(signal: SignalRecord | null): string {
  if (!signal) return "—";
  return new Date(signal.timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function formatAge(signal: SignalRecord | null): string {
  const f = getSignalFreshness(signal);
  if (f.status === "missing" || f.ageMinutes === null) return "—";
  if (f.ageMinutes < 1) return `${Math.round(f.ageMinutes * 60)}s`;
  if (f.ageMinutes < 60) return `${Math.round(f.ageMinutes)}m`;
  return `${Math.round(f.ageMinutes / 60)}h`;
}

interface IconModuleProps {
  icon: typeof Database;
  colorClass: string;
  glowColor: string;
  label: string;
  value: string;
  sub?: string;
}

function IconModule({ icon: Icon, colorClass, glowColor, label, value, sub }: IconModuleProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="size-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: `${glowColor}12`,
          border: `1px solid ${glowColor}25`,
          boxShadow: `0 0 10px ${glowColor}15`,
        }}
      >
        <Icon className={`size-4 ${colorClass}`} />
      </div>
      <div>
        <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">{label}</div>
        <div className="text-[10px] font-mono text-slate-300 tabular-nums">{value}</div>
        {sub && <div className="text-[8px] font-mono text-slate-700">{sub}</div>}
      </div>
    </div>
  );
}

export function BottomPipelineBar({ kpSignal }: Props) {
  const freshness = getSignalFreshness(kpSignal);
  const freshLabel =
    freshness.status === "fresh"
      ? "Excellent"
      : freshness.status === "stale"
        ? "Stale"
        : "No data";
  const freshClass =
    freshness.status === "fresh"
      ? "text-emerald-400"
      : freshness.status === "stale"
        ? "text-amber-400"
        : "text-slate-600";

  return (
    <div
      className="h-16 flex items-center justify-between px-6 shrink-0 gap-5 z-20"
      style={{
        background: "rgba(4,8,28,0.10)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderTop: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.18), 0 -1px 20px rgba(0,0,0,0.25)",
      }}
    >
      <IconModule
        icon={Database}
        colorClass="text-emerald-500/80"
        glowColor="#10b981"
        label="Data Ingested"
        value={formatLastObserved(kpSignal)}
      />

      <IconModule
        icon={RefreshCw}
        colorClass="text-cyan-500/80"
        glowColor="#06b6d4"
        label="Freshness"
        value={`${formatAge(kpSignal)} · ${freshLabel}`}
      />

      <div className={`text-[10px] font-mono ${freshClass} hidden sm:block`} />

      <div className="hidden sm:block">
        <IconModule
          icon={Globe}
          colorClass="text-blue-500/80"
          glowColor="#3b82f6"
          label="Data Source"
          value="NOAA SWPC"
          sub="swpc.noaa.gov"
        />
      </div>

      <div className="hidden md:block">
        <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider mb-1.5">Pipeline</div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono">
          <Database className="size-3 text-emerald-500/70" />
          <span className="text-slate-400">SQLite</span>
          <span className="text-slate-700">→</span>
          <Globe className="size-3 text-cyan-500/70" />
          <span className="text-slate-400">SSR</span>
          <span className="text-slate-700">→</span>
          <Monitor className="size-3 text-blue-500/70" />
          <span className="text-slate-400">UI</span>
        </div>
      </div>

      <IconModule
        icon={Monitor}
        colorClass="text-emerald-500/80"
        glowColor="#10b981"
        label="System Status"
        value="Operational"
      />
    </div>
  );
}
