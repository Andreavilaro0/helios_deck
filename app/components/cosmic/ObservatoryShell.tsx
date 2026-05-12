import type { CSSProperties, ReactNode } from "react";
import { Clock3, Database, Gauge, Globe, Info, Monitor, Orbit, RefreshCw, Thermometer, Waves } from "lucide-react";
import type { SignalRecord } from "~/types/signal";
import { getSignalFreshness } from "~/utils/signal-freshness";
import { getSpaceWeatherImpact } from "~/utils/space-impact";
import { CenterStage } from "./CenterStage";
import type { PlanetDescriptor, PlanetId } from "./planet-explorer";
import { PLANET_EXPLORER_PLANETS } from "./planet-explorer";

interface Props {
  signal: SignalRecord;
  kp: number;
  solarWind: SignalRecord | null;
  xrayFlux: SignalRecord | null;
  protonFlux: SignalRecord | null;
  overallStatus: "QUIET" | "ACTIVE" | "STORM";
  heroAge?: string;
  selectedPlanet: PlanetId;
  onSelectPlanet: (planetId: PlanetId) => void;
}

function formatUtcTime() {
  return new Date().toISOString().slice(11, 19);
}

function describeStatus(status: Props["overallStatus"]) {
  if (status === "STORM") return { label: "ACTIVE", color: "#21e7c7", glow: "0 0 18px rgba(33,231,199,0.45)" };
  if (status === "ACTIVE") return { label: "ACTIVE", color: "#21e7c7", glow: "0 0 18px rgba(33,231,199,0.45)" };
  return { label: "QUIET", color: "#8ab6ff", glow: "0 0 12px rgba(138,182,255,0.22)" };
}

function xrayStatus(value: number | null) {
  if (value === null) return "—";
  if (value >= 1e-4) return "X - EXTREME";
  if (value >= 1e-5) return "M - HIGH";
  if (value >= 1e-6) return "C - MODERATE";
  return "B - LOW";
}

function Panel({
  title,
  children,
  className = "",
  style,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,21,44,0.88)_0%,rgba(5,12,24,0.92)_100%)] backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.38)] ${className}`}
      style={style}
    >
      <div className="px-5 pt-5 text-[12px] font-mono uppercase tracking-[0.18em] text-white/80">{title}</div>
      {children}
    </div>
  );
}

function SidebarButton({
  active,
  label,
  sublabel,
  icon,
}: {
  active?: boolean;
  label: string;
  sublabel?: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      className="w-full rounded-[22px] px-4 py-4 text-left transition-all"
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(20,35,70,0.95) 0%, rgba(11,21,41,0.92) 52%, rgba(14,28,56,0.98) 100%)"
          : "rgba(255,255,255,0.02)",
        border: active ? "1px solid rgba(127,189,255,0.72)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: active ? "0 0 24px rgba(84,164,255,0.35), inset 0 0 18px rgba(84,164,255,0.08)" : "none",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-[#7dbbff]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-medium text-white">{label}</div>
          {sublabel ? <div className="mt-1 text-[12px] text-white/45">{sublabel}</div> : null}
        </div>
      </div>
    </button>
  );
}

function PlanetThumb({
  planet,
  active,
  onClick,
}: {
  planet: PlanetDescriptor;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[168px] min-w-[150px] overflow-hidden rounded-[24px] border px-4 pb-5 pt-4 text-center transition-all"
      style={{
        borderColor: active ? `${planet.accentColor}cc` : "rgba(255,255,255,0.1)",
        background: active
          ? `linear-gradient(180deg, ${planet.glowColor}20 0%, rgba(10,17,33,0.94) 42%, rgba(5,10,20,0.98) 100%)`
          : "linear-gradient(180deg, rgba(16,26,48,0.84) 0%, rgba(7,12,24,0.95) 100%)",
        boxShadow: active
          ? `0 0 0 1px ${planet.accentColor}55, 0 0 32px ${planet.accentColor}44, inset 0 0 28px ${planet.glowColor}18`
          : "0 18px 40px rgba(0,0,0,0.28)",
      }}
    >
      <div
        className="mx-auto mb-5 mt-1 rounded-full"
        style={{
          width: 94,
          height: 94,
          backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45) 0%, transparent 26%), url(${planet.texturePath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: active ? `0 0 24px ${planet.glowColor}88` : `0 0 16px ${planet.glowColor}44`,
        }}
      />
      <div className="text-[11px] font-mono uppercase tracking-[0.26em] text-white">{planet.name}</div>
      {active ? <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: planet.accentColor }} /> : null}
    </button>
  );
}

function PlanetDetails({ planet }: { planet: PlanetDescriptor }) {
  const rows = [
    { icon: Gauge, label: "Radius", value: planet.details.radiusLabel },
    { icon: Clock3, label: "Day Length", value: planet.details.dayLength },
    { icon: Waves, label: "Atmosphere", value: planet.details.atmosphere },
    { icon: Thermometer, label: "Surface Temp.", value: planet.details.surfaceTemp },
    { icon: Orbit, label: "Moons", value: planet.details.moons },
  ];

  return (
    <Panel title="Planet Details">
      <div className="absolute right-5 top-5 text-white/45">
        <Info size={16} />
      </div>
      <div className="px-5 pb-4 pt-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between border-b border-white/8 py-4 last:border-b-0">
            <div className="flex items-center gap-3 text-white/55">
              <Icon size={18} className="text-[#63a4ff]" />
              <span className="text-[12px] font-mono uppercase tracking-[0.12em]">{label}</span>
            </div>
            <div className="text-[14px] font-medium text-white">{value}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function OrbitOverview({ planet }: { planet: PlanetDescriptor }) {
  return (
    <Panel title="Orbit Overview" className="relative overflow-hidden">
      <div className="px-5 pb-6 pt-5">
        <div className="relative h-[128px] overflow-hidden rounded-[22px] border border-white/8 bg-[radial-gradient(circle_at_15%_45%,rgba(255,140,64,0.18)_0%,rgba(0,0,0,0)_35%),linear-gradient(180deg,rgba(8,12,26,0.95)_0%,rgba(6,10,20,0.86)_100%)]">
          <div className="absolute left-6 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-[#ffb25f] shadow-[0_0_22px_rgba(255,176,95,0.95)]" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <div
              key={index}
              className="absolute left-10 top-1/2 h-[2px] -translate-y-1/2 rounded-full border border-white/6"
              style={{
                width: 34 + index * 17,
                borderRadius: 999,
                borderColor: index + 1 === planet.orbitIndex ? `${planet.accentColor}90` : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
          {PLANET_EXPLORER_PLANETS.filter((item) => item.id !== "pluto").map((item) => (
            <div
              key={item.id}
              className="absolute top-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: 42 + item.orbitIndex * 22,
                width: item.id === planet.id ? 14 : 10,
                height: item.id === planet.id ? 14 : 10,
                background: item.id === planet.id ? item.accentColor : "rgba(255,255,255,0.55)",
                boxShadow: item.id === planet.id ? `0 0 16px ${item.accentColor}` : "none",
              }}
            />
          ))}
        </div>
        <div className="mt-4 text-center text-[22px] font-semibold" style={{ color: planet.accentColor }}>
          {planet.orbitIndex === 9 ? "Dwarf Orbit" : `${planet.orbitIndex}th Planet from the Sun`}
        </div>
      </div>
    </Panel>
  );
}

function BottomMetric({
  icon,
  title,
  value,
  sub,
  accent = "#28e7b9",
}: {
  icon: ReactNode;
  title: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 px-6 py-5">
      <div className="mt-1 text-[14px]" style={{ color: accent }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/45">{title}</div>
        <div className="mt-2 text-[14px] font-medium text-white">{value}</div>
        {sub ? <div className="mt-1 text-[12px]" style={{ color: accent }}>{sub}</div> : null}
      </div>
    </div>
  );
}

export function ObservatoryShell({
  signal,
  kp,
  solarWind,
  xrayFlux,
  protonFlux,
  overallStatus,
  heroAge,
  selectedPlanet,
  onSelectPlanet,
}: Props) {
  const currentPlanet = PLANET_EXPLORER_PLANETS.find((planet) => planet.id === selectedPlanet) ?? PLANET_EXPLORER_PLANETS[3];
  const xrayVal = xrayFlux && typeof xrayFlux.value === "number" ? xrayFlux.value : null;
  const windVal = solarWind && typeof solarWind.value === "number" ? solarWind.value : null;
  const protonVal = protonFlux && typeof protonFlux.value === "number" ? protonFlux.value : null;
  const freshness = getSignalFreshness(signal);
  const statusChip = describeStatus(overallStatus);
  const impact = getSpaceWeatherImpact(kp);
  const observedAt = new Date(signal.timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      className="relative h-full overflow-hidden rounded-[30px] border border-white/8 bg-[#030915] text-white"
      style={{
        backgroundImage: `
          radial-gradient(circle at 18% 18%, rgba(43,98,214,0.18) 0%, transparent 25%),
          radial-gradient(circle at 74% 34%, rgba(52,129,255,0.12) 0%, transparent 26%),
          radial-gradient(circle at 52% 100%, rgba(8,28,69,0.45) 0%, transparent 42%),
          linear-gradient(180deg, #04101f 0%, #020814 100%)
        `,
      }}
    >
      <div className="grid h-full grid-cols-[220px_minmax(0,1fr)_260px] grid-rows-[88px_minmax(0,1fr)_128px] gap-0">
        <aside className="row-span-3 flex min-h-0 flex-col border-r border-white/7 bg-[linear-gradient(180deg,rgba(3,9,20,0.98)_0%,rgba(2,7,16,0.94)_100%)] px-5 py-6">
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-[#3385ff55] bg-[#0b1630] shadow-[0_0_28px_rgba(51,133,255,0.28)]">
              <div className="h-7 w-7 rounded-full border border-[#348cff88] shadow-[0_0_18px_rgba(52,140,255,0.65)]" />
            </div>
            <div>
              <div className="text-[18px] font-semibold tracking-[0.28em]">HELIOS</div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#4ba5ff]">Observatory</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#77b9ff44] bg-[radial-gradient(circle_at_90%_10%,rgba(86,157,255,0.3)_0%,transparent_28%),linear-gradient(180deg,rgba(15,26,56,0.95)_0%,rgba(8,14,30,0.92)_100%)] p-5 shadow-[0_0_26px_rgba(92,168,255,0.18)]">
            <div className="text-[13px] text-white/55">Current view</div>
            <div className="mt-3 text-[17px] font-medium text-white">Planet Explorer</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[22px] font-semibold" style={{ color: currentPlanet.accentColor }}>{currentPlanet.name}</div>
              <div
                className="h-10 w-10 rounded-full border border-white/12"
                style={{
                  backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45) 0%, transparent 26%), url(${currentPlanet.texturePath})`,
                  backgroundSize: "cover",
                }}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <SidebarButton label="Dashboard" icon={<Database size={18} />} />
            <SidebarButton active label="Cosmic View" icon={<Globe size={18} />} />
            <SidebarButton label="Earth Weather" icon={<Orbit size={18} />} />
          </div>

          <div className="mt-8 text-[12px] font-mono uppercase tracking-[0.24em] text-white/38">Explorer</div>
          <div className="mt-4">
            <SidebarButton active label="Planet Explorer" icon={<Orbit size={18} />} />
          </div>

          <div className="mt-auto border-t border-white/7 pt-6">
            <div className="flex flex-wrap gap-2">
              {["NOAA", "UTC", "SQLite", "SSR"].map((item) => (
                <div key={item} className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/45">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <header className="col-span-2 flex items-center gap-4 border-b border-white/7 px-8">
          <div className="text-[26px] font-semibold tracking-[-0.03em]">Planet Explorer</div>
          <div
            className="ml-2 flex items-center gap-3 rounded-2xl border px-4 py-2"
            style={{
              borderColor: `${statusChip.color}44`,
              background: "rgba(15,25,46,0.92)",
              boxShadow: statusChip.glow,
            }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusChip.color }} />
            <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-white">{statusChip.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-5">
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-2 text-white/55">
              <Clock3 size={16} />
              <span className="font-mono text-[12px]">{heroAge ? `${heroAge} ago` : "—"}</span>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 px-5 py-2 font-mono text-[14px] tracking-[0.22em]">{formatUtcTime()} UTC</div>
            <div className="rounded-2xl border border-[#4a8cff30] bg-[#10203f] px-5 py-2 text-[13px] font-mono tracking-[0.18em] text-white/90">NOAA SWPC</div>
          </div>
        </header>

        <main className="min-h-0 px-7 pb-4 pt-7">
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_188px] gap-6">
            <div className="relative min-h-0">
              <CenterStage kp={kp} signal={signal} planet={currentPlanet} />

              <div className="absolute left-7 top-7 w-[220px]">
                <Panel
                  title="Solar Flux"
                  style={{
                    borderColor: `${currentPlanet.accentColor}55`,
                    boxShadow: `0 0 26px ${currentPlanet.accentColor}33, inset 0 0 28px rgba(255,255,255,0.02)`,
                  }}
                >
                  <div className="px-5 pb-5 pt-4">
                    <div className="mb-4 flex items-center gap-3 text-[#ffb15a]">
                      <div className="grid h-10 w-10 place-items-center rounded-full border border-[#ffb15a40] bg-[#27180d]">☼</div>
                      <div className="text-[13px] font-mono uppercase tracking-[0.16em] text-white/75">Solar Flux</div>
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="text-[32px] font-semibold leading-none">{xrayVal !== null ? xrayVal.toExponential(2).replace("+", "") : "—"}</div>
                      <div className="pb-1 text-[13px] text-white/55">W/m²</div>
                    </div>
                    <div className="mt-4 text-[15px] font-medium" style={{ color: currentPlanet.accentColor }}>
                      {xrayStatus(xrayVal)}
                    </div>
                  </div>
                </Panel>
              </div>

              <div className="absolute bottom-12 left-24">
                <div className="text-[12px] font-mono uppercase tracking-[0.2em] text-white/80">Solar Wind</div>
                <div className="mt-2 text-[28px] font-semibold">{windVal !== null ? `${windVal.toFixed(0)} km/s` : "—"}</div>
              </div>
            </div>

            <div className="relative flex items-center gap-4 overflow-hidden">
              <button type="button" className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#5d92ff88] bg-[#09142c] text-[#9ec4ff] shadow-[0_0_18px_rgba(93,146,255,0.28)]" onClick={() => {
                const index = PLANET_EXPLORER_PLANETS.findIndex((planet) => planet.id === currentPlanet.id);
                const next = (index - 1 + PLANET_EXPLORER_PLANETS.length) % PLANET_EXPLORER_PLANETS.length;
                onSelectPlanet(PLANET_EXPLORER_PLANETS[next].id);
              }}>
                ‹
              </button>
              <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-2">
                {PLANET_EXPLORER_PLANETS.map((planet) => (
                  <PlanetThumb
                    key={planet.id}
                    planet={planet}
                    active={planet.id === currentPlanet.id}
                    onClick={() => onSelectPlanet(planet.id)}
                  />
                ))}
              </div>
              <button type="button" className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#5d92ff88] bg-[#09142c] text-[#9ec4ff] shadow-[0_0_18px_rgba(93,146,255,0.28)]" onClick={() => {
                const index = PLANET_EXPLORER_PLANETS.findIndex((planet) => planet.id === currentPlanet.id);
                const next = (index + 1) % PLANET_EXPLORER_PLANETS.length;
                onSelectPlanet(PLANET_EXPLORER_PLANETS[next].id);
              }}>
                ›
              </button>
            </div>
          </div>
        </main>

        <div className="min-h-0 px-5 pb-5 pt-7">
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_194px] gap-4">
            <PlanetDetails planet={currentPlanet} />
            <OrbitOverview planet={currentPlanet} />
          </div>
        </div>

        <footer className="col-span-2 mx-4 mb-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,18,36,0.94)_0%,rgba(4,10,22,0.98)_100%)] shadow-[0_20px_55px_rgba(0,0,0,0.34)]">
          <div className="grid h-full grid-cols-5 divide-x divide-white/7">
            <BottomMetric icon={<Database size={18} />} title="Data Ingested" value={observedAt} sub="UTC" accent="#28e7b9" />
            <BottomMetric
              icon={<RefreshCw size={18} />}
              title="Freshness"
              value={freshness.ageMinutes === null ? "—" : `${Math.round(freshness.ageMinutes / 60)}h`}
              sub={freshness.status === "fresh" ? "Fresh" : freshness.status === "stale" ? "Stale" : "No data"}
              accent={freshness.status === "fresh" ? "#28e7b9" : "#ff9f43"}
            />
            <BottomMetric icon={<Globe size={18} />} title="Data Source" value="NOAA SWPC" sub="swpc.noaa.gov" accent="#38a8ff" />
            <BottomMetric icon={<Database size={18} />} title="Pipeline" value="SQLite  →  SSR  →  UI" sub={`Geomagnetic ${impact.geomagneticStorm}`} accent="#32f0b0" />
            <BottomMetric icon={<Monitor size={18} />} title="System Status" value="Operational" sub={protonVal !== null ? `Proton ${protonVal.toFixed(2)} pfu` : undefined} accent="#28e7b9" />
          </div>
        </footer>
      </div>
    </div>
  );
}
