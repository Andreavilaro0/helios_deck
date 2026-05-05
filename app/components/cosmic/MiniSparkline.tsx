interface ThresholdLine {
  value: number;
  color: string;
  label: string;
}

interface Props {
  values: number[];
  color: string;
  logScale?: boolean;
  barMode?: boolean;
  barColorFn?: (value: number) => string;
  barDomainMax?: number;
  thresholdLines?: ThresholdLine[];
}

function computeYLabels(
  min: number,
  max: number,
  logScale: boolean,
  rawValues: number[]
): Array<{ text: string; frac: number }> {
  if (logScale) {
    const minPow = Math.floor(min);
    const maxPow = Math.ceil(max);
    const midPow = Math.round((minPow + maxPow) / 2);
    if (minPow === maxPow) {
      return [{ text: `1e${maxPow}`, frac: 1 }, { text: `1e${maxPow}`, frac: 0 }];
    }
    return [
      { text: `1e${maxPow}`, frac: 1 },
      { text: `1e${midPow}`, frac: (midPow - minPow) / (maxPow - minPow) },
      { text: `1e${minPow}`, frac: 0 },
    ];
  }
  const lo = Math.min(...rawValues);
  const hi = Math.max(...rawValues);
  if (lo === hi) {
    return [{ text: hi.toFixed(1), frac: 1 }, { text: lo.toFixed(1), frac: 0 }];
  }
  const mid = (lo + hi) / 2;
  return [
    { text: hi.toFixed(1), frac: 1 },
    { text: mid.toFixed(1), frac: 0.5 },
    { text: lo.toFixed(1), frac: 0 },
  ];
}

export function MiniSparkline({
  values,
  color,
  logScale = false,
  barMode = false,
  barColorFn,
  barDomainMax,
  thresholdLines,
}: Props) {
  if (values.length < 2) return null;

  const W = 200;
  const H = 80;
  const GUTTER_L = 22;
  const GUTTER_B = 11;
  const PAD = 3;

  const drawW = W - GUTTER_L;
  const drawH = H - GUTTER_B - PAD;

  const transform = logScale
    ? (v: number) => Math.log10(Math.max(v, 1e-15))
    : (v: number) => v;

  const pts = values.map(transform);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;

  const toY = (v: number) => PAD + drawH - ((v - min) / range) * drawH;

  const polyPoints = pts
    .map((v, i) => {
      const x = GUTTER_L + (i / (pts.length - 1)) * drawW;
      const y = toY(v);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const firstX = GUTTER_L.toFixed(1);
  const lastX = W.toFixed(1);
  const bottomY = (PAD + drawH).toFixed(1);
  const areaPoints = `${firstX},${bottomY} ${polyPoints} ${lastX},${bottomY}`;

  const safeId = color.replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `sg-${safeId}`;
  const glowId = `gw-${safeId}`;

  const gridYs = [0.25, 0.5, 0.75].map((f) => PAD + drawH - f * drawH);

  const yLabels = computeYLabels(min, max, logScale, values);

  const domainMax = barMode
    ? (barDomainMax ?? Math.max(...values, 1))
    : 1;

  const barW = barMode ? (drawW / values.length) * 0.78 : 0;
  const barGap = barMode ? (drawW / values.length) * 0.22 : 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: 80 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
        <filter id={glowId} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Y-axis labels */}
      {yLabels.map((lbl, i) => {
        const y = PAD + drawH - lbl.frac * drawH;
        return (
          <text
            key={i}
            x={GUTTER_L - 3}
            y={y + 3}
            fontSize="6"
            fill="#475569"
            textAnchor="end"
            fontFamily="monospace"
          >
            {lbl.text}
          </text>
        );
      })}

      {/* X-axis labels */}
      <text x={GUTTER_L} y={H - 1} fontSize="6" fill="#334155" textAnchor="start" fontFamily="monospace">–24h</text>
      <text x={GUTTER_L + drawW / 2} y={H - 1} fontSize="6" fill="#334155" textAnchor="middle" fontFamily="monospace">–12h</text>
      <text x={W} y={H - 1} fontSize="6" fill="#334155" textAnchor="end" fontFamily="monospace">now</text>

      {barMode ? (
        <>
          {/* Threshold lines (bar mode only) */}
          {thresholdLines?.map((tl) => {
            const ty = PAD + drawH - Math.min(tl.value / domainMax, 1) * drawH;
            return (
              <g key={tl.label}>
                <line
                  x1={GUTTER_L} y1={ty.toFixed(1)}
                  x2={W} y2={ty.toFixed(1)}
                  stroke={tl.color}
                  strokeWidth="0.8"
                  strokeDasharray="3,3"
                  opacity="0.55"
                />
                <text
                  x={GUTTER_L + 2}
                  y={ty - 2}
                  fontSize="6"
                  fill={tl.color}
                  fontFamily="monospace"
                  opacity="0.55"
                >
                  {tl.label}
                </text>
              </g>
            );
          })}
          {/* Bars */}
          {values.map((v, i) => {
            const ratio = Math.min(Math.max(v / domainMax, 0), 1);
            const bh = ratio * drawH;
            const bx = GUTTER_L + i * (drawW / values.length) + barGap / 2;
            const by = PAD + drawH - bh;
            const barColor = barColorFn ? barColorFn(v) : color;
            return (
              <rect
                key={i}
                x={bx.toFixed(1)}
                y={by.toFixed(1)}
                width={barW.toFixed(1)}
                height={Math.max(bh, 0).toFixed(1)}
                fill={barColor}
                opacity="0.78"
                rx="1"
              />
            );
          })}
        </>
      ) : (
        <>
          {/* Subtle horizontal grid */}
          {gridYs.map((y, i) => (
            <line
              key={i}
              x1={GUTTER_L} y1={y.toFixed(1)}
              x2={W} y2={y.toFixed(1)}
              stroke={color}
              strokeWidth="0.4"
              opacity="0.12"
            />
          ))}
          {/* Area fill */}
          <polygon points={areaPoints} fill={`url(#${gradId})`} />
          {/* Glowing line */}
          <polyline
            points={polyPoints}
            fill="none"
            stroke={color}
            strokeWidth="2.0"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.95}
            filter={`url(#${glowId})`}
          />
        </>
      )}
    </svg>
  );
}
