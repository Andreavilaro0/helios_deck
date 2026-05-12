import { MOCK_LOCATIONS } from "~/components/weather/earthWeather.mock";
import type { WeatherLocation } from "~/types/weather";

export function searchMockLocations(query: string): WeatherLocation[] {
  if (!query.trim()) return MOCK_LOCATIONS;
  const q = query.toLowerCase();
  return MOCK_LOCATIONS.filter(
    (l) => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q),
  );
}
