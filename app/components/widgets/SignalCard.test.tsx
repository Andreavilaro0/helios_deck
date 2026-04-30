// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignalCard } from "./SignalCard";
import type { SignalRecord } from "~/types/signal";

// ---------------------------------------------------------------------------
// Fixture — a valid Kp index record at "Quiet" level
// ---------------------------------------------------------------------------

const BASE_SIGNAL: SignalRecord = {
  timestamp: "2026-04-29T16:26:00Z",
  source: "noaa-swpc",
  signal: "kp-index",
  value: 2.33,
  unit: "index",
  confidence: 0.9,
  metadata: { kp_index: 2, kp_class: "2+" },
};

// ---------------------------------------------------------------------------
// SignalCard rendering
// ---------------------------------------------------------------------------

describe("SignalCard", () => {
  it("renders the signal value", () => {
    render(<SignalCard signal={BASE_SIGNAL} />);
    expect(screen.getByText(/2\.33/)).toBeInTheDocument();
  });

  it("renders the unit", () => {
    render(<SignalCard signal={BASE_SIGNAL} />);
    expect(screen.getByText("index")).toBeInTheDocument();
  });

  it("renders the source", () => {
    render(<SignalCard signal={BASE_SIGNAL} />);
    expect(screen.getByText(/noaa-swpc/i)).toBeInTheDocument();
  });

  it("renders the timestamp inside a <time> element with the correct dateTime attribute", () => {
    const { container } = render(<SignalCard signal={BASE_SIGNAL} />);
    const timeEl = container.querySelector("time") as HTMLTimeElement;
    expect(timeEl).not.toBeNull();
    expect(timeEl.dateTime).toBe("2026-04-29T16:26:00Z");
    expect(timeEl.textContent).toMatch(/Apr 29/);
  });

  it("shows Quiet when Kp < 4", () => {
    render(<SignalCard signal={{ ...BASE_SIGNAL, value: 2.5 }} />);
    expect(screen.getByTestId("kp-status")).toHaveTextContent("Quiet");
  });

  it("shows Active when Kp >= 4 and < 5", () => {
    render(<SignalCard signal={{ ...BASE_SIGNAL, value: 4.3 }} />);
    expect(screen.getByTestId("kp-status")).toHaveTextContent("Active");
  });

  it("shows Storm when Kp >= 5", () => {
    render(<SignalCard signal={{ ...BASE_SIGNAL, value: 6.0 }} />);
    expect(screen.getByTestId("kp-status")).toHaveTextContent("Storm");
  });
});
