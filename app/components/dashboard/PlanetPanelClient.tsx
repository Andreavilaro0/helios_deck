import { Canvas } from "@react-three/fiber";
import { Link } from "react-router";
import type { SignalRecord } from "~/types/signal";
import { EarthInstrument } from "~/components/cosmic/EarthInstrument";
import { KpFieldOverlay } from "~/components/cosmic/KpFieldOverlay";
import { StarField } from "~/components/cosmic/StarField";

interface Props {
  signal: SignalRecord;
  solarWind: SignalRecord | null;
}

function kpStatus(kp: number): string {
  if (kp >= 5) return "STORM";
  if (kp >= 4) return "ACTIVE";
  return "QUIET";
}

function kpStatusColor(kp: number): string {
  if (kp >= 5) return "text-red-400";
  if (kp >= 4) return "text-yellow-400";
  return "text-sky-400";
}

export default function PlanetPanelClient({ signal, solarWind: _ }: Props) {
  const kp = typeof signal.value === "number" ? signal.value : 0;
  const status = kpStatus(kp);
  const statusColor = kpStatusColor(kp);

  return (
    <div className="bg-[#04060f] relative w-full h-full overflow-hidden rounded-2xl">
      <Canvas
        camera={{ position: [0, 0.6, 2.8], fov: 42 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.18} />
        <directionalLight position={[4, 2, 3]} intensity={2.4} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} color="#1e3a8a" intensity={0.7} />
        <StarField />
        <EarthInstrument kp={kp} />
        <KpFieldOverlay kp={kp} />
      </Canvas>

      {/* Overlay — kp readout bottom-left, link bottom-right */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-5">
        <div className="flex items-end justify-between">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-0.5">
              Kp index
            </div>
            <div className="text-4xl font-bold font-mono tabular-nums text-slate-100 leading-none">
              {kp.toFixed(2)}
            </div>
            <div className={`mt-1.5 text-xs font-mono font-semibold tracking-wider ${statusColor}`}>
              {status}
            </div>
          </div>

          <Link
            to="/cosmic-view"
            className="pointer-events-auto bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 text-[10px] font-mono text-slate-500 hover:text-slate-200 transition-colors"
          >
            Full view →
          </Link>
        </div>
      </div>
    </div>
  );
}
