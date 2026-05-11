interface Props { type: string; size?: number; color?: string }

export function WeatherIcon({ type, size = 28, color = "#94a3b8" }: Props) {
  const s = size;
  switch (type) {
    case "clear":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" fill="#fbbf24" />
          {[0,45,90,135,180,225,270,315].map((a) => (
            <line key={a} x1="12" y1="3" x2="12" y2="5.5"
              stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"
              transform={`rotate(${a} 12 12)`} />
          ))}
        </svg>
      );
    case "partly-cloudy":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="10" cy="10" r="4" fill="#fbbf24" opacity="0.9" />
          <path d="M6 15a4 4 0 014-4h1a3 3 0 110 6H8a2 2 0 01-2-2z" fill={color} />
        </svg>
      );
    case "overcast":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 14a5 5 0 015-5h1a4 4 0 114 4H7a3 3 0 01-3-3z" fill={color} />
          <path d="M6 17a3 3 0 013-3h7a2 2 0 110 4H8a2 2 0 01-2-1z" fill={color} opacity="0.7" />
        </svg>
      );
    case "fog":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="15" x2="16" y2="15" />
        </svg>
      );
    case "rain":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M5 12a5 5 0 015-5h1a4 4 0 110 8H8a3 3 0 01-3-3z" fill={color} />
          <line x1="8" y1="17" x2="7" y2="20" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="17" x2="11" y2="20" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="16" y1="17" x2="15" y2="20" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "snow":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M5 12a5 5 0 015-5h1a4 4 0 110 8H8a3 3 0 01-3-3z" fill={color} />
          <text x="8" y="21" fontSize="8" fill="#bae6fd" fontFamily="monospace">❄ ❄ ❄</text>
        </svg>
      );
    case "thunder":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M5 12a5 5 0 015-5h1a4 4 0 110 8H8a3 3 0 01-3-3z" fill={color} />
          <polyline points="13,13 11,17 14,17 12,21" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    default:
      return <div style={{ width: s, height: s, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />;
  }
}
