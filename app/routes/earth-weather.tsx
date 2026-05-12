import { lazy, Suspense } from "react";
import type { Route } from "./+types/earth-weather";
import {
  getLatestSignalByName,
  listRecentSignalsByName,
} from "~/services/signals.server";
import { getSpaceWeatherImpact } from "~/utils/space-impact";
import { EarthWeatherHeader } from "~/components/weather/EarthWeatherHeader";
import { SearchBar } from "~/components/weather/SearchBar";
import { CurrentConditionsCard } from "~/components/weather/CurrentConditionsCard";
import { HourlyForecastChart } from "~/components/weather/HourlyForecastChart";
import { DailyForecastCard } from "~/components/weather/DailyForecastCard";
import { SunriseSunsetCard } from "~/components/weather/SunriseSunsetCard";
import { UVIndexCard } from "~/components/weather/UVIndexCard";
import { PressureCard } from "~/components/weather/PressureCard";
import { RainChanceCard } from "~/components/weather/RainChanceCard";
import { MoonPhaseWidget } from "~/components/weather/MoonPhaseWidget";
import { SpaceWeatherImpactCard } from "~/components/weather/SpaceWeatherImpactCard";
import { useEarthWeather } from "~/hooks/useEarthWeather";

const WeatherGlobeScene = lazy(() =>
  import("~/components/weather/WeatherGlobeScene").then((m) => ({
    default: m.WeatherGlobeScene,
  }))
);

export function meta(_: Route.MetaArgs) {
  return [{ title: "HELIOS — Earth Weather Explorer" }];
}

export async function loader(_: Route.LoaderArgs) {
  const kpSignal  = getLatestSignalByName("kp-index");
  const kpHistory = listRecentSignalsByName("kp-index", 48);
  const kp        = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
  const impact    = getSpaceWeatherImpact(kp);
  return { kp, kpHistory, impact };
}

const CARD_STYLE = {
  background: "rgba(255,255,255,0.025)",
  border:     "1px solid rgba(255,255,255,0.07)",
};

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-center h-full" style={CARD_STYLE}>
      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>
        {label}
      </span>
    </div>
  );
}

export default function EarthWeatherPage({ loaderData }: Route.ComponentProps) {
  const { kp, kpHistory } = loaderData;
  const hw = useEarthWeather();

  const cityLabel     = `${hw.location.name}, ${hw.location.country}`;
  const precipToday   = hw.weather?.daily[0]?.precipProbMax ?? 0;

  return (
    <div className="flex flex-col h-full">
      <EarthWeatherHeader />

      <main className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        <SearchBar
          city={cityLabel}
          searchQuery={hw.searchQuery}
          isLoading={hw.isLoading}
          suggestions={hw.suggestions}
          onSearch={hw.setSearchQuery}
          onSelectLocation={hw.setLocation}
        />

        {/* Row 1 — Current conditions + 3D Globe */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "340px 1fr", height: "290px" }}
        >
          {hw.weather ? (
            <CurrentConditionsCard weather={hw.weather} city={cityLabel} />
          ) : (
            <EmptyCard label="Weather unavailable" />
          )}

          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: "#060b14", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>
                    Loading globe…
                  </span>
                </div>
              }
            >
              <WeatherGlobeScene
                lat={hw.location.lat}
                lon={hw.location.lon}
                locationLabel={cityLabel}
              />
            </Suspense>
          </div>
        </div>

        {/* Row 2 — Hourly chart + 5-day forecast */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "1fr 340px" }}
        >
          {hw.weather ? (
            <HourlyForecastChart hourly={hw.weather.hourly} />
          ) : (
            <EmptyCard label="Hourly unavailable" />
          )}

          {hw.weather ? (
            <DailyForecastCard daily={hw.weather.daily} />
          ) : (
            <EmptyCard label="Forecast unavailable" />
          )}
        </div>

        {/* Row 3 — 6 stat cards */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(6, 1fr)", minHeight: "150px" }}
        >
          <SunriseSunsetCard
            sunrise={hw.sunrise}
            sunset={hw.sunset}
            minutesToSunset={hw.minsToSunset}
            daylightMinutes={hw.daylightMinutes}
          />
          {hw.weather ? (
            <UVIndexCard uvIndex={hw.weather.current.uvIndex} />
          ) : (
            <EmptyCard label="UV unavailable" />
          )}
          {hw.weather ? (
            <PressureCard pressure={hw.weather.current.pressure} />
          ) : (
            <EmptyCard label="Pressure unavailable" />
          )}
          <RainChanceCard precipProbability={precipToday} />
          <MoonPhaseWidget moon={hw.moon} />
          <SpaceWeatherImpactCard kp={kp} kpHistory={kpHistory} />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-2 pb-1 shrink-0"
          style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.20)" }}
        >
          <span>Data Source: NOAA, MET Norway, Open-Meteo</span>
          <span>All times local to {hw.location.name} ({hw.location.timezone})</span>
          <span>Auto-refresh: 60s</span>
        </div>
      </main>
    </div>
  );
}
