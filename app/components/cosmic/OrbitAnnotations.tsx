interface Props {
  kp: number;
}

export function OrbitAnnotations({ kp }: Props) {
  const magnetosphereState =
    kp >= 5 ? "Kp ≥ 5 · Storm alert" : kp >= 4 ? "Kp 4+ · Elevated" : "Nominal";
  const showPdyn = kp >= 4;
  const kpColor =
    kp >= 5 ? "#f43f5e" : kp >= 4 ? "#f59e0b" : "#22d3ee";

  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
      >
        <defs>
          <mask id="orbit-planet-mask">
            <rect width="1000" height="700" fill="white" />
            <circle cx="500" cy="340" r="282" fill="black" />
          </mask>

          <filter id="oglow-cyan" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="oglow-amber" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="oglow-violet" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="label-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbital ellipses (masked behind planet) */}
        <g mask="url(#orbit-planet-mask)">
          {/* Outer dashed orbit — low inclination */}
          <ellipse
            cx="500" cy="340" rx="468" ry="95"
            stroke="#22d3ee" strokeWidth="1.1" fill="none"
            strokeDasharray="8 10" opacity="0.52"
            transform="rotate(-7, 500, 340)"
          />
          {/* Mid dashed orbit */}
          <ellipse
            cx="500" cy="340" rx="400" ry="80"
            stroke="#818cf8" strokeWidth="1.0" fill="none"
            strokeDasharray="6 9" opacity="0.44"
            transform="rotate(13, 500, 340)"
          />
          {/* Inner equatorial orbit */}
          <ellipse
            cx="500" cy="340" rx="334" ry="62"
            stroke="#38bdf8" strokeWidth="1.2" fill="none"
            opacity="0.60"
          />
          {/* High-inclination polar arc */}
          <ellipse
            cx="500" cy="340" rx="292" ry="440"
            stroke="#6366f1" strokeWidth="0.6" fill="none"
            strokeDasharray="3 14" opacity="0.24"
          />
        </g>

        {/* Orbital node dots */}
        <circle cx="166" cy="340" r="6" fill="#38bdf8" opacity="0.96"
          filter="url(#oglow-cyan)" />
        <circle cx="834" cy="340" r="6" fill="#22d3ee" opacity="0.96"
          filter="url(#oglow-cyan)" />
        <circle cx="38" cy="348" r="4" fill="#38bdf8" opacity="0.75"
          filter="url(#oglow-cyan)" />
        <circle cx="504" cy="248" r="3.5" fill={kpColor} opacity="0.80"
          filter="url(#oglow-amber)" />

        {/* Connector lines */}
        <line x1="834" y1="340" x2="896" y2="238"
          stroke="#22d3ee" strokeWidth="0.8" opacity="0.60" />
        <line x1="816" y1="368" x2="896" y2="478"
          stroke="#818cf8" strokeWidth="0.8" opacity="0.54" />
        <line x1="166" y1="340" x2="94" y2="264"
          stroke="#38bdf8" strokeWidth="0.8" opacity="0.54" />

        {/* MAGNETOSPHERE label */}
        <circle cx="900" cy="234" r="3" fill="#22d3ee" opacity="0.90" />
        <text x="912" y="231" fill="#e2e8f0" fontSize="10" fontFamily="monospace"
          letterSpacing="2" fontWeight="bold" filter="url(#label-glow)">
          MAGNETOSPHERE
        </text>
        <text x="912" y="245" fill={kpColor} fontSize="8.5" fontFamily="monospace"
          opacity="0.85">
          {magnetosphereState}
        </text>
        {showPdyn && (
          <text x="912" y="258" fill="#f59e0b" fontSize="8" fontFamily="monospace"
            opacity="0.72">
            P_dyn ↑
          </text>
        )}

        {/* NIGHTSIDE label */}
        <circle cx="900" cy="482" r="3" fill="#818cf8" opacity="0.85" />
        <text x="912" y="479" fill="#e2e8f0" fontSize="10" fontFamily="monospace"
          letterSpacing="2" fontWeight="bold" filter="url(#label-glow)">
          NIGHTSIDE
        </text>
        <text x="912" y="493" fill="#64748b" fontSize="8.5" fontFamily="monospace"
          opacity="0.85">
          Nightside field
        </text>

        {/* SOLAR WIND label */}
        <circle cx="90" cy="260" r="3" fill="#38bdf8" opacity="0.85" />
        <text x="90" y="246" fill="#e2e8f0" fontSize="10" fontFamily="monospace"
          letterSpacing="2" fontWeight="bold" textAnchor="middle" filter="url(#label-glow)">
          SOLAR WIND
        </text>
        <text x="90" y="260" fill="#64748b" fontSize="8.5" fontFamily="monospace"
          opacity="0.85" textAnchor="middle">
          Kp-driven field
        </text>
      </svg>
    </div>
  );
}
