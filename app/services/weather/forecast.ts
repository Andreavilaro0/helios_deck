import { MOCK_WEATHER } from "~/components/weather/earthWeather.mock";
import type { WeatherData } from "~/types/weather";

export function getMockWeatherByLocation(locationId: string): WeatherData {
  return MOCK_WEATHER[locationId] ?? MOCK_WEATHER["reykjavik"];
}
