interface Props {
  humidity: number;
}

export function HumidityGauge({ humidity }: Props) {
  const R = 38;
  const CX = 56;
  const CY = 56;
  const SW = 8;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - humidity / 100);
  const color =
    humidity >= 80 ? "#34d399" : humidity >= 60 ? "#60a5fa" : "#818cf8";
  const label =
    humidity >= 80 ? "High" : humidity >= 40 ? "Normal" : "Low";

  return (
    <div
      className="rounded-2xl p-3 flex flex-col items-center gap-1"
      style={{
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.11)",
      }}
    >
      <p
        className="text-[9px] font-mono uppercase tracking-widest self-start"
        style={{ color: "rgba(255,255,255,0.28)" }}
      >
        Humidity
      </p>
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={SW}
        />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CX} ${CY})`}
          opacity="0.9"
        />
        <text
          x={CX}
          y={CY - 2}
          textAnchor="middle"
          fill="#fff"
          fontSize="20"
          fontFamily="monospace"
          fontWeight="700"
        >
          {humidity}%
        </text>
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          fill={color}
          fontSize="9"
          fontFamily="monospace"
          letterSpacing="1"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
