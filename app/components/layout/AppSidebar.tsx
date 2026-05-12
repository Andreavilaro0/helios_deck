import { NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

// ── Nav items ────────────────────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconCosmic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12c2.5-3 5.5-4.5 9-4.5s6.5 1.5 9 4.5" />
      <path d="M3 12c2.5 3 5.5 4.5 9 4.5s6.5-1.5 9-4.5" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function IconEarth() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: "/dashboard",     label: "Dashboard",      icon: <IconDashboard /> },
  { to: "/cosmic-view",   label: "Cosmic View",    icon: <IconCosmic />    },
  { to: "/earth-weather", label: "Earth Weather",  icon: <IconEarth />     },
];

// ── System badges ─────────────────────────────────────────────────────────────

const BADGES = ["NOAA", "UTC", "SQLite", "SSR"];

function SystemBadges() {
  return (
    <div className="flex flex-col gap-1 w-full px-3">
      <div className="flex flex-wrap gap-1">
        {BADGES.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center px-2 py-0.5 rounded"
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
    <div className="px-3 w-full">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">UTC</span>
        <span className="text-[11px] font-mono text-white/40 tabular-nums">{utc}</span>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function AppSidebar(): ReactNode {
  return (
    <aside
      className="sticky top-0 h-screen shrink-0 z-50 flex flex-col py-5 gap-2"
      style={{
        width: "200px",
        background: "#131f28",
        borderRight: "1px solid rgba(249,243,250,0.05)",
      }}
    >
      {/* App branding */}
      <div className="px-5 mb-2 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="rounded-xl flex items-center justify-center shrink-0"
            style={{
              width: "36px",
              height: "36px",
              background: "rgba(98,137,206,0.12)",
              border: "1px solid rgba(98,137,206,0.22)",
              boxShadow: "0 0 12px rgba(98,137,206,0.10)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6289ce" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" /><line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
              <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" /><line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
            </svg>
          </div>
          <div>
            <p className="font-semibold leading-tight" style={{ fontSize: "15px", color: "#f9f3fa", letterSpacing: "-0.01em" }}>
              HELIOS
            </p>
            <p style={{ fontSize: "10px", color: "rgba(249,243,250,0.35)", marginTop: "1px" }}>
              Space Weather
            </p>
          </div>
        </div>

        {/* Current page label */}
        <div
          className="rounded-xl px-3 py-2.5"
          style={{
            background: "rgba(98,137,206,0.08)",
            border: "1px solid rgba(98,137,206,0.16)",
          }}
        >
          <p style={{ fontSize: "11px", color: "rgba(249,243,250,0.40)", marginBottom: "2px" }}>
            Current view
          </p>
          <p className="font-semibold" style={{ fontSize: "14px", color: "#f9f3fa" }}>
            Dashboard
          </p>
          <p style={{ fontSize: "10px", color: "rgba(249,243,250,0.30)" }}>
            Space Weather Monitor
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1 px-3 pt-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.30)",
              background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
              border: isActive
                ? "1px solid rgba(255,255,255,0.09)"
                : "1px solid transparent",
            })}
          >
            <span className="shrink-0">{item.icon}</span>
            <span style={{ fontSize: "13px", fontWeight: 500 }}>
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
      <div className="mx-5 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* System badges */}
      <SystemBadges />

      {/* Divider */}
      <div className="mx-5 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* UTC clock */}
      <UtcClock />
    </aside>
  );
}

export function useSidebarVisible(): boolean {
  const { pathname } = useLocation();
  return pathname !== "/" && pathname !== "/cosmic-view";
}
