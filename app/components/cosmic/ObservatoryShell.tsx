import type { SignalRecord } from "~/types/signal";
import { getSignalFreshness } from "~/utils/signal-freshness";
import type { PlanetId } from "./planet-explorer";
import { PLANET_EXPLORER_PLANETS } from "./planet-explorer";
import { buildStatusMetrics } from "./planet-explorer-mock";
import { OrbitOverview } from "./OrbitOverview";
import { PlanetCarouselScene } from "./PlanetCarouselScene";
import { PlanetDetailsPanel } from "./PlanetDetailsPanel";
import { SolarFluxCard } from "./SolarFluxCard";
import { StatusBar } from "./StatusBar";
import { planets as carouselPlanets } from "./planets";

interface Props {
  signal: SignalRecord;
  kp: number;
  solarWind: SignalRecord | null;
  xrayFlux: SignalRecord | null;
  protonFlux: SignalRecord | null;
  overallStatus: "QUIET" | "ACTIVE" | "STORM";
  heroAge?: string;
  selectedPlanet: PlanetId;
  onSelectPlanet: (planetId: PlanetId) => void;
}

export function ObservatoryShell({
  signal,
  kp: _kp,
  solarWind,
  xrayFlux,
  protonFlux,
  overallStatus: _overallStatus,
  heroAge,
  selectedPlanet,
  onSelectPlanet,
}: Props) {
  const currentPlanet = PLANET_EXPLORER_PLANETS.find((planet) => planet.id === selectedPlanet) ?? PLANET_EXPLORER_PLANETS[3];
  const xrayVal = xrayFlux && typeof xrayFlux.value === "number" ? xrayFlux.value : null;
  const windVal = solarWind && typeof solarWind.value === "number" ? solarWind.value : null;
  const protonVal = protonFlux && typeof protonFlux.value === "number" ? protonFlux.value : null;
  const freshness = getSignalFreshness(signal);
  const observedAt = new Date(signal.timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
  const xrayLabel =
    xrayVal === null
      ? "—"
      : xrayVal >= 1e-4
        ? "X — Extreme"
        : xrayVal >= 1e-5
          ? "M — High"
          : xrayVal >= 1e-6
            ? "C — Moderate"
            : "B — Low";
  const solarWindLabel = windVal !== null ? `${windVal.toFixed(0)} km/s` : "—";
  const freshnessValue =
    freshness.ageMinutes === null ? "—" : `${Math.max(1, Math.round(freshness.ageMinutes / 60))}h`;
  const freshnessState =
    freshness.status === "fresh" ? "Actualizado" : freshness.status === "stale" ? "Desactualizado" : "Sin datos";
  const statusMetrics = buildStatusMetrics({
    observedAt,
    freshnessValue,
    freshnessState,
    protonValue: protonVal !== null ? `${protonVal.toFixed(2)} pfu` : undefined,
  });

  return (
    <div
      className="relative h-full overflow-hidden rounded-[34px] border border-white/6 bg-[#030915] p-2.5 text-white"
      style={{
        backgroundImage: `
          radial-gradient(circle at 18% 18%, rgba(43,98,214,0.14) 0%, transparent 25%),
          radial-gradient(circle at 74% 34%, rgba(52,129,255,0.08) 0%, transparent 26%),
          radial-gradient(circle at 52% 100%, rgba(8,28,69,0.34) 0%, transparent 42%),
          linear-gradient(180deg, #04101f 0%, #020814 100%)
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(17,38,98,0.22)_0%,transparent_42%),radial-gradient(circle_at_12%_64%,rgba(255,126,48,0.06)_0%,transparent_30%)]" />
      {/* Animated nebula blobs — depth behind the 3D scene */}
      <div
        className="blob-orb pointer-events-none absolute -top-20 left-1/4 w-72 h-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(43,98,214,0.22) 0%, transparent 70%)", filter: "blur(56px)", mixBlendMode: "screen" }}
      />
      <div
        className="blob-orb blob-delay-4 pointer-events-none absolute bottom-0 right-1/3 w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)", filter: "blur(64px)", mixBlendMode: "screen" }}
      />
      <div className="grid h-full min-h-0 gap-2.5 xl:grid-cols-[minmax(0,1fr)_236px] xl:grid-rows-[minmax(0,1fr)_auto]">
        <main className="relative min-h-[620px] xl:min-h-0">
          <div className="relative h-full min-h-[580px] xl:min-h-0">
            <PlanetCarouselScene
              planets={carouselPlanets}
              activePlanetId={selectedPlanet}
              onSelectPlanet={(planetId) => onSelectPlanet(planetId as PlanetId)}
              labelLeft="Viento Solar"
              valueLeft={solarWindLabel}
              labelRightTop="Magnetosfera"
              valueRightTop={currentPlanet.details.magnetosphere}
              labelRightBottom="Nivel de Radiación"
              valueRightBottom={currentPlanet.details.radiation}
            />
            <div className="absolute left-4 top-4 z-20 xl:left-4">
              <SolarFluxCard value={xrayVal !== null ? xrayVal.toExponential(2).replace("+", "") : "—"} state={xrayLabel} />
            </div>
          </div>
        </main>

        <div className="min-h-0">
          <div className="grid h-full min-h-0 gap-3.5 xl:grid-rows-[minmax(0,1fr)_228px]">
            <PlanetDetailsPanel planet={currentPlanet} />
            <OrbitOverview planet={currentPlanet} />
          </div>
        </div>

        <div className="xl:col-span-2">
          <StatusBar metrics={statusMetrics} />
        </div>
      </div>
    </div>
  );
}
