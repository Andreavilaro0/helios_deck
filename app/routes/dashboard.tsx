import type { Route } from "./+types/dashboard";
import { InstrumentShell } from "~/components/dashboard/InstrumentShell";
import { InstrumentHeader } from "~/components/dashboard/InstrumentHeader";
import { MissionStatusPanel } from "~/components/dashboard/MissionStatusPanel";
import { KpScaleInstrument } from "~/components/dashboard/KpScaleInstrument";
import { CenterMetricsBar } from "~/components/dashboard/CenterMetricsBar";
import { PlanetPanel } from "~/components/dashboard/PlanetPanel";
import { KpTelemetryPanel } from "~/components/widgets/KpTelemetryPanel";
import { KpHistoryStrip } from "~/components/widgets/KpHistoryStrip";
import { SolarWindTelemetryPanel } from "~/components/widgets/SolarWindTelemetryPanel";
import { EmptyDashboardState } from "~/components/widgets/EmptyDashboardState";
import {
  getLatestSignalByName,
  listRecentSignalsByName,
} from "~/services/signals.server";
import type { SignalRecord } from "~/types/signal";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Geomagnetic Monitor" },
    { name: "description", content: "Live Kp index and space weather signals. NOAA SWPC." },
  ];
}

export function loader(_: Route.LoaderArgs) {
  const latestSignal = getLatestSignalByName("kp-index");
  const recentSignals = listRecentSignalsByName("kp-index", 60);
  const latestSolarWind = getLatestSignalByName("solar-wind-speed");

  const kpValues = recentSignals
    .map((s) => (typeof s.value === "number" ? s.value : null))
    .filter((v): v is number => v !== null);

  const stats = {
    count: recentSignals.length,
    max: kpValues.length ? Math.max(...kpValues) : 0,
    min: kpValues.length ? Math.min(...kpValues) : 0,
    avg: kpValues.length
      ? kpValues.reduce((a, b) => a + b, 0) / kpValues.length
      : 0,
  };

  return { latestSignal, recentSignals, latestSolarWind, stats };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { latestSignal, recentSignals, latestSolarWind, stats } = loaderData;

  return (
    <InstrumentShell>
      <InstrumentHeader />
      <div className="p-3 max-w-screen-2xl mx-auto">
        {latestSignal ? (
          <InstrumentGrid
            latestSignal={latestSignal}
            recentSignals={recentSignals}
            latestSolarWind={latestSolarWind}
            stats={stats}
          />
        ) : (
          <div className="pt-6">
            <EmptyDashboardState />
          </div>
        )}
      </div>
    </InstrumentShell>
  );
}

// ---------------------------------------------------------------------------
// 3-column spaceweather-style grid
// ---------------------------------------------------------------------------

interface InstrumentGridProps {
  latestSignal: SignalRecord;
  recentSignals: SignalRecord[];
  latestSolarWind: SignalRecord | null;
  stats: { count: number; max: number; min: number; avg: number };
}

function InstrumentGrid({ latestSignal, recentSignals, latestSolarWind, stats }: InstrumentGridProps) {
  const currentKp = typeof latestSignal.value === "number" ? latestSignal.value : 0;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr_260px] lg:items-start">

      {/* LEFT — scale + pipeline */}
      <div className="flex flex-col gap-3">
        <KpScaleInstrument currentKp={currentKp} />
        <MissionStatusPanel
          source={latestSignal.source}
          recordCount={stats.count}
          maxKp={stats.max}
          minKp={stats.min}
          avgKp={stats.avg}
        />
      </div>

      {/* CENTER — metrics bar + planet + history */}
      <div className="flex flex-col gap-3">
        <CenterMetricsBar signal={latestSignal} solarWind={latestSolarWind} />
        <div className="h-[480px] lg:h-[520px]">
          <PlanetPanel signal={latestSignal} solarWind={latestSolarWind} />
        </div>
        <KpHistoryStrip signals={recentSignals} />
      </div>

      {/* RIGHT — Kp readout + solar wind */}
      <div className="flex flex-col gap-3">
        <KpTelemetryPanel signal={latestSignal} />
        <SolarWindTelemetryPanel signal={latestSolarWind} />
      </div>

    </div>
  );
}
