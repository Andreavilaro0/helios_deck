import { useRef } from "react";
import type { WeatherLocation } from "~/types/weather";

interface Props {
  city: string;
  searchQuery: string;
  isLoading: boolean;
  suggestions: WeatherLocation[];
  onSearch: (q: string) => void;
  onSelectLocation: (loc: WeatherLocation) => void;
}

export function SearchBar({ city, searchQuery, isLoading, suggestions, onSearch, onSelectLocation }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div
        className="flex items-center gap-3 rounded-2xl"
        style={{ padding: "10px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        {/* Blue circle with search icon */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(59,130,246,0.22)", border: "1px solid rgba(59,130,246,0.38)" }}
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
          placeholder={city}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: searchQuery ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
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
          style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          {isLoading ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="2.5" strokeLinecap="round">
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
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>
          {searchQuery ? "Results" : "Suggestions"}
        </span>
        <div className="flex gap-1.5 overflow-x-auto">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className="flex items-center gap-1.5 shrink-0 rounded-lg"
              style={{
                padding: "4px 10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "10px",
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.50)",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.14)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.80)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.50)";
              }}
            >
              <svg width="7" height="9" viewBox="0 0 8 10" fill="rgba(255,255,255,0.35)">
                <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
              </svg>
              {loc.name}
            </button>
          ))}
          {suggestions.length === 0 && (
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>
              No cities found
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
