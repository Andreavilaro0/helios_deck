import { NavLink, useLocation } from "react-router";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconCosmic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12c2.5-3 5.5-4.5 9-4.5s6.5 1.5 9 4.5" />
      <path d="M3 12c2.5 3 5.5 4.5 9 4.5s6.5-1.5 9-4.5" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
  { to: "/cosmic-view", label: "Cosmic View", icon: <IconCosmic /> },
];

export function AppSidebar(): ReactNode {
  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col items-center py-5 gap-1"
      style={{
        width: "72px",
        background: "rgba(6, 9, 16, 0.65)",
        backdropFilter: "blur(28px) saturate(200%)",
        WebkitBackdropFilter: "blur(28px) saturate(200%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.055)",
        boxShadow:
          "inset -1px 0 0 rgba(255,255,255,0.03), 6px 0 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Logo mark */}
      <div className="mb-4 flex flex-col items-center gap-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(96, 165, 250, 0.12)",
            border: "1px solid rgba(96, 165, 250, 0.2)",
            boxShadow: "0 0 16px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <IconSun />
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className="group relative flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.32)",
              background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
              boxShadow: isActive
                ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 16px rgba(96,165,250,0.1)"
                : "none",
              border: isActive
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid transparent",
            })}
          >
            {/* Liquid glass highlight on active — top inner gleam */}
            <span className="relative z-10">{item.icon}</span>
            <span className="text-[9px] font-mono tracking-wide leading-none z-10">
              {item.label.split(" ")[0]}
            </span>

            {/* Hover glow */}
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </NavLink>
        ))}
      </nav>

      {/* Bottom — version pip */}
      <div
        className="text-[8px] font-mono tracking-wider"
        style={{ color: "rgba(255,255,255,0.12)" }}
      >
        2M
      </div>
    </aside>
  );
}

/** Returns true when the sidebar should be shown (not on the home/landing page). */
export function useSidebarVisible(): boolean {
  const { pathname } = useLocation();
  return pathname !== "/";
}
