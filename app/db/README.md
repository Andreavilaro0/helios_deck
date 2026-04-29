# app/db/

## Propósito

Esta carpeta contiene todo lo relacionado con la base de datos SQLite: definición del esquema, migraciones y funciones de consulta.

Es la capa más baja del pipeline. Nada debería importar de aquí excepto `signals.server.ts` y futuros scripts de ingestión.

## Qué va aquí

| Archivo | Propósito |
|---------|-----------|
| `db.ts` | Singleton de conexión a SQLite via `better-sqlite3`. Se importa en todos los helpers. |
| `schema.ts` | Definición de tablas e índices. Se ejecuta al arrancar el servidor si las tablas no existen. |
| `signals.ts` | Funciones de lectura y escritura para la tabla `signals`. |

Estructura esperada cuando se implemente (Fase 1B):

```
app/db/
  db.ts         ← new Database("data/helios.db")
  schema.ts     ← CREATE TABLE signals (...), CREATE INDEX ...
  signals.ts    ← insertSignal(), getLatestByName(), listSignals()
```

## Qué NO va aquí

- Lógica de transformación o normalización — eso es `app/services/normalizers/`.
- Peticiones HTTP — eso es `app/services/fetchers/`.
- Importaciones de React o tipos de componentes.
- Lógica de negocio — las queries deben ser lo más simples posible.

## Esquema objetivo (Fase 1B)

```sql
CREATE TABLE IF NOT EXISTS signals (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp  TEXT    NOT NULL,
  source     TEXT    NOT NULL,
  signal     TEXT    NOT NULL,
  value      TEXT    NOT NULL,               -- JSON blob: number, string, object, or array
  unit       TEXT    NOT NULL,
  confidence REAL    NOT NULL DEFAULT 1.0,
  metadata   TEXT,                            -- JSON blob, puede ser NULL
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp);
CREATE INDEX IF NOT EXISTS idx_signals_signal    ON signals(signal);
CREATE INDEX IF NOT EXISTS idx_signals_source    ON signals(source);
```

Los índices sobre `timestamp`, `signal` y `source` son obligatorios — las queries del dashboard siempre filtran por al menos uno de estos campos.

`value` se almacena como `TEXT` (JSON serializado) para soportar tanto escalares (`4.33`)
como objetos (`{"latitude":51.5,"longitude":-0.1}`). El helper de `signals.ts` hará
`JSON.parse(row.value)` al leer y `JSON.stringify(input.value)` al escribir.

## Cómo se conecta con el pipeline

```
Normalizer (SignalRecord[])
  └─ signals.server.ts
       └─ app/db/signals.ts → insertSignal()  ← AQUÍ
            └─ data/helios.db
```

En sentido inverso (lectura):

```
Loader de una ruta
  └─ signals.server.ts
       └─ app/db/signals.ts → getLatestByName()  ← AQUÍ
            └─ devuelve SignalRecord[] al loader
```

## Nota sobre `better-sqlite3`

A diferencia de `node-sqlite3` u otras alternativas, `better-sqlite3` es **síncrono**. Esto encaja perfectamente con React Router loaders, que pueden ser funciones síncronas. No necesitamos `async/await` en las queries — lo cual simplifica el código y elimina una clase entera de bugs de concurrencia.

`better-sqlite3` se añadirá como dependencia al inicio de Fase 1B:
```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```
