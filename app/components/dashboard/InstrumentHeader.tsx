import { Link } from "react-router";

export function InstrumentHeader() {
  return (
    <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-lg bg-slate-900 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold font-mono">H</span>
        </div>
        <span className="text-sm font-bold text-slate-900 font-mono tracking-tight">
          HELIOS_DECK
        </span>
        <span className="text-slate-200 select-none" aria-hidden="true">/</span>
        <span className="text-xs text-slate-400 hidden sm:block">
          Geomagnetic Monitor
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/cosmic-view"
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          Cosmic View →
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          Live
        </span>
        <Link to="/" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
          ← home
        </Link>
      </div>
    </header>
  );
}
