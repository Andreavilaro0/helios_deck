import { SunMedium } from "lucide-react";
import { motion } from "motion/react";
import { CosmicGlassPanel } from "./CosmicGlassPanel";

export function SolarFluxCard({ value, state }: { value: string; state: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="w-full max-w-[250px]"
    >
      <CosmicGlassPanel
        accent="rgba(255,138,69,0.48)"
        glow
        className="px-4.5 py-4"
        panelStyle={{
          background: "linear-gradient(180deg, rgba(24,16,14,0.74) 0%, rgba(12,8,14,0.88) 100%)",
        }}
      >
        <div className="mb-3.5 flex items-center gap-3 text-[#ffb15a]">
          <div className="grid h-8.5 w-8.5 place-items-center rounded-full border border-[#ffb15a44] bg-[#29150f]">
            <SunMedium size={15} />
          </div>
          <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-white/82">Solar Flux</div>
        </div>

        <div className="flex items-end gap-3">
          <div className="text-[29px] font-semibold leading-none tracking-[-0.03em] text-white">{value}</div>
          <div className="pb-1 text-[12px] text-white/52">W/m²</div>
        </div>

        <div className="mt-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-[#ff9d45]">{state}</div>
      </CosmicGlassPanel>
    </motion.div>
  );
}
