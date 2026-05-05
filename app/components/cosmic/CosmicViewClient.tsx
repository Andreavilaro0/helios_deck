import type { SignalRecord } from "~/types/signal";
import { ObservatoryShell } from "./ObservatoryShell";

interface Props {
  signal: SignalRecord;
  solarWind: SignalRecord | null;
  xrayFlux: SignalRecord | null;
  protonFlux: SignalRecord | null;
  recentKp: SignalRecord[];
  recentXRay: SignalRecord[];
  recentWind: SignalRecord[];
  recentProton: SignalRecord[];
}

export default function CosmicViewClient({
  signal,
  solarWind,
  xrayFlux,
  protonFlux,
  recentKp,
  recentXRay,
  recentWind,
  recentProton,
}: Props) {
  const kp = typeof signal.value === "number" ? signal.value : 0;

  return (
    <ObservatoryShell
      signal={signal}
      kp={kp}
      solarWind={solarWind}
      xrayFlux={xrayFlux}
      protonFlux={protonFlux}
      recentKp={recentKp}
      recentXRay={recentXRay}
      recentWind={recentWind}
      recentProton={recentProton}
    />
  );
}
