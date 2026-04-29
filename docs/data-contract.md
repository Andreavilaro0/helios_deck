# HELIOS_DECK — Data Contract

## Fuente de verdad

El contrato de datos está implementado en TypeScript en:

```
app/types/signal.ts
```

Este documento es la especificación en lenguaje natural. El archivo TypeScript es la implementación autoritativa. Si hay discrepancia, el archivo TypeScript manda.

---

## Propósito

Todo dato que entra en HELIOS_DECK — independientemente de qué API lo origina — debe ser normalizado a `SignalRecord` antes de tocar la base de datos o cualquier componente React.

Este contrato es lo que hace el sistema independiente de la fuente: un widget que muestra el índice Kp no sabe ni le importa si el dato vino de NOAA o de GFZ.

---

## Tipos JSON base

`SignalValue` y `SignalMetadata` se construyen sobre dos tipos auxiliares:

```ts
// Un valor hoja de JSON: los cuatro tipos que pueden ser el valor final
export type JsonPrimitive = string | number | boolean | null;

// Cualquier valor serializable a JSON sin pérdida
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };
```

Esto excluye explícitamente: `undefined`, `bigint`, funciones, símbolos, `Infinity`, `NaN`.

---

## `SignalRecord` — el tipo central

```ts
// app/types/signal.ts

export interface SignalRecord {
  timestamp:  ISOTimestamp;   // "2024-05-12T14:30:00Z"
  source:     SignalSource;   // "noaa-swpc" | "nasa-donki" | "gfz-potsdam" | ...
  signal:     SignalName;     // "kp-index" | "solar-wind-speed" | ...
  value:      SignalValue;    // JsonValue — escalar o estructura JSON
  unit:       SignalUnit;     // "index" | "km/s" | "W/m²" | ...
  confidence: number;         // 0.0–1.0
  metadata:   SignalMetadata; // Record<string, JsonValue> — JSON blob en DB
}
```

`SignalRecordInput` es idéntico pero con `metadata` opcional, para uso en normalizers:

```ts
export interface SignalRecordInput extends Omit<SignalRecord, "metadata"> {
  metadata?: SignalMetadata;
}
```

---

## Tipos de apoyo

| Tipo | Definición | Propósito |
|------|-----------|-----------|
| `JsonPrimitive` | `string \| number \| boolean \| null` | Tipos hoja de JSON |
| `JsonValue` | recursivo sobre `JsonPrimitive` | Cualquier valor JSON válido |
| `ISOTimestamp` | `string` | Garantiza semántica — "este string es una fecha ISO" |
| `SignalValue` | `JsonValue` | Valor medido — escalar o estructura |
| `SignalMetadata` | `Record<string, JsonValue>` | Extras de la fuente, todos JSON-serializables |
| `SignalSource` | union de strings | Fuentes de API registradas |
| `SignalName` | union de strings | Señales físicas medidas |
| `SignalUnit` | union de strings | Unidades de medida |

---

## Vocabularios controlados

### `SignalSource` — fuentes de API

| Valor | API |
|-------|-----|
| `"noaa-swpc"` | NOAA Space Weather Prediction Center |
| `"nasa-donki"` | NASA DONKI |
| `"gfz-potsdam"` | GFZ Potsdam Kp index |
| `"iss"` | ISS position tracker |
| `"open-meteo"` | Open-Meteo atmospheric data |

Regla: nunca renombrar un valor una vez que hay datos en la DB — rompe todas las queries históricas.

### `SignalName` — señales medidas

| Valor | Descripción | Unidad |
|-------|-------------|--------|
| `"kp-index"` | K-index planetario (actividad geomagnética) | `"index"` (0–9) |
| `"solar-wind-speed"` | Velocidad del viento solar | `"km/s"` |
| `"solar-wind-density"` | Densidad de protones del viento solar | `"p/cm³"` |
| `"xray-flux-short"` | Flujo X 0.05–0.4 nm (indicador de flare) | `"W/m²"` |
| `"xray-flux-long"` | Flujo X 0.1–0.8 nm (indicador de flare) | `"W/m²"` |
| `"proton-flux-10mev"` | Flujo integral de protones > 10 MeV | `"pfu"` |
| `"dst-index"` | Disturbance Storm Time (fuerza de tormenta) | `"nT"` |

### `confidence` — fiabilidad del dato

| Valor | Significado |
|-------|-------------|
| `1.0` | Dato medido directamente, definitivo |
| `0.9` | Provisional en tiempo real (NOAA antes del procesado final) |
| `0.7` | Estimado o modelado |
| `0.0` | La fuente marcó esta lectura como sospechosa |

---

## Reglas de campo

- `timestamp`: siempre UTC, siempre ISO 8601 con sufijo Z. Tiempo de observación, no de ingestión.
- `value`: cualquier `JsonValue` — escalar o estructura. Los normalizers deben descartar `undefined`, `NaN`, `Infinity` y `null` (una medición ausente no se almacena). Se serializa como JSON en la columna `TEXT` de SQLite.
- `unit`: nunca cambiar la unidad de una señal existente — rompe comparaciones históricas.
- `source`: nunca cambiar el identificador una vez que hay datos — rompe queries históricas.
- `metadata`: opcional en input, siempre JSON-serializable. Nunca confiar en su estructura sin narrowing.

### Ejemplos de `value` por tipo de señal

| Señal | Tipo de `value` | Ejemplo |
|-------|-----------------|---------|
| `kp-index` | `number` | `4.33` |
| `solar-wind-speed` | `number` | `452.1` |
| `xray-flux-long` | `number` | `3.2e-6` |
| `iss-position` | `object` | `{ "latitude": 51.5, "longitude": -0.1, "altitude": 408 }` |
| `solar-flare-event` | `object` | `{ "classType": "M2.3", "beginTime": "...", "peakTime": "..." }` |
| `weather-summary` | `object` | `{ "temperature": 18.2, "windSpeed": 12.5, "cloudCover": 0.4 }` |

Los widgets deben comprobar la forma de `value` antes de renderizar. Un widget numérico no debe asumir `typeof value === "number"` sin un type guard explícito.

---

## Contrato del normalizer

Todo archivo en `app/services/normalizers/` debe exportar:

```ts
export function normalize(raw: unknown): SignalRecord[] { ... }
```

El normalizer debe:
1. Nunca lanzar excepciones — devolver `[]` si el input es inesperado.
2. Nunca mutar el input.
3. Nunca hacer peticiones de red.
4. Filtrar registros donde `value` sea `null`, `NaN`, `undefined` o `Infinity`.

---

## Ejemplo — registro Kp index de NOAA

```ts
const record: SignalRecord = {
  timestamp:  "2024-05-12T15:00:00Z",
  source:     "noaa-swpc",
  signal:     "kp-index",
  value:      4.33,
  unit:       "index",
  confidence: 0.9,
  metadata: {
    kp_letter:  "G1",
    estimated:  false,
  },
};
```

---

## Nota sobre validación runtime

Los tipos TypeScript solo existen en tiempo de compilación. Las respuestas HTTP son `unknown` en runtime.

En Fase 1B se implementará `app/services/normalizers/validate.ts` con una función `isValidSignalRecord(record: unknown): record is SignalRecord` para validación runtime antes de insertar en la DB.

`JsonValue` no reemplaza esa validación — solo garantiza que el valor es serializable a JSON. Un valor puede ser `JsonValue` válido y aun así no tener sentido para la señal que representa (p.ej. un objeto donde se esperaba un número). Los widgets deben hacer narrowing explícito.
