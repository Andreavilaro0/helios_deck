export function EmptyDashboardState() {
  return (
    <div className="bg-[#070d1a] border border-dashed border-cyan-900/30 rounded-sm p-12 text-center space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-mono text-slate-400">
          No signal data available
        </p>
        <p className="text-xs font-mono text-slate-600">
          Populate the database with real NOAA Kp readings:
        </p>
      </div>
      <code className="inline-block text-xs bg-black/40 text-slate-400 rounded-sm border border-cyan-900/30 px-4 py-2 font-mono">
        npm run ingest:noaa-kp
      </code>
      <p className="text-[10px] font-mono text-slate-700">
        Then reload this page.
      </p>
    </div>
  );
}
