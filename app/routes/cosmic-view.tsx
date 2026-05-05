import type { Route } from "./+types/cosmic-view";
import { lazy, Suspense, useState, useEffect } from "react";
import type { SignalRecord } from "~/types/signal";
import { getLatestSignalByName, listRecentSignalsByName } from "~/services/signals.server";
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

  // Recent history for mini sparklines (30 readings per channel)
  const recentKp     = listRecentSignalsByName("kp-index",          30);
  const recentXRay   = listRecentSignalsByName("xray-flux-long",     30);
  const recentWind   = listRecentSignalsByName("solar-wind-speed",   30);
  const recentProton = listRecentSignalsByName("proton-flux-10mev",  30);

  return {
    latestSignal,
    latestSolarWind,
    latestXRayFlux,
    latestProtonFlux,
    recentKp,
    recentXRay,
    recentWind,
    recentProton,
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
  } = loaderData;

  if (!latestSignal) {
    return <CosmicEmptyState />;
  }

  return (
    <CosmicScene
      signal={latestSignal}
      solarWind={latestSolarWind}
      xrayFlux={latestXRayFlux}
      protonFlux={latestProtonFlux}
      recentKp={recentKp}
      recentXRay={recentXRay}
      recentWind={recentWind}
      recentProton={recentProton}
    />
  );
}

// ---------------------------------------------------------------------------
// CosmicScene: blocks SSR and hydration from rendering the Canvas.
// - Server + first client render: shows loading fallback (mounted=false).
// - After useEffect fires (client only): mounts the component.
// This guarantees R3F creates a fresh WebGL context, not via hydration.
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
}

const loadingFallback = (
  <div className="min-h-screen bg-[#030712] flex items-center justify-center">
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
