# HELIOS_DECK

[![CI](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml/badge.svg)](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml)

Observatorio web fullstack de datos heliofísicos y geofísicos.

Señales reales. Pipeline real. Sin datos de demostración.

🌐 **[Ver en producción →](https://heliosdeck-production-12ca.up.railway.app/cosmic-view)**

---

## Qué hace

HELIOS_DECK ingesta datos en vivo desde APIs de clima espacial (NOAA SWPC), los almacena en una base de datos SQLite y los presenta como un dashboard renderizado en servidor. Cada valor en pantalla es una medición real de un instrumento real.

Señales monitorizadas:
- **Índice Kp** — actividad geomagnética planetaria (NOAA SWPC)
- **Velocidad del viento solar** — velocidad de flujo bulk del viento solar (NOAA SWPC)
- **Flujo de rayos X (canal largo)** — GOES 0,1–0,8 nm, clasificación de llamaradas A/B/C/M/X (NOAA SWPC)
- **Flujo de protones (≥10 MeV)** — flujo de partículas energéticas, contexto de tormenta de radiación (NOAA SWPC)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + SSR | React Router v7 |
| Lenguaje | TypeScript (strict) |
| Base de datos | SQLite mediante `better-sqlite3` |
| Estilos | Tailwind CSS v4 |
| Primitivos UI | shadcn |
| Visual premium | Magic UI / sistema de vidrio personalizado |
| Vista 3D | Three.js / React Three Fiber (cosmic-view) |
| Despliegue | Railway (Docker) |

---

## Estado del proyecto

**Fase actual: 2L — Checkpoint final ✅**

Fase 2 completa (2A–2L). Cuatro señales reales de NOAA están activas de extremo a extremo: índice Kp, velocidad del viento solar, flujo de rayos X y flujo de protones. El dashboard muestra la cadena causal completa (Actividad Solar → Conductor Solar → Respuesta Geomagnética). `/cosmic-view` renderiza el Observatorio Planeta Vivo: un globo terrestre 3D a pantalla completa con shaders GLSL, atmósfera Fresnel y 4 tarjetas de señal flotantes con indicadores de frescura.

### Señales disponibles

| Señal | Fuente | Unidad | Panel del dashboard | Cadencia |
|-------|--------|--------|---------------------|----------|
| Índice Kp | NOAA SWPC | índice | Respuesta Geomagnética | 3 h |
| Velocidad viento solar | NOAA SWPC | km/s | Conductor Solar | ~1 min (DSCOVR) |
| Flujo de rayos X (0,1–0,8 nm) | NOAA GOES | W/m² | Actividad Solar | ~1 min |
| Flujo de protones (≥10 MeV) | NOAA GOES | pfu | Actividad Solar | ~1 min |

---

## Inicio rápido

```bash
npm install
npm run ingest:all   # Descarga las cuatro señales de NOAA en un solo comando
npm run dev          # Servidor de desarrollo con HMR
```

Abre en el navegador:
- **http://localhost:5173/dashboard** — consola de instrumentos con diseño de cadena causal
- **http://localhost:5173/cosmic-view** — Tierra 3D con superposición del campo Kp en vivo

> **Si los paneles muestran "STALE":** ejecuta `npm run ingest:all` para actualizar todas las señales desde NOAA. Umbrales de frescura: Kp 3 h, viento solar 1 h, rayos X 30 min, flujo de protones 1 h.

---

## Desarrollo

```bash
npm run dev        # Servidor de desarrollo con HMR — http://localhost:5173
npm run start      # Sirve el build de producción
```

---

## Comprobaciones de calidad

```bash
npm run typecheck   # react-router typegen + tsc (modo strict)
npm run build       # Build de producción (cliente + SSR)
npm test            # Vitest — tests unitarios y de componentes
```

GitHub Actions ejecuta estas tres comprobaciones automáticamente en cada push y pull request. No se requieren secretos ni APIs externas — los tests usan una base de datos SQLite en memoria y el script de ingesta nunca se ejecuta en CI.

---

## Ingesta manual

```bash
npm run ingest:all                # Las cuatro señales en un solo comando (recomendado)

# O individualmente:
npm run ingest:noaa-kp            # Índice Kp en tiempo real de NOAA SWPC
npm run ingest:noaa-solar-wind    # Velocidad del viento solar en tiempo real
npm run ingest:noaa-xray-flux     # Flujo de rayos X GOES de NOAA SWPC (ambos canales)
npm run ingest:noaa-proton-flux   # Flujo de protones integrales GOES (>=10 MeV)
```

Cada comando consulta el endpoint correspondiente de NOAA SWPC, normaliza cada entrada en un `SignalRecord` y persiste los nuevos registros en `data/helios.sqlite`. Las entradas duplicadas (mismo timestamp, fuente y señal) se omiten automáticamente.

`ingest:all` ejecuta los cuatro pipelines de forma secuencial e imprime una tabla de resumen. Sale con código 1 si alguna señal falla, código 0 si todas tienen éxito.

---

## Flujo de datos

```
API NOAA SWPC
  └─ app/services/fetchers/noaa-swpc.server.ts   (petición HTTP)
       └─ app/services/normalizers/noaa-swpc.ts   (→ SignalRecordInput[])
            └─ app/services/ingest/noaa-kp.server.ts  (coordinador + dedup)
                 └─ app/services/signals.server.ts     (saveSignal → SQLite)
                      └─ app/routes/dashboard.tsx       (loader lee la BD)
                           └─ app/components/widgets/SignalCard.tsx
```

---

## Documentación

| Archivo | Propósito |
|---------|-----------|
| [`docs/plan.md`](docs/plan.md) | Plan del proyecto por fases |
| [`docs/checkpoint-1.md`](docs/checkpoint-1.md) | Hito de la Fase 1 — walking skeleton |
| [`docs/checkpoint-2.md`](docs/checkpoint-2.md) | Estado final de la Fase 2 — 4 señales + cosmic-view |
| [`docs/architecture.md`](docs/architecture.md) | Arquitectura del sistema y consideraciones de despliegue |
| [`docs/data-contract.md`](docs/data-contract.md) | Forma de `SignalRecord` y contrato del normalizador |
| [`docs/api-sources.md`](docs/api-sources.md) | Comparación de fuentes de API |
| [`docs/decisions.md`](docs/decisions.md) | Registro de decisiones técnicas (ADRs) |
| [`docs/ai-usage.md`](docs/ai-usage.md) | Política de uso de IA y registro de sesiones |
| [`docs/rubric-checklist.md`](docs/rubric-checklist.md) | Checklist de calidad para evaluación |

---

## Reglas de desarrollo

Consulta [`CLAUDE.md`](CLAUDE.md) para el conjunto completo de reglas aplicadas durante el desarrollo, incluyendo restricciones del flujo de datos, disciplina de librerías y estándares de calidad de código.
