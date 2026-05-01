import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import type { SignalRecord } from "~/types/signal";

interface Props {
  signal: SignalRecord;
  solarWind: SignalRecord | null;
}

export function PlanetPanel({ signal, solarWind }: Props) {
  const [Client, setClient] = useState<ComponentType<Props> | null>(null);

  useEffect(() => {
    import("~/components/dashboard/PlanetPanelClient").then((m) => {
      setClient(() => m.default);
    });
  }, []);

  if (!Client) {
    return (
      <div className="w-full h-full bg-[#04060f] rounded-2xl flex items-center justify-center">
        <span className="text-[10px] font-mono text-cyan-500/40 uppercase tracking-widest">
          Initializing…
        </span>
      </div>
    );
  }

  return <Client signal={signal} solarWind={solarWind} />;
}
