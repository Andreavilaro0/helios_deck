import type { WeatherLocation, WeatherData } from "~/types/weather";
import { MOCK_WEATHER } from "~/components/weather/earthWeather.mock";
import type { RawOpenMeteo } from "./weatherMapper";
import { mapOpenMeteoResponse } from "./weatherMapper";

/** Mock fallback — keeps existing mock data accessible. */
export function getMockWeatherByLocation(locationId: string): WeatherData {
  return MOCK_WEATHER[locationId] ?? MOCK_WEATHER["reykjavik"];
}

/** Fetch real weather from Open-Meteo (no API key, CORS open). */
export async function getWeatherForecast(location: WeatherLocation): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude:  String(location.lat),
    longitude: String(location.lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "visibility",
      "uv_index",
    ].join(","),
    hourly: ["temperature_2m", "weather_code", "precipitation_probability"].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(","),
    timezone:        location.timezone ?? "UTC",
    forecast_days:   "5",
    wind_speed_unit: "kmh",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast HTTP ${res.status}`);

  const raw = (await res.json()) as RawOpenMeteo;

  // Match the current time to the closest hourly slot
  const hourPrefix  = raw.current.time.slice(0, 13); // "YYYY-MM-DDTHH"
  const currentIdx  = raw.hourly.time.findIndex((t) => t.startsWith(hourPrefix));

  return mapOpenMeteoResponse(raw, currentIdx >= 0 ? currentIdx : 0);
}
