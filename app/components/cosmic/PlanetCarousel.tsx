import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import type { PlanetDescriptor, PlanetId } from "./planet-explorer";
import { PLANET_CAROUSEL_PLANETS } from "./planet-explorer-mock";
import { CosmicGlassPanel } from "./CosmicGlassPanel";

function PlanetCard({
  planet,
  active,
  onSelect,
}: {
  planet: PlanetDescriptor;
  active: boolean;
  onSelect: (planetId: PlanetId) => void;
}) {
  return (
    <button type="button" onClick={() => onSelect(planet.id)} className="group relative min-w-[156px] text-left">
      <CosmicGlassPanel
        accent={`color-mix(in srgb, ${planet.accentColor} 60%, transparent)`}
        glow={active}
        className="h-[172px] rounded-[26px] px-4 pb-5 pt-4 transition-all duration-300"
        panelStyle={{
          borderColor: active ? `${planet.accentColor}c7` : "rgba(255,255,255,0.1)",
          background: active
            ? `linear-gradient(180deg, ${planet.glowColor}22 0%, rgba(9,16,32,0.94) 44%, rgba(4,10,20,0.98) 100%)`
            : "linear-gradient(180deg, rgba(14,23,44,0.84) 0%, rgba(6,12,24,0.96) 100%)",
        }}
      >
        <div
          className="mx-auto mb-5 h-[96px] w-[96px] rounded-full"
          style={{
            backgroundImage: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.46) 0%, transparent 28%), url(${planet.texturePath})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            boxShadow: active ? `0 0 24px ${planet.glowColor}b3` : `0 0 12px ${planet.glowColor}55`,
          }}
        />

        <div className="text-center text-[11px] font-mono uppercase tracking-[0.28em] text-white">{planet.name}</div>
        <div className={`mt-3 text-center text-[12px] ${active ? "text-[#ffb15a]" : "text-white/0"}`}>Selected</div>
        {active ? <div className="absolute inset-x-8 bottom-0 h-[3px] rounded-full" style={{ background: planet.accentColor }} /> : null}
      </CosmicGlassPanel>
    </button>
  );
}

export function PlanetCarousel({
  selectedPlanet,
  onSelectPlanet,
  onPrevious,
  onNext,
}: {
  selectedPlanet: PlanetId;
  onSelectPlanet: (planetId: PlanetId) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.46, ease: "easeOut" }}
      className="flex items-center gap-4"
    >
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous planet"
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#6aa6ff80] bg-[rgba(9,20,44,0.92)] text-[#a9d0ff] shadow-[0_0_22px_rgba(93,146,255,0.24)] transition hover:scale-[1.03]"
      >
        <ChevronLeft size={22} />
      </button>

      <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-2">
        {PLANET_CAROUSEL_PLANETS.map((planet) => (
          <PlanetCard
            key={planet.id}
            planet={planet}
            active={planet.id === selectedPlanet}
            onSelect={onSelectPlanet}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next planet"
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#6aa6ff80] bg-[rgba(9,20,44,0.92)] text-[#a9d0ff] shadow-[0_0_22px_rgba(93,146,255,0.24)] transition hover:scale-[1.03]"
      >
        <ChevronRight size={22} />
      </button>
    </motion.div>
  );
}
