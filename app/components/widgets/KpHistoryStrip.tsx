import { useRef, useEffect } from "react";
import { createChart, ColorType, LineStyle, HistogramSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";
import type { SignalRecord } from "~/types/signal";

interface Props {
  signals: SignalRecord[];
  chartHeight?: number;
}

function kpBarColor(kp: number): string {
  if (kp >= 5) return "#f87171";
  if (kp >= 4) return "#facc15";
  return "#6289ce";
}

export function KpHistoryStrip({ signals, chartHeight = 80 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || signals.length === 0) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(148,163,184,0.40)",
        fontFamily: "monospace",
        fontSize: 9,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.04)", visible: true },
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.15)", labelVisible: false },
        horzLine: { visible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: true,
        borderColor: "rgba(255,255,255,0.06)",
        tickMarkFormatter: () => "",
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(HistogramSeries, {
      color: "#6289ce",
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const sorted = [...signals].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    series.setData(
      sorted.map((s) => {
        const kp = typeof s.value === "number" ? s.value : 0;
        return {
          time: Math.floor(new Date(s.timestamp).getTime() / 1000) as UTCTimestamp,
          value: kp,
          color: kpBarColor(kp) + "cc",
        };
      })
    );

    series.createPriceLine({
      price: 5,
      color: "#f87171",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: false,
      title: "G1",
    });

    series.createPriceLine({
      price: 4,
      color: "#facc15",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: false,
      title: "",
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

  if (signals.length === 0) return null;

  const oldest = signals.at(0)?.timestamp.slice(0, 16).replace("T", " ");
  const latest = signals.at(-1)?.timestamp.slice(0, 16).replace("T", " ");

  return (
    <div
      className="rounded-2xl border p-4 space-y-2"
      style={{
        background: "var(--dash-card-bg)",
        borderColor: "var(--dash-card-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Historial Kp — {signals.length} lecturas
        </span>
        <span className="text-[9px] font-mono text-white/20">Escala 0 – 9</span>
      </div>

      <div ref={containerRef} style={{ height: chartHeight }} />

      <div className="flex justify-between text-[9px] font-mono text-white/20">
        <span>{oldest} UTC</span>
        <span>{latest} UTC</span>
      </div>
    </div>
  );
}
