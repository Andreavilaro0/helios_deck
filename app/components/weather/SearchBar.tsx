const TABS = ["Today", "Map View", "3D", "Terrain", "Satellite Solutions"];

interface Props {
  city: string;
}

export function SearchBar({ city }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-2.5"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.40)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span
          style={{
            flex: 1,
            fontSize: "13px",
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.70)",
          }}
        >
          {city}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </div>
      <div className="flex gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className="px-3 py-1 rounded-lg text-[10px] font-mono tracking-wide transition-colors"
            style={{
              background:
                i === 0
                  ? "rgba(59,130,246,0.20)"
                  : "rgba(255,255,255,0.04)",
              border:
                i === 0
                  ? "1px solid rgba(59,130,246,0.35)"
                  : "1px solid rgba(255,255,255,0.07)",
              color: i === 0 ? "#93c5fd" : "rgba(255,255,255,0.35)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
