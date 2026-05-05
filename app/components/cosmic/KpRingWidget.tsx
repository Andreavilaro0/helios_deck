interface Props {
  kp: number;
}

const CX = 70;
const CY = 70;
const R  = 54;
const SW = 7;
const ARC_START_DEG = 135;
const ARC_SPAN_DEG  = 270;

function toRad(d: number) {
  return ((d - 90) * Math.PI) / 180;
}

function arcPoint(deg: number) {
  return { x: CX + R * Math.cos(toRad(deg)), y: CY + R * Math.sin(toRad(deg)) };
}

function describeArc(startDeg: number, endDeg: number): string {
  const s = arcPoint(startDeg);
  const e = arcPoint(endDeg);
  const span = endDeg - startDeg;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function KpRingWidget({ kp }: Props) {
  const color = kp >= 5 ? "#f43f5e" : kp >= 4 ? "#f59e0b" : "#34d399";
  const label = kp >= 5 ? "STORM CONDITIONS" : kp >= 4 ? "ACTIVE CONDITIONS" : "QUIET CONDITIONS";
  const trackPath = describeArc(ARC_START_DEG, ARC_START_DEG + ARC_SPAN_DEG);
  const fillEnd   = ARC_START_DEG + (Math.min(kp, 9) / 9) * ARC_SPAN_DEG;
  const fillPath  = kp > 0.01 ? describeArc(ARC_START_DEG, fillEnd) : null;

  // Dot marker at current Kp position
  const dotDeg = fillEnd;
  const dotPt  = arcPoint(dotDeg);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        viewBox="0 0 140 140"
        className="w-28 h-28"
        aria-label={`Kp index ${kp.toFixed(2)}`}
      >
        <defs>
          {/* Glow filter for the filled arc */}
          <filter id="kp-arc-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="kp-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={SW}
          strokeLinecap="round"
        />

        {/* Scale ticks at each integer Kp (1–8) */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => {
          const deg = ARC_START_DEG + (t / 9) * ARC_SPAN_DEG;
          const inner = { x: CX + (R - 7) * Math.cos(toRad(deg)), y: CY + (R - 7) * Math.sin(toRad(deg)) };
          const outer = { x: CX + (R + 5) * Math.cos(toRad(deg)), y: CY + (R + 5) * Math.sin(toRad(deg)) };
          const isThreshold = t === 4 || t === 5;
          return (
            <line
              key={t}
              x1={inner.x.toFixed(1)} y1={inner.y.toFixed(1)}
              x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)}
              stroke={isThreshold ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}
              strokeWidth={isThreshold ? 1.5 : 0.8}
            />
          );
        })}

        {/* Threshold dots at Kp 4 and 5 */}
        {[4, 5].map((t) => {
          const deg = ARC_START_DEG + (t / 9) * ARC_SPAN_DEG;
          const p = arcPoint(deg);
          return (
            <circle
              key={t}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r="2.5"
              fill={t === 5 ? "#f43f5e" : "#f59e0b"}
              opacity="0.55"
            />
          );
        })}

        {/* Filled arc with glow */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            filter="url(#kp-arc-glow)"
          />
        )}

        {/* Current Kp dot marker */}
        {kp > 0.01 && (
          <circle
            cx={dotPt.x.toFixed(1)}
            cy={dotPt.y.toFixed(1)}
            r="4"
            fill={color}
            filter="url(#kp-dot-glow)"
          />
        )}

        {/* Center: Kp value */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {kp.toFixed(1)}
        </text>
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          fill={color}
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="3"
          fontWeight="bold"
        >
          Kp
        </text>
      </svg>
      <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
