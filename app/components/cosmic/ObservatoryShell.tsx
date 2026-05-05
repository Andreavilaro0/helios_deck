import { Sun, Zap, Wind, Activity } from "lucide-react";
import type { SignalRecord } from "~/types/signal";
import { interpretXRayFlux } from "~/components/widgets/XRayFluxTelemetryPanel";
import { interpretWindSpeed } from "~/components/widgets/SolarWindPanel";
import { interpretProtonFlux } from "~/components/widgets/ProtonFluxTelemetryPanel";
import { BottomPipelineBar } from "./BottomPipelineBar";
import { CenterStage } from "./CenterStage";
import { ObservatorySignalCard } from "./ObservatorySignalCard";

interface Props {
  signal: SignalRecord;
  kp: number;
  solarWind: SignalRecord | null;
  xrayFlux: SignalRecord | null;
  protonFlux: SignalRecord | null;
  recentKp: SignalRecord[];
  recentXRay: SignalRecord[];
  recentWind: SignalRecord[];
  recentProton: SignalRecord[];
}

function numericValues(records: SignalRecord[]): number[] {
  return records
    .map((r) => (typeof r.value === "number" ? r.value : null))
    .filter((v): v is number => v !== null)
    .reverse();
}

function xrayClass(v: number): string {
  if (v < 1e-7) return "text-sky-400";
  if (v < 1e-6) return "text-slate-400";
  if (v < 1e-5) return "text-yellow-400";
  if (v < 1e-4) return "text-orange-500";
  return "text-red-500";
}

function windClass(v: number): string {
  if (v < 400) return "text-sky-400";
  if (v <= 600) return "text-yellow-400";
  return "text-orange-400";
}

function protonClass(v: number): string {
  if (v < 1) return "text-sky-400";
  if (v < 10) return "text-yellow-400";
  return "text-orange-500";
}

function kpClass(kp: number): string {
  if (kp >= 5) return "text-red-400";
  if (kp >= 4) return "text-yellow-400";
  return "text-sky-400";
}

function kpLabel(kp: number): string {
  if (kp >= 5) return "STORM";
  if (kp >= 4) return "ACTIVE";
  return "QUIET";
}

function kpBarColor(v: number): string {
  if (v >= 5) return "#f87171";
  if (v >= 4) return "#facc15";
  return "#a78bfa";
}

export function ObservatoryShell({
  signal,
  kp,
  solarWind,
  xrayFlux,
  protonFlux,
  recentKp = [],
  recentXRay = [],
  recentWind = [],
  recentProton = [],
}: Props) {
  const xrayVal = xrayFlux && typeof xrayFlux.value === "number" ? xrayFlux.value : null;
  const windVal = solarWind && typeof solarWind.value === "number" ? solarWind.value : null;
  const protonVal = protonFlux && typeof protonFlux.value === "number" ? protonFlux.value : null;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: "100svh",
        background: "radial-gradient(ellipse 90% 90% at 50% 50%, #040b2e 0%, #020510 40%, #010208 100%)",
      }}
    >
      {/* Deep blue nebula core */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 75% 55% at 50% 45%, rgba(18,30,95,0.60) 0%, rgba(10,16,55,0.28) 55%, transparent 80%)" }}
      />
      {/* Amber solar source halo */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 48% 60% at 6% 22%, rgba(200,110,20,0.28) 0%, rgba(160,80,10,0.10) 50%, transparent 78%)" }}
      />
      {/* Violet aurora trace — right edge */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 36% 50% at 96% 60%, rgba(120,40,200,0.18) 0%, rgba(80,20,140,0.07) 55%, transparent 80%)" }}
      />
      {/* Edge vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 14%, transparent 86%, rgba(0,0,0,0.45) 100%)" }}
      />

      {/* Canvas fills entire viewport — bars float on top */}
      <div className="absolute inset-0">
        <CenterStage kp={kp} signal={signal} />
      </div>

      {/* Card top-left: X-Ray */}
      <div className="absolute hidden md:block z-10" style={{ left: "clamp(24px, 6vw, 120px)", top: "11vh", width: "clamp(220px, 15vw, 280px)", transform: "rotate(9deg)", transformOrigin: "center" }}>
        <ObservatorySignalCard
          title="X-Ray Flux Long"
          subtitle="Solar activity"
          Icon={Sun}
          borderClass=""
          titleClass="text-amber-400"
          statusClass={xrayVal !== null ? xrayClass(xrayVal) : "text-slate-600"}
          signal={xrayFlux}
          displayValue={xrayVal !== null ? xrayVal.toExponential(2) : "—"}
          unit="W/m²"
          status={xrayVal !== null ? interpretXRayFlux(xrayVal) : "PENDING"}
          description="X-ray emission from the Sun in the 1–8 Å band. Drives ionospheric absorption."
          recentValues={numericValues(recentXRay)}
          logScale
          sparklineColor="#f59e0b"
          accentHex="#f59e0b"
        />
      </div>

      {/* Card bottom-left: Solar Wind */}
      <div className="absolute hidden md:block z-10" style={{ left: "clamp(24px, 6vw, 120px)", bottom: "19vh", width: "clamp(220px, 15vw, 280px)", transform: "rotate(-9deg)", transformOrigin: "center" }}>
        <ObservatorySignalCard
          title="Solar Wind Speed"
          subtitle="Incoming solar wind"
          Icon={Wind}
          borderClass=""
          titleClass="text-sky-400"
          statusClass={windVal !== null ? windClass(windVal) : "text-slate-600"}
          signal={solarWind}
          displayValue={windVal !== null ? windVal.toFixed(0) : "—"}
          unit="km/s"
          status={windVal !== null ? interpretWindSpeed(windVal) : "PENDING"}
          description="Speed of the solar wind measured near Earth (ACE / DSCOVR)."
          recentValues={numericValues(recentWind)}
          sparklineColor="#38bdf8"
          accentHex="#38bdf8"
        />
      </div>

      {/* Card top-right: Proton Flux */}
      <div className="absolute hidden md:block z-10" style={{ right: "clamp(24px, 6vw, 120px)", top: "11vh", width: "clamp(220px, 15vw, 280px)", transform: "rotate(-9deg)", transformOrigin: "center" }}>
        <ObservatorySignalCard
          title="Proton Flux 10 MeV"
          subtitle="Energetic particles"
          Icon={Zap}
          borderClass=""
          titleClass="text-cyan-400"
          statusClass={protonVal !== null ? protonClass(protonVal) : "text-slate-600"}
          signal={protonFlux}
          displayValue={protonVal !== null ? protonVal.toFixed(2) : "—"}
          unit="pfu"
          status={protonVal !== null ? interpretProtonFlux(protonVal) : "PENDING"}
          description="Integral proton flux at energies ≥ 10 MeV. Elevated levels indicate radiation storm risk."
          recentValues={numericValues(recentProton)}
          logScale
          sparklineColor="#22d3ee"
          accentHex="#22d3ee"
        />
      </div>

      {/* Card bottom-right: Kp */}
      <div className="absolute hidden md:block z-10" style={{ right: "clamp(24px, 6vw, 120px)", bottom: "19vh", width: "clamp(220px, 15vw, 280px)", transform: "rotate(9deg)", transformOrigin: "center" }}>
        <ObservatorySignalCard
          title="Kp Index"
          subtitle="Geomagnetic response"
          Icon={Activity}
          borderClass=""
          titleClass="text-violet-400"
          statusClass={kpClass(kp)}
          signal={signal}
          displayValue={kp.toFixed(1)}
          unit="index"
          status={kpLabel(kp)}
          description="Global geomagnetic activity index (0–9). Higher values indicate stronger storms."
          recentValues={numericValues(recentKp)}
          sparklineColor="#a78bfa"
          accentHex="#a78bfa"
          barMode
          barColorFn={kpBarColor}
          barDomainMax={9}
          thresholdLines={[{ value: 5, color: "#f87171", label: "G1" }]}
        />
      </div>

      {/* Bottom dock — floating pill */}
      <div className="absolute z-20" style={{ bottom: 20, left: "6.5vw", right: "6.5vw" }}>
        <BottomPipelineBar kpSignal={signal} />
      </div>
    </div>
  );
}
