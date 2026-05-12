import type { PlanetDescriptor, PlanetId } from "./planet-explorer";
import { PLANET_CAROUSEL_PLANETS } from "./planet-explorer-mock";

export type Planet = PlanetDescriptor;

export const planets: PlanetDescriptor[] = PLANET_CAROUSEL_PLANETS;

export const defaultPlanetId: PlanetId = "mars";
