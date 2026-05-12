import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";

export interface TimelineSignal {
  data: number[];
  color: string;
  label: string;
  unit: string;
  logScale?: boolean;
  gradientId: string;
}

interface SignalTimelineProps {
  signals: TimelineSignal[];
  chartHeight?: number;
}

function transform(v: number, logScale?: boolean): number {
  return logScale ? Math.log10(Math.max(v, 1e-15)) : v;
}

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => ((v - min) / range) * 100);
}

export function SignalTimeline({ signals, chartHeight = 160 }: SignalTimelineProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(148,163,184,0.35)",
        fontFamily: "monospace",
        fontSize: 9,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.04)", visible: true },
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.18)", labelVisible: false },
        horzLine: { visible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: false,
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    signals.forEach((sig) => {
      if (sig.data.length < 2) return;

      const transformed = sig.data.map((v) => transform(v, sig.logScale));
      const norm = normalize(transformed);

      const series = chart.addSeries(AreaSeries, {
        lineColor: sig.color,
        topColor: sig.color + "22",
        bottomColor: sig.color + "00",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: "rgba(8,12,20,0.9)",
        crosshairMarkerBackgroundColor: sig.color,
      });

      series.setData(
        norm.map((v, i) => ({
          time: (i + 1) as UTCTimestamp,
          value: v,
        }))
      );
    });

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (container) chart.resize(container.clientWidth, chartHeight);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [signals, chartHeight]);

  const hasData = signals.some((s) => s.data.length >= 2);
  if (!hasData) return null;

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: "var(--dash-card-bg)",
        borderColor: "var(--dash-card-border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase">
          Signal History
        </p>
        <div className="flex items-center gap-4">
          {signals.map((sig) => (
            <div key={sig.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: sig.color }} />
              <span className="text-xs font-mono text-white/40">{sig.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={containerRef} style={{ height: chartHeight }} />
    </div>
  );
}
