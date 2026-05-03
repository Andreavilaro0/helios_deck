# Observatory Visual Depth — Design Spec

**Date:** 2026-05-03  
**Branch:** feature/data-freshness  
**Scope:** `/cosmic-view` — signal cards, background, sparklines  
**Approved by:** user ("dale")

---

## Goal

Three coordinated visual improvements that make the Observatory feel like a living instrument panel, not a flat widget grid:

1. **Numbers first** — signal values dominate their card (text-4xl, stronger glow)
2. **Cards float** — projected drop shadow separates cards from background
3. **Background depth** — three-layer nebula (blue core + solar ámbar + violet corner)
4. **Sparklines as instruments** — Y-axis scale labels, X-axis time markers, bar mode for Kp

---

## Architecture — Files Touched

| File | Change |
|---|---|
| `app/components/cosmic/ObservatorySignalCard.tsx` | value size, glow, boxShadow, new sparkline props |
| `app/components/cosmic/ObservatoryShell.tsx` | background layers; Kp card gets barMode props |
| `app/components/cosmic/CenterStage.tsx` | central halo slightly stronger |
| `app/components/cosmic/MiniSparkline.tsx` | Y-axis, X-axis, height 80px, barMode + barColorFn + thresholdLines |

No new npm dependencies. No route changes. No loader changes. No type changes in `~/types/signal`.

---

## Section 1 — Numbers & Card Glow (`ObservatorySignalCard.tsx`)

### Value size
```diff
- className="text-2xl font-bold font-mono tabular-nums text-white"
+ className="text-4xl leading-none font-bold font-mono tabular-nums text-white"
```

`leading-none` prevents the larger font from adding unwanted vertical space. Values up to 7 chars (`1.24e–6`) at 36px/monospace fit in the 196px inner card width.

### Text shadow (glow)
```diff
- textShadow: `0 0 14px ${accentHex}90, 0 0 4px ${accentHex}50`
+ textShadow: `0 0 28px ${accentHex}cc, 0 0 10px ${accentHex}80, 0 0 3px ${accentHex}40`
```

Three layers: wide halo (depth) + medium halo (intensity) + tight rim (crispness).

### Card floating effect
```diff
  boxShadow: `
-   0 0 48px ${accentHex}30,
-   0 0 18px ${accentHex}18,
-   inset 0 1px 0 ${accentHex}55
+   0 0 64px ${accentHex}47,
+   0 0 24px ${accentHex}29,
+   inset 0 1px 0 ${accentHex}a6,
+   0 14px 44px rgba(0,0,0,0.65),
+   0 4px 12px rgba(0,0,0,0.55)
  `
```

The two `rgba(0,0,0,...)` shadow layers project downward, creating physical depth (the card "casts a shadow onto the background").

### Background gradient (slightly more saturated)
```diff
- background: `linear-gradient(150deg, ${accentHex}22 0%, ${accentHex}0a 35%, rgba(3,7,20,0.96) 70%)`
+ background: `linear-gradient(150deg, ${accentHex}2b 0%, ${accentHex}0f 38%, rgba(3,7,20,0.97) 72%)`
```

### New sparkline props on ObservatorySignalCard

Add to `Props` interface:
```typescript
barMode?: boolean;
barColorFn?: (value: number) => string;
barDomainMax?: number;
thresholdLines?: Array<{ value: number; color: string; label: string }>;
```

Pass all four through to `<MiniSparkline>`.

---

## Section 2 — Background (`ObservatoryShell.tsx`)

Replace the single nebula `<div>`:

```tsx
{/* Nebula core — blue-deep center */}
<div className="absolute inset-0 pointer-events-none"
  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 42%, rgba(22,38,120,0.65) 0%, rgba(12,20,75,0.30) 50%, transparent 78%)" }}
/>
{/* Solar halo — ámbar from upper-left (matches sun dir) */}
<div className="absolute inset-0 pointer-events-none"
  style={{ background: "radial-gradient(ellipse 55% 65% at 5% 18%, rgba(220,130,25,0.28) 0%, rgba(170,90,10,0.10) 45%, transparent 72%)" }}
/>
{/* Violet nebula corner — lower-right */}
<div className="absolute inset-0 pointer-events-none"
  style={{ background: "radial-gradient(ellipse 35% 40% at 88% 75%, rgba(60,15,110,0.22) 0%, transparent 65%)" }}
/>
```

Also add a deep-blue gradient to the outer container:
```diff
- className="flex flex-col bg-[#020510] overflow-hidden relative"
+ className="flex flex-col overflow-hidden relative"
  style={{ height: "100svh",
+          background: "radial-gradient(ellipse 90% 70% at 50% 38%, rgba(14,28,100,0.80) 0%, rgba(8,14,52,0.50) 45%, #020510 78%)"
  }}
```

### Kp card — bar mode props

```diff
  <ObservatorySignalCard
    title="Kp Index"
    ...
+   barMode
+   barDomainMax={9}
+   barColorFn={(v) => v >= 5 ? "#ef4444" : v >= 4 ? "#f59e0b" : "#a78bfa"}
+   thresholdLines={[{ value: 5, color: "#ef4444", label: "G1" }]}
  />
```

---

## Section 3 — CenterStage halo (`CenterStage.tsx`)

Strengthen the planetary halo slightly:
```diff
- background: "radial-gradient(ellipse 65% 65% at 50% 50%, rgba(25,55,160,0.65) 0%, rgba(12,22,80,0.30) 50%, transparent 75%)"
+ background: "radial-gradient(ellipse 68% 68% at 50% 50%, rgba(25,55,175,0.72) 0%, rgba(12,22,88,0.36) 48%, transparent 74%)"
```

---

## Section 4 — MiniSparkline (`MiniSparkline.tsx`)

### New props
```typescript
interface Props {
  values: number[];
  color: string;
  logScale?: boolean;
  barMode?: boolean;
  barColorFn?: (value: number) => string;
  barDomainMax?: number;
  thresholdLines?: Array<{ value: number; color: string; label: string }>;
}
```

`barDomainMax` defaults to `Math.max(...values, 1)` if omitted. For Kp, ObservatoryShell passes `barDomainMax={9}` so the scale is always 0–9 regardless of current activity level (a quiet day with Kp≤2 still shows bars at the correct relative height, and G1 threshold at Kp=5 stays visible at 55% height).

### Layout change
- SVG height: `52` → `80`
- Add left gutter (`20px`) for Y-axis labels
- Add bottom gutter (`12px`) for X-axis labels
- Component becomes a `<div style="position:relative">` wrapping SVG + label elements

### Y-axis labels
- **logScale:** derive min power and max power from data range; show 3 labels (min, mid, max) as `1e-N` strings
- **linear:** show `min`, `(min+max)/2`, `max` rounded to 1 decimal
- Render as `<text>` elements inside SVG on left side, `font-size="7"`, `fill="#475569"`, `text-anchor="end"`

### X-axis labels
Three fixed position labels: `–24h` (left), `–12h` (center), `now` (right). Rendered as `<text>` elements at the bottom of the SVG.

### Bar mode
When `barMode={true}`:
- `domainMax = barDomainMax ?? Math.max(...values, 1)`
- Divide width evenly across `values.length` bars
- Each bar height proportional to `value / domainMax` (clamped to [0, 1])
- Bar color: `barColorFn ? barColorFn(value) : color`
- Bar `rx="1"` rounded corners

### Threshold lines
When `thresholdLines` is provided:
- Draw horizontal `<line>` at `y = height - (threshold.value / domainMax) * innerHeight`
- `stroke-dasharray="3,3"`, color from `thresholdLine.color`, opacity 0.55
- Small `<text>` label at left edge showing `thresholdLine.label`
- Only rendered in `barMode` (lines only make sense with a fixed scale)

### Grid lines
Keep existing 25%/50%/75% grid lines in line mode. Not shown in bar mode (threshold lines serve that purpose).

---

## Constraints

- **No new npm deps** — all SVG drawn inline
- **typecheck must pass** — `barColorFn` typed as `(value: number) => string`, not a generic
- **Component size** — MiniSparkline is currently small; adding Y/X axis logic may push it toward 120 lines. If it exceeds 150 lines, extract `computeYLabels` and `computeBarColor` as pure functions in the same file (not a separate module — YAGNI)
- **Tests** — no vitest changes needed; MiniSparkline is a pure render component with no logic under test
- **Three.js boundary** — unchanged, no Three.js involved

---

## Done-when checklist

- [ ] `text-4xl leading-none` value in all 4 signal cards
- [ ] Projected drop shadow on cards (2 `rgba(0,0,0,...)` shadow layers)
- [ ] Stronger card glow (border + inset + outer glow)
- [ ] Three-layer background nebula visible (blue/ámbar/violet)
- [ ] MiniSparkline height 80px
- [ ] Y-axis labels visible on all 4 sparklines
- [ ] X-axis `–24h / –12h / now` labels visible
- [ ] Kp sparkline renders as colored bars (violet/amber/red by threshold)
- [ ] G1 threshold dashed line visible on Kp bar chart
- [ ] `npm run typecheck` EXIT 0
- [ ] `npm run build` EXIT 0
