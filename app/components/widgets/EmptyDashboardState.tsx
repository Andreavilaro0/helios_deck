export function EmptyDashboardState() {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-slate-500">No signal data available</p>
        <p className="text-xs text-slate-400">
          Populate the database with real NOAA Kp readings:
        </p>
      </div>
      <code className="inline-block text-xs bg-slate-50 text-slate-600 rounded-lg border border-slate-200 px-4 py-2 font-mono">
        npm run ingest:noaa-kp
      </code>
      <p className="text-[10px] text-slate-400">Then reload this page.</p>
    </div>
  );
}
