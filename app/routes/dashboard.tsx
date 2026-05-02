import type { Route } from "./+types/dashboard";
import { InstrumentShell } from "~/components/dashboard/InstrumentShell";
import { InstrumentHeader } from "~/components/dashboard/InstrumentHeader";
import { MissionStatusPanel } from "~/components/dashboard/MissionStatusPanel";
import { KpScaleInstrument } from "~/components/dashboard/KpScaleInstrument";
import { KpTelemetryPanel } from "~/components/widgets/KpTelemetryPanel";
import { KpHistoryStrip } from "~/components/widgets/KpHistoryStrip";
import { SolarWindPanel } from "~/components/widgets/SolarWindPanel";
import { XRayFluxTelemetryPanel } from "~/components/widgets/XRayFluxTelemetryPanel";
import { ProtonFluxTelemetryPanel } from "~/components/widgets/ProtonFluxTelemetryPanel";
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
  const latestXRayFlux = getLatestSignalByName("xray-flux-long");
  const latestProtonFlux = getLatestSignalByName("proton-flux-10mev");

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

  return { latestSignal, recentSignals, latestSolarWind, latestXRayFlux, latestProtonFlux, stats };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { latestSignal, recentSignals, latestSolarWind, latestXRayFlux, latestProtonFlux, stats } =
    loaderData;

  return (
    <InstrumentShell>
      <InstrumentHeader />
      <div className="max-w-screen-2xl mx-auto px-4 py-4 space-y-px">
        {latestSignal ? (
          <InstrumentGrid
            latestSignal={latestSignal}
            recentSignals={recentSignals}
            latestSolarWind={latestSolarWind}
            latestXRayFlux={latestXRayFlux}
            latestProtonFlux={latestProtonFlux}
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
// Instrument grid — only rendered when Kp data is present
// ---------------------------------------------------------------------------

interface InstrumentGridProps {
  latestSignal: SignalRecord;
  recentSignals: SignalRecord[];
  latestSolarWind: SignalRecord | null;
  latestXRayFlux: SignalRecord | null;
  latestProtonFlux: SignalRecord | null;
  stats: {
    count: number;
    max: number;
    min: number;
    avg: number;
  };
}

/** Thin section label above a panel group, communicating the causal chain. */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-700 px-1 pb-1">
      {label}
    </div>
  );
}

/**
 * Organises panels into three causal sections:
 *   Solar Activity (XRay + Proton) → Solar Driver (Wind) → Geomagnetic Response (Kp + Scale + Status)
 */
function InstrumentGrid({
  latestSignal,
  recentSignals,
  latestSolarWind,
  latestXRayFlux,
  latestProtonFlux,
  stats,
}: InstrumentGridProps) {
  const currentKp =
    typeof latestSignal.value === "number" ? latestSignal.value : 0;

  return (
    <div className="space-y-px">
      {/* Causal chain — three sections */}
      <div className="grid grid-cols-1 gap-px lg:grid-cols-[2fr_1fr_3fr]">

        {/* ── Solar Activity ── XRay + Proton ── */}
        <div className="space-y-px">
          <SectionLabel label="Solar Activity" />
          <div className="grid grid-cols-2 gap-px">
            <XRayFluxTelemetryPanel signal={latestXRayFlux} />
            <ProtonFluxTelemetryPanel signal={latestProtonFlux} />
          </div>
        </div>

        {/* ── Solar Driver ── Solar Wind ── */}
        <div className="space-y-px">
          <SectionLabel label="Solar Driver" />
          {latestSolarWind ? (
            <SolarWindPanel signal={latestSolarWind} />
          ) : (
            <div className="bg-[#070d1a] border border-cyan-900/30 border-l-2 border-l-slate-700 rounded-sm p-4 flex flex-col items-center justify-center space-y-1 h-full min-h-[120px]">
              <span className="text-sm font-mono text-slate-500">
                Wind channel awaiting ingest
              </span>
              <span className="text-[10px] font-mono text-slate-700">
                npm run ingest:noaa-solar-wind
              </span>
            </div>
          )}
        </div>

        {/* ── Geomagnetic Response ── Kp + Scale + Status ── */}
        <div className="space-y-px">
          <SectionLabel label="Geomagnetic Response" />
          <div className="grid grid-cols-3 gap-px">
            <KpTelemetryPanel signal={latestSignal} />
            <KpScaleInstrument currentKp={currentKp} />
            <MissionStatusPanel
              source={latestSignal.source}
              recordCount={stats.count}
              maxKp={stats.max}
              minKp={stats.min}
              avgKp={stats.avg}
            />
          </div>
        </div>
      </div>

      {/* Bottom — full-width history strip */}
      <KpHistoryStrip signals={recentSignals} />
    </div>
  );
}
