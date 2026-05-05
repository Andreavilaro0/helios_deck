# HELIOS_DECK — Credits & Attribution

## Visual Inspiration

### Atlas26 by Abdul Wasay Khan
- Repository: https://github.com/Abdul-Wasay-008/Atlas26
- License: MIT © Abdul Wasay Khan (2026)
- Used as: Conceptual and visual reference for the planet-centered observatory experience in `/cosmic-view`

**What was adapted (concept only, no code copied):**
- The idea of a planet as the central organizing instrument of the UI
- The Canvas scene structure: ambient + directional + point accent lights
- The "digital observatory" aesthetic framing

**What was NOT used from Atlas26:**
- No textures (`earth_daymap.jpg`, `earth_nightmap.jpg`, `earth_clouds.jpg`, etc.)
- No assets, images, or static files
- No components (Earth.tsx, Scene.tsx, LandingEarth.tsx, or any other)
- No code from any file
- No shader materials (`createPlanetDayNightMaterial`)
- No time engine or orbital mechanics (TimeManager, TimeEngine, cameraController)
- No satellite tracking (satellite.js, ISS, Hubble)
- No framework-specific patterns (`"use client"` Next.js directive)
- No Framer Motion, Zustand, or other Atlas26-specific dependencies

**HELIOS_DECK's `/cosmic-view` is written from scratch.** The GLSL day/night shader is original. The Fresnel atmosphere shader is adapted from bobbyroe/threejs-earth (MIT). The architecture uses React Router v7 SSR patterns instead of Next.js.

---

## Earth Textures — Solar System Scope

- Source: [solarsystemscope.com/textures](https://www.solarsystemscope.com/textures/)
- License: **CC BY 4.0** (Creative Commons Attribution 4.0 International)
- Attribution: © Solar System Scope / Inove (https://www.inove.sk)

**Files used from this source (`public/textures/`):**

| File | Description |
|------|-------------|
| `earth_daymap.jpg` | 2K Earth day surface (2048×1024) |
| `earth_nightmap.png` | 2K Earth city lights / night side |
| `earth_normal.jpg` | Normal map for ocean/terrain relief |
| `earth_specular.jpg` | Specular map for ocean reflections |
| `2k_earth_clouds.jpg` | 2K cloud layer (Solar System Scope 2K pack) |

These textures are loaded at runtime via `THREE.TextureLoader` and are never modified or redistributed. They are used solely for non-commercial educational/academic purposes within this university project.

Full license text: https://creativecommons.org/licenses/by/4.0/

---

## Shader References

### Fresnel Atmosphere — bobbyroe/threejs-earth
- Repository: https://github.com/bobbyroe/threejs-earth
- License: MIT
- Used as: Reference pattern for the Fresnel rim atmospheric glow shader in `EarthDayNightMaterial.ts`

---

*No other third-party assets, designs, or code blocks are reused in HELIOS_DECK beyond what is listed here and in the npm dependency tree.*
