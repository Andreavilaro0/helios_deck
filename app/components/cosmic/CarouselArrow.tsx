"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "~/lib/utils";

interface CarouselArrowProps {
  direction: "left" | "right";
  onClick: () => void;
  className?: string;
}

export function CarouselArrow({ direction, onClick, className }: CarouselArrowProps) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  const label = direction === "left" ? "Previous planet" : "Next planet";

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(96,165,250,0.36)" }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "grid h-14 w-14 place-items-center rounded-full border border-sky-300/45 bg-[linear-gradient(180deg,rgba(9,21,45,0.92)_0%,rgba(6,12,28,0.98)_100%)] text-sky-100 shadow-[0_0_0_1px_rgba(96,165,250,0.14),0_0_20px_rgba(96,165,250,0.24)] backdrop-blur-md transition-colors hover:border-sky-200/70",
        className,
      )}
    >
      <Icon size={22} />
    </motion.button>
  );
}
