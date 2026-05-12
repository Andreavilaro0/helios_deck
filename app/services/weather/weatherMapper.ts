import type { WeatherData, WeatherCurrent, WeatherHourly, WeatherDaily } from "~/types/weather";

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export interface RawOpenMeteo {
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

export function mapOpenMeteoResponse(raw: RawOpenMeteo, currentHourIdx: number): WeatherData {
  const current: WeatherCurrent = {
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
  };

  const hourly: WeatherHourly[] = raw.hourly.time
    .slice(currentHourIdx, currentHourIdx + 8)
    .map((t, i) => ({
      time: t,
      temperature: Math.round(raw.hourly.temperature_2m[currentHourIdx + i]),
      weatherCode: raw.hourly.weather_code[currentHourIdx + i],
    }));

  const daily: WeatherDaily[] = raw.daily.time.map((date, i) => ({
    date,
    weatherCode: raw.daily.weather_code[i],
    tempMax: Math.round(raw.daily.temperature_2m_max[i]),
    tempMin: Math.round(raw.daily.temperature_2m_min[i]),
    precipProbMax: raw.daily.precipitation_probability_max[i] ?? 0,
  }));

  return { current, hourly, daily };
}
