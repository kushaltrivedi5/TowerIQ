"use client";

import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function Avatar({
  image,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : null;

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {image ? (
        <img
          src={image}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        <div className="flex h-full w-full items-center justify-center text-sm font-medium">
          {initials}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <User className={cn("text-muted-foreground", iconSizes[size])} />
        </div>
      )}
    </div>
  );
}
