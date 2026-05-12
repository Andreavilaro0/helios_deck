import { motion } from "motion/react";
import type { PlanetDescriptor } from "./planet-explorer";
import { PLANET_CAROUSEL_PLANETS } from "./planet-explorer-mock";
import { CosmicGlassPanel } from "./CosmicGlassPanel";

export function OrbitOverview({ planet }: { planet: PlanetDescriptor }) {
  const visiblePlanets = PLANET_CAROUSEL_PLANETS;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05, duration: 0.48, ease: "easeOut" }}
    >
      <CosmicGlassPanel accent="rgba(99,157,255,0.16)" className="h-full p-4">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/72">Orbit Overview</div>

        <div className="mt-3 overflow-hidden rounded-[20px] border border-white/6 bg-[radial-gradient(circle_at_10%_46%,rgba(255,127,59,0.28),transparent_28%),linear-gradient(180deg,rgba(8,12,26,0.74)_0%,rgba(6,10,20,0.62)_100%)] px-3 py-4">
          <div className="relative h-[96px]">
            <div className="absolute left-1.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#ffb25f] shadow-[0_0_16px_rgba(255,176,95,0.82)]" />
            {visiblePlanets.map((item, index) => (
              <div
                key={item.id}
                className="absolute top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: 16 + index * 27,
                  width: item.id === planet.id ? 12 : index === 5 ? 15 : 8,
                  height: item.id === planet.id ? 12 : index === 5 ? 15 : 8,
                  background: item.id === planet.id ? item.accentColor : "rgba(255,255,255,0.65)",
                  boxShadow: item.id === planet.id ? `0 0 12px ${item.accentColor}` : "none",
                }}
              />
            ))}
            {visiblePlanets.map((item, index) => (
              <div
                key={`${item.id}-orbit`}
                className="absolute left-5 top-1/2 h-[1px] -translate-y-1/2 rounded-full border border-white/6"
                style={{
                  width: 16 + index * 27,
                  borderColor: item.id === planet.id ? `${planet.accentColor}55` : "rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-[18px] font-semibold tracking-[-0.03em]" style={{ color: planet.accentColor }}>
          {planet.orbitIndex}th Planet from the Sun
        </div>
      </CosmicGlassPanel>
    </motion.div>
  );
}
