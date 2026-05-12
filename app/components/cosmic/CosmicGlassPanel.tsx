import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "~/lib/utils";

export interface CosmicGlassPanelProps extends ComponentPropsWithoutRef<"div"> {
  accent?: string;
  glow?: boolean;
  insetGlow?: boolean;
  panelStyle?: CSSProperties;
}

export function CosmicGlassPanel({
  accent = "rgba(120,180,255,0.24)",
  glow = false,
  insetGlow = true,
  className,
  panelStyle,
  children,
  ...props
}: CosmicGlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] border border-white/7 bg-[linear-gradient(180deg,rgba(8,17,34,0.54)_0%,rgba(4,9,20,0.66)_100%)] backdrop-blur-[16px]",
        className,
      )}
      style={{
        boxShadow: glow
          ? `0 0 0 1px ${accent}, 0 12px 34px rgba(0,0,0,0.26), 0 0 22px ${accent.replace("0.24", "0.1")}${insetGlow ? `, inset 0 0 28px ${accent.replace("0.24", "0.06")}` : ""}`
          : `0 10px 30px rgba(0,0,0,0.22)${insetGlow ? ", inset 0 0 18px rgba(255,255,255,0.018)" : ""}`,
        ...panelStyle,
      }}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_30%)]" />
      {children}
    </div>
  );
}
