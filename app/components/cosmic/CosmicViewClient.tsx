import type { SignalRecord } from "~/types/signal";
import { ObservatoryShell } from "./ObservatoryShell";
import type { PlanetId } from "./planet-explorer";

interface Props {
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

export default function CosmicViewClient({
  signal,
  solarWind,
  xrayFlux,
  protonFlux,
  overallStatus,
  heroAge,
  selectedPlanet,
  onSelectPlanet,
}: Props) {
  const kp = typeof signal.value === "number" ? signal.value : 0;

  return (
    <ObservatoryShell
      signal={signal}
      kp={kp}
      solarWind={solarWind}
      xrayFlux={xrayFlux}
      protonFlux={protonFlux}
      overallStatus={overallStatus}
      heroAge={heroAge}
      selectedPlanet={selectedPlanet}
      onSelectPlanet={onSelectPlanet}
    />
  );
}
