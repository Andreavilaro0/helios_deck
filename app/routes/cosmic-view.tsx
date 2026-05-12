import type { Route } from "./+types/cosmic-view";
import { lazy, Suspense, useSyncExternalStore } from "react";
import type { SignalRecord } from "~/types/signal";
import { getLatestSignalByName, listRecentSignalsByName } from "~/services/signals.server";
import { getSignalFreshness } from "~/utils/signal-freshness";
import { requireUser } from "~/services/auth/session.server";
import { CosmicEmptyState } from "~/components/cosmic/CosmicEmptyState";
import type { PlanetId } from "~/components/cosmic/planet-explorer";
import { PLANET_EXPLORER_PLANETS } from "~/components/cosmic/planet-explorer";

// Lazy — keeps Three.js/R3F out of the SSR bundle entirely.
const CosmicViewClient = lazy(() => import("~/components/cosmic/CosmicViewClient"));

export function meta(_: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Vista Cósmica" },
    { name: "description", content: "Observatorio de Planetas Vivos — clima espacial en tiempo real con datos NOAA." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  const latestSignal     = getLatestSignalByName("kp-index");
  const latestSolarWind  = getLatestSignalByName("solar-wind-speed");
  const latestXRayFlux   = getLatestSignalByName("xray-flux-long");
  const latestProtonFlux = getLatestSignalByName("proton-flux-10mev");

  const recentKp     = listRecentSignalsByName("kp-index",          30);
  const recentXRay   = listRecentSignalsByName("xray-flux-long",     30);
  const recentWind   = listRecentSignalsByName("solar-wind-speed",   30);
  const recentProton = listRecentSignalsByName("proton-flux-10mev",  30);

  // Topbar: compute overall status + freshness age
  const kpVal     = typeof latestSignal?.value     === "number" ? latestSignal.value     : 0;
  const xrayVal   = typeof latestXRayFlux?.value   === "number" ? latestXRayFlux.value   : 0;
  const protonVal = typeof latestProtonFlux?.value === "number" ? latestProtonFlux.value : 0;

  let overallStatus: "QUIET" | "ACTIVE" | "STORM" = "QUIET";
  if (kpVal >= 5 || xrayVal >= 1e-4 || protonVal >= 10) overallStatus = "STORM";
  else if (kpVal >= 4 || xrayVal >= 1e-6 || protonVal >= 1) overallStatus = "ACTIVE";

  const now = new Date();
  const freshness = getSignalFreshness(latestSignal, now);
  const heroAge =
    freshness.ageMinutes === null
      ? undefined
      : freshness.ageMinutes < 60
        ? `${Math.round(freshness.ageMinutes)}m`
        : `${Math.floor(freshness.ageMinutes / 60)}h`;

  return {
    latestSignal,
    latestSolarWind,
    latestXRayFlux,
    latestProtonFlux,
    recentKp,
    recentXRay,
    recentWind,
    recentProton,
    overallStatus,
    heroAge,
  };
}

export default function CosmicViewRoute({ loaderData }: Route.ComponentProps) {
  const {
    latestSignal,
    latestSolarWind,
    latestXRayFlux,
    latestProtonFlux,
    recentKp,
    recentXRay,
    recentWind,
    recentProton,
    overallStatus,
    heroAge,
  } = loaderData;

  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>("mars");
  const planetName = PLANET_EXPLORER_PLANETS.find((p) => p.id === selectedPlanet)?.name ?? "Mars";

  if (!latestSignal) {
    return (
      <div className="flex flex-col" style={{ height: "100%" }}>
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <CosmicEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "100%" }}>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <CosmicScene
          signal={latestSignal}
          solarWind={latestSolarWind}
          xrayFlux={latestXRayFlux}
          protonFlux={latestProtonFlux}
          recentKp={recentKp}
          recentXRay={recentXRay}
          recentWind={recentWind}
          recentProton={recentProton}
          overallStatus={overallStatus}
          heroAge={heroAge}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CosmicScene: blocks SSR from rendering the Canvas.
// ---------------------------------------------------------------------------

interface CosmicClientProps {
  signal: SignalRecord;
  solarWind: SignalRecord | null;
  xrayFlux: SignalRecord | null;
  protonFlux: SignalRecord | null;
  recentKp: SignalRecord[];
  recentXRay: SignalRecord[];
  recentWind: SignalRecord[];
  recentProton: SignalRecord[];
  overallStatus: "QUIET" | "ACTIVE" | "STORM";
  heroAge?: string;
  selectedPlanet: PlanetId;
  onSelectPlanet: (id: PlanetId) => void;
}

const loadingFallback = (
  <div className="bg-[#030712] flex items-center justify-center" style={{ height: "100%" }}>
    <span className="text-[10px] font-mono text-cyan-500/40 uppercase tracking-widest">
      Iniciando motor 3D…
    </span>
  </div>
);

function CosmicScene(props: CosmicClientProps) {
  // useSyncExternalStore: false on SSR, true on client.
  // Survives React 19 Strict Mode double-mount (useState+useEffect does not).
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isClient) return loadingFallback;

  return (
    <Suspense fallback={loadingFallback}>
      <CosmicViewClient {...props} />
    </Suspense>
  );
}
