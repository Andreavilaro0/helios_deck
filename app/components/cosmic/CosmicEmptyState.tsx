import { Link } from "react-router";

export function CosmicEmptyState() {
  return (
    <div className="bg-[#030712] flex items-center justify-center" style={{ height: "calc(100vh - 68px)" }}>
      <div className="bg-[#070d1a] border border-dashed border-cyan-900/30 rounded-sm p-12 text-center space-y-4 max-w-sm">
        <div className="space-y-2">
          <p className="text-sm font-mono text-slate-400">
            Sin datos de señal disponibles
          </p>
          <p className="text-xs font-mono text-slate-600">
            Poblar la base de datos con lecturas reales de NOAA Kp:
          </p>
        </div>
        <code className="inline-block text-xs bg-black/40 text-slate-400 rounded-sm border border-cyan-900/30 px-4 py-2 font-mono">
          npm run ingest:noaa-kp
        </code>
        <p className="text-[10px] font-mono text-slate-700">
          Luego recarga esta página.
        </p>
        <Link
          to="/dashboard"
          className="block text-xs font-mono text-cyan-700 hover:text-cyan-400 transition-colors mt-2"
        >
          ← volver al panel
        </Link>
      </div>
    </div>
  );
}
