// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpHistoryStrip } from "./KpHistoryStrip";
import type { SignalRecord } from "~/types/signal";

function makeSignal(kp: number, timestamp: string): SignalRecord {
  return {
    timestamp,
    source: "noaa-swpc",
    signal: "kp-index",
    value: kp,
    unit: "index",
    confidence: 0.9,
    metadata: {},
  };
}

// Newest-first — matches listRecentSignalsByName output order
const SIGNALS: SignalRecord[] = [
  makeSignal(6, "2026-04-29T16:00:00Z"),
  makeSignal(4, "2026-04-29T15:00:00Z"),
  makeSignal(2, "2026-04-29T14:00:00Z"),
];

describe("KpHistoryStrip", () => {
  it("renders nothing when signals array is empty", () => {
    const { container } = render(<KpHistoryStrip signals={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the correct reading count in the heading", () => {
    render(<KpHistoryStrip signals={SIGNALS} />);
    expect(screen.getByText(/last 3 readings/i)).toBeInTheDocument();
  });

  it("renders one bar per signal", () => {
    render(<KpHistoryStrip signals={SIGNALS} />);
    const chart = screen.getByRole("img", { name: /kp index history chart/i });
    expect(chart.children).toHaveLength(SIGNALS.length);
  });

  it("shows the latest timestamp in the footer", () => {
    render(<KpHistoryStrip signals={SIGNALS} />);
    expect(screen.getByText(/2026-04-29 16:00:00 UTC/)).toBeInTheDocument();
  });
});
