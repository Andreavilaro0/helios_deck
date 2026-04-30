import type { SignalRecord } from "~/types/signal";

interface Props {
  signals: SignalRecord[];
}

const KP_MAX = 9;

function barColor(kp: number): string {
  if (kp >= 5) return "#f87171";
  if (kp >= 4) return "#facc15";
  return "#38bdf8";
}

export function KpHistoryStrip({ signals }: Props) {
  if (signals.length === 0) return null;

  // Reverse so oldest is on the left, newest on the right
  const bars = [...signals].reverse();
  const oldest = bars.at(0)?.timestamp.replace("T", " ").replace("Z", " UTC");
  const latest = bars.at(-1)?.timestamp.replace("T", " ").replace("Z", " UTC");

  return (
    <div className="bg-[#070d1a] border border-cyan-900/30 rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
        <span className="text-cyan-500/70">
          Kp Telemetry — Last {signals.length} readings
        </span>
        <span className="text-slate-700">Scale 0 – {KP_MAX}</span>
      </div>

      <div className="relative h-20">
        {/* Threshold reference lines */}
        <div
          className="absolute inset-x-0 border-t border-dashed border-red-500/25 pointer-events-none"
          style={{ bottom: `${Math.round((5 / KP_MAX) * 100)}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute right-0 text-[8px] font-mono text-red-500/30 leading-none translate-y-1/2"
          style={{ bottom: `${Math.round((5 / KP_MAX) * 100)}%` }}
          aria-hidden="true"
        >
          5
        </div>
        <div
          className="absolute inset-x-0 border-t border-dashed border-yellow-500/20 pointer-events-none"
          style={{ bottom: `${Math.round((4 / KP_MAX) * 100)}%` }}
          aria-hidden="true"
        />

        {/* Bars */}
        <div
          className="absolute inset-0 flex items-end gap-px"
          role="img"
          aria-label="Kp index history chart"
        >
          {bars.map((s) => {
            const kp = typeof s.value === "number" ? s.value : 0;
            const heightPct = Math.round((kp / KP_MAX) * 100);
            return (
              <div
                key={s.timestamp}
                className="flex-1 min-w-0"
                style={{
                  height: `${Math.max(heightPct, 2)}%`,
                  backgroundColor: barColor(kp),
                  opacity: 0.7,
                }}
                title={`${s.timestamp}: Kp ${kp}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-[9px] font-mono text-slate-700">
        <span>{oldest}</span>
        <span>{latest}</span>
      </div>
    </div>
  );
}
