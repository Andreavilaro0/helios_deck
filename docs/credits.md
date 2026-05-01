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

**HELIOS_DECK's `/cosmic-view` is written from scratch.** The planet sphere is procedural (no textures), the color and field ring behavior are driven by real NOAA Kp data from SQLite, and the architecture uses React Router v7 SSR patterns instead of Next.js.

---

*No other third-party assets, designs, or code blocks are reused in HELIOS_DECK beyond what is listed here and in the npm dependency tree.*
