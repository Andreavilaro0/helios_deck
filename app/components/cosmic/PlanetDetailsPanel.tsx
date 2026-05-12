import { Clock3, Gauge, Info, MoonStar, Thermometer, Waves } from "lucide-react";
import { motion } from "motion/react";
import type { PlanetDescriptor } from "./planet-explorer";
import { CosmicGlassPanel } from "./CosmicGlassPanel";

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 py-3.5 last:border-b-0">
      <div className="flex items-center gap-2.5 text-white/52">
        <Icon size={14} className="text-[#62b8ff]" />
        <span className="text-[10px] font-mono uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="text-[13px] font-medium text-white">{value}</div>
    </div>
  );
}

export function PlanetDetailsPanel({ planet }: { planet: PlanetDescriptor }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
    >
      <CosmicGlassPanel accent="rgba(108,163,255,0.18)" className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/72">Detalles del Planeta</div>
          <Info size={14} className="text-white/34" />
        </div>

        <div className="mt-2.5">
          <DetailRow icon={Gauge} label="Radio" value={planet.details.radiusLabel} />
          <DetailRow icon={Clock3} label="Duración del Día" value={planet.details.dayLength} />
          <DetailRow icon={Waves} label="Atmósfera" value={planet.details.atmosphere} />
          <DetailRow icon={Thermometer} label="Temp. Superficial" value={planet.details.surfaceTemp} />
          <DetailRow icon={MoonStar} label="Lunas" value={planet.details.moons} />
        </div>
      </CosmicGlassPanel>
    </motion.div>
  );
}
