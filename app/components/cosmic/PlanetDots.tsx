"use client";

import { motion } from "motion/react";
import { cn } from "~/lib/utils";

interface PlanetDotsProps {
  count: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
  activeColor?: "orange" | "cyan";
}

export function PlanetDots({
  count,
  activeIndex,
  onSelect,
  activeColor = "orange",
}: PlanetDotsProps) {
  const activeClass =
    activeColor === "cyan"
      ? "bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]"
      : "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.9)]";

  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: count }).map((_, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={index}
            type="button"
            aria-label={`Go to planet ${index + 1}`}
            onClick={() => onSelect?.(index)}
            className="group rounded-full p-1"
          >
            <motion.span
              layout
              className={cn(
                "block h-2 w-2 rounded-full bg-white/28 transition-colors duration-300 group-hover:bg-white/45",
                active && activeClass,
              )}
              animate={{
                scale: active ? 1.25 : 1,
                opacity: active ? 1 : 0.72,
              }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
            />
          </button>
        );
      })}
    </div>
  );
}
