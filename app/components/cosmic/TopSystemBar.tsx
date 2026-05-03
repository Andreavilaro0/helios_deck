import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Sun, Globe, Clock, Database, Radio, Settings, Bell, Menu } from "lucide-react";
import type { SignalRecord } from "~/types/signal";
import { getSignalFreshness } from "~/utils/signal-freshness";

interface Props {
  kpSignal: SignalRecord | null;
}

interface BadgeProps {
  icon: typeof Sun;
  label: string;
}

function SystemBadge({ icon: Icon, label }: BadgeProps) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <Icon className="size-3 text-slate-400" />
      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider hidden xl:block">
        {label}
      </span>
    </div>
  );
}

export function TopSystemBar({ kpSignal }: Props) {
  const [utc, setUtc] = useState(() =>
    new Date().toISOString().replace("T", " ").slice(0, 19)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setUtc(new Date().toISOString().replace("T", " ").slice(0, 19));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const freshness = getSignalFreshness(kpSignal);
  const isFresh = freshness.status === "fresh";

  return (
    <div
      className="h-[72px] flex items-center justify-between px-6 shrink-0"
      style={{
        borderRadius: 20,
        background: "rgba(5,13,24,0.68)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        border: "1px solid rgba(150,190,230,0.18)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.09)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="size-7 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(245,158,11,0.18)",
            boxShadow: "0 0 12px rgba(245,158,11,0.30), inset 0 0 6px rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.40)",
          }}
        >
          <Sun className="size-3.5 text-amber-400" />
        </div>
        <span className="text-[22px] font-bold tracking-[0.28em] text-slate-100">
          HELIOS_DECK
        </span>
      </div>

      {/* System badges */}
      <div className="flex items-center gap-1.5">
        <SystemBadge icon={Globe} label="NOAA SWPC" />
        <SystemBadge icon={Clock} label="UTC" />
        <SystemBadge icon={Database} label="SQLite" />
        <SystemBadge icon={Radio} label="SSR" />
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
          style={{
            background: isFresh
              ? "rgba(52,211,153,0.08)"
              : "rgba(245,158,11,0.08)",
            border: isFresh
              ? "1px solid rgba(52,211,153,0.30)"
              : "1px solid rgba(245,158,11,0.30)",
            boxShadow: isFresh
              ? "0 0 8px rgba(52,211,153,0.15)"
              : "0 0 8px rgba(245,158,11,0.15)",
          }}
        >
          <span
            className={`size-1.5 rounded-full ${isFresh ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
          />
          <span
            className={`text-[9px] font-mono uppercase tracking-wider ${isFresh ? "text-emerald-400" : "text-amber-400"}`}
          >
            {isFresh ? "Fresh" : "Stale"}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0">
        <time className="text-[10px] font-mono text-slate-400 hidden lg:block tabular-nums" dateTime={utc}>
          {utc} <span className="text-slate-600">UTC</span>
        </time>
        <Link
          to="/dashboard"
          className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors hidden md:block"
        >
          ← dashboard
        </Link>
        <Settings className="size-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" />
        <Bell className="size-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" />
        <Menu className="size-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" />
      </div>
    </div>
  );
}
