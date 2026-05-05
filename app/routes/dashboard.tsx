import { useState } from "react";
import type { Route } from "./+types/dashboard";
import { requireAuth } from "~/services/auth/auth.server";
import { DashboardHero } from "~/components/dashboard/DashboardHero";
import type { OverallStatus } from "~/components/dashboard/DashboardHero";
import { DashboardSignalCard } from "~/components/dashboard/DashboardSignalCard";
import { SpaceWeatherChain } from "~/components/dashboard/SpaceWeatherChain";
import { AboutPanel } from "~/components/dashboard/AboutPanel";
import { SignalTimeline } from "~/components/charts/SignalTimeline";
import type { TimelineSignal } from "~/components/charts/SignalTimeline";
import { KpScaleInstrument } from "~/components/dashboard/KpScaleInstrument";
import { KpHistoryStrip } from "~/components/widgets/KpHistoryStrip";
import { DataPipelinePanel } from "~/components/dashboard/DataPipelinePanel";
import { RecentSignalsTable } from "~/components/dashboard/RecentSignalsTable";
import type { SignalRow } from "~/components/dashboard/RecentSignalsTable";
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

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
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

  // Hero freshness — most recent of the 4 signals
  const candidates = [kpSignal, xraySignal, protonSignal, windSignal].filter(
    (s): s is NonNullable<typeof s> => s !== null
  );
  const mostRecent = candidates.reduce<typeof candidates[number] | null>(
    (a, b) => (a && b && a.timestamp > b.timestamp ? a : b ?? a),
    candidates[0] ?? null
  );
  const heroFreshness = getSignalFreshness(mostRecent, now);
  const heroAge = formatAge(heroFreshness.ageMinutes);
  const heroIngestedTime = mostRecent
    ? new Date(mostRecent.timestamp).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      })
    : "—";
  const heroIngestedDate = mostRecent
    ? new Date(mostRecent.timestamp).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      })
    : "—";

  // Pipeline status
  const pipelineOk = [kpFresh, xrayFresh, protonFresh, windFresh].some(
    (f) => f.status === "fresh"
  );
  const staleAgeMinutes = [kpFresh, xrayFresh, protonFresh, windFresh]
    .map((f) => f.ageMinutes)
    .filter((m): m is number => m !== null);
  const staleAge = formatAge(
    staleAgeMinutes.length ? Math.max(...staleAgeMinutes) : null
  );

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
    recentXraySignals,
    recentProtonSignals,
    recentWindSignals,
    historyKp: extractNums(recentKpSignals),
    historyXray: extractNums(recentXraySignals),
    historyProton: extractNums(recentProtonSignals),
    historyWind: extractNums(recentWindSignals),
    kpFresh,
    xrayFresh,
    protonFresh,
    windFresh,
    stats,
    pipelineOk,
    staleAge,
    heroAge,
    heroIngestedTime,
    heroIngestedDate,
  };
}

// ---------------------------------------------------------------------------
// makeRow — builds a SignalRow from a nullable SignalRecord + display config
// ---------------------------------------------------------------------------

interface MakeRowOpts {
  name: string;
  subtitle: string;
  unit: string;
  source: string;
  iconColor: string;
  iconVariant: SignalRow["iconVariant"];
  formatValue: (v: SignalRecord["value"]) => string;
  statusLabel: (v: SignalRecord["value"]) => string;
  ageMinutes: number | null;
}

function makeRow(signal: SignalRecord | null, opts: MakeRowOpts): SignalRow {
  const age =
    opts.ageMinutes === null
      ? "—"
      : opts.ageMinutes < 60
        ? `${Math.round(opts.ageMinutes)}m`
        : `${Math.floor(opts.ageMinutes / 60)}h ${Math.round(opts.ageMinutes % 60)}m`;

  if (!signal) {
    return {
      name: opts.name,
      subtitle: opts.subtitle,
      value: "—",
      unit: opts.unit,
      statusLabel: "NO DATA",
      source: opts.source,
      ingestedAt: "—",
      age: "—",
      iconColor: opts.iconColor,
      iconVariant: opts.iconVariant,
    };
  }

  const ingestedAt = new Date(signal.timestamp).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  return {
    name: opts.name,
    subtitle: opts.subtitle,
    value: opts.formatValue(signal.value),
    unit: opts.unit,
    statusLabel: opts.statusLabel(signal.value),
    source: opts.source,
    ingestedAt,
    age,
    iconColor: opts.iconColor,
    iconVariant: opts.iconVariant,
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
    recentXraySignals,
    recentProtonSignals,
    recentWindSignals,
    historyKp,
    historyXray,
    historyProton,
    historyWind,
    kpFresh,
    xrayFresh,
    protonFresh,
    windFresh,
    stats,
    pipelineOk,
    staleAge,
    heroAge,
    heroIngestedTime,
    heroIngestedDate,
  } = loaderData;

  const [aboutOpen, setAboutOpen] = useState(false);

  const signalRows: SignalRow[] = [
    makeRow(xraySignal, {
      name: "X-Ray Flux Long",
      subtitle: "1–8 Å",
      unit: "W/m²",
      source: "NOAA SWPC",
      iconColor: "#f59e0b",
      iconVariant: "sun",
      formatValue: (v) => (typeof v === "number" ? v.toExponential(2) : "—"),
      statusLabel: interpretXRay,
      ageMinutes: xrayFresh.ageMinutes,
    }),
    makeRow(windSignal, {
      name: "Solar Wind Speed",
      subtitle: "ACE / DSCOVR",
      unit: "km/s",
      source: "NOAA SWPC",
      iconColor: "#60a5fa",
      iconVariant: "wind",
      formatValue: (v) => (typeof v === "number" ? Math.round(v).toString() : "—"),
      statusLabel: interpretWind,
      ageMinutes: windFresh.ageMinutes,
    }),
    makeRow(protonSignal, {
      name: "Proton Flux 10 MeV",
      subtitle: "Integral",
      unit: "pfu",
      source: "NOAA SWPC",
      iconColor: "#22d3ee",
      iconVariant: "zap",
      formatValue: (v) => (typeof v === "number" ? v.toFixed(2) : "—"),
      statusLabel: interpretProton,
      ageMinutes: protonFresh.ageMinutes,
    }),
    makeRow(kpSignal, {
      name: "Kp Index",
      subtitle: "NOAA / GFZ",
      unit: "index",
      source: "NOAA SWPC",
      iconColor: "#a78bfa",
      iconVariant: "activity",
      formatValue: (v) => (typeof v === "number" ? v.toFixed(1) : "—"),
      statusLabel: interpretKp,
      ageMinutes: kpFresh.ageMinutes,
    }),
  ];

  // All signals for the modal — merged, sorted desc, capped at 60
  const allSignals: SignalRecord[] = [
    ...recentKpSignals,
    ...recentXraySignals,
    ...recentProtonSignals,
    ...recentWindSignals,
  ]
    .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
    .slice(0, 60);

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

      <main className="max-w-6xl mx-auto px-4 pt-4 pb-12">

        {/* ── Row 1: Hero + About button ─────────────────────────────── */}
        <div className="relative mb-4">
          <DashboardHero
            overallStatus={overallStatus}
            timestamp={heroTimestamp}
            freshnessAge={heroAge}
            lastIngestedTime={heroIngestedTime}
            lastIngestedDate={heroIngestedDate}
          />
          <button
            onClick={() => setAboutOpen(true)}
            className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/70 transition-colors px-2 py-1 rounded-md"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            type="button"
          >
            ⓘ About
          </button>
        </div>

        {/* ── Row 2: 4 signal cards horizontal ──────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <DashboardSignalCard
            compact
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
            compact
            label="Proton Flux"
            subtitle="Flux ≥10 MeV"
            value={typeof protonSignal?.value === "number" ? protonSignal.value.toFixed(2) : "—"}
            unit="pfu"
            status={interpretProton(protonSignal?.value)}
            statusColor="cyan"
            fresh={protonFresh.status === "fresh"}
            freshLabel={formatAge(protonFresh.ageMinutes)}
            source="noaa-goes"
            timestamp={protonSignal ? formatTimestamp(protonSignal.timestamp) : "—"}
            tooltipText={TOOLTIPS.proton}
            animationDelay={60}
            historyData={historyProton}
          />
          <DashboardSignalCard
            compact
            label="Solar Wind"
            subtitle="Speed at L1 point"
            value={typeof windSignal?.value === "number" ? Math.round(windSignal.value).toString() : "—"}
            unit="km/s"
            status={interpretWind(windSignal?.value)}
            statusColor="blue"
            fresh={windFresh.status === "fresh"}
            freshLabel={formatAge(windFresh.ageMinutes)}
            source="noaa-dscovr"
            timestamp={windSignal ? formatTimestamp(windSignal.timestamp) : "—"}
            tooltipText={TOOLTIPS.wind}
            animationDelay={120}
            historyData={historyWind}
          />
          <DashboardSignalCard
            compact
            label="Kp Index"
            subtitle="Geomagnetic activity"
            value={typeof kpSignal.value === "number" ? kpSignal.value.toFixed(1) : "—"}
            unit="index"
            status={interpretKp(kpSignal.value)}
            statusColor="violet"
            fresh={kpFresh.status === "fresh"}
            freshLabel={formatAge(kpFresh.ageMinutes)}
            source="noaa-swpc"
            timestamp={formatTimestamp(kpSignal.timestamp)}
            tooltipText={TOOLTIPS.kp}
            animationDelay={180}
            historyData={historyKp}
          />
        </section>

        {/* ── Row 3: Timeline (2/3) + Kp Scale (1/3) ────────────────── */}
        {timelineSignals.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="col-span-2">
              <SignalTimeline signals={timelineSignals} />
            </div>
            <div>
              <KpScaleInstrument currentKp={currentKp} />
            </div>
          </div>
        )}

        {/* ── Row 4: Recent Signals table ────────────────────────────── */}
        <RecentSignalsTable rows={signalRows} allSignals={allSignals} />

        {/* ── Row 5: Data Pipeline ───────────────────────────────────── */}
        <DataPipelinePanel pipelineOk={pipelineOk} staleAge={staleAge} />

        {/* ── Below fold: Causal Chain + Kp history ─────────────────── */}
        <SpaceWeatherChain />
        <div className="mb-6">
          <KpHistoryStrip signals={recentKpSignals} />
        </div>

      </main>

      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
