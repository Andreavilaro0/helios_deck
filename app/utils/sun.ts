// app/utils/sun.ts

function toJulianDay(date: Date): number {
  let Y = date.getUTCFullYear();
  let M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    D +
    B -
    1524.5
  );
}

function calcSunEvent(
  lat: number,
  lon: number,
  date: Date,
  isSunset: boolean
): string {
  const JD = toJulianDay(date);
  const n = JD - 2451545.0;

  const DEG = Math.PI / 180;
  const L = ((280.46 + 0.9856474 * n) % 360 + 360) % 360;
  const g = (((357.528 + 0.9856003 * n) % 360) + 360) % 360;
  const gRad = g * DEG;
  const lambda = (L + 1.915 * Math.sin(gRad) + 0.02 * Math.sin(2 * gRad)) * DEG;
  const eps = (23.439 - 0.0000004 * n) * DEG;
  const alpha = Math.atan2(
    Math.cos(eps) * Math.sin(lambda),
    Math.cos(lambda)
  );
  const delta = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const EoT = 4 * ((L * DEG - alpha) * (180 / Math.PI)); // minutes

  const latRad = lat * DEG;
  const cosHA =
    (Math.cos(90.833 * DEG) - Math.sin(latRad) * Math.sin(delta)) /
    (Math.cos(latRad) * Math.cos(delta));

  if (cosHA < -1) return "00:00"; // midnight sun — no sunset
  if (cosHA > 1) return "N/A"; // polar night — no sunrise

  const HA = Math.acos(cosHA) * (180 / Math.PI); // degrees
  const solarNoon = 720 - 4 * lon - EoT;
  const eventMin = isSunset ? solarNoon + 4 * HA : solarNoon - 4 * HA;
  const clamped = ((eventMin % 1440) + 1440) % 1440;
  const h = Math.floor(clamped / 60) % 24;
  const m = Math.floor(clamped % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getSunsetTime(lat: number, lon: number, date: Date): string {
  return calcSunEvent(lat, lon, date, true);
}

export function getSunriseTime(lat: number, lon: number, date: Date): string {
  return calcSunEvent(lat, lon, date, false);
}

export function minutesUntilSunset(sunsetStr: string, now: Date = new Date()): number | null {
  if (sunsetStr === "N/A") return null;
  if (!/^\d{2}:\d{2}$/.test(sunsetStr)) return null;
  const [h, m] = sunsetStr.split(":").map(Number);
  const sunsetTotalMin = h * 60 + m;
  const nowTotalMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const diff = sunsetTotalMin - nowTotalMin;
  return diff > 0 ? diff : null;
}
