import { lazy, Suspense } from "react";
import type { Route } from "./+types/earth-weather";
import { fetchOpenMeteo } from "~/services/fetchers/open-meteo.server";
import {
  getLatestSignalByName,
  listRecentSignalsByName,
} from "~/services/signals.server";
import { getMoonPhase } from "~/utils/moon-phase";
import { getSunsetTime, getSunriseTime, minutesUntilSunset } from "~/utils/sun";
import { getSpaceWeatherImpact } from "~/utils/space-impact";
import { DashboardTopbar } from "~/components/layout/DashboardTopbar";
import { SearchBar } from "~/components/weather/SearchBar";
import { CurrentConditionsCard } from "~/components/weather/CurrentConditionsCard";
import { HourlyForecastChart } from "~/components/weather/HourlyForecastChart";
import { DailyForecastCard } from "~/components/weather/DailyForecastCard";
import { KpCircleGauge } from "~/components/weather/KpCircleGauge";
import { PressureGauge } from "~/components/weather/PressureGauge";
import { HumidityGauge } from "~/components/weather/HumidityGauge";
import { AuroraSunsetCard } from "~/components/weather/AuroraSunsetCard";
import { MoonPhaseWidget } from "~/components/weather/MoonPhaseWidget";
import { SolarAuroraChart } from "~/components/weather/SolarAuroraChart";
import { SpaceWeatherImpactCard } from "~/components/weather/SpaceWeatherImpactCard";

const DEFAULT_LAT = 64.1355;
const DEFAULT_LON = -21.8954;
const DEFAULT_CITY = "Reykjavik, Iceland";

// Lazy-load the Three.js globe so it never blocks the main bundle.
const WeatherGlobeScene = lazy(() =>
  import("~/components/weather/WeatherGlobeScene").then((m) => ({
    default: m.WeatherGlobeScene,
  }))
);

export function meta(_: Route.MetaArgs) {
  return [{ title: "HELIOS — Earth Weather Explorer" }];
}

export async function loader(_: Route.LoaderArgs) {
  const now = new Date();

  const [weather, kpSignal, kpHistory] = await Promise.all([
    fetchOpenMeteo(DEFAULT_LAT, DEFAULT_LON).catch(() => null),
    Promise.resolve(getLatestSignalByName("kp-index")),
    Promise.resolve(listRecentSignalsByName("kp-index", 48)),
  ]);

  const kp = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
  const moon = getMoonPhase(now);
  const sunset = getSunsetTime(DEFAULT_LAT, DEFAULT_LON, now);
  const sunrise = getSunriseTime(DEFAULT_LAT, DEFAULT_LON, now);
  const minsToSunset = minutesUntilSunset(sunset, now);
  const impact = getSpaceWeatherImpact(kp);

  return { weather, kp, kpHistory, moon, sunset, sunrise, minsToSunset, impact };
}

export default function EarthWeatherPage({ loaderData }: Route.ComponentProps) {
  const { weather, kp, kpHistory, moon, sunset, sunrise, minsToSunset, impact } =
    loaderData;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#050a12" }}>
      <DashboardTopbar title="Earth Weather Explorer" subtitle="HELIOS Observatory" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <SearchBar city={DEFAULT_CITY} />

        {/* 3-column main section */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "300px 1fr 240px", minHeight: "520px" }}
        >
          {/* Left column: current conditions + hourly chart */}
          <div className="flex flex-col gap-3">
            {weather ? (
              <>
                <CurrentConditionsCard weather={weather} city={DEFAULT_CITY} />
                <HourlyForecastChart hourly={weather.hourly} />
              </>
            ) : (
              <div
                className="rounded-2xl p-4 flex items-center justify-center flex-1"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "rgba(255,255,255,0.25)",
                  }}
                >
                  Weather unavailable
                </span>
              </div>
            )}
          </div>

          {/* Center column: interactive 3D globe */}
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: "#060b14",
              border: "1px solid rgba(255,255,255,0.07)",
              minHeight: "520px",
            }}
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.2)",
                    }}
                  >
                    Loading globe…
                  </span>
                </div>
              }
            >
              <WeatherGlobeScene />
            </Suspense>
          </div>

          {/* Right column: 3-day daily forecast */}
          {weather ? (
            <DailyForecastCard daily={weather.daily} />
          ) : (
            <div
              className="rounded-2xl p-4 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                Forecast unavailable
              </span>
            </div>
          )}
        </div>

        {/* 7-card bottom instrument row */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1.4fr 1.4fr" }}
        >
          <AuroraSunsetCard
            kp={kp}
            sunset={sunset}
            sunrise={sunrise}
            minutesToSunset={minsToSunset}
          />
          <KpCircleGauge kp={kp} />
          {weather ? (
            <PressureGauge pressure={weather.current.pressure} />
          ) : (
            <div />
          )}
          {weather ? (
            <HumidityGauge humidity={weather.current.humidity} />
          ) : (
            <div />
          )}
          <MoonPhaseWidget moon={moon} />
          <SolarAuroraChart history={kpHistory} currentKp={kp} />
          <SpaceWeatherImpactCard impact={impact} />
        </div>
      </main>
    </div>
  );
}
