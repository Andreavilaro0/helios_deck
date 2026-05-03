import { Canvas } from "@react-three/fiber";
import type { SignalRecord } from "~/types/signal";
import { EarthInstrument } from "./EarthInstrument";
import { KpFieldOverlay } from "./KpFieldOverlay";
import { StarField } from "./StarField";
import { OrbitAnnotations } from "./OrbitAnnotations";
import { KpRingWidget } from "./KpRingWidget";

interface Props {
  kp: number;
  signal: SignalRecord;
}

function formatUTCHeader(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}

export function CenterStage({ kp, signal }: Props) {
  return (
    <div className="h-full flex flex-col pb-[140px]">
      {/* 3D canvas + HTML overlays */}
      <div className="flex-1 relative min-h-0">
        {/* UTC header — below the floating topbar */}
        <div className="absolute inset-x-0 text-center z-10 pointer-events-none" style={{ top: 100 }}>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">UTC</div>
          <div className="text-sm font-mono text-slate-300 tabular-nums" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.80)" }}>
            {formatUTCHeader(signal.timestamp)}
          </div>
          <div className="text-[9px] text-slate-600 tracking-wide mt-0.5">
            Real-time Space Weather Overview
          </div>
        </div>
        {/* Deep central halo — planetary glow behind the globe */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 68% 68% at 50% 50%, rgba(25,55,160,0.72) 0%, rgba(12,22,80,0.32) 50%, transparent 75%)"
          }}
        />
        {/* Solar ambient glow — warm lateral light from left matching sun [-4,2.5,4] */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 45% 60% at 10% 32%, rgba(210,120,20,0.20) 0%, rgba(170,85,10,0.08) 50%, transparent 78%)"
          }}
        />

        <Canvas
          camera={{ position: [0, 0.60, 4.8], fov: 40 }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.22} />
          {/* Main sun — left-side illumination, matches SUN_DIR in shader */}
          <directionalLight position={[-4, 2.5, 4]} intensity={3.0} color="#fffaf0" />
          {/* Warm fill from right — bounce/ambient */}
          <directionalLight position={[3, -0.5, 2]} intensity={0.28} color="#ff9d6a" />
          {/* Cool backlight */}
          <pointLight position={[0, 0, -6]} color="#1a3580" intensity={0.35} />
          <StarField />
          <EarthInstrument kp={kp} />
          <KpFieldOverlay kp={kp} />
        </Canvas>

        <OrbitAnnotations kp={kp} />
      </div>

      {/* Kp ring — below the canvas */}
      <div className="shrink-0 flex justify-center py-2">
        <KpRingWidget kp={kp} />
      </div>
    </div>
  );
}
