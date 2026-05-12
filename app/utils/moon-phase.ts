// Known new moon reference: Jan 6 2000 18:14 UTC
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();
const PERIOD_MS = 29.53058867 * 24 * 3600 * 1000;

export interface MoonPhaseResult {
  phase: number;       // 0–1
  name: string;
  illumination: number; // 0–1
}

export function getMoonPhase(date: Date = new Date()): MoonPhaseResult {
  const elapsed = date.getTime() - KNOWN_NEW_MOON;
  const phase = ((elapsed % PERIOD_MS) + PERIOD_MS) % PERIOD_MS / PERIOD_MS;
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * phase));

  let name: string;
  if (phase < 0.0625 || phase >= 0.9375) name = "New Moon";
  else if (phase < 0.1875) name = "Waxing Crescent";
  else if (phase < 0.3125) name = "First Quarter";
  else if (phase < 0.4375) name = "Waxing Gibbous";
  else if (phase < 0.5625) name = "Full Moon";
  else if (phase < 0.6875) name = "Waning Gibbous";
  else if (phase < 0.8125) name = "Last Quarter";
  else name = "Waning Crescent";

  return { phase, name, illumination };
}
