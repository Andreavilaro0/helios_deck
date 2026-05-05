// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataPipelinePanel } from "./DataPipelinePanel";

const NODE_NAMES = ["NOAA SWPC", "Fetchers", "Normalizers", "SQLite", "SSR Loaders", "UI"];

describe("DataPipelinePanel", () => {
  it("renders all 6 nodes", () => {
    render(<DataPipelinePanel pipelineOk={true} staleAge="—" />);
    for (const name of NODE_NAMES) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("shows OK badge for all nodes when pipelineOk=true", () => {
    render(<DataPipelinePanel pipelineOk={true} staleAge="—" />);
    const okBadges = screen.getAllByText("OK");
    expect(okBadges).toHaveLength(6);
  });

  it("shows STALE badge for nodes 1–5 when pipelineOk=false", () => {
    render(<DataPipelinePanel pipelineOk={false} staleAge="2h 30m" />);
    const staleBadges = screen.getAllByText(/STALE/);
    expect(staleBadges).toHaveLength(5);
  });

  it("node 6 (UI) always shows OK even when pipelineOk=false", () => {
    render(<DataPipelinePanel pipelineOk={false} staleAge="1h" />);
    const okBadges = screen.getAllByText("OK");
    expect(okBadges).toHaveLength(1);
  });

  it("includes staleAge string in STALE badge text", () => {
    render(<DataPipelinePanel pipelineOk={false} staleAge="4h 10m" />);
    expect(screen.getAllByText(/4h 10m/)[0]).toBeInTheDocument();
  });
});
