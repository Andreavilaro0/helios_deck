# app/services/normalizers/

## Propósito

Cada archivo de esta carpeta es responsable de **traducir la respuesta cruda de una API** al formato interno `SignalRecord`.

Este es el punto donde el sistema deja de depender del formato de NOAA, NASA, GFZ o cualquier otra fuente, y empieza a trabajar con datos propios.

## Qué va aquí

- Una función `normalize` por fuente de datos.
- El input es `unknown` — la respuesta cruda tal como llegó del fetcher.
- El output es siempre `SignalRecord[]` — nunca un objeto único, siempre un array.
- Un archivo por fuente: `noaa.ts`, `nasa.ts`, `gfz.ts`, etc.

Contrato obligatorio para toda función normalize:

```ts
// Cada normalizer debe exportar esta firma exacta
export function normalize(raw: unknown): SignalRecord[] { ... }
```

Reglas que todo normalizer debe cumplir:
1. **Nunca lanzar excepciones** — devolver `[]` si el input es inesperado o malformado.
2. **Nunca mutar el input** — trabajar con copias o desestructuración.
3. **Nunca hacer peticiones de red** — es una función pura de transformación.
4. **Filtrar registros inválidos** — descartar cualquier registro donde `value` sea `undefined`,
   o donde sea un número que resulte `NaN` o `Infinity`. `null` es un `JsonPrimitive` válido
   en el tipo, pero semánticamente una medición nula no debería almacenarse — filtrarlo también.

## Qué NO va aquí

- Peticiones HTTP — eso es responsabilidad de `fetchers/`.
- Acceso a la base de datos — eso es responsabilidad de `app/db/`.
- Lógica de UI o componentes React.
- Estado global o efectos secundarios.

## Cómo se conecta con el pipeline

```
Fetcher (raw HTTP response)
  └─ Normalizer (raw → SignalRecord[])  ← AQUÍ
       └─ signals.server.ts → saveSignal()
            └─ app/db/ (SQLite INSERT)
```

## Helper de validación

En fase 1B se añadirá `validate.ts` en esta misma carpeta:

```ts
// app/services/normalizers/validate.ts
import type { SignalRecord } from "~/types/signal";

export function isValidSignalRecord(record: unknown): record is SignalRecord {
  // Narrowing de runtime para garantizar que el output del normalizer
  // cumple el contrato antes de enviarlo a la DB.
}
```

## MVP 1

El primer archivo que se implementará es `noaa.ts`, con la función `normalize()` para el endpoint `planetary_k_index_1m.json`.
