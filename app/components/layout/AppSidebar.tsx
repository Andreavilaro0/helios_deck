import { NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

// ── Nav items ────────────────────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconCosmic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12c2.5-3 5.5-4.5 9-4.5s6.5 1.5 9 4.5" />
      <path d="M3 12c2.5 3 5.5 4.5 9 4.5s6.5-1.5 9-4.5" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: "/dashboard",    label: "Dashboard",    icon: <IconDashboard /> },
  { to: "/cosmic-view",  label: "Cosmic",       icon: <IconCosmic />    },
];

// ── System badges ────────────────────────────────────────────────────────────

const BADGES = ["NOAA", "UTC", "SQLite", "SSR"];

function SystemBadges() {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full px-2">
      {BADGES.map((label) => (
        <div
          key={label}
          className="w-full flex items-center justify-center py-1 rounded-md"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-[8px] font-mono tracking-widest text-white/25 uppercase">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function UtcClock() {
  const [utc, setUtc] = useState("");

  useEffect(() => {
    setUtc(new Date().toISOString().slice(11, 19));
    const id = setInterval(() => {
      setUtc(new Date().toISOString().slice(11, 19));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">UTC</span>
      <span className="text-[9px] font-mono text-white/35 tabular-nums">{utc}</span>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

export function AppSidebar(): ReactNode {
  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col items-center py-5 gap-2"
      style={{
        width: "64px",
        background: "rgba(0, 0, 0, 0.12)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      {/* Sun logo */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 shrink-0"
        style={{
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.18)",
          boxShadow: "0 0 12px rgba(245,158,11,0.12)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" /><line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
          <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" /><line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
        </svg>
      </div>

      {/* Divider */}
      <div className="w-8 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2 pt-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className="group relative flex flex-col items-center gap-1 w-full py-2.5 rounded-xl transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)",
              background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
              border: isActive
                ? "1px solid rgba(255,255,255,0.09)"
                : "1px solid transparent",
              boxShadow: isActive
                ? "inset 0 1px 0 rgba(255,255,255,0.08)"
                : "none",
            })}
          >
            <span className="relative z-10">{item.icon}</span>
            <span className="text-[8px] font-mono tracking-wide leading-none z-10 opacity-70">
              {item.label}
            </span>
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{ background: "rgba(255,255,255,0.03)" }}
            />
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="w-8 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* System badges */}
      <SystemBadges />

      {/* Divider */}
      <div className="w-8 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* UTC clock */}
      <UtcClock />
    </aside>
  );
}

export function useSidebarVisible(): boolean {
  const { pathname } = useLocation();
  return pathname !== "/";
}
