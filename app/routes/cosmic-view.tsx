import type { Route } from "./+types/cosmic-view";
import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import type { SignalRecord } from "~/types/signal";
import { getLatestSignalByName } from "~/services/signals.server";
import { CosmicEmptyState } from "~/components/cosmic/CosmicEmptyState";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Cosmic View" },
    { name: "description", content: "3D geomagnetic field visualization driven by real NOAA Kp data." },
  ];
}

export function loader(_: Route.LoaderArgs) {
  const latestSignal = getLatestSignalByName("kp-index");
  const latestSolarWind = getLatestSignalByName("solar-wind-speed");
  return { latestSignal, latestSolarWind };
}

export default function CosmicViewRoute({ loaderData }: Route.ComponentProps) {
  const { latestSignal, latestSolarWind } = loaderData;

  if (!latestSignal) {
    return <CosmicEmptyState />;
  }

  return <CosmicScene signal={latestSignal} solarWind={latestSolarWind} />;
}

// ---------------------------------------------------------------------------
// Client-only mount — prevents Three.js from loading on the SSR server.
// Server renders a static fallback; after hydration the 3D canvas mounts.
// ---------------------------------------------------------------------------

interface CosmicClientProps {
  signal: SignalRecord;
  solarWind: SignalRecord | null;
}

interface CosmicSceneProps {
  signal: SignalRecord;
  solarWind: SignalRecord | null;
}

function CosmicScene({ signal, solarWind }: CosmicSceneProps) {
  const [Client, setClient] = useState<ComponentType<CosmicClientProps> | null>(null);

  useEffect(() => {
    import("~/components/cosmic/CosmicViewClient").then((m) => {
      setClient(() => m.default);
    });
  }, []);

  if (!Client) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <span className="text-[10px] font-mono text-cyan-500/40 uppercase tracking-widest">
          Initializing 3D engine…
        </span>
      </div>
    );
  }

  return <Client signal={signal} solarWind={solarWind} />;
}
