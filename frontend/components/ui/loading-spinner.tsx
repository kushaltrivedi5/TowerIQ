"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  text?: string;
  variant?: "default" | "contrast";
}

const sizeClasses = {
  sm: "w-5 h-5", // Button size (20px)
  md: "w-12 h-12", // Medium size (48px)
  lg: "w-24 h-24", // Large size (96px)
  xl: "w-48 h-48", // Extra large (192px)
  xxl: "w-72 h-72", // Full page size (288px)
};

const gapClasses = {
  sm: "gap-[1.5px]", // Button gap
  md: "gap-[4px]", // Medium gap
  lg: "gap-[8px]", // Large gap
  xl: "gap-[12px]", // Extra large gap
  xxl: "gap-[16px]", // Full page gap
};

const barCount = 8;
const bars = Array.from({ length: barCount }, (_, i) => i);

export function LoadingSpinner({
  size = "md",
  className,
  text = "Loading...",
  variant = "default",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        text ? "flex-col gap-2" : "gap-2"
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          gapClasses[size],
          sizeClasses[size],
          className
        )}
      >
        {bars.map((i) => (
          <div
            key={i}
            className={cn(
              "origin-bottom",
              size === "sm" ? "w-[3px]" : "w-[3px]", // Same width for all sizes
              variant === "default" ? "bg-primary" : "bg-white dark:bg-black"
            )}
            style={{
              height: "100%",
              animation: `visualizer${
                size === "sm" ? "-sm" : ""
              } 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 0.08}s`,
              opacity: variant === "default" ? 0.4 + i * 0.07 : 1,
              transform: size === "sm" ? "scaleY(0.2)" : "scaleY(0.15)",
            }}
          />
        ))}
      </div>
      {text && (
        <p className="text-sm text-muted-foreground font-medium tracking-wide">
          {text}
        </p>
      )}

      <style jsx>{`
        @keyframes visualizer {
          0% {
            transform: scaleY(0.15);
          }
          25% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(0.2);
          }
          75% {
            transform: scaleY(0.35);
          }
          100% {
            transform: scaleY(0.15);
          }
        }

        @keyframes visualizer-sm {
          0% {
            transform: scaleY(0.2);
          }
          25% {
            transform: scaleY(0.6);
          }
          50% {
            transform: scaleY(0.3);
          }
          75% {
            transform: scaleY(0.5);
          }
          100% {
            transform: scaleY(0.2);
          }
        }
      `}</style>
    </div>
  );
}

export function FullPageLoadingSpinner({
  text = "Loading...",
  className,
}: Omit<LoadingSpinnerProps, "size">) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
      <LoadingSpinner size="xxl" text={text} className={className} />
    </div>
  );
}

export function ContentLoadingSpinner({
  text = "Loading...",
}: {
  text?: string;
}) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">{text}</p>
        </div>
      </div>
    </div>
  );
}
