# app/db/

## Propósito

Esta carpeta contiene la conexión SQLite y la definición de esquema.

Es la capa más baja del pipeline. El único archivo que puede importar desde aquí es
`app/services/signals.server.ts` (y futuros scripts de ingestión). Ningún componente
React, ningún loader, ningún normalizer importa directamente de `app/db/`.

## Archivos actuales

| Archivo | Propósito |
|---------|-----------|
| `db.server.ts` | Conexión SQLite via `better-sqlite3`. Exporta `openDb(path)` y `getDb()`. |
| `schema.sql` | Definición canónica de tablas e índices — documentación y referencia para futura migración. El SQL está inlineado en `db.server.ts`; ambos deben mantenerse sincronizados. |

## Qué NO va aquí

- Lógica de transformación o normalización — eso es `app/services/normalizers/`.
- Peticiones HTTP — eso es `app/services/fetchers/`.
- Importaciones de React o tipos de componentes.
- Funciones de lectura/escritura de señales — eso es `app/services/signals.server.ts`.

## Esquema implementado

```sql
CREATE TABLE IF NOT EXISTS signals (
  id            TEXT NOT NULL,
  timestamp     TEXT NOT NULL CHECK(length(timestamp) > 0),
  source        TEXT NOT NULL CHECK(length(source)    > 0),
  signal        TEXT NOT NULL CHECK(length(signal)    > 0),
  value_json    TEXT NOT NULL,
  unit          TEXT NOT NULL,
  confidence    REAL NOT NULL CHECK(confidence >= 0.0 AND confidence <= 1.0),
  metadata_json TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_signals_signal_timestamp ON signals (signal, timestamp);
CREATE INDEX IF NOT EXISTS idx_signals_source_timestamp ON signals (source, timestamp);
```

Decisiones de diseño:
- `id` es `TEXT` (UUID v4) — no usa AUTOINCREMENT para evitar dependencia de orden de inserción.
- `value_json` y `metadata_json` son `TEXT` en lugar de `value` y `metadata` para dejar claro en el código que son blobs JSON serializados. Ver ADR-010.
- Los índices son compuestos `(signal, timestamp)` y `(source, timestamp)` — las dos queries más frecuentes del dashboard siempre filtran primero por señal o fuente, luego por rango de tiempo.
- `confidence` tiene `CHECK >= 0.0 AND <= 1.0` como restricción en la DB; `signals.server.ts` también valida antes de insertar para dar mensajes de error más claros.

## Cómo se conecta con el pipeline

```
Normalizer (SignalRecordInput[])
  └─ app/services/signals.server.ts → saveSignal()
       └─ app/db/db.server.ts → getDb()  ← AQUÍ
            └─ data/helios.sqlite
```

En sentido inverso (lectura):

```
Loader de una ruta (futuro)
  └─ app/services/signals.server.ts → listSignals() / getLatestSignalByName()
       └─ app/db/db.server.ts → getDb()  ← AQUÍ
            └─ data/helios.sqlite
```

## Conexión para tests vs. producción

`openDb(':memory:')` — abre una DB en memoria, ejecuta el schema, devuelve la instancia.
Cada test usa su propia instancia en memoria; no persiste entre tests.

`getDb()` — singleton que abre `data/helios.sqlite` (o la ruta en `DATABASE_PATH` env).
Se reutiliza en todas las requests de una misma instancia del servidor.

## Nota sobre `better-sqlite3`

`better-sqlite3` es **síncrono**. Esto encaja con React Router loaders, que pueden ser
funciones síncronas. No se necesita `async/await` en las queries — lo que simplifica el
código y elimina una clase de bugs de concurrencia.

Como addon nativo, los binarios se compilan para la plataforma actual. No mover
`node_modules` entre plataformas distintas.
