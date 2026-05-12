import { motion } from "motion/react";
import type { StatusMetric } from "./planet-explorer-mock";
import { CosmicGlassPanel } from "./CosmicGlassPanel";

export function StatusBar({ metrics }: { metrics: StatusMetric[] }) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.48, ease: "easeOut" }}
    >
      <CosmicGlassPanel
        accent="rgba(92,164,255,0.22)"
        className="rounded-[24px] px-2 py-1"
        panelStyle={{
          background: "linear-gradient(180deg, rgba(6,16,34,0.34) 0%, rgba(3,9,20,0.46) 100%)",
        }}
      >
        <div className="grid gap-1 md:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="flex min-w-0 items-start gap-2.5 rounded-[18px] px-3.5 py-2.5">
                <div className="mt-0.5" style={{ color: metric.accent }}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/42">{metric.title}</div>
                  <div className="mt-1 text-[12px] font-medium text-white">{metric.value}</div>
                  {metric.subvalue ? <div className="mt-0.5 text-[10px]" style={{ color: metric.accent }}>{metric.subvalue}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </CosmicGlassPanel>
    </motion.footer>
  );
}
