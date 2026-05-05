import { useState } from "react";
import type { ReactNode } from "react";
import type { SignalRecord } from "~/types/signal";

export interface SignalRow {
  name: string;
  subtitle: string;
  value: string;
  unit: string;
  statusLabel: string;
  source: string;
  ingestedAt: string;
  age: string;
  iconColor: string;
  iconVariant: "sun" | "wind" | "zap" | "activity";
}

export interface RecentSignalsTableProps {
  rows: SignalRow[];
  allSignals: SignalRecord[];
}

// ---------------------------------------------------------------------------
// Status badge color
// ---------------------------------------------------------------------------

function statusBadgeColor(status: string): {
  bg: string;
  border: string;
  text: string;
} {
  const s = status.toUpperCase();
  if (["QUIET", "NOMINAL", "SLOW", "A — QUIET", "LOW"].some((k) => s.includes(k.toUpperCase()))) {
    return { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.30)", text: "#4ade80" };
  }
  if (["B — MINOR", "ACTIVE", "FAST", "ELEVATED", "MODERATE"].some((k) => s.includes(k.toUpperCase()))) {
    return { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.30)", text: "#fbbf24" };
  }
  if (["STORM", "RADIATION WATCH", "EXTREME", "X — EXTREME", "HIGH"].some((k) => s.includes(k.toUpperCase()))) {
    return { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.30)", text: "#f87171" };
  }
  if (s === "NO DATA") {
    return { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.20)", text: "rgba(255,255,255,0.40)" };
  }
  return { bg: "rgba(147,197,253,0.12)", border: "rgba(147,197,253,0.25)", text: "#93c5fd" };
}

// ---------------------------------------------------------------------------
// Row icons
// ---------------------------------------------------------------------------

function RowIcon({ variant, color }: { variant: SignalRow["iconVariant"]; color: string }): ReactNode {
  const s = { stroke: color, fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (variant) {
    case "sun":
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" {...s}>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    case "wind":
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" {...s}>
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      );
    case "zap":
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" {...s}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "activity":
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" {...s}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Shared table row
// ---------------------------------------------------------------------------

const COL = "2fr 1.2fr 1fr 1fr 1.5fr 0.7fr";

function TableHeader(): ReactNode {
  return (
    <div
      className="grid gap-3 px-3 py-2 text-[9px] font-mono tracking-[0.15em] uppercase"
      style={{ gridTemplateColumns: COL, color: "rgba(255,255,255,0.30)" }}
    >
      <span>Signal</span>
      <span>Value</span>
      <span>Status</span>
      <span>Source</span>
      <span>Last Ingested (UTC)</span>
      <span>Age</span>
    </div>
  );
}

function SignalTableRow({ row }: { row: SignalRow }): ReactNode {
  const badge = statusBadgeColor(row.statusLabel);
  return (
    <div
      className="grid gap-3 px-3 py-3 items-center text-[10px] font-mono"
      style={{
        gridTemplateColumns: COL,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Signal */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: `${row.iconColor}20` }}
        >
          <RowIcon variant={row.iconVariant} color={row.iconColor} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white leading-tight truncate">{row.name}</p>
          <p className="text-[9px] leading-tight truncate" style={{ color: "rgba(255,255,255,0.30)" }}>
            {row.subtitle}
          </p>
        </div>
      </div>

      {/* Value */}
      <div>
        <span className="text-white">{row.value}</span>
        {" "}
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px" }}>{row.unit}</span>
      </div>

      {/* Status */}
      <div>
        <span
          className="inline-flex px-2 py-0.5 rounded-full font-semibold text-[9px]"
          style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}
        >
          {row.statusLabel}
        </span>
      </div>

      {/* Source */}
      <span style={{ color: "rgba(255,255,255,0.50)" }}>{row.source}</span>

      {/* Last ingested */}
      <span style={{ color: "rgba(255,255,255,0.50)" }}>{row.ingestedAt}</span>

      {/* Age */}
      <span style={{ color: "rgba(255,255,255,0.40)" }}>{row.age}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status interpretation per signal name (for modal rows)
// ---------------------------------------------------------------------------

type InterpretFn = (v: SignalRecord["value"]) => string;

const SIGNAL_INTERPRET: Partial<Record<SignalRecord["signal"], InterpretFn>> = {
  "kp-index": (v) => {
    if (typeof v !== "number") return "UNKNOWN";
    if (v >= 5) return "STORM";
    if (v >= 4) return "ACTIVE";
    return "QUIET";
  },
  "xray-flux-long": (v) => {
    if (typeof v !== "number") return "UNKNOWN";
    if (v >= 1e-4) return "X — EXTREME";
    if (v >= 1e-5) return "M — SIGNIFICANT";
    if (v >= 1e-6) return "C — MODERATE";
    if (v >= 1e-7) return "B — MINOR";
    return "A — QUIET";
  },
  "xray-flux-short": (v) => {
    if (typeof v !== "number") return "UNKNOWN";
    if (v >= 1e-4) return "X — EXTREME";
    if (v >= 1e-6) return "B — MINOR";
    return "A — QUIET";
  },
  "proton-flux-10mev": (v) => {
    if (typeof v !== "number") return "UNKNOWN";
    if (v >= 10) return "RADIATION WATCH";
    if (v >= 1) return "ELEVATED";
    return "QUIET";
  },
  "solar-wind-speed": (v) => {
    if (typeof v !== "number") return "UNKNOWN";
    if (v >= 800) return "EXTREME";
    if (v >= 600) return "FAST";
    if (v >= 400) return "NOMINAL";
    return "SLOW";
  },
};

// ---------------------------------------------------------------------------
// Modal table row (same shape but from SignalRecord)
// ---------------------------------------------------------------------------

function modalRowFromRecord(r: SignalRecord, index: number): ReactNode {
  const formatVal =
    typeof r.value === "number"
      ? r.value < 0.01
        ? r.value.toExponential(2)
        : r.value.toFixed(2)
      : "—";

  const ingestedAt = new Date(r.timestamp).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  const ageMs = Date.now() - new Date(r.timestamp).getTime();
  const ageMin = ageMs / 60000;
  const age =
    ageMin < 60
      ? `${Math.round(ageMin)}m`
      : ageMin < 1440
        ? `${Math.floor(ageMin / 60)}h`
        : `${Math.floor(ageMin / 1440)}d`;

  const statusLabel = SIGNAL_INTERPRET[r.signal]?.(r.value) ?? "NOMINAL";
  const badge = statusBadgeColor(statusLabel);

  return (
    <div
      key={`${r.signal}-${r.timestamp}-${index}`}
      className="grid gap-3 px-3 py-2.5 items-center text-[10px] font-mono"
      style={{
        gridTemplateColumns: COL,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span className="font-bold text-white truncate">{r.signal}</span>
      <span className="text-white">{formatVal}</span>
      <span
        className="inline-flex px-2 py-0.5 rounded-full font-semibold text-[9px]"
        style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}
      >
        {statusLabel}
      </span>
      <span style={{ color: "rgba(255,255,255,0.50)" }}>{r.source ?? "NOAA SWPC"}</span>
      <span style={{ color: "rgba(255,255,255,0.50)" }}>{ingestedAt}</span>
      <span style={{ color: "rgba(255,255,255,0.40)" }}>{age}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SignalsModal
// ---------------------------------------------------------------------------

export interface SignalsModalProps {
  open: boolean;
  onClose: () => void;
  allSignals: SignalRecord[];
}

export function SignalsModal({ open, onClose, allSignals }: SignalsModalProps): ReactNode {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.70)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="All Signals"
    >
      <div
        className="rounded-2xl p-6 overflow-y-auto"
        style={{
          background: "#0d1220",
          border: "1px solid rgba(255,255,255,0.12)",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "80vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-mono font-bold text-white">
            All Signals — Last {allSignals.length} records
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-mono text-white/40 hover:text-white/80 transition-colors"
            aria-label="Close modal"
          >
            ✕ Close
          </button>
        </div>

        <TableHeader />

        {allSignals.length === 0 ? (
          <p
            className="text-center text-[11px] font-mono py-8"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            No records yet.
          </p>
        ) : (
          allSignals.map((r, i) => modalRowFromRecord(r, i))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecentSignalsTable
// ---------------------------------------------------------------------------

export function RecentSignalsTable({
  rows,
  allSignals,
}: RecentSignalsTableProps): ReactNode {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[9px] font-mono tracking-[0.25em] uppercase"
          style={{ color: "rgba(255,255,255,0.30)" }}
        >
          Recent Signals
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-[10px] font-mono transition-colors text-white/40 hover:text-white/80"
        >
          View All Signals →
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <TableHeader />
        {rows.map((row) => (
          <SignalTableRow key={row.name} row={row} />
        ))}
      </div>

      <SignalsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        allSignals={allSignals}
      />
    </section>
  );
}
