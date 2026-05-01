import { Canvas } from "@react-three/fiber";
import type { SignalRecord } from "~/types/signal";
import { EarthInstrument } from "./EarthInstrument";
import { KpFieldOverlay } from "./KpFieldOverlay";
import { StarField } from "./StarField";
import { CosmicHud } from "./CosmicHud";

interface Props {
  signal: SignalRecord;
}

export default function CosmicViewClient({ signal }: Props) {
  const kp = typeof signal.value === "number" ? signal.value : 0;

  return (
    <div className="bg-[#030712] relative overflow-hidden" style={{ height: "100svh" }}>
      <Canvas
        camera={{ position: [0, 0.3, 3.5], fov: 45 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.12} />
        <directionalLight position={[5, 3, 5]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} color="#1e3a8a" intensity={0.6} />
        <StarField />
        <EarthInstrument kp={kp} />
        <KpFieldOverlay kp={kp} />
      </Canvas>
      <CosmicHud signal={signal} kp={kp} />
    </div>
  );
}
