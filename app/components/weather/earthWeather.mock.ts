import type { WeatherLocation, WeatherData, WeatherHourly, WeatherDaily } from "~/types/weather";

export const MOCK_LOCATIONS: WeatherLocation[] = [
  { id: "reykjavik", name: "Reykjavik", country: "Iceland",      lat:  64.1355, lon:  -21.8954, timezone: "Atlantic/Reykjavik" },
  { id: "tokyo",     name: "Tokyo",     country: "Japan",         lat:  35.6762, lon:  139.6503, timezone: "Asia/Tokyo" },
  { id: "oslo",      name: "Oslo",      country: "Norway",        lat:  59.9139, lon:   10.7522, timezone: "Europe/Oslo" },
  { id: "new-york",  name: "New York",  country: "USA",           lat:  40.7128, lon:  -74.0060, timezone: "America/New_York" },
  { id: "sydney",    name: "Sydney",    country: "Australia",     lat: -33.8688, lon:  151.2093, timezone: "Australia/Sydney" },
  { id: "cape-town", name: "Cape Town", country: "South Africa",  lat: -33.9249, lon:   18.4241, timezone: "Africa/Johannesburg" },
  { id: "madrid",    name: "Madrid",    country: "Spain",         lat:  40.4168, lon:   -3.7038, timezone: "Europe/Madrid" },
];

function makeHourly(startHour: number, temps: number[], codes: number[]): WeatherHourly[] {
  return temps.map((temperature, i) => ({
    time: `2026-05-12T${String((startHour + i) % 24).padStart(2, "0")}:00`,
    temperature,
    weatherCode: codes[i] ?? codes[codes.length - 1],
  }));
}

function makeDays(rows: Array<[number, number, number, number]>): WeatherDaily[] {
  return rows.map(([weatherCode, tempMax, tempMin, precipProbMax], i) => {
    const d = new Date("2026-05-12T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + i);
    return { date: d.toISOString().slice(0, 10), weatherCode, tempMax, tempMin, precipProbMax };
  });
}

export const MOCK_WEATHER: Record<string, WeatherData> = {
  reykjavik: {
    current: {
      time: "2026-05-12T10:00", temperature: 4, feelsLike: 1, humidity: 82, weatherCode: 61,
      pressure: 1008, windSpeed: 28, windDirection: "NE", uvIndex: 1, precipitation: 0.8, visibility: 8,
    },
    hourly: makeHourly(8, [3, 4, 4, 5, 5, 4, 4, 3], [61, 61, 51, 51, 2, 2, 51, 61]),
    daily: makeDays([[61,5,1,90],[51,7,2,70],[2,9,3,30],[1,11,4,15],[3,8,2,55]]),
  },
  tokyo: {
    current: {
      time: "2026-05-12T10:00", temperature: 18, feelsLike: 17, humidity: 65, weatherCode: 2,
      pressure: 1018, windSpeed: 12, windDirection: "SE", uvIndex: 4, precipitation: 0, visibility: 20,
    },
    hourly: makeHourly(8, [16, 17, 18, 20, 21, 20, 19, 18], [2, 1, 2, 2, 0, 1, 2, 3]),
    daily: makeDays([[2,21,15,20],[0,23,16,5],[1,22,15,10],[61,19,14,75],[51,18,13,60]]),
  },
  oslo: {
    current: {
      time: "2026-05-12T10:00", temperature: 10, feelsLike: 7, humidity: 70, weatherCode: 2,
      pressure: 1015, windSpeed: 15, windDirection: "SW", uvIndex: 2, precipitation: 0, visibility: 25,
    },
    hourly: makeHourly(8, [8, 9, 10, 12, 13, 12, 11, 10], [3, 2, 2, 1, 0, 1, 2, 3]),
    daily: makeDays([[2,13,7,25],[0,16,8,5],[1,15,9,10],[61,11,6,70],[3,10,5,40]]),
  },
  "new-york": {
    current: {
      time: "2026-05-12T10:00", temperature: 15, feelsLike: 13, humidity: 58, weatherCode: 1,
      pressure: 1020, windSpeed: 20, windDirection: "NW", uvIndex: 5, precipitation: 0, visibility: 30,
    },
    hourly: makeHourly(8, [13, 14, 15, 17, 18, 17, 16, 15], [2, 1, 1, 0, 0, 1, 2, 2]),
    daily: makeDays([[1,18,12,10],[0,21,13,5],[2,19,12,20],[61,16,10,65],[3,14,9,45]]),
  },
  sydney: {
    current: {
      time: "2026-05-12T10:00", temperature: 22, feelsLike: 21, humidity: 55, weatherCode: 0,
      pressure: 1022, windSpeed: 18, windDirection: "N", uvIndex: 6, precipitation: 0, visibility: 40,
    },
    hourly: makeHourly(8, [20, 21, 22, 23, 24, 23, 22, 21], [0, 0, 0, 1, 1, 0, 0, 0]),
    daily: makeDays([[0,24,18,5],[1,23,17,10],[0,25,19,0],[2,22,16,15],[51,19,14,55]]),
  },
  "cape-town": {
    current: {
      time: "2026-05-12T10:00", temperature: 20, feelsLike: 19, humidity: 62, weatherCode: 1,
      pressure: 1019, windSpeed: 22, windDirection: "S", uvIndex: 4, precipitation: 0, visibility: 35,
    },
    hourly: makeHourly(8, [18, 19, 20, 21, 21, 20, 19, 18], [1, 1, 0, 0, 1, 2, 2, 1]),
    daily: makeDays([[1,21,16,15],[0,22,15,5],[2,20,14,25],[61,18,13,70],[3,17,12,50]]),
  },
  madrid: {
    current: {
      time: "2026-05-12T10:00", temperature: 24, feelsLike: 23, humidity: 35, weatherCode: 0,
      pressure: 1024, windSpeed: 10, windDirection: "W", uvIndex: 7, precipitation: 0, visibility: 45,
    },
    hourly: makeHourly(8, [20, 22, 24, 27, 29, 28, 26, 24], [0, 0, 0, 0, 1, 1, 0, 0]),
    daily: makeDays([[0,29,18,0],[0,31,19,0],[1,28,17,5],[2,26,16,20],[61,22,14,65]]),
  },
};
