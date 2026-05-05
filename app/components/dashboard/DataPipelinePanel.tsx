import type { ReactNode } from "react";

export interface DataPipelinePanelProps {
  pipelineOk: boolean;
  /** Formatted age of most stale signal — shown in STALE badge */
  staleAge: string;
}

interface NodeDef {
  name: string;
  subtitle: string;
  icon: "globe" | "cloud-download" | "activity" | "database" | "zap" | "monitor";
}

const NODES: NodeDef[] = [
  { name: "NOAA SWPC",    subtitle: "Primary Source · feeds.swpc.noaa.gov", icon: "globe" },
  { name: "Fetchers",     subtitle: "Data Ingestion · 5m intervals",         icon: "cloud-download" },
  { name: "Normalizers",  subtitle: "Data Processing · Validation & Parse",  icon: "activity" },
  { name: "SQLite",       subtitle: "Local Database · helios.db",             icon: "database" },
  { name: "SSR Loaders",  subtitle: "Signal Registry · Real-time Push",       icon: "zap" },
  { name: "UI",           subtitle: "Frontend · Cosmic View",                 icon: "monitor" },
];

function NodeIcon({ icon }: { icon: NodeDef["icon"] }): ReactNode {
  const s = { stroke: "#22d3ee", fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "globe":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...s}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "cloud-download":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...s}>
          <polyline points="8 17 12 21 16 17" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
        </svg>
      );
    case "activity":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...s}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "database":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...s}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "zap":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...s}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...s}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
}

interface StatusBadgeProps {
  ok: boolean;
  staleAge: string;
}

function StatusBadge({ ok, staleAge }: StatusBadgeProps): ReactNode {
  if (ok) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold mt-2"
        style={{
          background: "rgba(74,222,128,0.12)",
          border: "1px solid rgba(74,222,128,0.30)",
          color: "#4ade80",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
        OK
      </div>
    );
  }
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold mt-2"
      style={{
        background: "rgba(248,113,113,0.12)",
        border: "1px solid rgba(248,113,113,0.30)",
        color: "#f87171",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
      {`STALE — last seen ${staleAge} ago`}
    </div>
  );
}

export function DataPipelinePanel({
  pipelineOk,
  staleAge,
}: DataPipelinePanelProps): ReactNode {
  return (
    <section className="mb-6">
      <p
        className="text-[9px] font-mono tracking-[0.25em] uppercase mb-3"
        style={{ color: "rgba(255,255,255,0.30)" }}
      >
        Data Pipeline — Real-Time Architecture
      </p>

      <div className="flex items-stretch gap-0">
        {NODES.map((node, i) => {
          const isUi = i === NODES.length - 1;
          const nodeOk = isUi ? true : pipelineOk;

          return (
            <div key={node.name} className="flex items-center flex-1 min-w-0">
              {/* Node card */}
              <div
                className="flex-1 min-w-0 rounded-[10px] p-3.5 flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 shrink-0"
                  style={{ background: "rgba(34,211,238,0.12)" }}
                >
                  <NodeIcon icon={node.icon} />
                </div>

                <p className="text-[11px] font-mono font-bold text-white leading-tight truncate">
                  {node.name}
                </p>
                <p
                  className="text-[9px] font-mono mt-0.5 leading-snug"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {node.subtitle}
                </p>

                <StatusBadge ok={nodeOk} staleAge={staleAge} />
              </div>

              {/* Arrow between nodes */}
              {i < NODES.length - 1 && (
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  className="shrink-0 mx-1"
                  fill="none"
                  stroke="rgba(255,255,255,0.20)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
