import type { ReactNode } from "react";

interface PipelineFooterProps {
  source: string;
  recordCount: number;
  maxKp: number;
  avgKp: number;
}

export function PipelineFooter({ source, recordCount, maxKp, avgKp }: PipelineFooterProps): ReactNode {
  return (
    <footer className="px-4 pb-10 text-center">
      <p className="text-xs font-mono text-white/20">
        ● {source.toUpperCase()}
        {"  →  "}HELIOS_DECK{"  →  "}SQLite{"  →  "}SSR{"  →  "}UI
        {"    "}{recordCount} readings · Max {maxKp.toFixed(2)} · Avg {avgKp.toFixed(2)}
      </p>
    </footer>
  );
}
