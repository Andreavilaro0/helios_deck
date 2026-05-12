import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { NavLink } from "react-router";
import type { PlanetDescriptor } from "./planet-explorer";
import { PLANET_EXPLORER_NAV, PLANET_EXPLORER_TAGS } from "./planet-explorer-mock";
import { CosmicGlassPanel } from "./CosmicGlassPanel";

export function CosmicSidebar({ planet }: { planet: PlanetDescriptor }) {
  return (
    <aside className="flex min-h-0 flex-col rounded-[28px] border border-white/6 bg-[linear-gradient(180deg,rgba(3,9,20,0.68)_0%,rgba(2,7,16,0.8)_100%)] px-3.5 py-4.5 shadow-[0_14px_34px_rgba(0,0,0,0.2)]">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mb-5 flex items-center gap-3"
      >
        <div className="grid h-11 w-11 place-items-center rounded-full border border-[#4f8dff3d] bg-[#061326]/75 shadow-[0_0_18px_rgba(82,140,255,0.18)]">
          <div className="grid h-6.5 w-6.5 place-items-center rounded-full border border-[#61b3ff66]">
            <div className="h-2 w-2 rounded-full bg-[#35d2ff] shadow-[0_0_10px_rgba(53,210,255,0.68)]" />
          </div>
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-[0.28em] text-white">HELIOS</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#4fa9ff]">Observatory</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: "easeOut" }}
      >
        <CosmicGlassPanel accent="rgba(91,157,255,0.24)" glow className="mb-5 p-3.5">
          <div className="text-[11px] text-white/48">Current view</div>
          <div className="mt-1.5 text-[14px] font-medium text-white">Planet Explorer</div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[18px] font-semibold text-white">{planet.name}</div>
              <div className="mt-1 text-[12px] text-white/42">{planet.subtitle}</div>
            </div>
            <div
              className="h-10 w-10 rounded-full border border-white/10 shadow-[0_0_14px_rgba(255,138,69,0.24)]"
              style={{
                backgroundImage: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.46) 0%, transparent 28%), url(${planet.texturePath})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/34">
            <span>Current view</span>
            <ChevronRight size={12} />
          </div>
        </CosmicGlassPanel>
      </motion.div>

      <div className="space-y-2">
        {PLANET_EXPLORER_NAV.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + index * 0.05, duration: 0.38, ease: "easeOut" }}
            >
              <NavLink to={`/${item.id}`} className="group block w-full">
                {({ isActive }) => (
                  <div
                    className="flex items-center gap-3 rounded-[18px] border px-3 py-2.5 transition-all duration-300"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, rgba(15,29,55,0.56) 0%, rgba(7,15,31,0.66) 100%)"
                        : "rgba(255,255,255,0.01)",
                      borderColor: isActive ? "rgba(112,181,255,0.36)" : "rgba(255,255,255,0.05)",
                      boxShadow: isActive ? "0 0 14px rgba(93,151,255,0.12)" : "none",
                    }}
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full border border-white/8 bg-white/3 text-[#9fd4ff]">
                      <Icon size={15} />
                    </div>
                    <span className={`text-[13px] ${isActive ? "font-medium text-white" : "text-white/58"}`}>{item.label}</span>
                  </div>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-white/6 pt-4.5">
        <div className="flex flex-wrap gap-2">
          {PLANET_EXPLORER_TAGS.map((tag) => (
            <div key={tag} className="rounded-lg border border-white/7 bg-white/3 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.16em] text-white/42">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
