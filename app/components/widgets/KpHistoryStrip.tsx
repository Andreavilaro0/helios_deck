import type { SignalRecord } from "~/types/signal";

interface Props {
  signals: SignalRecord[];
}

const KP_MAX = 9;

function barColor(kp: number): string {
  if (kp >= 5) return "#f87171";
  if (kp >= 4) return "#fbbf24";
  return "#7dd3fc";
}

export function KpHistoryStrip({ signals }: Props) {
  if (signals.length === 0) return null;

  const bars = [...signals].reverse();
  const oldest = bars.at(0)?.timestamp.replace("T", " ").replace("Z", " UTC");
  const latest = bars.at(-1)?.timestamp.replace("T", " ").replace("Z", " UTC");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-900">Kp Performance</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Last {signals.length} readings</p>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Scale 0–{KP_MAX}</span>
      </div>

      <div className="relative h-28">
        <div
          className="absolute inset-x-0 border-t border-dashed border-red-300/60 pointer-events-none"
          style={{ bottom: `${Math.round((5 / KP_MAX) * 100)}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute right-0 text-[8px] font-mono text-red-400/60 leading-none translate-y-1/2"
          style={{ bottom: `${Math.round((5 / KP_MAX) * 100)}%` }}
          aria-hidden="true"
        >
          5
        </div>
        <div
          className="absolute inset-x-0 border-t border-dashed border-amber-300/50 pointer-events-none"
          style={{ bottom: `${Math.round((4 / KP_MAX) * 100)}%` }}
          aria-hidden="true"
        />

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
                className="flex-1 min-w-0 rounded-t-sm"
                style={{
                  height: `${Math.max(heightPct, 2)}%`,
                  backgroundColor: barColor(kp),
                  opacity: 0.8,
                }}
                title={`${s.timestamp}: Kp ${kp}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-[9px] font-mono text-slate-400">
        <span>{oldest}</span>
        <span>{latest}</span>
      </div>
    </div>
  );
}
