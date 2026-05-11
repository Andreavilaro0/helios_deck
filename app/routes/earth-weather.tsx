import { lazy, Suspense } from "react";
import type { Route } from "./+types/earth-weather";
import { fetchOpenMeteo } from "~/services/fetchers/open-meteo.server";
import { getLatestSignalByName } from "~/services/signals.server";
import { getMoonPhase } from "~/utils/moon-phase";
import { wmoLabel, wmoIcon } from "~/utils/wmo";
import { DashboardTopbar } from "~/components/layout/DashboardTopbar";
import { WeatherIcon } from "~/components/weather/WeatherIcon";
import { KpCircleGauge } from "~/components/weather/KpCircleGauge";
import { PressureGauge } from "~/components/weather/PressureGauge";
import { HumidityGauge } from "~/components/weather/HumidityGauge";
import { MoonPhaseWidget } from "~/components/weather/MoonPhaseWidget";

// Reykjavik default location
const DEFAULT_LAT = 64.1355;
const DEFAULT_LON = -21.8954;
const DEFAULT_CITY = "Reykjavik, Iceland";

const WeatherGlobeScene = lazy(() =>
  import("~/components/weather/WeatherGlobeScene").then((m) => ({ default: m.WeatherGlobeScene }))
);

export function meta(_: Route.MetaArgs) {
  return [{ title: "HELIOS — Earth Weather Explorer" }];
}

export async function loader(_: Route.LoaderArgs) {
  const [weather, kpSignal] = await Promise.all([
    fetchOpenMeteo(DEFAULT_LAT, DEFAULT_LON).catch(() => null),
    Promise.resolve(getLatestSignalByName("kp-index")),
  ]);
  const moon = getMoonPhase(new Date());
  const kp   = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
  return { weather, moon, kp };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.70)", fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function CurrentWeatherCard({ weather }: { weather: NonNullable<Awaited<ReturnType<typeof loader>>["weather"]> }) {
  const { current } = weather;
  const icon = wmoIcon(current.weatherCode);
  const label = wmoLabel(current.weatherCode);
  const timeStr = new Date(current.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(249,243,250,0.04)", border: "1px solid rgba(249,243,250,0.09)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Current Report
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>{DEFAULT_CITY}</p>
        </div>
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#4ade80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", padding: "2px 7px", borderRadius: 99, letterSpacing: "0.1em" }}>
          LIVE
        </span>
      </div>

      <div className="flex items-end gap-3">
        <WeatherIcon type={icon} size={52} color="rgba(148,163,184,0.8)" />
        <div>
          <div style={{ fontSize: 52, fontWeight: 700, fontFamily: "monospace", color: "#fff", lineHeight: 1 }}>
            {current.temperature}°
          </div>
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {label}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <StatRow label="Current Time" value={timeStr} />
        <StatRow label="Wind Speed"   value={`${current.windSpeed} km/h`} />
        <StatRow label="Pressure"     value={`${current.pressure} hPa`} />
        <StatRow label="Humidity"     value={`${current.humidity}%`} />
        <StatRow label="UV Index"     value={String(current.uvIndex)} />
      </div>
    </div>
  );
}

function HourlyForecast({ hourly }: { hourly: NonNullable<Awaited<ReturnType<typeof loader>>["weather"]>["hourly"] }) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: "rgba(249,243,250,0.03)", border: "1px solid rgba(249,243,250,0.09)" }}
    >
      <p className="mb-2 text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Hourly Forecast
      </p>
      <div className="flex gap-1 overflow-x-auto">
        {hourly.map((h) => {
          const hour = new Date(h.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
          return (
            <div key={h.time} className="flex flex-col items-center gap-1 shrink-0 px-2 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", minWidth: 52 }}>
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>{hour}</span>
              <WeatherIcon type={wmoIcon(h.weatherCode)} size={20} color="rgba(148,163,184,0.8)" />
              <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>{h.temperature}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyForecast({ daily }: { daily: NonNullable<Awaited<ReturnType<typeof loader>>["weather"]>["daily"] }) {
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  return (
    <div className="flex flex-col gap-2 h-full">
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        3-Day Forecast
      </p>
      {daily.slice(1).map((d) => {
        const dow = days[new Date(d.date).getDay()];
        return (
          <div key={d.date}
            className="rounded-xl flex items-center gap-3 px-3 py-2.5"
            style={{ background: "rgba(249,243,250,0.04)", border: "1px solid rgba(249,243,250,0.07)", flex: 1 }}
          >
            <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700, color: "rgba(255,255,255,0.50)", minWidth: 30 }}>{dow}</span>
            <WeatherIcon type={wmoIcon(d.weatherCode)} size={22} color="rgba(148,163,184,0.8)" />
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", flex: 1 }}>{wmoLabel(d.weatherCode)}</span>
            <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
              {d.tempMax}° <span style={{ color: "rgba(255,255,255,0.30)" }}>{d.tempMin}°</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AuroraCard({ kp }: { kp: number }) {
  const threshold = 5;
  const label = kp >= threshold ? "ACTIVE" : "INACTIVE";
  const color  = kp >= threshold ? "#f87171" : "#4ade80";
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: "rgba(249,243,250,0.03)", border: "1px solid rgba(249,243,250,0.09)" }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Solar Aurora
      </p>
      <div className="flex items-center gap-2 mt-1">
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 700, color, letterSpacing: "0.1em" }}>{label}</span>
      </div>
      <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)" }}>
        Kp threshold: {threshold} · Current: {kp.toFixed(1)}
      </p>
    </div>
  );
}

// ── Route component ───────────────────────────────────────────────────────────

export default function EarthWeatherPage({ loaderData }: Route.ComponentProps) {
  const { weather, moon, kp } = loaderData;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#080d14" }}>
      <DashboardTopbar title="Earth Weather Explorer" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Top section: 3 columns */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "300px 1fr 260px", minHeight: 360 }}>
          {/* Left: current + hourly */}
          <div className="flex flex-col gap-3">
            {weather ? <CurrentWeatherCard weather={weather} /> : (
              <div className="rounded-2xl p-4 flex items-center justify-center h-48"
                style={{ background: "rgba(249,243,250,0.03)", border: "1px solid rgba(249,243,250,0.09)" }}>
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>Weather unavailable</span>
              </div>
            )}
            {weather && <HourlyForecast hourly={weather.hourly} />}
          </div>

          {/* Center: globe */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#060b14", border: "1px solid rgba(249,243,250,0.07)" }}>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>Loading globe…</span>
              </div>
            }>
              <WeatherGlobeScene />
            </Suspense>
          </div>

          {/* Right: daily forecast */}
          <div className="flex flex-col">
            {weather ? <DailyForecast daily={weather.daily} /> : (
              <div className="rounded-2xl p-4 flex items-center justify-center h-full"
                style={{ background: "rgba(249,243,250,0.03)", border: "1px solid rgba(249,243,250,0.09)" }}>
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>Forecast unavailable</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: instruments */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          <KpCircleGauge kp={kp} />
          {weather && <PressureGauge pressure={weather.current.pressure} />}
          {weather && <HumidityGauge humidity={weather.current.humidity} />}
          <MoonPhaseWidget moon={moon} />
          <AuroraCard kp={kp} />
        </div>
      </main>
    </div>
  );
}
