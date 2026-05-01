# HELIOS_DECK — Credits & Attribution

## Code & Shaders

### Atlas26 by Abdul Wasay Khan — GLSL day/night terminator shader
- Repository: https://github.com/Abdul-Wasay-008/Atlas26
- License: MIT © Abdul Wasay Khan (2026)
- What was adapted: The GLSL vertex + fragment shader logic in `EarthDayNightMaterial.ts` that blends day and night Earth textures using `smoothstep` across the solar terminator line. The uniform names (`uDayTexture`, `uNightTexture`, `uSunDirection`, `uTerminatorWidth`) and the core `dot(N, L)` → `smoothstep` pattern are adapted from Atlas26's `createPlanetDayNightMaterial`.
- What was NOT adapted: No Next.js patterns, no `"use client"` directives, no Framer Motion, no Zustand, no satellite tracking, no time engine, no orbital mechanics.

### bobbyroe/threejs-earth — Fresnel atmospheric rim shader + surface textures
- Repository: https://github.com/bobbyroe/threejs-earth
- License: MIT
- What was adapted:
  - The Fresnel GLSL shader in `EarthInstrument.tsx` (`createFresnelMaterial`) — grazing-angle atmospheric rim glow using `fresnelBias`, `fresnelScale`, `fresnelPower` uniforms and `AdditiveBlending`.
  - Surface texture filenames and hosting source: `earth_daymap.jpg`, `earth_normal.jpg`, `earth_specular.jpg`, `earth_nightmap.png`, `04_earthcloudmap.jpg`, `05_earthcloudmaptrans.jpg` — downloaded from the repo's `public/images/` directory and served locally under `public/textures/`.
- What was NOT adapted: No Three.js scene setup, no animation loop, no HTML structure.

---

## Visual Inspiration

### Atlas26 by Abdul Wasay Khan — observatory concept
- Used as: Conceptual reference for the planet-centered observatory aesthetic in `/cosmic-view`.
- The idea of a planet as the central organizing instrument and the "digital observatory" framing.

---

*All other code is original. No other third-party assets, designs, or code blocks are reused beyond what is listed here and in the npm dependency tree.*
