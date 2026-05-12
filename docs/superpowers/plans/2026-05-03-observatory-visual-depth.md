# Observatory Visual Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/cosmic-view` Observatory feel like a living instrument panel — floating glass cards, dominant signal numbers, instrument-grade sparklines, and a deep multi-layer nebula background.

**Architecture:** All changes are confined to four files in `app/components/cosmic/`. No new dependencies, no route changes, no loader changes. `MiniSparkline` gets new props and layout; `ObservatorySignalCard` forwards them. `ObservatoryShell` upgrades the background and wires bar-mode to the Kp card. `CenterStage` gets a slightly stronger planetary halo.

**Tech Stack:** React, TypeScript (strict), SVG inline rendering, Tailwind CSS v4, inline CSS-in-JS style objects.

---

## File Map

| File | What changes |
|---|---|
| `app/components/cosmic/MiniSparkline.tsx` | Layout constants (H 52→80, left/bottom gutters), Y-axis labels, X-axis time labels, bar mode, threshold lines |
| `app/components/cosmic/ObservatorySignalCard.tsx` | Value `text-2xl`→`text-4xl leading-none`, stronger textShadow, deeper boxShadow (projected drop), new props forwarded to MiniSparkline |
| `app/components/cosmic/ObservatoryShell.tsx` | Absolute-overlay layout (cards float over full-width canvas), three-layer nebula, deep-blue gradient, Kp bar mode props |
| `app/components/cosmic/CenterStage.tsx` | `flex-1` → `h-full` (parent is now `absolute inset-0`), planetary halo 65%→68% opacity 0.65→0.72 |

---

## Task 1 — MiniSparkline: layout constants + Y-axis labels

**Files:**
- Modify: `app/components/cosmic/MiniSparkline.tsx`

This task introduces the new layout geometry and Y-axis labels for both log and linear scales. Bar mode is added in Task 2.

- [ ] **Step 1: Replace the entire file with the new implementation (line mode only)**

Replace `app/components/cosmic/MiniSparkline.tsx` with:

```tsx
interface ThresholdLine {
  value: number;
  color: string;
  label: string;
}

interface Props {
  values: number[];
  color: string;
  logScale?: boolean;
  barMode?: boolean;
  barColorFn?: (value: number) => string;
  barDomainMax?: number;
  thresholdLines?: ThresholdLine[];
}

function computeYLabels(
  min: number,
  max: number,
  logScale: boolean,
  rawValues: number[]
): Array<{ text: string; frac: number }> {
  if (logScale) {
    const minPow = Math.floor(min);
    const maxPow = Math.ceil(max);
    const midPow = Math.round((minPow + maxPow) / 2);
    if (minPow === maxPow) {
      return [{ text: `1e${maxPow}`, frac: 1 }, { text: `1e${maxPow}`, frac: 0 }];
    }
    return [
      { text: `1e${maxPow}`, frac: 1 },
      { text: `1e${midPow}`, frac: (midPow - minPow) / (maxPow - minPow) },
      { text: `1e${minPow}`, frac: 0 },
    ];
  }
  const lo = Math.min(...rawValues);
  const hi = Math.max(...rawValues);
  if (lo === hi) {
    return [{ text: hi.toFixed(1), frac: 1 }, { text: lo.toFixed(1), frac: 0 }];
  }
  const mid = (lo + hi) / 2;
  return [
    { text: hi.toFixed(1), frac: 1 },
    { text: mid.toFixed(1), frac: 0.5 },
    { text: lo.toFixed(1), frac: 0 },
  ];
}

export function MiniSparkline({
  values,
  color,
  logScale = false,
  barMode = false,
  barColorFn,
  barDomainMax,
  thresholdLines,
}: Props) {
  if (values.length < 2) return null;

  const W = 200;
  const H = 80;
  const GUTTER_L = 22;
  const GUTTER_B = 11;
  const PAD = 3;

  const drawW = W - GUTTER_L;
  const drawH = H - GUTTER_B - PAD;

  const transform = logScale
    ? (v: number) => Math.log10(Math.max(v, 1e-15))
    : (v: number) => v;

  const pts = values.map(transform);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;

  const toY = (v: number) => PAD + drawH - ((v - min) / range) * drawH;

  const polyPoints = pts
    .map((v, i) => {
      const x = GUTTER_L + (i / (pts.length - 1)) * drawW;
      const y = toY(v);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const firstX = GUTTER_L.toFixed(1);
  const lastX = W.toFixed(1);
  const bottomY = (PAD + drawH).toFixed(1);
  const areaPoints = `${firstX},${bottomY} ${polyPoints} ${lastX},${bottomY}`;

  const safeId = color.replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `sg-${safeId}`;
  const glowId = `gw-${safeId}`;

  const gridYs = [0.25, 0.5, 0.75].map((f) => PAD + drawH - f * drawH);

  const yLabels = computeYLabels(min, max, logScale, values);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: 80 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
        <filter id={glowId} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Y-axis labels */}
      {yLabels.map((lbl, i) => {
        const y = PAD + drawH - lbl.frac * drawH;
        return (
          <text
            key={i}
            x={GUTTER_L - 3}
            y={y + 3}
            fontSize="6"
            fill="#475569"
            textAnchor="end"
            fontFamily="monospace"
          >
            {lbl.text}
          </text>
        );
      })}

      {/* X-axis labels */}
      <text x={GUTTER_L} y={H - 1} fontSize="6" fill="#334155" textAnchor="start" fontFamily="monospace">–24h</text>
      <text x={GUTTER_L + drawW / 2} y={H - 1} fontSize="6" fill="#334155" textAnchor="middle" fontFamily="monospace">–12h</text>
      <text x={W} y={H - 1} fontSize="6" fill="#334155" textAnchor="end" fontFamily="monospace">now</text>

      {/* Subtle horizontal grid */}
      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={GUTTER_L} y1={y.toFixed(1)}
          x2={W} y2={y.toFixed(1)}
          stroke={color}
          strokeWidth="0.4"
          opacity="0.12"
        />
      ))}

      {/* Area fill */}
      <polygon points={areaPoints} fill={`url(#${gradId})`} />

      {/* Glowing line */}
      <polyline
        points={polyPoints}
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.95}
        filter={`url(#${glowId})`}
      />
    </svg>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Volumes/DiscoAndrea/Area de trabajo/03-Universidad/proyectos-clase/helios_web
npm run typecheck 2>&1 | tail -5
```

Expected: `Found 0 errors.`

---

## Task 2 — MiniSparkline: bar mode + threshold lines

**Files:**
- Modify: `app/components/cosmic/MiniSparkline.tsx`

Add the bar rendering branch. The file already has the correct `Props` interface from Task 1.

- [ ] **Step 1: Add bar constants then replace the return block**

In `MiniSparkline.tsx`, insert these three lines **immediately before** the existing `return (`, then replace the `return (...)` block entirely with the JSX below. The three `const` lines are component body (not inside JSX):

```tsx
  const domainMax = barMode
    ? (barDomainMax ?? Math.max(...values, 1))
    : 1; // unused in line mode

  const barW = barMode ? (drawW / values.length) * 0.78 : 0;
  const barGap = barMode ? (drawW / values.length) * 0.22 : 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: 80 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
        <filter id={glowId} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Y-axis labels */}
      {yLabels.map((lbl, i) => {
        const y = PAD + drawH - lbl.frac * drawH;
        return (
          <text
            key={i}
            x={GUTTER_L - 3}
            y={y + 3}
            fontSize="6"
            fill="#475569"
            textAnchor="end"
            fontFamily="monospace"
          >
            {lbl.text}
          </text>
        );
      })}

      {/* X-axis labels */}
      <text x={GUTTER_L} y={H - 1} fontSize="6" fill="#334155" textAnchor="start" fontFamily="monospace">–24h</text>
      <text x={GUTTER_L + drawW / 2} y={H - 1} fontSize="6" fill="#334155" textAnchor="middle" fontFamily="monospace">–12h</text>
      <text x={W} y={H - 1} fontSize="6" fill="#334155" textAnchor="end" fontFamily="monospace">now</text>

      {barMode ? (
        <>
          {/* Threshold lines (bar mode only) */}
          {thresholdLines?.map((tl) => {
            const ty = PAD + drawH - Math.min(tl.value / domainMax, 1) * drawH;
            return (
              <g key={tl.label}>
                <line
                  x1={GUTTER_L} y1={ty.toFixed(1)}
                  x2={W} y2={ty.toFixed(1)}
                  stroke={tl.color}
                  strokeWidth="0.8"
                  strokeDasharray="3,3"
                  opacity="0.55"
                />
                <text
                  x={GUTTER_L + 2}
                  y={ty - 2}
                  fontSize="6"
                  fill={tl.color}
                  fontFamily="monospace"
                  opacity="0.55"
                >
                  {tl.label}
                </text>
              </g>
            );
          })}
          {/* Bars */}
          {values.map((v, i) => {
            const ratio = Math.min(Math.max(v / domainMax, 0), 1);
            const bh = ratio * drawH;
            const bx = GUTTER_L + i * (drawW / values.length) + barGap / 2;
            const by = PAD + drawH - bh;
            const barColor = barColorFn ? barColorFn(v) : color;
            return (
              <rect
                key={i}
                x={bx.toFixed(1)}
                y={by.toFixed(1)}
                width={barW.toFixed(1)}
                height={Math.max(bh, 0).toFixed(1)}
                fill={barColor}
                opacity="0.78"
                rx="1"
              />
            );
          })}
        </>
      ) : (
        <>
          {/* Subtle horizontal grid */}
          {gridYs.map((y, i) => (
            <line
              key={i}
              x1={GUTTER_L} y1={y.toFixed(1)}
              x2={W} y2={y.toFixed(1)}
              stroke={color}
              strokeWidth="0.4"
              opacity="0.12"
            />
          ))}
          {/* Area fill */}
          <polygon points={areaPoints} fill={`url(#${gradId})`} />
          {/* Glowing line */}
          <polyline
            points={polyPoints}
            fill="none"
            stroke={color}
            strokeWidth="2.0"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.95}
            filter={`url(#${glowId})`}
          />
        </>
      )}
    </svg>
  );
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run typecheck 2>&1 | tail -5
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Commit MiniSparkline**

```bash
git add app/components/cosmic/MiniSparkline.tsx
git commit -m "$(cat <<'EOF'
feat(sparkline): instrument-grade MiniSparkline — Y/X axes, 80px, bar mode

Height 52→80px, left/bottom gutters for axis labels. Y-axis shows power
labels (log) or min/mid/max (linear). X-axis shows –24h/–12h/now.
Bar mode renders colored bars with threshold lines for Kp display.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — ObservatorySignalCard: value size, glow, floating shadow, new props

**Files:**
- Modify: `app/components/cosmic/ObservatorySignalCard.tsx`

Three changes in one commit: bigger number, stronger card glow/shadow, and the four new props that pass bar-mode config through to MiniSparkline.

- [ ] **Step 1: Update the Props interface — add four new sparkline props**

In `ObservatorySignalCard.tsx`, replace the `interface Props` block (lines 6–22):

```tsx
interface Props {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  borderClass: string;
  titleClass: string;
  statusClass: string;
  signal: SignalRecord | null;
  displayValue: string;
  unit: string;
  status: string;
  description: string;
  recentValues?: number[];
  logScale?: boolean;
  sparklineColor: string;
  accentHex?: string;
  barMode?: boolean;
  barColorFn?: (value: number) => string;
  barDomainMax?: number;
  thresholdLines?: Array<{ value: number; color: string; label: string }>;
}
```

- [ ] **Step 2: Add new props to the destructuring signature**

Replace the function signature (lines 34–50):

```tsx
export function ObservatorySignalCard({
  title,
  subtitle,
  Icon,
  borderClass,
  titleClass,
  statusClass,
  signal,
  displayValue,
  unit,
  status,
  description,
  recentValues,
  logScale,
  sparklineColor,
  accentHex,
  barMode,
  barColorFn,
  barDomainMax,
  thresholdLines,
}: Props) {
```

- [ ] **Step 3: Upgrade cardStyle — deeper glow, projected drop shadow, more saturated gradient**

Replace the `cardStyle` block (lines 53–63):

```tsx
  const cardStyle = accentHex
    ? {
        background: `linear-gradient(150deg, ${accentHex}2b 0%, ${accentHex}0f 38%, rgba(3,7,20,0.97) 72%)`,
        border: `1px solid ${accentHex}45`,
        boxShadow: `0 0 64px ${accentHex}47, 0 0 24px ${accentHex}29, inset 0 1px 0 ${accentHex}a6, 0 14px 44px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.55)`,
      }
    : {
        background: "rgba(4,8,26,0.92)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
      };
```

- [ ] **Step 4: Upgrade value size and glow**

Replace the value `<span>` (lines 104–109):

```tsx
        <span
          className="text-4xl leading-none font-bold font-mono tabular-nums text-white"
          style={accentHex ? { textShadow: `0 0 28px ${accentHex}cc, 0 0 10px ${accentHex}80, 0 0 3px ${accentHex}40` } : undefined}
        >
          {displayValue}
        </span>
```

- [ ] **Step 5: Forward new props to MiniSparkline**

Replace the sparkline render block (lines 117–121):

```tsx
      {recentValues && recentValues.length >= 2 ? (
        <div className="border-t border-white/5 pt-1.5">
          <MiniSparkline
            values={recentValues}
            color={sparklineColor}
            logScale={logScale}
            barMode={barMode}
            barColorFn={barColorFn}
            barDomainMax={barDomainMax}
            thresholdLines={thresholdLines}
          />
        </div>
      ) : null}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npm run typecheck 2>&1 | tail -5
```

Expected: `Found 0 errors.`

- [ ] **Step 7: Commit ObservatorySignalCard**

```bash
git add app/components/cosmic/ObservatorySignalCard.tsx
git commit -m "$(cat <<'EOF'
feat(card): text-4xl value, deeper glow, projected drop shadow, bar mode props

Signal values grow from text-2xl to text-4xl leading-none with a
three-layer textShadow. Card boxShadow adds projected downward shadows
so cards appear to float above the background. New barMode/barColorFn/
barDomainMax/thresholdLines props forwarded to MiniSparkline.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 — ObservatoryShell: floating layout + three-layer nebula + Kp bar mode

**Files:**
- Modify: `app/components/cosmic/ObservatoryShell.tsx`

The three-column flex layout is replaced with an absolute-overlay layout so cards float over the full-width planet canvas. No `overflow-y-auto` means box-shadows are never clipped.

- [ ] **Step 1: Update the outer container — remove `bg-[#020510]`, add deep-blue gradient**

Replace the outer `<div>` opening tag (currently `className="flex flex-col bg-[#020510] overflow-hidden relative"`):

```tsx
    <div
      className="flex flex-col overflow-hidden relative"
      style={{
        height: "100svh",
        background: "radial-gradient(ellipse 90% 70% at 50% 38%, rgba(14,28,100,0.80) 0%, rgba(8,14,52,0.50) 45%, #020510 78%)",
      }}
    >
```

- [ ] **Step 2: Replace the two existing nebula divs with three-layer nebula**

Find the two comment+div pairs starting `{/* Deep space nebula core */}` and `{/* Solar source halo */}` and replace both with:

```tsx
      {/* Nebula core — deep blue center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 42%, rgba(22,38,120,0.65) 0%, rgba(12,20,75,0.30) 50%, transparent 78%)" }}
      />
      {/* Solar halo — ámbar upper-left (matches sun direction [-4,2.5,4]) */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 65% at 5% 18%, rgba(220,130,25,0.28) 0%, rgba(170,90,10,0.10) 45%, transparent 72%)" }}
      />
      {/* Violet nebula — lower-right corner */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 35% 40% at 88% 75%, rgba(60,15,110,0.22) 0%, transparent 65%)" }}
      />
```

- [ ] **Step 3: Replace the three-child flex row with floating absolute layout**

Find the block starting `<div className="flex-1 flex min-h-0 relative z-0">` and replace the entire block (from that opening div through its closing `</div>`) with:

```tsx
        <div className="flex-1 relative min-h-0">
          {/* Canvas fills entire area — planet visible edge-to-edge */}
          <div className="absolute inset-0">
            <CenterStage kp={kp} signal={signal} />
          </div>

          {/* Left cards — float over the canvas */}
          <div className="absolute left-0 top-0 bottom-0 w-56 xl:w-64 flex flex-col justify-center gap-3 p-3 z-10 hidden md:flex">
            <ObservatorySignalCard
              title="X-Ray Flux Long"
              subtitle="Solar activity"
              Icon={Sun}
              borderClass="border-t-amber-500/50"
              titleClass="text-amber-400"
              statusClass={xrayVal !== null ? xrayClass(xrayVal) : "text-slate-600"}
              signal={xrayFlux}
              displayValue={xrayVal !== null ? xrayVal.toExponential(2) : "—"}
              unit="W/m²"
              status={xrayVal !== null ? interpretXRayFlux(xrayVal) : "PENDING"}
              description="X-ray emission from the Sun in the 1–8 Å band. Drives ionospheric absorption."
              recentValues={numericValues(recentXRay)}
              logScale
              sparklineColor="#f59e0b"
              accentHex="#f59e0b"
            />
            <ObservatorySignalCard
              title="Solar Wind Speed"
              subtitle="Incoming solar wind"
              Icon={Wind}
              borderClass="border-t-sky-500/50"
              titleClass="text-sky-400"
              statusClass={windVal !== null ? windClass(windVal) : "text-slate-600"}
              signal={solarWind}
              displayValue={windVal !== null ? windVal.toFixed(0) : "—"}
              unit="km/s"
              status={windVal !== null ? interpretWindSpeed(windVal) : "PENDING"}
              description="Speed of the solar wind measured near Earth (ACE / DSCOVR)."
              recentValues={numericValues(recentWind)}
              sparklineColor="#38bdf8"
              accentHex="#38bdf8"
            />
          </div>

          {/* Right cards — float over the canvas */}
          <div className="absolute right-0 top-0 bottom-0 w-56 xl:w-64 flex flex-col justify-center gap-3 p-3 z-10 hidden md:flex">
            <ObservatorySignalCard
              title="Proton Flux 10 MeV"
              subtitle="Energetic particles"
              Icon={Zap}
              borderClass="border-t-cyan-500/50"
              titleClass="text-cyan-400"
              statusClass={protonVal !== null ? protonClass(protonVal) : "text-slate-600"}
              signal={protonFlux}
              displayValue={protonVal !== null ? protonVal.toFixed(2) : "—"}
              unit="pfu"
              status={protonVal !== null ? interpretProtonFlux(protonVal) : "PENDING"}
              description="Integral proton flux at energies ≥ 10 MeV. Elevated levels indicate radiation storm risk."
              recentValues={numericValues(recentProton)}
              logScale
              sparklineColor="#22d3ee"
              accentHex="#22d3ee"
            />
            <ObservatorySignalCard
              title="Kp Index"
              subtitle="Geomagnetic response"
              Icon={Activity}
              borderClass="border-t-violet-500/50"
              titleClass="text-violet-400"
              statusClass={kpClass(kp)}
              signal={signal}
              displayValue={kp.toFixed(1)}
              unit="index"
              status={kpLabel(kp)}
              description="Global geomagnetic activity index (0–9). Higher values indicate stronger storms."
              recentValues={numericValues(recentKp)}
              sparklineColor="#a78bfa"
              accentHex="#a78bfa"
              barMode
              barDomainMax={9}
              barColorFn={(v) => v >= 5 ? "#ef4444" : v >= 4 ? "#f59e0b" : "#a78bfa"}
              thresholdLines={[{ value: 5, color: "#ef4444", label: "G1" }]}
            />
          </div>
        </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run typecheck 2>&1 | tail -5
```

Expected: `Found 0 errors.`

- [ ] **Step 5: Commit ObservatoryShell**

```bash
git add app/components/cosmic/ObservatoryShell.tsx
git commit -m "$(cat <<'EOF'
feat(shell): floating card layout + three-layer nebula + Kp bar mode

Replace three-column flex with absolute-overlay layout: canvas fills
full width, cards float over it with absolute positioning. No overflow
clipping of card shadows. Three-layer nebula (blue core / solar amber /
violet corner). Deep-blue base gradient on container. Kp card gets
barMode/barDomainMax=9/barColorFn/thresholdLines G1.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 — CenterStage: h-full + stronger planetary halo

**Files:**
- Modify: `app/components/cosmic/CenterStage.tsx`

CenterStage is now rendered inside `absolute inset-0` — it needs `h-full` instead of `flex-1` to fill that container.

- [ ] **Step 1: Change outer div from `flex-1` to `h-full`**

Replace the component's outer opening div:

```tsx
// OLD:
<div className="flex-1 flex flex-col min-h-0 min-w-0">

// NEW:
<div className="h-full flex flex-col min-h-0 min-w-0">
```

- [ ] **Step 2: Strengthen the central planetary halo**

In the same file, replace the deep central halo `style` background:

```tsx
// OLD:
background: "radial-gradient(ellipse 65% 65% at 50% 50%, rgba(25,55,160,0.65) 0%, rgba(12,22,80,0.30) 50%, transparent 75%)"

// NEW:
background: "radial-gradient(ellipse 68% 68% at 50% 50%, rgba(25,55,175,0.72) 0%, rgba(12,22,88,0.36) 48%, transparent 74%)"
```

- [ ] **Step 3: Run typecheck + build + verify zero errors**

```bash
npm run typecheck 2>&1 | tail -5
```

Expected: `Found 0 errors.`

```bash
npm run build 2>&1 | tail -10
```

Expected: build completes, no errors, Three.js chunk ~900kB.

- [ ] **Step 4: Commit CenterStage + final verification**

```bash
git add app/components/cosmic/CenterStage.tsx
git commit -m "$(cat <<'EOF'
feat(stage): h-full for absolute parent + stronger planetary halo

Outer div uses h-full instead of flex-1 since parent is now absolute
inset-0. Halo ellipse 65%→68%, opacity 0.65→0.72.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Done-when checklist

- [ ] `text-4xl leading-none` value in all 4 signal cards
- [ ] Projected drop shadow on cards (2 `rgba(0,0,0,...)` layers in boxShadow)
- [ ] Stronger card glow (outer glow `47`/`29`, inset `a6`)
- [ ] Three-layer background nebula (blue core + ámbar + violet)
- [ ] Cards float over full-width canvas (absolute positioning, not flex columns)
- [ ] Nebula background visible behind cards (no column container clipping it)
- [ ] MiniSparkline height 80px (`style={{ height: 80 }}`)
- [ ] Y-axis labels visible on all 4 sparklines
- [ ] X-axis `–24h / –12h / now` labels visible
- [ ] Kp sparkline renders colored bars (violet/amber/red by threshold)
- [ ] G1 dashed threshold line at Kp=5 on Kp bar chart
- [ ] `npm run typecheck` EXIT 0
- [ ] `npm run build` EXIT 0
