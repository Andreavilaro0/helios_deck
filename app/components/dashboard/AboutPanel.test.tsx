// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutPanel } from "./AboutPanel";

describe("AboutPanel", () => {
  it("is not visible when open=false", () => {
    const { container } = render(
      <AboutPanel open={false} onClose={() => {}} />
    );
    const aside = container.querySelector("aside");
    expect(aside?.style.transform).toBe("translateX(100%)");
  });

  it("is visible when open=true", () => {
    const { container } = render(
      <AboutPanel open={true} onClose={() => {}} />
    );
    const aside = container.querySelector("aside");
    expect(aside?.style.transform).toBe("translateX(0)");
  });

  it("renders all main sections when open", () => {
    render(<AboutPanel open={true} onClose={() => {}} />);
    expect(screen.getByText("Qué hace")).toBeTruthy();
    expect(screen.getByText("Pipeline de datos")).toBeTruthy();
    expect(screen.getByText("Fuentes de datos y APIs")).toBeTruthy();
    expect(screen.getByText("Construido con")).toBeTruthy();
    expect(screen.getByText("Estadísticas del proyecto")).toBeTruthy();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<AboutPanel open={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<AboutPanel open={true} onClose={onClose} />);
    // overlay is the first fixed div (before the aside)
    const overlay = container.querySelector("div.fixed.inset-0");
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders NOAA API entries", () => {
    render(<AboutPanel open={true} onClose={() => {}} />);
    expect(screen.getByText("NOAA SWPC")).toBeTruthy();
    expect(screen.getByText("NOAA GOES XRS")).toBeTruthy();
    expect(screen.getByText("NOAA DSCOVR / ACE")).toBeTruthy();
  });
});
