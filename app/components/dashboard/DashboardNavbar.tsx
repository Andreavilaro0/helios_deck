import type { ReactNode } from "react";

interface DashboardNavbarProps {
  onAboutClick: () => void;
}

export function DashboardNavbar({ onAboutClick }: DashboardNavbarProps): ReactNode {
  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
      style={{
        background: "rgba(8 12 20 / 0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--dash-card-border)",
      }}
    >
      <span className="font-mono text-sm font-bold text-white/70 tracking-widest">
        HELIOS_DECK
      </span>
      <button
        onClick={onAboutClick}
        className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/20"
        type="button"
      >
        <span className="text-sm">ⓘ</span>
        About
      </button>
    </nav>
  );
}
