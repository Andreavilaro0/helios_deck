import { Clock3 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CosmicGlassPanel } from "./CosmicGlassPanel";

function useUtcClock() {
  const [utc, setUtc] = useState(() => new Date().toISOString().slice(11, 19));

  useEffect(() => {
    const id = window.setInterval(() => {
      setUtc(new Date().toISOString().slice(11, 19));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return utc;
}

export function CosmicTopBar({ heroAge }: { heroAge?: string }) {
  const utc = useUtcClock();

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-wrap items-center gap-2.5 rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(5,12,26,0.54)_0%,rgba(3,9,19,0.46)_100%)] px-5 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
    >
      <div className="text-[21px] font-semibold tracking-[-0.03em] text-white md:text-[24px]">Planet Explorer</div>

      <motion.div
        animate={{ boxShadow: ["0 0 0 rgba(39,230,184,0)", "0 0 12px rgba(39,230,184,0.22)", "0 0 0 rgba(39,230,184,0)"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="ml-0 flex items-center gap-2 rounded-full border border-[#2ce6b82c] bg-[rgba(10,28,33,0.42)] px-3 py-1 md:ml-1"
      >
        <span className="h-2 w-2 rounded-full bg-[#27e6b8]" />
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white">Active</span>
      </motion.div>

      <div className="ml-auto flex flex-wrap items-center gap-2.5">
        <CosmicGlassPanel className="rounded-[16px] px-3 py-1.5" panelStyle={{ boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
          <div className="flex items-center gap-2 text-white/62">
            <Clock3 size={13} />
            <span className="font-mono text-[10px]">{heroAge ? `${heroAge} ago` : "—"}</span>
          </div>
        </CosmicGlassPanel>

        <CosmicGlassPanel className="rounded-[16px] px-3.5 py-1.5" panelStyle={{ boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
          <div className="font-mono text-[11px] tracking-[0.18em] text-white">{utc} UTC</div>
        </CosmicGlassPanel>

        <CosmicGlassPanel
          accent="rgba(77,153,255,0.32)"
          className="rounded-[16px] px-3.5 py-1.5"
          panelStyle={{ boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
        >
          <div className="text-[11px] font-mono tracking-[0.16em] text-white/90">NOAA SWPC</div>
        </CosmicGlassPanel>
      </div>
    </motion.header>
  );
}
