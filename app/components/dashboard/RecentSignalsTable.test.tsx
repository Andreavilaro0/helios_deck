// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecentSignalsTable } from "./RecentSignalsTable";
import type { SignalRow } from "./RecentSignalsTable";
import type { SignalRecord } from "~/types/signal";

const makeRow = (overrides: Partial<SignalRow> = {}): SignalRow => ({
  name: "X-Ray Flux Long",
  subtitle: "1–8 Å",
  value: "8.70e-7",
  unit: "W/m²",
  statusLabel: "QUIET",
  source: "NOAA SWPC",
  ingestedAt: "05/05/2026, 07:37:00",
  age: "7h",
  iconColor: "#f59e0b",
  iconVariant: "sun",
  ...overrides,
});

const makeSignalRecord = (signal = "kp-index"): SignalRecord => ({
  timestamp: new Date().toISOString(),
  source: "noaa-swpc",
  signal: signal as SignalRecord["signal"],
  value: 2.5,
  unit: "index",
  confidence: 1,
  metadata: {},
});

const ROWS: SignalRow[] = [
  makeRow({ name: "X-Ray Flux Long" }),
  makeRow({ name: "Solar Wind Speed", iconVariant: "wind", iconColor: "#60a5fa" }),
  makeRow({ name: "Proton Flux 10 MeV", iconVariant: "zap", iconColor: "#22d3ee" }),
  makeRow({ name: "Kp Index", iconVariant: "activity", iconColor: "#a78bfa" }),
];

const ALL_SIGNALS: SignalRecord[] = [makeSignalRecord("kp-index"), makeSignalRecord("xray-flux-long")];

describe("RecentSignalsTable", () => {
  it("renders all 4 signal rows", () => {
    render(<RecentSignalsTable rows={ROWS} allSignals={ALL_SIGNALS} />);
    expect(screen.getByText("X-Ray Flux Long")).toBeInTheDocument();
    expect(screen.getByText("Solar Wind Speed")).toBeInTheDocument();
    expect(screen.getByText("Proton Flux 10 MeV")).toBeInTheDocument();
    expect(screen.getByText("Kp Index")).toBeInTheDocument();
  });

  it("opens modal when 'View All Signals' button is clicked", () => {
    render(<RecentSignalsTable rows={ROWS} allSignals={ALL_SIGNALS} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/View All Signals/));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", () => {
    render(<RecentSignalsTable rows={ROWS} allSignals={ALL_SIGNALS} />);
    fireEvent.click(screen.getByText(/View All Signals/));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Close modal/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes modal when clicking the backdrop", () => {
    render(<RecentSignalsTable rows={ROWS} allSignals={ALL_SIGNALS} />);
    fireEvent.click(screen.getByText(/View All Signals/));
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows 'NO DATA' status badge when signal row has no data", () => {
    const nullRow = makeRow({ statusLabel: "NO DATA", value: "—" });
    render(<RecentSignalsTable rows={[nullRow]} allSignals={[]} />);
    expect(screen.getByText("NO DATA")).toBeInTheDocument();
  });

  it("shows 'No records yet.' in modal when allSignals is empty", () => {
    render(<RecentSignalsTable rows={ROWS} allSignals={[]} />);
    fireEvent.click(screen.getByText(/View All Signals/));
    expect(screen.getByText("No records yet.")).toBeInTheDocument();
  });
});
