import { useRef } from "react";
import type { WeatherLocation } from "~/types/weather";

interface Props {
  city: string;
  searchQuery: string;
  isLoading: boolean;
  isSearching: boolean;
  suggestions: WeatherLocation[];
  onSearch: (q: string) => void;
  onSelectLocation: (loc: WeatherLocation) => void;
  onSubmit: () => void;
}

export function SearchBar({ city, searchQuery, isLoading, isSearching, suggestions, onSearch, onSelectLocation, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div
        className="flex items-center gap-3 rounded-2xl"
        style={{
          padding: "14px 18px",
          background: "rgba(2,6,30,0.80)",
          border: "1px solid rgba(59,130,246,0.55)",
          boxShadow: "0 0 0 1px rgba(59,130,246,0.08), 0 6px 40px rgba(59,130,246,0.20), 0 0 120px rgba(59,130,246,0.07)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Blue circle with search icon */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59,130,246,0.28)", border: "1px solid rgba(59,130,246,0.65)", boxShadow: "0 0 20px rgba(59,130,246,0.30)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          placeholder={city}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "16px",
            fontWeight: 500,
            color: searchQuery ? "rgba(240,248,255,0.95)" : "rgba(148,163,184,0.55)",
            fontFamily: "inherit",
          }}
        />

        {/* Clear button — only when there's input */}
        {searchQuery && (
          <button
            onClick={() => { onSearch(""); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Loading spinner or location pin */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(5,15,50,0.70)", border: "1px solid rgba(59,130,246,0.25)" }}
        >
          {isLoading ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 8 10" fill="rgba(255,255,255,0.40)">
              <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="flex items-center gap-3">
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: isSearching ? "rgba(147,197,253,0.70)" : "rgba(100,130,180,0.50)", letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>
          {isSearching ? "Buscando…" : searchQuery ? "Resultados" : "Sugerencias"}
        </span>
        <div className="flex gap-1.5 overflow-x-auto">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className="flex items-center gap-1.5 shrink-0 rounded-lg"
              style={{
                padding: "5px 12px",
                background: "rgba(8,20,60,0.70)",
                border: "1px solid rgba(59,130,246,0.22)",
                fontSize: "10px",
                fontFamily: "monospace",
                color: "rgba(148,163,184,0.65)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.20)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(147,197,253,0.90)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.50)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(8,20,60,0.70)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.65)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.22)";
              }}
            >
              <svg width="7" height="9" viewBox="0 0 8 10" fill="rgba(255,255,255,0.35)">
                <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
              </svg>
              {loc.name}
            </button>
          ))}
          {suggestions.length === 0 && !isSearching && (
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>
              No se encontró ninguna ubicación
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
