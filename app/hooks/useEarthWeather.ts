import { useState, useEffect, useMemo } from "react";
import type { WeatherLocation, WeatherData } from "~/types/weather";
import type { MoonPhaseResult } from "~/utils/moon-phase";
import { getMoonPhase } from "~/utils/moon-phase";
import { getSunriseTime, getSunsetTime, minutesUntilSunset } from "~/utils/sun";
import { MOCK_LOCATIONS } from "~/components/weather/earthWeather.mock";
import { searchMockLocations } from "~/services/weather/geocoding";
import { getMockWeatherByLocation } from "~/services/weather/forecast";

function parseSunMinutes(hhmm: string): number {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export interface EarthWeatherHook {
  location: WeatherLocation;
  weather: WeatherData | null;
  searchQuery: string;
  isLoading: boolean;
  sunrise: string;
  sunset: string;
  minsToSunset: number | null;
  daylightMinutes: number;
  moon: MoonPhaseResult;
  suggestions: WeatherLocation[];
  setLocation: (loc: WeatherLocation) => void;
  setSearchQuery: (q: string) => void;
}

const DEFAULT_LOCATION = MOCK_LOCATIONS[0];

export function useEarthWeather(): EarthWeatherHook {
  const [location, setLocationState] = useState<WeatherLocation>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<WeatherData | null>(
    () => getMockWeatherByLocation(DEFAULT_LOCATION.id),
  );
  const [searchQuery, setSearchQueryState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Tick every minute to keep countdown accurate
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const sunrise = useMemo(
    () => getSunriseTime(location.lat, location.lon, now),
    [location.lat, location.lon, now],
  );
  const sunset = useMemo(
    () => getSunsetTime(location.lat, location.lon, now),
    [location.lat, location.lon, now],
  );
  const minsToSunset = useMemo(() => minutesUntilSunset(sunset, now), [sunset, now]);
  const daylightMinutes = useMemo(
    () => Math.max(0, parseSunMinutes(sunset) - parseSunMinutes(sunrise)),
    [sunrise, sunset],
  );
  const moon = useMemo(() => getMoonPhase(now), [now]);
  const suggestions = useMemo(() => searchMockLocations(searchQuery), [searchQuery]);

  function setLocation(loc: WeatherLocation) {
    setIsLoading(true);
    setLocationState(loc);
    setSearchQueryState("");
    // Simulate async fetch (300ms feels natural, matches globe transition)
    setTimeout(() => {
      setWeather(getMockWeatherByLocation(loc.id));
      setIsLoading(false);
    }, 300);
  }

  function setSearchQuery(q: string) {
    setSearchQueryState(q);
  }

  return {
    location, weather, searchQuery, isLoading,
    sunrise, sunset, minsToSunset, daylightMinutes, moon,
    suggestions,
    setLocation, setSearchQuery,
  };
}
