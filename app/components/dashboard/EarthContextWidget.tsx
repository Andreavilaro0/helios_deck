import { PlanetSphere } from "~/components/cosmic/PlanetSphere";

interface Props {
  overallStatus: "QUIET" | "ACTIVE" | "STORM";
  kp: number;
}

const STATUS_CONFIG = {
  QUIET:  {
    color: "#a78bfa",
    label: "Condiciones nominales",
    desc: "La magnetosfera terrestre está sin perturbaciones. Sin impacto significativo en GPS, satélites o redes eléctricas.",
  },
  ACTIVE: {
    color: "#facc15",
    label: "Actividad elevada",
    desc: "Perturbación geomagnética moderada. Impacto menor en radio de alta frecuencia y orientación satelital.",
  },
  STORM:  {
    color: "#f87171",
    label: "Tormenta geomagnética",
    desc: "Fuerte perturbación solar que afecta la precisión del GPS, redes eléctricas y operaciones satelitales.",
  },
};

export function EarthContextWidget({ overallStatus, kp }: Props) {
  const { color, label, desc } = STATUS_CONFIG[overallStatus];

  return (
    <div
      className="relative overflow-hidden rounded-2xl flex items-center gap-6 px-6 py-4"
      style={{
        background: "linear-gradient(180deg, rgba(8,17,34,0.54) 0%, rgba(4,9,20,0.66) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
        flexShrink: 0,
      }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-48"
        style={{
          background: "radial-gradient(ellipse at 28% 50%, rgba(125,199,255,0.10) 0%, transparent 68%)",
        }}
      />

      <PlanetSphere
        textureUrl="/textures/earth_daymap.jpg"
        glowColor="#7dc7ff"
        atmosphereColor="rgba(110,199,255,0.26)"
        size={88}
        variant="center"
        position="center"
      />

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.24em]"
            style={{ color: "rgba(125,199,255,0.65)" }}
          >
            Tierra · Monitor de Clima Espacial
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em]"
            style={{
              background: `${color}1a`,
              border: `1px solid ${color}44`,
              color,
            }}
          >
            {overallStatus}
          </span>
        </div>

        <p
          className="font-semibold"
          style={{ fontSize: "15px", color: "#f0f8ff", letterSpacing: "-0.01em" }}
        >
          {label}
        </p>

        <p
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.40)", maxWidth: "460px", lineHeight: 1.55 }}
        >
          {desc}
        </p>
      </div>

      <div
        className="shrink-0 flex flex-col items-center justify-center rounded-xl px-5 py-3 gap-1"
        style={{
          background: `${color}0d`,
          border: `1px solid ${color}2a`,
        }}
      >
        <span
          className="font-mono text-[8px] uppercase tracking-[0.20em]"
          style={{ color: "rgba(255,255,255,0.30)" }}
        >
          Índice Kp
        </span>
        <span
          className="font-mono font-black tabular-nums"
          style={{ fontSize: "40px", lineHeight: 1, color, textShadow: `0 0 28px ${color}55` }}
        >
          {kp.toFixed(1)}
        </span>
        <span
          className="font-mono text-[8px]"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          escala 0 – 9
        </span>
      </div>
    </div>
  );
}
