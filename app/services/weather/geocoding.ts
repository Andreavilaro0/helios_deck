import type { WeatherLocation } from "~/types/weather";
import { MOCK_LOCATIONS } from "~/components/weather/earthWeather.mock";

interface GeoResult {
  id: number;
  name: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

/** Real geocoding via Open-Meteo (no API key, CORS open). */
export async function searchLocations(query: string): Promise<WeatherLocation[]> {
  const trimmed = query.trim();
  if (!trimmed) return MOCK_LOCATIONS;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { results?: GeoResult[] };
    if (!data.results?.length) return [];
    return data.results.map((r) => ({
      id:       String(r.id),
      name:     r.name,
      country:  r.country,
      lat:      r.latitude,
      lon:      r.longitude,
      timezone: r.timezone ?? "UTC",
    }));
  } catch {
    return [];
  }
}

/** Static fallback — returns popular cities when query is empty or API unreachable. */
export function searchMockLocations(query: string): WeatherLocation[] {
  if (!query.trim()) return MOCK_LOCATIONS;
  const q = query.toLowerCase();
  return MOCK_LOCATIONS.filter(
    (l) => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q),
  );
}
