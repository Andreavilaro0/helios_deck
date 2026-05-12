import { useState } from "react";
import type React from "react";
import type { Route } from "./+types/dashboard";
import { requireAuth } from "~/services/auth/auth.server";
import { DashboardHero } from "~/components/dashboard/DashboardHero";
import type { OverallStatus } from "~/components/dashboard/DashboardHero";
import { AboutPanel } from "~/components/dashboard/AboutPanel";
import { SignalTimeline } from "~/components/charts/SignalTimeline";
import type { TimelineSignal } from "~/components/charts/SignalTimeline";
import { KpScaleInstrument } from "~/components/dashboard/KpScaleInstrument";
import { EmptyDashboardState } from "~/components/widgets/EmptyDashboardState";
import { EarthContextWidget } from "~/components/dashboard/EarthContextWidget";

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
  if (typeof v !== "number") return "DESCONOCIDO";
  if (v < 4) return "CALMA";
  if (v < 5) return "ACTIVO";
  return "TORMENTA";
}

function interpretXRay(v: unknown): string {
  if (typeof v !== "number") return "DESCONOCIDO";
  if (v < 1e-7) return "A — CALMA";
  if (v < 1e-6) return "B — MENOR";
  if (v < 1e-5) return "C — MODERADO";
  if (v < 1e-4) return "M — SIGNIFICATIVO";
  return "X — EXTREMO";
}

function interpretProton(v: unknown): string {
  if (typeof v !== "number") return "DESCONOCIDO";
  if (v < 1) return "CALMA";
  if (v < 10) return "ELEVADO";
  return "ALERTA RADIACIÓN";
}

function interpretWind(v: unknown): string {
  if (typeof v !== "number") return "DESCONOCIDO";
  if (v < 400) return "LENTO";
  if (v < 600) return "NOMINAL";
  if (v < 800) return "RÁPIDO";
  return "EXTREMO";
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
// Card components
// ---------------------------------------------------------------------------

interface FreshInfo { status: string; ageMinutes: number | null }

function freshStr(f: FreshInfo): string {
  if (f.ageMinutes === null) return "—";
  if (f.ageMinutes < 60) return `${Math.round(f.ageMinutes)}m`;
  const h = Math.floor(f.ageMinutes / 60);
  const m = Math.round(f.ageMinutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function KpFeaturedCard({ kp, signal, fresh }: { kp: number; signal: SignalRecord | null; fresh: FreshInfo }) {
  const color  = kp >= 5 ? "#f87171" : kp >= 4 ? "#facc15" : "#a78bfa";
  const label  = kp >= 5 ? "TORMENTA" : kp >= 4 ? "ACTIVO" : "CALMA";
  const age    = freshStr(fresh);

  return (
    <article
      className="relative rounded-2xl overflow-hidden flex flex-col justify-between"
      style={{
        padding: "22px 24px",
        background: "linear-gradient(180deg, rgba(8,17,34,0.72) 0%, rgba(4,9,20,0.80) 100%)",
        border: `1px solid ${color}3a`,
        boxShadow: `0 0 36px ${color}14, inset 0 0 28px ${color}06`,
        backdropFilter: "blur(16px)",
        minHeight: "148px",
      }}
    >
      <div className="absolute top-0 left-8 right-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`, transform: "translate(30%, 30%)" }} />

      <p style={{ fontSize: "9px", fontFamily: "monospace", color: `${color}aa`, letterSpacing: "0.20em", textTransform: "uppercase" }}>
        Índice Kp · Geomagnético
      </p>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", margin: "6px 0" }}>
        <span style={{ fontSize: "68px", fontFamily: "monospace", fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: `0 0 48px ${color}90, 0 0 16px ${color}50` }}>
          {kp.toFixed(1)}
        </span>
        <span style={{ fontSize: "24px", fontFamily: "monospace", fontWeight: 700, color, letterSpacing: "0.04em", paddingBottom: "10px" }}>
          {label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.22)" }}>
          {signal ? new Date(signal.timestamp).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }) : "—"}
        </span>
        <span style={{
          fontSize: "8px", fontFamily: "monospace", padding: "2px 8px", borderRadius: "20px",
          background: fresh.status === "fresh" ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.10)",
          color: fresh.status === "fresh" ? "#4ade80" : "#f87171",
          border: `1px solid ${fresh.status === "fresh" ? "rgba(74,222,128,0.22)" : "rgba(248,113,113,0.20)"}`,
        }}>
          {fresh.status === "fresh" ? "RECIENTE" : "ANTIGUO"} · {age}
        </span>
      </div>
    </article>
  );
}

interface StatCardProps {
  label: string; subtitle: string; value: string; unit: string;
  status: string; accent: string; fresh: FreshInfo; tooltip: string;
}

function SignalStatCard({ label, subtitle, value, unit, status, accent, fresh, tooltip }: StatCardProps) {
  const age = freshStr(fresh);
  return (
    <article
      className="relative rounded-2xl overflow-hidden flex flex-col justify-between group"
      style={{
        padding: "18px 18px 16px 22px",
        background: "linear-gradient(180deg, rgba(8,17,34,0.54) 0%, rgba(4,9,20,0.66) 100%)",
        border: `1px solid ${accent}26`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.22), inset 0 0 18px rgba(255,255,255,0.018)`,
        backdropFilter: "blur(16px)",
        minHeight: "148px",
      }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full"
        style={{ background: `linear-gradient(180deg, transparent, ${accent}, transparent)` }} />
      <div className="absolute top-0 left-6 right-6 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />

      <div>
        <p style={{ fontSize: "9px", fontFamily: "monospace", color: `${accent}bb`, letterSpacing: "0.16em", textTransform: "uppercase" }}>{label}</p>
        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)", marginTop: "1px" }}>{subtitle}</p>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", margin: "8px 0 2px" }}>
        <span style={{ fontSize: "34px", fontFamily: "monospace", fontWeight: 800, color: "#fff", lineHeight: 1, textShadow: `0 0 20px ${accent}55` }}>{value}</span>
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)" }}>{unit}</span>
      </div>

      <p style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 600, color: accent, letterSpacing: "0.10em" }}>{status}</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: `1px solid ${accent}18` }}>
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.18)" }}>NOAA SWPC</span>
        <span style={{
          fontSize: "8px", fontFamily: "monospace", padding: "1px 6px", borderRadius: "20px",
          background: fresh.status === "fresh" ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.08)",
          color: fresh.status === "fresh" ? "#4ade80" : "#f87171",
        }}>
          {fresh.status === "fresh" ? "●" : "○"} {age}
        </span>
      </div>

      {/* Hover tooltip */}
      <div className="absolute inset-0 rounded-2xl flex flex-col justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "rgba(6,10,18,0.93)", backdropFilter: "blur(12px)" }}>
        <p style={{ fontSize: "8px", fontFamily: "monospace", color: `${accent}90`, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>{label}</p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>{tooltip}</p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(_: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Observatorio de Clima Espacial" },
    { name: "description", content: "Clima espacial en vivo: índice Kp, flujo de Rayos X, flujo de protones, viento solar. NOAA SWPC." },
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
// Tooltip text
// ---------------------------------------------------------------------------

const TOOLTIPS = {
  xray: "Mide la intensidad de emisión de Rayos X solar. Los destellos clase B son eventos menores sin impacto significativo en la Tierra. Los de clase M y X pueden interrumpir comunicaciones de radio HF.",
  proton: "Cuenta los protones energéticos (≥10 MeV) cerca de la Tierra. Un flujo elevado indica un evento de partículas energéticas solares — peligroso para satélites y astronautas.",
  wind: "Velocidad del viento solar en el punto de Lagrange L1, a ~1,5 millones de km del Sol. Corrientes rápidas (>600 km/s) comprimen la magnetosfera terrestre e intensifican la actividad auroral.",
  kp: "Índice K planetario: una medida global de la perturbación geomagnética. Kp < 4 = calma. Kp 4–5 = activo. Kp ≥ 5 = tormenta geomagnética. Escala de 0 a 9.",
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
    heroAge,
    heroIngestedTime,
    heroIngestedDate,
  } = loaderData;

  const [aboutOpen, setAboutOpen] = useState(false);

  const currentKp = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
  const heroTimestamp = formatTimestamp(generatedAt);
  const timelineSignals: TimelineSignal[] = [
    { data: historyXray,   color: "#f59e0b", label: "X-Ray",  unit: "W/m²", logScale: true,  gradientId: "tl-xray"   },
    { data: historyProton, color: "#22d3ee", label: "Proton", unit: "pfu",  logScale: false, gradientId: "tl-proton" },
    { data: historyWind,   color: "#60a5fa", label: "Wind",   unit: "km/s", logScale: false, gradientId: "tl-wind"   },
    { data: historyKp,     color: "#a78bfa", label: "Kp",     unit: "",     logScale: false, gradientId: "tl-kp"     },
  ].filter((s) => s.data.length > 1);

  const pageStyle: React.CSSProperties = {
    height: "calc(100vh - 68px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "radial-gradient(ellipse 90% 45% at 50% -8%, rgba(43,98,214,0.10) 0%, transparent 58%)",
  };

  if (!kpSignal) {
    return (
      <div style={pageStyle}>
        <div className="flex-1 flex justify-center items-center">
          <EmptyDashboardState />
        </div>
        <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      {/* Hero */}
      <div className="relative px-10 pt-4 pb-0" style={{ flexShrink: 0 }}>
        <DashboardHero
          overallStatus={overallStatus}
          timestamp={heroTimestamp}
          freshnessAge={heroAge}
          lastIngestedTime={heroIngestedTime}
          lastIngestedDate={heroIngestedDate}
        />
        <button
          onClick={() => setAboutOpen(true)}
          className="absolute top-7 right-12 flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/70 transition-colors px-2 py-1 rounded-md"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          type="button"
        >
          ⓘ Acerca de
        </button>
      </div>

      <main className="px-10 pt-4 pb-4" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>

        <EarthContextWidget overallStatus={overallStatus} kp={currentKp} />

        {/* Signal cards — asymmetric bento */}
        <section style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr 1fr", gap: "12px", flexShrink: 0 }}>
          <KpFeaturedCard
            kp={currentKp}
            signal={kpSignal}
            fresh={kpFresh}
          />
          <SignalStatCard
            label="Flujo de Rayos X"
            subtitle="Emisión solar de Rayos X"
            value={formatXRayValue(xraySignal?.value)}
            unit="W/m²"
            status={interpretXRay(xraySignal?.value)}
            accent="#f59e0b"
            fresh={xrayFresh}
            tooltip={TOOLTIPS.xray}
          />
          <SignalStatCard
            label="Flujo de Protones"
            subtitle="Partículas energéticas ≥10 MeV"
            value={typeof protonSignal?.value === "number" ? protonSignal.value.toFixed(2) : "—"}
            unit="pfu"
            status={interpretProton(protonSignal?.value)}
            accent="#22d3ee"
            fresh={protonFresh}
            tooltip={TOOLTIPS.proton}
          />
          <SignalStatCard
            label="Viento Solar"
            subtitle="Velocidad en punto L1"
            value={typeof windSignal?.value === "number" ? Math.round(windSignal.value).toString() : "—"}
            unit="km/s"
            status={interpretWind(windSignal?.value)}
            accent="#60a5fa"
            fresh={windFresh}
            tooltip={TOOLTIPS.wind}
          />
        </section>

        {/* Charts: Signal History + Kp Scale */}
        {timelineSignals.length > 0 && (
          <div className="grid grid-cols-3 gap-4" style={{ paddingBottom: "4px" }}>
            <div className="col-span-2">
              <SignalTimeline signals={timelineSignals} chartHeight={260} />
            </div>
            <KpScaleInstrument currentKp={currentKp} />
          </div>
        )}

      </main>

      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
