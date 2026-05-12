"use client";

import { motion } from "motion/react";
import { cn } from "~/lib/utils";

interface PlanetSphereProps {
  textureUrl: string;
  glowColor: string;
  atmosphereColor: string;
  size: number;
  variant: "center" | "side";
  position: "left" | "center" | "right";
  className?: string;
}

export function PlanetSphere({
  textureUrl,
  glowColor,
  atmosphereColor,
  size,
  variant,
  position,
  className,
}: PlanetSphereProps) {
  const isCenter = variant === "center";
  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          boxShadow: isCenter
            ? `0 0 0 1px rgba(255,255,255,0.08), 0 0 140px ${atmosphereColor}, 0 0 58px ${glowColor}66, inset -56px -70px 108px rgba(0,0,0,0.54), inset 18px 14px 28px rgba(255,255,255,0.12)`
            : `0 0 58px ${atmosphereColor.replace("0.", "0.14")}, inset -40px -48px 72px rgba(0,0,0,0.62), inset 10px 8px 18px rgba(255,255,255,0.06)`,
        }}
        animate={{
          y: isCenter ? [0, -7, 0] : [0, -4, 0],
          rotate: isCenter ? [0, 1.6, 0] : position === "left" ? [-1.2, 0.2, -1.2] : [1.2, -0.2, 1.2],
        }}
        transition={{
          duration: isCenter ? 10 : 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="absolute -inset-[4%] rounded-full opacity-90 blur-[10px]"
          style={{
            background: `radial-gradient(circle, ${atmosphereColor} 0%, transparent 72%)`,
          }}
        />
        <div
          className="absolute inset-0 rounded-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${textureUrl})`,
            filter: isCenter ? "saturate(1.1) contrast(1.08) brightness(1.04)" : "saturate(0.9) contrast(1.04) brightness(0.82)",
          }}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            position === "left"
              ? "bg-[linear-gradient(88deg,rgba(0,0,0,0.56)_0%,rgba(0,0,0,0.28)_22%,transparent_54%,rgba(255,255,255,0.02)_100%)]"
              : position === "right"
                ? "bg-[linear-gradient(272deg,rgba(0,0,0,0.56)_0%,rgba(0,0,0,0.28)_22%,transparent_54%,rgba(255,255,255,0.02)_100%)]"
                : "bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_20%,transparent_34%,rgba(0,0,0,0.12)_72%,rgba(0,0,0,0.46)_100%)]",
          )}
        />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_24%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.1)_10%,transparent_24%)] mix-blend-screen" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 22px 26px rgba(255,255,255,0.05), inset 0 -30px 42px rgba(0,0,0,0.3)`,
          }}
        />
        <div
          className="absolute -inset-[1px] rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 28%), linear-gradient(135deg, transparent 40%, ${glowColor}33 100%)`,
            mixBlendMode: "screen",
          }}
        />
        {isCenter ? (
          <div
            className="pointer-events-none absolute -inset-[1.5%] rounded-full"
            style={{
              boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 36px ${glowColor}55`,
            }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
