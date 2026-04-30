import { Link } from "react-router";

export function InstrumentHeader() {
  return (
    <header className="border-b border-cyan-900/30 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className="size-1.5 rounded-full bg-emerald-400 animate-pulse"
            aria-hidden="true"
          />
          <span className="text-sm font-bold font-mono tracking-tight text-slate-100">
            HELIOS_DECK
          </span>
        </div>
        <span className="text-slate-700 select-none">/</span>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
          Planetary Geomagnetic Monitor
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wide">
        <span className="text-emerald-400/70 flex items-center gap-1.5">
          <span className="size-1 rounded-full bg-emerald-400" aria-hidden="true" />
          Feed active
        </span>
        <span className="text-slate-600 hidden md:block">NOAA SWPC</span>
        <span className="text-slate-600 hidden md:block">1-min cadence</span>
        <span className="text-slate-600 hidden lg:block">UTC</span>
        <Link
          to="/"
          className="text-slate-600 hover:text-slate-300 transition-colors normal-case tracking-normal text-xs font-sans"
        >
          ← home
        </Link>
      </div>
    </header>
  );
}
