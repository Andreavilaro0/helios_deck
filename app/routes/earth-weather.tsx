import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "./+types/earth-weather";
import {
  getLatestSignalByName,
  listRecentSignalsByName,
} from "~/services/signals.server";
import { getSpaceWeatherImpact } from "~/utils/space-impact";
import { requireUser } from "~/services/auth/session.server";
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
  return [{ title: "HELIOS — Explorador de Clima Terrestre" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  const kpSignal  = getLatestSignalByName("kp-index");
  const kpHistory = listRecentSignalsByName("kp-index", 48);
  const kp        = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
  const impact    = getSpaceWeatherImpact(kp);
  return { kp, kpHistory, impact };
}

const CARD_STYLE = {
  background: "linear-gradient(180deg, rgba(8,17,34,0.54) 0%, rgba(4,9,20,0.66) 100%)",
  border:     "1px solid rgba(255,255,255,0.07)",
  boxShadow:  "0 10px 30px rgba(0,0,0,0.22), inset 0 0 18px rgba(255,255,255,0.018)",
  backdropFilter: "blur(16px)",
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
  // SSR loader provides initialData — React Query takes over polling every 5 min
  const { data: kpData } = useQuery({
    queryKey: ["kp-current"],
    queryFn: async () => {
      const res = await fetch("/api/kp");
      return res.json() as Promise<{ kp: number; kpHistory: typeof loaderData.kpHistory }>;
    },
    initialData: { kp: loaderData.kp, kpHistory: loaderData.kpHistory },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const { kp, kpHistory } = kpData;
  const overallStatus = kp >= 5 ? "STORM" as const : kp >= 4 ? "ACTIVE" as const : "QUIET" as const;
  const hw = useEarthWeather();

  const cityLabel   = `${hw.location.name}, ${hw.location.country}`;
  const precipToday = hw.weather?.daily[0]?.precipProbMax ?? 0;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "transparent",
        backgroundImage: [
          "radial-gradient(ellipse at 80% 0%, rgba(52,129,255,0.14) 0%, transparent 40%)",
          "radial-gradient(ellipse at 5% 90%, rgba(14,165,233,0.10) 0%, transparent 36%)",
          "radial-gradient(ellipse at 50% 50%, rgba(30,58,138,0.10) 0%, transparent 60%)",
          "radial-gradient(ellipse at 78% 78%, rgba(99,102,241,0.07) 0%, transparent 28%)",
        ].join(", "),
      }}
    >
      <main className="flex-1 overflow-hidden p-4 flex flex-col gap-3 min-h-0">
        <SearchBar
          city={cityLabel}
          searchQuery={hw.searchQuery}
          isLoading={hw.isLoading}
          isSearching={hw.isSearching}
          suggestions={hw.suggestions}
          onSearch={hw.setSearchQuery}
          onSelectLocation={hw.setLocation}
          onSubmit={hw.submitSearch}
        />

        {/* Row 1 — Current conditions + 3D Globe */}
        <div
          className="grid gap-4 min-h-0"
          style={{ gridTemplateColumns: "300px 1fr", flex: "36 1 0" }}
        >
          {hw.weather ? (
            <CurrentConditionsCard weather={hw.weather} city={cityLabel} apiStatus={hw.apiStatus} />
          ) : (
            <EmptyCard label="Weather unavailable" />
          )}

          <div
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: "radial-gradient(ellipse at 50% 55%, rgba(10,30,100,0.35) 0%, rgba(1,4,18,1) 58%)",
              border: "1px solid rgba(59,130,246,0.32)",
              boxShadow: "0 0 60px rgba(59,130,246,0.12) inset, 0 12px 60px rgba(0,0,0,0.85)",
            }}
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

        {/* Row 2 — Hourly chart + 4-day forecast */}
        <div
          className="grid gap-4 min-h-0"
          style={{ gridTemplateColumns: "1fr 300px", flex: "40 1 0" }}
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
          className="grid gap-4 min-h-0"
          style={{ gridTemplateColumns: "repeat(6, 1fr)", flex: "24 1 0" }}
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
          style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(100,130,180,0.45)" }}
        >
          <span>Fuente: Open-Meteo · NOAA SWPC · SQLite</span>
          <div className="flex items-center gap-2">
            {hw.apiStatus === "demo" && (
              <span style={{
                fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.10em",
                color: "rgba(251,191,36,0.65)",
                border: "1px solid rgba(251,191,36,0.22)",
                padding: "1px 7px", borderRadius: 99,
              }}>
                DATOS DEMO
              </span>
            )}
            {hw.apiStatus === "live" && (
              <span style={{
                fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.10em",
                color: "rgba(74,222,128,0.65)",
                border: "1px solid rgba(74,222,128,0.22)",
                padding: "1px 7px", borderRadius: 99,
              }}>
                EN VIVO
              </span>
            )}
            <span>Hora local · {hw.location.timezone}</span>
          </div>
          <span>Actualización: 60s</span>
        </div>
      </main>
    </div>
  );
}
