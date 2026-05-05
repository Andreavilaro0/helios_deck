import { useState } from "react";
import type { Route } from "./+types/dashboard";
import { DashboardHero } from "~/components/dashboard/DashboardHero";
import type { OverallStatus } from "~/components/dashboard/DashboardHero";
import { DashboardSignalCard } from "~/components/dashboard/DashboardSignalCard";
import { SpaceWeatherChain } from "~/components/dashboard/SpaceWeatherChain";
import { AboutPanel } from "~/components/dashboard/AboutPanel";
import { SignalTimeline } from "~/components/charts/SignalTimeline";
import type { TimelineSignal } from "~/components/charts/SignalTimeline";
import { KpScaleInstrument } from "~/components/dashboard/KpScaleInstrument";
import { KpHistoryStrip } from "~/components/widgets/KpHistoryStrip";
import { MissionStatusPanel } from "~/components/dashboard/MissionStatusPanel";
import { EmptyDashboardState } from "~/components/widgets/EmptyDashboardState";
import { getSignalFreshness } from "~/utils/signal-freshness";
import {
  getLatestSignalByName,
  listRecentSignalsByName,
} from "~/services/signals.server";
import type { SignalRecord } from "~/types/signal";

// ---------------------------------------------------------------------------
// Interpret helpers — inline to avoid importing from widget layer
// ---------------------------------------------------------------------------

function interpretKp(v: unknown): string {
  if (typeof v !== "number") return "UNKNOWN";
  if (v < 4) return "QUIET";
  if (v < 5) return "ACTIVE";
  return "STORM";
}

function interpretXRay(v: unknown): string {
  if (typeof v !== "number") return "UNKNOWN";
  if (v < 1e-7) return "A — QUIET";
  if (v < 1e-6) return "B — MINOR";
  if (v < 1e-5) return "C — MODERATE";
  if (v < 1e-4) return "M — SIGNIFICANT";
  return "X — EXTREME";
}

function interpretProton(v: unknown): string {
  if (typeof v !== "number") return "UNKNOWN";
  if (v < 1) return "QUIET";
  if (v < 10) return "ELEVATED";
  return "RADIATION WATCH";
}

function interpretWind(v: unknown): string {
  if (typeof v !== "number") return "UNKNOWN";
  if (v < 400) return "SLOW";
  if (v < 600) return "NOMINAL";
  if (v < 800) return "FAST";
  return "EXTREME";
}

function computeOverallStatus(
  kp: SignalRecord | null,
  xray: SignalRecord | null,
  proton: SignalRecord | null
): OverallStatus {
  const kpVal = typeof kp?.value === "number" ? kp.value : 0;
  const xrayVal = typeof xray?.value === "number" ? xray.value : 0;
  const protonVal = typeof proton?.value === "number" ? proton.value : 0;
  if (kpVal >= 5 || xrayVal >= 1e-4 || protonVal >= 10) return "STORM";
  if (kpVal >= 4 || xrayVal >= 1e-6 || protonVal >= 1) return "ACTIVE";
  return "QUIET";
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function formatAge(ageMinutes: number | null): string {
  if (ageMinutes === null) return "—";
  if (ageMinutes < 60) return `${Math.round(ageMinutes)}m`;
  const h = Math.floor(ageMinutes / 60);
  const m = Math.round(ageMinutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatXRayValue(v: unknown): string {
  if (typeof v !== "number") return "—";
  return v.toExponential(2);
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(_: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Space Weather Observatory" },
    { name: "description", content: "Live space weather: Kp index, X-Ray flux, Proton flux, Solar Wind. NOAA SWPC." },
  ];
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export function loader(_: Route.LoaderArgs) {
  const now = new Date();

  const kpSignal = getLatestSignalByName("kp-index");
  const xraySignal = getLatestSignalByName("xray-flux-long");
  const protonSignal = getLatestSignalByName("proton-flux-10mev");
  const windSignal = getLatestSignalByName("solar-wind-speed");
  const recentKpSignals = listRecentSignalsByName("kp-index", 60);
  const recentXraySignals = listRecentSignalsByName("xray-flux-long", 60);
  const recentProtonSignals = listRecentSignalsByName("proton-flux-10mev", 60);
  const recentWindSignals = listRecentSignalsByName("solar-wind-speed", 60);

  const kpFresh = getSignalFreshness(kpSignal, now);
  const xrayFresh = getSignalFreshness(xraySignal, now);
  const protonFresh = getSignalFreshness(protonSignal, now);
  const windFresh = getSignalFreshness(windSignal, now);

  const kpValues = recentKpSignals
    .map((s) => (typeof s.value === "number" ? s.value : null))
    .filter((v): v is number => v !== null);

  const stats = {
    count: recentKpSignals.length,
    max: kpValues.length ? Math.max(...kpValues) : 0,
    min: kpValues.length ? Math.min(...kpValues) : 0,
    avg: kpValues.length
      ? kpValues.reduce((a, b) => a + b, 0) / kpValues.length
      : 0,
  };

  function extractNums(sigs: typeof recentKpSignals): number[] {
    return sigs
      .map((s) => (typeof s.value === "number" ? s.value : null))
      .filter((v): v is number => v !== null);
  }

  return {
    overallStatus: computeOverallStatus(kpSignal, xraySignal, protonSignal),
    generatedAt: now.toISOString(),
    kpSignal,
    xraySignal,
    protonSignal,
    windSignal,
    recentKpSignals,
    historyKp: extractNums(recentKpSignals),
    historyXray: extractNums(recentXraySignals),
    historyProton: extractNums(recentProtonSignals),
    historyWind: extractNums(recentWindSignals),
    kpFresh,
    xrayFresh,
    protonFresh,
    windFresh,
    stats,
  };
}

// ---------------------------------------------------------------------------
// Tooltip text
// ---------------------------------------------------------------------------

const TOOLTIPS = {
  xray: "Measures solar X-ray emission intensity. B-class flares are minor events with no significant Earth impact. M and X class flares can disrupt HF radio communications.",
  proton: "Counts energetic protons (≥10 MeV) near Earth. Elevated flux indicates a solar energetic particle event — hazardous for satellites and astronauts.",
  wind: "Speed of the solar wind at the L1 Lagrange point, ~1.5 million km sunward. Fast streams (>600 km/s) compress Earth's magnetosphere and enhance auroral activity.",
  kp: "Planetary K-index: a global measure of geomagnetic disturbance. Kp < 4 = quiet. Kp 4–5 = active. Kp ≥ 5 = geomagnetic storm. Ranges from 0 to 9.",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const {
    overallStatus,
    generatedAt,
    kpSignal,
    xraySignal,
    protonSignal,
    windSignal,
    recentKpSignals,
    historyKp,
    historyXray,
    historyProton,
    historyWind,
    kpFresh,
    xrayFresh,
    protonFresh,
    windFresh,
    stats,
  } = loaderData;

  const [aboutOpen, setAboutOpen] = useState(false);

  const currentKp = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
  const heroTimestamp = formatTimestamp(generatedAt);
  const timelineSignals: TimelineSignal[] = [
    { data: historyXray,   color: "var(--dash-amber)",  label: "X-Ray",  unit: "W/m²", logScale: true,  gradientId: "tl-xray"   },
    { data: historyProton, color: "var(--dash-cyan)",   label: "Proton", unit: "pfu",  logScale: false, gradientId: "tl-proton" },
    { data: historyWind,   color: "var(--dash-blue)",   label: "Wind",   unit: "km/s", logScale: false, gradientId: "tl-wind"   },
    { data: historyKp,     color: "var(--dash-violet)", label: "Kp",     unit: "",     logScale: false, gradientId: "tl-kp"     },
  ].filter((s) => s.data.length > 1);

  if (!kpSignal) {
    return (
      <div className="min-h-screen" style={{ background: "var(--dash-bg)" }}>
        <div className="pt-20 flex justify-center">
          <EmptyDashboardState />
        </div>
        <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--dash-bg)" }}>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <div className="relative">
          <DashboardHero
            overallStatus={overallStatus}
            timestamp={heroTimestamp}
          />
          <button
            onClick={() => setAboutOpen(true)}
            className="absolute top-6 right-0 flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            type="button"
          >
            <span className="text-sm">ⓘ</span>
            About
          </button>
        </div>

        {/* Signal grid — 2×2 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <DashboardSignalCard
            label="X-Ray Flux"
            subtitle="Solar radiation level"
            value={formatXRayValue(xraySignal?.value)}
            unit="W/m²"
            status={interpretXRay(xraySignal?.value)}
            statusColor="amber"
            fresh={xrayFresh.status === "fresh"}
            freshLabel={formatAge(xrayFresh.ageMinutes)}
            source="noaa-goes"
            timestamp={xraySignal ? formatTimestamp(xraySignal.timestamp) : "—"}
            tooltipText={TOOLTIPS.xray}
            animationDelay={0}
            historyData={historyXray}
            logScale
          />
          <DashboardSignalCard
            label="Proton Flux"
            subtitle="Energetic particle flux ≥10 MeV"
            value={typeof protonSignal?.value === "number" ? protonSignal.value.toFixed(2) : "—"}
            unit="pfu"
            status={interpretProton(protonSignal?.value)}
            statusColor="cyan"
            fresh={protonFresh.status === "fresh"}
            freshLabel={formatAge(protonFresh.ageMinutes)}
            source="noaa-goes"
            timestamp={protonSignal ? formatTimestamp(protonSignal.timestamp) : "—"}
            tooltipText={TOOLTIPS.proton}
            animationDelay={80}
            historyData={historyProton}
          />
          <DashboardSignalCard
            label="Solar Wind"
            subtitle="Bulk speed at L1 point"
            value={typeof windSignal?.value === "number" ? Math.round(windSignal.value).toString() : "—"}
            unit="km/s"
            status={interpretWind(windSignal?.value)}
            statusColor="blue"
            fresh={windFresh.status === "fresh"}
            freshLabel={formatAge(windFresh.ageMinutes)}
            source="noaa-dscovr"
            timestamp={windSignal ? formatTimestamp(windSignal.timestamp) : "—"}
            tooltipText={TOOLTIPS.wind}
            animationDelay={160}
            historyData={historyWind}
          />
          <DashboardSignalCard
            label="Kp Index"
            subtitle="Planetary geomagnetic activity"
            value={typeof kpSignal.value === "number" ? kpSignal.value.toFixed(1) : "—"}
            unit="index"
            status={interpretKp(kpSignal.value)}
            statusColor="violet"
            fresh={kpFresh.status === "fresh"}
            freshLabel={formatAge(kpFresh.ageMinutes)}
            source="noaa-swpc"
            timestamp={formatTimestamp(kpSignal.timestamp)}
            tooltipText={TOOLTIPS.kp}
            animationDelay={240}
            historyData={historyKp}
          />
        </section>

        {/* Multi-signal timeline */}
        {timelineSignals.length > 0 && (
          <div className="mb-6">
            <SignalTimeline signals={timelineSignals} />
          </div>
        )}

        <SpaceWeatherChain />

        {/* Geomagnetic panel */}
        <section
          className="rounded-2xl border p-6 mb-6"
          style={{
            background: "var(--dash-card-bg)",
            borderColor: "var(--dash-card-border)",
          }}
        >
          <p className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase mb-4">
            Geomagnetic Detail
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpScaleInstrument currentKp={currentKp} />
            <MissionStatusPanel
              source={kpSignal.source}
              recordCount={stats.count}
              maxKp={stats.max}
              minKp={stats.min}
              avgKp={stats.avg}
            />
          </div>
          <div className="mt-4">
            <KpHistoryStrip signals={recentKpSignals} />
          </div>
        </section>
      </main>

      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
