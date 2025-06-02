"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "purple" | "green" | "orange" | "multi";
  className?: string;
  children: React.ReactNode;
}

export function GradientText({
  variant = "blue",
  className,
  children,
  ...props
}: GradientTextProps) {
  const gradientClasses = {
    blue: "bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-500 dark:to-blue-400",
    purple:
      "bg-gradient-to-r from-indigo-700 to-indigo-500 dark:from-indigo-500 dark:to-indigo-400",
    green:
      "bg-gradient-to-r from-emerald-700 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400",
    orange:
      "bg-gradient-to-r from-amber-700 to-amber-500 dark:from-amber-500 dark:to-amber-400",
    multi:
      "bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 dark:from-blue-600 dark:via-indigo-500 dark:to-blue-400",
  };

  return (
    <span
      className={cn(
        "bg-clip-text text-transparent font-semibold",
        gradientClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
