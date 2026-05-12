import { Activity, Database, Globe, Orbit, RefreshCw, ShieldCheck, SquareChartGantt, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PlanetDescriptor, PlanetId } from "./planet-explorer";
import { PLANET_BY_ID } from "./planet-explorer";

export const PLANET_CAROUSEL_ORDER: PlanetId[] = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
];

export const PLANET_CAROUSEL_PLANETS: PlanetDescriptor[] = PLANET_CAROUSEL_ORDER.map((id) => PLANET_BY_ID[id]);

export const PLANET_EXPLORER_TAGS = ["NOAA", "UTC", "SQLite", "SSR"] as const;

export interface NavItem {
  id: "dashboard" | "cosmic-view" | "earth-weather";
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export const PLANET_EXPLORER_NAV: NavItem[] = [
  { id: "dashboard", label: "Panel", icon: SquareChartGantt },
  { id: "cosmic-view", label: "Vista Cósmica", icon: Globe, active: true },
  { id: "earth-weather", label: "Clima Terrestre", icon: Waves },
];

export interface StatusMetric {
  id: string;
  title: string;
  value: string;
  subvalue?: string;
  icon: LucideIcon;
  accent: string;
}

export function buildStatusMetrics({
  observedAt,
  freshnessValue,
  freshnessState,
  protonValue,
}: {
  observedAt: string;
  freshnessValue: string;
  freshnessState: string;
  protonValue?: string;
}): StatusMetric[] {
  return [
    {
      id: "ingested",
      title: "Datos ingeridos",
      value: observedAt,
      subvalue: "UTC",
      icon: Database,
      accent: "#27e6b8",
    },
    {
      id: "freshness",
      title: "Actualización",
      value: freshnessValue,
      subvalue: freshnessState,
      icon: RefreshCw,
      accent: freshnessState === "Actualizado" ? "#27e6b8" : "#ff9b3d",
    },
    {
      id: "source",
      title: "Fuente de datos",
      value: "NOAA SWPC",
      subvalue: "swpc.noaa.gov",
      icon: Globe,
      accent: "#4ec5ff",
    },
    {
      id: "pipeline",
      title: "Pipeline",
      value: "SQLite → SSR → UI",
      subvalue: "Feed en tiempo real",
      icon: Activity,
      accent: "#58abff",
    },
    {
      id: "status",
      title: "Estado del sistema",
      value: "Operacional",
      subvalue: protonValue ? `Protón ${protonValue}` : "Telemetría nominal",
      icon: ShieldCheck,
      accent: "#28e7b9",
    },
  ];
}
