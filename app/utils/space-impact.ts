// app/utils/space-impact.ts

export type ImpactLevel = "LOW" | "MODERATE" | "HIGH" | "SEVERE";

export interface SpaceWeatherImpact {
  radioBlackout: ImpactLevel;
  solarRadiation: ImpactLevel;
  geomagneticStorm: ImpactLevel;
}

export function getSpaceWeatherImpact(kp: number): SpaceWeatherImpact {
  if (kp >= 8)
    return {
      radioBlackout: "HIGH",
      solarRadiation: "SEVERE",
      geomagneticStorm: "SEVERE",
    };
  if (kp >= 6)
    return {
      radioBlackout: "MODERATE",
      solarRadiation: "HIGH",
      geomagneticStorm: "HIGH",
    };
  if (kp >= 5)
    return {
      radioBlackout: "LOW",
      solarRadiation: "MODERATE",
      geomagneticStorm: "HIGH",
    };
  if (kp >= 4)
    return {
      radioBlackout: "LOW",
      solarRadiation: "LOW",
      geomagneticStorm: "MODERATE",
    };
  return {
    radioBlackout: "LOW",
    solarRadiation: "LOW",
    geomagneticStorm: "LOW",
  };
}
