import { useState, useEffect, useMemo, useRef } from "react";
import type { WeatherLocation, WeatherData } from "~/types/weather";
import type { MoonPhaseResult } from "~/utils/moon-phase";
import { getMoonPhase } from "~/utils/moon-phase";
import { getSunriseTime, getSunsetTime, minutesUntilSunset } from "~/utils/sun";
import { MOCK_LOCATIONS } from "~/components/weather/earthWeather.mock";
import { searchLocations, searchMockLocations } from "~/services/weather/geocoding";
import { getWeatherForecast, getMockWeatherByLocation } from "~/services/weather/forecast";

function parseSunMinutes(hhmm: string): number {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export type ApiStatus = "idle" | "live" | "demo";

export interface EarthWeatherHook {
  location: WeatherLocation;
  weather: WeatherData | null;
  searchQuery: string;
  isLoading: boolean;
  isSearching: boolean;
  apiStatus: ApiStatus;
  sunrise: string;
  sunset: string;
  minsToSunset: number | null;
  daylightMinutes: number;
  moon: MoonPhaseResult;
  suggestions: WeatherLocation[];
  setLocation: (loc: WeatherLocation) => void;
  setSearchQuery: (q: string) => void;
  submitSearch: () => void;
  refreshWeather: () => void;
}

const DEFAULT_LOCATION = MOCK_LOCATIONS[0];
const DEBOUNCE_MS = 400;
const REFRESH_MS  = 60_000;

export function useEarthWeather(): EarthWeatherHook {
  const [location, setLocationState]     = useState<WeatherLocation>(DEFAULT_LOCATION);
  const [weather, setWeather]             = useState<WeatherData | null>(
    () => getMockWeatherByLocation(DEFAULT_LOCATION.id),
  );
  const [searchQuery, setSearchQueryState] = useState("");
  const [suggestions, setSuggestions]      = useState<WeatherLocation[]>(MOCK_LOCATIONS);
  const [isLoading, setIsLoading]           = useState(false);
  const [isSearching, setIsSearching]       = useState(false);
  const [apiStatus, setApiStatus]           = useState<ApiStatus>("idle");
  const [now, setNow]                       = useState(() => new Date());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref so the auto-refresh interval always sees the latest location
  const locationRef = useRef<WeatherLocation>(location);
  locationRef.current = location;

  // Clock tick for sunset countdown (every minute)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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

  async function loadWeather(loc: WeatherLocation, showLoading: boolean): Promise<void> {
    if (showLoading) setIsLoading(true);
    try {
      const data = await getWeatherForecast(loc);
      setWeather(data);
      setApiStatus("live");
    } catch {
      // Graceful fallback: use nearest mock city by name, else default
      const fallbackId =
        MOCK_LOCATIONS.find((ml) => ml.name.toLowerCase() === loc.name.toLowerCase())?.id
        ?? "reykjavik";
      setWeather(getMockWeatherByLocation(fallbackId));
      setApiStatus("demo");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }

  // Auto-refresh every 60s — uses locationRef so it always fetches the current city
  // State setters from useState are guaranteed stable by React, safe in stale closure
  useEffect(() => {
    const id = setInterval(() => {
      void loadWeather(locationRef.current, false);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function setLocation(loc: WeatherLocation): void {
    setLocationState(loc);
    setSearchQueryState("");
    setSuggestions(MOCK_LOCATIONS);
    void loadWeather(loc, true);
  }

  function setSearchQuery(q: string): void {
    setSearchQueryState(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setSuggestions(MOCK_LOCATIONS);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      void searchLocations(q)
        .then((results) => {
          setSuggestions(results.length > 0 ? results : searchMockLocations(q));
          setIsSearching(false);
        })
        .catch(() => {
          setSuggestions(searchMockLocations(q));
          setIsSearching(false);
        });
    }, DEBOUNCE_MS);
  }

  function submitSearch(): void {
    const q = searchQuery.trim();
    if (!q) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsSearching(true);
    void searchLocations(q).then((results) => {
      const list = results.length > 0 ? results : searchMockLocations(q);
      setSuggestions(list);
      setIsSearching(false);
      if (list.length > 0) setLocation(list[0]);
    });
  }

  function refreshWeather(): void {
    void loadWeather(location, true);
  }

  return {
    location,
    weather,
    searchQuery,
    isLoading,
    isSearching,
    apiStatus,
    sunrise,
    sunset,
    minsToSunset,
    daylightMinutes,
    moon,
    suggestions,
    setLocation,
    setSearchQuery,
    submitSearch,
    refreshWeather,
  };
}
