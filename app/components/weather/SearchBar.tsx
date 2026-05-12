const SUGGESTIONS = [
  "Tokyo, Japan",
  "Oslo, Norway",
  "New York, USA",
  "Sydney, Australia",
  "Cape Town, South Africa",
];

interface Props {
  city: string;
}

export function SearchBar({ city }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div
        className="flex items-center gap-3 rounded-2xl"
        style={{
          padding: "10px 16px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Blue circle with search icon */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.22)",
            border: "1px solid rgba(59,130,246,0.38)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <span
          style={{
            flex: 1,
            fontSize: "14px",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {city}
        </span>

        {/* X button */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>

        {/* Location pin circle */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 8 10"
            fill="rgba(255,255,255,0.40)"
          >
            <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
          </svg>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex items-center gap-3">
        <span
          style={{
            fontSize: "9px",
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Suggestions
        </span>
        <div className="flex gap-1.5 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="flex items-center gap-1.5 shrink-0 rounded-lg"
              style={{
                padding: "4px 10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "10px",
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.40)",
                cursor: "pointer",
              }}
            >
              <svg width="7" height="9" viewBox="0 0 8 10" fill="rgba(255,255,255,0.28)">
                <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
              </svg>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
