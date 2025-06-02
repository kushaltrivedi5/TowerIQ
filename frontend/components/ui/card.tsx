"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
  variant?: "blue" | "purple" | "green" | "orange" | "multi" | "none";
  className?: string;
}

function Card({
  intensity = "medium",
  variant = "none",
  className,
  ...props
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);
  const hasRippled = useRef(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || hasRippled.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    setRipple({ x, y, size });
    hasRippled.current = true;

    // Reset after animation
    setTimeout(() => {
      setRipple(null);
    }, 600); // Match this with the CSS animation duration
  };

  const handleMouseLeave = () => {
    hasRippled.current = false;
  };

  const intensityStyles = {
    light: "glassEffect-light",
    medium: "glassEffect-medium",
    heavy: "glassEffect-heavy",
  };

  const borderColors = {
    blue: "border-blue-700/0 hover:border-blue-700/50 dark:border-blue-500/0 dark:hover:border-blue-500/50",
    purple:
      "border-indigo-700/0 hover:border-indigo-700/50 dark:border-indigo-500/0 dark:hover:border-indigo-500/50",
    green:
      "border-emerald-700/0 hover:border-emerald-700/50 dark:border-emerald-500/0 dark:hover:border-emerald-500/50",
    orange:
      "border-amber-700/0 hover:border-amber-700/50 dark:border-amber-500/0 dark:hover:border-amber-500/50",
    multi:
      "border-blue-700/0 hover:border-blue-700/50 dark:border-blue-500/0 dark:hover:border-blue-500/50",
    none: "border-transparent",
  };

  const getRippleColor = () => {
    switch (variant) {
      case "blue":
        return "bg-blue-500/10 dark:bg-blue-500/5";
      case "purple":
        return "bg-indigo-500/10 dark:bg-indigo-500/5";
      case "green":
        return "bg-emerald-500/10 dark:bg-emerald-500/5";
      case "orange":
        return "bg-amber-500/10 dark:bg-amber-500/5";
      case "multi":
        return "bg-blue-500/10 dark:bg-blue-500/5";
      default:
        return "bg-gray-500/10 dark:bg-gray-500/5";
    }
  };

  return (
    <div
      ref={cardRef}
      data-slot="card"
      className={cn(
        "relative overflow-hidden rounded-xl transition-all border-1 p-6",
        intensityStyles[intensity],
        borderColors[variant],
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Ripple container */}
      <div className="absolute inset-0 pointer-events-none">
        {ripple && (
          <div
            className={cn(
              "absolute rounded-full animate-ripple",
              getRippleColor()
            )}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              transform: "translate(-50%, -50%) scale(0)",
            }}
          />
        )}
      </div>
      {props.children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-10 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-2xl", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
