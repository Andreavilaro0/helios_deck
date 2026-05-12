import { useRef, useEffect } from "react";
import { createChart, ColorType, LineStyle, AreaSeries, HistogramSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";

interface ThresholdLine {
  value: number;
  color: string;
  label: string;
}

interface Props {
  values: number[];
  color: string;
  logScale?: boolean;
  barMode?: boolean;
  barColorFn?: (value: number) => string;
  barDomainMax?: number;
  thresholdLines?: ThresholdLine[];
  height?: number;
}

export function LwSparkline({
  values,
  color,
  logScale = false,
  barMode = false,
  barColorFn,
  thresholdLines,
  height = 80,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || values.length < 2) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(148,163,184,0.45)",
        fontFamily: "monospace",
        fontSize: 9,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.04)", visible: true },
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      handleScroll: false,
      handleScale: false,
    });

    const transform = (v: number) =>
      logScale ? Math.log10(Math.max(v, 1e-15)) : v;

    if (barMode) {
      const series = chart.addSeries(HistogramSeries, {
        color,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const data = values.map((v, i) => ({
        time: (i + 1) as UTCTimestamp,
        value: v,
        color: barColorFn ? barColorFn(v) + "cc" : color + "cc",
      }));
      series.setData(data);

      thresholdLines?.forEach((tl) => {
        series.createPriceLine({
          price: tl.value,
          color: tl.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: false,
          title: tl.label,
        });
      });
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: color + "28",
        bottomColor: color + "00",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });

      series.setData(
        values.map((v, i) => ({
          time: (i + 1) as UTCTimestamp,
          value: transform(v),
        }))
      );
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (container) chart.resize(container.clientWidth, height);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [values, color, logScale, barMode, barColorFn, thresholdLines, height]);

  if (values.length < 2) return null;
  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
