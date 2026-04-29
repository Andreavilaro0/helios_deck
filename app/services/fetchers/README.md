# app/services/fetchers/

## Propósito

Cada archivo de esta carpeta es responsable de **una sola cosa**: hacer la petición HTTP a una API externa y devolver su respuesta en crudo (raw).

Nada más.

## Qué va aquí

- Una función `fetch*` por endpoint relevante de cada API.
- El tipo de retorno es `Promise<unknown>` — la respuesta cruda no tiene tipado hasta que pasa por el normalizer.
- Un archivo por fuente: `noaa.ts`, `nasa.ts`, `gfz.ts`, etc.

Ejemplo de estructura esperada:

```ts
// app/services/fetchers/noaa.ts

export async function fetchKpIndex(): Promise<unknown> {
  const res = await fetch("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json");
  if (!res.ok) throw new Error(`NOAA fetch failed: ${res.status}`);
  return res.json();
}
```

## Qué NO va aquí

- Lógica de transformación o normalización — eso es responsabilidad de `normalizers/`.
- Acceso a la base de datos — eso es responsabilidad de `app/db/`.
- Tipos `SignalRecord` — el fetcher no conoce el dominio interno.
- Llamadas desde componentes React — los fetchers solo se invocan desde `signals.server.ts` o scripts de ingestión.
- Lógica de reintento o caché — se añadirá en fases posteriores si hace falta.

## Cómo se conecta con el pipeline

```
Fetcher (petición HTTP cruda)
  └─ Normalizer (raw → SignalRecord[])
       └─ signals.server.ts → saveSignal()
            └─ app/db/ (SQLite INSERT)
```

El fetcher nunca habla directamente con la base de datos.
El normalizer nunca hace peticiones HTTP.

## Convención de nombres

| Archivo | Fuente |
|---------|--------|
| `noaa.ts` | NOAA SWPC |
| `nasa.ts` | NASA DONKI |
| `gfz.ts` | GFZ Potsdam |
| `iss.ts` | ISS tracker |
| `open-meteo.ts` | Open-Meteo |

## MVP 1

El primer archivo que se implementará es `noaa.ts`, con la función `fetchKpIndex()`.
