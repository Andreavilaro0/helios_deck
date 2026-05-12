export interface WeatherLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface WeatherCurrent {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  weatherCode: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  precipitation: number;
  visibility: number;
}

export interface WeatherHourly {
  time: string;
  temperature: number;
  weatherCode: number;
}

export interface WeatherDaily {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProbMax: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
}
