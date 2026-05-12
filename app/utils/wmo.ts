export function wmoLabel(code: number): string {
  if (code === 0) return "Cielo Despejado";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Parcialmente Nublado";
  if (code === 3) return "Nublado";
  if (code <= 48) return "Niebla";
  if (code <= 55) return "Llovizna";
  if (code === 61) return "Lluvia Ligera";
  if (code === 63) return "Lluvia Moderada";
  if (code === 65) return "Lluvia Intensa";
  if (code <= 67) return "Lluvia Helada";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chubascos";
  if (code <= 86) return "Chubascos de Nieve";
  return "Tormenta Eléctrica";
}

export function wmoIcon(code: number): string {
  if (code === 0) return "clear";
  if (code <= 2) return "partly-cloudy";
  if (code === 3) return "overcast";
  if (code <= 48) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 86) return "snow";
  return "thunder";
}
