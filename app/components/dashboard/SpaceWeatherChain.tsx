import type { ReactNode } from "react";

const NODES = [
  { icon: "☀", label: "Solar Activity", sub: "X-Ray & Proton flux" },
  { icon: "⚡", label: "Particle Flux", sub: "Energetic particles" },
  { icon: "🌬", label: "Solar Wind", sub: "Speed at L1 point" },
  { icon: "🌍", label: "Geomagnetic", sub: "Kp index response" },
];

export function SpaceWeatherChain(): ReactNode {
  return (
    <section className="px-6 py-8">
      <p className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase text-center mb-6">
        Causal Chain
      </p>
      <div className="flex items-center justify-center gap-0 flex-wrap">
        {NODES.map((node, i) => (
          <div key={node.label} className="flex items-center">
            <div
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border"
              style={{
                background: "var(--dash-card-bg)",
                borderColor: "var(--dash-card-border)",
                backdropFilter: "blur(8px)",
                minWidth: "110px",
              }}
            >
              <span className="text-2xl">{node.icon}</span>
              <span className="text-xs font-mono font-semibold text-white/80 text-center leading-tight">
                {node.label}
              </span>
              <span className="text-xs font-mono text-white/30 text-center leading-tight">
                {node.sub}
              </span>
            </div>
            {i < NODES.length - 1 && (
              <div className="flex items-center px-1">
                <div
                  className="h-px w-8"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, rgba(255 255 255 / 0.2) 0px, rgba(255 255 255 / 0.2) 4px, transparent 4px, transparent 8px)",
                  }}
                />
                <span className="text-white/30 text-xs">›</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
