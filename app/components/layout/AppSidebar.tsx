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
  { to: "/dashboard",     label: "Panel",               icon: <IconDashboard /> },
  { to: "/cosmic-view",   label: "Vista Cósmica",        icon: <IconCosmic />    },
  { to: "/earth-weather", label: "Clima Terrestre",      icon: <IconEarth />     },
];

// ── System badges ─────────────────────────────────────────────────────────────

const BADGES = [
  { label: "NOAA",   color: "rgba(74,222,128,0.55)"  },
  { label: "UTC",    color: "rgba(56,189,248,0.55)"  },
  { label: "SQLite", color: "rgba(96,165,250,0.55)"  },
  { label: "SSR",    color: "rgba(167,139,250,0.50)" },
];

function SystemBadges() {
  return (
    <div className="flex flex-col gap-1 w-full px-3">
      <div className="flex flex-wrap gap-1">
        {BADGES.map((b) => (
          <div
            key={b.label}
            className="flex items-center justify-center px-2 py-0.5 rounded"
            style={{
              background: "rgba(5,15,45,0.65)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            <span className="text-[8px] font-mono tracking-widest uppercase" style={{ color: b.color }}>
              {b.label}
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
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(100,130,180,0.45)" }}>UTC</span>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: "rgba(147,197,253,0.60)" }}>{utc}</span>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const PATH_META: Record<string, { label: string; sub: string }> = {
  "/dashboard":     { label: "Panel",           sub: "Monitor de Clima Espacial" },
  "/cosmic-view":   { label: "Vista Cósmica",   sub: "Planeta Vivo" },
  "/earth-weather": { label: "Clima Terrestre", sub: "Explorador Meteorológico" },
};

export function AppSidebar(): ReactNode {
  const { pathname } = useLocation();
  const meta = PATH_META[pathname] ?? { label: "HELIOS", sub: "Observatorio" };

  return (
    <aside
      className="sticky top-0 h-screen shrink-0 z-50 flex flex-col py-5 gap-2"
      style={{
        width: "200px",
        background: "#030e22",
        borderRight: "1px solid rgba(59,130,246,0.18)",
      }}
    >
      {/* App branding */}
      <div className="px-5 mb-2 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="rounded-xl flex items-center justify-center shrink-0"
            style={{
              width: "38px",
              height: "38px",
              background: "rgba(59,130,246,0.16)",
              border: "1px solid rgba(59,130,246,0.38)",
              boxShadow: "0 0 24px rgba(59,130,246,0.22)",
              borderRadius: "10px",
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
            <p className="font-semibold leading-tight" style={{ fontSize: "15px", color: "#f0f8ff", letterSpacing: "-0.01em", fontWeight: 700 }}>
              HELIOS
            </p>
            <p style={{ fontSize: "10px", color: "rgba(100,130,180,0.60)", marginTop: "1px" }}>
              Clima Espacial
            </p>
          </div>
        </div>

        {/* Current page label */}
        <div
          className="rounded-xl px-3 py-2.5"
          style={{
            background: "rgba(8,25,70,0.65)",
            border: "1px solid rgba(59,130,246,0.22)",
          }}
        >
          <p style={{ fontSize: "11px", color: "rgba(100,130,180,0.55)", marginBottom: "2px" }}>
            Vista actual
          </p>
          <p className="font-semibold" style={{ fontSize: "14px", color: "#e2f0ff", fontWeight: 600 }}>
            {meta.label}
          </p>
          <p style={{ fontSize: "10px", color: "rgba(249,243,250,0.30)" }}>
            {meta.sub}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px shrink-0" style={{ background: "rgba(59,130,246,0.10)" }} />

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1 px-3 pt-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive ? "#60a5fa" : "rgba(148,163,184,0.45)",
              background: isActive ? "rgba(59,130,246,0.16)" : "transparent",
              border: isActive
                ? "1px solid rgba(59,130,246,0.38)"
                : "1px solid transparent",
              boxShadow: isActive ? "0 0 20px rgba(59,130,246,0.10)" : "none",
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
      <div className="mx-5 h-px shrink-0" style={{ background: "rgba(59,130,246,0.10)" }} />

      {/* System badges */}
      <SystemBadges />

      {/* Divider */}
      <div className="mx-5 h-px shrink-0" style={{ background: "rgba(59,130,246,0.10)" }} />

      {/* UTC clock */}
      <UtcClock />
    </aside>
  );
}

export function useSidebarVisible(): boolean {
  const { pathname } = useLocation();
  return pathname !== "/";
}
