export type PlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export interface PlanetDescriptor {
  id: PlanetId;
  name: string;
  subtitle: string;
  texturePath: string;
  radius: number;
  modelScale: number;
  rotationSpeed: number;
  glowColor: string;
  accentColor: string;
  orbitColor: string;
  orbitIndex: number;
  details: {
    radiusLabel: string;
    dayLength: string;
    atmosphere: string;
    surfaceTemp: string;
    moons: string;
    magnetosphere: string;
    radiation: string;
  };
  ring?: {
    texturePath: string;
    innerRadius: number;
    outerRadius: number;
    tiltX: number;
  };
}

export const PLANET_EXPLORER_PLANETS: PlanetDescriptor[] = [
  {
    id: "mercury",
    name: "Mercury",
    subtitle: "Planeta Interior",
    texturePath: "/textures/atlas26/mercury.jpg",
    radius: 0.86,
    modelScale: 1.00,
    rotationSpeed: 0.18,
    glowColor: "#f4dcc0",
    accentColor: "#c8d1de",
    orbitColor: "#8fb0ff",
    orbitIndex: 1,
    details: {
      radiusLabel: "2,439 km",
      dayLength: "58d 15h",
      atmosphere: "O₂, Na, H",
      surfaceTemp: "167 °C",
      moons: "0",
      magnetosphere: "Débil / Global",
      radiation: "Moderada",
    },
  },
  {
    id: "venus",
    name: "Venus",
    subtitle: "Mundo de Nubes Densas",
    texturePath: "/textures/atlas26/venus_surface.jpg",
    radius: 0.94,
    modelScale: 0.91,
    rotationSpeed: 0.14,
    glowColor: "#f5c468",
    accentColor: "#f5c468",
    orbitColor: "#f08b45",
    orbitIndex: 2,
    details: {
      radiusLabel: "6,052 km",
      dayLength: "243d",
      atmosphere: "CO₂ 96.5%",
      surfaceTemp: "464 °C",
      moons: "0",
      magnetosphere: "Insignificante",
      radiation: "Moderada",
    },
  },
  {
    id: "earth",
    name: "Earth",
    subtitle: "Mundo Azul Magnetizado",
    texturePath: "/textures/earth_daymap.jpg",
    radius: 1.04,
    modelScale: 0.82,
    rotationSpeed: 0.2,
    glowColor: "#7dc7ff",
    accentColor: "#62b6ff",
    orbitColor: "#3f9cff",
    orbitIndex: 3,
    details: {
      radiusLabel: "6,371 km",
      dayLength: "24h",
      atmosphere: "N₂, O₂",
      surfaceTemp: "15 °C",
      moons: "1",
      magnetosphere: "Fuerte / Global",
      radiation: "Baja",
    },
  },
  {
    id: "mars",
    name: "Mars",
    subtitle: "Planeta Seleccionado",
    texturePath: "/textures/atlas26/mars.jpg",
    radius: 1.02,
    modelScale: 0.84,
    rotationSpeed: 0.17,
    glowColor: "#ff8a45",
    accentColor: "#ff8a45",
    orbitColor: "#ff8a45",
    orbitIndex: 4,
    details: {
      radiusLabel: "3,389 km",
      dayLength: "24h 37m",
      atmosphere: "CO₂ 95.3%",
      surfaceTemp: "-63 °C",
      moons: "2",
      magnetosphere: "Débil / Localizado",
      radiation: "Baja",
    },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    subtitle: "Gigante Gaseoso",
    texturePath: "/textures/atlas26/jupiter.jpg",
    radius: 1.22,
    modelScale: 0.70,
    rotationSpeed: 0.23,
    glowColor: "#8bc3ff",
    accentColor: "#3db3ff",
    orbitColor: "#2aa5ff",
    orbitIndex: 5,
    details: {
      radiusLabel: "69,911 km",
      dayLength: "9h 56m",
      atmosphere: "H₂, He",
      surfaceTemp: "-145 °C",
      moons: "95",
      magnetosphere: "Extrema",
      radiation: "Severa",
    },
  },
  {
    id: "saturn",
    name: "Saturn",
    subtitle: "Gigante con Anillos",
    texturePath: "/textures/atlas26/saturn.jpg",
    radius: 1.12,
    modelScale: 0.40,
    rotationSpeed: 0.2,
    glowColor: "#c589ff",
    accentColor: "#b86dfb",
    orbitColor: "#9458ff",
    orbitIndex: 6,
    details: {
      radiusLabel: "58,232 km",
      dayLength: "10h 33m",
      atmosphere: "H₂, He",
      surfaceTemp: "-178 °C",
      moons: "146",
      magnetosphere: "Fuerte",
      radiation: "Moderada",
    },
    ring: {
      texturePath: "/textures/atlas26/saturn_ring.png",
      innerRadius: 1.42,
      outerRadius: 2.15,
      tiltX: Math.PI / 2.55,
    },
  },
  {
    id: "uranus",
    name: "Uranus",
    subtitle: "Gigante de Hielo",
    texturePath: "/textures/atlas26/uranus.jpg",
    radius: 0.98,
    modelScale: 0.87,
    rotationSpeed: 0.13,
    glowColor: "#6ce0e8",
    accentColor: "#6ce0e8",
    orbitColor: "#56d1ff",
    orbitIndex: 7,
    details: {
      radiusLabel: "25,362 km",
      dayLength: "17h 14m",
      atmosphere: "H₂, He, CH₄",
      surfaceTemp: "-195 °C",
      moons: "28",
      magnetosphere: "Inclinado / Descentrado",
      radiation: "Moderada",
    },
  },
  {
    id: "neptune",
    name: "Neptune",
    subtitle: "Gigante de Vientos Intensos",
    texturePath: "/textures/atlas26/neptune.jpg",
    radius: 0.98,
    modelScale: 0.87,
    rotationSpeed: 0.12,
    glowColor: "#4ca6ff",
    accentColor: "#4ca6ff",
    orbitColor: "#3197ff",
    orbitIndex: 8,
    details: {
      radiusLabel: "24,622 km",
      dayLength: "16h 6m",
      atmosphere: "H₂, He, CH₄",
      surfaceTemp: "-201 °C",
      moons: "16",
      magnetosphere: "Inclinado",
      radiation: "Alta",
    },
  },
  {
    id: "pluto",
    name: "Pluto",
    subtitle: "Planeta Enano",
    texturePath: "/textures/atlas26/pluto.webp",
    radius: 0.68,
    modelScale: 1.26,
    rotationSpeed: 0.08,
    glowColor: "#a8b4c7",
    accentColor: "#8ea4bb",
    orbitColor: "#7a8ea5",
    orbitIndex: 9,
    details: {
      radiusLabel: "1,188 km",
      dayLength: "6d 9h",
      atmosphere: "N₂, CH₄",
      surfaceTemp: "-229 °C",
      moons: "5",
      magnetosphere: "Desconocido",
      radiation: "Alta",
    },
  },
];

export const PLANET_BY_ID = Object.fromEntries(
  PLANET_EXPLORER_PLANETS.map((planet) => [planet.id, planet]),
) as Record<PlanetId, PlanetDescriptor>;
