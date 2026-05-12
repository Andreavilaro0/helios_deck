import type { Route } from "./+types/cosmic-view";
import { lazy, Suspense, useState, useEffect } from "react";
import type { SignalRecord } from "~/types/signal";
import { getLatestSignalByName, listRecentSignalsByName } from "~/services/signals.server";
import { getSignalFreshness } from "~/utils/signal-freshness";
import { CosmicEmptyState } from "~/components/cosmic/CosmicEmptyState";

// Lazy — keeps Three.js/R3F out of the SSR bundle entirely.
const CosmicViewClient = lazy(() => import("~/components/cosmic/CosmicViewClient"));

export function meta(_: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Cosmic View" },
    { name: "description", content: "Living Planet Observatory — real-time space weather driven by NOAA data." },
  ];
}

export function loader(_: Route.LoaderArgs) {
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

  if (!latestSignal) {
    return <CosmicEmptyState />;
  }

  return (
    <div style={{ height: "calc(100vh - 68px)", overflow: "hidden" }}>
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
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CosmicScene: blocks SSR and hydration from rendering the Canvas.
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
}

const loadingFallback = (
  <div className="bg-[#030712] flex items-center justify-center" style={{ height: "100%" }}>
    <span className="text-[10px] font-mono text-cyan-500/40 uppercase tracking-widest">
      Initializing 3D engine…
    </span>
  </div>
);

function CosmicScene(props: CosmicClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return loadingFallback;

  return (
    <Suspense fallback={loadingFallback}>
      <CosmicViewClient {...props} />
    </Suspense>
  );
}
