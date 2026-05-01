const KP_INDEX_URL =
  "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";

const SOLAR_WIND_URL =
  "https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json";

export async function fetchKpIndex(): Promise<unknown> {
  const response = await fetch(KP_INDEX_URL);
  if (!response.ok) {
    throw new Error(
      `NOAA SWPC request failed: ${response.status} ${response.statusText}`
    );
  }
  const data: unknown = await response.json();
  return data;
}

export async function fetchSolarWindSpeed(): Promise<unknown> {
  const response = await fetch(SOLAR_WIND_URL);
  if (!response.ok) {
    throw new Error(
      `NOAA SWPC solar wind request failed: ${response.status} ${response.statusText}`
    );
  }
  const data: unknown = await response.json();
  return data;
}
