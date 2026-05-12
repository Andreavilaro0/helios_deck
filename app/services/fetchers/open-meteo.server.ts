export type { WeatherCurrent, WeatherHourly, WeatherDaily, WeatherData } from "~/types/weather";

import type { WeatherData } from "~/types/weather";

const BASE = "https://api.open-meteo.com/v1/forecast";

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

interface RawResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
    precipitation: number;
    visibility: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

export async function fetchOpenMeteo(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,precipitation,visibility",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "4",
    wind_speed_unit: "kmh",
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo: ${res.status}`);
  const raw = (await res.json()) as RawResponse;

  const currentHour = new Date().toISOString().slice(0, 13);
  const idx = Math.max(0, raw.hourly.time.findIndex((t) => t >= currentHour));

  return {
    current: {
      time: raw.current.time,
      temperature: Math.round(raw.current.temperature_2m),
      feelsLike: Math.round(raw.current.apparent_temperature),
      humidity: raw.current.relative_humidity_2m,
      weatherCode: raw.current.weather_code,
      pressure: Math.round(raw.current.surface_pressure),
      windSpeed: Math.round(raw.current.wind_speed_10m),
      windDirection: degreesToCompass(raw.current.wind_direction_10m),
      uvIndex: Math.round(raw.current.uv_index),
      precipitation: raw.current.precipitation,
      visibility: Math.round(raw.current.visibility / 1000),
    },
    hourly: raw.hourly.time.slice(idx, idx + 8).map((t, i) => ({
      time: t,
      temperature: Math.round(raw.hourly.temperature_2m[idx + i]),
      weatherCode: raw.hourly.weather_code[idx + i],
    })),
    daily: raw.daily.time.map((date, i) => ({
      date,
      weatherCode: raw.daily.weather_code[i],
      tempMax: Math.round(raw.daily.temperature_2m_max[i]),
      tempMin: Math.round(raw.daily.temperature_2m_min[i]),
      precipProbMax: raw.daily.precipitation_probability_max[i] ?? 0,
    })),
  };
}
