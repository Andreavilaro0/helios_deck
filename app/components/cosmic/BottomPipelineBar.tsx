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
    <div className="flex items-center gap-3">
      <div className="size-11 rounded-xl flex items-center justify-center shrink-0">
        <Icon className={`size-5 ${colorClass}`} />
      </div>
      <div>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-[13px] font-mono text-slate-200 tabular-nums font-semibold">{value}</div>
        {sub && <div className="text-[9px] font-mono text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function BottomPipelineBar({ kpSignal }: Props) {
  const freshness = getSignalFreshness(kpSignal);
  const freshLabel =
    freshness.status === "fresh"
      ? "Excelente"
      : freshness.status === "stale"
        ? "Desactualizado"
        : "Sin datos";
  const freshClass =
    freshness.status === "fresh"
      ? "text-emerald-400"
      : freshness.status === "stale"
        ? "text-amber-400"
        : "text-slate-600";

  return (
    <div
      className="flex items-center justify-between px-8 shrink-0 gap-6"
      style={{
        height: "100px",
        background: "transparent",
      }}
    >
      <IconModule
        icon={Database}
        colorClass="text-emerald-500/80"
        glowColor="#10b981"
        label="Datos ingeridos"
        value={formatLastObserved(kpSignal)}
      />

      <IconModule
        icon={RefreshCw}
        colorClass={freshClass}
        glowColor="#06b6d4"
        label="Actualización"
        value={`${formatAge(kpSignal)} · ${freshLabel}`}
      />

      <div className="hidden sm:block">
        <IconModule
          icon={Globe}
          colorClass="text-[#6289ce]"
          glowColor="#6289ce"
          label="Fuente de datos"
          value="NOAA SWPC"
          sub="swpc.noaa.gov"
        />
      </div>

      <div className="hidden md:block">
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-2">Pipeline de datos</div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Database className="size-4 text-emerald-500/70" />
          <span className="text-slate-300">SQLite</span>
          <span className="text-slate-600 mx-0.5">→</span>
          <Globe className="size-4 text-[#6289ce]/70" />
          <span className="text-slate-300">SSR</span>
          <span className="text-slate-600 mx-0.5">→</span>
          <Monitor className="size-4 text-[#8aa4d9]/70" />
          <span className="text-slate-300">UI</span>
        </div>
      </div>

      <IconModule
        icon={Monitor}
        colorClass="text-emerald-500/80"
        glowColor="#10b981"
        label="Estado del sistema"
        value="Operacional"
      />
    </div>
  );
}
