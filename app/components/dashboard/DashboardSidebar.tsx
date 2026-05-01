import { Link, useLocation } from "react-router";
import { LayoutDashboard, Globe, Home } from "lucide-react";

const NAV = [
  { to: "/dashboard", Icon: LayoutDashboard, label: "Dashboard" },
  { to: "/cosmic-view", Icon: Globe, label: "Cosmic View" },
] as const;

export function DashboardSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-[72px] bg-white/70 backdrop-blur-sm border-r border-slate-100 flex flex-col items-center py-5 gap-2 shrink-0">
      {/* Brand mark */}
      <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
        <span className="text-white text-xs font-bold font-mono">H</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1" aria-label="Main navigation">
        {NAV.map(({ to, Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`size-10 rounded-2xl flex items-center justify-center transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </nav>

      <Link
        to="/"
        aria-label="Home"
        className="size-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Home size={18} />
      </Link>
    </aside>
  );
}
