import type { ReactNode } from "react";

interface AboutPanelProps {
  open: boolean;
  onClose: () => void;
}

const TECH_STACK = [
  { name: "React Router 7", color: "#f97316" },
  { name: "TypeScript", color: "#3b82f6" },
  { name: "SQLite", color: "#22d3ee" },
  { name: "Tailwind CSS", color: "#38bdf8" },
  { name: "Vitest", color: "#a78bfa" },
  { name: "GitHub Actions", color: "#4ade80" },
];

const APIS = [
  {
    icon: "🛰",
    name: "NOAA SWPC",
    url: "services.swpc.noaa.gov",
    desc: "Planetary K-index, 1-minute cadence. Primary geomagnetic source.",
  },
  {
    icon: "🛰",
    name: "NOAA GOES XRS",
    url: "GOES-19 satellite",
    desc: "X-ray flux 0.1–0.8 nm and proton flux ≥10 MeV integral.",
  },
  {
    icon: "🛰",
    name: "NOAA DSCOVR / ACE",
    url: "L1 Lagrange point",
    desc: "Real-time solar wind speed at 1.5 million km from Earth.",
  },
];

const PIPELINE_STEPS = ["NOAA API", "Normalizer", "SQLite", "SSR Loader", "UI"];

export function AboutPanel({ open, onClose }: AboutPanelProps): ReactNode {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: "rgba(0 0 0 / 0.6)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-50 overflow-y-auto flex flex-col"
        style={{
          width: "480px",
          background: "#0d1117",
          borderLeft: "1px solid var(--dash-card-border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 z-10"
          style={{
            background: "#0d1117",
            borderBottom: "1px solid var(--dash-card-border)",
          }}
        >
          <div>
            <p className="font-mono text-xs text-white/30 tracking-widest uppercase">
              About this project
            </p>
            <p className="font-mono text-base font-bold text-white mt-0.5">
              HELIOS_DECK
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-xl font-light leading-none p-1"
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-8 px-6 py-8">
          {/* What it does */}
          <section>
            <SectionTitle>What it does</SectionTitle>
            <p className="text-sm text-white/60 leading-relaxed">
              HELIOS_DECK is a full-stack space weather observatory that
              ingests live heliophysical data from NOAA satellites, normalizes
              and stores it in SQLite, and renders it server-side in real time.
              It tracks four key signals — X-Ray flux, Proton flux, Solar Wind
              speed, and the Kp geomagnetic index — giving a live picture of
              conditions between the Sun and Earth.
            </p>
          </section>

          {/* Data pipeline */}
          <section>
            <SectionTitle>Data pipeline</SectionTitle>
            <div className="flex items-center gap-1 flex-wrap mt-3">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-1">
                  <span
                    className="text-xs font-mono px-2.5 py-1 rounded-md"
                    style={{
                      background: "var(--dash-card-bg)",
                      border: "1px solid var(--dash-card-border)",
                      color: "rgba(255 255 255 / 0.7)",
                    }}
                  >
                    {step}
                  </span>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <span className="text-white/20 text-xs">→</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Data sources */}
          <section>
            <SectionTitle>Data sources & APIs</SectionTitle>
            <div className="flex flex-col gap-3 mt-3">
              {APIS.map((api) => (
                <div
                  key={api.name}
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--dash-card-bg)",
                    border: "1px solid var(--dash-card-border)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{api.icon}</span>
                    <span className="text-sm font-mono font-semibold text-white/80">
                      {api.name}
                    </span>
                    <span className="text-xs font-mono text-white/30 ml-auto">
                      {api.url}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{api.desc}</p>
                </div>
              ))}
              <p className="text-xs font-mono text-white/25 mt-1">
                All data: public domain — no API key required.
              </p>
            </div>
          </section>

          {/* Built with */}
          <section>
            <SectionTitle>Built with</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {TECH_STACK.map((tech) => (
                <div
                  key={tech.name}
                  className="rounded-lg px-3 py-2 text-center"
                  style={{
                    background: "var(--dash-card-bg)",
                    border: `1px solid ${tech.color}30`,
                  }}
                >
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: tech.color }}
                  >
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section>
            <SectionTitle>Project stats</SectionTitle>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { label: "Tests", value: "235 ✓" },
                { label: "Signals tracked", value: "4" },
                { label: "Data source", value: "NOAA" },
                { label: "CI", value: "GitHub Actions" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg px-3 py-3"
                  style={{
                    background: "var(--dash-card-bg)",
                    border: "1px solid var(--dash-card-border)",
                  }}
                >
                  <p className="text-xs font-mono text-white/30 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-sm font-mono font-semibold text-white/80 mt-0.5">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-mono font-semibold text-white/30 uppercase tracking-[0.2em]">
      {children}
    </p>
  );
}
