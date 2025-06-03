"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
  variant?: "blue" | "purple" | "green" | "orange" | "multi" | "none";
  className?: string;
  icon?: LucideIcon;
  showStripes?: boolean;
}

function Card({
  intensity = "medium",
  variant = "none",
  className,
  icon: Icon,
  showStripes = !Icon,
  ...props
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);
  const hasRippled = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || hasRippled.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    setRipple({ x, y, size });
    setIsHovered(true);
    hasRippled.current = true;

    // Reset after animation
    setTimeout(() => {
      setRipple(null);
    }, 600); // Match this with the CSS animation duration
  };

  const handleMouseLeave = () => {
    hasRippled.current = false;
    setIsHovered(false);
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

  const getIconBoxStyle = (isHovered: boolean) => {
    if (!isHovered) {
      return "bg-background/50 backdrop-blur-sm border border-transparent";
    }

    switch (variant) {
      case "blue":
        return "bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-400/20 dark:to-blue-500/20 border-transparent";
      case "purple":
        return "bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 dark:from-indigo-400/20 dark:to-indigo-500/20 border-transparent";
      case "green":
        return "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 dark:from-emerald-400/20 dark:to-emerald-500/20 border-transparent";
      case "orange":
        return "bg-gradient-to-br from-amber-500/20 to-amber-600/20 dark:from-amber-400/20 dark:to-amber-500/20 border-transparent";
      case "multi":
        return "bg-gradient-to-br from-blue-500/20 to-indigo-600/20 dark:from-blue-400/20 dark:to-indigo-500/20 border-transparent";
      default:
        return "bg-gradient-to-br from-gray-500/20 to-gray-600/20 dark:from-gray-400/20 dark:to-gray-500/20 border-transparent";
    }
  };

  const getIconColor = (isHovered: boolean) => {
    if (!isHovered) {
      switch (variant) {
        case "blue":
          return "text-blue-500 dark:text-blue-400";
        case "purple":
          return "text-indigo-500 dark:text-indigo-400";
        case "green":
          return "text-emerald-500 dark:text-emerald-400";
        case "orange":
          return "text-amber-500 dark:text-amber-400";
        case "multi":
          return "text-blue-500 dark:text-blue-400";
        default:
          return "text-primary";
      }
    }
    return "text-foreground dark:text-foreground";
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
      {/* Icon or Stripes */}
      {Icon ? (
        <div className="absolute top-4 right-4">
          <div
            className={cn(
              "p-2 rounded-lg transition-all duration-300 border",
              getIconBoxStyle(isHovered),
              !isHovered && "border-primary/20 hover:border-primary/50"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors duration-300",
                getIconColor(isHovered)
              )}
            />
          </div>
        </div>
      ) : (
        showStripes && (
          <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-24 h-24 transform rotate-45 translate-x-12 -translate-y-12">
              <div className="absolute top-0 right-0 w-1 h-24 bg-gradient-to-b from-primary/20 to-transparent" />
              <div className="absolute top-0 right-4 w-1 h-24 bg-gradient-to-b from-primary/20 to-transparent" />
            </div>
          </div>
        )
      )}

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

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
    {...props}
  />
));

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-none", className)}
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
      className={cn("flex flex-col gap-1", className)}
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
